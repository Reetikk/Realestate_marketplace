const express = require('express');
const route = express.Router();
const {
    getPropertiesForMap,
    calculateDistance,
    geocodeAddress,
    getNearbyProperties
} = require('../Controller/mapController');

route.get('/properties', getPropertiesForMap);
route.post('/distance', calculateDistance);
route.post('/geocode', geocodeAddress);
route.get('/nearby', getNearbyProperties);

module.exports = route;
