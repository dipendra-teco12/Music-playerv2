const { type } = require("jquery");
const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  albumName: {
    type: String,
  },
  albumImage: {
    type: String,
  },
  albumSong:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Music",
  }
},{
    timestamps: true
});

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;
