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
} = require("../Controllers/song.Controller");
const authenticateToken = require("../Middlewares/authMiddleware");

router.post("/favorite-song", authenticateToken, addFavoriteSong);

router.delete("/favorite-song", authenticateToken, removeFavoriteSong);

router.get("/user", authenticateToken, FavoriteSongList);

router.get("/category", authenticateToken, genre);
router.get("/:songId", authenticateToken, getSong);

router.post("/like", authenticateToken, likeSong);

router.post("/dislike", authenticateToken, disLikeSong);


module.exports = router;
