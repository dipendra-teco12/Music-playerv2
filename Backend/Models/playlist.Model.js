const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    playlistName: String,
    coverImage: String,
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
