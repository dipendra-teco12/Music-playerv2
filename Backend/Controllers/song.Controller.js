const FavoriteSong = require("../Models/favoriteSong.Model");

const addFavoriteSong = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId) {
      return res.status(400).json({ message: "Missing userId or songId" });
    }

    const already = await FavoriteSong.findOne({ userId, songId });
    if (already) {
      return res.status(409).json({ message: "Song already in favorite list" });
    }

    const fav = await FavoriteSong.create({ userId, songId });
    res.status(201).json({ message: "Added to favorite song list", fav });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeFavoriteSong = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId) {
      return res.status(400).json({ message: "Missing userId or songId" });
    }
    const result = await FavoriteSong.findOneAndDelete({ userId, songId });

    if (!result)
      return res.status(404).json({ message: "Favorite song not found" });
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const FavoriteSongList = async (req, res) => {
  try {
    const { userId } = req.params;
    const favs = await FavoriteSong.find({ userId })
      .populate("songId")
      .sort("-createdAt");
    res
      .status(200)
      .json({ message: "fetched the favorite songs successfully", favs });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const Music = require("../Models/music.Model");

const getSong = async (req, res) => {
  try {
    const { songId } = req.params;
    if (!songId) {
      return res.status(404).json({ message: "songId is missing" });
    }
    const song = await Music.findById(songId);

    if (!song) return res.sendStatus(404);

    res.status(200).json({
      message: "song successfully fetched",
      songId: song._id,
      title: song.title,
      audioUrl: song.audioFile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addFavoriteSong,
  removeFavoriteSong,
  FavoriteSongList,
  getSong,
};
