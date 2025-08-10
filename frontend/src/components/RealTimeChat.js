import React, { useState, useEffect, useRef } from 'react';

const RealTimeChat = ({ socket, roomId, currentUser, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        ...data,
        timestamp: new Date(data.timestamp)
      }]);
      
      // Increment unread count if chat is collapsed
      if (!isExpanded && data.username !== currentUser.username) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show toast for new messages when chat is collapsed
      if (!isExpanded && data.username !== currentUser.username) {
        showToast(`💬 ${data.username}: ${data.message.substring(0, 30)}${data.message.length > 30 ? '...' : ''}`, 'info');
      }
    };

    const handleUserTyping = (data) => {
      setIsTyping(prev => ({
        ...prev,
        [data.username]: true
      }));
      
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setIsTyping(prev => {
          const updated = { ...prev };
          delete updated[data.username];
          return updated;
        });
      }, 3000);
    };

    const handleUserStoppedTyping = (data) => {
      setIsTyping(prev => {
        const updated = { ...prev };
        delete updated[data.username];
        return updated;
      });
    };

    socket.on('chat-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.off('chat-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [socket, currentUser.username, isExpanded, showToast]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Clear unread count when chat is expanded
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      roomId,
      message: newMessage.trim(),
      username: currentUser.username,
      timestamp: new Date(),
      type: 'text'
    };

    socket.emit('chat-message', messageData);
    
    // Add to local messages immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      ...messageData
    }]);

    setNewMessage('');
    
    // Stop typing indicator
    socket.emit('user-stopped-typing', {
      roomId,
      username: currentUser.username
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    socket.emit('user-typing', {
      roomId,
      username: currentUser.username
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user-stopped-typing', {
        roomId,
        username: currentUser.username
      });
    }, 1000);
  };

  const sendQuickReaction = (emoji) => {
    const messageData = {
      roomId,
      message: emoji,
      username: currentUser.username,
      timestamp: new Date(),
      type: 'emoji'
    };

    socket.emit('chat-message', messageData);
    setMessages(prev => [...prev, {
      id: Date.now(),
      ...messageData
    }]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserColor = (username) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
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

  const typingUsers = Object.keys(isTyping).filter(user => user !== currentUser.username);

  return (
    <div className="feature-card m-2 chat-container">
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-gray-900 flex items-center">
            <span className="text-xl mr-2">💬</span>
            Live Chat
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse shadow-lg">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">
            {messages.length} messages
          </span>
          <svg 
            className={`h-4 w-4 text-blue-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="text-2xl mb-2">💬</div>
                <div>No messages yet</div>
                <div className="text-xs mt-1">Start the conversation!</div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.username === currentUser.username ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.username === currentUser.username
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    {message.username !== currentUser.username && (
                      <div 
                        className="text-xs font-medium mb-1"
                        style={{ color: getUserColor(message.username) }}
                      >
                        {message.username}
                      </div>
                    )}
                    <div className={`text-sm ${
                      message.type === 'emoji' ? 'text-2xl text-center' : ''
                    }`}>
                      {message.message}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.username === currentUser.username 
                        ? 'text-blue-100' 
                        : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600 ml-2">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reactions */}
          <div className="px-3 py-2 bg-gray-100 border-t border-gray-200">
            <div className="flex space-x-2 justify-center">
              {['👍', '❤️', '😂', '🎉', '🔥', '💡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => sendQuickReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform duration-200 p-1 rounded hover:bg-white"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Press Enter to send • {newMessage.length}/500 characters
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RealTimeChat;