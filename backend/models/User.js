const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema for authentication and profile management
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    defaultBrushColor: {
      type: String,
      default: '#000000'
    },
    defaultBrushSize: {
      type: Number,
      default: 3,
      min: 1,
      max: 20
    }
  },
  roomHistory: [{
    roomId: {
      type: String,
      required: true
    },
    roomName: String,
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['owner', 'collaborator'],
      default: 'collaborator'
    }
  }],
  stats: {
    totalRoomsJoined: {
      type: Number,
      default: 0
    },
    totalDrawingTime: {
      type: Number,
      default: 0 // in minutes
    },
    roomsCreated: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'roomHistory.roomId': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add room to history
userSchema.methods.addToRoomHistory = function(roomId, roomName, role = 'collaborator') {
  const existingRoom = this.roomHistory.find(room => room.roomId === roomId);
  
  if (existingRoom) {
    existingRoom.lastAccessed = new Date();
    existingRoom.role = role;
  } else {
    this.roomHistory.unshift({
      roomId,
      roomName: roomName || roomId,
      lastAccessed: new Date(),
      role
    });
    
    // Keep only last 20 rooms
    if (this.roomHistory.length > 20) {
      this.roomHistory = this.roomHistory.slice(0, 20);
    }
    
    this.stats.totalRoomsJoined += 1;
  }
  
  return this.save();
};

// Get user's public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    profile: {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      avatar: this.profile.avatar,
      bio: this.profile.bio
    },
    stats: this.stats,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);