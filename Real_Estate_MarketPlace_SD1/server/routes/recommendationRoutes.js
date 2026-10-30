const express = require('express');
const route = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getRecommendations,
    recordSearch,
    getSimilarProperties,
    getTrendingProperties
} = require('../Controller/recommendationController');

route.get('/recommendations', authMiddleware, getRecommendations);
route.post('/record-search', authMiddleware, recordSearch);
route.get('/similar/:propertyId', getSimilarProperties);
route.get('/trending', getTrendingProperties);

module.exports = route;
