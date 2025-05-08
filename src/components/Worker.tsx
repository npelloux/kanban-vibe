import React, { useRef, useState } from 'react';

export type WorkerType = 'red' | 'blue' | 'green' | 'options';

interface WorkerProps {
  type: WorkerType;
  id: string;
  isSelected: boolean;
  onClick: () => void;
}

// Create a global variable to store the currently dragged worker data
// This is needed because mobile touch events don't have dataTransfer like desktop drag events
interface DraggedWorkerData {
  id: string;
  type: WorkerType;
  element: HTMLElement | null;
}

// Export for use in other components
export const draggedWorkerData: DraggedWorkerData = {
  id: '',
  type: 'red',
  element: null
};

export const Worker: React.FC<WorkerProps> = ({ type, id, isSelected, onClick }) => {
  const workerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag start event for desktop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set the data to be transferred - worker id and type
    e.dataTransfer.setData('application/json', JSON.stringify({ id, type }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Store the dragged worker data globally
    draggedWorkerData.id = id;
    draggedWorkerData.type = type;
    draggedWorkerData.element = workerRef.current;
    
    // Add a class to the worker element to indicate it's being dragged
    setTimeout(() => {
      e.currentTarget.classList.add('worker-dragging');
      setIsDragging(true);
    }, 0);
  };

  // Handle drag end event for desktop
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('worker-dragging');
    setIsDragging(false);
    
    // Clear the dragged worker data
    draggedWorkerData.id = '';
    draggedWorkerData.type = 'red';
    draggedWorkerData.element = null;
  };
  
  // Touch event handlers for mobile
  const handleTouchStart = () => {
    // Store the dragged worker data globally
    draggedWorkerData.id = id;
    draggedWorkerData.type = type;
    draggedWorkerData.element = workerRef.current;
    
    // Add a class to indicate it's being dragged
    if (workerRef.current) {
      workerRef.current.classList.add('worker-dragging');
      setIsDragging(true);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent scrolling while dragging
    e.preventDefault();
    
    // Get the touch position
    const touch = e.touches[0];
    
    // Find the element under the touch point
    const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Find if there's a card element under the touch
    const cardElement = elementsUnderTouch.find(el => 
      el.classList.contains('card') && 
      !el.classList.contains('card-completed')
    );
    
    // Remove drag-over class from all cards
    document.querySelectorAll('.card-drag-over').forEach(card => {
      card.classList.remove('card-drag-over');
    });
    
    // Add drag-over class to the card under touch, if any
    if (cardElement) {
      cardElement.classList.add('card-drag-over');
    }
  };
  
  const handleTouchEnd = () => {
    // Remove dragging class
    if (workerRef.current) {
      workerRef.current.classList.remove('worker-dragging');
      setIsDragging(false);
    }
    
    // Find the card element that has the drag-over class
    const cardElement = document.querySelector('.card-drag-over');
    
    if (cardElement) {
      // Get the card's stage attribute
      const stage = cardElement.closest('[data-stage]')?.getAttribute('data-stage') || '';
      
      // Only allow drop if the card is in an active stage
      if (stage && (stage.includes('active') || stage === 'green')) {
        // Dispatch a custom event to the card element
        const dropEvent = new CustomEvent('workerdrop', {
          detail: { workerId: id, workerType: type }
        });
        
        cardElement.dispatchEvent(dropEvent);
      }
      
      // Remove drag-over class
      cardElement.classList.remove('card-drag-over');
    }
    
    // Clear the dragged worker data
    draggedWorkerData.id = '';
    draggedWorkerData.type = 'red';
    draggedWorkerData.element = null;
  };

  return (
    <div 
      ref={workerRef}
      className={`worker worker-${type} ${isSelected ? 'worker-selected' : ''} ${isDragging ? 'worker-dragging' : ''}`}
      onClick={onClick}
      data-testid={`worker-${id}`}
      aria-label={`${type} worker ${id}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="worker-avatar">
        {id}
      </div>
    </div>
  );
};
