import { describe, it, expect } from 'vitest';
import { Board, ALL_STAGES } from './board';
import { Card, type Stage } from '../card/card';
import { CardId } from '../card/card-id';
import { WorkItems } from '../card/work-items';
import { Worker } from '../worker/worker';
import { WipLimits } from '../wip/wip-limits';

const createTestCard = (id: string, stage: Stage = 'options'): Card => {
  const cardId = CardId.create(id);
  if (!cardId) throw new Error(`Invalid card ID: ${id}`);
  return Card.create({
    id: cardId,
    content: `Test card ${id}`,
    stage,
    workItems: WorkItems.empty(),
    startDay: 0,
  });
};

const createTestWorker = (id: string, type: 'red' | 'blue' | 'green' = 'red'): Worker => {
  return Worker.create(id, type);
};

describe('Board', () => {
  describe('create()', () => {
    it('creates a board with default values', () => {
      const wipLimits = WipLimits.empty();

      const board = Board.create({ wipLimits });

      expect(board.cards).toEqual([]);
      expect(board.workers).toEqual([]);
      expect(board.currentDay).toBe(0);
      expect(board.wipLimits).toEqual(wipLimits);
    });

    it('creates a board with provided cards', () => {
      const wipLimits = WipLimits.empty();
      const card = createTestCard('A');

      const board = Board.create({ wipLimits, cards: [card] });

      expect(board.cards).toHaveLength(1);
      expect(board.cards[0]).toEqual(card);
    });

    it('creates a board with provided workers', () => {
      const wipLimits = WipLimits.empty();
      const worker = createTestWorker('worker-1', 'blue');

      const board = Board.create({ wipLimits, workers: [worker] });

      expect(board.workers).toHaveLength(1);
      expect(board.workers[0]).toEqual(worker);
    });

    it('creates a board with provided current day', () => {
      const wipLimits = WipLimits.empty();

      const board = Board.create({ wipLimits, currentDay: 10 });

      expect(board.currentDay).toBe(10);
    });

    it('throws for negative current day', () => {
      const wipLimits = WipLimits.empty();

      expect(() => Board.create({ wipLimits, currentDay: -1 })).toThrow(
        'Current day cannot be negative'
      );
    });

    it('throws for non-integer current day', () => {
      const wipLimits = WipLimits.empty();

      expect(() => Board.create({ wipLimits, currentDay: 1.5 })).toThrow(
        'Current day must be an integer'
      );
    });

    it('does not mutate input arrays', () => {
      const wipLimits = WipLimits.empty();
      const cards = [createTestCard('A')];
      const workers = [createTestWorker('worker-1')];

      const board = Board.create({ wipLimits, cards, workers });

      expect(board.cards).not.toBe(cards);
      expect(board.workers).not.toBe(workers);
    });
  });

  describe('empty()', () => {
    it('creates an empty board with given WIP limits', () => {
      const wipLimits = WipLimits.empty();

      const board = Board.empty(wipLimits);

      expect(board.cards).toEqual([]);
      expect(board.workers).toEqual([]);
      expect(board.currentDay).toBe(0);
      expect(board.wipLimits).toEqual(wipLimits);
    });
  });

  describe('withCards()', () => {
    it('replaces all cards', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });
      const newCards = [createTestCard('B'), createTestCard('C')];

      const result = Board.withCards(board, newCards);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].id).toBe('B');
      expect(result.cards[1].id).toBe('C');
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      Board.withCards(board, [createTestCard('B')]);

      expect(board.cards).toHaveLength(1);
      expect(board.cards[0].id).toBe('A');
    });
  });

  describe('withWorkers()', () => {
    it('replaces all workers', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, workers: [createTestWorker('w1')] });
      const newWorkers = [createTestWorker('w2'), createTestWorker('w3', 'blue')];

      const result = Board.withWorkers(board, newWorkers);

      expect(result.workers).toHaveLength(2);
      expect(result.workers[0].id).toBe('w2');
      expect(result.workers[1].id).toBe('w3');
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, workers: [createTestWorker('w1')] });

      Board.withWorkers(board, [createTestWorker('w2')]);

      expect(board.workers).toHaveLength(1);
      expect(board.workers[0].id).toBe('w1');
    });
  });

  describe('withCurrentDay()', () => {
    it('updates the current day', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, currentDay: 5 });

      const result = Board.withCurrentDay(board, 10);

      expect(result.currentDay).toBe(10);
    });

    it('throws for negative day', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });

      expect(() => Board.withCurrentDay(board, -1)).toThrow(
        'Current day cannot be negative'
      );
    });

    it('throws for non-integer day', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });

      expect(() => Board.withCurrentDay(board, 2.5)).toThrow(
        'Current day must be an integer'
      );
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, currentDay: 5 });

      Board.withCurrentDay(board, 10);

      expect(board.currentDay).toBe(5);
    });
  });

  describe('withWipLimits()', () => {
    it('updates the WIP limits', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });
      const newLimits = WipLimits.withColumnLimit(wipLimits, 'redActive', {
        min: 1,
        max: 5,
      });

      const result = Board.withWipLimits(board, newLimits);

      expect(result.wipLimits.redActive).toEqual({ min: 1, max: 5 });
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });
      const newLimits = WipLimits.withColumnLimit(wipLimits, 'redActive', {
        min: 1,
        max: 5,
      });

      Board.withWipLimits(board, newLimits);

      expect(board.wipLimits.redActive).toEqual({ min: 0, max: 0 });
    });
  });

  describe('addCard()', () => {
    it('adds a card to the board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });
      const card = createTestCard('A');

      const result = Board.addCard(board, card);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toEqual(card);
    });

    it('adds to existing cards', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      const result = Board.addCard(board, createTestCard('B'));

      expect(result.cards).toHaveLength(2);
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });

      Board.addCard(board, createTestCard('A'));

      expect(board.cards).toHaveLength(0);
    });
  });

  describe('removeCard()', () => {
    it('removes a card by ID', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({
        wipLimits,
        cards: [createTestCard('A'), createTestCard('B')],
      });

      const result = Board.removeCard(board, 'A');

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].id).toBe('B');
    });

    it('does nothing if card not found', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      const result = Board.removeCard(board, 'Z');

      expect(result.cards).toHaveLength(1);
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      Board.removeCard(board, 'A');

      expect(board.cards).toHaveLength(1);
    });
  });

  describe('updateCard()', () => {
    it('updates a card using the updater function', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      const result = Board.updateCard(board, 'A', (card) =>
        Card.withStage(card, 'red-active')
      );

      expect(result.cards[0].stage).toBe('red-active');
    });

    it('only updates the matching card', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({
        wipLimits,
        cards: [createTestCard('A'), createTestCard('B')],
      });

      const result = Board.updateCard(board, 'A', (card) =>
        Card.withStage(card, 'red-active')
      );

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.cards[1].stage).toBe('options');
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      Board.updateCard(board, 'A', (card) => Card.withStage(card, 'red-active'));

      expect(board.cards[0].stage).toBe('options');
    });
  });

  describe('addWorker()', () => {
    it('adds a worker to the board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });
      const worker = createTestWorker('w1');

      const result = Board.addWorker(board, worker);

      expect(result.workers).toHaveLength(1);
      expect(result.workers[0]).toEqual(worker);
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });

      Board.addWorker(board, createTestWorker('w1'));

      expect(board.workers).toHaveLength(0);
    });
  });

  describe('removeWorker()', () => {
    it('removes a worker by ID', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({
        wipLimits,
        workers: [createTestWorker('w1'), createTestWorker('w2', 'blue')],
      });

      const result = Board.removeWorker(board, 'w1');

      expect(result.workers).toHaveLength(1);
      expect(result.workers[0].id).toBe('w2');
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, workers: [createTestWorker('w1')] });

      Board.removeWorker(board, 'w1');

      expect(board.workers).toHaveLength(1);
    });
  });

  describe('findCard()', () => {
    it('finds a card by ID', () => {
      const wipLimits = WipLimits.empty();
      const card = createTestCard('A');
      const board = Board.create({ wipLimits, cards: [card] });

      const result = Board.findCard(board, 'A');

      expect(result).toEqual(card);
    });

    it('returns undefined if not found', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });

      const result = Board.findCard(board, 'Z');

      expect(result).toBeUndefined();
    });
  });

  describe('findWorker()', () => {
    it('finds a worker by ID', () => {
      const wipLimits = WipLimits.empty();
      const worker = createTestWorker('w1');
      const board = Board.create({ wipLimits, workers: [worker] });

      const result = Board.findWorker(board, 'w1');

      expect(result).toEqual(worker);
    });

    it('returns undefined if not found', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits });

      const result = Board.findWorker(board, 'missing');

      expect(result).toBeUndefined();
    });
  });

  describe('getCardsByStage()', () => {
    it('returns cards in the specified stage', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({
        wipLimits,
        cards: [
          createTestCard('A', 'options'),
          createTestCard('B', 'red-active'),
          createTestCard('C', 'options'),
        ],
      });

      const result = Board.getCardsByStage(board, 'options');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('A');
      expect(result[1].id).toBe('C');
    });

    it('returns empty array if no cards in stage', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, cards: [createTestCard('A')] });

      const result = Board.getCardsByStage(board, 'done');

      expect(result).toEqual([]);
    });
  });

  describe('getCardCountByStage()', () => {
    it('returns count of cards in the specified stage', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({
        wipLimits,
        cards: [
          createTestCard('A', 'options'),
          createTestCard('B', 'red-active'),
          createTestCard('C', 'options'),
        ],
      });

      expect(Board.getCardCountByStage(board, 'options')).toBe(2);
      expect(Board.getCardCountByStage(board, 'red-active')).toBe(1);
      expect(Board.getCardCountByStage(board, 'done')).toBe(0);
    });
  });

  describe('advanceDay()', () => {
    it('increments the current day by 1', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, currentDay: 5 });

      const result = Board.advanceDay(board);

      expect(result.currentDay).toBe(6);
    });

    it('does not mutate original board', () => {
      const wipLimits = WipLimits.empty();
      const board = Board.create({ wipLimits, currentDay: 5 });

      Board.advanceDay(board);

      expect(board.currentDay).toBe(5);
    });
  });

  describe('ALL_STAGES', () => {
    it('contains all 7 stages', () => {
      expect(ALL_STAGES).toHaveLength(7);
    });

    it('contains stages in correct order', () => {
      expect(ALL_STAGES).toEqual([
        'options',
        'red-active',
        'red-finished',
        'blue-active',
        'blue-finished',
        'green',
        'done',
      ]);
    });

    it('is frozen (immutable)', () => {
      expect(Object.isFrozen(ALL_STAGES)).toBe(true);
    });
  });
});
