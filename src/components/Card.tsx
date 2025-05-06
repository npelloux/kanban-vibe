import React from 'react';

interface CardProps {
  id: string;
  content: string;
}

export const Card: React.FC<CardProps> = ({ id, content }) => {
  return (
    <div className="card" data-testid="card" data-card-id={id}>
      <div className="card-content">{content}</div>
    </div>
  );
};
