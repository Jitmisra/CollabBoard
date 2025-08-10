import React, { useState, useEffect } from 'react';

const RoomAnalytics = ({ socket, roomId, users }) => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDrawings: 0,
    totalMessages: 0,
    sessionDuration: 0,
    mostActiveUser: null,
    peakUsers: 0
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionStart] = useState(new Date());

  useEffect(() => {
    if (!socket) return;

    // Track various activities
    const trackActivity = (type, user) => {
      setAnalytics(prev => ({
        ...prev,
        [`total${type}`]: (prev[`total${type}`] || 0) + 1
      }));
    };

    const handleDrawing = (data) => {
      if (data.type === 'start') {
        trackActivity('Drawings', data.username);
      }
    };

    const handleVoiceMessage = () => {
      trackActivity('Messages');
    };

    const handleNotesChange = () => {
      trackActivity('Notes');
    };

    socket.on('drawing', handleDrawing);
    socket.on('voice-message', handleVoiceMessage);
    socket.on('notes-change', handleNotesChange);

    return () => {
      socket.off('drawing', handleDrawing);
      socket.off('voice-message', handleVoiceMessage);
      socket.off('notes-change', handleNotesChange);
    };
  }, [socket]);

  useEffect(() => {
    // Update analytics based on current users
    setAnalytics(prev => ({
      ...prev,
      totalUsers: Math.max(prev.totalUsers, users.length),
      activeUsers: users.length,
      peakUsers: Math.max(prev.peakUsers, users.length),
      sessionDuration: Math.floor((new Date() - sessionStart) / 1000 / 60) // in minutes
    }));
  }, [users, sessionStart]);

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getEngagementLevel = () => {
    const totalActivity = analytics.totalDrawings + analytics.totalMessages;
    if (totalActivity > 50) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (totalActivity > 20) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const engagement = getEngagementLevel();

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Room Analytics</h3>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
        >
          {showAnalytics ? 'Hide' : 'Show'} Stats
        </button>
      </div>

      {showAnalytics && (
        <div className="space-y-3">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded-md text-center">
              <div className="text-lg font-bold text-blue-600">{analytics.activeUsers}</div>
              <div className="text-xs text-blue-800">Active Users</div>
            </div>
            <div className="bg-green-50 p-2 rounded-md text-center">
              <div className="text-lg font-bold text-green-600">{analytics.totalDrawings}</div>
              <div className="text-xs text-green-800">Drawings</div>
            </div>
          </div>

          {/* Engagement level */}
          <div className={`p-2 rounded-md ${engagement.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Engagement</span>
              <span className={`text-xs font-bold ${engagement.color}`}>
                {engagement.level}
              </span>
            </div>
          </div>

          {/* Detailed stats */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Session Duration:</span>
              <span className="font-medium">{formatDuration(analytics.sessionDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peak Users:</span>
              <span className="font-medium">{analytics.peakUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Messages:</span>
              <span className="font-medium">{analytics.totalMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Room ID:</span>
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">{roomId}</span>
            </div>
          </div>

          {/* Active users list */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Active Users:</div>
            <div className="flex flex-wrap gap-1">
              {users.map((user, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full"
                >
                  {user.username}
                </span>
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Activity Summary:</div>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">
                  {analytics.totalDrawings} drawing actions
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">
                  {analytics.totalMessages} voice messages
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">
                  {users.length} users currently active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showAnalytics && (
        <div className="text-center">
          <div className="text-lg font-bold text-gray-700">{analytics.activeUsers}</div>
          <div className="text-xs text-gray-500">Active Users</div>
          <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${engagement.bg} ${engagement.color}`}>
            {engagement.level} Activity
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAnalytics;