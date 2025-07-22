const express = require("express");
const router = express.Router();
const {
  addFavoriteSong,
  removeFavoriteSong,
  FavoriteSongList,
  getSong,
} = require("../Controllers/song.Controller");

router.post("/favorite-song", addFavoriteSong);

router.delete("/favorite-song", removeFavoriteSong);

router.get("/user/:userId", FavoriteSongList);

router.get("/:songId/", getSong);

module.exports = router;
