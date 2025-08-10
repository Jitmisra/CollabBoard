const mongoose = require('mongoose');

// Room schema for storing whiteboard and notes data
const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100,
    default: function() {
      return `Room ${this.roomId}`;
    }
  },
  description: {
    type: String,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'write'
    }
  }],
  whiteboardData: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  notesData: {
    type: String,
    default: '',
    maxlength: 100000 // 100KB limit for notes
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    maxUsers: {
      type: Number,
      default: 50
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Track room metadata
  metadata: {
    totalUsers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    totalSessions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
roomSchema.index({ roomId: 1 });
roomSchema.index({ lastUpdated: -1 });

// Pre-save middleware to update lastUpdated
roomSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.metadata.lastActivity = new Date();
  next();
});

// Pre-findOneAndUpdate middleware
roomSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastUpdated: new Date() });
  this.set({ 'metadata.lastActivity': new Date() });
  next();
});

// Instance methods
roomSchema.methods.updateActivity = function() {
  this.lastUpdated = new Date();
  this.metadata.lastActivity = new Date();
  return this.save();
};

// Static methods
roomSchema.statics.findByRoomId = function(roomId) {
  return this.findOne({ roomId });
};

roomSchema.statics.createOrUpdate = function(roomId, data) {
  return this.findOneAndUpdate(
    { roomId },
    { ...data, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
};

// Clean up old rooms (can be called periodically)
roomSchema.statics.cleanupOldRooms = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    lastUpdated: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Room', roomSchema);