import React from 'react';

interface Card {
  id: string;
  content: string;
}

interface ColumnProps {
  title: string;
  cards: Card[];
}

export const Column: React.FC<ColumnProps> = ({ title, cards }) => {
  return (
    <div className="column">
      <h2>{title}</h2>
      <div className="cards-container">
        {cards.map((card) => (
          <div key={card.id} data-testid="card">
            {card.content}
          </div>
        ))}
      </div>
    </div>
  );
};
