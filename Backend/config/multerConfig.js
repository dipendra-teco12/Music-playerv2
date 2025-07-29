const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("./cloudinaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const field = file.fieldname;
    let folder = "MusicApp/Other";

    if (
      field === "songImage" ||
      field === "artistImage" ||
      field === "albumImage"
    ) {
      folder = "MusicApp/Images";
    } else if (field === "audioFile") {
      folder = "MusicApp/Audio";
    } else if (field === "videoFile") {
      folder = "MusicApp/Video";
    }

    return {
      folder: folder,

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "mp3",
        "wav",
        "aac",
        "ogg",
        "webp",
        "mp4",
        "mov",
        "avi",
        "mkv",
      ],

      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`,

      resource_type:
        field === "audioFile" || field === "videoFile" ? "video" : "auto",
    };
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 1024 * 1024 * 50,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, audio and video files are allowed."
        ),
        false
      );
    }
  },
});

module.exports = { upload };
