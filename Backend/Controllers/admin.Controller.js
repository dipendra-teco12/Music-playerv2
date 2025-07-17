const cloudinary = require("../config/cloudinaryConfig");
const Music = require("../Models/music.Model");
const Artist = require("../Models/artist.Model");
const Album = require("../Models/album.Model");
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
    const songImagePublicId = req.files.songImage?.[0]?.filename;
    const artistImage =
      req.files?.artistImage?.[0]?.path || DEFAULT_ARTIST_IMAGE;

    const audioFile = req.files?.audioFile?.[0]?.path;
    const audioFilePublicId = req.files.audioFile?.[0]?.filename;
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
      songImagePublicId,
      audioFile,
      audioFilePublicId,
    });

    if (artistName) {
      await Artist.create({
        artistName,
        artistImage,
        artistSong: songdata._id,
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

const addAlbum = async (req, res) => {
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
    const songImagePublicId = req.files.songImage?.[0]?.filename;
    const artistImage =
      req.files?.artistImage?.[0]?.path || DEFAULT_ARTIST_IMAGE;
    const albumImage = req.files?.albumImage?.[0]?.path || DEFAULT_ALBUM_IMAGE;
    const audioFile = req.files?.audioFile?.[0]?.path;
    const audioFilePublicId = req.files.audioFile?.[0]?.filename;

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
      songImagePublicId,
      audioFile,
      audioFilePublicId,
    });

    albumdata = await Album.create({
      albumName,
      albumImage,
      albumSong: songdata._id,
    });

    await Artist.create({
      artistName,
      artistImage,
      artistSong: songdata._id,
      artistAlbum: albumdata._id,
    });

    await Playlist.create({
      playlistName: playlist,
      playlistSong: songdata._id,
    });

    return res.status(200).json({
      message: "album uploaded successfully",
      songdata,
    });
  } catch (error) {
    console.error("Upload song error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const dashboardCount = async (req, res) => {
  try {
    res.status(200).json({
      totalSongs: await Music.countDocuments(),
      totalAlbums: await Album.countDocuments(),
      totalPlaylists: await Playlist.countDocuments(),
      totalArtists: await Artist.countDocuments(),
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllSongs = async (req, res) => {
  try {
    const musics = await Music.find().lean();

    // Optionally populate artistName based on artistSong field
    const artists = await Artist.find().lean();

    const enriched = musics.map((music) => {
      const artist = artists.find(
        (a) => String(a.artistSong) === String(music._id)
      );
      return {
        ...music,
        singer: artist?.artistName || "Unknown",
      };
    });

    res.json(enriched);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching music", error: err.message });
  }
};

const deleteSong = async (req, res) => {
  try {
    const song = await Music.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Music not found" });

    const deletions = [];

    if (song.songImagePublicId) {
      deletions.push(cloudinary.uploader.destroy(song.songImagePublicId));
    }

    if (song.audioFilePublicId) {
      deletions.push(
        cloudinary.uploader.destroy(song.audioFilePublicId, {
          resource_type: "video",
        })
      );
    }

    await Promise.all(deletions);
    await Artist.deleteMany({ artistSong: req.params.id });
    await Album.deleteMany({ albumSong: req.params.id });
    await Playlist.deleteMany({ playlistSong: req.params.id });
    await Music.findByIdAndDelete(req.params.id);

    res.json({ message: "Music deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting music", error: err.message });
  }
};

module.exports = {
  uploadSong,
  addAlbum,
  dashboardCount,
  getAllSongs,
  deleteSong,
};
