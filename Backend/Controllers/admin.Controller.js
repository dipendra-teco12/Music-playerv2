const cloudinary = require("../config/cloudinaryConfig");
const Music = require("../Models/music.Model");
const Artist = require("../Models/artist.Model");
const Album = require("../Models/album.Model");
const Playlist = require("../Models/playlist.Model");
const User = require("../Models/user.Model");

const mongoose = require("mongoose");

const {
  addSongToPlaylist,
  getUniqueAlbums,
  getUniqueArtists,
  getUniquePlaylists,
} = require("../services/adminServices");

const uploadSong = async (req, res) => {
  try {
    const { title, artistName, length, genre, playlist, releaseDate, lyrics } =
      req.body;

    if (!title || !genre || !playlist || !releaseDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const songImage = req.files?.songImage?.[0]?.path;
    const songImagePublicId = req.files?.songImage?.[0]?.filename;

    const artistImage = req.files?.artistImage?.[0]?.path;

    const audioFile = req.files?.audioFile?.[0]?.path;
    const audioFilePublicId = req.files?.audioFile?.[0]?.filename;

    const videoFile = req.files?.videoFile?.[0]?.path;
    const videoFilePublicId = req.files?.videoFile?.[0]?.filename;

    if (!audioFile && !videoFile) {
      return res
        .status(400)
        .json({ message: "Missing audio file or video file" });
    }

    const songdata = await Music.create({
      title,
      length,
      genre,
      releaseDate,
      lyrics,
      songImage,
      songImagePublicId,
      audioFile,
      audioFilePublicId,
      videoFile,
      videoFilePublicId,
      singleTrack: true,
    });

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
      lyrics,
    } = req.body;

    if (!title || !genre || !playlist || !releaseDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const songImage = req.files?.songImage?.[0]?.path;
    const songImagePublicId = req.files?.songImage?.[0]?.filename;
    const artistImage = req.files?.artistImage?.[0]?.path;
    const albumImage = req.files?.albumImage?.[0]?.path;
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
      lyrics,
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

const updateSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const {
      title,
      artistName,
      albumName,
      length,
      genre,
      playlist,
      releaseDate,
      lyrics,
    } = req.body;

    if (!title || !genre || !releaseDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const song = await Music.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    song.title = title;
    song.length = length;
    song.genre = genre;
    song.releaseDate = releaseDate;
    song.lyrics = lyrics;

    if (req.files?.songImage) {
      song.songImage = req.files.songImage[0].path;
      song.songImagePublicId = req.files.songImage[0].filename;
    }
    if (req.files?.audioFile) {
      song.audioFile = req.files.audioFile[0].path;
      song.audioFilePublicId = req.files.audioFile[0].filename;
    }

    await song.save();

    const normAlbum = albumName?.trim().toLowerCase();
    const currentAlbum = await Album.findOne({ albumSong: song._id });
    let targetAlbum = currentAlbum;

    if (normAlbum) {
      if (currentAlbum && currentAlbum.albumName.toLowerCase() !== normAlbum) {
        currentAlbum.albumSong.pull(song._id);
        await currentAlbum.save();
        targetAlbum = null;
      }

      if (!targetAlbum) {
        targetAlbum = await Album.findOne({
          albumName: { $regex: `^${normAlbum}$`, $options: "i" },
        });
      }

      if (targetAlbum) {
        if (!targetAlbum.albumSong.includes(song._id)) {
          targetAlbum.albumSong.push(song._id);
          await targetAlbum.save();
        }
      } else {
        const albumImage = req.files?.albumImage?.[0]?.path;
        targetAlbum = await Album.create({
          albumName: albumName.trim(),
          albumImage,
          albumSong: [song._id],
        });
      }
    }

    const normArtist = artistName?.trim().toLowerCase();
    const currentArtist = await Artist.findOne({ artistSong: song._id });
    let targetArtist = currentArtist;

    if (normArtist) {
      if (
        currentArtist &&
        currentArtist.artistName.toLowerCase() !== normArtist
      ) {
        currentArtist.artistSong.pull(song._id);
        currentArtist.artistAlbum.pull(targetAlbum?._id);
        await currentArtist.save();
        targetArtist = null;
      }

      if (!targetArtist) {
        targetArtist = await Artist.findOne({
          artistName: { $regex: `^${normArtist}$`, $options: "i" },
        });
      }

      if (targetArtist) {
        if (!targetArtist.artistSong.includes(song._id))
          targetArtist.artistSong.push(song._id);
        if (targetAlbum && !targetArtist.artistAlbum.includes(targetAlbum._id))
          targetArtist.artistAlbum.push(targetAlbum._id);
        await targetArtist.save();
      } else {
        const artistImage = req.files?.artistImage?.[0]?.path;
        await Artist.create({
          artistName: artistName.trim(),
          artistImage,
          artistSong: [song._id],
          artistAlbum: targetAlbum ? [targetAlbum._id] : [],
        });
      }
    }

    if (playlist) {
      await addSongToPlaylist(playlist, song._id);
    }

    return res.status(200).json({
      message: "Song updated successfully",
      song,
    });
  } catch (error) {
    console.error("Update song error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
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

    const filter = title ? { title: { $regex: title, $options: "i" } } : {};

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

    const playlist = await Playlist.findById(playlistId).populate({
      path: "playlistSong",
      options: { sort: { releaseDate: -1 } },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

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

const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const song = await Music.findById(songId);
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

    if (song.videoFilePublicId) {
      deletions.push(
        cloudinary.uploader.destroy(song.videoFilePublicId, {
          resource_type: "video",
        })
      );
    }
    await Promise.all(deletions);

    await Artist.updateMany(
      { artistSong: songId },
      { $pull: { artistSong: songId } }
    );

    await Album.updateMany(
      { albumSong: songId },
      { $pull: { albumSong: songId } }
    );

    await Playlist.updateMany(
      { playlistSong: songId },
      { $pull: { playlistSong: songId } }
    );

    await Music.findByIdAndDelete(songId);

    res.json({ message: "Music deleted successfully" });
  } catch (err) {
    console.error("Error deleting music:", err);
    res
      .status(500)
      .json({ message: "Error deleting music", error: err.message });
  }
};
const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    if (!albumId) {
      return res.status(400).json({ message: "albumid is missing" });
    }
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      return res.status(400).json({ message: "Invalid albumId format" });
    }

    const album = await Album.findOneAndDelete({ _id: albumId });

    await Artist.updateMany(
      { artistAlbum: albumId },
      { $pull: { artistAlbum: albumId } }
    );

    if (!album) {
      return res
        .status(404)
        .json({ message: "Album not found or already deleted" });
    }

    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!playlistId) {
      return res.status(400).json({ message: "playlist id is missing" });
    }
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlistId format" });
    }

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId });
    if (!playlist)
      return res
        .status(404)
        .json({ message: "Playlist not found or  already deleted" });

    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSongData = async (songId) => {
  try {
    let songData = null;
    if (songId) {
      songData = await Music.findById(songId);
      if (!songData) return res.status(404).json({ message: "Song not found" });

      const playlists = await Playlist.find({ playlistSong: songId }).select(
        "playlistName"
      );
      const albums = await Album.find({ albumSong: songId }).select(
        "albumName"
      );
      const artists = await Artist.find({ artistSong: songId }).select(
        "artistName"
      );

      const playlistNames = playlists.map((p) => p.playlistName);
      const albumNames = albums.map((a) => a.albumName);
      const artistNames = artists.map((a) => a.artistName);

      const song = {
        songId: songData._id,
        title: songData.title,
        genre: songData.genre,
        length: songData.length,
        releaseDate: songData.releaseDate.toISOString().slice(0, 10),
        lyrics: songData.lyrics,
        playlistNames,
        albumNames,
        artistNames,
      };

      return song;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("fullName email role");
    if (users.length === 0) {
      res.status(200).json({ message: "did not found any user" });
    }

    req.primeusers = users;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const PrivacyPolicy = require("../Models/privacyPolicy");

const privacyPolicy = async (req, res) => {
  try {
    const { html } = req.body;

    // Optional: Only one policy in DB? Then update existing
    let policy = await PrivacyPolicy.findOne();
    if (policy) {
      policy.html = html;
      await policy.save();
    } else {
      policy = await PrivacyPolicy.create({ html });
    }

    res.status(200).json({ message: "Privacy policy saved." });
  } catch (err) {
    console.error("Error saving privacy policy:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPolicy = async (req, res) => {
  try {
    let policy = await PrivacyPolicy.findOne();

    res
      .status(200)
      .json({ message: "Privacy policy fetched Successfully.", policy });
  } catch (err) {
    console.error("Error fetching privacy policy:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  uploadSong,
  addAlbum,
  updateSong,
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
  deleteAlbum,
  deletePlaylist,
  getSongData,

  privacyPolicy,
  getPolicy,
  getAllUsers,
};
