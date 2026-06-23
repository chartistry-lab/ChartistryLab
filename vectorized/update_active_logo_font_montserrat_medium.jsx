app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

if (app.documents.length === 0) {
  throw new Error("No Illustrator document is open.");
}

var doc = app.activeDocument;
var targetFont = app.textFonts.getByName("Montserrat-Medium");
var outputFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector_montserrat_medium.ai");

if (outputFile.exists) {
  outputFile.remove();
}

function fitTextFrameToCurrentBounds(textFrame, font) {
  var targetBounds = textFrame.geometricBounds.slice(0);
  var targetLeft = targetBounds[0];
  var targetTop = targetBounds[1];
  var targetWidth = targetBounds[2] - targetBounds[0];
  var targetHeight = targetBounds[1] - targetBounds[3];
  var attrs = textFrame.textRange.characterAttributes;

  attrs.textFont = font;
  attrs.horizontalScale = 100;
  attrs.verticalScale = 100;

  var bounds = textFrame.geometricBounds;
  var currentHeight = bounds[1] - bounds[3];
  if (currentHeight > 0) {
    attrs.size = attrs.size * (targetHeight / currentHeight);
  }

  attrs.horizontalScale = 100;
  bounds = textFrame.geometricBounds;
  var currentWidth = bounds[2] - bounds[0];
  if (currentWidth > 0) {
    attrs.horizontalScale = 100 * (targetWidth / currentWidth);
  }

  textFrame.position = [targetLeft, targetTop];
}

for (var i = 0; i < doc.textFrames.length; i++) {
  var frame = doc.textFrames[i];
  if (frame.contents === "Chartistry" || frame.contents === "Lab") {
    fitTextFrameToCurrentBounds(frame, targetFont);
  }
}

doc.artboards[0].artboardRect = [0, 1254, 1254, 0];

var aiOptions = new IllustratorSaveOptions();
aiOptions.pdfCompatible = true;
aiOptions.compressed = true;
doc.saveAs(outputFile, aiOptions);

"Saved Montserrat Medium AI variant: " + outputFile.fsName;
