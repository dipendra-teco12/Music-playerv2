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
    songImagePublicId: String,
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
    audioFilePublicId: String,
    VideoFile: {
      type: String,
    },
    releaseDate: {
      type: Date,
    },
    views: {
      type: Number,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Music = mongoose.model("Music", musicSchema);
module.exports = Music;
