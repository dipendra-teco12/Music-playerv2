const mongoose = require("mongoose");
const playlistSchema = new mongoose.Schema({
  playlistName: {
    type: String,
  },
  playlistSong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Music",
  },
});
const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
