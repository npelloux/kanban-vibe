import { describe, it, expect } from 'vitest';
import { BottleneckFirstPolicy } from './bottleneck-first-policy';
import {
  createTestCardWithId,
  createValidCardId,
} from '../card/card-test-fixtures';
import { Worker } from '../worker/worker';
import type { Card } from '../card/card';

function assignedIdsOf(cards: readonly Card[], cardId: string): string[] {
  const id = createValidCardId(cardId);
  const card = cards.find((candidate) => candidate.id === id);
  if (!card) throw new Error(`Card ${cardId} not found`);
  return card.assignedWorkers.map((worker) => worker.id);
}

function threeWorkers(): Worker[] {
  return [
    Worker.create('bob', 'red'),
    Worker.create('amy', 'blue'),
    Worker.create('joe', 'green'),
  ];
}

describe('BottleneckFirstPolicy', () => {
  describe('finding the constraint', () => {
    it('concentrates workers on the stage holding the most cards', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active' }),
        createTestCardWithId('B', { stage: 'blue-active' }),
        createTestCardWithId('C', { stage: 'blue-active' }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, threeWorkers());

      expect(assignedIdsOf(result, 'A')).toEqual([]);
      expect(assignedIdsOf(result, 'B').length + assignedIdsOf(result, 'C').length).toBe(3);
    });

    it('treats the only populated stage as the constraint', () => {
      const cards = [createTestCardWithId('A', { stage: 'green' })];

      const result = BottleneckFirstPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
    });

    it('breaks a card-count tie by the older average age', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', age: 1 }),
        createTestCardWithId('B', { stage: 'green', age: 9 }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('breaks a full tie by pipeline order so runs stay reproducible', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'blue-active', age: 4 }),
        createTestCardWithId('B', { stage: 'red-active', age: 4 }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
    });
  });

  describe('spilling past a saturated constraint', () => {
    it('sends surplus workers downstream rather than leaving them idle', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active' }),
        createTestCardWithId('B', { stage: 'green' }),
      ];
      const workers = [
        Worker.create('w1', 'red'),
        Worker.create('w2', 'red'),
        Worker.create('w3', 'red'),
        Worker.create('w4', 'red'),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['w1', 'w2', 'w3']);
      expect(assignedIdsOf(result, 'B')).toEqual(['w4']);
    });

    it('fills the constraint before serving any other stage', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'blue-active' }),
        createTestCardWithId('B', { stage: 'blue-active' }),
        createTestCardWithId('C', { stage: 'red-active' }),
      ];
      const workers = [Worker.create('w1', 'red'), Worker.create('w2', 'red')];

      const result = BottleneckFirstPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'C')).toEqual([]);
    });
  });

  describe('ignoring cards that cannot progress', () => {
    it('assigns no worker to a blocked card', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', isBlocked: true }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('does not count blocked cards when locating the constraint', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', isBlocked: true }),
        createTestCardWithId('B', { stage: 'red-active', isBlocked: true }),
        createTestCardWithId('C', { stage: 'green' }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'C')).toEqual(['bob']);
    });

    it('ignores stages that are not active', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-finished' }),
        createTestCardWithId('B', { stage: 'options' }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, [
        Worker.create('bob', 'red'),
      ]);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
      expect(assignedIdsOf(result, 'B')).toEqual([]);
    });
  });

  describe('handling empty inputs', () => {
    it('leaves every worker unassigned when no active card exists', () => {
      const cards = [createTestCardWithId('A', { stage: 'options' })];

      const result = BottleneckFirstPolicy.assignWorkers(cards, threeWorkers());

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('returns an empty board untouched', () => {
      const result = BottleneckFirstPolicy.assignWorkers([], threeWorkers());

      expect(result).toEqual([]);
    });

    it('clears previous assignments when no worker is available', () => {
      const cards = [
        createTestCardWithId('A', {
          stage: 'red-active',
          assignedWorkers: [{ id: 'stale', type: 'red' }],
        }),
      ];

      const result = BottleneckFirstPolicy.assignWorkers(cards, []);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('producing with the standard ranges', () => {
    it('keeps the specialisation bonus for a matching worker', () => {
      expect(BottleneckFirstPolicy.outputRangeFor('red', 'red')).toEqual({
        min: 3,
        max: 6,
      });
    });

    it('gives no bonus outside the worker colour', () => {
      expect(BottleneckFirstPolicy.outputRangeFor('red', 'green')).toEqual({
        min: 0,
        max: 3,
      });
    });
  });

  describe('describing itself', () => {
    it('is registered as bottleneck-first', () => {
      expect(BottleneckFirstPolicy.id).toBe('bottleneck-first');
    });
  });
});
