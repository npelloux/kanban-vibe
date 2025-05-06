import React from 'react';

export type WorkerType = 'red' | 'blue' | 'green' | 'options';

interface WorkerProps {
  type: WorkerType;
  id: string;
  isSelected: boolean;
  onClick: () => void;
}

export const Worker: React.FC<WorkerProps> = ({ type, id, isSelected, onClick }) => {
  return (
    <div 
      className={`worker worker-${type} ${isSelected ? 'worker-selected' : ''}`}
      onClick={onClick}
      data-testid={`worker-${id}`}
      aria-label={`${type} worker ${id}`}
    >
      <div className="worker-avatar">
        {id}
      </div>
    </div>
  );
};
