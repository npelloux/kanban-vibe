import { type WorkerType, isValidWorkerType } from './worker-type';

export interface Worker {
  readonly id: string;
  readonly type: WorkerType;
}

export const Worker = {
  create(id: string, type: WorkerType): Worker {
    const trimmedId = id.trim();
    if (trimmedId === '') {
      throw new Error('Worker id cannot be empty');
    }
    if (!isValidWorkerType(type)) {
      throw new Error(`Invalid worker type: ${type}`);
    }
    return { id: trimmedId, type };
  },
} as const;
