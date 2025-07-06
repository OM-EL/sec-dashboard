import React, { useState, useRef, useEffect } from 'react';
import { Card } from './UIComponents';

const FloatingDatePopup = ({ 
  currentDate, 
  currentFrame, 
  totalFrames, 
  onFrameChange, 
  isPlaying, 
  speed, 
  onPlayPause, 
  onReset, 
  onSpeedChange 
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep popup within viewport bounds
    const maxX = window.innerWidth - 400; // popup width increased
    const maxY = window.innerHeight - 280; // popup height increased

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      ref={dragRef}
      className={`fixed z-50 w-96 transition-opacity duration-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate3d(0, 0, 0)', // Hardware acceleration
      }}
      onMouseDown={handleMouseDown}
    >
      <Card variant="highlight" className="shadow-2xl border-2 border-blue-500/50 bg-gray-900/95 backdrop-blur-md">
        {/* Drag handle */}
        <div className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-400">📅 Timeline</span>
        </div>

        {/* Date Display */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {formatDate(currentDate)}
          </div>
          <div className="text-sm text-gray-400">
            Checkpoint {currentFrame + 1} of {totalFrames}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            {Math.round(((currentFrame + 1) / totalFrames) * 100)}% Complete
          </div>
        </div>

        {/* Frame Navigation */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => onFrameChange(Math.max(0, currentFrame - 1))}
            disabled={currentFrame === 0}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors"
          >
            ⏮️
          </button>
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => onFrameChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => onFrameChange(Math.min(totalFrames - 1, currentFrame + 1))}
            disabled={currentFrame === totalFrames - 1}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors"
          >
            ⏭️
          </button>
        </div>

        {/* Play Controls */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={onPlayPause}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Reset
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-3 mb-4">
          <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
            Speed: {speed}x
          </label>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.2"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex justify-between mt-3 text-xs">
          <button
            onClick={() => onFrameChange(0)}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            🏁 Start
          </button>
          <button
            onClick={() => onFrameChange(Math.floor(totalFrames / 2))}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            ⏸️ Mid
          </button>
          <button
            onClick={() => onFrameChange(totalFrames - 1)}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            🏁 End
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FloatingDatePopup;
