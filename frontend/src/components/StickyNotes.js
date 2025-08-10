import React, { useState, useEffect, useRef } from 'react';

const StickyNotes = ({ socket, roomId, containerRef, showToast }) => {
  const [stickyNotes, setStickyNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNotePosition, setNewNotePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!socket) return;

    // Listen for sticky note events
    const handleStickyNoteAdd = (data) => {
      setStickyNotes(prev => [...prev, data]);
    };

    const handleStickyNoteUpdate = (data) => {
      setStickyNotes(prev => 
        prev.map(note => note.id === data.id ? data : note)
      );
    };

    const handleStickyNoteDelete = (data) => {
      setStickyNotes(prev => 
        prev.filter(note => note.id !== data.id)
      );
    };

    const handleStickyNotesLoad = (data) => {
      setStickyNotes(data.notes || []);
    };

    socket.on('sticky-note-add', handleStickyNoteAdd);
    socket.on('sticky-note-update', handleStickyNoteUpdate);
    socket.on('sticky-note-delete', handleStickyNoteDelete);
    socket.on('sticky-notes-load', handleStickyNotesLoad);

    return () => {
      socket.off('sticky-note-add', handleStickyNoteAdd);
      socket.off('sticky-note-update', handleStickyNoteUpdate);
      socket.off('sticky-note-delete', handleStickyNoteDelete);
      socket.off('sticky-notes-load', handleStickyNotesLoad);
    };
  }, [socket]);

  const handleContainerClick = (e) => {
    if (!isAddingNote || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    addStickyNote(x, y);
    setIsAddingNote(false);
  };

  const addStickyNote = (x, y) => {
    const newNote = {
      id: Date.now().toString(),
      x: Math.max(0, Math.min(90, x)),
      y: Math.max(0, Math.min(90, y)),
      content: 'New note',
      color: '#fef08a', // Yellow
      author: 'Current User',
      timestamp: Date.now()
    };

    setStickyNotes(prev => [...prev, newNote]);
    
    // Emit to other users
    socket.emit('sticky-note-add', {
      roomId,
      note: newNote
    });

    // Start editing immediately
    setEditingNote(newNote.id);
    showToast('📝 Sticky note added', 'success');
  };

  const updateStickyNote = (id, updates) => {
    const updatedNote = stickyNotes.find(note => note.id === id);
    if (!updatedNote) return;

    const newNote = { ...updatedNote, ...updates, timestamp: Date.now() };
    
    setStickyNotes(prev => 
      prev.map(note => note.id === id ? newNote : note)
    );

    // Emit to other users
    socket.emit('sticky-note-update', {
      roomId,
      note: newNote
    });
  };

  const deleteStickyNote = (id) => {
    setStickyNotes(prev => prev.filter(note => note.id !== id));
    
    // Emit to other users
    socket.emit('sticky-note-delete', {
      roomId,
      id
    });

    showToast('📝 Sticky note deleted', 'info');
  };

  const colors = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Pink', value: '#fce7f3' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Green', value: '#dcfce7' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Purple', value: '#e9d5ff' }
  ];

  return (
    <>
      {/* Sticky Notes */}
      {stickyNotes.map((note) => (
        <div
          key={note.id}
          className="absolute z-20 cursor-move"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={(e) => {
            // Handle dragging logic here
            e.stopPropagation();
          }}
        >
          <div
            className="w-48 min-h-32 p-3 rounded-lg shadow-lg border-l-4 border-gray-400"
            style={{ backgroundColor: note.color }}
          >
            {/* Note header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 font-medium">
                {note.author}
              </span>
              <div className="flex items-center space-x-1">
                {/* Color picker */}
                <div className="relative group">
                  <button className="w-4 h-4 rounded-full border border-gray-400 hover:scale-110 transition-transform">
                    <div 
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: note.color }}
                    ></div>
                  </button>
                  
                  {/* Color palette */}
                  <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg border p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="grid grid-cols-3 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateStickyNote(note.id, { color: color.value })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteStickyNote(note.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete note"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Note content */}
            {editingNote === note.id ? (
              <textarea
                className="w-full h-20 p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={note.content}
                onChange={(e) => updateStickyNote(note.id, { content: e.target.value })}
                onBlur={() => setEditingNote(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    setEditingNote(null);
                  }
                }}
                autoFocus
                placeholder="Type your note..."
              />
            ) : (
              <div
                className="text-sm text-gray-800 cursor-text min-h-20 p-2 rounded hover:bg-black hover:bg-opacity-5"
                onClick={() => setEditingNote(note.id)}
              >
                {note.content || 'Click to edit...'}
              </div>
            )}

            {/* Note footer */}
            <div className="text-xs text-gray-500 mt-2">
              {new Date(note.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {/* Add note button */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={() => setIsAddingNote(!isAddingNote)}
          className={`p-2 rounded-full shadow-lg transition-all ${
            isAddingNote 
              ? 'bg-red-500 text-white' 
              : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
          }`}
          title={isAddingNote ? 'Cancel adding note' : 'Add sticky note'}
        >
          {isAddingNote ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {/* Click overlay when adding note */}
      {isAddingNote && (
        <div
          className="absolute inset-0 z-10 cursor-crosshair"
          onClick={handleContainerClick}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
            Click anywhere to add a sticky note
          </div>
        </div>
      )}
    </>
  );
};

export default StickyNotes;