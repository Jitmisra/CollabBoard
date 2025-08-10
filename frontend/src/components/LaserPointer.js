import React, { useState, useEffect } from 'react';

const LaserPointer = ({ socket, roomId, currentUser, showToast }) => {
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPointers, setLaserPointers] = useState({});
  const [laserColor, setLaserColor] = useState('#ff0000');

  const colors = [
    { name: 'Red', value: '#ff0000' },
    { name: 'Green', value: '#00ff00' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Purple', value: '#8000ff' },
    { name: 'Orange', value: '#ff8000' },
    { name: 'Pink', value: '#ff00ff' }
  ];

  useEffect(() => {
    if (!socket) return;

    const handleLaserMove = (data) => {
      setLaserPointers(prev => ({
        ...prev,
        [data.username]: {
          x: data.x,
          y: data.y,
          color: data.color,
          timestamp: Date.now()
        }
      }));

      // Remove laser pointer after 2 seconds of inactivity
      setTimeout(() => {
        setLaserPointers(prev => {
          const updated = { ...prev };
          if (updated[data.username] && Date.now() - updated[data.username].timestamp > 1800) {
            delete updated[data.username];
          }
          return updated;
        });
      }, 2000);
    };

    const handleLaserToggle = (data) => {
      if (data.active) {
        showToast(`${data.username} activated laser pointer`, 'info');
      } else {
        setLaserPointers(prev => {
          const updated = { ...prev };
          delete updated[data.username];
          return updated;
        });
      }
    };

    socket.on('laser-move', handleLaserMove);
    socket.on('laser-toggle', handleLaserToggle);

    return () => {
      socket.off('laser-move', handleLaserMove);
      socket.off('laser-toggle', handleLaserToggle);
    };
  }, [socket, showToast]);

  useEffect(() => {
    if (!isLaserActive) return;

    const handleMouseMove = (event) => {
      const rect = event.target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      socket.emit('laser-move', {
        roomId,
        username: currentUser.username,
        x,
        y,
        color: laserColor,
        timestamp: Date.now()
      });
    };

    // Add event listener to the whiteboard area
    const whiteboardElement = document.querySelector('.whiteboard-canvas') || document.body;
    whiteboardElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      whiteboardElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLaserActive, socket, roomId, currentUser.username, laserColor]);

  const toggleLaser = () => {
    const newState = !isLaserActive;
    setIsLaserActive(newState);
    
    socket.emit('laser-toggle', {
      roomId,
      username: currentUser.username,
      active: newState,
      color: laserColor
    });

    if (newState) {
      showToast('Laser pointer activated! Move your mouse to point', 'success');
    } else {
      showToast('Laser pointer deactivated', 'info');
    }
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Laser Pointer</h3>
        <button
          onClick={toggleLaser}
          className={`px-3 py-1 text-white text-xs rounded-md transition-colors ${
            isLaserActive 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isLaserActive ? '🔴 ON' : '⚫ OFF'}
        </button>
      </div>

      {/* Color selector */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-2">Laser Color:</div>
        <div className="flex flex-wrap gap-1">
          {colors.map(color => (
            <button
              key={color.value}
              onClick={() => setLaserColor(color.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                laserColor === color.value 
                  ? 'border-gray-800 scale-110' 
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Active pointers list */}
      <div className="space-y-2">
        <div className="text-xs text-gray-600">Active Pointers:</div>
        {Object.keys(laserPointers).length === 0 ? (
          <div className="text-xs text-gray-400 italic">No active laser pointers</div>
        ) : (
          <div className="space-y-1">
            {Object.entries(laserPointers).map(([username, pointer]) => (
              <div key={username} className="flex items-center space-x-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: pointer.color }}
                />
                <span className="text-gray-700">{username}</span>
                <span className="text-gray-400">
                  ({Math.round(pointer.x)}%, {Math.round(pointer.y)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <div className="font-medium mb-1">How to use:</div>
        <ul className="space-y-1">
          <li>• Click "ON" to activate laser pointer</li>
          <li>• Move mouse over whiteboard to point</li>
          <li>• Choose different colors for visibility</li>
          <li>• Perfect for presentations!</li>
        </ul>
      </div>

      {/* Render laser pointers */}
      {Object.entries(laserPointers).map(([username, pointer]) => (
        <div
          key={username}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Laser dot */}
          <div
            className="w-4 h-4 rounded-full animate-ping"
            style={{
              backgroundColor: pointer.color,
              boxShadow: `0 0 20px ${pointer.color}`
            }}
          />
          {/* Username label */}
          <div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
            style={{ backgroundColor: pointer.color }}
          >
            {username}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LaserPointer;