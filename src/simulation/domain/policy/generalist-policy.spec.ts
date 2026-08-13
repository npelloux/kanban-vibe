import { describe, it, expect } from 'vitest';
import { GeneralistPolicy } from './generalist-policy';
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

function workItemsWithRedRemaining(remaining: number): WorkItems {
  return {
    red: { total: 10, completed: 10 - remaining },
    blue: { total: 10, completed: 0 },
    green: { total: 10, completed: 0 },
  };
}

describe('GeneralistPolicy', () => {
  describe('ignoring worker colour', () => {
    it('assigns a red worker to a blue-active card', () => {
      const cards = [createTestCardWithId('A', { stage: 'blue-active' })];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
    });

    it('assigns a green worker to a red-active card', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-active' })];
      const workers = [Worker.create('taz', 'green')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['taz']);
    });

    it('ignores cards that are not in an active stage', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-finished' })];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('leaves cards waiting in options untouched', () => {
      const cards = [createTestCardWithId('A', { stage: 'options' })];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('prioritising the oldest work', () => {
    it('gives the single worker to the oldest card across colours', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', age: 2 }),
        createTestCardWithId('B', { stage: 'green', age: 9 }),
      ];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('breaks an age tie by favouring the card closest to completion', () => {
      const cards = [
        createTestCardWithId('A', {
          stage: 'red-active',
          age: 5,
          workItems: workItemsWithRedRemaining(8),
        }),
        createTestCardWithId('B', {
          stage: 'red-active',
          age: 5,
          workItems: workItemsWithRedRemaining(2),
        }),
      ];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
    });

    it('breaks a full tie by card id so runs stay reproducible', () => {
      const cards = [
        createTestCardWithId('B', { stage: 'red-active', age: 5 }),
        createTestCardWithId('A', { stage: 'red-active', age: 5 }),
      ];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
    });
  });

  describe('skipping blocked cards', () => {
    it('assigns no worker to a blocked card', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', isBlocked: true }),
      ];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('sends the worker to an unblocked younger card instead', () => {
      const cards = [
        createTestCardWithId('A', {
          stage: 'red-active',
          age: 9,
          isBlocked: true,
        }),
        createTestCardWithId('B', { stage: 'blue-active', age: 1 }),
      ];
      const workers = [Worker.create('bob', 'red')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
    });
  });

  describe('respecting the three-worker ceiling', () => {
    it('stacks at most three workers on a single card', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-active' })];
      const workers = [
        Worker.create('bob', 'red'),
        Worker.create('amy', 'blue'),
        Worker.create('joe', 'green'),
        Worker.create('sue', 'red'),
      ];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob', 'amy', 'joe']);
    });

    it('spreads workers one per card before doubling up', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', age: 5 }),
        createTestCardWithId('B', { stage: 'green', age: 3 }),
      ];
      const workers = [Worker.create('bob', 'red'), Worker.create('amy', 'blue')];

      const result = GeneralistPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
      expect(assignedIdsOf(result, 'B')).toEqual(['amy']);
    });
  });

  describe('producing without a specialisation bonus', () => {
    it('caps a matching worker at the generalist range', () => {
      expect(GeneralistPolicy.outputRangeFor('red', 'red')).toEqual({ min: 0, max: 3 });
    });

    it('uses the same range for a mismatched worker', () => {
      expect(GeneralistPolicy.outputRangeFor('red', 'green')).toEqual({ min: 0, max: 3 });
    });
  });

  describe('handling empty inputs', () => {
    it('returns an empty board untouched', () => {
      const result = GeneralistPolicy.assignWorkers([], [Worker.create('bob', 'red')]);

      expect(result).toEqual([]);
    });

    it('clears previous assignments when no worker is available', () => {
      const cards = [
        createTestCardWithId('A', {
          stage: 'red-active',
          assignedWorkers: [{ id: 'stale', type: 'red' }],
        }),
      ];

      const result = GeneralistPolicy.assignWorkers(cards, []);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('describing itself', () => {
    it('is registered as generalist', () => {
      expect(GeneralistPolicy.id).toBe('generalist');
    });
  });
});
