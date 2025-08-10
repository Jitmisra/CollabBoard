const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config();

const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const Room = require('./models/Room');
const User = require('./models/User');
const memoryStore = require('./utils/memoryStore');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-frontend-domain.railway.app"] 
      : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-frontend-domain.railway.app"] 
    : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whiteboard-app';

const connectDB = async () => {
  // Multiple connection strategies
  const connectionStrategies = [
    // Strategy 1: Simple connection
    { name: 'Simple', uri: MONGODB_URI, options: {} },
    
    // Strategy 2: With basic SSL
    { 
      name: 'SSL Basic', 
      uri: MONGODB_URI, 
      options: { 
        ssl: true,
        serverSelectionTimeoutMS: 10000 
      } 
    },
    
    // Strategy 3: With full SSL options
    { 
      name: 'SSL Full', 
      uri: MONGODB_URI + '&ssl=true&authSource=admin', 
      options: { 
        ssl: true,
        tls: true,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000
      } 
    }
  ];

  for (const strategy of connectionStrategies) {
    try {
      console.log(`🔄 Trying ${strategy.name} connection to MongoDB Atlas...`);
      const conn = await mongoose.connect(strategy.uri, strategy.options);
      console.log('✅ Connected to MongoDB:', conn.connection.host);
      return; // Success, exit function
    } catch (error) {
      console.error(`❌ ${strategy.name} connection failed:`, error.message);
    }
  }

  // All Atlas strategies failed, try local MongoDB
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 All Atlas strategies failed. Attempting local MongoDB...');
    try {
      await mongoose.connect('mongodb://localhost:27017/whiteboard-app');
      console.log('✅ Connected to local MongoDB');
    } catch (localError) {
      console.error('❌ Local MongoDB connection also failed:', localError.message);
      console.log('⚠️  Running without database - data will not persist');
    }
  } else {
    console.log('⚠️  All connection strategies failed. Running without database.');
  }
};

connectDB();

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    port: PORT,
    cors: 'enabled'
  });
});

// Store connected users by room
const roomUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join room event
  socket.on('join-room', async (data) => {
    const { roomId, username } = data;
    
    try {
      // Leave any previous rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          // Remove user from previous room's user list
          if (roomUsers.has(room)) {
            const users = roomUsers.get(room);
            const updatedUsers = users.filter(user => user.socketId !== socket.id);
            roomUsers.set(room, updatedUsers);
            socket.to(room).emit('users-update', updatedUsers);
          }
        }
      });

      // Join new room
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;

      // Add user to room's user list
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, []);
      }
      const users = roomUsers.get(roomId);
      const existingUser = users.find(user => user.socketId === socket.id);
      
      let isNewUser = false;
      if (!existingUser) {
        users.push({ socketId: socket.id, username, joinedAt: new Date() });
        isNewUser = true;
        console.log(`👤 ${username} joined room: ${roomId}`);
      } else {
        console.log(`🔄 ${username} reconnected to room: ${roomId}`);
      }

      // Load and send existing room data (use memory store if DB not available)
      if (mongoose.connection.readyState === 1) {
        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            socket.emit('room-data', {
              whiteboardData: room.whiteboardData,
              notesData: room.notesData
            });
          }
        } catch (dbError) {
          console.log('⚠️  Database error, using memory store for room data');
          const memoryRoom = memoryStore.findRoom(roomId);
          if (memoryRoom) {
            socket.emit('room-data', {
              whiteboardData: memoryRoom.whiteboardData,
              notesData: memoryRoom.notesData
            });
          }
        }
      } else {
        // Use memory store
        const memoryRoom = await memoryStore.findRoom(roomId);
        if (memoryRoom) {
          socket.emit('room-data', {
            whiteboardData: memoryRoom.whiteboardData,
            notesData: memoryRoom.notesData
          });
        }
      }

      // Notify all users in room about user list update
      io.to(roomId).emit('users-update', users);
      
      // Only notify about new user joins, not reconnections
      if (isNewUser) {
        socket.to(roomId).emit('user-joined', { username, timestamp: new Date() });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle drawing events
  socket.on('drawing', (data) => {
    if (socket.roomId) {
      // Broadcast to all other users in the room
      socket.to(socket.roomId).emit('drawing', data);
      
      // Auto-save whiteboard data
      saveWhiteboardData(socket.roomId, data);
    }
  });

  // Handle notes changes
  socket.on('notes-change', (data) => {
    if (socket.roomId) {
      // Broadcast to all other users in the room
      socket.to(socket.roomId).emit('notes-change', data);
      
      // Auto-save notes data
      saveNotesData(socket.roomId, data.content);
    }
  });

  // Handle clear whiteboard
  socket.on('clear-whiteboard', () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('clear-whiteboard');
      // Clear whiteboard data in database
      saveWhiteboardData(socket.roomId, []);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    
    if (socket.roomId && roomUsers.has(socket.roomId)) {
      const users = roomUsers.get(socket.roomId);
      const updatedUsers = users.filter(user => user.socketId !== socket.id);
      roomUsers.set(socket.roomId, updatedUsers);
      
      // Notify remaining users
      socket.to(socket.roomId).emit('users-update', updatedUsers);
      if (socket.username) {
        socket.to(socket.roomId).emit('user-left', { 
          username: socket.username, 
          timestamp: new Date() 
        });
      }
    }
  });
});

// Auto-save functions with debouncing
const saveTimeouts = new Map();

async function saveWhiteboardData(roomId, data) {
  // Clear existing timeout
  if (saveTimeouts.has(`whiteboard-${roomId}`)) {
    clearTimeout(saveTimeouts.get(`whiteboard-${roomId}`));
  }

  // Set new timeout for debounced save
  const timeout = setTimeout(async () => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { 
          whiteboardData: data,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`💾 Whiteboard data saved for room: ${roomId}`);
    } catch (error) {
      console.error('Error saving whiteboard data:', error);
    }
    saveTimeouts.delete(`whiteboard-${roomId}`);
  }, 1000); // 1 second debounce

  saveTimeouts.set(`whiteboard-${roomId}`, timeout);
}

async function saveNotesData(roomId, content) {
  // Clear existing timeout
  if (saveTimeouts.has(`notes-${roomId}`)) {
    clearTimeout(saveTimeouts.get(`notes-${roomId}`));
  }

  // Set new timeout for debounced save
  const timeout = setTimeout(async () => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { 
          notesData: content,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`💾 Notes data saved for room: ${roomId}`);
    } catch (error) {
      console.error('Error saving notes data:', error);
    }
    saveTimeouts.delete(`notes-${roomId}`);
  }, 2000); // 2 second debounce for notes

  saveTimeouts.set(`notes-${roomId}`, timeout);
}

// Start server
const PORT = process.env.PORT || 5010;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});