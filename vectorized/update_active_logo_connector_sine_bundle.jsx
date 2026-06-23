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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(a, b, t) {
  return rgb(
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t))
  );
}

function paletteColor(t) {
  var palette = [
    [1, 25, 89],
    [34, 96, 97],
    [130, 130, 49],
    [242, 157, 109],
    [250, 204, 250]
  ];
  var scaled = Math.max(0, Math.min(0.96, t)) * (palette.length - 1);
  var index = Math.floor(scaled);
  var local = scaled - index;
  return mixColor(palette[index], palette[Math.min(index + 1, palette.length - 1)], local);
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
  for (var i = 0; i < doc.pathItems.length; i++) {
    if (doc.pathItems[i].name === "main-smooth-connector") {
      return doc.pathItems[i];
    }
  }

  var best = null;
  for (var j = 0; j < doc.pathItems.length; j++) {
    var item = doc.pathItems[j];
    if (!item.stroked || item.filled || item.strokeWidth < 3.5 || item.strokeWidth > 7) {
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
    throw new Error("Could not find the connector path.");
  }
  return best;
}

function removePriorSineBundle() {
  for (var i = doc.pathItems.length - 1; i >= 0; i--) {
    var item = doc.pathItems[i];
    if (item.name && item.name.indexOf("spectral-sine-trace-") === 0) {
      item.remove();
    }
  }
}

function makeBaseSamples(samplesPerSegment) {
  var anchors = [
    [504, 578],
    [428, 673],
    [422, 790],
    [489, 895],
    [607, 948]
  ];
  var samples = [];
  var totalSegments = anchors.length - 1;

  for (var segment = 0; segment < totalSegments; segment++) {
    var p0 = anchors[Math.max(0, segment - 1)];
    var p1 = anchors[segment];
    var p2 = anchors[segment + 1];
    var p3 = anchors[Math.min(anchors.length - 1, segment + 2)];

    for (var s = 0; s <= samplesPerSegment; s++) {
      if (segment > 0 && s === 0) {
        continue;
      }
      var t = s / samplesPerSegment;
      var point = catmullRom(p0, p1, p2, p3, t);
      var next = catmullRom(p0, p1, p2, p3, Math.min(1, t + 0.02));
      var normal = normalFrom(point, next);
      var global = (segment + t) / totalSegments;
      samples.push({ point: point, normal: normal, global: global });
    }
  }

  return samples;
}

function pointsFromSamples(samples, normalOffset, waveAmplitude, phase, frequency) {
  var points = [];
  for (var i = 0; i < samples.length; i++) {
    var sample = samples[i];
    var g = sample.global;
    var taper = Math.sin(Math.PI * g);
    var wave =
      waveAmplitude * Math.sin(2 * Math.PI * (frequency * g + phase)) +
      0.55 * waveAmplitude * Math.sin(2 * Math.PI * ((frequency * 0.52) * g + phase * 0.7));
    var offset = normalOffset + taper * wave;
    points.push([
      sample.point[0] + sample.normal[0] * offset,
      sample.point[1] + sample.normal[1] * offset
    ]);
  }
  return points;
}

function styleOpenPath(path, color, width, opacity) {
  path.closed = false;
  path.stroked = true;
  path.filled = false;
  path.strokeColor = color;
  path.strokeWidth = width;
  path.opacity = opacity;
  try {
    path.strokeDashes = [];
    path.strokeDashOffset = 0;
    path.strokeCap = StrokeCap.ROUNDENDCAP;
    path.strokeJoin = StrokeJoin.ROUNDENDJOIN;
  } catch (e) {
    // Some Illustrator versions reject one cosmetic stroke field.
  }
}

removePriorSineBundle();

var connector = findConnectorPath();
var baseSamples = makeBaseSamples(28);
var smoothPoints = pointsFromSamples(baseSamples, 0, 0, 0, 1);

connector.name = "main-smooth-connector";
connector.setEntirePath(smoothPoints);
styleOpenPath(connector, rgb(176, 185, 198), 3.4, 80);

var traceCount = 15;
for (var i = 0; i < traceCount; i++) {
  var centered = i - (traceCount - 1) / 2;
  var spread = centered * 2.5;
  var amplitude = 10.5 + Math.abs(centered) * 0.25;
  var phase = i * 0.055;
  var frequency = 3.35;
  var points = pointsFromSamples(baseSamples, spread, amplitude, phase, frequency);
  var trace = doc.pathItems.add();
  trace.name = "spectral-sine-trace-" + (i + 1);
  trace.setEntirePath(points);
  styleOpenPath(trace, paletteColor(i / (traceCount - 1)), 0.95, 58);
  try {
    trace.move(connector, ElementPlacement.PLACEAFTER);
  } catch (e) {
    trace.zOrder(ZOrderMethod.SENDBACKWARD);
  }
}

doc.save();
"Updated smooth connector and sine trace bundle: " + doc.fullName.fsName;
