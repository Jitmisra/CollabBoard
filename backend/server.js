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
      ? ["https://www.web-production-09dde.up.railway.app", "https://web-production-09dde.up.railway.app", "https://your-frontend-domain.railway.app", "https://collab-board-jade.vercel.app"] 
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
    ? ["https://www.web-production-09dde.up.railway.app", "https://web-production-09dde.up.railway.app", "https://your-frontend-domain.railway.app", "https://collab-board-jade.vercel.app"] 
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? ["https://www.web-production-09dde.up.railway.app", "https://web-production-09dde.up.railway.app", "https://your-frontend-domain.railway.app", "https://collab-board-jade.vercel.app"] 
        : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
    },
    origin: req.headers.origin || 'no-origin',
    userAgent: req.headers['user-agent'] || 'no-user-agent'
  });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    port: PORT,
    cors: 'enabled',
    origin: req.headers.origin || 'no-origin'
  });
});

// Auth test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Auth endpoint is accessible!', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'no-origin',
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

  // Handle voice messages
  socket.on('voice-message', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('voice-message', data);
    }
  });

  // Handle screen sharing
  socket.on('screen-share-start', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('screen-share-start', data);
    }
  });

  socket.on('screen-share-stop', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('screen-share-stop', data);
    }
  });

  socket.on('screen-share-data', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('screen-share-data', data);
    }
  });

  // Handle cursor tracking
  socket.on('cursor-move', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('cursor-move', data);
    }
  });

  socket.on('cursor-leave', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('cursor-leave', data);
    }
  });

  // Handle sticky notes
  socket.on('sticky-note-add', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('sticky-note-add', data);
      // Save to database/memory store
      saveStickyNote(socket.roomId, data.note);
    }
  });

  socket.on('sticky-note-update', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('sticky-note-update', data);
      // Update in database/memory store
      updateStickyNote(socket.roomId, data.note);
    }
  });

  socket.on('sticky-note-delete', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('sticky-note-delete', data);
      // Delete from database/memory store
      deleteStickyNote(socket.roomId, data.id);
    }
  });

  // Handle AI text recognition
  socket.on('ai-text-recognized', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('ai-text-recognized', data);
    }
  });

  // Handle polls
  socket.on('create-poll', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('new-poll', data.poll);
      // Save poll to memory/database
      savePoll(socket.roomId, data.poll);
    }
  });

  socket.on('vote-poll', (data) => {
    if (socket.roomId) {
      // Update poll votes
      updatePollVotes(socket.roomId, data.pollId, data.optionIndex, data.voter);
      // Broadcast updated votes to all users
      io.to(socket.roomId).emit('poll-vote', {
        pollId: data.pollId,
        votes: getPollVotes(socket.roomId, data.pollId),
        totalVotes: getTotalPollVotes(socket.roomId, data.pollId),
        voter: data.voter
      });
    }
  });

  // Handle timer events
  socket.on('timer-start', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('timer-start', { ...data, username: socket.username });
      socket.to(socket.roomId).emit('timer-sync', data);
    }
  });

  socket.on('timer-pause', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('timer-pause', data);
    }
  });

  socket.on('timer-reset', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('timer-reset', data);
    }
  });

  socket.on('timer-mode-change', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('timer-mode-change', data);
    }
  });

  socket.on('timer-complete', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('timer-complete', data);
    }
  });

  // Handle file uploads
  socket.on('file-upload', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('file-upload', data);
      // Save file metadata to database/memory store
      saveFileMetadata(socket.roomId, data.file);
    }
  });

  socket.on('file-delete', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('file-delete', data);
      // Delete file metadata from database/memory store
      deleteFileMetadata(socket.roomId, data.fileId);
    }
  });

  // Handle presentation mode
  socket.on('start-presentation', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('presentation-start', data);
    }
  });

  socket.on('end-presentation', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('presentation-end', data);
    }
  });

  socket.on('change-slide', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('slide-change', data);
    }
  });

  // Handle code editor events
  socket.on('code-change', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('code-change', data);
    }
  });

  socket.on('language-change', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('language-change', data);
    }
  });

  socket.on('cursor-move', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('cursor-position', data);
    }
  });

  socket.on('code-execution', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('code-execution', data);
    }
  });

  // Handle emoji reactions
  socket.on('emoji-reaction', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('emoji-reaction', data);
    }
  });

  // Handle laser pointer
  socket.on('laser-move', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('laser-move', data);
    }
  });

  socket.on('laser-toggle', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('laser-toggle', data);
    }
  });

  // Handle theme changes
  socket.on('theme-change', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('theme-change', data);
    }
  });

  // Handle export and share events
  socket.on('export-activity', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('export-activity', data);
    }
  });

  socket.on('share-link-generated', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('share-link-generated', data);
    }
  });

  // Handle mind map generation
  socket.on('mindmap-generated', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('mindmap-generated', data);
    }
  });

  // Handle real-time chat
  socket.on('chat-message', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('chat-message', data);
      // Save chat message to memory/database
      saveChatMessage(socket.roomId, data);
    }
  });

  socket.on('user-typing', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-typing', data);
    }
  });

  socket.on('user-stopped-typing', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-stopped-typing', data);
    }
  });

  // Handle AI chat messages
  socket.on('ai-chat-message', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('ai-chat-message', data);
      // Save AI chat message to memory/database
      saveAIChatMessage(socket.roomId, data);
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

// Sticky notes functions
async function saveStickyNote(roomId, note) {
  try {
    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate(
        { roomId },
        { 
          $push: { 'stickyNotes': note },
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } else {
      // Use memory store
      const room = await memoryStore.findRoom(roomId);
      if (room) {
        if (!room.stickyNotes) room.stickyNotes = [];
        room.stickyNotes.push(note);
        await memoryStore.updateRoom(roomId, room);
      }
    }
    console.log(`📝 Sticky note saved for room: ${roomId}`);
  } catch (error) {
    console.error('Error saving sticky note:', error);
  }
}

async function updateStickyNote(roomId, note) {
  try {
    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate(
        { roomId, 'stickyNotes.id': note.id },
        { 
          $set: { 'stickyNotes.$': note },
          lastUpdated: new Date()
        }
      );
    } else {
      // Use memory store
      const room = await memoryStore.findRoom(roomId);
      if (room && room.stickyNotes) {
        const index = room.stickyNotes.findIndex(n => n.id === note.id);
        if (index !== -1) {
          room.stickyNotes[index] = note;
          await memoryStore.updateRoom(roomId, room);
        }
      }
    }
    console.log(`📝 Sticky note updated for room: ${roomId}`);
  } catch (error) {
    console.error('Error updating sticky note:', error);
  }
}

async function deleteStickyNote(roomId, noteId) {
  try {
    if (mongoose.connection.readyState === 1) {
      await Room.findOneAndUpdate(
        { roomId },
        { 
          $pull: { 'stickyNotes': { id: noteId } },
          lastUpdated: new Date()
        }
      );
    } else {
      // Use memory store
      const room = await memoryStore.findRoom(roomId);
      if (room && room.stickyNotes) {
        room.stickyNotes = room.stickyNotes.filter(n => n.id !== noteId);
        await memoryStore.updateRoom(roomId, room);
      }
    }
    console.log(`📝 Sticky note deleted for room: ${roomId}`);
  } catch (error) {
    console.error('Error deleting sticky note:', error);
  }
}

// In-memory storage for new features
const roomPolls = new Map();
const roomFiles = new Map();
const roomChats = new Map();
const roomAIChats = new Map();

// Poll management functions
async function savePoll(roomId, poll) {
  try {
    if (!roomPolls.has(roomId)) {
      roomPolls.set(roomId, []);
    }
    roomPolls.get(roomId).push(poll);
    console.log(`📊 Poll saved for room: ${roomId}`);
  } catch (error) {
    console.error('Error saving poll:', error);
  }
}

function updatePollVotes(roomId, pollId, optionIndex, voter) {
  try {
    const polls = roomPolls.get(roomId) || [];
    const poll = polls.find(p => p.id === pollId);
    if (poll) {
      if (!poll.votes) poll.votes = {};
      poll.votes[voter] = optionIndex;
      poll.totalVotes = Object.keys(poll.votes).length;
    }
  } catch (error) {
    console.error('Error updating poll votes:', error);
  }
}

function getPollVotes(roomId, pollId) {
  try {
    const polls = roomPolls.get(roomId) || [];
    const poll = polls.find(p => p.id === pollId);
    return poll ? poll.votes || {} : {};
  } catch (error) {
    console.error('Error getting poll votes:', error);
    return {};
  }
}

function getTotalPollVotes(roomId, pollId) {
  try {
    const polls = roomPolls.get(roomId) || [];
    const poll = polls.find(p => p.id === pollId);
    return poll ? poll.totalVotes || 0 : 0;
  } catch (error) {
    console.error('Error getting total poll votes:', error);
    return 0;
  }
}

// File management functions
async function saveFileMetadata(roomId, file) {
  try {
    if (!roomFiles.has(roomId)) {
      roomFiles.set(roomId, []);
    }
    roomFiles.get(roomId).push(file);
    console.log(`📎 File metadata saved for room: ${roomId}`);
  } catch (error) {
    console.error('Error saving file metadata:', error);
  }
}

async function deleteFileMetadata(roomId, fileId) {
  try {
    const files = roomFiles.get(roomId) || [];
    const updatedFiles = files.filter(f => f.id !== fileId);
    roomFiles.set(roomId, updatedFiles);
    console.log(`📎 File metadata deleted for room: ${roomId}`);
  } catch (error) {
    console.error('Error deleting file metadata:', error);
  }
}

// Chat management functions
async function saveChatMessage(roomId, message) {
  try {
    if (!roomChats.has(roomId)) {
      roomChats.set(roomId, []);
    }
    roomChats.get(roomId).push({
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    });
    console.log(`💬 Chat message saved for room: ${roomId}`);
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

// AI Chat management functions
async function saveAIChatMessage(roomId, data) {
  try {
    if (!roomAIChats.has(roomId)) {
      roomAIChats.set(roomId, []);
    }
    roomAIChats.get(roomId).push({
      ...data,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    });
    console.log(`🤖 AI chat message saved for room: ${roomId}`);
  } catch (error) {
    console.error('Error saving AI chat message:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5010;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Features: Gemini API integration, Text Recognition, Mind Maps`);
  console.log(`💬 Communication: Real-time Chat, Voice Messages, Screen Share`);
  console.log(`🎨 Creative Tools: Drawing, Templates, Themes, Sticky Notes`);
  console.log(`📊 Productivity: Polls, Timer, Analytics, File Upload, Export`);
  console.log(`💻 Development: Code Editor, Presentation Mode, Laser Pointer`);
  console.log(`✨ Total Features: 20+ professional collaboration tools`);
  console.log(`🏆 Ready for hackathon demo!`);
});