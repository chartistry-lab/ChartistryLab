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

// Five evenly spaced samples from cmcrameri.cm.batlow, applied bottom-to-top.
var batlowByVisualOrder = [
  { x: 504, y: 578, color: rgb(1, 25, 89) },
  { x: 428, y: 673, color: rgb(34, 96, 97) },
  { x: 422, y: 790, color: rgb(130, 130, 49) },
  { x: 489, y: 895, color: rgb(242, 157, 109) },
  { x: 607, y: 948, color: rgb(250, 204, 250) }
];

function centerOf(item) {
  var bounds = item.geometricBounds;
  return {
    x: (bounds[0] + bounds[2]) / 2,
    y: (bounds[1] + bounds[3]) / 2,
    w: bounds[2] - bounds[0],
    h: bounds[1] - bounds[3]
  };
}

function distance(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

for (var i = 0; i < batlowByVisualOrder.length; i++) {
  var target = batlowByVisualOrder[i];
  var bestItem = null;
  var bestDistance = 999999;

  for (var j = 0; j < doc.pathItems.length; j++) {
    var item = doc.pathItems[j];
    if (!item.filled || item.opacity < 99) {
      continue;
    }
    var center = centerOf(item);
    if (Math.abs(center.w - 58) > 3 || Math.abs(center.h - 58) > 3) {
      continue;
    }
    var d = distance(center, target);
    if (d < bestDistance) {
      bestDistance = d;
      bestItem = item;
    }
  }

  if (bestItem === null || bestDistance > 5) {
    throw new Error("Could not find Batlow point target near " + target.x + ", " + target.y);
  }

  bestItem.fillColor = target.color;
}

doc.save();
"Updated five plotted points with Batlow colors and saved: " + doc.fullName.fsName;
