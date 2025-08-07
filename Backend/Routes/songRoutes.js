const express = require("express");
const router = express.Router();
const {
  addFavoriteSong,
  removeFavoriteSong,
  FavoriteSongList,
  getSong,
  likeSong,
  disLikeSong,
  genre,
  mostViewedSongs,
  topWeeklySongs,
  getAllVideoSongs,
  oldestSongs,
  recommendedArtist,
  getArtistSongs,
  getAllArtists,
} = require("../Controllers/song.Controller");
const authenticateToken = require("../Middlewares/authMiddleware");
const { artistAlbums } = require("../Controllers/admin.Controller");

router.post("/favorite-song", authenticateToken, addFavoriteSong);

router.delete("/favorite-song", authenticateToken, removeFavoriteSong);

router.get("/user", authenticateToken, FavoriteSongList);

router.get("/category", authenticateToken, genre);
router.get("/track/:songId", authenticateToken, getSong);

router.post("/like", authenticateToken, likeSong);

router.post("/dislike", authenticateToken, disLikeSong);

router.get("/most-viewed", authenticateToken, mostViewedSongs);

router.get("/top-weekly", authenticateToken, topWeeklySongs);

router.get("/video-songs", authenticateToken, getAllVideoSongs);

router.get("/old-songs", authenticateToken, oldestSongs);

router.get("/artist-songs/:artistId", authenticateToken, getArtistSongs);

router.get("/artist-album/:artistId", authenticateToken, artistAlbums);

router.get("/allArtist".authenticateToken, getAllArtists);

module.exports = router;
