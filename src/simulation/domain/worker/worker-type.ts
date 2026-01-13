export { ALL_WORKER_TYPES, type WorkerType } from '../card/work-items';

import { ALL_WORKER_TYPES, type WorkerType } from '../card/work-items';

export function isValidWorkerType(value: unknown): value is WorkerType {
  return (
    typeof value === 'string' &&
    ALL_WORKER_TYPES.includes(value as WorkerType)
  );
}
