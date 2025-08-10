import React, { useState, useRef, useEffect } from 'react';

const VoiceChat = ({ socket, roomId, currentUser, showToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceChatEnabled, setIsVoiceChatEnabled] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for voice messages from other users
    const handleVoiceMessage = (data) => {
      if (data.username !== currentUser.username) {
        playAudioMessage(data.audioData);
        showToast(`🎤 Voice message from ${data.username}`, 'info');
      }
    };

    socket.on('voice-message', handleVoiceMessage);

    return () => {
      socket.off('voice-message', handleVoiceMessage);
      stopVoiceChat();
    };
  }, [socket, currentUser, showToast]);

  const startVoiceChat = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Voice chat not supported in this browser', 'error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setIsVoiceChatEnabled(true);
      showToast('Voice chat enabled!', 'success');
      
      // Set up audio level monitoring
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start monitoring audio levels
      monitorAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      showToast('Failed to access microphone', 'error');
    }
  };

  const stopVoiceChat = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsVoiceChatEnabled(false);
    setIsRecording(false);
    setAudioLevel(0);
    // Removed the toast notification for voice chat disabled
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 255) * 100));
      
      if (isVoiceChatEnabled) {
        requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        sendVoiceMessage(audioBlob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast('Failed to start recording', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    try {
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];
        
        socket.emit('voice-message', {
          roomId,
          username: currentUser.username,
          audioData: base64Audio,
          timestamp: Date.now()
        });
        
        showToast('🎤 Voice message sent', 'success');
      };
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Error sending voice message:', error);
      showToast('Failed to send voice message', 'error');
    }
  };

  const playAudioMessage = (base64Audio) => {
    try {
      const audioBlob = new Blob([
        Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))
      ], { type: 'audio/webm;codecs=opus' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      
      // Clean up URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
    } catch (error) {
      console.error('Error playing voice message:', error);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        showToast(isMuted ? '🎤 Unmuted' : '🔇 Muted', 'info');
      }
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice Chat
        </h3>
        
        {!isVoiceChatEnabled ? (
          <button
            onClick={startVoiceChat}
            className="btn-primary text-xs"
          >
            Enable Voice
          </button>
        ) : (
          <button
            onClick={stopVoiceChat}
            className="btn-danger text-xs"
          >
            Disable Voice
          </button>
        )}
      </div>

      {isVoiceChatEnabled && (
        <div className="space-y-3">
          {/* Audio level indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Level:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Voice controls */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${
                isMuted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-3 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
              title="Hold to record voice message"
              disabled={isMuted}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            {isRecording ? 'Recording... Release to send' : 'Hold microphone button to record'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;