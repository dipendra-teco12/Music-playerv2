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
} = require("../Controllers/song.Controller");
const authenticateToken = require("../Middlewares/authMiddleware");

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

module.exports = router;
