const express = require("express");
const authenticateToken = require("../Middlewares/authMiddleware");
const router = express.Router();

const {
  userPlaylist,
  addSongInPlaylist,
  getSongsOfPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
} = require("../Controllers/user.Controller");

router.post("/create-playlist", authenticateToken, userPlaylist);
router.post("/add-song", authenticateToken, addSongInPlaylist);
router.post("/getPlaylistSongs", authenticateToken, getSongsOfPlaylist);
router.delete("/playlist/:playlistId", authenticateToken, deletePlaylist);

router.delete(
  "/removeSongFromPlaylist",
  authenticateToken,
  removeSongFromPlaylist
);

module.exports = router;
