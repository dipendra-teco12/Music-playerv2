const Music = require("../Models/music.Model");
const FavoriteSong = require("../Models/favoriteSong.Model");
const LikedSong = require("../Models/likedSong.Model");
const Playlist = require("../Models/playlist.Model");
const Album = require("../Models/album.Model");

const addFavoriteSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.body;
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
    const userId = req.user.id;
    const { songId } = req.body;
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
    const userId = req.user.id;
    const favs = await FavoriteSong.find({ userId })
      .populate("songId")
      .sort("-createdAt");
    if (favs.length === 0) {
      return res.status(200).json({ message: "user has not favorite songs" });
    }
    res
      .status(200)
      .json({ message: "fetched the favorite songs successfully", favs });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSong = async (req, res) => {
  try {
    const { songId } = req.params;
    if (!songId) {
      return res.status(400).json({ message: "songId is missing" });
    }

    const song = await Music.findById(songId);
    if (!song) return res.status(404).json({ message: "Song not found" });

    const playlists = await Playlist.find({ playlistSong: songId }).select(
      "playlistName"
    );
    const albums = await Album.find({ albumSong: songId }).select("albumName");

    const playlistNames = playlists.map((p) => p.playlistName);
    const albumNames = albums.map((a) => a.albumName);

    return res.status(200).json({
      message: "song successfully fetched",
      songId: song._id,
      title: song.title,
      genre: song.genre,
      length: song.length,
      releaseDate: song.releaseDate,
      description: song.description,
      playlistNames,
      albumNames,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const likeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.body;

    if (!userId || !songId)
      return res.status(400).json({ message: "user id or song id is missing" });

    const existing = await LikedSong.findOne({ userId, songId });
    if (existing) return res.status(400).json({ message: "Already liked" });

    const likeSong = await LikedSong.create({ songId, userId });

    await Music.findByIdAndUpdate(songId, { $inc: { likesCount: 1 } });

    res.status(200).json({ message: "song liked successfully", likeSong });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const disLikeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.body;

    if (!userId || !songId)
      return res.status(400).json({ message: "user id or song id is missing" });

    const removed = await LikedSong.findOneAndDelete({ userId, songId });
    if (!removed)
      return res.status(400).json({ message: "Not previously liked" });

    await Music.findByIdAndUpdate(songId, { $inc: { likesCount: -1 } });

    res
      .status(200)
      .json({ message: "song disliked successfully", disLikeSong });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  addFavoriteSong,
  removeFavoriteSong,
  FavoriteSongList,
  getSong,
  likeSong,
  disLikeSong,
};
