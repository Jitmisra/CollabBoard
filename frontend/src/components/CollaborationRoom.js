import React, { useState, useEffect } from 'react';
import Whiteboard from './Whiteboard';
import NotesEditor from './NotesEditor';
import UsersList from './UsersList';
import RoomHeader from './RoomHeader';

const CollaborationRoom = ({ user, roomId, socket, onLeaveRoom, showToast }) => {
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [users, setUsers] = useState([]);
  const [roomData, setRoomData] = useState({
    whiteboardData: [],
    notesData: ''
  });

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    // Handle room data loading
    const handleRoomData = (data) => {
      setRoomData({
        whiteboardData: data.whiteboardData || [],
        notesData: data.notesData || ''
      });
    };

    // Handle users list updates
    const handleUsersUpdate = (usersList) => {
      setUsers(usersList);
    };

    // Handle user join notifications
    const handleUserJoined = (data) => {
      if (data.username !== user.username) {
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
    socket.on('room-data', handleRoomData);
    socket.on('users-update', handleUsersUpdate);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('error', handleError);

    return () => {
      socket.off('room-data', handleRoomData);
      socket.off('users-update', handleUsersUpdate);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('error', handleError);
    };
  }, [socket, user.username, showToast]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Room Header */}
      <RoomHeader
        user={user}
        roomId={roomId}
        onLeaveRoom={onLeaveRoom}
        showToast={showToast}
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'whiteboard'
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'notes'
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
          <UsersList users={users} currentUser={user.username} />
        </div>
      </div>

      {/* Mobile Tab Switcher (visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex space-x-4">
          <button
            onClick={() => handleTabChange('whiteboard')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'whiteboard'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Whiteboard
          </button>
          <button
            onClick={() => handleTabChange('notes')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notes'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRoom;