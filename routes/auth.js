const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        // 1. Pehle check karein ke user pehle se exist to nahi karta
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        // 2. Password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Naya User banayein
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            // profilePic field agar Model mein required hai to yahan empty string bhejien
            profilePic: req.body.profilePic || "" 
        });

        const user = await newUser.save();
        const { password, ...others } = user._doc; // Password hide karke baki data bhejein
        res.status(200).json(others);

   } catch (err) {
    console.error("Signup Detail Error:", err); // Server console dekhein
    res.status(500).json({ message: "Registration failed", error: err.message });
}
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Wrong password!" });

        // Token generation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "mysecretkey");
        
        const { password, ...others } = user._doc;
        res.status(200).json({ token, user: others });
    } catch (err) {
        res.status(500).json({ message: "Login Error", error: err.message });
    }
});

module.exports = router;