const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 👈 Yeh 'User' hona chahiye taake populate kaam kare
    required: true,
},
  caption: { type: String, required: true },
  img: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);