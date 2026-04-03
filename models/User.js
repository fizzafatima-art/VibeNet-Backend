const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, "Username is required"], 
        unique: true,
        trim: true // Faltu spaces remove karne ke liye
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, 
        lowercase: true, // Email hamesha small letters mein save hoga
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    },
    profilePic: { 
        type: String, 
        default: "" 
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notifications: [{
        sender: { type: String },
        message: { type: String },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now } // Notification time ke liye
    }]
}, { timestamps: true });

// ✅ Ye line unique indexes ke masle hal karti hai
userSchema.set('autoIndex', true);

module.exports = mongoose.model('User', userSchema);