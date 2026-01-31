import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateRepository } from './state-repository';
import { Board } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { CardId } from '../domain/card/card-id';
import { Card } from '../domain/card/card';
import { WorkItems } from '../domain/card/work-items';
import { Worker } from '../domain/worker/worker';

const STORAGE_KEY = 'kanban-vibe-state';

function createValidCardId(value: string): CardId {
  const id = CardId.create(value);
  if (id === null) {
    throw new Error(`Test setup: Invalid CardId '${value}'`);
  }
  return id;
}

function createTestCard(
  id: string,
  overrides: Partial<{
    content: string;
    stage: Card['stage'];
    age: number;
    startDay: number;
    isBlocked: boolean;
    completionDay: number | null;
  }> = {}
): Card {
  return Card.create({
    id: createValidCardId(id),
    content: overrides.content ?? 'Test card',
    stage: overrides.stage ?? 'options',
    workItems: WorkItems.create(
      { total: 5, completed: 0 },
      { total: 3, completed: 0 },
      { total: 2, completed: 0 }
    ),
    startDay: overrides.startDay ?? 1,
    age: overrides.age ?? 0,
    isBlocked: overrides.isBlocked ?? false,
    completionDay: overrides.completionDay ?? null,
  });
}

function createTestBoard(
  overrides: Partial<{
    cards: readonly Card[];
    workers: readonly Worker[];
    currentDay: number;
  }> = {}
): Board {
  return Board.create({
    wipLimits: WipLimits.empty(),
    cards: overrides.cards ?? [],
    workers: overrides.workers ?? [],
    currentDay: overrides.currentDay ?? 0,
  });
}

describe('StateRepository', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    });
  });

  describe('saveBoard', () => {
    it('saves an empty board to localStorage', () => {
      const board = createTestBoard();

      StateRepository.saveBoard(board);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.currentDay).toBe(0);
      expect(saved.cards).toEqual([]);
      expect(saved.workers).toEqual([]);
    });

    it('saves board with cards to localStorage', () => {
      const card = createTestCard('ABC', { stage: 'red-active', age: 3 });
      const board = createTestBoard({
        cards: [card],
        currentDay: 5,
      });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.currentDay).toBe(5);
      expect(saved.cards).toHaveLength(1);
      expect(saved.cards[0].id).toBe('ABC');
      expect(saved.cards[0].stage).toBe('red-active');
      expect(saved.cards[0].age).toBe(3);
    });

    it('saves board with workers to localStorage', () => {
      const worker1 = Worker.create('w1', 'red');
      const worker2 = Worker.create('w2', 'blue');
      const board = createTestBoard({
        workers: [worker1, worker2],
      });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.workers).toHaveLength(2);
      expect(saved.workers[0]).toEqual({ id: 'w1', type: 'red' });
      expect(saved.workers[1]).toEqual({ id: 'w2', type: 'blue' });
    });

    it('saves board with WIP limits to localStorage', () => {
      const wipLimits = WipLimits.withColumnLimit(
        WipLimits.empty(),
        'redActive',
        { min: 1, max: 5 }
      );
      const board = Board.create({ wipLimits });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.wipLimits.redActive).toEqual({ min: 1, max: 5 });
    });

    it('serializes card workItems correctly', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.cards[0].workItems).toEqual({
        red: { total: 5, completed: 0 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });
    });

    it('serializes card assignedWorkers correctly', () => {
      const card = Card.create({
        id: createValidCardId('ABC'),
        content: 'Test',
        stage: 'red-active',
        workItems: WorkItems.empty(),
        startDay: 1,
        assignedWorkers: [{ id: 'w1', type: 'red' }],
      });
      const board = createTestBoard({ cards: [card] });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.cards[0].assignedWorkers).toEqual([{ id: 'w1', type: 'red' }]);
    });

    it('serializes completionDay as null when not set', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.cards[0].completionDay).toBeNull();
    });

    it('serializes completionDay when set', () => {
      const card = createTestCard('ABC', {
        stage: 'done',
        completionDay: 10,
      });
      const board = createTestBoard({ cards: [card] });

      StateRepository.saveBoard(board);

      const saved = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(saved.cards[0].completionDay).toBe(10);
    });

    it('handles QuotaExceededError gracefully', () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw quotaError;
      });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const board = createTestBoard();

      expect(() => StateRepository.saveBoard(board)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'LocalStorage quota exceeded while saving board.',
        quotaError
      );

      consoleWarnSpy.mockRestore();
    });

    it('rethrows non-quota errors from localStorage', () => {
      const otherError = new Error('Some other error');
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw otherError;
      });

      const board = createTestBoard();

      expect(() => StateRepository.saveBoard(board)).toThrow('Some other error');
    });
  });

  describe('loadBoard', () => {
    it('returns null when no saved state exists', () => {
      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('loads empty board from localStorage', () => {
      const emptyBoard = createTestBoard();
      StateRepository.saveBoard(emptyBoard);

      const result = StateRepository.loadBoard();

      expect(result).not.toBeNull();
      expect(result!.currentDay).toBe(0);
      expect(result!.cards).toHaveLength(0);
      expect(result!.workers).toHaveLength(0);
    });

    it('loads board with cards from localStorage', () => {
      const card = createTestCard('ABC', { stage: 'red-active', age: 3 });
      const board = createTestBoard({
        cards: [card],
        currentDay: 5,
      });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result).not.toBeNull();
      expect(result!.currentDay).toBe(5);
      expect(result!.cards).toHaveLength(1);
      expect(result!.cards[0].id).toBe('ABC');
      expect(result!.cards[0].stage).toBe('red-active');
      expect(result!.cards[0].age).toBe(3);
    });

    it('loads board with workers from localStorage', () => {
      const worker = Worker.create('w1', 'red');
      const board = createTestBoard({ workers: [worker] });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result).not.toBeNull();
      expect(result!.workers).toHaveLength(1);
      expect(result!.workers[0].id).toBe('w1');
      expect(result!.workers[0].type).toBe('red');
    });

    it('loads board with WIP limits from localStorage', () => {
      const wipLimits = WipLimits.withColumnLimit(
        WipLimits.empty(),
        'blueActive',
        { min: 2, max: 8 }
      );
      const board = Board.create({ wipLimits });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result).not.toBeNull();
      expect(result!.wipLimits.blueActive).toEqual({ min: 2, max: 8 });
    });

    it('preserves workItems through round-trip', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result!.cards[0].workItems).toEqual({
        red: { total: 5, completed: 0 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });
    });

    it('preserves assignedWorkers through round-trip', () => {
      const card = Card.create({
        id: createValidCardId('ABC'),
        content: 'Test',
        stage: 'red-active',
        workItems: WorkItems.empty(),
        startDay: 1,
        assignedWorkers: [
          { id: 'w1', type: 'red' },
          { id: 'w2', type: 'blue' },
        ],
      });
      const board = createTestBoard({ cards: [card] });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result!.cards[0].assignedWorkers).toHaveLength(2);
      expect(result!.cards[0].assignedWorkers[0]).toEqual({ id: 'w1', type: 'red' });
      expect(result!.cards[0].assignedWorkers[1]).toEqual({ id: 'w2', type: 'blue' });
    });

    it('preserves completionDay null through round-trip', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result!.cards[0].completionDay).toBeNull();
    });

    it('preserves completionDay value through round-trip', () => {
      const card = createTestCard('ABC', {
        stage: 'done',
        completionDay: 15,
      });
      const board = createTestBoard({ cards: [card] });
      StateRepository.saveBoard(board);

      const result = StateRepository.loadBoard();

      expect(result!.cards[0].completionDay).toBe(15);
    });
  });

  describe('error handling', () => {
    it('returns null when localStorage contains invalid JSON', () => {
      mockStorage[STORAGE_KEY] = 'not valid json {{{';

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when localStorage contains valid JSON but invalid schema', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        notAValidBoard: true,
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when cards have invalid structure', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 1,
        cards: [{ invalidCard: true }],
        workers: [],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when workers have invalid structure', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 1,
        cards: [],
        workers: [{ invalidWorker: true }],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when wipLimits have invalid structure', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 1,
        cards: [],
        workers: [],
        wipLimits: { invalidLimits: true },
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when currentDay is negative', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: -5,
        cards: [],
        workers: [],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when currentDay is not an integer', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 5.5,
        cards: [],
        workers: [],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when card id is invalid', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 1,
        cards: [
          {
            id: 'invalid-lowercase-id',
            content: 'Test',
            stage: 'options',
            age: 0,
            startDay: 1,
            isBlocked: false,
            completionDay: null,
            workItems: {
              red: { total: 0, completed: 0 },
              blue: { total: 0, completed: 0 },
              green: { total: 0, completed: 0 },
            },
            assignedWorkers: [],
          },
        ],
        workers: [],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when worker type is invalid', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 1,
        cards: [],
        workers: [{ id: 'w1', type: 'purple' }],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });

    it('returns null when card stage is invalid', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({
        currentDay: 1,
        cards: [
          {
            id: 'ABC',
            content: 'Test',
            stage: 'invalid-stage',
            age: 0,
            startDay: 1,
            isBlocked: false,
            completionDay: null,
            workItems: {
              red: { total: 0, completed: 0 },
              blue: { total: 0, completed: 0 },
              green: { total: 0, completed: 0 },
            },
            assignedWorkers: [],
          },
        ],
        workers: [],
        wipLimits: WipLimits.empty(),
      });

      const result = StateRepository.loadBoard();

      expect(result).toBeNull();
    });
  });

  describe('clearBoard', () => {
    it('removes saved board from localStorage', () => {
      const board = createTestBoard();
      StateRepository.saveBoard(board);

      StateRepository.clearBoard();

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(mockStorage[STORAGE_KEY]).toBeUndefined();
    });

    it('does not throw when no saved state exists', () => {
      expect(() => StateRepository.clearBoard()).not.toThrow();
    });
  });

  describe('autosave', () => {
    const AUTOSAVE_KEY = 'kanban-vibe-autosave';

    describe('saveAutosave', () => {
      it('saves board to autosave key', () => {
        const board = createTestBoard({ currentDay: 5 });

        StateRepository.saveAutosave(board);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          AUTOSAVE_KEY,
          expect.any(String)
        );
        const saved = JSON.parse(mockStorage[AUTOSAVE_KEY]);
        expect(saved.currentDay).toBe(5);
      });

      it('uses different key than manual save', () => {
        const board = createTestBoard();

        StateRepository.saveAutosave(board);
        StateRepository.saveBoard(board);

        expect(mockStorage[AUTOSAVE_KEY]).toBeDefined();
        expect(mockStorage[STORAGE_KEY]).toBeDefined();
        expect(AUTOSAVE_KEY).not.toBe(STORAGE_KEY);
      });

      it('handles localStorage quota exceeded gracefully', () => {
        const board = createTestBoard();
        vi.mocked(localStorage.setItem).mockImplementation(() => {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        });

        expect(() => StateRepository.saveAutosave(board)).not.toThrow();
      });
    });

    describe('loadAutosave', () => {
      it('returns null when no autosave exists', () => {
        const result = StateRepository.loadAutosave();

        expect(result).toBeNull();
      });

      it('loads board from autosave key', () => {
        const board = createTestBoard({ currentDay: 7 });
        StateRepository.saveAutosave(board);

        const loaded = StateRepository.loadAutosave();

        expect(loaded).not.toBeNull();
        expect(loaded?.currentDay).toBe(7);
      });

      it('returns null for corrupted autosave data', () => {
        mockStorage[AUTOSAVE_KEY] = 'not valid json {{{';

        const result = StateRepository.loadAutosave();

        expect(result).toBeNull();
      });

      it('returns null for invalid schema in autosave', () => {
        mockStorage[AUTOSAVE_KEY] = JSON.stringify({
          notAValidBoard: true,
        });

        const result = StateRepository.loadAutosave();

        expect(result).toBeNull();
      });
    });

    describe('clearAutosave', () => {
      it('removes autosave from localStorage', () => {
        const board = createTestBoard();
        StateRepository.saveAutosave(board);

        StateRepository.clearAutosave();

        expect(localStorage.removeItem).toHaveBeenCalledWith(AUTOSAVE_KEY);
        expect(mockStorage[AUTOSAVE_KEY]).toBeUndefined();
      });
    });
  });
});
