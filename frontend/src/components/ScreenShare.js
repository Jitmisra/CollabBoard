import React, { useState, useRef, useEffect } from 'react';

const ScreenShare = ({ socket, roomId, currentUser, showToast }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [sharedScreen, setSharedScreen] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for screen share events
    const handleScreenShareStart = (data) => {
      if (data.username !== currentUser.username) {
        setSharedScreen(data);
        showToast(`📺 ${data.username} started screen sharing`, 'info');
      }
    };

    const handleScreenShareStop = (data) => {
      if (data.username !== currentUser.username) {
        setSharedScreen(null);
        setIsWatching(false);
        showToast(`📺 ${data.username} stopped screen sharing`, 'info');
      }
    };

    const handleScreenShareData = (data) => {
      if (data.username !== currentUser.username && isWatching) {
        // Display screen share data (this would be more complex in a real implementation)
        console.log('Received screen share data:', data);
      }
    };

    socket.on('screen-share-start', handleScreenShareStart);
    socket.on('screen-share-stop', handleScreenShareStop);
    socket.on('screen-share-data', handleScreenShareData);

    return () => {
      socket.off('screen-share-start', handleScreenShareStart);
      socket.off('screen-share-stop', handleScreenShareStop);
      socket.off('screen-share-data', handleScreenShareData);
      stopScreenShare();
    };
  }, [socket, currentUser, isWatching, showToast]);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      });

      streamRef.current = stream;
      setIsSharing(true);

      // Notify other users
      socket.emit('screen-share-start', {
        roomId,
        username: currentUser.username,
        timestamp: Date.now()
      });

      // Handle stream end (when user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      showToast('📺 Screen sharing started', 'success');

      // In a real implementation, you would capture frames and send them
      // For now, we'll just simulate the sharing
      simulateScreenShare();

    } catch (error) {
      console.error('Error starting screen share:', error);
      showToast('Failed to start screen sharing', 'error');
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (isSharing) {
      socket.emit('screen-share-stop', {
        roomId,
        username: currentUser.username,
        timestamp: Date.now()
      });
    }

    setIsSharing(false);
    // Removed the toast notification for screen sharing stopped
  };

  const simulateScreenShare = () => {
    // In a real implementation, this would capture and send screen data
    const interval = setInterval(() => {
      if (!isSharing || !streamRef.current) {
        clearInterval(interval);
        return;
      }

      // Simulate sending screen data
      socket.emit('screen-share-data', {
        roomId,
        username: currentUser.username,
        timestamp: Date.now(),
        // In reality, this would be compressed image data
        data: 'simulated-screen-data'
      });
    }, 1000); // Send updates every second
  };

  const watchScreenShare = () => {
    setIsWatching(true);
    showToast(`📺 Watching ${sharedScreen.username}'s screen`, 'info');
  };

  const stopWatching = () => {
    setIsWatching(false);
    // Removed the toast notification for stopped watching
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Screen Share
        </h3>
      </div>

      {/* Screen sharing controls */}
      <div className="space-y-3">
        {!isSharing ? (
          <button
            onClick={startScreenShare}
            className="w-full btn-primary text-sm flex items-center justify-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Screen
          </button>
        ) : (
          <button
            onClick={stopScreenShare}
            className="w-full btn-danger text-sm flex items-center justify-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            Stop Sharing
          </button>
        )}

        {/* Show shared screen info */}
        {sharedScreen && sharedScreen.username !== currentUser.username && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {sharedScreen.username} is sharing
                </p>
                <p className="text-xs text-blue-700">
                  Screen share available
                </p>
              </div>
              
              {!isWatching ? (
                <button
                  onClick={watchScreenShare}
                  className="btn-primary text-xs"
                >
                  Watch
                </button>
              ) : (
                <button
                  onClick={stopWatching}
                  className="btn-secondary text-xs"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        )}

        {/* Screen share viewer */}
        {isWatching && sharedScreen && (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="bg-gray-800 rounded-lg p-8 mb-2">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-sm">
                Screen Share Preview
              </p>
              <p className="text-gray-500 text-xs mt-1">
                (Demo - Real implementation would show actual screen)
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Watching {sharedScreen.username}'s screen
            </p>
          </div>
        )}

        {isSharing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm text-green-800">
                Your screen is being shared
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenShare;