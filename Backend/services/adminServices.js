const Playlist = require("../Models/playlist.Model");
const Album = require("../Models/album.Model");
const Artist = require("../Models/artist.Model");

const addSongToPlaylist = async (playlistName, songId) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { playlistName },
      { $addToSet: { playlistSong: songId } },
      { upsert: true, new: true }
    );

    if (!playlist) {
      throw new Error("Failed to add song to playlist");
    }

    return playlist;
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    throw error;
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
module.exports = {
  addSongToPlaylist,
  getUniqueAlbums,
  getUniqueArtists,
  getUniquePlaylists,
};
