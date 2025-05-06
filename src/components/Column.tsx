import React from 'react';
import { Card as CardComponent } from './Card';

// We're using a different name for the imported component to avoid confusion with the type
interface CardType {
  id: string;
  content: string;
  stage?: string; // Make stage optional to maintain compatibility
}

interface ColumnProps {
  title: string;
  cards: CardType[];
}

export const Column: React.FC<ColumnProps> = ({ title, cards }) => {
  return (
    <div className="column">
      <h2>{title}</h2>
      <div className="cards-container">
        {cards.map((card) => (
          <CardComponent key={card.id} id={card.id} content={card.content} />
        ))}
      </div>
    </div>
  );
};
