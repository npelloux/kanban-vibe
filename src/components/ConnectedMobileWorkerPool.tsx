import React from 'react';
import { MobileWorkerPool } from './MobileWorkerPool';
import { useWorkerManagement } from '../simulation/api/use-workers';

interface ConnectedMobileWorkerPoolProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const ConnectedMobileWorkerPool: React.FC<ConnectedMobileWorkerPoolProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { workers, selectedWorkerId, selectWorker, addWorker, deleteWorker } =
    useWorkerManagement();

  return (
    <MobileWorkerPool
      workers={workers}
      selectedWorkerId={selectedWorkerId}
      onWorkerSelect={selectWorker}
      onAddWorker={addWorker}
      onDeleteWorker={deleteWorker}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
};
