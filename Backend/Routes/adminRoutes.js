const express = require("express");
const router = express.Router();
const { uploadSong, show } = require("../Controllers/admin.Controller");
const authenticateToken = require("../Middlewares/authMiddleware");

const { upload } = require("../config/multerConfig");

router.post(
  "/upload",

  upload.fields([
    { name: "songImage", maxCount: 1 },
    { name: "artistImage", maxCount: 1 },
    { name: "albumImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 }, // must match!
  ]),
  uploadSong
);

router.get("/", (req, res) => {
  res.render("login", { layout: false }); // Disable default layout
});

router.get("/uploadsong", authenticateToken, (req, res) => {
  res.render("uploadsong", { title: "Upload Song" });
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

module.exports = router;
