const express = require("express");
const cors = require("cors");
const exiftool = require("exiftool-vendored").exiftool;
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());
const port = 3000;

const publicFolder = "./public/Images";
// const imageNames = require("./Imagename.json");
app.use("/api", express.static(__dirname + "/public/Images"));



app.get("/metadata", async (req, res) => {
  try {
    const imageName = req.query.image;

    if (!imageName) {
      return res.status(400).json({ error: "Image parameter is missing" });
    }

    const imagePath = path.join(publicFolder, imageName);

    const exists = await fs
      .access(imagePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    const tags = await exiftool.read(imagePath);

    res.json({
      metadata: [
        { Lens: tags.LensModel || "NA" },
        { LensAF: tags.Lens || "NA" },
        { Capture: tags.DateTimeOriginal.rawValue || "NA" },
        { ISO: tags.ISO || "NA" },
        { speed: tags.ShutterSpeed || "NA" },
        { Aperture: tags.Aperture || "NA" },
        { FileName: tags.FileName || "NA" },
        { ImageSize: tags.ImageHeight + "X" + tags.ImageWidth || 0 },
        { whitebalance: tags.WhiteBalance || "NA" },
        { rating: tags.Rating || "NA" },
        { color: tags.ColorSpace || "NA" },
        { camera: tags.Model || "NA" },
      ],
      imageUrl: `/image?image=${imageName}`,
    });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    res.status(500).json({ error: "Failed to extract metadata" });
  }
});


//
//         const uniqueIdentifier = Date.now() + Math.floor(Math.random() * 1000);
//         const outputJpgPath = path.join(publicFolder, `${uniqueIdentifier}.jpg`);
//         await exiftool.extractPreview(imagePath, outputJpgPath);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
