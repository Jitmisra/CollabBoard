import React, { useState, useEffect } from 'react';

const ActivityFeed = ({ socket, roomId }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleActivity = (activity) => {
      setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
    };

    // Listen to various activity events
    socket.on('user-joined', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'user-joined',
        user: data.username,
        message: `${data.username} joined the room`,
        timestamp: new Date(),
        icon: '👋'
      });
    });

    socket.on('user-left', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'user-left',
        user: data.username,
        message: `${data.username} left the room`,
        timestamp: new Date(),
        icon: '👋'
      });
    });

    socket.on('drawing', (data) => {
      if (data.type === 'start') {
        handleActivity({
          id: Date.now(),
          type: 'drawing',
          user: data.username,
          message: `${data.username} started drawing`,
          timestamp: new Date(),
          icon: '✏️'
        });
      }
    });

    socket.on('clear-whiteboard', () => {
      handleActivity({
        id: Date.now(),
        type: 'clear',
        user: socket.username,
        message: 'Whiteboard was cleared',
        timestamp: new Date(),
        icon: '🧹'
      });
    });

    socket.on('notes-change', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'notes',
        user: data.username,
        message: `${data.username} updated notes`,
        timestamp: new Date(),
        icon: '📝'
      });
    });

    socket.on('voice-message', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'voice',
        user: data.username,
        message: `${data.username} sent a voice message`,
        timestamp: new Date(),
        icon: '🎤'
      });
    });

    socket.on('screen-share-start', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'screen-share',
        user: data.username,
        message: `${data.username} started screen sharing`,
        timestamp: new Date(),
        icon: '📺'
      });
    });

    socket.on('screen-share-stop', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'screen-share',
        user: data.username,
        message: `${data.username} stopped screen sharing`,
        timestamp: new Date(),
        icon: '📺'
      });
    });

    socket.on('sticky-note-add', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'sticky-note',
        user: data.username,
        message: `${data.username} added a sticky note`,
        timestamp: new Date(),
        icon: '📌'
      });
    });

    socket.on('new-poll', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'poll',
        user: data.creator,
        message: `${data.creator} created a poll: "${data.question}"`,
        timestamp: new Date(),
        icon: '📊'
      });
    });

    socket.on('poll-vote', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'poll-vote',
        user: data.voter,
        message: `${data.voter} voted in a poll`,
        timestamp: new Date(),
        icon: '🗳️'
      });
    });

    socket.on('timer-start', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'timer',
        user: data.username,
        message: `${data.username} started a ${data.mode} timer`,
        timestamp: new Date(),
        icon: '⏰'
      });
    });

    socket.on('file-upload', (data) => {
      handleActivity({
        id: Date.now(),
        type: 'file-upload',
        user: data.file.uploadedBy,
        message: `${data.file.uploadedBy} uploaded ${data.file.name}`,
        timestamp: new Date(),
        icon: '📎'
      });
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('drawing');
      socket.off('clear-whiteboard');
      socket.off('notes-change');
      socket.off('voice-message');
      socket.off('screen-share-start');
      socket.off('screen-share-stop');
      socket.off('sticky-note-add');
      socket.off('new-poll');
      socket.off('poll-vote');
      socket.off('timer-start');
      socket.off('file-upload');
    };
  }, [socket]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActivityColor = (type) => {
    const colors = {
      'user-joined': 'text-green-600',
      'user-left': 'text-gray-600',
      'drawing': 'text-blue-600',
      'clear': 'text-red-600',
      'notes': 'text-purple-600',
      'voice': 'text-yellow-600',
      'screen-share': 'text-indigo-600',
      'sticky-note': 'text-pink-600',
      'poll': 'text-teal-600',
      'poll-vote': 'text-teal-500',
      'timer': 'text-orange-600',
      'file-upload': 'text-cyan-600'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Activity Feed</h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            No activity yet
          </p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-md">
              <span className="text-sm">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${getActivityColor(activity.type)}`}>
                  {activity.message}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;