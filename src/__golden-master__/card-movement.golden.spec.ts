/**
 * Golden Master Tests for Card Movement
 *
 * These tests capture the CURRENT behavior of the handleCardClick() function in App.tsx.
 * They serve as a safety net during refactoring - any failing test indicates a
 * behavioral change that must be either intentional (document as bug fix) or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.5
 */
import { describe, it, expect } from 'vitest';

// Types duplicated from App.tsx for golden master isolation
interface WorkItemsType {
  red: { total: number; completed: number };
  blue: { total: number; completed: number };
  green: { total: number; completed: number };
}

interface AssignedWorker {
  id: string;
  type: 'red' | 'blue' | 'green';
}

interface Card {
  id: string;
  content: string;
  stage: string;
  age: number;
  startDay: number;
  isBlocked: boolean;
  workItems: WorkItemsType;
  assignedWorkers: AssignedWorker[];
  completionDay?: number;
}

interface WipLimits {
  options: { min: number; max: number };
  redActive: { min: number; max: number };
  redFinished: { min: number; max: number };
  blueActive: { min: number; max: number };
  blueFinished: { min: number; max: number };
  green: { min: number; max: number };
  done: { min: number; max: number };
}

interface MoveResult {
  cards: Card[];
  alertMessage: string | null;
}

// Helper functions duplicated from App.tsx - DO NOT MODIFY
const getColumnKey = (stage: string): keyof WipLimits => {
  if (stage === 'options') return 'options';
  if (stage === 'red-active') return 'redActive';
  if (stage === 'red-finished') return 'redFinished';
  if (stage === 'blue-active') return 'blueActive';
  if (stage === 'blue-finished') return 'blueFinished';
  if (stage === 'green') return 'green';
  if (stage === 'done') return 'done';
  return 'options';
};

const wouldExceedWipLimit = (
  targetStage: string,
  cards: Card[],
  wipLimits: WipLimits
): boolean => {
  const columnKey = getColumnKey(targetStage);
  const maxWip = wipLimits[columnKey].max;
  if (maxWip === 0) return false;
  const cardsInColumn = cards.filter(card => card.stage === targetStage).length;
  return cardsInColumn >= maxWip;
};

const wouldViolateMinWipLimit = (
  sourceStage: string,
  cards: Card[],
  wipLimits: WipLimits
): boolean => {
  const columnKey = getColumnKey(sourceStage);
  const minWip = wipLimits[columnKey].min;
  if (minWip === 0) return false;
  const cardsInColumn = cards.filter(card => card.stage === sourceStage).length;
  return cardsInColumn <= minWip;
};

// Core moveCard logic extracted from handleCardClick() in App.tsx lines 518-590
// DO NOT MODIFY - this captures the exact current behavior
const moveCard = (
  cardId: string,
  cards: Card[],
  currentDay: number,
  wipLimits: WipLimits
): MoveResult => {
  const clickedCard = cards.find(card => card.id === cardId);
  if (!clickedCard) {
    return { cards, alertMessage: null };
  }

  if (clickedCard.stage === 'options') {
    if (wouldExceedWipLimit('red-active', cards, wipLimits)) {
      return {
        cards,
        alertMessage: `Cannot move card to Red Active: Max WIP limit of ${wipLimits.redActive.max} would be exceeded.`
      };
    }

    if (wouldViolateMinWipLimit('options', cards, wipLimits)) {
      return {
        cards,
        alertMessage: `Cannot move card out of Options: Min WIP limit of ${wipLimits.options.min} would be violated.`
      };
    }

    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return { ...card, stage: 'red-active', startDay: currentDay };
      }
      return card;
    });
    return { cards: updatedCards, alertMessage: null };

  } else if (clickedCard.stage === 'red-finished') {
    if (wouldExceedWipLimit('blue-active', cards, wipLimits)) {
      return {
        cards,
        alertMessage: `Cannot move card to Blue Active: Max WIP limit of ${wipLimits.blueActive.max} would be exceeded.`
      };
    }

    if (wouldViolateMinWipLimit('red-finished', cards, wipLimits)) {
      return {
        cards,
        alertMessage: `Cannot move card out of Red Finished: Min WIP limit of ${wipLimits.redFinished.min} would be violated.`
      };
    }

    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return { ...card, stage: 'blue-active' };
      }
      return card;
    });
    return { cards: updatedCards, alertMessage: null };

  } else if (clickedCard.stage === 'blue-finished') {
    if (wouldExceedWipLimit('green', cards, wipLimits)) {
      return {
        cards,
        alertMessage: `Cannot move card to Green Activities: Max WIP limit of ${wipLimits.green.max} would be exceeded.`
      };
    }

    if (wouldViolateMinWipLimit('blue-finished', cards, wipLimits)) {
      return {
        cards,
        alertMessage: `Cannot move card out of Blue Finished: Min WIP limit of ${wipLimits.blueFinished.min} would be violated.`
      };
    }

    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return { ...card, stage: 'green' };
      }
      return card;
    });
    return { cards: updatedCards, alertMessage: null };
  }

  // Non-clickable stages: red-active, blue-active, green, done
  return { cards, alertMessage: null };
};

// Test fixtures
const createCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'A',
  content: 'Test card',
  stage: 'options',
  age: 0,
  startDay: 0,
  isBlocked: false,
  workItems: {
    red: { total: 5, completed: 0 },
    blue: { total: 5, completed: 0 },
    green: { total: 5, completed: 0 },
  },
  assignedWorkers: [],
  ...overrides,
});

const createDefaultWipLimits = (): WipLimits => ({
  options: { min: 0, max: 0 },
  redActive: { min: 0, max: 0 },
  redFinished: { min: 0, max: 0 },
  blueActive: { min: 0, max: 0 },
  blueFinished: { min: 0, max: 0 },
  green: { min: 0, max: 0 },
  done: { min: 0, max: 0 },
});

describe('Golden Master: Card Movement (handleCardClick)', () => {
  describe('Movement from Options to Red-Active', () => {
    it('moves card from options to red-active when WIP allows', () => {
      const cards = [createCard({ id: 'A', stage: 'options' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('sets startDay to currentDay when moving to red-active', () => {
      const cards = [createCard({ id: 'A', stage: 'options', startDay: 0 })];
      const result = moveCard('A', cards, 10, createDefaultWipLimits());

      expect(result.cards[0].startDay).toBe(10);
    });

    it('preserves startDay on other cards when moving one card', () => {
      const cards = [
        createCard({ id: 'A', stage: 'options', startDay: 0 }),
        createCard({ id: 'B', stage: 'red-active', startDay: 3 }),
      ];
      const result = moveCard('A', cards, 10, createDefaultWipLimits());

      expect(result.cards[1].startDay).toBe(3);
    });

    it('blocks movement when red-active max WIP would be exceeded', () => {
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 0, max: 2 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-active' }),
        createCard({ id: 'C', stage: 'red-active' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toBe('Cannot move card to Red Active: Max WIP limit of 2 would be exceeded.');
    });

    it('blocks movement when options min WIP would be violated', () => {
      const wipLimits = { ...createDefaultWipLimits(), options: { min: 1, max: 0 } };
      const cards = [createCard({ id: 'A', stage: 'options' })];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toBe('Cannot move card out of Options: Min WIP limit of 1 would be violated.');
    });

    it('checks max WIP before min WIP', () => {
      // When both would fail, max WIP is checked first
      const wipLimits = {
        ...createDefaultWipLimits(),
        options: { min: 1, max: 0 },
        redActive: { min: 0, max: 1 }
      };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-active' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.alertMessage).toBe('Cannot move card to Red Active: Max WIP limit of 1 would be exceeded.');
    });
  });

  describe('Movement from Red-Finished to Blue-Active', () => {
    it('moves card from red-finished to blue-active when WIP allows', () => {
      const cards = [createCard({ id: 'A', stage: 'red-finished' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('blue-active');
      expect(result.alertMessage).toBeNull();
    });

    it('does not change startDay when moving from red-finished to blue-active', () => {
      const cards = [createCard({ id: 'A', stage: 'red-finished', startDay: 3 })];
      const result = moveCard('A', cards, 10, createDefaultWipLimits());

      expect(result.cards[0].startDay).toBe(3);
    });

    it('blocks movement when blue-active max WIP would be exceeded', () => {
      const wipLimits = { ...createDefaultWipLimits(), blueActive: { min: 0, max: 1 } };
      const cards = [
        createCard({ id: 'A', stage: 'red-finished' }),
        createCard({ id: 'B', stage: 'blue-active' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('red-finished');
      expect(result.alertMessage).toBe('Cannot move card to Blue Active: Max WIP limit of 1 would be exceeded.');
    });

    it('blocks movement when red-finished min WIP would be violated', () => {
      const wipLimits = { ...createDefaultWipLimits(), redFinished: { min: 1, max: 0 } };
      const cards = [createCard({ id: 'A', stage: 'red-finished' })];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('red-finished');
      expect(result.alertMessage).toBe('Cannot move card out of Red Finished: Min WIP limit of 1 would be violated.');
    });
  });

  describe('Movement from Blue-Finished to Green', () => {
    it('moves card from blue-finished to green when WIP allows', () => {
      const cards = [createCard({ id: 'A', stage: 'blue-finished' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('green');
      expect(result.alertMessage).toBeNull();
    });

    it('does not change startDay when moving from blue-finished to green', () => {
      const cards = [createCard({ id: 'A', stage: 'blue-finished', startDay: 2 })];
      const result = moveCard('A', cards, 15, createDefaultWipLimits());

      expect(result.cards[0].startDay).toBe(2);
    });

    it('blocks movement when green max WIP would be exceeded', () => {
      const wipLimits = { ...createDefaultWipLimits(), green: { min: 0, max: 2 } };
      const cards = [
        createCard({ id: 'A', stage: 'blue-finished' }),
        createCard({ id: 'B', stage: 'green' }),
        createCard({ id: 'C', stage: 'green' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('blue-finished');
      expect(result.alertMessage).toBe('Cannot move card to Green Activities: Max WIP limit of 2 would be exceeded.');
    });

    it('blocks movement when blue-finished min WIP would be violated', () => {
      const wipLimits = { ...createDefaultWipLimits(), blueFinished: { min: 1, max: 0 } };
      const cards = [createCard({ id: 'A', stage: 'blue-finished' })];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('blue-finished');
      expect(result.alertMessage).toBe('Cannot move card out of Blue Finished: Min WIP limit of 1 would be violated.');
    });
  });

  describe('Non-Clickable Stages', () => {
    it('does not move cards in red-active', () => {
      const cards = [createCard({ id: 'A', stage: 'red-active' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('does not move cards in blue-active', () => {
      const cards = [createCard({ id: 'A', stage: 'blue-active' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('blue-active');
      expect(result.alertMessage).toBeNull();
    });

    it('does not move cards in green', () => {
      const cards = [createCard({ id: 'A', stage: 'green' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('green');
      expect(result.alertMessage).toBeNull();
    });

    it('does not move cards in done', () => {
      const cards = [createCard({ id: 'A', stage: 'done' })];
      const result = moveCard('A', cards, 5, createDefaultWipLimits());

      expect(result.cards[0].stage).toBe('done');
      expect(result.alertMessage).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('returns unchanged cards when card id not found', () => {
      const cards = [createCard({ id: 'A', stage: 'options' })];
      const result = moveCard('B', cards, 5, createDefaultWipLimits());

      expect(result.cards).toEqual(cards);
      expect(result.alertMessage).toBeNull();
    });

    it('handles empty cards array', () => {
      const result = moveCard('A', [], 5, createDefaultWipLimits());

      expect(result.cards).toEqual([]);
      expect(result.alertMessage).toBeNull();
    });

    it('preserves other card properties when moving', () => {
      const cards = [createCard({
        id: 'A',
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
      const result = moveCard('A', cards, 15, createDefaultWipLimits());

      expect(result.cards[0].content).toBe('Important card');
      expect(result.cards[0].age).toBe(5);
      expect(result.cards[0].isBlocked).toBe(false);
      expect(result.cards[0].workItems.red.completed).toBe(3);
      expect(result.cards[0].assignedWorkers).toHaveLength(1);
    });

    it('allows movement when WIP is at limit minus one', () => {
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 0, max: 2 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-active' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('blocks movement when WIP is exactly at limit', () => {
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 0, max: 1 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-active' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toContain('Max WIP limit');
    });

    it('allows movement when min WIP count is above minimum', () => {
      const wipLimits = { ...createDefaultWipLimits(), options: { min: 1, max: 0 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('red-active');
      expect(result.alertMessage).toBeNull();
    });

    it('blocks movement when count equals min WIP (would go below)', () => {
      const wipLimits = { ...createDefaultWipLimits(), options: { min: 2, max: 0 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);

      expect(result.cards[0].stage).toBe('options');
      expect(result.alertMessage).toContain('Min WIP limit');
    });

    it('overwrites startDay when card with existing startDay enters red-active', () => {
      // Simulates a card that already has a startDay (perhaps from a previous entry)
      const cards = [createCard({ id: 'A', stage: 'options', startDay: 3 })];
      const result = moveCard('A', cards, 10, createDefaultWipLimits());

      // Current behavior: startDay is always set to currentDay when entering red-active
      expect(result.cards[0].startDay).toBe(10);
    });

    it('handles sequential moves of multiple cards in same day', () => {
      // Move first card
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
        createCard({ id: 'C', stage: 'red-finished' }),
      ];
      const result1 = moveCard('A', cards, 5, createDefaultWipLimits());

      // Move second card using result from first move
      const result2 = moveCard('B', result1.cards, 5, createDefaultWipLimits());

      // Move third card using result from second move
      const result3 = moveCard('C', result2.cards, 5, createDefaultWipLimits());

      expect(result3.cards[0].stage).toBe('red-active');
      expect(result3.cards[0].startDay).toBe(5);
      expect(result3.cards[1].stage).toBe('red-active');
      expect(result3.cards[1].startDay).toBe(5);
      expect(result3.cards[2].stage).toBe('blue-active');
    });

    it('respects WIP limits during sequential same-day moves', () => {
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 0, max: 2 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
        createCard({ id: 'C', stage: 'options' }),
      ];

      // First move succeeds
      const result1 = moveCard('A', cards, 5, wipLimits);
      expect(result1.cards[0].stage).toBe('red-active');
      expect(result1.alertMessage).toBeNull();

      // Second move succeeds (now at limit)
      const result2 = moveCard('B', result1.cards, 5, wipLimits);
      expect(result2.cards[1].stage).toBe('red-active');
      expect(result2.alertMessage).toBeNull();

      // Third move blocked (would exceed limit)
      const result3 = moveCard('C', result2.cards, 5, wipLimits);
      expect(result3.cards[2].stage).toBe('options');
      expect(result3.alertMessage).toContain('Max WIP limit');
    });
  });

  describe('Snapshot Tests for Complex Scenarios', () => {
    it('captures movement with multiple cards in different stages', () => {
      const cards = [
        createCard({ id: 'A', stage: 'options', startDay: 0 }),
        createCard({ id: 'B', stage: 'red-active', startDay: 2 }),
        createCard({ id: 'C', stage: 'red-finished', startDay: 1 }),
        createCard({ id: 'D', stage: 'blue-active', startDay: 3 }),
        createCard({ id: 'E', stage: 'done', startDay: 1, completionDay: 8 }),
      ];
      const result = moveCard('A', cards, 10, createDefaultWipLimits());
      expect(result).toMatchSnapshot();
    });

    it('captures blocked movement scenario', () => {
      const wipLimits = {
        ...createDefaultWipLimits(),
        redActive: { min: 0, max: 1 },
      };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-active' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);
      expect(result).toMatchSnapshot();
    });

    it('captures min WIP violation scenario', () => {
      const wipLimits = {
        ...createDefaultWipLimits(),
        redFinished: { min: 2, max: 0 },
      };
      const cards = [
        createCard({ id: 'A', stage: 'red-finished' }),
        createCard({ id: 'B', stage: 'red-finished' }),
      ];
      const result = moveCard('A', cards, 5, wipLimits);
      expect(result).toMatchSnapshot();
    });
  });
});
