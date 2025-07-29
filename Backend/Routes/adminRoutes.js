const express = require("express");
const router = express.Router();
const Music = require("../Models/music.Model");
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
  UniqueArtist,
  artistAlbums,
  deleteAlbum,
  deletePlaylist,
  getSongData,
  getAllUsers,
  updateSong,
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
    { name: "videoFile", maxCount: 1 },
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
router.put(
  "/update-song/:id",
  authenticateToken,
  upload.fields([
    { name: "songImage", maxCount: 1 },
    { name: "artistImage", maxCount: 1 },
    { name: "albumImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
  ]),
  updateSong
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

router.get("/uploadsong", authenticateToken, isAdmin, async(req, res) => {
 try {
    const { mode, id } = req.query;
    if (!id) {
      return res.render("uploadSong", {
        song: null,
        mode: "create",
        activePage: "uploadSong",
      });
    }
    let song = null;

    if (mode === "edit" && id) {
      song = await getSongData(id);
    }

    res.render("uploadSong", {
      song: song,
      mode: mode || "create",
      activePage: "uploadSong",
    });
  } catch (error) {
    console.error("Error loading uploadSong page:", error);
    res.status(500).send("Error loading page");
  }
});

router.get("/addAlbum", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { mode, id } = req.query;
    if (!id) {
      return res.render("addAlbum", {
        song: null,
        mode: "create",
        activePage: "addAlbum",
      });
    }
    let song = null;

    if (mode === "edit" && id) {
      song = await getSongData(id);
    }

    res.render("addAlbum", {
      song: song,
      mode: mode || "create",
      activePage: "addAlbum",
    });
  } catch (error) {
    console.error("Error loading addAlbum page:", error);
    res.status(500).send("Error loading page");
  }
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

router.get("/myArtist", authenticateToken, isAdmin, (req, res) => {
  res.render("myArtist", { activePage: "artist" });
});

router.get("/myArtists/albums", authenticateToken, isAdmin, (req, res) => {
  res.render("myArtistAlbums", { activePage: "artist" });
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

router.get("/my-artists", authenticateToken, UniqueArtist);

router.get("/api/myAlbums/songs", authenticateToken, getSongsByAlbum);
router.get("/api/myPlaylists/songs", authenticateToken, getSongsByPlaylist);

router.get("/api/myArtists/albums", authenticateToken, artistAlbums);

router.delete("/delete-album/:albumId", authenticateToken, deleteAlbum);

router.delete(
  "/delete-playlist/:playlistId",
  authenticateToken,
  deletePlaylist
);

const isSuperAdmin = require("../Middlewares/isSuperAdmin");

router.get("/super-admin", getAllUsers, (req, res) => {
  let users = req.primeusers;
  res.render("superAdmin", { users, layout: false });
});

const User = require("../Models/user.Model");
// Edit user role
router.put("/super-admin/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
  res.redirect("/admin/super-admin");
});

// Delete user
router.delete("/super-admin/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin/super-admin");
});

module.exports = router;
