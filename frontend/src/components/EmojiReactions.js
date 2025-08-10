import React, { useState, useEffect } from 'react';

const EmojiReactions = ({ socket, roomId }) => {
  const [reactions, setReactions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = [
    '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', 
    '🔥', '💡', '✨', '⚡', '🚀', '💯', '👏', '🤔',
    '💪', '🎯', '🏆', '⭐', '💎', '🌟', '🎊', '🎈'
  ];

  useEffect(() => {
    if (!socket) return;

    const handleReaction = (data) => {
      const reactionId = Date.now() + Math.random();
      const newReaction = {
        id: reactionId,
        emoji: data.emoji,
        x: data.x,
        y: data.y,
        username: data.username,
        timestamp: new Date()
      };

      setReactions(prev => [...prev, newReaction]);

      // Remove reaction after animation
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reactionId));
      }, 3000);
    };

    socket.on('emoji-reaction', handleReaction);

    return () => {
      socket.off('emoji-reaction', handleReaction);
    };
  }, [socket]);

  const sendReaction = (emoji, event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    socket.emit('emoji-reaction', {
      roomId,
      emoji,
      x: Math.random() * 300 + 50, // Random position for now
      y: Math.random() * 200 + 50,
      username: socket.username || 'Anonymous',
      timestamp: new Date()
    });

    setShowEmojiPicker(false);
  };

  const quickReact = (emoji) => {
    socket.emit('emoji-reaction', {
      roomId,
      emoji,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      username: socket.username,
      timestamp: new Date()
    });
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Live Reactions</h3>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600"
        >
          😀 React
        </button>
      </div>

      {/* Quick reactions */}
      <div className="flex flex-wrap gap-1 mb-3">
        {['👍', '❤️', '😂', '🔥', '💡', '🎉'].map(emoji => (
          <button
            key={emoji}
            onClick={() => quickReact(emoji)}
            className="text-lg hover:scale-125 transition-transform duration-200 p-1 rounded hover:bg-gray-100"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="grid grid-cols-6 gap-1 p-2 bg-gray-50 rounded-md mb-3 max-h-32 overflow-y-auto">
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={(e) => sendReaction(emoji, e)}
              className="text-lg hover:scale-125 transition-transform duration-200 p-1 rounded hover:bg-white"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Floating reactions */}
      <div className="relative h-20 overflow-hidden bg-gradient-to-t from-blue-50 to-transparent rounded-md">
        {reactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${reaction.x}%`,
              top: `${reaction.y}%`,
              animation: 'float 3s ease-out forwards'
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-xs text-gray-600 bg-white px-1 rounded shadow">
                {reaction.username}
              </span>
            </div>
          </div>
        ))}
        
        {reactions.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No reactions yet - be the first to react!
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-30px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-60px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EmojiReactions;