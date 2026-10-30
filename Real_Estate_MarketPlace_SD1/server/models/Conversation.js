const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    lastMessage: {
        type: String
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
