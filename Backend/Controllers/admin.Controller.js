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

const UniqueAlbumsCount = async (req, res) => {
  try {
    const albums = await Album.find().populate("albumSong");

    const uniqueAlbumsMap = {};
    const uniqueAlbums = albums.filter((album) => {
      if (!uniqueAlbumsMap[album.albumName]) {
        uniqueAlbumsMap[album.albumName] = true;
        return true;
      }
      return false;
    });

    return uniqueAlbums.length;
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UniqueArtistCount = async (req, res) => {
  try {
    const artist = await Artist.find().populate("artistSong");

    const uniqueArtistMap = {};
    const uniqueArtist = artist.filter((artist) => {
      if (!uniqueArtistMap[artist.artistName]) {
        uniqueArtistMap[artist.artistName] = true;
        return true;
      }
      return false;
    });

    return uniqueArtist.length;
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const dashboardCount = async (req, res) => {
  try {
    res.status(200).json({
      totalSongs: await Music.countDocuments(),
      totalAlbums: await UniqueAlbumsCount(),
      totalPlaylists: 5,
      totalArtists: await UniqueArtistCount(),
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

const UniqueAlbums = async (req, res) => {
  try {
    // Fetch all albums with their populated songs
    const albums = await Album.find().populate("albumSong");

    // Filter out unique albums by albumName
    const uniqueAlbumsMap = {};
    const uniqueAlbums = albums.filter((album) => {
      if (!uniqueAlbumsMap[album.albumName]) {
        uniqueAlbumsMap[album.albumName] = true;
        return true;
      }
      return false;
    });

    // Get all album IDs for the filtered unique albums
    const albumIds = uniqueAlbums.map((album) => album._id);

    // Find all artists related to those albums
    const relatedArtists = await Artist.find({
      artistAlbum: { $in: albumIds },
    });

    // Return both unique albums and related artists
    res.json({ uniqueAlbums, relatedArtists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const albumRelatedSongs = async (req, res) => {
  try {
    const albumId = req.query.albumId;

    if (!albumId) {
      return res.status(400).json({ error: "albumId is required" });
    }

    // Fetch album and populate albumSong
    const album = await Album.findById(albumId).populate("albumSong");

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    // Find the artist related to this album
    const artist = await Artist.findOne({ artistAlbum: albumId });

    res.json({
      album,
      artist: artist || null,
    });
  } catch (err) {
    console.error("Error fetching album details:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  uploadSong,
  addAlbum,
  dashboardCount,
  getAllSongs,
  deleteSong,
  UniqueAlbums,
  albumRelatedSongs,
};
