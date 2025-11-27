const TourRating = require('../models/TourRating');

exports.addRating = async (data) => {
  try {
    const rating = new TourRating(data);
    await rating.save();
    return rating;
  } catch (err) {
    throw new Error('Failed to add rating: ' + err.message);
  }
};

exports.getRatingsByTour = async (tourId) => {
  try {
    return await TourRating.find({ tourId }).sort({ dateOfRating: -1 });
  } catch (err) {
    throw new Error('Failed to fetch ratings: ' + err.message);
  }
};
