import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocketContext } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import CollaborationRoom from '../components/CollaborationRoom';

const WhiteboardRoom = ({ showToast }) => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, users, roomData, joinRoom, leaveRoom } = useSocketContext();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [isJoining, setIsJoining] = useState(true);
  const hasJoinedRef = useRef(false);

  // Get username from location state or user account
  useEffect(() => {
    const username = location.state?.username || user?.username || 'Anonymous';
    setCurrentUser({ username, roomId });
    
    if (socket && roomId && !hasJoinedRef.current) {
      setIsJoining(true);
      joinRoom(roomId, username);
      hasJoinedRef.current = true;
      
      // Set joining to false after a short delay
      setTimeout(() => setIsJoining(false), 1000);
    }
  }, [socket, roomId, location.state, user, joinRoom]);

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      leaveRoom();
      navigate('/');
      showToast('Left the room', 'info');
    }
  };

  // Show loading screen while joining
  if (isJoining || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Joining room {roomId}...</p>
          <p className="text-sm text-gray-500 mt-2">
            {isConnected ? 'Connected to server' : 'Connecting to server...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CollaborationRoom
        user={currentUser}
        roomId={roomId}
        socket={socket}
        onLeaveRoom={handleLeaveRoom}
        showToast={showToast}
      />
      
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-16 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-40">
          🔴 Disconnected - Attempting to reconnect...
        </div>
      )}
    </>
  );
};

export default WhiteboardRoom;