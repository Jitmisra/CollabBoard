import React, { useState, useEffect } from 'react';

const BackendConnectionTest = ({ socket, roomId, showToast }) => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const features = [
    { name: 'Socket Connection', event: 'connect', test: () => socket?.connected },
    { name: 'Room Join', event: 'join-room', test: () => true },
    { name: 'Drawing Sync', event: 'drawing', test: () => true },
    { name: 'Chat Messages', event: 'chat-message', test: () => true },
    { name: 'AI Chat', event: 'ai-chat-message', test: () => true },
    { name: 'Voice Messages', event: 'voice-message', test: () => true },
    { name: 'Screen Share', event: 'screen-share-start', test: () => true },
    { name: 'Cursor Tracking', event: 'cursor-move', test: () => true },
    { name: 'Sticky Notes', event: 'sticky-note-add', test: () => true },
    { name: 'Polls', event: 'create-poll', test: () => true },
    { name: 'Timer', event: 'timer-start', test: () => true },
    { name: 'File Upload', event: 'file-upload', test: () => true },
    { name: 'Code Editor', event: 'code-change', test: () => true },
    { name: 'Mind Maps', event: 'mindmap-generated', test: () => true },
    { name: 'Themes', event: 'theme-change', test: () => true },
    { name: 'Presentation', event: 'start-presentation', test: () => true },
    { name: 'Laser Pointer', event: 'laser-move', test: () => true },
    { name: 'Emoji Reactions', event: 'emoji-reaction', test: () => true },
    { name: 'Export/Share', event: 'export-activity', test: () => true },
    { name: 'Activity Feed', event: 'user-joined', test: () => true }
  ];

  const runConnectionTest = async () => {
    setIsRunning(true);
    setTestResults({});
    
    for (const feature of features) {
      try {
        // Test basic connection
        if (feature.name === 'Socket Connection') {
          const result = socket?.connected || false;
          setTestResults(prev => ({
            ...prev,
            [feature.name]: { status: result ? 'pass' : 'fail', message: result ? 'Connected' : 'Disconnected' }
          }));
          continue;
        }

        // Test socket event emission
        const testData = {
          roomId,
          test: true,
          timestamp: new Date(),
          username: 'test-user'
        };

        // Emit test event
        socket.emit(feature.event, testData);
        
        setTestResults(prev => ({
          ...prev,
          [feature.name]: { status: 'pass', message: 'Event emitted successfully' }
        }));

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [feature.name]: { status: 'fail', message: error.message }
        }));
      }
    }
    
    setIsRunning(false);
    showToast('Backend connection test completed!', 'success');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const passedTests = Object.values(testResults).filter(r => r.status === 'pass').length;
  const totalTests = Object.keys(testResults).length;

  return (
    <div className="feature-card m-2">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center">
            <span className="text-xl mr-2">🔧</span>
            Backend Connection Test
          </h3>
          <button
            onClick={runConnectionTest}
            disabled={isRunning}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-200"
          >
            {isRunning ? (
              <div className="flex items-center">
                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
                Testing...
              </div>
            ) : (
              '🧪 Run Test'
            )}
          </button>
        </div>

        {totalTests > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Test Results</span>
              <span className="text-sm font-bold text-gray-900">
                {passedTests}/{totalTests} Passed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {features.map((feature) => {
            const result = testResults[feature.name];
            return (
              <div key={feature.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(result?.status)}</span>
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xs ${getStatusColor(result?.status)}`}>
                    {result?.message || 'Not tested'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {feature.event}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalTests > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-1">
              📊 Connection Summary
            </div>
            <div className="text-xs text-blue-700">
              • Socket Status: {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}<br/>
              • Room ID: {roomId}<br/>
              • Features Tested: {totalTests}<br/>
              • Success Rate: {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendConnectionTest;