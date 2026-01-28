import { describe, it, expect } from 'vitest';
import { CardFactory } from './card-factory';
import type { Card } from './card';
import { createValidCardId } from './card-test-fixtures';

describe('CardFactory', () => {
  describe('create', () => {
    it('creates a card with the given ID', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.id).toBe(id);
    });

    it('creates a card in options stage', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.stage).toBe('options');
    });

    it('creates a card with age 0', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.age).toBe(0);
    });

    it('creates a card with startDay set to currentDay', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 42 });

      expect(card.startDay).toBe(42);
    });

    it('creates a card that is not blocked', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.isBlocked).toBe(false);
    });

    it('creates a card with no assigned workers', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.assignedWorkers).toEqual([]);
    });

    it('creates a card with null completionDay', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.completionDay).toBeNull();
    });
  });

  describe('random work items (1-8 range per color)', () => {
    it('generates work items with 0 completed', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({ id, currentDay: 1 });

      expect(card.workItems.red.completed).toBe(0);
      expect(card.workItems.blue.completed).toBe(0);
      expect(card.workItems.green.completed).toBe(0);
    });

    it('uses injected random function for work items', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0,
      });

      expect(card.workItems.red.total).toBe(1);
      expect(card.workItems.blue.total).toBe(1);
      expect(card.workItems.green.total).toBe(1);
    });

    it('returns minimum (1) when random returns 0', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0,
      });

      expect(card.workItems.red.total).toBe(1);
      expect(card.workItems.blue.total).toBe(1);
      expect(card.workItems.green.total).toBe(1);
    });

    it('returns maximum (8) when random returns 0.999', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0.999,
      });

      expect(card.workItems.red.total).toBe(8);
      expect(card.workItems.blue.total).toBe(8);
      expect(card.workItems.green.total).toBe(8);
    });

    it('returns middle values for middle random values', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0.5,
      });

      expect(card.workItems.red.total).toBe(5);
      expect(card.workItems.blue.total).toBe(5);
      expect(card.workItems.green.total).toBe(5);
    });
  });

  describe('random content generation', () => {
    it('uses injected random function for content', () => {
      const id = createValidCardId('A');
      const card = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0,
      });

      expect(card.content).toBe('Create user interface');
    });

    it('generates different content for different random values', () => {
      const id = createValidCardId('A');

      const card1 = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0,
      });

      const card2 = CardFactory.create({
        id,
        currentDay: 1,
        random: () => 0.999,
      });

      expect(card1.content).not.toBe(card2.content);
    });
  });

  describe('nextId', () => {
    it('generates A for empty card list', () => {
      const nextId = CardFactory.nextId([]);
      expect(nextId).toBe('A');
    });

    it('generates B when A exists', () => {
      const cardA = createMinimalCard('A');
      const nextId = CardFactory.nextId([cardA]);
      expect(nextId).toBe('B');
    });

    it('generates C when A and B exist', () => {
      const cards = [createMinimalCard('A'), createMinimalCard('B')];
      const nextId = CardFactory.nextId(cards);
      expect(nextId).toBe('C');
    });

    it('generates AA when Z exists', () => {
      const cardZ = createMinimalCard('Z');
      const nextId = CardFactory.nextId([cardZ]);
      expect(nextId).toBe('AA');
    });

    it('generates AB when AA exists', () => {
      const cardAA = createMinimalCard('AA');
      const nextId = CardFactory.nextId([cardAA]);
      expect(nextId).toBe('AB');
    });

    it('finds highest ID regardless of order', () => {
      const cards = [
        createMinimalCard('C'),
        createMinimalCard('A'),
        createMinimalCard('B'),
      ];
      const nextId = CardFactory.nextId(cards);
      expect(nextId).toBe('D');
    });

    it('handles multi-letter IDs correctly', () => {
      const cards = [
        createMinimalCard('A'),
        createMinimalCard('AA'),
        createMinimalCard('B'),
      ];
      const nextId = CardFactory.nextId(cards);
      expect(nextId).toBe('AB');
    });
  });
});

function createMinimalCard(id: string): Card {
  return {
    id: createValidCardId(id),
    content: 'Test',
    stage: 'options',
    age: 0,
    workItems: {
      red: { total: 1, completed: 0 },
      blue: { total: 1, completed: 0 },
      green: { total: 1, completed: 0 },
    },
    isBlocked: false,
    startDay: 0,
    completionDay: null,
    assignedWorkers: [],
  };
}
