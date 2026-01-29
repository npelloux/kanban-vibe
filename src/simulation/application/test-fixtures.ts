import { Worker } from '../domain/worker/worker';

export {
  createValidCardId,
  createTestCard,
  createTestCardWithId,
  type CardOverrides,
} from '../domain/card/card-test-fixtures';

export function createTestWorker(
  id: string,
  type: 'red' | 'blue' | 'green' = 'red'
): ReturnType<typeof Worker.create> {
  return Worker.create(id, type);
}
