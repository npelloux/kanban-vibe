import React from 'react';

interface CardProps {
  id: string;
  content: string;
  age?: number;
  startDay?: number;
  isBlocked?: boolean;
  workItems?: {
    total: number;
    completed: number;
    color?: string;
  };
}

export const Card: React.FC<CardProps> = ({ 
  id, 
  content, 
  age = 0, 
  startDay = 1,
  isBlocked = false,
  workItems = { total: 6, completed: 0 }
}) => {
  // Create an array of work items
  const workItemsArray = Array.from({ length: workItems.total }, (_, index) => ({
    completed: index < workItems.completed,
    color: workItems.color || 'red'
  }));

  return (
    <div 
      className={`card ${isBlocked ? 'card-blocked' : ''}`} 
      data-testid="card" 
      data-card-id={id}
    >
      <div className="card-header">
        <span className="card-id">{id}</span>
        {age > 0 && <span className="card-age">Age: {age} days</span>}
      </div>
      <div className="card-content">{content}</div>
      
      {isBlocked && <div className="card-blocked-label">BLOCKED!</div>}
      
      <div className="card-work-items">
        {workItemsArray.map((item, index) => (
          <div 
            key={index} 
            className={`work-item ${item.completed ? 'completed' : ''}`}
            style={{ backgroundColor: item.completed ? item.color : 'transparent' }}
          />
        ))}
      </div>
      
      <div className="card-footer">
        <span className="card-start-day">Start: Day {startDay}</span>
      </div>
    </div>
  );
};
