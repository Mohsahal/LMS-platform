const express = require("express");
const multer = require("multer");
const authenticate = require("../../middleware/auth-middleware");
const { csrfProtection } = require("../../middleware/security-middleware");
const { moderateActionLimiter } = require("../../middleware/rate-limiters");
const { 
  createSecureUpload, 
  validateUploadedFiles, 
  uploadRateLimit 
} = require("../../middleware/secure-upload-middleware");
const {
  uploadMediaBufferToCloudinary,
  uploadLargeBufferToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../helpers/cloudinary");

const router = express.Router();

// Apply authentication middleware to all media routes
router.use(authenticate);

// Apply CSRF protection (temporarily disabled for testing)
// router.use(csrfProtection);

// Create secure upload configuration
const secureUpload = createSecureUpload({
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  allowedTypes: [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ],
  maxFiles: 10,
  fieldName: 'file'
});

// Legacy upload configuration (kept for backward compatibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
});

// Secure single file upload
router.post("/upload", 
  uploadRateLimit(5, 15 * 60 * 1000), // 5 uploads per 15 minutes
  secureUpload.single("file"),
  validateUploadedFiles,
  async (req, res) => {
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
  }
);

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

// Secure bulk file upload
router.post("/bulk-upload", 
  uploadRateLimit(3, 15 * 60 * 1000), // 3 bulk uploads per 15 minutes
  secureUpload.array("files", 10),
  validateUploadedFiles,
  async (req, res) => {
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
  }
);

module.exports = router;
