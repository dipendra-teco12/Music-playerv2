const mongoose = require('mongoose');

const favoriteSongSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',        
    required: true
  },    
    songId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music',        
        required: true
    },

},{
    timestamps: true
}); 
const FavoriteSong = mongoose.model('FavoriteSong', favoriteSongSchema);
module.exports = FavoriteSong;