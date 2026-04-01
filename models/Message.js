// models/Message.js
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours (in seconds)
});
module.exports = mongoose.model('Message', messageSchema);