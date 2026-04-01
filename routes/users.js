const router = require('express').Router();
const User = require('../models/User');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cloudinary Storage (Vercel ke liye best hai)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'vibenet_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. GET SUGGESTIONS (Ab ye chalega kyunki index.js mein link ho gaya hai)
// routes/users.js
router.get('/suggestions', async (req, res) => {
    try {
        // Sab users ko find karein (Hassan ke ilawa)
        // select() se wahi fields lein jo zaroori hain
        const users = await User.find().select("username profilePic email");
        
        console.log("Users found in DB:", users.length); // Backend terminal mein check karein
        res.status(200).json(users);
    } catch (err) { 
        console.error("Route Error:", err);
        res.status(500).json(err); 
    }
});


// 2. PROFILE PICTURE UPLOAD
router.post('/upload-profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { userId } = req.body;
        if (!req.file) return res.status(400).json("No file uploaded.");

        const imageUrl = req.file.path; // Cloudinary secure URL

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: imageUrl },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Cloudinary upload failed", error: err });
    }
});

// 3. SEARCH USERS
router.get("/search/:username", async (req, res) => {
    try {
        const query = req.params.username;
        const users = await User.find({ 
            username: { $regex: query, $options: "i" } 
        }).select("username profilePic email");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. DELETE ACCOUNT
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Account deleted.");
    } catch (err) {
        res.status(500).json(err);
    }
});

// 5. FOLLOW
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json("User followed!");
            } else {
                res.status(403).json("Already following!");
            }
        } catch (err) { res.status(500).json(err); }
    }
});

module.exports = router;