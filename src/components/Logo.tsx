import React from 'react';
import logoImage from '../assets/kanban-vibe-v1.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  // Size mapping
  const sizeMap = {
    small: { height: 32 },
    medium: { height: 40 },
    large: { height: 48 }
  };
  
  const { height } = sizeMap[size];
  
  return (
    <div className="logo-container">
      <img 
        src={logoImage} 
        alt="Kanban Vibe Logo" 
        className="logo-image"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
