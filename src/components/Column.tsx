import React from 'react';
import { Card as CardComponent } from './Card';
import { WorkButton } from './WorkButton';
import type { WorkItemsType } from './Card';
import type { WorkerType } from './Worker';

// We're using a different name for the imported component to avoid confusion with the type
interface CardType {
  id: string;
  content: string;
  stage?: string; // Make stage optional to maintain compatibility
  age?: number;
  startDay?: number;
  isBlocked?: boolean;
  workItems?: WorkItemsType;
  assignedWorker?: {
    id: string;
    type: WorkerType;
  } | null;
  completionDay?: number;
}

interface ColumnProps {
  title: string;
  cards: CardType[];
  onWork?: () => void;
  showWorkButton?: boolean;
  type?: 'red' | 'blue' | 'green' | 'options' | 'default';
  status?: 'active' | 'finished';
  onCardClick?: (cardId: string) => void;
}

export const Column: React.FC<ColumnProps> = ({ 
  title, 
  cards, 
  onWork = () => {}, 
  showWorkButton = false,
  type = 'default',
  status = 'active',
  onCardClick = () => {}
}) => {
  return (
    <div className={`column column-${type} column-${status}`}>
      <div className="column-header">
        <h2>{title}</h2>
        {showWorkButton && <WorkButton onClick={onWork} columnTitle={title} />}
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
            assignedWorker={card.assignedWorker}
            onClick={() => onCardClick(card.id)}
            stage={card.stage}
            completionDay={card.completionDay}
          />
        ))}
      </div>
    </div>
  );
};
