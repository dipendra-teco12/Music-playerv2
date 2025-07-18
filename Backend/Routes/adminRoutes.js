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

const { upload } = require("../config/multerConfig");

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
  res.render("uploadsong", { title: "Upload Song", activePage: "uploadsong" });
});

router.get("/addAlbum", authenticateToken, (req, res) => {
  res.render("addAlbum", { title: "Upload Album", activePage: "addAlbum" });
});

router.get("/register", (req, res) => {
  res.render("register", { layout: false });
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { layout: false });
});

router.get("/dashboard", authenticateToken, (req, res) => {
  res.render("index", { activePage: "dashboard", title: "Dashboard" });
});

router.get("/mysongs", authenticateToken, (req, res) => {
  res.render("mysongs", { title: "My Songs", activePage: "mysongs" });
});

router.get("/myAlbums", authenticateToken, (req, res) => {
  res.render("myAlbums", { title: "My Albums", activePage: "myAlbums" });
});

router.get("/myPlaylist", authenticateToken, (req, res) => {
  res.render("myPlaylist", { title: "My Playlists", activePage: "myPlaylist" });
});

router.get("/myAlbums/songs", authenticateToken, (req, res) => {
  res.render("myAlbumSongs", {
    title: "My Albums Songs",
    activePage: "myAlbums",
  });
});

router.get("/myPlaylists/songs", authenticateToken, (req, res) => {
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
