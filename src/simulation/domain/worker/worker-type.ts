import { ALL_WORKER_TYPES, type WorkerType } from '../card/work-items';

export { ALL_WORKER_TYPES, type WorkerType };

export function isValidWorkerType(value: unknown): value is WorkerType {
  return (
    typeof value === 'string' &&
    ALL_WORKER_TYPES.some((type) => type === value)
  );
}
