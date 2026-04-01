const router = require('express').Router();
const Message = require('../models/Message');

// 1. Naya message save karne ke liye (POST)
router.post("/", async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. Do users ke darmiyan chat history load karne ke liye (GET)
router.get("/:senderId/:receiverId", async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.params.senderId, receiver: req.params.receiverId },
                { sender: req.params.receiverId, receiver: req.params.senderId },
            ],
        }).sort({ createdAt: 1 }); // Time ke hisab se order karein
        
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;