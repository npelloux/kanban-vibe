import React from 'react';
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
}

export const WorkerPool: React.FC<WorkerPoolProps> = ({ 
  workers, 
  selectedWorkerId, 
  onWorkerSelect 
}) => {
  return (
    <div className="worker-pool">
      <div className="worker-pool-header">
        <h3>Workers</h3>
      </div>
      <div className="worker-pool-content">
        {workers.map((worker) => (
          <Worker
            key={worker.id}
            id={worker.id}
            type={worker.type}
            isSelected={selectedWorkerId === worker.id}
            onClick={() => onWorkerSelect(worker.id)}
          />
        ))}
      </div>
    </div>
  );
};
