import { describe, it, expect } from 'vitest';
import { WipLimits } from '../domain/wip/wip-limits';
import { moveCard } from './move-card';
import { createTestCard, createValidCardId } from './test-fixtures';

describe('MoveCardUseCase', () => {
  describe('Movement from Options to Red-Active', () => {
    it('moves card from options to red-active when WIP allows', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('sets startDay to currentDay when moving to red-active', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options', startDay: 0 })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 10,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].startDay).toBe(10);
    });

    it('preserves startDay on other cards when moving one card', () => {
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options', startDay: 0 }),
        createTestCard({ id: createValidCardId('B'), stage: 'red-active', startDay: 3 }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 10,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[1].startDay).toBe(3);
    });

    it('blocks movement when red-active max WIP would be exceeded', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'redActive', { min: 0, max: 2 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'red-active' }),
        createTestCard({ id: createValidCardId('C'), stage: 'red-active' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toBe('Cannot move card to Red Active: Max WIP limit of 2 would be exceeded.');
    });

    it('blocks movement when options min WIP would be violated', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'options', { min: 1, max: 0 });
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toBe('Cannot move card out of Options: Min WIP limit of 1 would be violated.');
    });

    it('checks max WIP before min WIP', () => {
      let wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'options', { min: 1, max: 0 });
      wipLimits = WipLimits.withColumnLimit(wipLimits, 'redActive', { min: 0, max: 1 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'red-active' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.alertMessage).toBe('Cannot move card to Red Active: Max WIP limit of 1 would be exceeded.');
    });
  });

  describe('Movement from Red-Finished to Blue-Active', () => {
    it('moves card from red-finished to blue-active when WIP allows', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'red-finished' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('blue-active');
      expect(result.alertMessage).toBeNull();
    });

    it('does not change startDay when moving from red-finished to blue-active', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'red-finished', startDay: 3 })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 10,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].startDay).toBe(3);
    });

    it('blocks movement when blue-active max WIP would be exceeded', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'blueActive', { min: 0, max: 1 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'red-finished' }),
        createTestCard({ id: createValidCardId('B'), stage: 'blue-active' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('red-finished');
      expect(result.alertMessage).toBe('Cannot move card to Blue Active: Max WIP limit of 1 would be exceeded.');
    });

    it('blocks movement when red-finished min WIP would be violated', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'redFinished', { min: 1, max: 0 });
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'red-finished' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('red-finished');
      expect(result.alertMessage).toBe('Cannot move card out of Red Finished: Min WIP limit of 1 would be violated.');
    });
  });

  describe('Movement from Blue-Finished to Green', () => {
    it('moves card from blue-finished to green when WIP allows', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'blue-finished' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('green');
      expect(result.alertMessage).toBeNull();
    });

    it('does not change startDay when moving from blue-finished to green', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'blue-finished', startDay: 2 })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 15,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].startDay).toBe(2);
    });

    it('blocks movement when green max WIP would be exceeded', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'green', { min: 0, max: 2 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'blue-finished' }),
        createTestCard({ id: createValidCardId('B'), stage: 'green' }),
        createTestCard({ id: createValidCardId('C'), stage: 'green' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('blue-finished');
      expect(result.alertMessage).toBe('Cannot move card to Green Activities: Max WIP limit of 2 would be exceeded.');
    });

    it('blocks movement when blue-finished min WIP would be violated', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'blueFinished', { min: 1, max: 0 });
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'blue-finished' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('blue-finished');
      expect(result.alertMessage).toBe('Cannot move card out of Blue Finished: Min WIP limit of 1 would be violated.');
    });
  });

  describe('Non-Clickable Stages', () => {
    it('does not move cards in red-active', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'red-active' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('does not move cards in blue-active', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'blue-active' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('blue-active');
      expect(result.alertMessage).toBeNull();
    });

    it('does not move cards in green', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'green' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('green');
      expect(result.alertMessage).toBeNull();
    });

    it('does not move cards in done', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'done' })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].stage).toBe('done');
      expect(result.alertMessage).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('returns unchanged cards when card id not found', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options' })];
      const result = moveCard({
        cardId: createValidCardId('B'),
        cards,
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards).toEqual(cards);
      expect(result.alertMessage).toBeNull();
    });

    it('handles empty cards array', () => {
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards: [],
        currentDay: 5,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards).toEqual([]);
      expect(result.alertMessage).toBeNull();
    });

    it('preserves other card properties when moving', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        stage: 'options',
        content: 'Important card',
        age: 5,
        isBlocked: false,
        workItems: {
          red: { total: 10, completed: 3 },
          blue: { total: 8, completed: 0 },
          green: { total: 6, completed: 0 },
        },
        assignedWorkers: [{ id: 'w1', type: 'red' }],
      })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 15,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].content).toBe('Important card');
      expect(result.cards[0].age).toBe(5);
      expect(result.cards[0].isBlocked).toBe(false);
      expect(result.cards[0].workItems.red.completed).toBe(3);
      expect(result.cards[0].assignedWorkers).toHaveLength(1);
    });

    it('allows movement when WIP is at limit minus one', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'redActive', { min: 0, max: 2 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'red-active' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('blocks movement when WIP is exactly at limit', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'redActive', { min: 0, max: 1 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'red-active' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toContain('Max WIP limit');
    });

    it('allows movement when min WIP count is above minimum', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'options', { min: 1, max: 0 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'options' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('blocks movement when count equals min WIP (would go below)', () => {
      const wipLimits = WipLimits.withColumnLimit(WipLimits.empty(), 'options', { min: 2, max: 0 });
      const cards = [
        createTestCard({ id: createValidCardId('A'), stage: 'options' }),
        createTestCard({ id: createValidCardId('B'), stage: 'options' }),
      ];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 5,
        wipLimits,
      });

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toContain('Min WIP limit');
    });

    it('overwrites startDay when card with existing startDay enters red-active', () => {
      const cards = [createTestCard({ id: createValidCardId('A'), stage: 'options', startDay: 3 })];
      const result = moveCard({
        cardId: createValidCardId('A'),
        cards,
        currentDay: 10,
        wipLimits: WipLimits.empty(),
      });

      expect(result.cards[0].startDay).toBe(10);
    });
  });
});
