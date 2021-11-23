const express = require('express');

const placesControllers = require('../controllers/places-controller');

const HttpError = require('../models/http-error');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlaceByUserId);

module.exports = router;