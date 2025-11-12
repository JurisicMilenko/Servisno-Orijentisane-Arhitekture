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

const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  authorId: {
    type: Number,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  keyPoints: [KeyPointSchema],
  duration: {
    type: Number, // duration in hours
    default: 0
  },
  distance: {
    type: Number, // distance in kilometers
    default: 0
  }
}, { timestamps: true });

// Indexes for better query performance
TourSchema.index({ authorId: 1, status: 1 });
TourSchema.index({ status: 1, createdAt: -1 });

// Virtual for key points count
TourSchema.virtual('keyPointsCount').get(function() {
  return this.keyPoints.length;
});

// Ensure virtuals are included in JSON
TourSchema.set('toJSON', { virtuals: true });
TourSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tour', TourSchema);
