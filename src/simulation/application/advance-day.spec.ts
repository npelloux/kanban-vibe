import { describe, it, expect } from 'vitest';
import { advanceDay } from './advance-day';
import { WipLimits } from '../domain/wip/wip-limits';
import type { Card as CardType } from '../domain/card/card';
import type { WorkItems } from '../domain/card/work-items';
import { createTestCardWithId } from './test-fixtures';

function createCard(
  id: string,
  stage: CardType['stage'],
  overrides: Partial<{
    age: number;
    workItems: WorkItems;
    isBlocked: boolean;
    assignedWorkers: CardType['assignedWorkers'];
    completionDay: number | null;
  }> = {}
): CardType {
  return createTestCardWithId(id, {
    stage,
    workItems: overrides.workItems,
    age: overrides.age,
    isBlocked: overrides.isBlocked,
    assignedWorkers: overrides.assignedWorkers,
    completionDay: overrides.completionDay,
    startDay: 1,
  });
}

describe('advanceDay', () => {
  const emptyWipLimits = WipLimits.empty();

  describe('day increment', () => {
    it('increments the day counter', () => {
      const result = advanceDay({
        cards: [],
        currentDay: 5,
        wipLimits: emptyWipLimits,
      });

      expect(result.newDay).toBe(6);
    });
  });

  describe('card aging', () => {
    it('does not age cards in options stage', () => {
      const card = createCard('A', 'options', { age: 3 });
      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].age).toBe(3);
    });

    it('does not age cards in done stage', () => {
      const card = createCard('A', 'done', { age: 10 });
      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].age).toBe(10);
    });

    it('ages cards in red-active stage by 1', () => {
      const card = createCard('A', 'red-active', { age: 2 });
      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].age).toBe(3);
    });

    it('ages cards in all active/finished stages', () => {
      const stages: CardType['stage'][] = [
        'red-active',
        'red-finished',
        'blue-active',
        'blue-finished',
        'green',
      ];

      for (const stage of stages) {
        const card = createCard('A', stage, { age: 5 });
        const result = advanceDay({
          cards: [card],
          currentDay: 1,
          wipLimits: emptyWipLimits,
        });

        expect(result.cards[0].age).toBe(6);
      }
    });
  });

  describe('worker output', () => {
    it('applies worker output to cards with assigned workers in active stages', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 10, completed: 0 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
        assignedWorkers: [{ id: 'w1', type: 'red' }],
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
        random: () => 0, // Min output: specialized = 3
      });

      expect(result.cards[0].workItems.red.completed).toBe(3);
    });

    it('does not apply output to cards without workers', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 10, completed: 0 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
        assignedWorkers: [],
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].workItems.red.completed).toBe(0);
    });

    it('does not apply output to cards in finished stages', () => {
      const card = createCard('A', 'red-finished', {
        workItems: {
          red: { total: 5, completed: 5 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
        assignedWorkers: [{ id: 'w1', type: 'red' }],
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
        random: () => 0.5,
      });

      expect(result.cards[0].workItems.red.completed).toBe(5);
      expect(result.cards[0].workItems.blue.completed).toBe(0);
    });

    it('applies output from multiple workers', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 20, completed: 0 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
        assignedWorkers: [
          { id: 'w1', type: 'red' },
          { id: 'w2', type: 'red' },
        ],
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
        random: () => 0, // Min output: 3 each
      });

      expect(result.cards[0].workItems.red.completed).toBe(6); // 3 + 3
    });

    it('caps output at total work items', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 5, completed: 3 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
        assignedWorkers: [{ id: 'w1', type: 'red' }],
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
        random: () => 0.999, // Max output: 6, but only 2 remaining
      });

      expect(result.cards[0].workItems.red.completed).toBe(5); // Capped at total
    });
  });

  describe('stage transitions', () => {
    it('transitions card from red-active to red-finished when work complete', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 5, completed: 5 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].stage).toBe('red-finished');
    });

    it('transitions card through all stages when work complete', () => {
      const transitions: Array<{
        from: CardType['stage'];
        to: CardType['stage'];
        workItems: WorkItems;
      }> = [
        {
          from: 'red-active',
          to: 'red-finished',
          workItems: {
            red: { total: 5, completed: 5 },
            blue: { total: 5, completed: 0 },
            green: { total: 5, completed: 0 },
          },
        },
        {
          from: 'red-finished',
          to: 'blue-active',
          workItems: {
            red: { total: 5, completed: 5 },
            blue: { total: 5, completed: 0 },
            green: { total: 5, completed: 0 },
          },
        },
        {
          from: 'blue-active',
          to: 'blue-finished',
          workItems: {
            red: { total: 5, completed: 5 },
            blue: { total: 5, completed: 5 },
            green: { total: 5, completed: 0 },
          },
        },
        {
          from: 'blue-finished',
          to: 'green',
          workItems: {
            red: { total: 5, completed: 5 },
            blue: { total: 5, completed: 5 },
            green: { total: 5, completed: 0 },
          },
        },
        {
          from: 'green',
          to: 'done',
          workItems: {
            red: { total: 5, completed: 5 },
            blue: { total: 5, completed: 5 },
            green: { total: 5, completed: 5 },
          },
        },
      ];

      for (const { from, to, workItems } of transitions) {
        const card = createCard('A', from, { workItems });
        const result = advanceDay({
          cards: [card],
          currentDay: 10,
          wipLimits: emptyWipLimits,
        });

        expect(result.cards[0].stage).toBe(to);
      }
    });

    it('does not transition blocked cards', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 5, completed: 5 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
        isBlocked: true,
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].stage).toBe('red-active');
    });

    it('sets completionDay when card moves to done', () => {
      const card = createCard('A', 'green', {
        workItems: {
          red: { total: 5, completed: 5 },
          blue: { total: 5, completed: 5 },
          green: { total: 5, completed: 5 },
        },
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 42,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].stage).toBe('done');
      expect(result.cards[0].completionDay).toBe(42);
    });
  });

  describe('WIP limit enforcement', () => {
    it('blocks transition when target column at max WIP', () => {
      const cardInRedFinished = createCard('B', 'red-finished', {
        workItems: {
          red: { total: 5, completed: 5 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
      });
      const cardAlreadyInBlueActive = createCard('A', 'blue-active');

      const wipLimits = WipLimits.withColumnLimit(emptyWipLimits, 'blueActive', {
        min: 0,
        max: 1,
      });

      const result = advanceDay({
        cards: [cardInRedFinished, cardAlreadyInBlueActive],
        currentDay: 1,
        wipLimits,
      });

      const cardB = result.cards.find((c) => c.id === 'B');
      expect(cardB?.stage).toBe('red-finished');
    });

    it('blocks transition when source column at min WIP', () => {
      const card = createCard('A', 'red-active', {
        workItems: {
          red: { total: 5, completed: 5 },
          blue: { total: 5, completed: 0 },
          green: { total: 5, completed: 0 },
        },
      });

      const wipLimits = WipLimits.withColumnLimit(emptyWipLimits, 'redActive', {
        min: 1,
        max: 0,
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('red-active');
    });
  });

  describe('worker assignment reset', () => {
    it('clears all worker assignments at end of day', () => {
      const card = createCard('A', 'red-active', {
        assignedWorkers: [
          { id: 'w1', type: 'red' },
          { id: 'w2', type: 'blue' },
        ],
      });

      const result = advanceDay({
        cards: [card],
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].assignedWorkers).toEqual([]);
    });
  });

  describe('multiple cards', () => {
    it('processes all cards correctly', () => {
      const cards = [
        createCard('A', 'options', { age: 0 }),
        createCard('B', 'red-active', { age: 5 }),
        createCard('C', 'done', { age: 10 }),
      ];

      const result = advanceDay({
        cards,
        currentDay: 1,
        wipLimits: emptyWipLimits,
      });

      expect(result.cards[0].age).toBe(0); // options - no aging
      expect(result.cards[1].age).toBe(6); // red-active - aged
      expect(result.cards[2].age).toBe(10); // done - no aging
    });
  });
});
