const express = require('express');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const router = express.Router();

// Middleware for input validation
const validateRoomId = (req, res, next) => {
  // Get roomId from params first, then body
  const roomId = req.params.roomId || req.body.roomId;
  
  if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
    return res.status(400).json({ error: 'Valid room ID is required' });
  }
  if (roomId.length > 50) {
    return res.status(400).json({ error: 'Room ID must be 50 characters or less' });
  }
  
  next();
};

// POST /api/rooms/join - Join or create a room
router.post('/join', validateRoomId, async (req, res) => {
  try {
    const { roomId, username } = req.body;

    // Validate username
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Valid username is required' });
    }

    if (username.length > 30) {
      return res.status(400).json({ error: 'Username must be 30 characters or less' });
    }

    // Check if MongoDB is connected, use memory store if not
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, using memory store');
      
      let room = await req.memoryStore.findRoom(roomId);
      
      if (!room) {
        room = await req.memoryStore.createRoom({
          roomId: roomId.trim(),
          name: `Room ${roomId.trim()}`,
          whiteboardData: [],
          notesData: '',
          settings: {
            isPublic: true,
            allowAnonymous: true
          }
        });
        console.log(`🏠 Created new memory room: ${roomId}`);
      }
      
      return res.json({
        success: true,
        roomId: room.roomId,
        message: 'Successfully joined room (memory store)',
        roomData: {
          whiteboardData: room.whiteboardData,
          notesData: room.notesData,
          lastUpdated: room.lastUpdated
        }
      });
    }

    // Find or create room in MongoDB
    let room = await Room.findByRoomId(roomId);
    
    if (!room) {
      // Create new room
      room = new Room({
        roomId: roomId.trim(),
        whiteboardData: [],
        notesData: '',
        settings: {
          isPublic: true,
          allowAnonymous: true
        },
        metadata: {
          totalUsers: 1,
          lastActivity: new Date()
        }
      });
      await room.save();
      console.log(`🏠 Created new room: ${roomId}`);
    } else {
      // Update existing room activity
      await room.updateActivity();
    }

    res.json({
      success: true,
      roomId: room.roomId,
      message: 'Successfully joined room',
      roomData: {
        whiteboardData: room.whiteboardData,
        notesData: room.notesData,
        lastUpdated: room.lastUpdated
      }
    });

  } catch (error) {
    console.error('Error joining room:', error);
    
    // If database error, still allow room join without persistence
    if (error.name === 'MongoNetworkError' || error.name === 'MongoPoolClearedError') {
      return res.json({
        success: true,
        roomId: roomId.trim(),
        message: 'Successfully joined room (database temporarily unavailable)',
        roomData: {
          whiteboardData: [],
          notesData: '',
          lastUpdated: new Date()
        }
      });
    }

    res.status(500).json({ 
      error: 'Failed to join room',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/rooms/public - List public rooms for browsing (MUST come before /:roomId)
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('⚠️  Using memory store for public rooms');
    const memoryRooms = await req.memoryStore.getPublicRooms();
    
    let rooms = memoryRooms.slice(skip, skip + limit).map(room => ({
      roomId: room.roomId,
      name: room.name || `Room ${room.roomId}`,
      description: room.description || 'A collaborative workspace for drawing and notes',
      tags: room.tags || ['collaboration'],
      activeUsers: Math.floor(Math.random() * 5),
      lastActivity: room.lastUpdated,
      isPublic: true
    }));

    let total = memoryRooms.length;

    // Add demo rooms if memory store is empty
    if (rooms.length === 0) {
      const demoRooms = [
        { roomId: 'DEMO01', name: 'Demo Whiteboard', description: 'Try out the whiteboard features', tags: ['demo'] },
        { roomId: 'MEETING', name: 'Meeting Room', description: 'Team collaboration space', tags: ['meeting'] },
        { roomId: 'DESIGN', name: 'Design Workshop', description: 'Creative collaboration', tags: ['design'] }
      ];

      for (const demo of demoRooms) {
        await req.memoryStore.createRoom({
          ...demo,
          whiteboardData: [],
          notesData: '',
          settings: { isPublic: true, allowAnonymous: true }
        });
      }

      rooms = demoRooms.map(room => ({
        ...room,
        activeUsers: Math.floor(Math.random() * 5),
        lastActivity: new Date(),
        isPublic: true
      }));
      total = demoRooms.length;
    }

    res.json({
      success: true,
      rooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      usingMemoryStore: true
    });

  } catch (error) {
    console.error('Error fetching public rooms:', error);
    res.status(500).json({ 
      error: 'Failed to fetch public rooms',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/rooms/:roomId - Get room data
router.get('/:roomId', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Use memory store if database not connected
    if (mongoose.connection.readyState !== 1) {
      const room = await req.memoryStore.findRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      return res.json({
        success: true,
        roomData: {
          roomId: room.roomId,
          whiteboardData: room.whiteboardData,
          notesData: room.notesData,
          lastUpdated: room.lastUpdated
        }
      });
    }

    const room = await Room.findByRoomId(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      success: true,
      roomData: {
        roomId: room.roomId,
        whiteboardData: room.whiteboardData,
        notesData: room.notesData,
        lastUpdated: room.lastUpdated,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ 
      error: 'Failed to fetch room data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;