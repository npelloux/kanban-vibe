import React from 'react';

interface NextDayButtonProps {
  onClick: () => void;
}

export const NextDayButton: React.FC<NextDayButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="next-day-button" 
      onClick={onClick}
    >
      Next Day
    </button>
  );
};
