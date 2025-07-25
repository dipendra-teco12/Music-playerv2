const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    albumName: String,
    albumImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dfciwmday/image/upload/v1753418602/MusicApp/defaults/album3_tbqtj9.jpg",
    },
    albumSong: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;
