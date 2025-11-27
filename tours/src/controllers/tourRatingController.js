const ratingService = require('../services/tourRatingService');

exports.rateTour = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id; // numeric
    const username = req.user?.username || 'Nepoznat korisnik';

    const { rating, comment, dateOfAttendance } = req.body;
    const tourId = req.params.tourId;

    if (!rating) {
      return res.status(400).json({ error: 'Rating is required (1–5)' });
    }

    const newRating = await ratingService.addRating({
      tourId,
      userId,
      username,
      rating,
      comment,
      dateOfAttendance,
      dateOfRating: new Date()
    });

    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTourRatings = async (req, res) => {
  try {
    const tourId = req.params.tourId;
    const ratings = await ratingService.getRatingsByTour(tourId);

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
