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

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, creating temporary room');
      // Return success without database operations
      return res.json({
        success: true,
        roomId: roomId.trim(),
        message: 'Successfully joined room (temporary session)',
        roomData: {
          whiteboardData: [],
          notesData: '',
          lastUpdated: new Date()
        }
      });
    }

    // Find or create room
    let room = await Room.findByRoomId(roomId);
    
    if (!room) {
      // Create new room
      room = new Room({
        roomId: roomId.trim(),
        whiteboardData: [],
        notesData: '',
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
    res.status(500).json({ 
      error: 'Failed to join room',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/rooms/:roomId - Get room data
router.get('/:roomId', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    
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

// PUT /api/rooms/:roomId/whiteboard - Save whiteboard data
router.put('/:roomId/whiteboard', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { whiteboardData } = req.body;

    // Validate whiteboard data
    if (!Array.isArray(whiteboardData)) {
      return res.status(400).json({ error: 'Whiteboard data must be an array' });
    }

    // Size limit check (5MB)
    const dataSize = JSON.stringify(whiteboardData).length;
    if (dataSize > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'Whiteboard data too large (max 5MB)' });
    }

    const room = await Room.createOrUpdate(roomId, { whiteboardData });

    res.json({
      success: true,
      message: 'Whiteboard data saved successfully',
      lastUpdated: room.lastUpdated
    });

  } catch (error) {
    console.error('Error saving whiteboard data:', error);
    res.status(500).json({ 
      error: 'Failed to save whiteboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/rooms/:roomId/notes - Save notes data
router.put('/:roomId/notes', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { notesData } = req.body;

    // Validate notes data
    if (typeof notesData !== 'string') {
      return res.status(400).json({ error: 'Notes data must be a string' });
    }

    // Size limit check (100KB)
    if (notesData.length > 100000) {
      return res.status(413).json({ error: 'Notes data too large (max 100KB)' });
    }

    const room = await Room.createOrUpdate(roomId, { notesData });

    res.json({
      success: true,
      message: 'Notes data saved successfully',
      lastUpdated: room.lastUpdated
    });

  } catch (error) {
    console.error('Error saving notes data:', error);
    res.status(500).json({ 
      error: 'Failed to save notes data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/rooms/:roomId - Delete room (optional cleanup endpoint)
router.delete('/:roomId', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const result = await Room.deleteOne({ roomId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ 
      error: 'Failed to delete room',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/rooms/public - List public rooms for browsing
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find public rooms with recent activity
    const rooms = await Room.find({
      'settings.isPublic': true,
      lastUpdated: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
    })
    .select('roomId name description tags lastUpdated metadata createdAt')
    .sort({ 'metadata.lastActivity': -1 })
    .skip(skip)
    .limit(limit);

    // Transform data for frontend
    const transformedRooms = rooms.map(room => ({
      roomId: room.roomId,
      name: room.name || `Room ${room.roomId}`,
      description: room.description || 'A collaborative workspace for drawing and notes',
      tags: room.tags || ['collaboration'],
      activeUsers: room.metadata?.totalUsers || 0,
      lastActivity: room.metadata?.lastActivity || room.lastUpdated,
      isPublic: true
    }));

    const total = await Room.countDocuments({
      'settings.isPublic': true,
      lastUpdated: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      rooms: transformedRooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching public rooms:', error);
    res.status(500).json({ 
      error: 'Failed to fetch public rooms',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/rooms - List all rooms (admin endpoint, optional)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rooms = await Room.find({})
      .select('roomId name lastUpdated createdAt metadata')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Room.countDocuments();

    res.json({
      success: true,
      rooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error listing rooms:', error);
    res.status(500).json({ 
      error: 'Failed to list rooms',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;