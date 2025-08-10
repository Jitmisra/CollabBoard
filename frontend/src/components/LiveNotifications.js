import React, { useState, useEffect } from 'react';

const LiveNotifications = ({ socket, roomId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const addNotification = (message, type = 'info', icon = '📢') => {
      const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        icon,
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    // Listen to various activities
    socket.on('code-change', (data) => {
      if (data.username !== socket.username) {
        addNotification(`${data.username} is coding in ${data.language || 'JavaScript'}`, 'code', '💻');
      }
    });

    socket.on('mindmap-generated', (data) => {
      if (data.username !== socket.username) {
        addNotification(`${data.username} generated a mind map: "${data.topic}"`, 'mindmap', '🧠');
      }
    });

    socket.on('new-poll', (data) => {
      addNotification(`New poll: "${data.question}"`, 'poll', '📊');
    });

    socket.on('timer-start', (data) => {
      if (data.username !== socket.username) {
        addNotification(`${data.username} started a ${data.mode} timer`, 'timer', '⏰');
      }
    });

    socket.on('theme-change', (data) => {
      if (data.username !== socket.username) {
        addNotification(`${data.username} changed theme to ${data.themeName}`, 'theme', '🎨');
      }
    });

    socket.on('presentation-start', (data) => {
      if (data.presenter !== socket.username) {
        addNotification(`${data.presenter} started presentation mode`, 'presentation', '📺');
      }
    });

    socket.on('file-upload', (data) => {
      if (data.file.uploadedBy !== socket.username) {
        addNotification(`${data.file.uploadedBy} uploaded ${data.file.name}`, 'file', '📎');
      }
    });

    socket.on('laser-toggle', (data) => {
      if (data.username !== socket.username && data.active) {
        addNotification(`${data.username} activated laser pointer`, 'laser', '🔴');
      }
    });

    return () => {
      socket.off('code-change');
      socket.off('mindmap-generated');
      socket.off('new-poll');
      socket.off('timer-start');
      socket.off('theme-change');
      socket.off('presentation-start');
      socket.off('file-upload');
      socket.off('laser-toggle');
    };
  }, [socket]);

  const getNotificationStyle = (type) => {
    const styles = {
      code: 'bg-blue-500 border-blue-400',
      mindmap: 'bg-purple-500 border-purple-400',
      poll: 'bg-green-500 border-green-400',
      timer: 'bg-orange-500 border-orange-400',
      theme: 'bg-pink-500 border-pink-400',
      presentation: 'bg-indigo-500 border-indigo-400',
      file: 'bg-cyan-500 border-cyan-400',
      laser: 'bg-red-500 border-red-400',
      info: 'bg-gray-500 border-gray-400'
    };
    return styles[type] || styles.info;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getNotificationStyle(notification.type)} 
            text-white px-4 py-3 rounded-lg shadow-lg border-l-4 
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right max-w-sm
          `}
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">{notification.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75">
                {notification.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LiveNotifications;