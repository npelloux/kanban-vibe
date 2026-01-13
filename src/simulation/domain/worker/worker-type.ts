export type { WorkerType } from '../card/work-items';

export const ALL_WORKER_TYPES = ['red', 'blue', 'green'] as const;

export function isValidWorkerType(value: unknown): value is typeof ALL_WORKER_TYPES[number] {
  return (
    typeof value === 'string' &&
    ALL_WORKER_TYPES.includes(value as typeof ALL_WORKER_TYPES[number])
  );
}
