import React from 'react';

interface GridOverlayProps {
  theme: 'light' | 'dark';
}

const GridOverlay: React.FC<GridOverlayProps> = ({ theme }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={theme === 'dark' ? '#1a2a22' : '#a7f3d0'}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

export default GridOverlay;
