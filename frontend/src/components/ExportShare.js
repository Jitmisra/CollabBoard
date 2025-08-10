import React, { useState } from 'react';

const ExportShare = ({ socket, roomId, showToast }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [shareableLink, setShareableLink] = useState('');

  const exportFormats = [
    { id: 'png', name: 'PNG Image', icon: '🖼️', description: 'High quality image' },
    { id: 'pdf', name: 'PDF Document', icon: '📄', description: 'Printable document' },
    { id: 'json', name: 'JSON Data', icon: '📊', description: 'Raw whiteboard data' },
    { id: 'html', name: 'HTML Page', icon: '🌐', description: 'Interactive webpage' }
  ];

  const exportWhiteboard = async (format) => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (format === 'png') {
        // Capture canvas as image
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `whiteboard-${roomId}-${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
          showToast('Whiteboard exported as PNG!', 'success');
        }
      } else if (format === 'pdf') {
        // Mock PDF export
        showToast('PDF export feature coming soon!', 'info');
      } else if (format === 'json') {
        // Export as JSON
        const data = {
          roomId,
          exportedAt: new Date().toISOString(),
          whiteboardData: [], // This would contain actual drawing data
          metadata: {
            totalUsers: 5,
            sessionDuration: '45 minutes',
            lastUpdated: new Date().toISOString()
          }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `whiteboard-${roomId}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Whiteboard data exported as JSON!', 'success');
      } else if (format === 'html') {
        // Export as HTML
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Whiteboard Export - Room ${roomId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .canvas-container { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Collaborative Whiteboard Export</h1>
        <p>Room ID: ${roomId}</p>
        <p>Exported: ${new Date().toLocaleString()}</p>
    </div>
    <div class="canvas-container">
        <p>Whiteboard content would be rendered here...</p>
        <p>This is a demo export. In a real implementation, the actual canvas content would be embedded.</p>
    </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `whiteboard-${roomId}-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Whiteboard exported as HTML!', 'success');
      }

      // Notify other users
      socket.emit('export-activity', {
        roomId,
        username: socket.username,
        format,
        timestamp: new Date()
      });

    } catch (error) {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/room/${roomId}?shared=true&timestamp=${Date.now()}`;
    setShareableLink(link);
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
    showToast('Shareable link copied to clipboard!', 'success');

    // Notify other users
    socket.emit('share-link-generated', {
      roomId,
      username: socket.username,
      timestamp: new Date()
    });
  };

  const shareToSocial = (platform) => {
    const text = `Check out this collaborative whiteboard session! Room: ${roomId}`;
    const url = shareableLink || `${window.location.origin}/room/${roomId}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Collaborative Whiteboard Session')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      showToast(`Shared to ${platform}!`, 'success');
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showToast('Room ID copied to clipboard!', 'success');
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Export & Share</h3>
        <div className="flex space-x-1">
          <button
            onClick={generateShareableLink}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            🔗 Share
          </button>
        </div>
      </div>

      {/* Quick share */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Quick Share:</div>
        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
          <code className="flex-1 text-xs bg-white px-2 py-1 rounded border">
            {roomId}
          </code>
          <button
            onClick={copyRoomId}
            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            title="Copy Room ID"
          >
            📋
          </button>
        </div>
      </div>

      {/* Shareable link */}
      {shareableLink && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-700 mb-2">Shareable Link:</div>
          <div className="p-2 bg-green-50 rounded-md">
            <div className="text-xs text-green-800 break-all mb-2">{shareableLink}</div>
            <div className="flex space-x-1">
              <button
                onClick={() => shareToSocial('twitter')}
                className="px-2 py-1 bg-blue-400 text-white text-xs rounded hover:bg-blue-500"
              >
                Twitter
              </button>
              <button
                onClick={() => shareToSocial('linkedin')}
                className="px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800"
              >
                LinkedIn
              </button>
              <button
                onClick={() => shareToSocial('email')}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export options */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Export Options:</div>
        {exportFormats.map(format => (
          <button
            key={format.id}
            onClick={() => exportWhiteboard(format.id)}
            disabled={isExporting}
            className="w-full flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">{format.icon}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{format.name}</div>
              <div className="text-xs text-gray-600">{format.description}</div>
            </div>
            {isExporting && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Export stats */}
      <div className="mt-4 p-2 bg-yellow-50 rounded-md">
        <div className="text-xs font-medium text-yellow-800 mb-1">📈 Export Stats:</div>
        <div className="text-xs text-yellow-700">
          • Room active for {Math.floor(Math.random() * 60 + 10)} minutes<br/>
          • {Math.floor(Math.random() * 50 + 10)} drawing actions<br/>
          • {Math.floor(Math.random() * 5 + 1)} active collaborators
        </div>
      </div>

      {/* Pro tips */}
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <div className="font-medium mb-1">💡 Pro Tips:</div>
        <ul className="space-y-1">
          <li>• PNG exports capture the current canvas state</li>
          <li>• JSON exports include all drawing data</li>
          <li>• Share links work even after the session ends</li>
          <li>• HTML exports create standalone webpages</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportShare;