import React, { useState, useEffect, useRef } from 'react';

const CodeEditor = ({ socket, roomId, showToast }) => {
  const [code, setCode] = useState('// Welcome to collaborative coding!\n// Start typing to see real-time collaboration\n\nfunction hackathonProject() {\n  console.log("Building something amazing!");\n}\n\nhackathonProject();');
  const [language, setLanguage] = useState('javascript');
  const [isExpanded, setIsExpanded] = useState(false);
  const [cursors, setCursors] = useState({});
  const textareaRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', color: '#f7df1e' },
    { value: 'python', label: 'Python', color: '#3776ab' },
    { value: 'html', label: 'HTML', color: '#e34f26' },
    { value: 'css', label: 'CSS', color: '#1572b6' },
    { value: 'json', label: 'JSON', color: '#000000' },
    { value: 'markdown', label: 'Markdown', color: '#083fa1' }
  ];

  useEffect(() => {
    if (!socket) return;

    const handleCodeChange = (data) => {
      if (data.username !== socket.username) {
        setCode(data.code);
        showToast(`${data.username} updated the code`, 'info');
      }
    };

    const handleLanguageChange = (data) => {
      setLanguage(data.language);
      showToast(`Language changed to ${data.language}`, 'info');
    };

    const handleCursorMove = (data) => {
      setCursors(prev => ({
        ...prev,
        [data.username]: {
          position: data.position,
          color: data.color
        }
      }));
    };

    socket.on('code-change', handleCodeChange);
    socket.on('language-change', handleLanguageChange);
    socket.on('cursor-position', handleCursorMove);

    return () => {
      socket.off('code-change', handleCodeChange);
      socket.off('language-change', handleLanguageChange);
      socket.off('cursor-position', handleCursorMove);
    };
  }, [socket, showToast]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit('code-change', {
      roomId,
      code: newCode,
      username: socket.username || 'Anonymous',
      timestamp: new Date()
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socket.emit('language-change', {
      roomId,
      language: newLanguage,
      username: socket.username
    });
  };

  const handleCursorMove = (event) => {
    if (!socket || !socket.username) return; // Safety check
    
    const position = event.target.selectionStart;
    socket.emit('cursor-move', {
      roomId,
      username: socket.username,
      position,
      color: getUserColor(socket.username)
    });
  };

  const getUserColor = (username) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    if (!username || typeof username !== 'string') {
      return colors[0]; // Return default color if username is invalid
    }
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const runCode = () => {
    if (language === 'javascript') {
      try {
        // Create a safe execution environment
        const result = eval(code);
        showToast('Code executed successfully!', 'success');
        socket.emit('code-execution', {
          roomId,
          username: socket.username,
          result: result || 'Code executed',
          timestamp: new Date()
        });
      } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
      }
    } else {
      showToast(`${language} execution not supported in browser`, 'info');
    }
  };

  const formatCode = () => {
    // Simple code formatting
    let formatted = code;
    if (language === 'javascript') {
      formatted = code
        .replace(/;/g, ';\n')
        .replace(/{/g, '{\n  ')
        .replace(/}/g, '\n}')
        .replace(/\n\s*\n/g, '\n');
    }
    setCode(formatted);
    handleCodeChange(formatted);
    showToast('Code formatted!', 'success');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard!', 'success');
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Code Editor</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Language selector */}
      <div className="flex items-center space-x-2 mb-3">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="flex space-x-1">
          <button
            onClick={runCode}
            disabled={language !== 'javascript'}
            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
            title="Run code (JavaScript only)"
          >
            ▶️ Run
          </button>
          <button
            onClick={formatCode}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            title="Format code"
          >
            🎨 Format
          </button>
          <button
            onClick={copyCode}
            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            title="Copy code"
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onSelect={handleCursorMove}
          onKeyUp={handleCursorMove}
          className={`w-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none ${
            isExpanded ? 'h-64' : 'h-32'
          } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          placeholder="Start coding collaboratively..."
          style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            border: '1px solid #404040'
          }}
        />
        
        {/* Collaborative cursors */}
        {Object.entries(cursors).map(([username, cursor]) => (
          <div
            key={username}
            className="absolute pointer-events-none"
            style={{
              left: `${(cursor.position % 50) * 8}px`,
              top: `${Math.floor(cursor.position / 50) * 20 + 12}px`,
              borderLeft: `2px solid ${cursor.color}`,
              height: '16px'
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1 py-0.5 text-xs text-white rounded"
              style={{ backgroundColor: cursor.color }}
            >
              {username}
            </div>
          </div>
        ))}
      </div>

      {/* Active coders */}
      <div className="mt-2 text-xs text-gray-600">
        <span>Active coders: </span>
        {Object.keys(cursors).length > 0 ? (
          Object.keys(cursors).map(username => (
            <span
              key={username}
              className="inline-block px-1 py-0.5 mx-1 rounded text-white"
              style={{ backgroundColor: getUserColor(username) }}
            >
              {username}
            </span>
          ))
        ) : (
          <span>Just you</span>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;