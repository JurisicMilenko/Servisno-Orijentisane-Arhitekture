const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticate = require('../middlewares/authenticate');

// Public routes (no auth required)
router.get('/', tourController.listTours);
router.get('/author/:authorId', tourController.getAuthorTours);
router.get('/:id', tourController.getTour);

// Protected routes (auth required)
router.post('/', authenticate, tourController.createTour);
router.put('/:id', authenticate, tourController.updateTour);
router.delete('/:id', authenticate, tourController.deleteTour);
router.patch('/:id/publish', authenticate, tourController.publishTour);

// Key points routes (auth required)
router.get('/:tourId/keypoints', tourController.getKeyPoints);
router.post('/:tourId/keypoints', authenticate, tourController.addKeyPoint);
router.put('/:tourId/keypoints/:keyPointId', authenticate, tourController.updateKeyPoint);
router.delete('/:tourId/keypoints/:keyPointId', authenticate, tourController.deleteKeyPoint);

module.exports = router;
