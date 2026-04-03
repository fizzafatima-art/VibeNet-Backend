const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);

// ✅ Socket.io CORS Fix (Allowing all for stability)
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

// ✅ Dynamic CORS Configuration
// Ye aapke har Vercel link ko khud hi allow kar dega
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "https://vibenet-frontent.vercel.app", 
            "http://localhost:3000"
        ];
        // Allow if origin is in list, or matches a vercel preview link, or is local
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Root Route for Health Check
app.get("/", (req, res) => {
    res.send("VibeNet Backend is running successfully! 🚀");
});

// ✅ Stable MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected ✅"))
  .catch((err) => console.log("DB Error: ", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users')); 
app.use('/api/messages', require('./routes/messages')); 

// Socket.io logic
io.on("connection", (socket) => {
    socket.on("join", (userId) => { 
        if(userId) socket.join(userId); 
    });
    socket.on("send_message", (data) => { 
        io.to(data.receiver).emit("receive_message", data); 
    });
});

// Static folder for images
app.use("/images", express.static(path.join(__dirname, "public/images")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));