const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    songImage: {
      type: String,
    },
    genre: {
      type: String,
      required: true,
    },
    length: {
      type: String,
    },
    audioFile: {
      type: String,
    },
    VideoFile: {
      type: String,
    },
    realeaseDate: {
      type: Date,
    },
    views: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Music = mongoose.model("Music", musicSchema);
module.exports = Music;
