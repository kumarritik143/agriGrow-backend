// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require('http');
const socketIo = require('socket.io');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoute");
const adminRoutes = require("./routes/adminRoute");

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle joining chat rooms
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Client joined room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Increase payload size limit - add this before other middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Body parser
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use((req, res, next) => {
  req.io = io;
  next();
});
// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

const chatRoutes = require('./routes/chatRoute');
app.use('/api/chat', chatRoutes);
// Basic route
app.get("/", (req, res) => {
  res.send("AgriGrow API is running...");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});