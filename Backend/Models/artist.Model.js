const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    artistName: {
      type: String,
      trim: true,
    },
    artistImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dfciwmday/image/upload/v1753418817/MusicApp/defaults/artist1_lykttl.jpg",
    },
    artistSong: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music",
      },
    ],
    artistAlbum: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Artist = mongoose.model("Artist", artistSchema);
module.exports = Artist;
