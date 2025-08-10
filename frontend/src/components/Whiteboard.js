import React, { useRef, useEffect, useState, useCallback } from 'react';
import { exportCanvasAsPNG, generateTimestampedFilename } from '../utils/export';
import CursorTracker from './CursorTracker';
import StickyNotes from './StickyNotes';

const Whiteboard = ({ socket, roomId, initialData, showToast }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(3);
  const [isErasing, setIsErasing] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState(null);
  const [drawingData, setDrawingData] = useState([]);

  // Drawing state
  const lastPointRef = useRef(null);
  const containerRef = useRef(null);

  // Colors palette
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  const drawLine = useCallback((x0, y0, x1, y1, color, size) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all stored drawing data
    drawingData.forEach(data => {
      if (data.type === 'draw') {
        drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
      }
    });
  }, [drawingData, drawLine]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Redraw existing content
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [redrawCanvas]);

  // Load initial data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setDrawingData(initialData);
    }
  }, [initialData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDrawing = (data) => {
      if (data.type === 'draw') {
        drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
        setDrawingData(prev => [...prev, data]);
      } else if (data.type === 'clear') {
        clearCanvas();
        setDrawingData([]);
      }
    };

    const handleClearWhiteboard = () => {
      clearCanvas();
      setDrawingData([]);
    };

    socket.on('drawing', handleDrawing);
    socket.on('clear-whiteboard', handleClearWhiteboard);

    return () => {
      socket.off('drawing', handleDrawing);
      socket.off('clear-whiteboard', handleClearWhiteboard);
    };
  }, [socket, drawLine]);



  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  };

  // Mouse events
  const handleMouseDown = (e) => {
    if (currentTool !== 'pen') return;

    setIsDrawing(true);
    const pos = getMousePos(e);
    lastPointRef.current = pos;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || currentTool !== 'pen') return;

    const pos = getMousePos(e);
    const lastPoint = lastPointRef.current;

    if (lastPoint) {
      // Draw locally
      drawLine(lastPoint.x, lastPoint.y, pos.x, pos.y, currentColor, currentSize);

      // Create drawing data
      const drawData = {
        type: 'draw',
        x0: lastPoint.x,
        y0: lastPoint.y,
        x1: pos.x,
        y1: pos.y,
        color: currentColor,
        size: currentSize
      };

      // Emit to other users
      socket.emit('drawing', drawData);

      // Store locally
      setDrawingData(prev => [...prev, drawData]);
    }

    lastPointRef.current = pos;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (currentTool !== 'pen') return;

    setIsDrawing(true);
    const pos = getTouchPos(e);
    lastPointRef.current = pos;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || currentTool !== 'pen') return;

    const pos = getTouchPos(e);
    const lastPoint = lastPointRef.current;

    if (lastPoint) {
      // Draw locally
      drawLine(lastPoint.x, lastPoint.y, pos.x, pos.y, currentColor, currentSize);

      // Create drawing data
      const drawData = {
        type: 'draw',
        x0: lastPoint.x,
        y0: lastPoint.y,
        x1: pos.x,
        y1: pos.y,
        color: currentColor,
        size: currentSize
      };

      // Emit to other users
      socket.emit('drawing', drawData);

      // Store locally
      setDrawingData(prev => [...prev, drawData]);
    }

    lastPointRef.current = pos;
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      clearCanvas();
      setDrawingData([]);
      socket.emit('clear-whiteboard');
      showToast('Whiteboard cleared', 'info');
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const filename = generateTimestampedFilename(`whiteboard_${roomId}`, 'png');
    const success = exportCanvasAsPNG(canvas, filename);

    if (success) {
      showToast('Whiteboard exported successfully!', 'success');
    } else {
      showToast('Failed to export whiteboard', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        {/* Drawing tools */}
        <div className="flex items-center space-x-4">
          {/* Tool selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setCurrentTool('pen'); setIsErasing(false); }}
              className={`p-2 rounded-lg transition-colors ${currentTool === 'pen' && !isErasing
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              title="Pen Tool"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
            <button
              onClick={() => { setCurrentTool('eraser'); setIsErasing(true); }}
              className={`p-2 rounded-lg transition-colors ${currentTool === 'eraser'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              title="Eraser Tool"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <button
              onClick={() => { setCurrentTool('rectangle'); setIsErasing(false); }}
              className={`p-2 rounded-lg transition-colors ${currentTool === 'rectangle'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              title="Rectangle Tool"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
            </button>

            <button
              onClick={() => { setCurrentTool('circle'); setIsErasing(false); }}
              className={`p-2 rounded-lg transition-colors ${currentTool === 'circle'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              title="Circle Tool"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </button>
          </div>

          {/* Color picker */}
          <div className="flex items-center space-x-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${currentColor === color
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:scale-105'
                  }`}
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}

            {/* Custom color picker */}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              title="Custom Color"
            />
          </div>

          {/* Brush size */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={currentSize}
              onChange={(e) => setCurrentSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-6">{currentSize}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
            title="Export as PNG"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>

          <button
            onClick={handleClear}
            className="btn-danger flex items-center"
            title="Clear whiteboard"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden canvas-container relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Cursor Tracker */}
        <CursorTracker 
          socket={socket} 
          roomId={roomId} 
          currentUser={{ username: 'Current User' }} 
          containerRef={containerRef} 
        />
        
        {/* Sticky Notes */}
        <StickyNotes 
          socket={socket} 
          roomId={roomId} 
          containerRef={containerRef} 
          showToast={showToast} 
        />
      </div>

      {/* Instructions */}
      <div className="p-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click and drag to draw • Use toolbar to change colors and brush size • Changes are saved automatically
        </p>
      </div>
    </div>
  );
};

export default Whiteboard;