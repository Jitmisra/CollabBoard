import React, { useState, useEffect } from 'react';

const RoomThemes = ({ socket, roomId, showToast }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemes, setShowThemes] = useState(false);

  const themes = [
    {
      id: 'default',
      name: 'Default',
      icon: '🎨',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        accent: '#06b6d4'
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: '🌙',
      colors: {
        primary: '#6366f1',
        secondary: '#94a3b8',
        background: '#0f172a',
        surface: '#1e293b',
        accent: '#8b5cf6'
      }
    },
    {
      id: 'ocean',
      name: 'Ocean',
      icon: '🌊',
      colors: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        background: '#f0f9ff',
        surface: '#e0f2fe',
        accent: '#06b6d4'
      }
    },
    {
      id: 'forest',
      name: 'Forest',
      icon: '🌲',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        background: '#f0fdf4',
        surface: '#dcfce7',
        accent: '#10b981'
      }
    },
    {
      id: 'sunset',
      name: 'Sunset',
      icon: '🌅',
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        background: '#fffbeb',
        surface: '#fef3c7',
        accent: '#f97316'
      }
    },
    {
      id: 'purple',
      name: 'Purple',
      icon: '💜',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        background: '#faf5ff',
        surface: '#f3e8ff',
        accent: '#a855f7'
      }
    },
    {
      id: 'neon',
      name: 'Neon',
      icon: '⚡',
      colors: {
        primary: '#00ff88',
        secondary: '#ff0088',
        background: '#000011',
        surface: '#001122',
        accent: '#00ffff'
      }
    },
    {
      id: 'retro',
      name: 'Retro',
      icon: '📼',
      colors: {
        primary: '#ff6b9d',
        secondary: '#c44569',
        background: '#f8f3ff',
        surface: '#f1e7ff',
        accent: '#f8b500'
      }
    }
  ];

  useEffect(() => {
    if (!socket) return;

    const handleThemeChange = (data) => {
      setCurrentTheme(data.theme);
      applyTheme(data.theme);
      showToast(`Theme changed to ${data.themeName} by ${data.username}`, 'info');
    };

    socket.on('theme-change', handleThemeChange);

    return () => {
      socket.off('theme-change', handleThemeChange);
    };
  }, [socket, showToast]);

  const applyTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-accent', theme.colors.accent);

    // Apply to body for immediate effect
    document.body.style.backgroundColor = theme.colors.background;
    
    // Update sidebar and components
    const sidebar = document.querySelector('.w-80.bg-white');
    if (sidebar) {
      sidebar.style.backgroundColor = theme.colors.surface;
    }

    // Update whiteboard background
    const whiteboard = document.querySelector('.whiteboard-canvas');
    if (whiteboard) {
      whiteboard.style.backgroundColor = theme.colors.background;
    }
  };

  const changeTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(themeId);
    applyTheme(themeId);

    socket.emit('theme-change', {
      roomId,
      theme: themeId,
      themeName: theme.name,
      username: socket.username,
      colors: theme.colors
    });

    showToast(`Theme changed to ${theme.name}!`, 'success');
    setShowThemes(false);
  };

  const resetTheme = () => {
    changeTheme('default');
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Room Themes</h3>
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700"
        >
          {showThemes ? 'Hide' : 'Change'} Theme
        </button>
      </div>

      {/* Current theme display */}
      <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-md">
        <span className="text-lg">{currentThemeData?.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-medium">{currentThemeData?.name}</div>
          <div className="flex space-x-1 mt-1">
            {currentThemeData && Object.values(currentThemeData.colors).slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Theme selector */}
      {showThemes && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition-all ${
                currentTheme === theme.id
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <span className="text-xl">{theme.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{theme.name}</div>
                <div className="flex space-x-1 mt-1">
                  {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {currentTheme === theme.id && (
                <div className="text-purple-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Theme controls */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={resetTheme}
          className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
        >
          Reset to Default
        </button>
      </div>

      {/* Theme info */}
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <div className="font-medium mb-1">💡 Pro Tip:</div>
        <div>Themes sync across all users in real-time! Perfect for setting the mood for different types of sessions.</div>
      </div>
    </div>
  );
};

export default RoomThemes;