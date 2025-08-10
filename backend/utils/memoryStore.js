// In-memory storage for when database is unavailable
class MemoryStore {
  constructor() {
    this.rooms = new Map();
    this.users = new Map();
    console.log('📦 Memory store initialized');
  }

  // Room operations
  async createRoom(roomData) {
    const room = {
      ...roomData,
      createdAt: new Date(),
      lastUpdated: new Date(),
      metadata: {
        totalUsers: 0,
        lastActivity: new Date(),
        ...roomData.metadata
      }
    };
    this.rooms.set(roomData.roomId, room);
    return room;
  }

  async findRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  async updateRoom(roomId, updateData) {
    const room = this.rooms.get(roomId);
    if (room) {
      const updatedRoom = {
        ...room,
        ...updateData,
        lastUpdated: new Date()
      };
      this.rooms.set(roomId, updatedRoom);
      return updatedRoom;
    }
    return null;
  }

  async getAllRooms() {
    return Array.from(this.rooms.values());
  }

  async getPublicRooms() {
    return Array.from(this.rooms.values()).filter(room => 
      room.settings?.isPublic !== false
    );
  }

  // User operations (simplified)
  async createUser(userData) {
    const user = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      roomHistory: [],
      stats: {
        totalRoomsJoined: 0,
        totalDrawingTime: 0,
        roomsCreated: 0
      }
    };
    this.users.set(user.id, user);
    return user;
  }

  async findUser(userId) {
    return this.users.get(userId) || null;
  }

  async findUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(userId, updateData) {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, ...updateData };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return null;
  }

  // Stats
  getStats() {
    return {
      rooms: this.rooms.size,
      users: this.users.size,
      publicRooms: this.getPublicRooms().length
    };
  }

  // Clear all data (for testing)
  clear() {
    this.rooms.clear();
    this.users.clear();
    console.log('📦 Memory store cleared');
  }
}

// Export singleton instance
module.exports = new MemoryStore();