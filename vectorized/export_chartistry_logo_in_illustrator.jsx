app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var svgFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector.svg");
var aiFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector.ai");
var pdfFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector.pdf");

if (!svgFile.exists) {
  throw new Error("SVG source file was not found: " + svgFile.fsName);
}

if (aiFile.exists) {
  aiFile.remove();
}
if (pdfFile.exists) {
  pdfFile.remove();
}

var doc = app.open(svgFile);
doc.artboards[0].artboardRect = [0, 1254, 1254, 0];

var aiOptions = new IllustratorSaveOptions();
aiOptions.pdfCompatible = true;
aiOptions.compressed = true;
doc.saveAs(aiFile, aiOptions);

var pdfOptions = new PDFSaveOptions();
pdfOptions.preserveEditability = true;
pdfOptions.generateThumbnails = true;
pdfOptions.optimization = true;
doc.saveAs(pdfFile, pdfOptions);

doc.close(SaveOptions.DONOTSAVECHANGES);
"Exported Chartistry Lab vector files";
