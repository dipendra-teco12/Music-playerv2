const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    songImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dfciwmday/image/upload/v1752668321/MusicApp/Images/songImage_gz8nht.jpg",
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
    videoFile: {
      type: String,
    },
    videoFilePublicId: String,
    releaseDate: {
      type: Date,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    singleTrack: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Music = mongoose.model("Music", musicSchema);
module.exports = Music;
