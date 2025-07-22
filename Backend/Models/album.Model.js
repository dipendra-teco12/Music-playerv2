
const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    albumName: String,
    albumImage: String,
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
