const express = require('express');
const route = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getOrCreateConversation,
    getConversations,
    sendMessage,
    getMessages,
    getUnreadCount
} = require('../Controller/chatController');

route.post('/conversation', authMiddleware, getOrCreateConversation);
route.get('/conversations', authMiddleware, getConversations);
route.post('/message', authMiddleware, sendMessage);
route.get('/messages/:conversationId', authMiddleware, getMessages);
route.get('/unread-count', authMiddleware, getUnreadCount);

module.exports = route;
