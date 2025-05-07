import React from 'react';

export type WorkerType = 'red' | 'blue' | 'green' | 'options';

interface WorkerProps {
  type: WorkerType;
  id: string;
  isSelected: boolean;
  onClick: () => void;
}

export const Worker: React.FC<WorkerProps> = ({ type, id, isSelected, onClick }) => {
  // Handle drag start event
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set the data to be transferred - worker id and type
    e.dataTransfer.setData('application/json', JSON.stringify({ id, type }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a class to the worker element to indicate it's being dragged
    setTimeout(() => {
      e.currentTarget.classList.add('worker-dragging');
    }, 0);
  };

  // Handle drag end event
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('worker-dragging');
  };

  return (
    <div 
      className={`worker worker-${type} ${isSelected ? 'worker-selected' : ''}`}
      onClick={onClick}
      data-testid={`worker-${id}`}
      aria-label={`${type} worker ${id}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="worker-avatar">
        {id}
      </div>
    </div>
  );
};
