import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const RoomBrowser = ({ showToast }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = ['demo', 'tutorial', 'meeting', 'team', 'design', 'creative', 'education', 'math', 'brainstorm', 'innovation'];

  useEffect(() => {
    fetchPublicRooms();
  }, []);

  const fetchPublicRooms = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend first
      const response = await fetch(`${API_BASE_URL}/api/rooms/public`);
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      } else {
        // Fallback to demo rooms if API fails
        console.log('API not available, using demo rooms');
        setRooms(getDemoRooms());
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      // Use demo rooms as fallback
      setRooms(getDemoRooms());
      showToast('Using demo rooms - backend not connected', 'info');
    } finally {
      setLoading(false);
    }
  };

  const getDemoRooms = () => [
    {
      roomId: 'DEMO01',
      name: 'Demo Whiteboard',
      description: 'Try out all the whiteboard features in this demo room',
      tags: ['demo', 'tutorial'],
      activeUsers: Math.floor(Math.random() * 5),
      lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random within last hour
      isPublic: true
    },
    {
      roomId: 'MEETING',
      name: 'Team Meeting Room',
      description: 'Perfect space for team meetings and brainstorming sessions',
      tags: ['meeting', 'team'],
      activeUsers: Math.floor(Math.random() * 3),
      lastActivity: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Random within last 2 hours
      isPublic: true
    },
    {
      roomId: 'DESIGN',
      name: 'Design Workshop',
      description: 'Collaborative design space for creative projects',
      tags: ['design', 'creative'],
      activeUsers: Math.floor(Math.random() * 4),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 60 * 1000), // Random within last 30 minutes
      isPublic: true
    },
    {
      roomId: 'MATH',
      name: 'Math Study Group',
      description: 'Solve math problems together and share solutions',
      tags: ['education', 'math'],
      activeUsers: Math.floor(Math.random() * 6),
      lastActivity: new Date(Date.now() - Math.random() * 45 * 60 * 1000), // Random within last 45 minutes
      isPublic: true
    },
    {
      roomId: 'BRAINSTORM',
      name: 'Innovation Hub',
      description: 'Open space for brainstorming and idea generation',
      tags: ['brainstorm', 'innovation'],
      activeUsers: Math.floor(Math.random() * 8),
      lastActivity: new Date(Date.now() - Math.random() * 15 * 60 * 1000), // Random within last 15 minutes
      isPublic: true
    },
    {
      roomId: 'STUDY',
      name: 'Study Hall',
      description: 'Quiet space for collaborative studying and note-taking',
      tags: ['education', 'study'],
      activeUsers: Math.floor(Math.random() * 3),
      lastActivity: new Date(Date.now() - Math.random() * 90 * 60 * 1000), // Random within last 90 minutes
      isPublic: true
    }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || room.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const formatLastActivity = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityColor = (activeUsers) => {
    if (activeUsers === 0) return 'text-gray-500';
    if (activeUsers <= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading public rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Public Rooms</h1>
          <p className="text-gray-600 mt-2">
            Discover and join public collaboration rooms created by the community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Rooms
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search by name, description, or room ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="md:w-64">
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Tag
              </label>
              <select
                id="tag"
                className="input-field"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </div>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 mb-4">No rooms found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.roomId} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Room Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-500">ID: {room.roomId}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`h-2 w-2 rounded-full ${room.activeUsers > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${getActivityColor(room.activeUsers)}`}>
                        {room.activeUsers}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last active: {formatLastActivity(room.lastActivity)}
                    </div>
                    <Link
                      to={`/room/${room.roomId}`}
                      className="btn-primary text-sm"
                    >
                      Join Room
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Room CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Don't see what you're looking for?
          </h2>
          <p className="text-primary-100 mb-6">
            Create your own room and invite others to collaborate with you.
          </p>
          <Link
            to="/join"
            className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Create New Room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomBrowser;