const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("./cloudinaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the configured Cloudinary instance
  params: async (req, file) => {
    const field = file.fieldname;
    let folder = "MusicApp/Other";

    // Set folder for image files
    if (
      field === "songImage" ||
      field === "artistImage" ||
      field === "albumImage"
    ) {
      folder = "MusicApp/Images";
    }
    // Set folder for audio files
    else if (field === "audioFile") {
      folder = "MusicApp/Audio";
    }

    // Return the parameters for Cloudinary upload
    return {
      folder: folder, // The Cloudinary folder to store the file

      allowed_formats: ["jpg", "jpeg", "png", "mp3", "wav", "aac", "ogg"],

      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`, // Replace spaces for cleaner public_ids

      resource_type: field === "audioFile" ? "video" : "auto", // 'video' for audio files, 'auto' for others
    };
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 1024 * 1024 * 50, // 50 MB limit for all files, adjust as needed
  },
  // Optional: File filter to accept only certain mimetypes if not already handled by allowed_formats
  fileFilter: (req, file, cb) => {
    // Example: Accept only image and audio mimetypes
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("audio/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images and audio files are allowed."
        ),
        false
      );
    }
  },
});

// Export the upload instance to be used in your routes
module.exports = { upload };
