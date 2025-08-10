import React, { useState, useEffect, useRef } from 'react';

const PomodoroTimer = ({ socket, roomId, showToast }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const modes = {
    work: { duration: 25 * 60, label: 'Work', color: 'bg-red-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  };

  useEffect(() => {
    if (!socket) return;

    const handleTimerSync = (data) => {
      setTimeLeft(data.timeLeft);
      setIsActive(data.isActive);
      setMode(data.mode);
      setSessions(data.sessions);
    };

    const handleTimerStart = (data) => {
      showToast(`Timer started: ${data.mode}`, 'info');
    };

    const handleTimerComplete = (data) => {
      showToast(`${data.mode} session completed!`, 'success');
      // Play notification sound
      playNotificationSound();
    };

    socket.on('timer-sync', handleTimerSync);
    socket.on('timer-start', handleTimerStart);
    socket.on('timer-complete', handleTimerComplete);

    return () => {
      socket.off('timer-sync', handleTimerSync);
      socket.off('timer-start', handleTimerStart);
      socket.off('timer-complete', handleTimerComplete);
    };
  }, [socket, showToast]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    setIsActive(true);
    socket.emit('timer-start', {
      roomId,
      mode,
      timeLeft,
      sessions
    });
  };

  const pauseTimer = () => {
    setIsActive(false);
    socket.emit('timer-pause', { roomId });
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].duration);
    socket.emit('timer-reset', { roomId, mode });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsActive(false);
    socket.emit('timer-mode-change', { roomId, mode: newMode });
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      // Auto-switch to break
      const nextMode = newSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(modes[nextMode].duration);
      
      socket.emit('timer-complete', {
        roomId,
        completedMode: mode,
        nextMode,
        sessions: newSessions
      });
    } else {
      // Break completed, switch to work
      setMode('work');
      setTimeLeft(modes.work.duration);
      
      socket.emit('timer-complete', {
        roomId,
        completedMode: mode,
        nextMode: 'work',
        sessions
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Pomodoro Timer</h3>
        
        {/* Mode Selector */}
        <div className="flex justify-center mb-3 space-x-1">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-2 py-1 text-xs rounded ${
                mode === key 
                  ? `${modeData.color} text-white` 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {modeData.label}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative mb-4">
          <div className={`w-24 h-24 mx-auto rounded-full ${modes[mode].color} flex items-center justify-center relative overflow-hidden`}>
            <div 
              className="absolute inset-0 bg-white opacity-20"
              style={{
                background: `conic-gradient(from 0deg, transparent ${progress}%, rgba(255,255,255,0.3) ${progress}%)`
              }}
            ></div>
            <span className="text-white font-mono text-lg font-bold relative z-10">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-2 mb-3">
          <button
            onClick={isActive ? pauseTimer : startTimer}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isActive 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        {/* Session Counter */}
        <div className="text-xs text-gray-600">
          Sessions completed: {sessions}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;