const Property = require('../models/Property');
const axios = require('axios');

// Get properties with coordinates for map display
const getPropertiesForMap = async (req, res) => {
    try {
        const { city, propertyType, minPrice, maxPrice } = req.query;

        let query = {};
        if (city) query.city = new RegExp(city, 'i');
        if (propertyType) query.property_type = propertyType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        const properties = await Property.find(query)
            .populate('postedBy', 'name email number');

        // Format properties for map display
        const mapProperties = properties.map(prop => ({
            _id: prop._id,
            title: prop.title,
            price: prop.price,
            address: prop.address,
            city: prop.city,
            state: prop.state,
            property_type: prop.property_type,
            image: prop.image,
            // These would be from geocoding - placeholder values
            latitude: null,
            longitude: null,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            postedBy: prop.postedBy
        }));

        res.status(200).json(mapProperties);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Calculate distance between two locations
const calculateDistance = async (req, res) => {
    try {
        const { origin, destination } = req.body;

        // Using a simple distance calculation
        // In production, you would use Google Maps Distance Matrix API
        // This requires GOOGLE_MAPS_API_KEY in .env

        const distance = {
            origin,
            destination,
            distance: null,
            duration: null,
            message: 'Distance calculation requires Google Maps API key'
        };

        res.status(200).json(distance);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Geocode address to coordinates
const geocodeAddress = async (req, res) => {
    try {
        const { address } = req.body;

        // Placeholder response
        // In production, use Google Maps Geocoding API
        const coordinates = {
            address,
            latitude: null,
            longitude: null,
            message: 'Geocoding requires Google Maps API key'
        };

        res.status(200).json(coordinates);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get nearby properties
const getNearbyProperties = async (req, res) => {
    try {
        const { city, radius = 5 } = req.query;

        // Get properties in the same city (as a simple nearby search)
        const nearbyProperties = await Property.find({ city })
            .populate('postedBy', 'name email')
            .limit(10);

        res.status(200).json(nearbyProperties);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    getPropertiesForMap,
    calculateDistance,
    geocodeAddress,
    getNearbyProperties
};

