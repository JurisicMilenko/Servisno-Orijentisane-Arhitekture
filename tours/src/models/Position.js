const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90,
    default: null
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
    default: null
  }
}, { _id: true, timestamps: true });


module.exports = mongoose.model('Position', PositionSchema);
