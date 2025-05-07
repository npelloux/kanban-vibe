import React from 'react';
import { Card as CardComponent } from './Card';
import { WorkButton } from './WorkButton';
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
  showWorkButton?: boolean;
  showAddCardButton?: boolean;
  onWork?: () => void;
  onCardClick?: (cardId: string) => void;
  onWorkerDrop?: (cardId: string, workerId: string) => void;
  onAddCard?: () => void;
}

export const Column: React.FC<ColumnProps> = ({ 
  title, 
  cards, 
  onWork = () => {}, 
  showWorkButton = false,
  showAddCardButton = false,
  type = 'default',
  status = 'active',
  onCardClick = () => {},
  onWorkerDrop = () => {},
  onAddCard = () => {}
}) => {
  return (
    <div className={`column column-${type} column-${status}`}>
      {/* Column header with title and buttons */}
      <div className="column-header">
        <h2>{title}</h2>
        <div className="column-buttons">
          {showWorkButton && (
            <WorkButton onClick={onWork} columnTitle={title} />
          )}
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
