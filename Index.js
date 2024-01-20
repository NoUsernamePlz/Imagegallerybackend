const express = require("express");
const cors = require("cors");
const exiftool = require("exiftool-vendored").exiftool;
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public"));
const port = 3000;

const publicFolder = "./public/Images";
const imageNames = require("./Imagename.json");

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

    res.json({ metadata: tags, imageUrl: `/image?image=${imageName}` });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    res.status(500).json({ error: "Failed to extract metadata" });
  }
});

app.get("/images", async (req, res) => {
  try {
    if (!Array.isArray(imageNames)) {
      return res.status(400).json({ error: "Invalid JSON file format" });
    }

    const imageDetails = [];

    for (const imageName of imageNames) {
      const imagePath = path.join(publicFolder, imageName);

      try {
        await fs.access(imagePath);
        imageDetails.push({
          name: imageName,
          path: path.join(__dirname, imagePath),
        });
      } catch (error) {
        console.error(`Image not found: ${imageName}`);
      }
    }

    if (imageDetails.length === 0) {
      return res.status(404).json({ error: "No images found" });
    }

    res.json({ imageDetails });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Failed to process images" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
