const mongoose = require("mongoose");
const Playlist = require("../Models/playlist.Model");

const userPlaylist = async (req, res) => {
  try {
    const { playlistName } = req.body;
    if (!playlistName) {
      return res.status(400).json({ message: "Playlist Name is Required" });
    }

    const userId = req.user._id;

    const exists = await Playlist.findOne({
      playlistName,
      userPlayList: userId,
    });

    if (exists) {
      return res.status(409).json({
        message: `${playlistName} is already exits. Rename The Playlist Name`,
      });
    }

    const userPlayList = await Playlist.create({
      playlistName,
      userPlayList: userId,
    });

    res.status(201).json({
      message: `${playlistName} is created successfully`,
      userPlayList,
    });
  } catch (error) {
    console.error("Error while Creating User Playlist", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addSongInPlaylist = async (req, res) => {
  try {
    const { songId, playlistId } = req.body;

    if (!songId || !playlistId) {
      return res
        .status(400)
        .json({ message: "playlist id and Song id Required" });
    }

    const playlist = await Playlist.findOne({ _id: playlistId });

    if (playlist) {
      if (!playlist.playlistSong.includes(songId)) {
        playlist.playlistSong.push(songId);
        await playlist.save();
      } else {
        return res
          .status(409)
          .json({ message: "Song Already Exits in This Playlist" });
      }
    }

    res.status(200).json({ message: `Song added in the playlist`, playlist });
  } catch (error) {
    console.error("Error while adding song in the playlist", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId, playlistId } = req.body;

    if (!songId || !playlistId) {
      return res
        .status(400)
        .json({ message: "playlist id and Song id Required" });
    }

    const playlist = await Playlist.findOne({ _id: playlistId });

    if (playlist) {
      if (playlist.playlistSong.includes(songId)) {
        playlist.playlistSong.pull(songId);
        await playlist.save();
      } else {
        return res
          .status(409)
          .json({ message: "Song Already Removed From The Playlist" });
      }
    }

    res
      .status(200)
      .json({ message: `Song Successfully Removed From Playlist`, playlist });
  } catch (error) {
    console.error("Error while removing song from the  playlist", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSongsOfPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist id is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist id" });
    }

    const playlist = await Playlist.findOne({ _id: playlistId }).populate(
      "playlistSong",
      "-singleTrack -lyrics -createdAt -updatedAt"
    );

    if (playlist.playlistSong.length === 0) {
      return res.status(200).json({ message: "No Song in the playlist" });
    }
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json({
      message: "Successfully fetched playlist songs",
      playlist,
    });
  } catch (error) {
    console.error("Error while getting Playlist songs", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId) {
      return res.status(400).json({ message: "Playlist Id is required" });
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete({
      _id: playlistId,
    });

    res
      .status(200)
      .json({ message: "playlist Successfully Deleted", deletedPlaylist });
  } catch (error) {
    console.log("Error while deleting playlist", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  userPlaylist,
  addSongInPlaylist,
  getSongsOfPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
};
