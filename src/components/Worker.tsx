import React, { useRef, useState } from 'react';

export type WorkerType = 'red' | 'blue' | 'green';

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
    
    // Move the worker element to follow the touch
    if (workerRef.current) {
      // Create a visual clone for dragging if it doesn't exist
      let dragClone = document.getElementById('worker-drag-clone');
      if (!dragClone) {
        dragClone = document.createElement('div');
        dragClone.id = 'worker-drag-clone';
        dragClone.className = `worker worker-${type} worker-dragging-clone`;
        dragClone.innerHTML = `<div class="worker-avatar">${id}</div>`;
        document.body.appendChild(dragClone);
      }
      
      // Position the clone at the touch point
      dragClone.style.position = 'absolute';
      dragClone.style.left = `${touch.clientX - 20}px`;
      dragClone.style.top = `${touch.clientY - 20}px`;
      dragClone.style.zIndex = '1000';
      dragClone.style.opacity = '0.8';
    }
    
    // Find the element under the touch point
    const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Find if there's a card element under the touch
    const cardElement = elementsUnderTouch.find(el => {
      if (!el.classList.contains('card')) return false;
      if (el.classList.contains('card-completed')) return false;
      
      // Check if the card is in an active stage
      const stage = el.getAttribute('data-stage') || '';
      return stage.includes('active') || stage === 'green';
    });
    
    // Remove drag-over class from all cards
    document.querySelectorAll('.card-drag-over').forEach(card => {
      card.classList.remove('card-drag-over');
    });
    
    // Add drag-over class to the card under touch, if any
    if (cardElement) {
      cardElement.classList.add('card-drag-over');
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // Remove dragging class
    if (workerRef.current) {
      workerRef.current.classList.remove('worker-dragging');
      setIsDragging(false);
    }
    
    // Remove the drag clone if it exists
    const dragClone = document.getElementById('worker-drag-clone');
    if (dragClone) {
      document.body.removeChild(dragClone);
    }
    
    // Get the touch position of the last touch
    const touch = e.changedTouches[0];
    
    // Find the element under the touch point
    const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Find if there's a valid card element under the touch
    const cardElement = elementsUnderTouch.find(el => {
      if (!el.classList.contains('card')) return false;
      if (el.classList.contains('card-completed')) return false;
      
      // Check if the card is in an active stage
      const stage = el.getAttribute('data-stage') || '';
      return stage.includes('active') || stage === 'green';
    });
    
    // Remove drag-over class from all cards
    document.querySelectorAll('.card-drag-over').forEach(card => {
      card.classList.remove('card-drag-over');
    });
    
    if (cardElement) {
      // Dispatch a custom event to the card element
      const dropEvent = new CustomEvent('workerdrop', {
        detail: { workerId: id, workerType: type }
      });
      
      cardElement.dispatchEvent(dropEvent);
      
      // Add a visual feedback for successful drop
      cardElement.classList.add('card-worker-dropped');
      setTimeout(() => {
        cardElement.classList.remove('card-worker-dropped');
      }, 300);
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
