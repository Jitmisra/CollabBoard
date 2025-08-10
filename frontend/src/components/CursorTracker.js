import React, { useEffect, useState } from 'react';

const CursorTracker = ({ socket, roomId, currentUser, containerRef }) => {
  const [cursors, setCursors] = useState(new Map());

  useEffect(() => {
    if (!socket || !containerRef.current) return;

    let throttleTimeout = null;

    // Handle mouse movement
    const handleMouseMove = (e) => {
      if (throttleTimeout) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Throttle cursor updates to avoid spam
      throttleTimeout = setTimeout(() => {
        socket.emit('cursor-move', {
          roomId,
          username: currentUser.username,
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
          timestamp: Date.now()
        });
        throttleTimeout = null;
      }, 50); // 20 FPS
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      socket.emit('cursor-leave', {
        roomId,
        username: currentUser.username
      });
    };

    // Listen for other users' cursors
    const handleCursorMove = (data) => {
      if (data.username !== currentUser.username) {
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.set(data.username, {
            x: data.x,
            y: data.y,
            timestamp: data.timestamp,
            username: data.username
          });
          return newCursors;
        });
      }
    };

    const handleCursorLeave = (data) => {
      if (data.username !== currentUser.username) {
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.delete(data.username);
          return newCursors;
        });
      }
    };

    const handleUserLeft = (data) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(data.username);
        return newCursors;
      });
    };

    // Add event listeners
    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Socket listeners
    socket.on('cursor-move', handleCursorMove);
    socket.on('cursor-leave', handleCursorLeave);
    socket.on('user-left', handleUserLeft);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      socket.off('cursor-move', handleCursorMove);
      socket.off('cursor-leave', handleCursorLeave);
      socket.off('user-left', handleUserLeft);
      
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [socket, roomId, currentUser, containerRef]);

  // Generate consistent color for each user
  const getUserColor = (username) => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];
    
    if (!username || typeof username !== 'string') {
      return colors[0]; // Return default color if username is invalid
    }
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.username}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Cursor pointer */}
          <div className="relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={getUserColor(cursor.username)}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            
            {/* Username label */}
            <div
              className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
              style={{ backgroundColor: getUserColor(cursor.username) }}
            >
              {cursor.username}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorTracker;