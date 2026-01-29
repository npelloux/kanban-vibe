import React from 'react';
import { Card as CardComponent } from './Card';
import type { WorkItemsType } from './Card';
import type { Card } from '../simulation/domain/card/card';
import type { CardId } from '../simulation/domain/card/card-id';

interface WipLimit {
  readonly min: number;
  readonly max: number;
}

interface ColumnProps {
  title: string;
  cards: readonly Card[];
  type?: 'options' | 'red' | 'blue' | 'green';
  status?: 'active' | 'finished';
  showAddCardButton?: boolean;
  wipLimit?: WipLimit;
  onCardClick?: (cardId: string) => void;
  onWorkerDrop?: (cardId: string, workerId: string) => void;
  onAddCard?: () => void;
  onToggleBlock?: (cardId: string) => void;
}

export type { WorkItemsType };

export const Column: React.FC<ColumnProps> = ({
  title,
  cards,
  showAddCardButton = false,
  type = 'options',
  status = 'active',
  onCardClick,
  onWorkerDrop,
  onAddCard,
  onToggleBlock
}) => {
  const stageValue = type === 'options' ? 'options' : `${type}-${status}`;

  const handleCardClick = onCardClick
    ? (cardId: CardId) => onCardClick(cardId)
    : undefined;

  const handleWorkerDrop = onWorkerDrop
    ? (cardId: CardId, workerId: string) => onWorkerDrop(cardId, workerId)
    : undefined;

  const handleToggleBlock = onToggleBlock
    ? (cardId: CardId) => onToggleBlock(cardId)
    : undefined;

  return (
    <div className={`column column-${type} column-${status}`} data-stage={stageValue}>
      <div className="column-header">
        <h2>{title}</h2>
        <div className="column-buttons">
          {showAddCardButton && (
            <button
              className="add-card-button"
              onClick={onAddCard}
              title="Add a new job"
            >
              + New
            </button>
          )}
        </div>
      </div>
      <div className="cards-container">
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
            onToggleBlock={handleToggleBlock}
          />
        ))}
      </div>
    </div>
  );
};
