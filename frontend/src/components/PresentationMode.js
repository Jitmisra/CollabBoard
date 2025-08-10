import React, { useState, useEffect } from 'react';

const PresentationMode = ({ socket, roomId, showToast }) => {
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [presenter, setPresenter] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handlePresentationStart = (data) => {
      setIsPresenting(true);
      setPresenter(data.presenter);
      setSlides(data.slides);
      setCurrentSlide(0);
      showToast(`${data.presenter} started presentation mode`, 'info');
    };

    const handlePresentationEnd = (data) => {
      setIsPresenting(false);
      setPresenter(null);
      setSlides([]);
      setCurrentSlide(0);
      showToast(`Presentation ended`, 'info');
    };

    const handleSlideChange = (data) => {
      setCurrentSlide(data.slideIndex);
    };

    socket.on('presentation-start', handlePresentationStart);
    socket.on('presentation-end', handlePresentationEnd);
    socket.on('slide-change', handleSlideChange);

    return () => {
      socket.off('presentation-start', handlePresentationStart);
      socket.off('presentation-end', handlePresentationEnd);
      socket.off('slide-change', handleSlideChange);
    };
  }, [socket, showToast]);

  const startPresentation = () => {
    // Capture current whiteboard state as slides
    const whiteboardSlides = [
      {
        id: 1,
        title: 'Current Whiteboard',
        content: 'whiteboard-content', // This would be the actual canvas data
        timestamp: new Date()
      }
    ];

    setSlides(whiteboardSlides);
    setIsPresenting(true);
    setPresenter(socket.username);
    setCurrentSlide(0);

    socket.emit('start-presentation', {
      roomId,
      presenter: socket.username,
      slides: whiteboardSlides
    });

    showToast('Presentation mode started!', 'success');
  };

  const endPresentation = () => {
    setIsPresenting(false);
    setPresenter(null);
    setSlides([]);
    setCurrentSlide(0);

    socket.emit('end-presentation', {
      roomId,
      presenter: socket.username
    });

    showToast('Presentation ended', 'info');
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      socket.emit('change-slide', {
        roomId,
        slideIndex: newSlide,
        presenter: socket.username
      });
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      socket.emit('change-slide', {
        roomId,
        slideIndex: newSlide,
        presenter: socket.username
      });
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    socket.emit('change-slide', {
      roomId,
      slideIndex: index,
      presenter: socket.username
    });
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Presentation Mode</h3>
        {!isPresenting ? (
          <button
            onClick={startPresentation}
            className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700"
          >
            Start Presenting
          </button>
        ) : presenter === socket.username ? (
          <button
            onClick={endPresentation}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
          >
            End Presentation
          </button>
        ) : null}
      </div>

      {isPresenting && (
        <div className="space-y-3">
          {/* Presenter info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Presenter: {presenter}</span>
            <span>Slide {currentSlide + 1} of {slides.length}</span>
          </div>

          {/* Slide navigation for presenter */}
          {presenter === socket.username && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                title="Previous slide"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                {currentSlide + 1} / {slides.length}
              </span>
              
              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                title="Next slide"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Slide thumbnails */}
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => presenter === socket.username && goToSlide(index)}
                className={`p-2 text-xs rounded border-2 transition-colors ${
                  index === currentSlide
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                } ${presenter !== socket.username ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="font-medium truncate">{slide.title}</div>
                <div className="text-gray-500 mt-1">Slide {index + 1}</div>
              </button>
            ))}
          </div>

          {/* Presentation controls info */}
          <div className="text-xs text-gray-500 text-center">
            {presenter === socket.username ? (
              'Use arrow buttons to navigate slides'
            ) : (
              `Following ${presenter}'s presentation`
            )}
          </div>
        </div>
      )}

      {!isPresenting && (
        <p className="text-xs text-gray-500 text-center py-2">
          Turn your whiteboard into a presentation
        </p>
      )}
    </div>
  );
};

export default PresentationMode;