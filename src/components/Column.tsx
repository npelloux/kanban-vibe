import React from 'react';
import { Card as CardComponent } from './Card';
import { WorkButton } from './WorkButton';

// We're using a different name for the imported component to avoid confusion with the type
interface CardType {
  id: string;
  content: string;
  stage?: string; // Make stage optional to maintain compatibility
  age?: number;
  startDay?: number;
  isBlocked?: boolean;
  workItems?: {
    total: number;
    completed: number;
    color?: string;
  };
}

interface ColumnProps {
  title: string;
  cards: CardType[];
  onWork?: () => void;
  showWorkButton?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ 
  title, 
  cards, 
  onWork = () => {}, 
  showWorkButton = title === 'dev' 
}) => {
  return (
    <div className="column">
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
          />
        ))}
      </div>
    </div>
  );
};
