const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            text: text
        });
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.params.userId, receiver: req.params.otherId },
                { sender: req.params.otherId, receiver: req.params.userId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
};