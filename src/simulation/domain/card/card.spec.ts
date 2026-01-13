import { describe, it, expect } from 'vitest';
import { Card, type CardCreateProps } from './card';
import { CardId } from './card-id';

// Temporary type until dependencies are implemented
type WorkerType = 'red' | 'blue' | 'green';

describe('Card', () => {
  const validCardId = CardId.create('A')!;
  const defaultWorkItems = {
    red: { total: 5, completed: 0 },
    blue: { total: 3, completed: 0 },
    green: { total: 2, completed: 0 },
  };

  describe('create', () => {
    it('should create a card with all required properties', () => {
      const props: CardCreateProps = {
        id: validCardId,
        content: 'Test task',
        stage: 'options',
        workItems: defaultWorkItems,
        startDay: 1,
      };

      const card = Card.create(props);

      expect(card.id).toBe(validCardId);
      expect(card.content).toBe('Test task');
      expect(card.stage).toBe('options');
      expect(card.age).toBe(0);
      expect(card.workItems).toEqual(defaultWorkItems);
      expect(card.isBlocked).toBe(false);
      expect(card.startDay).toBe(1);
      expect(card.completionDay).toBeNull();
      expect(card.assignedWorkers).toEqual([]);
    });

    it('should create a card with optional properties', () => {
      const props: CardCreateProps = {
        id: validCardId,
        content: 'Test task',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        age: 5,
        isBlocked: true,
        completionDay: 10,
        assignedWorkers: [{ id: 'bob', type: 'red' as WorkerType }],
      };

      const card = Card.create(props);

      expect(card.age).toBe(5);
      expect(card.isBlocked).toBe(true);
      expect(card.completionDay).toBe(10);
      expect(card.assignedWorkers).toEqual([{ id: 'bob', type: 'red' }]);
    });

    it('should throw error for negative age', () => {
      const props: CardCreateProps = {
        id: validCardId,
        content: 'Test task',
        stage: 'options',
        workItems: defaultWorkItems,
        startDay: 1,
        age: -1,
      };

      expect(() => Card.create(props)).toThrow('Age cannot be negative');
    });

    it('should throw error for more than 3 assigned workers', () => {
      const props: CardCreateProps = {
        id: validCardId,
        content: 'Test task',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        assignedWorkers: [
          { id: 'w1', type: 'red' as WorkerType },
          { id: 'w2', type: 'red' as WorkerType },
          { id: 'w3', type: 'blue' as WorkerType },
          { id: 'w4', type: 'green' as WorkerType },
        ],
      };

      expect(() => Card.create(props)).toThrow(
        'Cannot assign more than 3 workers to a card'
      );
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const card = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'options',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      // TypeScript should prevent these at compile time
      // These tests verify runtime immutability if spreading
      const cardCopy = { ...card };
      expect(cardCopy.id).toBe(card.id);
      expect(cardCopy.content).toBe(card.content);
    });
  });

  describe('withStage', () => {
    it('should return a new card with updated stage', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'options',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      const updated = Card.withStage(original, 'red-active');

      expect(updated.stage).toBe('red-active');
      expect(updated).not.toBe(original);
      expect(original.stage).toBe('options');
    });
  });

  describe('withAge', () => {
    it('should return a new card with updated age', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        age: 0,
      });

      const updated = Card.withAge(original, 5);

      expect(updated.age).toBe(5);
      expect(updated).not.toBe(original);
      expect(original.age).toBe(0);
    });

    it('should throw error for negative age', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      expect(() => Card.withAge(original, -1)).toThrow('Age cannot be negative');
    });
  });

  describe('withBlocked', () => {
    it('should return a new card with isBlocked set to true', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        isBlocked: false,
      });

      const updated = Card.withBlocked(original, true);

      expect(updated.isBlocked).toBe(true);
      expect(updated).not.toBe(original);
      expect(original.isBlocked).toBe(false);
    });

    it('should return a new card with isBlocked set to false', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        isBlocked: true,
      });

      const updated = Card.withBlocked(original, false);

      expect(updated.isBlocked).toBe(false);
      expect(original.isBlocked).toBe(true);
    });
  });

  describe('withCompletionDay', () => {
    it('should return a new card with completion day set', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'green',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      const updated = Card.withCompletionDay(original, 15);

      expect(updated.completionDay).toBe(15);
      expect(updated).not.toBe(original);
      expect(original.completionDay).toBeNull();
    });
  });

  describe('withWorkItems', () => {
    it('should return a new card with updated work items', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      const newWorkItems = {
        red: { total: 5, completed: 3 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      };

      const updated = Card.withWorkItems(original, newWorkItems);

      expect(updated.workItems.red.completed).toBe(3);
      expect(updated).not.toBe(original);
      expect(original.workItems.red.completed).toBe(0);
    });
  });

  describe('addWorker', () => {
    it('should add a worker to the card', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      const updated = Card.addWorker(original, { id: 'bob', type: 'red' });

      expect(updated.assignedWorkers).toHaveLength(1);
      expect(updated.assignedWorkers[0]).toEqual({ id: 'bob', type: 'red' });
      expect(updated).not.toBe(original);
      expect(original.assignedWorkers).toHaveLength(0);
    });

    it('should add multiple workers up to 3', () => {
      let card = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
      });

      card = Card.addWorker(card, { id: 'w1', type: 'red' });
      card = Card.addWorker(card, { id: 'w2', type: 'blue' });
      card = Card.addWorker(card, { id: 'w3', type: 'green' });

      expect(card.assignedWorkers).toHaveLength(3);
    });

    it('should throw error when adding 4th worker', () => {
      const card = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        assignedWorkers: [
          { id: 'w1', type: 'red' as WorkerType },
          { id: 'w2', type: 'blue' as WorkerType },
          { id: 'w3', type: 'green' as WorkerType },
        ],
      });

      expect(() => Card.addWorker(card, { id: 'w4', type: 'red' })).toThrow(
        'Cannot assign more than 3 workers to a card'
      );
    });
  });

  describe('removeWorker', () => {
    it('should remove a worker from the card', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        assignedWorkers: [
          { id: 'w1', type: 'red' as WorkerType },
          { id: 'w2', type: 'blue' as WorkerType },
        ],
      });

      const updated = Card.removeWorker(original, 'w1');

      expect(updated.assignedWorkers).toHaveLength(1);
      expect(updated.assignedWorkers[0].id).toBe('w2');
      expect(original.assignedWorkers).toHaveLength(2);
    });

    it('should return same structure when worker not found', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        assignedWorkers: [{ id: 'w1', type: 'red' as WorkerType }],
      });

      const updated = Card.removeWorker(original, 'nonexistent');

      expect(updated.assignedWorkers).toHaveLength(1);
    });
  });

  describe('clearWorkers', () => {
    it('should remove all workers from the card', () => {
      const original = Card.create({
        id: validCardId,
        content: 'Test',
        stage: 'red-active',
        workItems: defaultWorkItems,
        startDay: 1,
        assignedWorkers: [
          { id: 'w1', type: 'red' as WorkerType },
          { id: 'w2', type: 'blue' as WorkerType },
        ],
      });

      const updated = Card.clearWorkers(original);

      expect(updated.assignedWorkers).toHaveLength(0);
      expect(original.assignedWorkers).toHaveLength(2);
    });
  });
});
