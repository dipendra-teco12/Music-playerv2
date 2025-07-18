const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    playlistName: String,
    coverImage: String,
    playlistSong: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
