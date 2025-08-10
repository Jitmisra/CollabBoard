import React, { useState, useEffect, useRef } from 'react';
import { exportNotesAsText, generateTimestampedFilename, copyToClipboard } from '../utils/export';

const NotesEditor = ({ socket, roomId, initialContent, showToast }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Initialize content
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      updateCounts(initialContent);
    }
  }, [initialContent]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNotesChange = (data) => {
      setContent(data.content);
      updateCounts(data.content);
    };

    socket.on('notes-change', handleNotesChange);

    return () => {
      socket.off('notes-change', handleNotesChange);
    };
  }, [socket]);

  const updateCounts = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateCounts(newContent);

    // Show typing indicator
    setIsTyping(true);

    // Emit changes to other users (debounced)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      socket.emit('notes-change', {
        content: newContent,
        timestamp: Date.now()
      });
      setIsTyping(false);
    }, 500); // 500ms debounce
  };

  const handleExport = () => {
    if (!content.trim()) {
      showToast('No content to export', 'error');
      return;
    }

    const filename = generateTimestampedFilename(`notes_${roomId}`, 'txt');
    const success = exportNotesAsText(content, filename);
    
    if (success) {
      showToast('Notes exported successfully!', 'success');
    } else {
      showToast('Failed to export notes', 'error');
    }
  };

  const handleCopy = async () => {
    if (!content.trim()) {
      showToast('No content to copy', 'error');
      return;
    }

    const success = await copyToClipboard(content);
    if (success) {
      showToast('Notes copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy notes', 'error');
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setContent('');
      updateCounts('');
      socket.emit('notes-change', {
        content: '',
        timestamp: Date.now()
      });
      showToast('Notes cleared', 'info');
    }
  };

  const insertTemplate = (template) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + template + content.substring(end);
    
    setContent(newContent);
    updateCounts(newContent);
    
    // Emit changes
    socket.emit('notes-change', {
      content: newContent,
      timestamp: Date.now()
    });

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + template.length, start + template.length);
    }, 0);
  };

  const templates = [
    {
      name: 'Meeting Notes',
      content: `# Meeting Notes - ${new Date().toLocaleDateString()}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 

## Next Steps
- 
`
    },
    {
      name: 'To-Do List',
      content: `# To-Do List

## High Priority
- [ ] 
- [ ] 

## Medium Priority
- [ ] 
- [ ] 

## Low Priority
- [ ] 
- [ ] 

## Completed
- [x] 
`
    },
    {
      name: 'Brainstorm',
      content: `# Brainstorming Session

## Topic: 

## Ideas
- 
- 
- 

## Pros & Cons
### Pros
- 

### Cons
- 

## Next Actions
- 
`
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        {/* Templates dropdown */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const template = templates.find(t => t.name === e.target.value);
                  if (template) {
                    insertTemplate(template.content);
                  }
                  e.target.value = '';
                }
              }}
              className="input-field text-sm"
              defaultValue=""
            >
              <option value="">Insert Template...</option>
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-pulse h-2 w-2 bg-primary-500 rounded-full mr-2"></div>
              Saving...
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center"
            title="Copy to clipboard"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>

          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
            title="Export as text file"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>

          <button
            onClick={handleClear}
            className="btn-danger flex items-center"
            title="Clear all notes"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Text Editor */}
      <div className="flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing your notes here... 

You can use Markdown formatting:
# Heading 1
## Heading 2
- Bullet point
1. Numbered list
**Bold text**
*Italic text*
`Code`

Changes are automatically saved and synced with other users."
          className="flex-1 p-4 border-none outline-none resize-none font-mono text-sm leading-relaxed scrollbar-thin"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-green-600">
            <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
            <span>Auto-save enabled</span>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="p-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Tip: Use Markdown formatting for better organization • Changes sync automatically with other users
        </p>
      </div>
    </div>
  );
};

export default NotesEditor;