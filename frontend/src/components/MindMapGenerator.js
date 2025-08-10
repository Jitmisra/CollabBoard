import React, { useState } from 'react';

const MindMapGenerator = ({ socket, roomId, showToast }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);

  const mindMapTemplates = [
    {
      id: 'project-planning',
      name: 'Project Planning',
      icon: '📋',
      structure: {
        center: 'Project Name',
        branches: [
          { name: 'Goals', color: '#4CAF50', subbranches: ['Objective 1', 'Objective 2', 'Success Metrics'] },
          { name: 'Timeline', color: '#2196F3', subbranches: ['Phase 1', 'Phase 2', 'Milestones'] },
          { name: 'Resources', color: '#FF9800', subbranches: ['Team', 'Budget', 'Tools'] },
          { name: 'Risks', color: '#F44336', subbranches: ['Technical', 'Timeline', 'Budget'] }
        ]
      }
    },
    {
      id: 'brainstorm',
      name: 'Brainstorming',
      icon: '💡',
      structure: {
        center: 'Main Idea',
        branches: [
          { name: 'Solutions', color: '#9C27B0', subbranches: ['Option A', 'Option B', 'Option C'] },
          { name: 'Benefits', color: '#4CAF50', subbranches: ['Advantage 1', 'Advantage 2'] },
          { name: 'Challenges', color: '#F44336', subbranches: ['Challenge 1', 'Challenge 2'] },
          { name: 'Next Steps', color: '#2196F3', subbranches: ['Action 1', 'Action 2'] }
        ]
      }
    },
    {
      id: 'learning',
      name: 'Learning Map',
      icon: '📚',
      structure: {
        center: 'Topic',
        branches: [
          { name: 'Concepts', color: '#3F51B5', subbranches: ['Basic', 'Intermediate', 'Advanced'] },
          { name: 'Skills', color: '#009688', subbranches: ['Practical', 'Theoretical'] },
          { name: 'Resources', color: '#FF5722', subbranches: ['Books', 'Videos', 'Practice'] },
          { name: 'Applications', color: '#795548', subbranches: ['Real-world', 'Projects'] }
        ]
      }
    }
  ];

  const generateMindMap = async (template = null) => {
    if (!topic.trim() && !template) {
      showToast('Please enter a topic first', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let structure;
      
      if (template) {
        structure = {
          ...template.structure,
          center: topic || template.structure.center
        };
      } else {
        // Generate based on topic
        structure = {
          center: topic,
          branches: [
            { 
              name: 'Key Points', 
              color: '#4CAF50', 
              subbranches: ['Point 1', 'Point 2', 'Point 3'] 
            },
            { 
              name: 'Details', 
              color: '#2196F3', 
              subbranches: ['Detail A', 'Detail B', 'Detail C'] 
            },
            { 
              name: 'Examples', 
              color: '#FF9800', 
              subbranches: ['Example 1', 'Example 2'] 
            },
            { 
              name: 'Related Topics', 
              color: '#9C27B0', 
              subbranches: ['Related A', 'Related B'] 
            }
          ]
        };
      }

      setMindMapData(structure);
      
      // Send to other users
      socket.emit('mindmap-generated', {
        roomId,
        structure,
        topic: topic || template?.structure.center,
        username: socket.username,
        timestamp: new Date()
      });

      showToast('Mind map generated!', 'success');
    } catch (error) {
      showToast('Failed to generate mind map', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyToWhiteboard = () => {
    if (!mindMapData) return;

    // Clear whiteboard first
    socket.emit('clear-whiteboard', { roomId });

    setTimeout(() => {
      const centerX = 400;
      const centerY = 300;
      const radius = 150;

      // Draw center node
      socket.emit('drawing', {
        roomId,
        type: 'circle',
        x: centerX,
        y: centerY,
        radius: 40,
        color: '#6366f1',
        username: socket.username
      });

      socket.emit('drawing', {
        roomId,
        type: 'text',
        x: centerX - 30,
        y: centerY + 5,
        content: mindMapData.center,
        fontSize: 16,
        color: '#000',
        username: socket.username
      });

      // Draw branches
      mindMapData.branches.forEach((branch, index) => {
        const angle = (index * 2 * Math.PI) / mindMapData.branches.length;
        const branchX = centerX + Math.cos(angle) * radius;
        const branchY = centerY + Math.sin(angle) * radius;

        // Draw line to branch
        socket.emit('drawing', {
          roomId,
          type: 'line',
          x1: centerX,
          y1: centerY,
          x2: branchX,
          y2: branchY,
          color: branch.color,
          width: 3,
          username: socket.username
        });

        // Draw branch node
        socket.emit('drawing', {
          roomId,
          type: 'rectangle',
          x: branchX - 40,
          y: branchY - 15,
          width: 80,
          height: 30,
          color: branch.color,
          username: socket.username
        });

        socket.emit('drawing', {
          roomId,
          type: 'text',
          x: branchX - 25,
          y: branchY + 5,
          content: branch.name,
          fontSize: 12,
          color: '#fff',
          username: socket.username
        });

        // Draw subbranches
        branch.subbranches.forEach((subbranch, subIndex) => {
          const subAngle = angle + (subIndex - 1) * 0.3;
          const subX = branchX + Math.cos(subAngle) * 80;
          const subY = branchY + Math.sin(subAngle) * 80;

          // Line to subbranch
          socket.emit('drawing', {
            roomId,
            type: 'line',
            x1: branchX,
            y1: branchY,
            x2: subX,
            y2: subY,
            color: branch.color,
            width: 1,
            username: socket.username
          });

          // Subbranch text
          socket.emit('drawing', {
            roomId,
            type: 'text',
            x: subX - 20,
            y: subY + 5,
            content: subbranch,
            fontSize: 10,
            color: branch.color,
            username: socket.username
          });
        });
      });
    }, 500);

    showToast('Mind map applied to whiteboard!', 'success');
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">AI Mind Map</h3>
        <button
          onClick={() => generateMindMap()}
          disabled={isGenerating || !topic.trim()}
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
              Generating...
            </div>
          ) : (
            '🧠 Generate'
          )}
        </button>
      </div>

      {/* Topic input */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Enter your topic or idea..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Templates */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Quick Templates:</div>
        <div className="grid grid-cols-1 gap-1">
          {mindMapTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => generateMindMap(template)}
              disabled={isGenerating}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:bg-gray-100 text-left disabled:opacity-50"
            >
              <span>{template.icon}</span>
              <span className="text-xs font-medium">{template.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generated mind map preview */}
      {mindMapData && (
        <div className="mb-3 p-3 bg-purple-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-purple-900">Generated Mind Map</div>
            <button
              onClick={applyToWhiteboard}
              className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
            >
              Apply to Board
            </button>
          </div>
          
          <div className="text-center mb-2">
            <div className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
              {mindMapData.center}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {mindMapData.branches.map((branch, index) => (
              <div key={index} className="text-xs">
                <div 
                  className="font-medium text-white px-2 py-1 rounded mb-1"
                  style={{ backgroundColor: branch.color }}
                >
                  {branch.name}
                </div>
                <ul className="text-gray-600 ml-2">
                  {branch.subbranches.map((sub, subIndex) => (
                    <li key={subIndex}>• {sub}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-2 bg-blue-50 rounded text-xs text-blue-800">
        <div className="font-medium mb-1">💡 How it works:</div>
        <ul className="space-y-1">
          <li>• Enter any topic or use a template</li>
          <li>• AI generates a structured mind map</li>
          <li>• Apply directly to the whiteboard</li>
          <li>• Perfect for brainstorming sessions!</li>
        </ul>
      </div>
    </div>
  );
};

export default MindMapGenerator;