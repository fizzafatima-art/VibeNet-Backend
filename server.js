const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const Message = require('./models/Message'); // Ensure aapka Message model bana hua hai

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());
app.use(express.json());
// Server check karne ke liye root route
app.get("/", (req, res) => {
    res.send("VibeNet Backend is running successfully! 🚀");
});
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Connected ✅"))
    .catch((err) => console.log("DB Error: ", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users')); 
// Messages fetch/save karne ke liye route lazmi add karein
app.use('/api/messages', require('./routes/messages')); 

// --- Socket.io Logic (Private Messaging) ---
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // 1. User ko uski ID wale room mein join karwayein
    socket.on("join", (userId) => {
        if (userId) {
            socket.join(userId);
            console.log("User joined private room: " + userId);
        }
    });

    // 2. Private Message Sending
    socket.on("send_message", async (data) => {
        try {
            // Option: Aap yahan bhi DB mein save kar sakti hain
            // Lekin behtar hai ke Frontend se axios.post ho aur socket sirf UI update kare
            
            // Sirf us bande ko bhejein jis ki ID data.receiver mein hai
            io.to(data.receiver).emit("receive_message", data);
            
            console.log(`Message sent from ${data.sender} to room ${data.receiver}`);
        } catch (err) {
            console.log("Socket Error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Static folder for images
app.use("/images", express.static(path.join(__dirname, "public/images")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));