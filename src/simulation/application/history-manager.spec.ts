import { describe, it, expect } from 'vitest';
import { HistoryManager } from './history-manager';
import { Board } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';

const createTestBoard = (currentDay: number = 0): Board => {
  return Board.create({
    wipLimits: WipLimits.empty(),
    currentDay,
  });
};

describe('HistoryManager', () => {
  describe('create', () => {
    it('creates an empty history manager with default max depth of 50', () => {
      const manager = HistoryManager.create();

      expect(manager.entries).toEqual([]);
      expect(manager.currentIndex).toBe(-1);
      expect(manager.maxDepth).toBe(50);
    });

    it('creates a history manager with custom max depth', () => {
      const manager = HistoryManager.create(10);

      expect(manager.maxDepth).toBe(10);
    });
  });

  describe('push', () => {
    it('adds an entry to empty history', () => {
      const manager = HistoryManager.create();
      const board = createTestBoard();

      const updated = HistoryManager.push(manager, 'card-created', board);

      expect(updated.entries).toHaveLength(1);
      expect(updated.entries[0].action).toBe('card-created');
      expect(updated.entries[0].state).toBe(board);
      expect(updated.currentIndex).toBe(0);
    });

    it('adds entry with timestamp', () => {
      const manager = HistoryManager.create();
      const board = createTestBoard();
      const before = Date.now();

      const updated = HistoryManager.push(manager, 'action', board);

      const after = Date.now();
      expect(updated.entries[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(updated.entries[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('adds multiple entries sequentially', () => {
      let manager = HistoryManager.create();
      const board1 = createTestBoard(1);
      const board2 = createTestBoard(2);
      const board3 = createTestBoard(3);

      manager = HistoryManager.push(manager, 'action1', board1);
      manager = HistoryManager.push(manager, 'action2', board2);
      manager = HistoryManager.push(manager, 'action3', board3);

      expect(manager.entries).toHaveLength(3);
      expect(manager.currentIndex).toBe(2);
      expect(manager.entries[0].state.currentDay).toBe(1);
      expect(manager.entries[2].state.currentDay).toBe(3);
    });

    it('removes oldest entry when exceeding max depth', () => {
      let manager = HistoryManager.create(3);

      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));
      manager = HistoryManager.push(manager, 'action3', createTestBoard(3));
      manager = HistoryManager.push(manager, 'action4', createTestBoard(4));

      expect(manager.entries).toHaveLength(3);
      expect(manager.entries[0].action).toBe('action2');
      expect(manager.entries[2].action).toBe('action4');
      expect(manager.currentIndex).toBe(2);
    });

    it('clears redo stack when pushing after undo', () => {
      let manager = HistoryManager.create();

      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));
      manager = HistoryManager.push(manager, 'action3', createTestBoard(3));

      const undoneResult = HistoryManager.undo(manager);
      if (!undoneResult) throw new Error('Expected undo to succeed');
      manager = undoneResult.manager;

      manager = HistoryManager.push(manager, 'action4', createTestBoard(4));

      expect(manager.entries).toHaveLength(3);
      expect(manager.entries[2].action).toBe('action4');
      expect(manager.currentIndex).toBe(2);
    });

    it('returns new instance (immutable)', () => {
      const manager = HistoryManager.create();
      const board = createTestBoard();

      const updated = HistoryManager.push(manager, 'action', board);

      expect(updated).not.toBe(manager);
      expect(manager.entries).toHaveLength(0);
    });
  });

  describe('canUndo', () => {
    it('returns false for empty history', () => {
      const manager = HistoryManager.create();

      expect(HistoryManager.canUndo(manager)).toBe(false);
    });

    it('returns false when only one entry exists', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action', createTestBoard());

      expect(HistoryManager.canUndo(manager)).toBe(false);
    });

    it('returns true when multiple entries exist', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));

      expect(HistoryManager.canUndo(manager)).toBe(true);
    });

    it('returns false when at beginning of history after undo', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));

      const result = HistoryManager.undo(manager);
      if (!result) throw new Error('Expected undo to succeed');
      manager = result.manager;

      expect(HistoryManager.canUndo(manager)).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('returns false for empty history', () => {
      const manager = HistoryManager.create();

      expect(HistoryManager.canRedo(manager)).toBe(false);
    });

    it('returns false when at end of history', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action', createTestBoard());

      expect(HistoryManager.canRedo(manager)).toBe(false);
    });

    it('returns true after undo', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));

      const result = HistoryManager.undo(manager);
      if (!result) throw new Error('Expected undo to succeed');
      manager = result.manager;

      expect(HistoryManager.canRedo(manager)).toBe(true);
    });
  });

  describe('undo', () => {
    it('returns null when history is empty', () => {
      const manager = HistoryManager.create();

      const result = HistoryManager.undo(manager);

      expect(result).toBeNull();
    });

    it('returns null when only one entry exists', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action', createTestBoard());

      const result = HistoryManager.undo(manager);

      expect(result).toBeNull();
    });

    it('returns null when at beginning of history after undo', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));

      const result1 = HistoryManager.undo(manager);
      if (!result1) throw new Error('Expected undo to succeed');
      manager = result1.manager;

      const result2 = HistoryManager.undo(manager);

      expect(result2).toBeNull();
    });

    it('returns previous state and updated manager', () => {
      let manager = HistoryManager.create();
      const board1 = createTestBoard(1);
      const board2 = createTestBoard(2);

      manager = HistoryManager.push(manager, 'action1', board1);
      manager = HistoryManager.push(manager, 'action2', board2);

      const result = HistoryManager.undo(manager);

      expect(result).not.toBeNull();
      expect(result!.state).toBe(board1);
      expect(result!.manager.currentIndex).toBe(0);
    });

    it('allows multiple undos', () => {
      let manager = HistoryManager.create();
      const board1 = createTestBoard(1);
      const board2 = createTestBoard(2);
      const board3 = createTestBoard(3);

      manager = HistoryManager.push(manager, 'action1', board1);
      manager = HistoryManager.push(manager, 'action2', board2);
      manager = HistoryManager.push(manager, 'action3', board3);

      const result1 = HistoryManager.undo(manager);
      expect(result1!.state).toBe(board2);
      manager = result1!.manager;

      const result2 = HistoryManager.undo(manager);
      expect(result2!.state).toBe(board1);
    });

    it('returns new manager instance (immutable)', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));

      const result = HistoryManager.undo(manager);

      expect(result!.manager).not.toBe(manager);
      expect(manager.currentIndex).toBe(1);
    });
  });

  describe('redo', () => {
    it('returns null when nothing to redo', () => {
      const manager = HistoryManager.create();

      const result = HistoryManager.redo(manager);

      expect(result).toBeNull();
    });

    it('returns null when at end of history', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action', createTestBoard());

      const result = HistoryManager.redo(manager);

      expect(result).toBeNull();
    });

    it('returns next state after undo', () => {
      let manager = HistoryManager.create();
      const board1 = createTestBoard(1);
      const board2 = createTestBoard(2);

      manager = HistoryManager.push(manager, 'action1', board1);
      manager = HistoryManager.push(manager, 'action2', board2);

      const undoResult = HistoryManager.undo(manager);
      manager = undoResult!.manager;

      const redoResult = HistoryManager.redo(manager);

      expect(redoResult).not.toBeNull();
      expect(redoResult!.state).toBe(board2);
      expect(redoResult!.manager.currentIndex).toBe(1);
    });

    it('allows multiple redos', () => {
      let manager = HistoryManager.create();
      const board1 = createTestBoard(1);
      const board2 = createTestBoard(2);
      const board3 = createTestBoard(3);

      manager = HistoryManager.push(manager, 'action1', board1);
      manager = HistoryManager.push(manager, 'action2', board2);
      manager = HistoryManager.push(manager, 'action3', board3);

      let result = HistoryManager.undo(manager);
      manager = result!.manager;
      result = HistoryManager.undo(manager);
      manager = result!.manager;

      const redo1 = HistoryManager.redo(manager);
      expect(redo1!.state).toBe(board2);
      manager = redo1!.manager;

      const redo2 = HistoryManager.redo(manager);
      expect(redo2!.state).toBe(board3);
    });

    it('returns new manager instance (immutable)', () => {
      let manager = HistoryManager.create();
      manager = HistoryManager.push(manager, 'action1', createTestBoard(1));
      manager = HistoryManager.push(manager, 'action2', createTestBoard(2));

      const undoResult = HistoryManager.undo(manager);
      manager = undoResult!.manager;

      const redoResult = HistoryManager.redo(manager);

      expect(redoResult!.manager).not.toBe(manager);
    });
  });

  describe('getCurrentState', () => {
    it('returns null for empty history', () => {
      const manager = HistoryManager.create();

      expect(HistoryManager.getCurrentState(manager)).toBeNull();
    });

    it('returns current state', () => {
      let manager = HistoryManager.create();
      const board = createTestBoard(5);
      manager = HistoryManager.push(manager, 'action', board);

      expect(HistoryManager.getCurrentState(manager)).toBe(board);
    });

    it('returns state at current index after undo', () => {
      let manager = HistoryManager.create();
      const board1 = createTestBoard(1);
      const board2 = createTestBoard(2);

      manager = HistoryManager.push(manager, 'action1', board1);
      manager = HistoryManager.push(manager, 'action2', board2);

      const result = HistoryManager.undo(manager);
      manager = result!.manager;

      expect(HistoryManager.getCurrentState(manager)).toBe(board1);
    });
  });
});
