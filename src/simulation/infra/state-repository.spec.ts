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

  describe('save slots', () => {
    const SLOT_1_KEY = 'kanban-vibe-slot-1';
    const SLOT_2_KEY = 'kanban-vibe-slot-2';
    const SLOT_3_KEY = 'kanban-vibe-slot-3';

    describe('saveToSlot', () => {
      it('saves board to slot 1 with name and timestamp', () => {
        const board = createTestBoard({ currentDay: 10 });

        StateRepository.saveToSlot(1, board, 'My Save');

        const saved = JSON.parse(mockStorage[SLOT_1_KEY]);
        expect(saved.name).toBe('My Save');
        expect(saved.savedAt).toBeGreaterThan(0);
        expect(saved.state.currentDay).toBe(10);
      });

      it('saves board to slot 2', () => {
        const board = createTestBoard({ currentDay: 5 });

        StateRepository.saveToSlot(2, board, 'Slot Two');

        expect(localStorage.setItem).toHaveBeenCalledWith(
          SLOT_2_KEY,
          expect.any(String)
        );
        const saved = JSON.parse(mockStorage[SLOT_2_KEY]);
        expect(saved.name).toBe('Slot Two');
      });

      it('saves board to slot 3', () => {
        const board = createTestBoard({ currentDay: 15 });

        StateRepository.saveToSlot(3, board, 'Slot Three');

        expect(localStorage.setItem).toHaveBeenCalledWith(
          SLOT_3_KEY,
          expect.any(String)
        );
        const saved = JSON.parse(mockStorage[SLOT_3_KEY]);
        expect(saved.name).toBe('Slot Three');
      });

      it('throws error for invalid slot number', () => {
        const board = createTestBoard();

        expect(() => StateRepository.saveToSlot(0, board, 'Invalid')).toThrow(
          'Invalid slot number'
        );
        expect(() => StateRepository.saveToSlot(4, board, 'Invalid')).toThrow(
          'Invalid slot number'
        );
      });

      it('overwrites existing slot data', () => {
        const board1 = createTestBoard({ currentDay: 5 });
        const board2 = createTestBoard({ currentDay: 10 });

        StateRepository.saveToSlot(1, board1, 'First Save');
        StateRepository.saveToSlot(1, board2, 'Second Save');

        const saved = JSON.parse(mockStorage[SLOT_1_KEY]);
        expect(saved.name).toBe('Second Save');
        expect(saved.state.currentDay).toBe(10);
      });

      it('handles QuotaExceededError gracefully', () => {
        const board = createTestBoard();
        vi.mocked(localStorage.setItem).mockImplementation(() => {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        });

        expect(() => StateRepository.saveToSlot(1, board, 'Test')).not.toThrow();
      });
    });

    describe('loadFromSlot', () => {
      it('returns null when slot is empty', () => {
        const result = StateRepository.loadFromSlot(1);

        expect(result).toBeNull();
      });

      it('loads slot data with name and savedAt', () => {
        const board = createTestBoard({ currentDay: 7 });
        StateRepository.saveToSlot(1, board, 'Loaded Slot');

        const result = StateRepository.loadFromSlot(1);

        expect(result).not.toBeNull();
        expect(result!.name).toBe('Loaded Slot');
        expect(result!.savedAt).toBeGreaterThan(0);
        expect(result!.board.currentDay).toBe(7);
      });

      it('loads from different slots independently', () => {
        const board1 = createTestBoard({ currentDay: 1 });
        const board2 = createTestBoard({ currentDay: 2 });
        StateRepository.saveToSlot(1, board1, 'Slot 1');
        StateRepository.saveToSlot(2, board2, 'Slot 2');

        const slot1 = StateRepository.loadFromSlot(1);
        const slot2 = StateRepository.loadFromSlot(2);

        expect(slot1!.board.currentDay).toBe(1);
        expect(slot2!.board.currentDay).toBe(2);
      });

      it('throws error for invalid slot number', () => {
        expect(() => StateRepository.loadFromSlot(0)).toThrow(
          'Invalid slot number'
        );
        expect(() => StateRepository.loadFromSlot(4)).toThrow(
          'Invalid slot number'
        );
      });

      it('returns null for corrupted slot data', () => {
        mockStorage[SLOT_1_KEY] = 'not valid json {{{';

        const result = StateRepository.loadFromSlot(1);

        expect(result).toBeNull();
      });

      it('returns null for invalid slot schema', () => {
        mockStorage[SLOT_1_KEY] = JSON.stringify({
          notValidSlot: true,
        });

        const result = StateRepository.loadFromSlot(1);

        expect(result).toBeNull();
      });
    });

    describe('clearSlot', () => {
      it('removes slot data from localStorage', () => {
        const board = createTestBoard();
        StateRepository.saveToSlot(1, board, 'Test');

        StateRepository.clearSlot(1);

        expect(localStorage.removeItem).toHaveBeenCalledWith(SLOT_1_KEY);
        expect(mockStorage[SLOT_1_KEY]).toBeUndefined();
      });

      it('can clear each slot independently', () => {
        const board = createTestBoard();
        StateRepository.saveToSlot(1, board, 'Slot 1');
        StateRepository.saveToSlot(2, board, 'Slot 2');

        StateRepository.clearSlot(1);

        expect(mockStorage[SLOT_1_KEY]).toBeUndefined();
        expect(mockStorage[SLOT_2_KEY]).toBeDefined();
      });

      it('throws error for invalid slot number', () => {
        expect(() => StateRepository.clearSlot(0)).toThrow('Invalid slot number');
        expect(() => StateRepository.clearSlot(4)).toThrow('Invalid slot number');
      });

      it('does not throw when clearing empty slot', () => {
        expect(() => StateRepository.clearSlot(1)).not.toThrow();
      });
    });

    describe('renameSlot', () => {
      it('updates slot name without changing board state', () => {
        const board = createTestBoard({ currentDay: 5 });
        StateRepository.saveToSlot(1, board, 'Original Name');

        StateRepository.renameSlot(1, 'New Name');

        const result = StateRepository.loadFromSlot(1);
        expect(result!.name).toBe('New Name');
        expect(result!.board.currentDay).toBe(5);
      });

      it('preserves savedAt timestamp when renaming', () => {
        const board = createTestBoard();
        StateRepository.saveToSlot(1, board, 'Original');
        const originalData = StateRepository.loadFromSlot(1);

        StateRepository.renameSlot(1, 'Renamed');

        const result = StateRepository.loadFromSlot(1);
        expect(result!.savedAt).toBe(originalData!.savedAt);
      });

      it('throws error for invalid slot number', () => {
        expect(() => StateRepository.renameSlot(0, 'Test')).toThrow(
          'Invalid slot number'
        );
        expect(() => StateRepository.renameSlot(4, 'Test')).toThrow(
          'Invalid slot number'
        );
      });

      it('throws error when slot is empty', () => {
        expect(() => StateRepository.renameSlot(1, 'Test')).toThrow(
          'Slot is empty'
        );
      });
    });

    describe('getSlotInfo', () => {
      it('returns null for empty slot', () => {
        const result = StateRepository.getSlotInfo(1);

        expect(result).toBeNull();
      });

      it('returns slot metadata without loading full board', () => {
        const board = createTestBoard({ currentDay: 10 });
        StateRepository.saveToSlot(1, board, 'My Save');

        const result = StateRepository.getSlotInfo(1);

        expect(result).not.toBeNull();
        expect(result!.name).toBe('My Save');
        expect(result!.savedAt).toBeGreaterThan(0);
      });

      it('throws error for invalid slot number', () => {
        expect(() => StateRepository.getSlotInfo(0)).toThrow(
          'Invalid slot number'
        );
        expect(() => StateRepository.getSlotInfo(4)).toThrow(
          'Invalid slot number'
        );
      });
    });

    describe('getAllSlotInfo', () => {
      it('returns array of 3 slot infos', () => {
        const result = StateRepository.getAllSlotInfo();

        expect(result).toHaveLength(3);
      });

      it('returns null for empty slots', () => {
        const result = StateRepository.getAllSlotInfo();

        expect(result[0]).toBeNull();
        expect(result[1]).toBeNull();
        expect(result[2]).toBeNull();
      });

      it('returns slot info for occupied slots', () => {
        const board = createTestBoard();
        StateRepository.saveToSlot(1, board, 'Slot 1');
        StateRepository.saveToSlot(3, board, 'Slot 3');

        const result = StateRepository.getAllSlotInfo();

        expect(result[0]!.name).toBe('Slot 1');
        expect(result[1]).toBeNull();
        expect(result[2]!.name).toBe('Slot 3');
      });
    });
  });
});
