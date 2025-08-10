import React, { useState, useEffect, useRef } from 'react';
import { GEMINI_API_URL, GEMINI_API_KEY } from '../config/api';

const AIChatbot = ({ socket, roomId, showToast }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "👋 Hi! I'm your AI assistant powered by Gemini. I can help you with brainstorming, code review, project planning, and more. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  // API key and URL are now imported from config/api.js

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToGemini = async (userMessage) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI assistant for a collaborative whiteboard platform. The user is working on: "${userMessage}". 
                  
                  Context: This is a professional collaboration platform with features like:
                  - Real-time whiteboard drawing
                  - Code editor for collaborative coding
                  - Mind map generation
                  - Live polls and voting
                  - File sharing and templates
                  - Voice chat and screen sharing
                  
                  Please provide helpful, concise responses (max 150 words) that are relevant to collaboration, productivity, or the specific question asked. Be friendly and professional.
                  
                  User message: ${userMessage}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "I'm sorry, I couldn't process that request. Please try again.";
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Send to other users in the room
    socket.emit('ai-chat-message', {
      roomId,
      message: newUserMessage,
      type: 'user-to-ai'
    });

    try {
      // Get AI response
      const aiResponse = await sendToGemini(userMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Send AI response to other users
      socket.emit('ai-chat-message', {
        roomId,
        message: aiMessage,
        type: 'ai-response'
      });

      showToast('🤖 AI assistant responded', 'success');
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: "I apologize, but I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Help me brainstorm ideas for our project",
    "Review this code for improvements",
    "Suggest a meeting agenda structure",
    "What's a good project timeline?",
    "Help me organize these thoughts",
    "Explain this concept simply"
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  useEffect(() => {
    if (!socket) return;

    const handleAIChatMessage = (data) => {
      setMessages(prev => [...prev, data.message]);
    };

    socket.on('ai-chat-message', handleAIChatMessage);

    return () => {
      socket.off('ai-chat-message', handleAIChatMessage);
    };
  }, [socket]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="feature-card m-2">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-gray-900 flex items-center">
            <span className="text-xl mr-2">🤖</span>
            AI Assistant
          </h3>
          <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full">
            Gemini
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">
            {messages.length} messages
          </span>
          <svg 
            className={`h-4 w-4 text-purple-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
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
          <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-purple-50/30 to-blue-50/30">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white border border-purple-200 shadow-sm'
                }`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🤖</span>
                      <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                    </div>
                  )}
                  <div className={`text-sm ${message.type === 'ai' ? 'text-gray-700' : 'text-white'}`}>
                    {message.message}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-purple-200 px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-purple-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-purple-50 border-t border-purple-100">
            <div className="text-xs font-medium text-purple-800 mb-2">Quick prompts:</div>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-2 py-1 bg-white text-purple-700 text-xs rounded border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask AI anything about your project..."
                className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isLoading}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Powered by Google Gemini • {inputMessage.length}/500 characters
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;