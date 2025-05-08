import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  // Size mapping
  const sizeMap = {
    small: { width: 32, height: 32, fontSize: 10 },
    medium: { width: 40, height: 40, fontSize: 12 },
    large: { width: 48, height: 48, fontSize: 14 }
  };
  
  const { width, height, fontSize } = sizeMap[size];
  
  return (
    <div className="logo-container">
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Background */}
        <rect width="48" height="48" rx="8" fill="#0F4C81" />
        
        {/* Kanban columns representation */}
        <rect x="8" y="12" width="8" height="24" rx="2" fill="#FDAC53" />
        <rect x="20" y="12" width="8" height="24" rx="2" fill="#DD7A6A" />
        <rect x="32" y="12" width="8" height="24" rx="2" fill="#55C2B4" />
        
        {/* Cards representation */}
        <rect x="9" y="14" width="6" height="4" rx="1" fill="white" opacity="0.9" />
        <rect x="9" y="20" width="6" height="4" rx="1" fill="white" opacity="0.7" />
        <rect x="9" y="26" width="6" height="4" rx="1" fill="white" opacity="0.5" />
        
        <rect x="21" y="16" width="6" height="4" rx="1" fill="white" opacity="0.8" />
        <rect x="21" y="22" width="6" height="4" rx="1" fill="white" opacity="0.6" />
        
        <rect x="33" y="18" width="6" height="4" rx="1" fill="white" opacity="0.9" />
        <rect x="33" y="24" width="6" height="4" rx="1" fill="white" opacity="0.7" />
      </svg>
      <span className="logo-text" style={{ fontSize: `${fontSize}px` }}>Kanban Vibe</span>
    </div>
  );
};
