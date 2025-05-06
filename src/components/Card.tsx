import React from 'react';
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
  assignedWorker?: {
    id: string;
    type: WorkerType;
  } | null;
  onClick?: () => void;
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
  assignedWorker = null,
  onClick
}) => {
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

  return (
    <div 
      className={`card ${isBlocked ? 'card-blocked' : ''} ${isCompleted ? 'card-completed' : ''}`} 
      data-testid="card" 
      data-card-id={id}
      onClick={onClick}
    >
      <div className="card-header">
        <span className="card-id">{id}</span>
        {age > 0 && <span className="card-age">Age: {age} days</span>}
      </div>
      <div className="card-content">{content}</div>
      
      {isBlocked && <div className="card-blocked-label">BLOCKED!</div>}
      
      {assignedWorker && (
        <div className={`card-assigned-worker worker-${assignedWorker.type}`}>
          Worker: {assignedWorker.id}
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
