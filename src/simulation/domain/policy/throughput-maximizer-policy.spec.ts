import { describe, it, expect } from 'vitest';
import { ThroughputMaximizerPolicy } from './throughput-maximizer-policy';
import {
  createTestCardWithId,
  createValidCardId,
} from '../card/card-test-fixtures';
import { Worker } from '../worker/worker';
import type { Card } from '../card/card';
import type { WorkItems } from '../card/work-items';

function assignedIdsOf(cards: readonly Card[], cardId: string): string[] {
  const id = createValidCardId(cardId);
  const card = cards.find((candidate) => candidate.id === id);
  if (!card) throw new Error(`Card ${cardId} not found`);
  return card.assignedWorkers.map((worker) => worker.id);
}

function greenRemaining(remaining: number): WorkItems {
  return {
    red: { total: 5, completed: 5 },
    blue: { total: 5, completed: 5 },
    green: { total: 10, completed: 10 - remaining },
  };
}

describe('ThroughputMaximizerPolicy', () => {
  describe('serving the work closest to Done first', () => {
    it('prefers a green card over a blue one', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'blue-active' }),
        createTestCardWithId('B', { stage: 'green' }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('prefers a blue card over a red one', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active' }),
        createTestCardWithId('B', { stage: 'blue-active' }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
    });

    it('ignores the age that other policies sort on', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', age: 99 }),
        createTestCardWithId('B', { stage: 'green', age: 1 }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
    });
  });

  describe('breaking ties within a stage', () => {
    it('serves the card with the least work remaining', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'green', workItems: greenRemaining(9) }),
        createTestCardWithId('B', { stage: 'green', workItems: greenRemaining(1) }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
    });

    it('falls back to card id so runs stay reproducible', () => {
      const cards = [
        createTestCardWithId('B', { stage: 'green', workItems: greenRemaining(4) }),
        createTestCardWithId('A', { stage: 'green', workItems: greenRemaining(4) }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
    });
  });

  describe('holding new work back until the pipeline clears', () => {
    it('refuses the pull while an unblocked card is still in progress', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-active' })];

      expect(ThroughputMaximizerPolicy.allowsPullFromOptions(cards)).toBe(false);
    });

    it('refuses the pull while a card waits in a finished queue', () => {
      const cards = [createTestCardWithId('A', { stage: 'blue-finished' })];

      expect(ThroughputMaximizerPolicy.allowsPullFromOptions(cards)).toBe(false);
    });

    it('allows the pull once the pipeline is empty', () => {
      const cards = [createTestCardWithId('A', { stage: 'options' })];

      expect(ThroughputMaximizerPolicy.allowsPullFromOptions(cards)).toBe(true);
    });

    it('allows the pull on a completely empty board', () => {
      expect(ThroughputMaximizerPolicy.allowsPullFromOptions([])).toBe(true);
    });

    it('does not let a blocked card hold the pull back forever', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'green', isBlocked: true }),
        createTestCardWithId('B', { stage: 'options' }),
      ];

      expect(ThroughputMaximizerPolicy.allowsPullFromOptions(cards)).toBe(true);
    });

    it('ignores cards already done', () => {
      const cards = [createTestCardWithId('A', { stage: 'done' })];

      expect(ThroughputMaximizerPolicy.allowsPullFromOptions(cards)).toBe(true);
    });
  });

  describe('respecting the three-worker ceiling', () => {
    it('stacks at most three workers before serving the next card', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'green', workItems: greenRemaining(1) }),
        createTestCardWithId('B', { stage: 'green', workItems: greenRemaining(9) }),
      ];
      const workers = [
        Worker.create('w1', 'red'),
        Worker.create('w2', 'red'),
        Worker.create('w3', 'red'),
        Worker.create('w4', 'red'),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['w1', 'w2', 'w3']);
      expect(assignedIdsOf(result, 'B')).toEqual(['w4']);
    });
  });

  describe('skipping cards that cannot progress', () => {
    it('assigns no worker to a blocked card', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'green', isBlocked: true }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('ignores stages that are not active', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-finished' })];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('handling empty inputs', () => {
    it('returns an empty board untouched', () => {
      const result = ThroughputMaximizerPolicy.assignWorkers([], [
        Worker.create('bob', 'red'),
      ]);

      expect(result).toEqual([]);
    });

    it('clears previous assignments when no worker is available', () => {
      const cards = [
        createTestCardWithId('A', {
          stage: 'green',
          assignedWorkers: [{ id: 'stale', type: 'red' }],
        }),
      ];

      const result = ThroughputMaximizerPolicy.assignWorkers(cards, []);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('producing with the standard ranges', () => {
    it('keeps the specialisation bonus for a matching worker', () => {
      expect(ThroughputMaximizerPolicy.outputRangeFor('green', 'green')).toEqual({
        min: 3,
        max: 6,
      });
    });
  });

  describe('describing itself', () => {
    it('is registered as throughput-maximizer', () => {
      expect(ThroughputMaximizerPolicy.id).toBe('throughput-maximizer');
    });
  });
});
