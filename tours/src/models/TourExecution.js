const mongoose = require('mongoose');

const KeyPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  imageUrl: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true, timestamps: true });

const TourExecutionSchema = new mongoose.Schema({
  tourId: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  completedCheckpoints: [KeyPointSchema],
  status: {
    type: String,
    enum: ['not started', 'in progress', 'completed'],
    default: 'not started',
    index: true
  }
}, { _id: true, timestamps: true });

module.exports = mongoose.model('TourExecution', TourExecutionSchema);