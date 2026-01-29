import { describe, it, expect } from 'vitest';
import { assignWorker } from './assign-worker';
import { createTestCard, createTestWorker, createValidCardId } from './test-fixtures';

describe('AssignWorkerUseCase', () => {
  describe('Basic Assignment', () => {
    it('assigns a worker to a card', () => {
      const cards = [createTestCard({ id: createValidCardId('A') })];
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(1);
      expect(result.cards[0].assignedWorkers[0].id).toBe('w1');
      expect(result.cards[0].assignedWorkers[0].type).toBe('red');
    });

    it('preserves other card properties when assigning', () => {
      const cards = [createTestCard({
        id: createValidCardId('A'),
        content: 'Important card',
        stage: 'blue-active',
        age: 5,
        isBlocked: false,
      })];
      const workers = [createTestWorker('w1', 'blue')];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards[0].content).toBe('Important card');
      expect(result.cards[0].stage).toBe('blue-active');
      expect(result.cards[0].age).toBe(5);
      expect(result.cards[0].isBlocked).toBe(false);
    });

    it('does not modify other cards when assigning', () => {
      const cards = [
        createTestCard({ id: createValidCardId('A') }),
        createTestCard({ id: createValidCardId('B'), stage: 'green' }),
      ];
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(1);
      expect(result.cards[1].assignedWorkers).toHaveLength(0);
    });
  });

  describe('Reassignment', () => {
    it('removes worker from previous card when reassigning', () => {
      const cards = [
        createTestCard({
          id: createValidCardId('A'),
          assignedWorkers: [{ id: 'w1', type: 'red' }],
        }),
        createTestCard({ id: createValidCardId('B') }),
      ];
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('B'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(0);
      expect(result.cards[1].assignedWorkers).toHaveLength(1);
      expect(result.cards[1].assignedWorkers[0].id).toBe('w1');
    });

    it('handles worker already assigned to target card', () => {
      const cards = [
        createTestCard({
          id: createValidCardId('A'),
          assignedWorkers: [{ id: 'w1', type: 'red' }],
        }),
      ];
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(1);
      expect(result.cards[0].assignedWorkers[0].id).toBe('w1');
    });
  });

  describe('Maximum Workers Limit', () => {
    it('does not assign more than 3 workers to a card', () => {
      const cards = [
        createTestCard({
          id: createValidCardId('A'),
          assignedWorkers: [
            { id: 'w1', type: 'red' },
            { id: 'w2', type: 'blue' },
            { id: 'w3', type: 'green' },
          ],
        }),
      ];
      const workers = [
        createTestWorker('w1', 'red'),
        createTestWorker('w2', 'blue'),
        createTestWorker('w3', 'green'),
        createTestWorker('w4', 'red'),
      ];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w4',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(3);
      expect(result.cards[0].assignedWorkers.some(w => w.id === 'w4')).toBe(false);
    });

    it('allows assignment when card has fewer than 3 workers', () => {
      const cards = [
        createTestCard({
          id: createValidCardId('A'),
          assignedWorkers: [
            { id: 'w1', type: 'red' },
            { id: 'w2', type: 'blue' },
          ],
        }),
      ];
      const workers = [
        createTestWorker('w1', 'red'),
        createTestWorker('w2', 'blue'),
        createTestWorker('w3', 'green'),
      ];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w3',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(3);
      expect(result.cards[0].assignedWorkers[2].id).toBe('w3');
    });
  });

  describe('Edge Cases', () => {
    it('returns unchanged cards when worker not found', () => {
      const cards = [createTestCard({ id: createValidCardId('A') })];
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'nonexistent',
        cards,
        workers,
      });

      expect(result.cards).toEqual(cards);
    });

    it('returns unchanged cards when card not found', () => {
      const cards = [createTestCard({ id: createValidCardId('A') })];
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('B'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards).toEqual(cards);
    });

    it('handles empty cards array', () => {
      const workers = [createTestWorker('w1', 'red')];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w1',
        cards: [],
        workers,
      });

      expect(result.cards).toEqual([]);
    });

    it('handles empty workers array', () => {
      const cards = [createTestCard({ id: createValidCardId('A') })];
      const result = assignWorker({
        cardId: createValidCardId('A'),
        workerId: 'w1',
        cards,
        workers: [],
      });

      expect(result.cards).toEqual(cards);
    });
  });

  describe('Multiple Cards with Assigned Workers', () => {
    it('only removes worker from the card it was assigned to', () => {
      const cards = [
        createTestCard({
          id: createValidCardId('A'),
          assignedWorkers: [{ id: 'w1', type: 'red' }],
        }),
        createTestCard({
          id: createValidCardId('B'),
          assignedWorkers: [{ id: 'w2', type: 'blue' }],
        }),
        createTestCard({ id: createValidCardId('C') }),
      ];
      const workers = [
        createTestWorker('w1', 'red'),
        createTestWorker('w2', 'blue'),
      ];
      const result = assignWorker({
        cardId: createValidCardId('C'),
        workerId: 'w1',
        cards,
        workers,
      });

      expect(result.cards[0].assignedWorkers).toHaveLength(0);
      expect(result.cards[1].assignedWorkers).toHaveLength(1);
      expect(result.cards[1].assignedWorkers[0].id).toBe('w2');
      expect(result.cards[2].assignedWorkers).toHaveLength(1);
      expect(result.cards[2].assignedWorkers[0].id).toBe('w1');
    });
  });
});
