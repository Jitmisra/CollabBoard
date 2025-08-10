import React, { useState } from 'react';

const FeatureShowcase = ({ showToast }) => {
  const [showShowcase, setShowShowcase] = useState(false);

  const features = [
    {
      category: '🎨 Creative Tools',
      items: [
        { name: 'Advanced Drawing Tools', description: 'Pen, eraser, shapes, colors', status: '✅' },
        { name: 'Sticky Notes', description: 'Collaborative note-taking', status: '✅' },
        { name: 'Quick Templates', description: 'Pre-made layouts & frameworks', status: '✅' },
        { name: 'AI Mind Maps', description: 'Auto-generated mind maps', status: '✅' },
        { name: 'Room Themes', description: 'Dynamic visual themes', status: '✅' }
      ]
    },
    {
      category: '🤝 Collaboration',
      items: [
        { name: 'Real-time Cursors', description: 'See where others are pointing', status: '✅' },
        { name: 'Voice Chat', description: 'Audio messages & communication', status: '✅' },
        { name: 'Screen Sharing', description: 'Share your screen live', status: '✅' },
        { name: 'Live Polls', description: 'Interactive voting system', status: '✅' },
        { name: 'Emoji Reactions', description: 'Express emotions instantly', status: '✅' }
      ]
    },
    {
      category: '💻 Development',
      items: [
        { name: 'Code Editor', description: 'Collaborative coding environment', status: '✅' },
        { name: 'AI Text Recognition', description: 'Convert drawings to text', status: '✅' },
        { name: 'File Upload', description: 'Share images, PDFs, documents', status: '✅' },
        { name: 'Export Options', description: 'PNG, PDF, JSON, HTML exports', status: '✅' },
        { name: 'Activity Feed', description: 'Real-time activity tracking', status: '✅' }
      ]
    },
    {
      category: '📊 Productivity',
      items: [
        { name: 'Pomodoro Timer', description: 'Focus sessions with breaks', status: '✅' },
        { name: 'Presentation Mode', description: 'Turn board into slides', status: '✅' },
        { name: 'Laser Pointer', description: 'Point and highlight content', status: '✅' },
        { name: 'Room Analytics', description: 'Usage stats & insights', status: '✅' },
        { name: 'Share & Export', description: 'Generate shareable links', status: '✅' }
      ]
    }
  ];

  const totalFeatures = features.reduce((sum, category) => sum + category.items.length, 0);
  const completedFeatures = features.reduce((sum, category) => 
    sum + category.items.filter(item => item.status === '✅').length, 0
  );

  const demoFeature = (featureName) => {
    const demos = {
      'Advanced Drawing Tools': 'Try the pen, eraser, rectangle, and circle tools!',
      'Sticky Notes': 'Click the yellow + button to add collaborative notes!',
      'Voice Chat': 'Record voice messages to communicate with your team!',
      'Live Polls': 'Create polls to make group decisions quickly!',
      'Code Editor': 'Write code together in real-time!',
      'AI Mind Maps': 'Generate structured mind maps from any topic!',
      'Laser Pointer': 'Activate laser pointer for presentations!',
      'Room Themes': 'Change the visual theme of your workspace!',
      'Emoji Reactions': 'React with emojis that float across the screen!'
    };
    
    showToast(demos[featureName] || `Try the ${featureName} feature!`, 'info');
  };

  return (
    <div className="feature-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <span className="text-lg mr-2">🚀</span>
          Feature Showcase
        </h3>
        <button
          onClick={() => setShowShowcase(!showShowcase)}
          className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showShowcase ? '🔽 Hide' : '✨ Show'} Features
        </button>
      </div>



      {showShowcase && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-gray-800 mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{item.status}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                    </div>
                    <button
                      onClick={() => demoFeature(item.name)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      Demo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showShowcase && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-800 mb-1">
              🚀 Professional Collaboration Platform
            </div>
            <div className="text-xs text-blue-600">
              AI-powered • Real-time sync • 20+ features
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureShowcase;