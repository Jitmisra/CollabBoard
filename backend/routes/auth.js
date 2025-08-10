const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      profile: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim()
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('🔍 Login request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: { ...req.body, password: '[HIDDEN]' },
      timestamp: new Date().toISOString()
    });

    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Login validation failed: missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('🔍 Looking for user with username/email:', username);

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: username.trim().toLowerCase() }
      ]
    });

    if (!user) {
      console.log('❌ User not found for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', { id: user._id, username: user.username, email: user.email });

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password validated successfully');

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for user:', username);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Failed to login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        ...user.getPublicProfile(),
        email: user.email,
        preferences: user.preferences,
        roomHistory: user.roomHistory.slice(0, 10) // Last 10 rooms
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, preferences } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName.trim();
    if (lastName !== undefined) user.profile.lastName = lastName.trim();
    if (bio !== undefined) user.profile.bio = bio.trim();
    
    // Update preferences
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.defaultBrushColor) user.preferences.defaultBrushColor = preferences.defaultBrushColor;
      if (preferences.defaultBrushSize) user.preferences.defaultBrushSize = preferences.defaultBrushSize;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's room history
router.get('/rooms/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('roomHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      rooms: user.roomHistory
    });

  } catch (error) {
    console.error('Room history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch room history' });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

module.exports = router;