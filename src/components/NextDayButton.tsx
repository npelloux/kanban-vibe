import React from 'react';

interface NextDayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const NextDayButton: React.FC<NextDayButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button 
      className="next-day-button" 
      onClick={onClick}
      disabled={disabled}
    >
      Next Day
    </button>
  );
};
