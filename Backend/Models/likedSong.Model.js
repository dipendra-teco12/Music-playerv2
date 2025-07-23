const mongoose = require("mongoose");

const likedSongSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Music",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const LikedSong = new mongoose.model("LikedSong", likedSongSchema);

module.exports = LikedSong;
