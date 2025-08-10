import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [roomData, setRoomData] = useState({
    whiteboardData: [],
    notesData: ''
  });
  const [currentRoomId, setCurrentRoomId] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleRoomData = (data) => {
      setRoomData({
        whiteboardData: data.whiteboardData || [],
        notesData: data.notesData || ''
      });
    };

    const handleUsersUpdate = (usersList) => {
      setUsers(usersList);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room-data', handleRoomData);
    socket.on('users-update', handleUsersUpdate);

    // Check initial connection status
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room-data', handleRoomData);
      socket.off('users-update', handleUsersUpdate);
    };
  }, [socket]);

  const joinRoom = (roomId, username) => {
    if (socket && currentRoomId !== roomId) {
      console.log(`🚀 Joining room: ${roomId} as ${username}`);
      socket.emit('join-room', { roomId, username });
      setCurrentRoomId(roomId);
    } else if (currentRoomId === roomId) {
      console.log(`ℹ️  Already in room: ${roomId}`);
    }
  };

  const leaveRoom = () => {
    if (socket) {
      console.log(`👋 Leaving room: ${currentRoomId}`);
      setCurrentRoomId(null);
      setUsers([]);
      setRoomData({ whiteboardData: [], notesData: '' });
      socket.disconnect();
      socket.connect();
    }
  };

  const value = {
    socket,
    isConnected,
    users,
    roomData,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};