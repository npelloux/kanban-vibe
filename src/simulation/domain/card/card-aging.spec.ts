import { describe, it, expect } from 'vitest';
import { CardAgingService } from './card-aging';
import { Card, type Card as CardType } from './card';
import { CardId } from './card-id';
import type { WorkItems } from './work-items';

function buildCard(
  stage: CardType['stage'],
  age: number = 0,
  id: string = 'TEST'
): CardType {
  const cardId = CardId.create(id);
  if (!cardId) throw new Error(`Invalid test card ID: ${id}`);

  const workItems: WorkItems = {
    red: { total: 3, completed: 0 },
    blue: { total: 3, completed: 0 },
    green: { total: 3, completed: 0 },
  };

  return Card.create({
    id: cardId,
    content: 'Test Card',
    stage,
    age,
    workItems,
    isBlocked: false,
    startDay: 1,
    completionDay: null,
    assignedWorkers: [],
  });
}

describe('CardAgingService', () => {
  describe('ageCard', () => {
    it('should not age cards in options stage', () => {
      const card = buildCard('options', 5);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(5); // Age should remain unchanged
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should not age cards in done stage', () => {
      const card = buildCard('done', 10);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(10); // Age should remain unchanged
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should age cards in red-active stage by 1', () => {
      const card = buildCard('red-active', 3);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(4); // Age should increment by 1
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should age cards in red-finished stage by 1', () => {
      const card = buildCard('red-finished', 7);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(8); // Age should increment by 1
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should age cards in blue-active stage by 1', () => {
      const card = buildCard('blue-active', 2);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(3); // Age should increment by 1
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should age cards in blue-finished stage by 1', () => {
      const card = buildCard('blue-finished', 6);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(7); // Age should increment by 1
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should age cards in green stage by 1', () => {
      const card = buildCard('green', 4);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(5); // Age should increment by 1
      expect(result).not.toBe(card); // Should return new instance
    });

    it('should preserve all other card properties', () => {
      const cardId = CardId.create('PRESERVE');
      if (!cardId) throw new Error('Invalid test card ID: PRESERVE');

      const workItems: WorkItems = {
        red: { total: 3, completed: 0 },
        blue: { total: 3, completed: 0 },
        green: { total: 3, completed: 0 },
      };

      const originalCard = Card.create({
        id: cardId,
        content: 'Important content',
        stage: 'red-active',
        age: 3,
        workItems,
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

    it('should handle cards with age 0', () => {
      const card = buildCard('red-active', 0);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(1);
    });
  });

  describe('ageCards', () => {
    it('should age all cards according to their stage rules', () => {
      const cards = [
        buildCard('options', 5, 'CARDA'),
        buildCard('red-active', 3, 'CARDB'),
        buildCard('done', 10, 'CARDC'),
        buildCard('blue-finished', 6, 'CARDD'),
        buildCard('green', 4, 'CARDE'),
      ];

      const result = CardAgingService.ageCards(cards);

      expect(result).toHaveLength(5);
      expect(result[0].age).toBe(5); // options - no aging
      expect(result[1].age).toBe(4); // red-active - aged by 1
      expect(result[2].age).toBe(10); // done - no aging
      expect(result[3].age).toBe(7); // blue-finished - aged by 1
      expect(result[4].age).toBe(5); // green - aged by 1
    });

    it('should return new array with new card instances', () => {
      const cards = [
        buildCard('red-active', 1, 'CARDA'),
        buildCard('options', 2, 'CARDB'),
      ];

      const result = CardAgingService.ageCards(cards);

      expect(result).not.toBe(cards); // Should be new array
      expect(result[0]).not.toBe(cards[0]); // Should be new card instances
      expect(result[1]).not.toBe(cards[1]); // Should be new card instances
    });

    it('should handle empty array', () => {
      const result = CardAgingService.ageCards([]);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle single card', () => {
      const card = buildCard('blue-active', 7);

      const result = CardAgingService.ageCards([card]);

      expect(result).toHaveLength(1);
      expect(result[0].age).toBe(8);
      expect(result[0]).not.toBe(card);
    });
  });

  describe('edge cases', () => {
    it('should handle very large age values', () => {
      const card = buildCard('red-active', 999999);

      const result = CardAgingService.ageCard(card);

      expect(result.age).toBe(1000000);
    });

    it('should handle aging multiple cards with same stage', () => {
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