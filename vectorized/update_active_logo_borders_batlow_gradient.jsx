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

function makeBatlowBorderGradient(name) {
  var gradient = doc.gradients.add();
  gradient.name = name;
  gradient.type = GradientType.LINEAR;

  while (gradient.gradientStops.length < 4) {
    gradient.gradientStops.add();
  }

  // Biased toward the darker Batlow portion; avoids the full pink endpoint.
  var stops = [
    { ramp: 0, color: rgb(1, 25, 89) },
    { ramp: 38, color: rgb(34, 96, 97) },
    { ramp: 72, color: rgb(130, 130, 49) },
    { ramp: 100, color: rgb(242, 157, 109) }
  ];

  for (var i = 0; i < stops.length; i++) {
    gradient.gradientStops[i].rampPoint = stops[i].ramp;
    gradient.gradientStops[i].midPoint = 50;
    gradient.gradientStops[i].color = stops[i].color;
    gradient.gradientStops[i].opacity = 100;
  }

  var gradientColor = new GradientColor();
  gradientColor.gradient = gradient;
  gradientColor.angle = -25;
  return gradientColor;
}

var borderGradient = makeBatlowBorderGradient("Batlow border subtle");
var updated = 0;

for (var i = 0; i < doc.pathItems.length; i++) {
  var item = doc.pathItems[i];
  if (!item.stroked || item.strokeWidth < 10) {
    continue;
  }

  var bounds = item.geometricBounds;
  var width = bounds[2] - bounds[0];
  var height = bounds[1] - bounds[3];
  var isPaletteBorder = width > 500 && height > 500;
  var isInnerOvalBorder = width > 90 && width < 140 && height > 70 && height < 110;

  if (isPaletteBorder || isInnerOvalBorder) {
    item.strokeColor = borderGradient;
    updated++;
  }
}

if (updated !== 2) {
  throw new Error("Expected to update 2 border strokes, but updated " + updated + ".");
}

doc.save();
"Updated palette borders with Batlow gradient and saved: " + doc.fullName.fsName;
