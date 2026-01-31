import React, { useState } from 'react';
import { Worker } from './Worker';
import type { WorkerType } from './Worker';

interface WorkerData {
  readonly id: string;
  readonly type: WorkerType;
}

interface MobileWorkerPoolProps {
  workers: readonly WorkerData[];
  selectedWorkerId: string | null;
  onWorkerSelect: (workerId: string) => void;
  onAddWorker?: (type: WorkerType) => void;
  onDeleteWorker?: (workerId: string) => void;
}

export const MobileWorkerPool: React.FC<MobileWorkerPoolProps> = ({
  workers,
  selectedWorkerId,
  onWorkerSelect,
  onAddWorker,
  onDeleteWorker,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddWorkerOptions, setShowAddWorkerOptions] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkerType>('red');

  const handleFabClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowAddWorkerOptions(false);
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
          <div
            className="mobile-worker-pool-overlay"
            data-testid="bottom-sheet-overlay"
            onClick={handleClose}
          />
          <div
            className="mobile-worker-pool-sheet"
            role="dialog"
            aria-label="Worker pool"
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
