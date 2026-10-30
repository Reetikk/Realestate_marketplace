const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    searchHistory: [{
        city: String,
        priceMin: Number,
        priceMax: Number,
        bedrooms: Number,
        propertyType: String,
        searchedAt: {
            type: Date,
            default: Date.now
        }
    }],
    preferredLocations: [String],
    priceRange: {
        min: Number,
        max: Number
    },
    preferredPropertyTypes: [String],
    preferredBedrooms: [Number],
    bookmarkedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }]
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
