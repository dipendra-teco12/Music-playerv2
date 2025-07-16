const Music = require("../Models/music.Model");
const Artist = require("../Models/artist.Model");
const Album = require("../Models/album.Model");
const playlist = require("../Models/playlist.Model");
const Playlist = require("../Models/playlist.Model");
const DEFAULT_SONG_IMAGE =
  "https://res.cloudinary.com/dfciwmday/image/upload/v1752668321/MusicApp/Images/songImage_gz8nht.jpg";
const DEFAULT_ARTIST_IMAGE =
  "https://res.cloudinary.com/dfciwmday/image/upload/v1752668321/MusicApp/Images/artistimages_mq00py.webp";
const DEFAULT_ALBUM_IMAGE =
  "https://res.cloudinary.com/dfciwmday/image/upload/v1752668322/MusicApp/Images/albumImage_quzow6.jpg";

const uploadSong = async (req, res) => {
  try {
    const {
      title,
      artistName,
      albumName,
      length,
      genre,
      playlist,
      releaseDate,
      description,
    } = req.body;

    if (!title || !genre || !playlist || !releaseDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const songImage = req.files?.songImage?.[0]?.path || DEFAULT_SONG_IMAGE;
    const artistImage =
      req.files?.artistImage?.[0]?.path || DEFAULT_ARTIST_IMAGE;
    const albumImage = req.files?.albumImage?.[0]?.path || DEFAULT_ALBUM_IMAGE;
    const audioFile = req.files?.audioFile?.[0]?.path;

    if (!audioFile) {
      return res.status(400).json({ message: "Missing audio file" });
    }

    const songdata = await Music.create({
      title,
      length,
      genre,
      releaseDate,
      description,
      songImage,
      audioFile,
    });

    let albumdata = null;

    if (albumName) {
      albumdata = await Album.create({
        albumName,
        albumImage,
        albumSong: songdata._id,
      });
    }

    if (artistName) {
      await Artist.create({
        artistName,
        artistImage,
        artistSong: songdata._id,
        artistAlbum: albumdata ? albumdata._id : null, // safe access
      });
    }

    await Playlist.create({
      playlistName: playlist,
      playlistSong: songdata._id,
    });

    return res.status(200).json({
      message: "Song uploaded successfully",
      songdata,
    });
  } catch (error) {
    console.error("Upload song error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { uploadSong };
