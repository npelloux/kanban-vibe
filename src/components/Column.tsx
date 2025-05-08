import React from 'react';
import { Card as CardComponent } from './Card';
import type { WorkItemsType } from './Card';
import type { WorkerType } from './Worker';

// We're using a different name for the imported component to avoid confusion with the type
interface Card {
  id: string;
  content: string;
  stage?: string; // Make stage optional to maintain compatibility
  age?: number;
  startDay?: number;
  isBlocked?: boolean;
  workItems?: WorkItemsType;
  assignedWorkers?: {
    id: string;
    type: WorkerType;
  }[];
  completionDay?: number;
}

interface ColumnProps {
  title: string;
  cards: Card[];
  type?: 'options' | 'red' | 'blue' | 'green';
  status?: 'active' | 'finished';
  showAddCardButton?: boolean;
  onCardClick?: (cardId: string) => void;
  onWorkerDrop?: (cardId: string, workerId: string) => void;
  onAddCard?: () => void;
}

export const Column: React.FC<ColumnProps> = ({ 
  title, 
  cards, 
  showAddCardButton = false,
  type = 'default',
  status = 'active',
  onCardClick = () => {},
  onWorkerDrop = () => {},
  onAddCard = () => {}
}) => {
  // Determine the stage value for data-stage attribute
  const stageValue = `${type}${status === 'active' ? '-active' : ''}`;
  
  return (
    <div className={`column column-${type} column-${status}`} data-stage={stageValue}>
      {/* Column header with title and buttons */}
      <div className="column-header">
        <h2>{title}</h2>
        <div className="column-buttons">
          {showAddCardButton && (
            <button 
              className="add-card-button" 
              onClick={onAddCard}
              title="Add a new card"
            >
              + Add Card
            </button>
          )}
        </div>
      </div>
      <div className="cards-container">
        {cards.map((card) => (
          <CardComponent 
            key={card.id} 
            id={card.id} 
            content={card.content}
            age={card.age}
            startDay={card.startDay}
            isBlocked={card.isBlocked}
            workItems={card.workItems}
            assignedWorkers={card.assignedWorkers}
            onClick={() => onCardClick(card.id)}
            stage={card.stage}
            completionDay={card.completionDay}
            onWorkerDrop={(workerId) => onWorkerDrop(card.id, workerId)}
          />
        ))}
      </div>
    </div>
  );
};
