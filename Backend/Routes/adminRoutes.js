const express = require("express");
const router = express.Router();
const {
  uploadSong,
  addAlbum,
  dashboardCount,
  getAllSongs,
  deleteSong,
  UniqueAlbums,
} = require("../Controllers/admin.Controller");
const authenticateToken = require("../Middlewares/authMiddleware");

const { upload } = require("../config/multerConfig");
const { unique } = require("jquery");

router.post(
  "/upload",
  authenticateToken,
  upload.fields([
    { name: "songImage", maxCount: 1 },
    { name: "artistImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 }, // must match!
  ]),
  uploadSong
);

router.post(
  "/addAlbum",
  authenticateToken,
  upload.fields([
    { name: "songImage", maxCount: 1 },
    { name: "artistImage", maxCount: 1 },
    { name: "albumImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 }, // must match!
  ]),
  addAlbum
);

router.get("/", (req, res) => {
  res.render("login", { layout: false }); // Disable default layout
});

router.get("/uploadsong", authenticateToken, (req, res) => {
  res.render("uploadsong", { title: "Upload Song" });
});

router.get("/addAlbum", authenticateToken, (req, res) => {
  res.render("addAlbum", { title: "Upload Album" });
});

router.get("/register", (req, res) => {
  res.render("register", { layout: false });
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { layout: false });
});

router.get("/dashboard", authenticateToken, (req, res) => {
  res.render("index");
});

router.get("/mysongs", authenticateToken, (req, res) => {
  res.render("mysongs", { title: "My Songs" });
});

router.get("/myAlbums", authenticateToken, (req, res) => {
  res.render("myAlbums", { title: "My Albums" });
});

router.get("/myPlaylist", authenticateToken, (req, res) => {
  res.render("myPlaylist", { title: "My Playlists" });
});

router.get("/dashboardcount", authenticateToken, dashboardCount);

router.get("/songs", authenticateToken, getAllSongs);

router.delete("/song/:id", authenticateToken, deleteSong);

router.get("/my-albums", authenticateToken, UniqueAlbums);

module.exports = router;
