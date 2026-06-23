app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var svgFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector.svg");
var outlinedSvgFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector_outlined.svg");
var aiFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector_outlined.ai");
var pdfFile = new File("/Users/juanjuanhuang/Desktop/Python/ChartistryLab/vectorized/chartistry_lab_logo_vector_outlined.pdf");

if (!svgFile.exists) {
  throw new Error("SVG source file was not found: " + svgFile.fsName);
}

if (aiFile.exists) {
  aiFile.remove();
}
if (pdfFile.exists) {
  pdfFile.remove();
}
if (outlinedSvgFile.exists) {
  outlinedSvgFile.remove();
}

var doc = app.open(svgFile);
doc.artboards[0].artboardRect = [0, 1254, 1254, 0];

while (doc.textFrames.length > 0) {
  doc.textFrames[0].createOutline();
}

var aiOptions = new IllustratorSaveOptions();
aiOptions.pdfCompatible = true;
aiOptions.compressed = true;
doc.saveAs(aiFile, aiOptions);

var pdfOptions = new PDFSaveOptions();
pdfOptions.preserveEditability = true;
pdfOptions.generateThumbnails = true;
pdfOptions.optimization = true;
doc.saveAs(pdfFile, pdfOptions);

var svgOptions = new ExportOptionsSVG();
svgOptions.embedRasterImages = false;
svgOptions.coordinatePrecision = 3;
doc.exportFile(outlinedSvgFile, ExportType.SVG, svgOptions);

doc.close(SaveOptions.DONOTSAVECHANGES);
"Exported outlined Chartistry Lab vector files";
