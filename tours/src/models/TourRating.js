const mongoose = require('mongoose');

const tourRatingSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true
    },
    userId: {
      type: Number, // or Schema.Types.ObjectId if referencing Users in Mongo
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ''
    },
    dateOfAttendance: {
      type: Date,
      required: true
    },
    dateOfRating: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Prevent duplicate ratings from same user for same tour
tourRatingSchema.index({ tourId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TourRating', tourRatingSchema);
