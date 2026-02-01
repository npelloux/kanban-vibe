import React, { useState, useRef } from 'react';
import { Worker } from './Worker';
import type { WorkerType } from './Worker';

interface WorkerSummary {
  readonly id: string;
  readonly type: WorkerType;
}

type ControlledOpenProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type UncontrolledOpenProps = {
  isOpen?: undefined;
  onOpenChange?: undefined;
};

type MobileWorkerPoolProps = {
  workers: readonly WorkerSummary[];
  selectedWorkerId: string | null;
  onWorkerSelect: (workerId: string) => void;
  onAddWorker?: (type: WorkerType) => void;
  onDeleteWorker?: (workerId: string) => void;
} & (ControlledOpenProps | UncontrolledOpenProps);

const SWIPE_THRESHOLD = 80;

export const MobileWorkerPool: React.FC<MobileWorkerPoolProps> = ({
  workers,
  selectedWorkerId,
  onWorkerSelect,
  onAddWorker,
  onDeleteWorker,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalIsOpen(value);
    }
  };
  const [showAddWorkerOptions, setShowAddWorkerOptions] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkerType>('red');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleFabClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowAddWorkerOptions(false);
    setSwipeOffset(0);
  };

  const handleOverlayKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (sheet && sheet.scrollTop === 0) {
      touchStartY.current = event.touches[0].clientY;
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const currentY = event.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    setSwipeOffset(Math.max(0, deltaY));
  };

  const handleTouchEnd = () => {
    if (swipeOffset > SWIPE_THRESHOLD) {
      handleClose();
    } else {
      setSwipeOffset(0);
    }
    touchStartY.current = null;
  };

  const handleTouchCancel = () => {
    setSwipeOffset(0);
    touchStartY.current = null;
  };

  const handleAddClick = () => {
    setShowAddWorkerOptions(!showAddWorkerOptions);
  };

  const handleTypeSelect = (type: WorkerType) => {
    setSelectedType(type);
  };

  const handleAddWorker = () => {
    if (onAddWorker) {
      onAddWorker(selectedType);
      setShowAddWorkerOptions(false);
    }
  };

  const handleDeleteWorker = (workerId: string) => {
    if (onDeleteWorker) {
      onDeleteWorker(workerId);
    }
  };

  const sheetStyle = swipeOffset > 0
    ? { transform: `translateY(${swipeOffset}px)`, transition: 'none' }
    : {};

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="mobile-worker-pool-fab"
          onClick={handleFabClick}
          aria-label="Open worker pool"
        >
          <span className="mobile-worker-pool-fab-icon">👷</span>
          <span className="mobile-worker-pool-fab-badge">{workers.length}</span>
        </button>
      )}

      {isOpen && (
        <>
          <button
            type="button"
            className="mobile-worker-pool-overlay"
            data-testid="bottom-sheet-overlay"
            aria-label="Close worker pool"
            onClick={handleClose}
            onKeyDown={handleOverlayKeyDown}
          />
          <div
            ref={sheetRef}
            className="mobile-worker-pool-sheet"
            role="dialog"
            aria-label="Worker pool"
            style={sheetStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
          >
            <div className="mobile-worker-pool-header">
              <h3>Workers</h3>
              <button
                type="button"
                className="mobile-worker-pool-close"
                onClick={handleClose}
                aria-label="Close worker pool"
              >
                ✕
              </button>
            </div>

            {onAddWorker && (
              <div className="mobile-worker-pool-actions">
                <button
                  type="button"
                  className="mobile-add-worker-button"
                  onClick={handleAddClick}
                  aria-label="Add worker"
                >
                  + Add Worker
                </button>
              </div>
            )}

            {showAddWorkerOptions && (
              <div className="mobile-add-worker-options">
                <div className="mobile-worker-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="mobile-worker-type"
                      value="red"
                      checked={selectedType === 'red'}
                      onChange={() => handleTypeSelect('red')}
                    />
                    Red
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="mobile-worker-type"
                      value="blue"
                      checked={selectedType === 'blue'}
                      onChange={() => handleTypeSelect('blue')}
                    />
                    Blue
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="mobile-worker-type"
                      value="green"
                      checked={selectedType === 'green'}
                      onChange={() => handleTypeSelect('green')}
                    />
                    Green
                  </label>
                </div>
                <button
                  type="button"
                  className="mobile-confirm-add-worker"
                  onClick={handleAddWorker}
                >
                  Confirm
                </button>
              </div>
            )}

            <div className="mobile-worker-pool-content">
              {workers.map((worker) => (
                <div key={worker.id} className="mobile-worker-container">
                  <Worker
                    id={worker.id}
                    type={worker.type}
                    isSelected={selectedWorkerId === worker.id}
                    onClick={() => onWorkerSelect(worker.id)}
                  />
                  {onDeleteWorker && (
                    <button
                      type="button"
                      className="mobile-delete-worker-button"
                      onClick={() => handleDeleteWorker(worker.id)}
                      aria-label="Delete worker"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};
