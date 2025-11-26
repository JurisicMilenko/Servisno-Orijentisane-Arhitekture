const express = require('express');
const router = express.Router();
const controller = require('../controllers/tourRatingController');
const authenticate = require('../middlewares/authenticate');

// Add rating
router.post('/:tourId/ratings', authenticate, controller.rateTour);

// Get ratings by tour
router.get('/:tourId/ratings', controller.getTourRatings);

module.exports = router;
