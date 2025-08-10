import React, { useState } from 'react';

const QuickTemplates = ({ socket, roomId, showToast }) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    {
      id: 'meeting-agenda',
      name: 'Meeting Agenda',
      icon: '📋',
      description: 'Standard meeting agenda template',
      elements: [
        { type: 'text', x: 50, y: 50, content: 'Meeting Agenda', fontSize: 24, color: '#000' },
        { type: 'text', x: 50, y: 100, content: 'Date: ___________', fontSize: 16, color: '#666' },
        { type: 'text', x: 50, y: 130, content: 'Attendees: ___________', fontSize: 16, color: '#666' },
        { type: 'text', x: 50, y: 180, content: '1. Opening & Introductions', fontSize: 16, color: '#000' },
        { type: 'text', x: 50, y: 210, content: '2. Review Previous Action Items', fontSize: 16, color: '#000' },
        { type: 'text', x: 50, y: 240, content: '3. Main Discussion Topics', fontSize: 16, color: '#000' },
        { type: 'text', x: 50, y: 270, content: '4. Action Items & Next Steps', fontSize: 16, color: '#000' },
        { type: 'text', x: 50, y: 300, content: '5. Closing', fontSize: 16, color: '#000' },
      ]
    },
    {
      id: 'brainstorm-canvas',
      name: 'Brainstorm Canvas',
      icon: '💡',
      description: 'Creative brainstorming layout',
      elements: [
        { type: 'text', x: 400, y: 50, content: 'Brainstorming Session', fontSize: 24, color: '#000' },
        { type: 'rectangle', x: 50, y: 100, width: 200, height: 150, color: '#FFE4E1', label: 'Ideas' },
        { type: 'rectangle', x: 300, y: 100, width: 200, height: 150, color: '#E1F5FE', label: 'Solutions' },
        { type: 'rectangle', x: 550, y: 100, width: 200, height: 150, color: '#F3E5F5', label: 'Actions' },
        { type: 'rectangle', x: 175, y: 300, width: 250, height: 100, color: '#E8F5E8', label: 'Key Takeaways' },
      ]
    },
    {
      id: 'project-timeline',
      name: 'Project Timeline',
      icon: '📅',
      description: 'Project planning timeline',
      elements: [
        { type: 'text', x: 50, y: 50, content: 'Project Timeline', fontSize: 24, color: '#000' },
        { type: 'line', x1: 50, y1: 120, x2: 750, y2: 120, color: '#000', width: 3 },
        { type: 'circle', x: 100, y: 120, radius: 8, color: '#4CAF50' },
        { type: 'text', x: 80, y: 150, content: 'Start', fontSize: 14, color: '#000' },
        { type: 'circle', x: 300, y: 120, radius: 8, color: '#FF9800' },
        { type: 'text', x: 270, y: 150, content: 'Milestone 1', fontSize: 14, color: '#000' },
        { type: 'circle', x: 500, y: 120, radius: 8, color: '#FF9800' },
        { type: 'text', x: 470, y: 150, content: 'Milestone 2', fontSize: 14, color: '#000' },
        { type: 'circle', x: 700, y: 120, radius: 8, color: '#F44336' },
        { type: 'text', x: 680, y: 150, content: 'End', fontSize: 14, color: '#000' },
      ]
    },
    {
      id: 'swot-analysis',
      name: 'SWOT Analysis',
      icon: '📊',
      description: 'Strategic planning framework',
      elements: [
        { type: 'text', x: 350, y: 30, content: 'SWOT Analysis', fontSize: 24, color: '#000' },
        { type: 'rectangle', x: 50, y: 80, width: 300, height: 200, color: '#E8F5E8', label: 'Strengths' },
        { type: 'rectangle', x: 400, y: 80, width: 300, height: 200, color: '#FFE4E1', label: 'Weaknesses' },
        { type: 'rectangle', x: 50, y: 320, width: 300, height: 200, color: '#E1F5FE', label: 'Opportunities' },
        { type: 'rectangle', x: 400, y: 320, width: 300, height: 200, color: '#FFF3E0', label: 'Threats' },
      ]
    },
    {
      id: 'user-journey',
      name: 'User Journey Map',
      icon: '🗺️',
      description: 'User experience mapping',
      elements: [
        { type: 'text', x: 300, y: 30, content: 'User Journey Map', fontSize: 24, color: '#000' },
        { type: 'text', x: 50, y: 80, content: 'Awareness', fontSize: 16, color: '#000' },
        { type: 'text', x: 200, y: 80, content: 'Consideration', fontSize: 16, color: '#000' },
        { type: 'text', x: 380, y: 80, content: 'Purchase', fontSize: 16, color: '#000' },
        { type: 'text', x: 520, y: 80, content: 'Onboarding', fontSize: 16, color: '#000' },
        { type: 'text', x: 680, y: 80, content: 'Retention', fontSize: 16, color: '#000' },
        { type: 'line', x1: 50, y1: 100, x2: 750, y2: 100, color: '#000', width: 2 },
        { type: 'rectangle', x: 30, y: 120, width: 120, height: 80, color: '#E3F2FD' },
        { type: 'rectangle', x: 170, y: 120, width: 120, height: 80, color: '#F3E5F5' },
        { type: 'rectangle', x: 310, y: 120, width: 120, height: 80, color: '#E8F5E8' },
        { type: 'rectangle', x: 450, y: 120, width: 120, height: 80, color: '#FFF3E0' },
        { type: 'rectangle', x: 590, y: 120, width: 120, height: 80, color: '#FFE4E1' },
      ]
    },
    {
      id: 'kanban-board',
      name: 'Kanban Board',
      icon: '📋',
      description: 'Task management board',
      elements: [
        { type: 'text', x: 350, y: 30, content: 'Kanban Board', fontSize: 24, color: '#000' },
        { type: 'rectangle', x: 50, y: 80, width: 200, height: 400, color: '#FFE4E1', label: 'To Do' },
        { type: 'rectangle', x: 280, y: 80, width: 200, height: 400, color: '#FFF3E0', label: 'In Progress' },
        { type: 'rectangle', x: 510, y: 80, width: 200, height: 400, color: '#E8F5E8', label: 'Done' },
        { type: 'text', x: 130, y: 110, content: 'TO DO', fontSize: 18, color: '#000' },
        { type: 'text', x: 340, y: 110, content: 'IN PROGRESS', fontSize: 18, color: '#000' },
        { type: 'text', x: 580, y: 110, content: 'DONE', fontSize: 18, color: '#000' },
      ]
    }
  ];

  const applyTemplate = (template) => {
    // Clear existing whiteboard
    socket.emit('clear-whiteboard', { roomId });
    
    // Apply template elements
    setTimeout(() => {
      template.elements.forEach((element, index) => {
        setTimeout(() => {
          if (element.type === 'text') {
            socket.emit('drawing', {
              roomId,
              type: 'text',
              x: element.x,
              y: element.y,
              content: element.content,
              fontSize: element.fontSize,
              color: element.color,
              username: socket.username
            });
          } else if (element.type === 'rectangle') {
            socket.emit('drawing', {
              roomId,
              type: 'rectangle',
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              color: element.color,
              username: socket.username
            });
            
            // Add label if exists
            if (element.label) {
              setTimeout(() => {
                socket.emit('drawing', {
                  roomId,
                  type: 'text',
                  x: element.x + 10,
                  y: element.y + 25,
                  content: element.label,
                  fontSize: 16,
                  color: '#000',
                  username: socket.username
                });
              }, 100);
            }
          } else if (element.type === 'circle') {
            socket.emit('drawing', {
              roomId,
              type: 'circle',
              x: element.x,
              y: element.y,
              radius: element.radius,
              color: element.color,
              username: socket.username
            });
          } else if (element.type === 'line') {
            socket.emit('drawing', {
              roomId,
              type: 'line',
              x1: element.x1,
              y1: element.y1,
              x2: element.x2,
              y2: element.y2,
              color: element.color,
              width: element.width,
              username: socket.username
            });
          }
        }, index * 200); // Stagger the drawing
      });
    }, 500);

    setShowTemplates(false);
    showToast(`Applied ${template.name} template!`, 'success');
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Quick Templates</h3>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
        >
          {showTemplates ? 'Hide' : 'Show'} Templates
        </button>
      </div>

      {showTemplates && (
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              className="flex items-start p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-left transition-colors"
            >
              <span className="text-lg mr-3">{template.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!showTemplates && (
        <p className="text-xs text-gray-500 text-center py-2">
          Click "Show Templates" to see available layouts
        </p>
      )}
    </div>
  );
};

export default QuickTemplates;