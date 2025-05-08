import React, { useState, useEffect, useRef } from 'react';
import type { WorkerType } from './Worker';

export interface WorkItemsType {
  [key: string]: {
    total: number;
    completed: number;
  };
}

interface CardProps {
  id: string;
  content: string;
  age?: number;
  startDay?: number;
  isBlocked?: boolean;
  workItems?: WorkItemsType;
  assignedWorkers?: {
    id: string;
    type: WorkerType;
  }[];
  onClick?: () => void;
  onWorkerDrop?: (workerId: string, workerType: WorkerType) => void;
  stage?: string;
  completionDay?: number;
}

export const Card: React.FC<CardProps> = ({ 
  id, 
  content, 
  age = 0, 
  startDay = 1,
  isBlocked = false,
  workItems = {
    red: { total: 6, completed: 0 },
    blue: { total: 0, completed: 0 },
    green: { total: 0, completed: 0 }
  },
  assignedWorkers = [],
  onClick,
  onWorkerDrop,
  stage = '',
  completionDay
}) => {
  // State to track if a worker is being dragged over this card
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Only allow if the card is in an active stage
    if (stage && (stage.includes('active') || stage === 'green')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!isDragOver) {
        setIsDragOver(true);
      }
    }
  };

  // Handle drag leave event
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.id && data.type && onWorkerDrop) {
        onWorkerDrop(data.id, data.type);
      }
    } catch (error) {
      console.error('Error parsing dropped worker data:', error);
    }
  };
  // Calculate total work items for all colors
  const totalWorkItems = Object.values(workItems).reduce(
    (sum, items) => sum + items.total, 
    0
  );
  
  // Calculate completed work items for all colors
  const completedWorkItems = Object.values(workItems).reduce(
    (sum, items) => sum + items.completed, 
    0
  );
  
  // Check if all work is completed
  const isCompleted = totalWorkItems > 0 && completedWorkItems >= totalWorkItems;

  // Reference to the card element
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Effect to add event listener for custom workerdrop event (for mobile)
  useEffect(() => {
    const cardElement = cardRef.current;
    
    // Handler for the custom workerdrop event
    const handleWorkerDrop = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { workerId, workerType } = customEvent.detail;
      
      if (onWorkerDrop && workerId && workerType) {
        onWorkerDrop(workerId, workerType);
      }
    };
    
    // Add event listener
    if (cardElement) {
      cardElement.addEventListener('workerdrop', handleWorkerDrop);
    }
    
    // Clean up
    return () => {
      if (cardElement) {
        cardElement.removeEventListener('workerdrop', handleWorkerDrop);
      }
    };
  }, [onWorkerDrop]);

  return (
    <div 
      ref={cardRef}
      className={`card ${isBlocked ? 'card-blocked' : ''} ${isCompleted ? 'card-completed' : ''} ${isDragOver ? 'card-drag-over' : ''}`} 
      data-testid="card" 
      data-card-id={id}
      data-stage={stage}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="card-header">
        <span className="card-id">{id}</span>
        {age > 0 && stage !== 'done' && <span className="card-age">Age: {age} days</span>}
        {stage === 'done' && completionDay && <span className="card-age">Completion day: {completionDay}</span>}
      </div>
      <div className="card-content" style={stage === 'done' ? { fontWeight: 'bold' } : {}}>{content}</div>
      
      {isBlocked && <div className="card-blocked-label">BLOCKED!</div>}
      
      {assignedWorkers.length > 0 && (
        <div className="card-assigned-workers">
          {assignedWorkers.map(worker => (
            <div key={worker.id} className={`card-assigned-worker worker-${worker.type}`}>
              Worker: {worker.id}
            </div>
          ))}
        </div>
      )}
      
      <div className="card-work-items-container">
        {/* Red work items */}
        {workItems.red && workItems.red.total > 0 && (
          <div className="card-work-items-section">
            <div className="card-work-items-label">Red:</div>
            <div className="card-work-items">
              {Array.from({ length: workItems.red.total }, (_, index) => (
                <div 
                  key={`red-${index}`} 
                  className={`work-item ${index < workItems.red.completed ? 'completed' : ''}`}
                  style={{ backgroundColor: index < workItems.red.completed ? 'red' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Blue work items */}
        {workItems.blue && workItems.blue.total > 0 && (
          <div className="card-work-items-section">
            <div className="card-work-items-label">Blue:</div>
            <div className="card-work-items">
              {Array.from({ length: workItems.blue.total }, (_, index) => (
                <div 
                  key={`blue-${index}`} 
                  className={`work-item ${index < workItems.blue.completed ? 'completed' : ''}`}
                  style={{ backgroundColor: index < workItems.blue.completed ? 'blue' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Green work items */}
        {workItems.green && workItems.green.total > 0 && (
          <div className="card-work-items-section">
            <div className="card-work-items-label">Green:</div>
            <div className="card-work-items">
              {Array.from({ length: workItems.green.total }, (_, index) => (
                <div 
                  key={`green-${index}`} 
                  className={`work-item ${index < workItems.green.completed ? 'completed' : ''}`}
                  style={{ backgroundColor: index < workItems.green.completed ? 'green' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <span className="card-start-day">Start: Day {startDay}</span>
      </div>
    </div>
  );
};
