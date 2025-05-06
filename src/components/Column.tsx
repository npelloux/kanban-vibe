import React from 'react';
import { Card } from './Card';

interface CardType {
  id: string;
  content: string;
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
          <Card key={card.id} id={card.id} content={card.content} />
        ))}
      </div>
    </div>
  );
};
