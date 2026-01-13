import { type WorkerType, isValidWorkerType } from './worker-type';

export interface Worker {
  readonly id: string;
  readonly type: WorkerType;
}

export const Worker = {
  create(id: string, type: WorkerType): Worker {
    if (id.trim() === '') {
      throw new Error('Worker id cannot be empty');
    }
    if (!isValidWorkerType(type)) {
      throw new Error(`Invalid worker type: ${type}`);
    }
    return { id, type };
  },
} as const;
