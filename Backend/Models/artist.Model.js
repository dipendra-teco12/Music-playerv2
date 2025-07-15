const mongoose = require("mongoose");
const artistSchema = new mongoose.Schema({
  artistName: {
    type: String,
  },
  artistImage: {
    type: String,
  },
  artistSong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Music",
  },
  artistAlbum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
  },
},{
    timestamps: true
});
const Artist = mongoose.model("Artist", artistSchema);
module.exports = Artist;        