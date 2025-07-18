const express = require("express");
const router = express.Router();
const {
  uploadSong,
  addAlbum,
  dashboardCount,
  getAllSongs,
  deleteSong,
  UniqueAlbums,
  UniquePlaylists,
  getSongsByAlbum,
  getSongsByPlaylist,
} = require("../Controllers/admin.Controller");

const authenticateToken = require("../Middlewares/authMiddleware");
const isAdmin = require("../Middlewares/isAdmin");
const { upload } = require("../config/multerConfig");

router.post(
  "/upload",
  authenticateToken,
  upload.fields([
    { name: "songImage", maxCount: 1 },
    { name: "artistImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
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
    { name: "audioFile", maxCount: 1 }, 
  ]),
  addAlbum
);

router.get("/", (req, res) => {
  res.render("authViews/login", { layout: false });
});

router.get("/register", (req, res) => {
  res.render("authViews/register", { layout: false });
});

router.get("/forgot-password", (req, res) => {
  res.render("authviews/forgot-password", { layout: false });
});

router.get("/uploadsong", authenticateToken, isAdmin, (req, res) => {
  res.render("uploadsong", { activePage: "uploadsong" });
});

router.get("/addAlbum", authenticateToken, isAdmin, (req, res) => {
  res.render("addAlbum", { activePage: "addAlbum" });
});

router.get("/dashboard", authenticateToken, isAdmin, (req, res) => {
  res.render("index", { activePage: "dashboard" });
});

router.get("/mysongs", authenticateToken, isAdmin, (req, res) => {
  res.render("mysongs", { activePage: "mysongs" });
});

router.get("/myAlbums", authenticateToken, isAdmin, (req, res) => {
  res.render("myAlbums", { activePage: "myAlbums" });
});

router.get("/myPlaylist", authenticateToken, isAdmin, (req, res) => {
  res.render("myPlaylist", { activePage: "myPlaylist" });
});

router.get("/artist", authenticateToken, isAdmin, (req, res) => {
  res.render("artist", { activePage: "artist" });
});

router.get("/myAlbums/songs", authenticateToken, isAdmin, (req, res) => {
  res.render("myAlbumSongs", {
    title: "My Albums Songs",
    activePage: "myAlbums",
  });
});

router.get("/myPlaylists/songs", authenticateToken, isAdmin, (req, res) => {
  res.render("myPlaylistSongs", {
    title: "My Playlist Songs",
    activePage: "myPlaylist",
  });
});

router.get("/dashboardcount", authenticateToken, dashboardCount);

router.get("/songs", authenticateToken, getAllSongs);

router.delete("/song/:id", authenticateToken, deleteSong);

router.get("/my-albums", authenticateToken, UniqueAlbums);

router.get("/my-playlists", authenticateToken, UniquePlaylists);

router.get("/api/myAlbums/songs", authenticateToken, getSongsByAlbum);
router.get("/api/myPlaylists/songs", authenticateToken, getSongsByPlaylist);

module.exports = router;
