import { describe, it, expect, beforeEach } from 'vitest';
import { WipLimits } from '../domain/wip/wip-limits';
import { runPolicyDay } from './run-policy';
import { createTestCard, createTestWorker, createValidCardId } from './test-fixtures';

describe('RunPolicyUseCase', () => {
  let mockRandomValues: number[];
  let mockRandomIndex: number;

  const mockRandom = (): number => {
    const value = mockRandomValues[mockRandomIndex % mockRandomValues.length];
    mockRandomIndex++;
    return value;
  };

  beforeEach(() => {
    mockRandomValues = [0.5];
    mockRandomIndex = 0;
  });

  describe('Basic Execution', () => {
    it('increments day counter', () => {
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards: [],
        workers: [],
        currentDay: 10,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.newDay).toBe(11);
    });

    it('handles empty board', () => {
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards: [],
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards).toEqual([]);
      expect(result.newDay).toBe(1);
    });
  });

  describe('Step 1: Move Cards from Options to Red-Active', () => {
    it('moves cards from options to red-active', () => {
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'options' }),
      ];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 5,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.cards[1].stage).toBe('red-active');
    });

    it('sets startDay when moving to red-active', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options', startDay: 0 })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 10,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].startDay).toBe(10);
    });

    it('sorts cards by ID before moving (A before B)', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'redActive', { min: 0, max: 1 });
      const cards = [
        createTestCard({ id: createValidCardId('C'), stage: 'options' }),
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'options' }),
      ];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 5,
        wipLimits,
        random: mockRandom,
      });

      const movedCard = result.cards.find(c => c.stage === 'red-active');
      expect(movedCard?.id).toBe('A');
    });

    it('respects max WIP limit on red-active', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'redActive', { min: 0, max: 2 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'options' }),
        createTestCard({ id: createValidCardId('C'), stage: 'options' }),
      ];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 5,
        wipLimits,
        random: mockRandom,
      });

      const redActiveCards = result.cards.filter(c => c.stage === 'red-active');
      expect(redActiveCards).toHaveLength(2);
    });

    it('respects min WIP limit on options', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'options', { min: 1, max: 0 });
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options' })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 5,
        wipLimits,
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('options');
    });
  });

  describe('Step 2: Move Finished Cards to Next Activity', () => {
    it('moves red-finished cards to blue-active', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'red-finished',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('blue-active');
    });

    it('moves blue-finished cards to green', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'blue-finished',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 0 } }
      })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('green');
    });

    it('prioritizes older cards when moving', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'blueActive', { min: 0, max: 1 });
      const cards = [
        createTestCard({
          id: createValidCardId('A'),
          stage: 'red-finished',
          age: 3,
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createTestCard({
          id: createValidCardId('B'),
          stage: 'red-finished',
          age: 5,
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits,
        random: mockRandom,
      });

      expect(result.cards.find(c => c.id === 'B')?.stage).toBe('blue-active');
      expect(result.cards.find(c => c.id === 'A')?.stage).toBe('red-finished');
    });

    it('does not move cards that are not done', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'red-finished',
        workItems: { red: { total: 5, completed: 3 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('red-finished');
    });
  });

  describe('Step 3: Worker Assignment', () => {
    it('assigns red workers to red-active cards', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'red-active' })];
      const workers = [createTestWorker('w1', 'red')];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers,
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].workItems.red.completed).toBe(5);
    });

    it('applies worker output and clears assignments at end of day', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'red-active',
        workItems: { red: { total: 10, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const workers = [createTestWorker('w1', 'red')];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers,
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].workItems.red.completed).toBe(5);
      expect(result.cards[0].assignedWorkers).toHaveLength(0);
    });
  });

  describe('Card Aging', () => {
    it('ages cards that are in active stages after policy moves', () => {
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'red-active', age: 2 }),
        createTestCard({ id: createValidCardId('B'), stage: 'options', age: 0 }),
        createTestCard({ id: createValidCardId('C'), stage: 'done', age: 5 }),
      ];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards.find(c => c.id === 'A')?.age).toBe(3);
      expect(result.cards.find(c => c.id === 'B')?.age).toBe(1);
      expect(result.cards.find(c => c.id === 'C')?.age).toBe(5);
    });
  });

  describe('Card Transitions', () => {
    it('transitions cards when work is complete', () => {
      mockRandomValues = [0];
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'red-active',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('red-finished');
    });

    it('sets completionDay when moving to done', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'green',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 5 } }
      })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 5,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('done');
      expect(result.cards[0].completionDay).toBe(6);
    });
  });

  describe('Blocked Cards', () => {
    it('does not move blocked cards even when work is complete', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'red-active',
        isBlocked: true,
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = runPolicyDay({
        policyType: 'siloted-expert',
        cards,
        workers: [],
        currentDay: 0,
        wipLimits: WipLimits.empty(),
        random: mockRandom,
      });

      expect(result.cards[0].stage).toBe('red-active');
    });
  });
});
