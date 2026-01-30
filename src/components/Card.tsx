import React, { useState, useEffect, useRef } from 'react';
import type { Card as DomainCard, WorkerType } from '../simulation/domain/card/card';
import type { CardId } from '../simulation/domain/card/card-id';
import { WorkItems, type WorkItems as WorkItemsInterface } from '../simulation/domain/card/work-items';

export type WorkItemsType = WorkItemsInterface;

interface CardProps {
  card: DomainCard;
  onCardClick?: (cardId: CardId) => void;
  onWorkerDrop?: (cardId: CardId, workerId: string, workerType: WorkerType) => void;
  onToggleBlock?: (cardId: CardId) => void;
  onBlockReasonChange?: (cardId: CardId, reason: string) => void;
}

function isDropAllowedStage(stage: DomainCard['stage']): boolean {
  return stage === 'red-active' || stage === 'blue-active' || stage === 'green';
}

export const Card: React.FC<CardProps> = ({
  card,
  onCardClick,
  onWorkerDrop,
  onToggleBlock,
  onBlockReasonChange
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDropAllowedStage(card.stage)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!isDragOver) {
        setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.id && data.type && onWorkerDrop) {
        onWorkerDrop(card.id, data.id, data.type);
      }
    } catch (error) {
      console.error('Error parsing dropped worker data:', error);
    }
  };

  const isCompleted = WorkItems.isAllComplete(card.workItems);

  const handleToggleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBlock) {
      onToggleBlock(card.id);
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onCardClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onCardClick(card.id);
    }
  };

  useEffect(() => {
    const cardElement = cardRef.current;

    const handleWorkerDrop = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { workerId, workerType } = customEvent.detail;

      if (onWorkerDrop && workerId && workerType) {
        onWorkerDrop(card.id, workerId, workerType);
      }
    };

    if (cardElement) {
      cardElement.addEventListener('workerdrop', handleWorkerDrop);
    }

    return () => {
      if (cardElement) {
        cardElement.removeEventListener('workerdrop', handleWorkerDrop);
      }
    };
  }, [onWorkerDrop, card.id]);

  return (
    <div
      ref={cardRef}
      className={`card ${card.isBlocked ? 'card-blocked' : ''} ${isCompleted ? 'card-completed' : ''} ${isDragOver ? 'card-drag-over' : ''}`}
      data-testid="card"
      data-card-id={card.id}
      data-stage={card.stage}
      role="button"
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick ? () => onCardClick(card.id) : undefined}
      onKeyDown={onCardClick ? handleKeyDown : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="card-header">
        <span className="card-id">{card.id}</span>
        {card.age > 0 && card.stage !== 'done' && <span className="card-age">Age: {card.age} days</span>}
        {card.stage === 'done' && card.completionDay && <span className="card-age">Completion day: {card.completionDay}</span>}
        {onToggleBlock && (
          <button
            className="card-block-toggle"
            onClick={handleToggleBlockClick}
            aria-label="Toggle block"
            aria-pressed={card.isBlocked}
            type="button"
          >
            {card.isBlocked ? '🔒' : '🔓'}
          </button>
        )}
      </div>
      <div className="card-content" style={card.stage === 'done' ? { fontWeight: 'bold' } : {}}>{card.content}</div>

      {card.isBlocked && <div className="card-blocked-label">BLOCKED!</div>}

      {card.isBlocked && onBlockReasonChange && (
        <input
          type="text"
          className="card-block-reason-input"
          placeholder="Block reason..."
          aria-label="Block reason"
          value={card.blockReason ?? ''}
          onChange={(e) => onBlockReasonChange(card.id, e.target.value)}
        />
      )}

      {card.assignedWorkers.length > 0 && (
        <div className="card-assigned-workers">
          {card.assignedWorkers.map(worker => (
            <div key={worker.id} className={`card-assigned-worker worker-${worker.type}`}>
              Worker: {worker.id}
            </div>
          ))}
        </div>
      )}

      <div className="card-work-items-container">
        {card.workItems.red.total > 0 && (
          <div className="card-work-items-section">
            <div className="card-work-items">
              {Array.from({ length: card.workItems.red.total }, (_, index) => (
                <div
                  key={`red-${index}`}
                  className={`work-item ${index < card.workItems.red.completed ? 'completed work-item-red' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {card.workItems.blue.total > 0 && (
          <div className="card-work-items-section">
            <div className="card-work-items">
              {Array.from({ length: card.workItems.blue.total }, (_, index) => (
                <div
                  key={`blue-${index}`}
                  className={`work-item ${index < card.workItems.blue.completed ? 'completed work-item-blue' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {card.workItems.green.total > 0 && (
          <div className="card-work-items-section">
            <div className="card-work-items">
              {Array.from({ length: card.workItems.green.total }, (_, index) => (
                <div
                  key={`green-${index}`}
                  className={`work-item ${index < card.workItems.green.completed ? 'completed work-item-green' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-start-day">Start: Day {card.startDay}</span>
      </div>
    </div>
  );
};
