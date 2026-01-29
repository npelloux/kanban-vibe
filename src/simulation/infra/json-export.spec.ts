import { describe, it, expect } from 'vitest';
import { exportBoard, importBoard } from './json-export';
import { Board } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { CardId } from '../domain/card/card-id';
import { Card } from '../domain/card/card';
import { WorkItems } from '../domain/card/work-items';
import { Worker } from '../domain/worker/worker';

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

// Helper to read blob text in test environment (blob.text() may not work in jsdom)
function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function createMockFile(content: string, name = 'test.json'): File {
  return new File([content], name, { type: 'application/json' });
}

// Helper to create File from Blob for round-trip tests
async function blobToFile(blob: Blob, name = 'test.json'): Promise<File> {
  const text = await readBlobAsText(blob);
  return createMockFile(text, name);
}

describe('JsonFileExporter', () => {
  describe('exportBoard', () => {
    it('creates a Blob with application/json MIME type', () => {
      const board = createTestBoard();

      const blob = exportBoard(board);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('creates valid JSON content', async () => {
      const board = createTestBoard({ currentDay: 5 });

      const blob = exportBoard(board);
      const text = await readBlobAsText(blob);

      expect(() => JSON.parse(text)).not.toThrow();
      const parsed = JSON.parse(text);
      expect(parsed.currentDay).toBe(5);
    });

    it('exports board with cards', async () => {
      const card = createTestCard('ABC', { stage: 'red-active', age: 3 });
      const board = createTestBoard({ cards: [card], currentDay: 10 });

      const blob = exportBoard(board);
      const text = await readBlobAsText(blob);
      const parsed = JSON.parse(text);

      expect(parsed.cards).toHaveLength(1);
      expect(parsed.cards[0].id).toBe('ABC');
      expect(parsed.cards[0].stage).toBe('red-active');
      expect(parsed.cards[0].age).toBe(3);
    });

    it('exports board with workers', async () => {
      const worker1 = Worker.create('w1', 'red');
      const worker2 = Worker.create('w2', 'blue');
      const board = createTestBoard({ workers: [worker1, worker2] });

      const blob = exportBoard(board);
      const text = await readBlobAsText(blob);
      const parsed = JSON.parse(text);

      expect(parsed.workers).toHaveLength(2);
      expect(parsed.workers[0]).toEqual({ id: 'w1', type: 'red' });
      expect(parsed.workers[1]).toEqual({ id: 'w2', type: 'blue' });
    });

    it('exports board with WIP limits', async () => {
      const wipLimits = WipLimits.withColumnLimit(
        WipLimits.empty(),
        'redActive',
        { min: 1, max: 5 }
      );
      const board = Board.create({ wipLimits });

      const blob = exportBoard(board);
      const text = await readBlobAsText(blob);
      const parsed = JSON.parse(text);

      expect(parsed.wipLimits.redActive).toEqual({ min: 1, max: 5 });
    });

    it('exports pretty-printed JSON', async () => {
      const board = createTestBoard();

      const blob = exportBoard(board);
      const text = await readBlobAsText(blob);

      expect(text).toContain('\n');
      expect(text).toContain('  ');
    });
  });
});

describe('JsonFileImporter', () => {
  describe('importBoard - success cases', () => {
    it('imports valid empty board', async () => {
      const content = JSON.stringify({
        currentDay: 0,
        cards: [],
        workers: [],
        wipLimits: {
          options: { min: 0, max: 0 },
          redActive: { min: 0, max: 0 },
          redFinished: { min: 0, max: 0 },
          blueActive: { min: 0, max: 0 },
          blueFinished: { min: 0, max: 0 },
          green: { min: 0, max: 0 },
          done: { min: 0, max: 0 },
        },
      });
      const file = createMockFile(content);

      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.currentDay).toBe(0);
        expect(result.value.cards).toHaveLength(0);
        expect(result.value.workers).toHaveLength(0);
      }
    });

    it('imports board with cards', async () => {
      const content = JSON.stringify({
        currentDay: 5,
        cards: [
          {
            id: 'ABC',
            content: 'Test card',
            stage: 'red-active',
            age: 3,
            startDay: 1,
            isBlocked: false,
            completionDay: null,
            workItems: {
              red: { total: 5, completed: 0 },
              blue: { total: 3, completed: 0 },
              green: { total: 2, completed: 0 },
            },
            assignedWorkers: [],
          },
        ],
        workers: [],
        wipLimits: {
          options: { min: 0, max: 0 },
          redActive: { min: 0, max: 0 },
          redFinished: { min: 0, max: 0 },
          blueActive: { min: 0, max: 0 },
          blueFinished: { min: 0, max: 0 },
          green: { min: 0, max: 0 },
          done: { min: 0, max: 0 },
        },
      });
      const file = createMockFile(content);

      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.cards).toHaveLength(1);
        expect(result.value.cards[0].id).toBe('ABC');
        expect(result.value.cards[0].stage).toBe('red-active');
        expect(result.value.cards[0].age).toBe(3);
      }
    });

    it('imports board with workers', async () => {
      const content = JSON.stringify({
        currentDay: 0,
        cards: [],
        workers: [
          { id: 'w1', type: 'red' },
          { id: 'w2', type: 'blue' },
        ],
        wipLimits: {
          options: { min: 0, max: 0 },
          redActive: { min: 0, max: 0 },
          redFinished: { min: 0, max: 0 },
          blueActive: { min: 0, max: 0 },
          blueFinished: { min: 0, max: 0 },
          green: { min: 0, max: 0 },
          done: { min: 0, max: 0 },
        },
      });
      const file = createMockFile(content);

      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workers).toHaveLength(2);
        expect(result.value.workers[0].id).toBe('w1');
        expect(result.value.workers[0].type).toBe('red');
      }
    });
  });

  describe('importBoard - error cases', () => {
    it('returns INVALID_JSON error for invalid JSON syntax', async () => {
      const file = createMockFile('not valid json {{{');

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_JSON');
      }
    });

    it('returns INVALID_JSON error for empty file', async () => {
      const file = createMockFile('');

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_JSON');
      }
    });

    it('returns VALIDATION_FAILED error for valid JSON with invalid schema', async () => {
      const file = createMockFile(JSON.stringify({ notAValidBoard: true }));

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_FAILED');
      }
    });

    it('returns VALIDATION_FAILED error for missing required fields', async () => {
      const file = createMockFile(JSON.stringify({ currentDay: 5 }));

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_FAILED');
      }
    });

    it('returns VALIDATION_FAILED error for invalid card id', async () => {
      const content = JSON.stringify({
        currentDay: 0,
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
        wipLimits: {
          options: { min: 0, max: 0 },
          redActive: { min: 0, max: 0 },
          redFinished: { min: 0, max: 0 },
          blueActive: { min: 0, max: 0 },
          blueFinished: { min: 0, max: 0 },
          green: { min: 0, max: 0 },
          done: { min: 0, max: 0 },
        },
      });
      const file = createMockFile(content);

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_FAILED');
      }
    });

    it('returns VALIDATION_FAILED error for invalid worker type', async () => {
      const content = JSON.stringify({
        currentDay: 0,
        cards: [],
        workers: [{ id: 'w1', type: 'purple' }],
        wipLimits: {
          options: { min: 0, max: 0 },
          redActive: { min: 0, max: 0 },
          redFinished: { min: 0, max: 0 },
          blueActive: { min: 0, max: 0 },
          blueFinished: { min: 0, max: 0 },
          green: { min: 0, max: 0 },
          done: { min: 0, max: 0 },
        },
      });
      const file = createMockFile(content);

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_FAILED');
      }
    });

    it('returns VALIDATION_FAILED error for invalid stage', async () => {
      const content = JSON.stringify({
        currentDay: 0,
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
        wipLimits: {
          options: { min: 0, max: 0 },
          redActive: { min: 0, max: 0 },
          redFinished: { min: 0, max: 0 },
          blueActive: { min: 0, max: 0 },
          blueFinished: { min: 0, max: 0 },
          green: { min: 0, max: 0 },
          done: { min: 0, max: 0 },
        },
      });
      const file = createMockFile(content);

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_FAILED');
      }
    });

    it('includes error details for VALIDATION_FAILED', async () => {
      const file = createMockFile(JSON.stringify({ notAValidBoard: true }));

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success && result.error.type === 'VALIDATION_FAILED') {
        expect(result.error.errors).toBeDefined();
      }
    });

    it('includes error message for INVALID_JSON', async () => {
      const file = createMockFile('not valid json');

      const result = await importBoard(file);

      expect(result.success).toBe(false);
      if (!result.success && result.error.type === 'INVALID_JSON') {
        expect(result.error.message).toBeDefined();
        expect(typeof result.error.message).toBe('string');
      }
    });
  });

  describe('round-trip', () => {
    it('preserves empty board through export/import', async () => {
      const originalBoard = createTestBoard();

      const blob = exportBoard(originalBoard);
      const file = await blobToFile(blob);
      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.currentDay).toBe(originalBoard.currentDay);
        expect(result.value.cards).toHaveLength(0);
        expect(result.value.workers).toHaveLength(0);
      }
    });

    it('preserves board with cards through export/import', async () => {
      const card = createTestCard('ABC', {
        stage: 'blue-active',
        age: 5,
        isBlocked: true,
      });
      const originalBoard = createTestBoard({
        cards: [card],
        currentDay: 10,
      });

      const blob = exportBoard(originalBoard);
      const file = await blobToFile(blob);
      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.currentDay).toBe(10);
        expect(result.value.cards).toHaveLength(1);
        expect(result.value.cards[0].id).toBe('ABC');
        expect(result.value.cards[0].stage).toBe('blue-active');
        expect(result.value.cards[0].age).toBe(5);
        expect(result.value.cards[0].isBlocked).toBe(true);
      }
    });

    it('preserves board with workers through export/import', async () => {
      const worker1 = Worker.create('w1', 'red');
      const worker2 = Worker.create('w2', 'green');
      const originalBoard = createTestBoard({
        workers: [worker1, worker2],
      });

      const blob = exportBoard(originalBoard);
      const file = await blobToFile(blob);
      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workers).toHaveLength(2);
        expect(result.value.workers[0].id).toBe('w1');
        expect(result.value.workers[0].type).toBe('red');
        expect(result.value.workers[1].id).toBe('w2');
        expect(result.value.workers[1].type).toBe('green');
      }
    });

    it('preserves WIP limits through export/import', async () => {
      const wipLimits = WipLimits.withColumnLimit(
        WipLimits.withColumnLimit(WipLimits.empty(), 'redActive', {
          min: 1,
          max: 5,
        }),
        'blueFinished',
        { min: 0, max: 3 }
      );
      const originalBoard = Board.create({ wipLimits });

      const blob = exportBoard(originalBoard);
      const file = await blobToFile(blob);
      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.wipLimits.redActive).toEqual({ min: 1, max: 5 });
        expect(result.value.wipLimits.blueFinished).toEqual({ min: 0, max: 3 });
      }
    });

    it('preserves card completionDay through export/import', async () => {
      const card = createTestCard('ABC', {
        stage: 'done',
        completionDay: 15,
      });
      const originalBoard = createTestBoard({ cards: [card] });

      const blob = exportBoard(originalBoard);
      const file = await blobToFile(blob);
      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.cards[0].completionDay).toBe(15);
      }
    });

    it('preserves card assignedWorkers through export/import', async () => {
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
      const originalBoard = createTestBoard({ cards: [card] });

      const blob = exportBoard(originalBoard);
      const file = await blobToFile(blob);
      const result = await importBoard(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.cards[0].assignedWorkers).toHaveLength(2);
        expect(result.value.cards[0].assignedWorkers[0]).toEqual({
          id: 'w1',
          type: 'red',
        });
      }
    });
  });
});
