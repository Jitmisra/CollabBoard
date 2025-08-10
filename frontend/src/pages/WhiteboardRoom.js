import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocketContext } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Whiteboard from '../components/Whiteboard';
import NotesEditor from '../components/NotesEditor';
import UsersList from '../components/UsersList';
import RoomHeader from '../components/RoomHeader';

const WhiteboardRoom = ({ showToast }) => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, users, roomData, joinRoom, leaveRoom } = useSocketContext();
  
  const [activeTab, setActiveTab] = useState('whiteboard');
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

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    // Handle user join notifications
    const handleUserJoined = (data) => {
      if (data.username !== currentUser?.username) {
        showToast(`${data.username} joined the room`, 'info');
      }
    };

    // Handle user leave notifications
    const handleUserLeft = (data) => {
      showToast(`${data.username} left the room`, 'info');
    };

    // Handle connection errors
    const handleError = (error) => {
      showToast(error.message || 'An error occurred', 'error');
    };

    // Register event listeners
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('error', handleError);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('error', handleError);
    };
  }, [socket, currentUser, showToast]);

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      leaveRoom();
      navigate('/');
      showToast('Left the room', 'info');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
    <div className="min-h-screen bg-gray-50">
      {/* Room Header */}
      <RoomHeader
        user={currentUser}
        roomId={roomId}
        onLeaveRoom={handleLeaveRoom}
        showToast={showToast}
        isConnected={isConnected}
      />

      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4">
              <nav className="flex space-x-8">
                <button
                  onClick={() => handleTabChange('whiteboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'whiteboard'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Whiteboard
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('notes')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'notes'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Notes
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'whiteboard' ? (
              <Whiteboard
                socket={socket}
                roomId={roomId}
                initialData={roomData.whiteboardData}
                showToast={showToast}
              />
            ) : (
              <NotesEditor
                socket={socket}
                roomId={roomId}
                initialContent={roomData.notesData}
                showToast={showToast}
              />
            )}
          </div>
        </div>

        {/* Sidebar - Users List */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <UsersList users={users} currentUser={currentUser.username} />
        </div>
      </div>

      {/* Mobile Tab Switcher (visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex space-x-4">
          <button
            onClick={() => handleTabChange('whiteboard')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'whiteboard'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Whiteboard
          </button>
          <button
            onClick={() => handleTabChange('notes')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Notes
          </button>
        </div>
      </div>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-16 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-40">
          🔴 Disconnected - Attempting to reconnect...
        </div>
      )}
    </div>
  );
};

export default WhiteboardRoom;