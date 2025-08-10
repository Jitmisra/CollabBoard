import React, { useState, useEffect } from 'react';
import Whiteboard from './Whiteboard';
import NotesEditor from './NotesEditor';
import UsersList from './UsersList';
import RoomHeader from './RoomHeader';
import VoiceChat from './VoiceChat';
import ScreenShare from './ScreenShare';
import AITextRecognition from './AITextRecognition';
import RealTimePolls from './RealTimePolls';
import PomodoroTimer from './PomodoroTimer';
import FileUpload from './FileUpload';
import ActivityFeed from './ActivityFeed';
import QuickTemplates from './QuickTemplates';
import PresentationMode from './PresentationMode';
import RoomAnalytics from './RoomAnalytics';
import CodeEditor from './CodeEditor';
import EmojiReactions from './EmojiReactions';
import LaserPointer from './LaserPointer';
import RoomThemes from './RoomThemes';
import ExportShare from './ExportShare';
import MindMapGenerator from './MindMapGenerator';
import FeatureShowcase from './FeatureShowcase';
import RealTimeChat from './RealTimeChat';
import LiveNotifications from './LiveNotifications';
import AIChatbot from './AIChatbot';
import BackendConnectionTest from './BackendConnectionTest';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Clean Header */}
      <RoomHeader
        user={user}
        roomId={roomId}
        onLeaveRoom={onLeaveRoom}
        showToast={showToast}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Clean Tab Navigation */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-3">
              <nav className="flex space-x-1 overflow-x-auto">
                {[
                  { id: 'whiteboard', label: '🎨 Whiteboard', color: 'blue' },
                  { id: 'notes', label: '📝 Notes', color: 'green' },
                  { id: 'code', label: '💻 Code', color: 'purple' },
                  { id: 'mindmap', label: '🧠 Mind Maps', color: 'pink' },
                  { id: 'polls', label: '📊 Polls', color: 'teal' },
                  { id: 'templates', label: '📋 Templates', color: 'indigo' },
                  { id: 'analytics', label: '📈 Analytics', color: 'orange' },
                  { id: 'files', label: '📎 Files', color: 'cyan' },
                  { id: 'ai', label: '🤖 AI', color: 'violet' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-500 text-white shadow-md`
                        : `text-gray-600 hover:text-${tab.color}-600 hover:bg-${tab.color}-50`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'whiteboard' && (
              <Whiteboard
                socket={socket}
                roomId={roomId}
                initialData={roomData.whiteboardData}
                showToast={showToast}
              />
            )}
            {activeTab === 'notes' && (
              <NotesEditor
                socket={socket}
                roomId={roomId}
                initialContent={roomData.notesData}
                showToast={showToast}
              />
            )}
            {activeTab === 'code' && (
              <div className="h-full p-6 bg-gray-900">
                <CodeEditor
                  socket={socket}
                  roomId={roomId}
                  showToast={showToast}
                />
              </div>
            )}
            {activeTab === 'mindmap' && (
              <div className="h-full p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="max-w-4xl mx-auto">
                  <MindMapGenerator
                    socket={socket}
                    roomId={roomId}
                    showToast={showToast}
                  />
                  <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🧠 AI Mind Map Generator</h3>
                    <p className="text-gray-600 mb-4">
                      Create structured mind maps from any topic using AI. Perfect for brainstorming,
                      project planning, and organizing ideas collaboratively.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-800">📝 Enter Topic</h4>
                        <p className="text-sm text-purple-600">Type any subject or idea</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800">🤖 AI Generation</h4>
                        <p className="text-sm text-blue-600">Smart structure creation</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800">🎨 Apply to Board</h4>
                        <p className="text-sm text-green-600">Visual mind map on canvas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'polls' && (
              <div className="h-full p-6 bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Live Polling System</h2>
                    <p className="text-gray-600">Create interactive polls and make group decisions in real-time</p>
                  </div>
                  <RealTimePolls
                    socket={socket}
                    roomId={roomId}
                    currentUser={user}
                    showToast={showToast}
                  />
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">✨ Features</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Real-time voting with live results</li>
                        <li>• Multiple choice questions</li>
                        <li>• Visual progress bars</li>
                        <li>• Instant notifications</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">🎯 Use Cases</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Team decision making</li>
                        <li>• Meeting feedback</li>
                        <li>• Quick surveys</li>
                        <li>• Brainstorming votes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'templates' && (
              <div className="h-full p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Quick Templates</h2>
                    <p className="text-gray-600">Professional templates for meetings, planning, and collaboration</p>
                  </div>
                  <QuickTemplates
                    socket={socket}
                    roomId={roomId}
                    showToast={showToast}
                  />
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">📋 Meeting Agenda</h3>
                      <p className="text-sm text-gray-600">Structured meeting format with time slots</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">💡 Brainstorming</h3>
                      <p className="text-sm text-gray-600">Creative ideation framework</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">📊 SWOT Analysis</h3>
                      <p className="text-sm text-gray-600">Strategic planning matrix</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="h-full p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Room Analytics</h2>
                    <p className="text-gray-600">Real-time insights and collaboration metrics</p>
                  </div>
                  <RoomAnalytics
                    socket={socket}
                    roomId={roomId}
                    users={users}
                  />
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                      <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                      <div className="text-3xl font-bold text-green-600">{Math.floor(Math.random() * 50 + 10)}</div>
                      <div className="text-sm text-gray-600">Actions Today</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                      <div className="text-3xl font-bold text-purple-600">{Math.floor(Math.random() * 60 + 15)}m</div>
                      <div className="text-sm text-gray-600">Session Time</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'files' && (
              <div className="h-full p-6 bg-gradient-to-br from-cyan-50 to-blue-50">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📎 File Sharing</h2>
                    <p className="text-gray-600">Upload and share files with your team in real-time</p>
                  </div>
                  <FileUpload
                    socket={socket}
                    roomId={roomId}
                    showToast={showToast}
                  />
                  <div className="mt-6">
                    <ExportShare
                      socket={socket}
                      roomId={roomId}
                      showToast={showToast}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">📤 Upload</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Images (PNG, JPG, GIF)</li>
                        <li>• Documents (PDF, TXT)</li>
                        <li>• Drag & drop support</li>
                        <li>• 5MB file size limit</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-2">📥 Export</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• PNG image exports</li>
                        <li>• PDF documents</li>
                        <li>• JSON data format</li>
                        <li>• HTML web pages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'ai' && (
              <div className="h-full p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI Assistant</h2>
                    <p className="text-gray-600">Powered by Google Gemini - Your intelligent collaboration partner</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <AIChatbot
                        socket={socket}
                        roomId={roomId}
                        showToast={showToast}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">🧠 AI Capabilities</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Brainstorming assistance</li>
                          <li>• Code review & suggestions</li>
                          <li>• Project planning help</li>
                          <li>• Meeting facilitation</li>
                          <li>• Content generation</li>
                          <li>• Problem solving</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">⚡ Quick Actions</h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => showToast('Ask AI: "Help me plan our sprint"', 'info')}
                            className="w-full text-left p-2 text-sm bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                          >
                            📋 Sprint Planning
                          </button>
                          <button
                            onClick={() => showToast('Ask AI: "Review this code structure"', 'info')}
                            className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            💻 Code Review
                          </button>
                          <button
                            onClick={() => showToast('Ask AI: "Generate meeting agenda"', 'info')}
                            className="w-full text-left p-2 text-sm bg-green-50 hover:bg-green-100 rounded transition-colors"
                          >
                            📝 Meeting Prep
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                        <h3 className="font-bold text-purple-800 mb-2">🚀 Powered by Gemini</h3>
                        <p className="text-sm text-purple-700">
                          Advanced AI model with real-time responses and collaborative intelligence.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <FeatureShowcase showToast={showToast} />
            <RealTimeChat
              socket={socket}
              roomId={roomId}
              currentUser={user}
              showToast={showToast}
            />
            <AIChatbot
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <UsersList users={users} currentUser={user.username} />
            <AITextRecognition
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <RealTimePolls
              socket={socket}
              roomId={roomId}
              currentUser={user}
              showToast={showToast}
            />
            <PomodoroTimer
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <FileUpload
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <QuickTemplates
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <MindMapGenerator
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <PresentationMode
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <CodeEditor
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <EmojiReactions
              socket={socket}
              roomId={roomId}
            />
            <LaserPointer
              socket={socket}
              roomId={roomId}
              currentUser={user}
              showToast={showToast}
            />
            <RoomThemes
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <ExportShare
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
            <RoomAnalytics
              socket={socket}
              roomId={roomId}
              users={users}
            />
            <ActivityFeed
              socket={socket}
              roomId={roomId}
            />
            <BackendConnectionTest
              socket={socket}
              roomId={roomId}
              showToast={showToast}
            />
          </div>
          <ScreenShare
            socket={socket}
            roomId={roomId}
            currentUser={user}
            showToast={showToast}
          />
          <VoiceChat
            socket={socket}
            roomId={roomId}
            currentUser={user}
            showToast={showToast}
          />
        </div>
      </div>

      {/* Live Notifications */}
      <LiveNotifications socket={socket} roomId={roomId} />

      {/* Clean Mobile Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 z-50">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'whiteboard', label: '🎨', name: 'Board' },
            { id: 'notes', label: '📝', name: 'Notes' },
            { id: 'code', label: '💻', name: 'Code' },
            { id: 'mindmap', label: '🧠', name: 'Mind' },
            { id: 'polls', label: '📊', name: 'Polls' },
            { id: 'ai', label: '🤖', name: 'AI' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap flex flex-col items-center ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">{tab.label}</span>
              <span className="text-xs">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationRoom;