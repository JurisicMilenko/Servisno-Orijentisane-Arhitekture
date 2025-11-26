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
    return await TourRating.find({ tourId }).sort({ createdAt: -1 });
  } catch (err) {
    throw new Error('Failed to fetch ratings: ' + err.message);
  }
};

// Optional: Get average rating
exports.getAverageRating = async (tourId) => {
  const result = await TourRating.aggregate([
    { $match: { tourId: mongoose.Types.ObjectId(tourId) }},
    { $group: { _id: null, avgRating: { $avg: "$rating" }}}
  ]);

  return result.length > 0 ? result[0].avgRating : null;
};
