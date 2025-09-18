const express = require("express");
const multer = require("multer");
const authenticate = require("../../middleware/auth-middleware");
const {
  uploadMediaBufferToCloudinary,
  uploadLargeBufferToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../helpers/cloudinary");

const router = express.Router();

// Apply authentication middleware to all media routes
router.use(authenticate);

// Use memory storage to avoid writing files on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const isVideo = (req.file.mimetype || "").startsWith("video/");
    const result = isVideo
      ? await uploadLargeBufferToCloudinary(req.file.buffer, undefined, { resource_type: "video" })
      : await uploadMediaBufferToCloudinary(req.file.buffer, undefined, { resource_type: "auto" });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    console.log("Cloudinary upload error:", e?.message);
    res.status(500).json({ success: false, message: e?.message || "Error uploading file" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assest Id is required",
      });
    }

    await deleteMediaFromCloudinary(id);

    res.status(200).json({
      success: true,
      message: "Assest deleted successfully from cloudinary",
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({ success: false, message: "Error deleting file" });
  }
});

router.post("/bulk-upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    const uploadPromises = req.files.map((fileItem) => {
      const isVideo = (fileItem.mimetype || "").startsWith("video/");
      return isVideo
        ? uploadLargeBufferToCloudinary(fileItem.buffer, undefined, { resource_type: "video" })
        : uploadMediaBufferToCloudinary(fileItem.buffer, undefined, { resource_type: "auto" });
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (event) {
    console.log(event);

    res
      .status(500)
      .json({ success: false, message: "Error in bulk uploading files" });
  }
});

module.exports = router;
