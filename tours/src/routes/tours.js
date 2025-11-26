const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const positionController = require('../controllers/positionController');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');

// Public routes (no auth required)
router.get('/', tourController.listTours);
router.get('/published', tourController.getPublishedTours);
router.get('/published/tourist-view', tourController.getPublishedToursForTourists);
router.get('/author/:authorId', tourController.getAuthorTours);
router.get('/:id', optionalAuthenticate, tourController.getTour);

// Protected routes (auth required)
router.post('/', authenticate, tourController.createTour);
router.put('/:id', authenticate, tourController.updateTour);
router.delete('/:id', authenticate, tourController.deleteTour);
router.patch('/:id/publish', authenticate, tourController.publishTour);
router.patch('/:id/archive', authenticate, tourController.archiveTour);
router.patch('/:id/reactivate', authenticate, tourController.reactivateTour);
router.get('/:id/validate-publish', authenticate, tourController.validateForPublish);

// Key points routes (auth required)
router.get('/:tourId/keypoints', tourController.getKeyPoints);
router.post('/:tourId/keypoints', authenticate, tourController.addKeyPoint);
router.put('/:tourId/keypoints/:keyPointId', authenticate, tourController.updateKeyPoint);
router.delete('/:tourId/keypoints/:keyPointId', authenticate, tourController.deleteKeyPoint);

// Position controller stuff
router.get('/position/users/:userId', positionController.getPositionByUserId);
router.get('/position/', positionController.listPositions);
router.put('/position/:id', authenticate, positionController.updatePosition);
router.post('/position/', authenticate, positionController.createEmptyPosition);

module.exports = router;
