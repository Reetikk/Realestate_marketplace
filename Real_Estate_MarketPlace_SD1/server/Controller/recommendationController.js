const Property = require('../models/Property');
const UserPreference = require('../models/UserPreference');

// Get recommendations for user
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        let userPrefs = await UserPreference.findOne({ user: userId });

        if (!userPrefs) {
            // Return random properties if no preferences yet
            const properties = await Property.find()
                .populate('postedBy', 'name email')
                .limit(parseInt(limit));
            return res.status(200).json(properties);
        }

        let query = {};

        // Based on search history
        if (userPrefs.searchHistory.length > 0) {
            const lastSearch = userPrefs.searchHistory[userPrefs.searchHistory.length - 1];
            if (lastSearch.city) query.city = lastSearch.city;
            if (lastSearch.priceMin && lastSearch.priceMax) {
                query.price = {
                    $gte: lastSearch.priceMin,
                    $lte: lastSearch.priceMax
                };
            }
        }

        // Based on preferences
        if (userPrefs.preferredLocations.length > 0) {
            query.city = { $in: userPrefs.preferredLocations };
        }

        if (userPrefs.preferredPropertyTypes.length > 0) {
            query.property_type = { $in: userPrefs.preferredPropertyTypes };
        }

        const recommendations = await Property.find(query)
            .populate('postedBy', 'name email')
            .limit(parseInt(limit));

        res.status(200).json(recommendations);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Record search activity
const recordSearch = async (req, res) => {
    try {
        const userId = req.user.id;
        const { city, priceMin, priceMax, bedrooms, propertyType } = req.body;

        let userPrefs = await UserPreference.findOne({ user: userId });

        if (!userPrefs) {
            userPrefs = new UserPreference({
                user: userId,
                searchHistory: [{
                    city,
                    priceMin,
                    priceMax,
                    bedrooms,
                    propertyType
                }]
            });
        } else {
            userPrefs.searchHistory.push({
                city,
                priceMin,
                priceMax,
                bedrooms,
                propertyType
            });
        }

        await userPrefs.save();
        res.status(200).json(userPrefs);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get similar properties
const getSimilarProperties = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { limit = 5 } = req.query;

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const similar = await Property.find({
            _id: { $ne: propertyId },
            city: property.city,
            property_type: property.property_type,
            price: {
                $gte: property.price * 0.8,
                $lte: property.price * 1.2
            }
        }).populate('postedBy', 'name email')
            .limit(parseInt(limit));

        res.status(200).json(similar);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get trending properties
const getTrendingProperties = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const trending = await Property.find()
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json(trending);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    getRecommendations,
    recordSearch,
    getSimilarProperties,
    getTrendingProperties
};
