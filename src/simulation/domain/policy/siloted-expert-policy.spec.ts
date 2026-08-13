import { describe, it, expect } from 'vitest';
import { SilotedExpertPolicy } from './siloted-expert-policy';
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

describe('SilotedExpertPolicy', () => {
  describe('matching workers to their own colour', () => {
    it('assigns a red worker to a red-active card', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-active' })];
      const workers = [Worker.create('bob', 'red')];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
    });

    it('leaves a red worker unassigned when only blue work is available', () => {
      const cards = [createTestCardWithId('A', { stage: 'blue-active' })];
      const workers = [Worker.create('bob', 'red')];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('assigns a green worker to a green card', () => {
      const cards = [createTestCardWithId('A', { stage: 'green' })];
      const workers = [Worker.create('taz', 'green')];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['taz']);
    });

    it('ignores cards that are not in an active stage', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-finished' })];
      const workers = [Worker.create('bob', 'red')];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('ordering cards by age', () => {
    it('gives the single worker to the oldest card', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', age: 1 }),
        createTestCardWithId('B', { stage: 'red-active', age: 7 }),
      ];
      const workers = [Worker.create('bob', 'red')];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'B')).toEqual(['bob']);
      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });

    it('spreads workers one per card before doubling up', () => {
      const cards = [
        createTestCardWithId('A', { stage: 'red-active', age: 5 }),
        createTestCardWithId('B', { stage: 'red-active', age: 3 }),
      ];
      const workers = [Worker.create('bob', 'red'), Worker.create('amy', 'red')];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob']);
      expect(assignedIdsOf(result, 'B')).toEqual(['amy']);
    });
  });

  describe('respecting the three-worker ceiling per card', () => {
    it('stacks at most three workers on a single card', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-active' })];
      const workers = [
        Worker.create('bob', 'red'),
        Worker.create('amy', 'red'),
        Worker.create('joe', 'red'),
        Worker.create('sue', 'red'),
      ];

      const result = SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(assignedIdsOf(result, 'A')).toEqual(['bob', 'amy', 'joe']);
    });
  });

  describe('handling empty inputs', () => {
    it('returns an empty board untouched', () => {
      const result = SilotedExpertPolicy.assignWorkers([], [Worker.create('bob', 'red')]);

      expect(result).toEqual([]);
    });

    it('clears previous assignments when no worker is available', () => {
      const cards = [
        createTestCardWithId('A', {
          stage: 'red-active',
          assignedWorkers: [{ id: 'stale', type: 'red' }],
        }),
      ];

      const result = SilotedExpertPolicy.assignWorkers(cards, []);

      expect(assignedIdsOf(result, 'A')).toEqual([]);
    });
  });

  describe('preserving immutability', () => {
    it('leaves the cards it was given unchanged', () => {
      const cards = [createTestCardWithId('A', { stage: 'red-active' })];
      const workers = [Worker.create('bob', 'red')];

      SilotedExpertPolicy.assignWorkers(cards, workers);

      expect(cards[0].assignedWorkers).toEqual([]);
    });
  });

  describe('describing itself', () => {
    it('is identified as siloted-expert', () => {
      expect(SilotedExpertPolicy.id).toBe('siloted-expert');
    });
  });
});
