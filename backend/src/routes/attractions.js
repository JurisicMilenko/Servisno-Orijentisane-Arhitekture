const express = require('express');
const router = express.Router();
const controller = require('../controllers/attractionsController');

router.get('/', controller.listAttractions);
router.get('/:id', controller.getAttraction);

module.exports = router;
