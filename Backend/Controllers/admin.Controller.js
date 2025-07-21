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

async function addSongToPlaylist(playlistName, songId) {
  return Playlist.findOneAndUpdate(
    { playlistName },
    { $addToSet: { playlistSong: songId } },
    { upsert: true, new: true }
  );
}

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
    const songImagePublicId = req.files?.songImage?.[0]?.filename;

    const artistImage =
      req.files?.artistImage?.[0]?.path || DEFAULT_ARTIST_IMAGE;

    const audioFile = req.files?.audioFile?.[0]?.path;
    const audioFilePublicId = req.files?.audioFile?.[0]?.filename;

    if (!audioFile) {
      return res.status(400).json({ message: "Missing audio file" });
    }

    // Create the song
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

    // Normalize and check artist
    if (artistName) {
      const normalizedName = artistName.trim().toLowerCase();

      let artist = await Artist.findOne({
        artistName: { $regex: `^${normalizedName}$`, $options: "i" },
      });

      if (artist) {
        if (!artist.artistSong.includes(songdata._id)) {
          artist.artistSong.push(songdata._id);
          await artist.save();
        }
      } else {
        await Artist.create({
          artistName: artistName.trim(),
          artistImage,
          artistSong: [songdata._id],
        });
      }
    }

    await addSongToPlaylist(playlist, songdata._id);

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
    const songImagePublicId = req.files?.songImage?.[0]?.filename;
    const artistImage =
      req.files?.artistImage?.[0]?.path || DEFAULT_ARTIST_IMAGE;
    const albumImage = req.files?.albumImage?.[0]?.path || DEFAULT_ALBUM_IMAGE;
    const audioFile = req.files?.audioFile?.[0]?.path;
    const audioFilePublicId = req.files?.audioFile?.[0]?.filename;

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

    const normalizedAlbumName = albumName.trim().toLowerCase();
    let albumdata = await Album.findOne({
      albumName: { $regex: `^${normalizedAlbumName}$`, $options: "i" },
    });

    if (albumdata) {
      albumdata.albumSong.push(songdata._id);
      await albumdata.save();
    } else {
      albumdata = await Album.create({
        albumName: albumName.trim(),
        albumImage,
        albumSong: [songdata._id],
      });
    }

    const normalizedArtistName = artistName.trim().toLowerCase();
    let artistdata = await Artist.findOne({
      artistName: { $regex: `^${normalizedArtistName}$`, $options: "i" },
    });

    if (artistdata) {
      if (!artistdata.artistSong.includes(songdata._id)) {
        artistdata.artistSong.push(songdata._id);
      }

      if (!artistdata.artistAlbum.includes(albumdata._id)) {
        artistdata.artistAlbum.push(albumdata._id);
      }

      await artistdata.save();
    } else {
      await Artist.create({
        artistName: artistName.trim(),
        artistImage,
        artistSong: [songdata._id],
        artistAlbum: [albumdata._id],
      });
    }

    await addSongToPlaylist(playlist, songdata._id);

    return res.status(200).json({
      message: "Album uploaded successfully",
      songdata,
    });
  } catch (error) {
    console.error("Upload song error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUniqueAlbums = async () => {
  const uniqueAlbums = await Album.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$albumName",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  return uniqueAlbums;
};

const getUniqueArtists = async () => {
  const uniqueArtists = await Artist.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$artistName",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  return uniqueArtists;

  return result[0]?.uniqueArtistCount || 0;
};

const getUniquePlaylists = async () => {
  const uniquePlaylists = await Playlist.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $toLower: "$playlistName" },
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);
  return uniquePlaylists;
};
const dashboardCount = async (req, res) => {
  try {
    const uniqueAlbums = await getUniqueAlbums();
    const uniquePlaylists = await getUniquePlaylists();
    const uniqueArtists = await getUniqueArtists();

    res.status(200).json({
      totalSongs: await Music.countDocuments(),
      totalAlbums: uniqueAlbums.length,
      totalPlaylists: uniquePlaylists.length,
      totalArtists: uniqueArtists.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllSongs = async (req, res) => {
  try {
    const { title } = req.query;

    const filter = title
      ? { title: { $regex: title, $options: "i" } } // case-insensitive search
      : {};

    const musics = await Music.find(filter).lean();
    const artists = await Artist.find().lean();

    // Create a map of songId to artist name
    const songArtistMap = new Map();

    artists.forEach((artist) => {
      const songs = Array.isArray(artist.artistSong)
        ? artist.artistSong
        : [artist.artistSong];

      songs.forEach((songId) => {
        songArtistMap.set(String(songId), artist.artistName);
      });
    });

    // Enrich songs with singer name
    const enriched = musics.map((music) => ({
      ...music,
      singer: songArtistMap.get(String(music._id)) || "Unknown",
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching songs:", err);
    res
      .status(500)
      .json({ message: "Error fetching music", error: err.message });
  }
};

const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const song = await Music.findById(songId);
    if (!song) return res.status(404).json({ message: "Music not found" });

    // Delete from Cloudinary if present
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

    // Remove song reference from Artist(s)
    await Artist.updateMany(
      { artistSong: songId },
      { $pull: { artistSong: songId } }
    );

    // Remove song reference from Album(s)
    await Album.updateMany(
      { albumSong: songId },
      { $pull: { albumSong: songId } }
    );

    // Remove song from Playlist(s)
    await Playlist.updateMany(
      { playlistSong: songId },
      { $pull: { playlistSong: songId } }
    );

    // Delete the song
    await Music.findByIdAndDelete(songId);

    res.json({ message: "Music deleted successfully" });
  } catch (err) {
    console.error("Error deleting music:", err);
    res
      .status(500)
      .json({ message: "Error deleting music", error: err.message });
  }
};

const UniqueAlbums = async (req, res) => {
  try {
    const uniqueAlbums = await getUniqueAlbums();

    const albumIds = uniqueAlbums.map((a) => a._id);
    const relatedArtists = await Artist.find({
      artistAlbum: { $in: albumIds },
    });

    res.json({
      uniqueAlbums,
      relatedArtists,
      totalUniqueAlbums: uniqueAlbums.length,
    });
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

const UniquePlaylists = async (req, res) => {
  try {
    const uniquePlaylists = await getUniquePlaylists();
    res.json({ uniquePlaylists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const UniqueArtist = async (req, res) => {
  try {
    const uniqueArtists = await getUniqueArtists();
    res.json({ uniqueArtists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSongsByAlbum = async (req, res) => {
  try {
    const { albumId } = req.query;
    if (!albumId) {
      return res.status(400).json({ error: "albumId query is required" });
    }

    const album = await Album.findById(albumId).populate({
      path: "albumSong",
    });

    const artist = await Artist.findOne({ artistAlbum: albumId });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    res.json({
      albumName: album.albumName,
      songs: album.albumSong,
      artistName: artist ? artist.artistName : "Unknown Artist",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSongsByPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.query;
    if (!playlistId) {
      return res.status(400).json({ error: "playlistId is required" });
    }

    // Populate the correct field: playlistSong
    const playlist = await Playlist.findById(playlistId).populate({
      path: "playlistSong",
      options: { sort: { releaseDate: -1 } },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Playlist.title may not exist; likely it's playlist.playlistName
    res.json({
      title: playlist.playlistName,
      songs: playlist.playlistSong,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const artistAlbums = async (req, res) => {
  try {
    const { artistId } = req.query;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required." });
    }

    const artist = await Artist.findById(artistId).populate("artistAlbum");

    if (!artist) {
      return res.status(404).json({ message: "Artist not found." });
    }

    res.status(200).json({
      artistName: artist.artistName,
      artistId: artist._id,
      albums: artist.artistAlbum || [],
    });
  } catch (err) {
    console.error("Error fetching artist albums:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uploadSong,
  addAlbum,
  dashboardCount,
  getAllSongs,
  deleteSong,
  UniqueAlbums,
  UniqueArtist,
  albumRelatedSongs,
  UniquePlaylists,
  getSongsByAlbum,
  getSongsByPlaylist,
  artistAlbums,
};
