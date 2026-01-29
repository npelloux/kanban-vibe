import { Board } from '../domain/board/board';
import { Worker } from '../domain/worker/worker';
import { WipLimits } from '../domain/wip/wip-limits';

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

export function createBoardWithDefaultWorkers(): Board {
  let board = Board.empty(WipLimits.empty());
  board = Board.addWorker(board, Worker.create('bob', 'red'));
  board = Board.addWorker(board, Worker.create('zoe', 'blue'));
  board = Board.addWorker(board, Worker.create('lea', 'blue'));
  board = Board.addWorker(board, Worker.create('taz', 'green'));
  return board;
}
