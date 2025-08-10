import React, { useState } from 'react';

const AITextRecognition = ({ socket, roomId, showToast }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const processDrawingToText = async (canvasData) => {
    setIsProcessing(true);
    try {
      // Simulate AI text recognition (in real app, you'd use OCR API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock recognized text based on drawing patterns
      const mockTexts = [
        "Meeting Notes: Discuss project timeline",
        "Ideas: Innovation, Collaboration, Growth",
        "Action Items: 1. Review code 2. Update docs",
        "Brainstorm: New features for Q2",
        "Goals: Increase user engagement by 25%"
      ];
      
      const text = mockTexts[Math.floor(Math.random() * mockTexts.length)];
      setRecognizedText(text);
      
      // Send to other users
      socket.emit('ai-text-recognized', {
        roomId,
        text,
        timestamp: new Date(),
        user: socket.username
      });
      
      showToast('Text recognized from drawing!', 'success');
    } catch (error) {
      showToast('Failed to recognize text', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recognizedText);
    showToast('Text copied to clipboard!', 'success');
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">AI Text Recognition</h3>
        <button
          onClick={() => processDrawingToText()}
          disabled={isProcessing}
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
              Processing...
            </div>
          ) : (
            'Recognize Text'
          )}
        </button>
      </div>
      
      {recognizedText && (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-700 mb-2">{recognizedText}</p>
          <button
            onClick={copyToClipboard}
            className="text-xs text-purple-600 hover:text-purple-800"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default AITextRecognition;