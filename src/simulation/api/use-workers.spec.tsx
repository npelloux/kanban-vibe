import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useWorkerManagement } from './use-workers';
import { BoardProvider } from './board-context';
import { Board } from '../domain/board/board';
import { Worker } from '../domain/worker/worker';
import type { WorkerType } from '../domain/worker/worker-type';
import { WipLimits } from '../domain/wip/wip-limits';
import { StateRepository } from '../infra/state-repository';

vi.mock('../infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
  },
}));

function createTestBoard(
  overrides: Partial<{
    workers: readonly Worker[];
  }> = {}
): Board {
  return Board.create({
    wipLimits: WipLimits.empty(),
    cards: [],
    workers: overrides.workers ?? [],
    currentDay: 0,
  });
}

interface HookResult {
  workers: readonly Worker[];
  addWorker: (type: WorkerType) => void;
  deleteWorker: (workerId: string) => void;
  selectedWorkerId: string | null;
  selectWorker: (workerId: string | null) => void;
}

function TestConsumer({ onResult }: { onResult: (result: HookResult) => void }) {
  const result = useWorkerManagement();
  onResult(result);
  return (
    <div>
      <span data-testid="worker-count">{result.workers.length}</span>
      <span data-testid="selected-worker">{result.selectedWorkerId ?? 'none'}</span>
    </div>
  );
}

function renderHook(board: Board) {
  let hookResult: HookResult | null = null;
  vi.mocked(StateRepository.loadBoard).mockReturnValue(board);

  const result = render(
    <BoardProvider>
      <TestConsumer onResult={(r) => { hookResult = r; }} />
    </BoardProvider>
  );

  return { ...result, getHookResult: () => hookResult! };
}

describe('useWorkerManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hook return value', () => {
    it('exposes workers array from board', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().workers).toHaveLength(1);
      expect(getHookResult().workers[0].id).toBe('R1');
    });

    it('exposes all action functions', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      expect(typeof getHookResult().addWorker).toBe('function');
      expect(typeof getHookResult().deleteWorker).toBe('function');
      expect(typeof getHookResult().selectWorker).toBe('function');
    });

    it('exposes selectedWorkerId initially as null', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      expect(getHookResult().selectedWorkerId).toBeNull();
    });
  });

  describe('addWorker', () => {
    it('adds a red worker with ID R1 when no red workers exist', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('red');
      });

      expect(getHookResult().workers).toHaveLength(1);
      expect(getHookResult().workers[0].id).toBe('R1');
      expect(getHookResult().workers[0].type).toBe('red');
    });

    it('adds a blue worker with ID B1 when no blue workers exist', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('blue');
      });

      expect(getHookResult().workers).toHaveLength(1);
      expect(getHookResult().workers[0].id).toBe('B1');
      expect(getHookResult().workers[0].type).toBe('blue');
    });

    it('adds a green worker with ID G1 when no green workers exist', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('green');
      });

      expect(getHookResult().workers).toHaveLength(1);
      expect(getHookResult().workers[0].id).toBe('G1');
      expect(getHookResult().workers[0].type).toBe('green');
    });

    it('generates sequential ID R2 when R1 exists', () => {
      const existingWorker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [existingWorker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('red');
      });

      expect(getHookResult().workers).toHaveLength(2);
      const newWorker = getHookResult().workers.find(w => w.id === 'R2');
      expect(newWorker).toBeDefined();
      expect(newWorker?.type).toBe('red');
    });

    it('generates sequential ID B3 when B1 and B2 exist', () => {
      const workers = [
        Worker.create('B1', 'blue'),
        Worker.create('B2', 'blue'),
      ];
      const board = createTestBoard({ workers });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('blue');
      });

      expect(getHookResult().workers).toHaveLength(3);
      const newWorker = getHookResult().workers.find(w => w.id === 'B3');
      expect(newWorker).toBeDefined();
    });

    it('counts only workers of same type for sequential ID', () => {
      const workers = [
        Worker.create('R1', 'red'),
        Worker.create('R2', 'red'),
        Worker.create('B1', 'blue'),
      ];
      const board = createTestBoard({ workers });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('blue');
      });

      const newWorker = getHookResult().workers.find(w => w.id === 'B2');
      expect(newWorker).toBeDefined();
      expect(newWorker?.type).toBe('blue');
    });

    it('persists board changes when addWorker is called', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('red');
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });
  });

  describe('deleteWorker', () => {
    it('removes worker with valid ID', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().workers).toHaveLength(1);

      act(() => {
        getHookResult().deleteWorker('R1');
      });

      expect(getHookResult().workers).toHaveLength(0);
    });

    it('does nothing when worker ID not found', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().deleteWorker('NONEXISTENT');
      });

      expect(getHookResult().workers).toHaveLength(1);
      expect(getHookResult().workers[0].id).toBe('R1');
    });

    it('removes only the specified worker', () => {
      const workers = [
        Worker.create('R1', 'red'),
        Worker.create('R2', 'red'),
        Worker.create('B1', 'blue'),
      ];
      const board = createTestBoard({ workers });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().deleteWorker('R2');
      });

      expect(getHookResult().workers).toHaveLength(2);
      expect(getHookResult().workers.find(w => w.id === 'R1')).toBeDefined();
      expect(getHookResult().workers.find(w => w.id === 'B1')).toBeDefined();
      expect(getHookResult().workers.find(w => w.id === 'R2')).toBeUndefined();
    });

    it('clears selection when selected worker is deleted', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().selectWorker('R1');
      });

      expect(getHookResult().selectedWorkerId).toBe('R1');

      act(() => {
        getHookResult().deleteWorker('R1');
      });

      expect(getHookResult().selectedWorkerId).toBeNull();
    });

    it('preserves selection when different worker is deleted', () => {
      const workers = [
        Worker.create('R1', 'red'),
        Worker.create('R2', 'red'),
      ];
      const board = createTestBoard({ workers });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().selectWorker('R1');
      });

      act(() => {
        getHookResult().deleteWorker('R2');
      });

      expect(getHookResult().selectedWorkerId).toBe('R1');
    });

    it('persists board changes when deleteWorker is called', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().deleteWorker('R1');
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });
  });

  describe('selectWorker', () => {
    it('sets selectedWorkerId when selecting a worker', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().selectWorker('R1');
      });

      expect(getHookResult().selectedWorkerId).toBe('R1');
    });

    it('changes selection when selecting different worker', () => {
      const workers = [
        Worker.create('R1', 'red'),
        Worker.create('B1', 'blue'),
      ];
      const board = createTestBoard({ workers });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().selectWorker('R1');
      });

      expect(getHookResult().selectedWorkerId).toBe('R1');

      act(() => {
        getHookResult().selectWorker('B1');
      });

      expect(getHookResult().selectedWorkerId).toBe('B1');
    });

    it('deselects worker when passing null', () => {
      const worker = Worker.create('R1', 'red');
      const board = createTestBoard({ workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().selectWorker('R1');
      });

      expect(getHookResult().selectedWorkerId).toBe('R1');

      act(() => {
        getHookResult().selectWorker(null);
      });

      expect(getHookResult().selectedWorkerId).toBeNull();
    });

    it('allows selecting worker ID that does not exist', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().selectWorker('NONEXISTENT');
      });

      expect(getHookResult().selectedWorkerId).toBe('NONEXISTENT');
    });
  });

  describe('edge cases', () => {
    it('handles empty workers array', () => {
      const board = createTestBoard({ workers: [] });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().workers).toHaveLength(0);
    });

    it('handles multiple add operations in sequence', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('red');
      });

      act(() => {
        getHookResult().addWorker('red');
      });

      act(() => {
        getHookResult().addWorker('blue');
      });

      expect(getHookResult().workers).toHaveLength(3);
      expect(getHookResult().workers.find(w => w.id === 'R1')).toBeDefined();
      expect(getHookResult().workers.find(w => w.id === 'R2')).toBeDefined();
      expect(getHookResult().workers.find(w => w.id === 'B1')).toBeDefined();
    });

    it('handles delete after add for same type', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addWorker('red');
      });

      act(() => {
        getHookResult().addWorker('red');
      });

      act(() => {
        getHookResult().deleteWorker('R1');
      });

      expect(getHookResult().workers).toHaveLength(1);
      expect(getHookResult().workers[0].id).toBe('R2');
    });
  });
});
