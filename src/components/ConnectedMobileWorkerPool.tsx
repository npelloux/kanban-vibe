import React from 'react';
import { MobileWorkerPool } from './MobileWorkerPool';
import { useWorkerManagement } from '../simulation/api/use-workers';

type ControlledOpenProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type UncontrolledOpenProps = {
  isOpen?: undefined;
  onOpenChange?: undefined;
};

type ConnectedMobileWorkerPoolProps = ControlledOpenProps | UncontrolledOpenProps;

export const ConnectedMobileWorkerPool: React.FC<ConnectedMobileWorkerPoolProps> = (props) => {
  const { workers, selectedWorkerId, selectWorker, addWorker, deleteWorker } =
    useWorkerManagement();

  const controlledProps =
    props.isOpen !== undefined
      ? { isOpen: props.isOpen, onOpenChange: props.onOpenChange }
      : {};

  return (
    <MobileWorkerPool
      workers={workers}
      selectedWorkerId={selectedWorkerId}
      onWorkerSelect={selectWorker}
      onAddWorker={addWorker}
      onDeleteWorker={deleteWorker}
      {...controlledProps}
    />
  );
};
