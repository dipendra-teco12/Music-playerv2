const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    playlistName: String,
    coverImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dfciwmday/image/upload/v1754543097/MusicApp/Defaults/songImage_uxtvvy.jpg",
    },
    userPlayList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    playlistSong: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
