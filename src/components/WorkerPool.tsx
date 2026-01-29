import React, { useState } from 'react';
import { Worker } from './Worker';
import type { WorkerType } from './Worker';

interface WorkerData {
  id: string;
  type: WorkerType;
}

interface WorkerPoolProps {
  workers: WorkerData[];
  selectedWorkerId: string | null;
  onWorkerSelect: (workerId: string) => void;
  onAddWorker?: (type: WorkerType) => void;
  onDeleteWorker?: (workerId: string) => void;
}

export const WorkerPool: React.FC<WorkerPoolProps> = ({
  workers,
  selectedWorkerId,
  onWorkerSelect,
  onAddWorker,
  onDeleteWorker,
}) => {
  const [showAddWorkerOptions, setShowAddWorkerOptions] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkerType>('red');

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
    <div className="worker-pool">
      <div className="worker-pool-header">
        <h3>Workers</h3>
        <button
          type="button"
          className="add-worker-button"
          onClick={handleAddClick}
          title="Add a new worker"
        >
          + Add Worker
        </button>
      </div>

      {showAddWorkerOptions && (
        <div className="add-worker-options">
          <div className="worker-type-selector">
            <label>
              <input
                type="radio"
                name="worker-type"
                value="red"
                checked={selectedType === 'red'}
                onChange={() => handleTypeSelect('red')}
              />
              Red
            </label>
            <label>
              <input
                type="radio"
                name="worker-type"
                value="blue"
                checked={selectedType === 'blue'}
                onChange={() => handleTypeSelect('blue')}
              />
              Blue
            </label>
            <label>
              <input
                type="radio"
                name="worker-type"
                value="green"
                checked={selectedType === 'green'}
                onChange={() => handleTypeSelect('green')}
              />
              Green
            </label>
          </div>
          <button type="button" className="confirm-add-worker" onClick={handleAddWorker}>
            Confirm
          </button>
        </div>
      )}

      <div className="worker-pool-content">
        {workers.map((worker) => (
          <div key={worker.id} className="worker-container">
            <Worker
              id={worker.id}
              type={worker.type}
              isSelected={selectedWorkerId === worker.id}
              onClick={() => onWorkerSelect(worker.id)}
            />
            {onDeleteWorker && (
              <button
                type="button"
                className="delete-worker-button"
                onClick={() => handleDeleteWorker(worker.id)}
                title="Delete worker"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
