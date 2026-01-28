import { describe, it, expect } from 'vitest';
import { CardAgingService } from './card-aging';
import type { Card as CardType } from './card';
import { createTestCardWithId } from './card-test-fixtures';

function buildCard(
  stage: CardType['stage'],
  age: number = 0,
  id: string = 'TEST'
): CardType {
  return createTestCardWithId(id, {
    stage,
    age,
    workItems: {
      red: { total: 3, completed: 0 },
      blue: { total: 3, completed: 0 },
      green: { total: 3, completed: 0 },
    },
  });
}

describe('CardAgingService', () => {
  describe('ageCard', () => {
    it('preserves age when card is in options stage', () => {
      const card = buildCard('options', 5);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(5);
      expect(result).not.toBe(card);
    });

    it('preserves age when card is in done stage', () => {
      const card = buildCard('done', 10);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(10);
      expect(result).not.toBe(card);
    });

    it('increments age by 1 when card is in red-active stage', () => {
      const card = buildCard('red-active', 3);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(4);
      expect(result).not.toBe(card);
    });

    it('increments age by 1 when card is in red-finished stage', () => {
      const card = buildCard('red-finished', 7);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(8);
      expect(result).not.toBe(card);
    });

    it('increments age by 1 when card is in blue-active stage', () => {
      const card = buildCard('blue-active', 2);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(3);
      expect(result).not.toBe(card);
    });

    it('increments age by 1 when card is in blue-finished stage', () => {
      const card = buildCard('blue-finished', 6);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(7);
      expect(result).not.toBe(card);
    });

    it('increments age by 1 when card is in green stage', () => {
      const card = buildCard('green', 4);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(5);
      expect(result).not.toBe(card);
    });

    it('preserves all other card properties', () => {
      const originalCard = createTestCardWithId('PRESERVE', {
        content: 'Important content',
        stage: 'red-active',
        age: 3,
        workItems: {
          red: { total: 3, completed: 0 },
          blue: { total: 3, completed: 0 },
          green: { total: 3, completed: 0 },
        },
        isBlocked: true,
        startDay: 42,
        completionDay: 100,
        assignedWorkers: [{ type: 'red', id: 'w1' }],
      });

      const result = CardAgingService.ageCard(originalCard);

      expect(result.id).toBe(originalCard.id);
      expect(result.content).toBe(originalCard.content);
      expect(result.stage).toBe(originalCard.stage);
      expect(result.workItems).toBe(originalCard.workItems);
      expect(result.isBlocked).toBe(originalCard.isBlocked);
      expect(result.startDay).toBe(originalCard.startDay);
      expect(result.completionDay).toBe(originalCard.completionDay);
      expect(result.assignedWorkers).toBe(originalCard.assignedWorkers);
    });

    it('handles cards with age 0', () => {
      const card = buildCard('red-active', 0);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(1);
    });
  });

  describe('ageCards', () => {
    it('ages all cards according to their stage rules', () => {
      const cards = [
        buildCard('options', 5, 'CARDA'),
        buildCard('red-active', 3, 'CARDB'),
        buildCard('done', 10, 'CARDC'),
        buildCard('blue-finished', 6, 'CARDD'),
        buildCard('green', 4, 'CARDE'),
      ];

      const result = CardAgingService.ageCards(cards);

      expect(result).toHaveLength(5);
      expect(result[0].age).toBe(5);
      expect(result[1].age).toBe(4);
      expect(result[2].age).toBe(10);
      expect(result[3].age).toBe(7);
      expect(result[4].age).toBe(5);
    });

    it('returns new array with new card instances', () => {
      const cards = [
        buildCard('red-active', 1, 'CARDA'),
        buildCard('options', 2, 'CARDB'),
      ];

      const result = CardAgingService.ageCards(cards);

      expect(result).not.toBe(cards);
      expect(result[0]).not.toBe(cards[0]);
      expect(result[1]).not.toBe(cards[1]);
    });

    it('handles empty array', () => {
      const result = CardAgingService.ageCards([]);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles single card', () => {
      const card = buildCard('blue-active', 7);

      const result = CardAgingService.ageCards([card]);

      expect(result).toHaveLength(1);
      expect(result[0].age).toBe(8);
      expect(result[0]).not.toBe(card);
    });
  });

  describe('edge cases', () => {
    it('handles very large age values', () => {
      const card = buildCard('red-active', 999999);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(1000000);
    });

    it('handles aging multiple cards with same stage', () => {
      const cards = [
        buildCard('red-active', 1, 'CARDA'),
        buildCard('red-active', 5, 'CARDB'),
        buildCard('red-active', 10, 'CARDC'),
      ];

      const result = CardAgingService.ageCards(cards);

      expect(result[0].age).toBe(2);
      expect(result[1].age).toBe(6);
      expect(result[2].age).toBe(11);
    });
  });
});
