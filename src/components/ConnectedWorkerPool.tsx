import React from 'react';
import { WorkerPool } from './WorkerPool';
import { useWorkerManagement } from '../simulation/api/use-workers';

export const ConnectedWorkerPool: React.FC = () => {
  const { workers, selectedWorkerId, selectWorker, addWorker, deleteWorker } =
    useWorkerManagement();

  return (
    <WorkerPool
      workers={workers}
      selectedWorkerId={selectedWorkerId}
      onWorkerSelect={selectWorker}
      onAddWorker={addWorker}
      onDeleteWorker={deleteWorker}
    />
  );
};
