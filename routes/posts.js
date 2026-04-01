const router = require('express').Router();
const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Storage Engine Setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'vibenet_posts', // Cloudinary mein folder ka naam
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    },
});

const upload = multer({ storage: storage });

// 3. CREATE POST (Now using Cloudinary URL)
router.post("/", async (req, res) => {
  const { userId, caption } = req.body;
  
  // Check karein ke data aa bhi raha hai ya nahi
  if (!userId || !caption) {
    return res.status(400).json("UserId and caption are required!");
  }

  try {
    const newPost = new Post({ userId, caption });
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
// routes/posts.js
// GET ALL POSTS
// routes/posts.js
// routes/posts.js mein ye change karein
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("userId", "username profilePic"); // 👈 Yeh line sab se zaroori hai
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});
// DELETE A POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // userId match karne ke liye .toString() lazmi hai
    if (post.userId.toString() === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted!");
    } else {
      res.status(403).json("Owner match nahi ho raha!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;