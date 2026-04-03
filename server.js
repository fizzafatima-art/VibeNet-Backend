const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: ["https://vibenet-frontent.vercel.app", "http://localhost:3000"] } 
});

// ✅ Better CORS Configuration
app.use(cors({
    origin: ["https://vibenet-frontent.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

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

// Socket.io logic same rahegi...
io.on("connection", (socket) => {
    socket.on("join", (userId) => { if(userId) socket.join(userId); });
    socket.on("send_message", (data) => { io.to(data.receiver).emit("receive_message", data); });
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));