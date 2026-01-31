import React, { useState } from 'react';
import { Card as CardComponent } from './Card';
import type { WorkItemsType } from './Card';
import type { Card, WorkerType } from '../simulation/domain/card/card';
import type { CardId } from '../simulation/domain/card/card-id';

export interface WipLimit {
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
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCardClick?: (cardId: CardId) => void;
  onWorkerDrop?: (cardId: CardId, workerId: string, workerType: WorkerType) => void;
  onAddCard?: () => void;
  onToggleBlock?: (cardId: CardId) => void;
}

export type { WorkItemsType };

function getCardCountText(count: number): string {
  if (count === 0) return 'Empty';
  if (count === 1) return '1 card';
  return `${count} cards`;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  cards,
  showAddCardButton = false,
  type = 'options',
  status = 'active',
  collapsible = false,
  defaultCollapsed = false,
  onCardClick,
  onWorkerDrop,
  onAddCard,
  onToggleBlock,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const stageValue = type === 'options' ? 'options' : `${type}-${status}`;

  const handleCardClick = onCardClick;
  const handleWorkerDrop = onWorkerDrop;
  const handleToggleBlock = onToggleBlock;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const columnClasses = [
    'column',
    `column-${type}`,
    `column-${status}`,
    isCollapsed ? 'column-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={columnClasses} data-stage={stageValue}>
      <div className="column-header">
        <h2>{title}</h2>
        <div className="column-buttons">
          {collapsible && (
            <button
              type="button"
              className="column-collapse-button"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Expand column' : 'Collapse column'}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          )}
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
      {isCollapsed ? (
        <div className="column-collapsed-content">
          <span className="column-card-count">{getCardCountText(cards.length)}</span>
        </div>
      ) : (
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
      )}
    </div>
  );
};
