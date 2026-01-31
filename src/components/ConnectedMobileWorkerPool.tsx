import React from 'react';
import { MobileWorkerPool } from './MobileWorkerPool';
import { useWorkerManagement } from '../simulation/api/use-workers';

export const ConnectedMobileWorkerPool: React.FC = () => {
  const { workers, selectedWorkerId, selectWorker, addWorker, deleteWorker } =
    useWorkerManagement();

  return (
    <MobileWorkerPool
      workers={workers}
      selectedWorkerId={selectedWorkerId}
      onWorkerSelect={selectWorker}
      onAddWorker={addWorker}
      onDeleteWorker={deleteWorker}
    />
  );
};
