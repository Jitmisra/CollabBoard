import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5,
  // Ensure we don't use the proxy for socket connections
  autoConnect: true,
  upgrade: true
};

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create socket connection
    console.log('🔌 Connecting to socket server:', SOCKET_URL);
    const newSocket = io(SOCKET_URL, SOCKET_OPTIONS);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔥 Connection error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔥 Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('💀 Failed to reconnect to server');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  return socket;
};