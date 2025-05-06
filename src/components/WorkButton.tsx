import React from 'react';

interface WorkButtonProps {
  onClick: () => void;
  columnTitle: string;
}

export const WorkButton: React.FC<WorkButtonProps> = ({ onClick, columnTitle }) => {
  return (
    <button 
      className="work-button" 
      onClick={onClick}
      aria-label={`Work on ${columnTitle} tasks`}
    >
      Work
    </button>
  );
};
