const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const authenticate = require('../middlewares/authenticate');

router.get('/users/:userId', positionController.getPositionByUserId);
router.get('/', positionController.nothing);
router.post('/', authenticate, positionController.createEmptyPosition);

module.exports = router;