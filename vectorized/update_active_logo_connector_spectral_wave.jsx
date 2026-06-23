app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

if (app.documents.length === 0) {
  throw new Error("No Illustrator document is open.");
}

var doc = app.activeDocument;

function rgb(r, g, b) {
  var color = new RGBColor();
  color.red = r;
  color.green = g;
  color.blue = b;
  return color;
}

function catmullRom(p0, p1, p2, p3, t) {
  var t2 = t * t;
  var t3 = t2 * t;
  return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
  ];
}

function normalFrom(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) {
    return [0, 0];
  }
  return [-dy / length, dx / length];
}

function findConnectorPath() {
  var best = null;
  for (var i = 0; i < doc.pathItems.length; i++) {
    var item = doc.pathItems[i];
    if (!item.stroked || item.filled || item.strokeWidth < 5 || item.strokeWidth > 7) {
      continue;
    }
    var bounds = item.geometricBounds;
    var width = bounds[2] - bounds[0];
    var height = bounds[1] - bounds[3];
    if (width > 150 && width < 230 && height > 330 && height < 410) {
      best = item;
      break;
    }
  }
  if (best === null) {
    throw new Error("Could not find the grey connector path.");
  }
  return best;
}

// Illustrator coordinates for the five point centers, bottom-to-top.
var anchors = [
  [504, 578],
  [428, 673],
  [422, 790],
  [489, 895],
  [607, 948]
];

var spectralPoints = [];
var samplesPerSegment = 18;

for (var segment = 0; segment < anchors.length - 1; segment++) {
  var p0 = anchors[Math.max(0, segment - 1)];
  var p1 = anchors[segment];
  var p2 = anchors[segment + 1];
  var p3 = anchors[Math.min(anchors.length - 1, segment + 2)];

  for (var s = 0; s <= samplesPerSegment; s++) {
    if (segment > 0 && s === 0) {
      continue;
    }

    var t = s / samplesPerSegment;
    var base = catmullRom(p0, p1, p2, p3, t);
    var next = catmullRom(p0, p1, p2, p3, Math.min(1, t + 0.02));
    var n = normalFrom(base, next);
    var envelope = Math.sin(Math.PI * t);
    var spectralWiggle =
      5.5 * Math.sin(2 * Math.PI * (1.55 * t + segment * 0.23)) +
      2.2 * Math.sin(2 * Math.PI * (3.15 * t + 0.18));
    var offset = envelope * spectralWiggle;

    spectralPoints.push([
      base[0] + n[0] * offset,
      base[1] + n[1] * offset
    ]);
  }
}

var connector = findConnectorPath();
connector.setEntirePath(spectralPoints);
connector.stroked = true;
connector.filled = false;
connector.strokeWidth = 4.5;
connector.strokeColor = rgb(164, 174, 189);
connector.opacity = 92;

try {
  connector.strokeDashes = [];
  connector.strokeDashOffset = 0;
  connector.strokeCap = StrokeCap.ROUNDENDCAP;
  connector.strokeJoin = StrokeJoin.ROUNDENDJOIN;
} catch (e) {
  // Older Illustrator scripting engines can reject one of these cosmetic fields.
}

doc.save();
"Updated connector into a spectral wavy curve and saved: " + doc.fullName.fsName;
