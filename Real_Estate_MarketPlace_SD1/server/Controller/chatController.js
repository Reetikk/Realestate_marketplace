const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get or create conversation
const getOrCreateConversation = async (req, res) => {
    try {
        const { recipientId, propertyId } = req.body;
        const userId = req.user.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [userId, recipientId] }
        }).populate('participants', 'name email').populate('property');

        if (!conversation) {
            conversation = new Conversation({
                participants: [userId, recipientId],
                property: propertyId
            });
            await conversation.save();
            await conversation.populate('participants', 'name email');
            await conversation.populate('property');
        }

        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all conversations for user
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId
        }).populate('participants', 'name email avatar')
            .populate('property', 'title image price')
            .sort({ lastMessageTime: -1 });

        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const sender = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const receiver = conversation.participants.find(id => id.toString() !== sender.toString());

        const message = new Message({
            conversationId,
            sender,
            receiver,
            text
        });

        await message.save();

        // Update conversation's last message
        conversation.lastMessage = text;
        conversation.lastMessageTime = Date.now();
        await conversation.save();

        const populatedMessage = await message.populate('sender', 'name email avatar');

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get messages for conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email avatar')
            .sort({ createdAt: 1 });

        // Mark as read
        await Message.updateMany(
            { conversationId, receiver: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get unread messages count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const unreadCount = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.status(200).json({ unreadCount });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    getOrCreateConversation,
    getConversations,
    sendMessage,
    getMessages,
    getUnreadCount
};
