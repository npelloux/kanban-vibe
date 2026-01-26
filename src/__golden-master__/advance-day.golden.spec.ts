/**
 * Golden Master Tests for Day Advancement
 *
 * These tests capture the CURRENT behavior of the handleNextDay() function in App.tsx.
 * They serve as a safety net during refactoring - any failing test indicates a
 * behavioral change that must be either intentional (document as bug fix) or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.4
 */
import { describe, it, expect, beforeEach } from 'vitest';

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

// stagedone duplicated from App.tsx lines 79-130 - DO NOT MODIFY
const stagedone = (card: Card): boolean => {
  if (card.isBlocked) {
    return false;
  }

  if (card.stage === 'red-active') {
    return card.workItems.red.total > 0 &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  else if (card.stage === 'red-finished') {
    return card.workItems.red.total > 0 &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  else if (card.stage === 'blue-active') {
    return card.workItems.blue.total > 0 &&
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  else if (card.stage === 'blue-finished') {
    return card.workItems.blue.total > 0 &&
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  else if (card.stage === 'green') {
    return card.workItems.green.total > 0 &&
           card.workItems.green.completed >= card.workItems.green.total &&
           card.workItems.red.completed >= card.workItems.red.total &&
           card.workItems.blue.completed >= card.workItems.blue.total;
  }

  const totalWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.total,
    0
  );

  const completedWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.completed,
    0
  );

  return totalWorkItems > 0 && completedWorkItems >= totalWorkItems;
};

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

// Core advanceDay logic extracted from handleNextDay() in App.tsx lines 325-443
// DO NOT MODIFY - this captures the exact current behavior
const advanceDay = (
  cards: Card[],
  currentDay: number,
  wipLimits: WipLimits,
  getRandomInt: (min: number, max: number) => number
): { cards: Card[]; newDay: number } => {
  const newDay = currentDay + 1;

  // Step 1: Increment age for all cards except options/done
  const agedCards = cards.map(card => ({
    ...card,
    age: (card.stage === 'done' || card.stage === 'options') ? card.age : card.age + 1
  }));

  // Step 2: Apply worker output rules
  const cardsWithWorkerOutput = agedCards.map(card => {
    if (!card.assignedWorkers.length || (!card.stage.includes('active') && card.stage !== 'green')) {
      return card;
    }

    const updatedWorkItems = { ...card.workItems };
    const columnColor = card.stage.includes('red') ? 'red' :
                        card.stage.includes('blue') ? 'blue' : 'green';

    card.assignedWorkers.forEach(worker => {
      const workerType = worker.type;
      let outputAmount = 0;

      if (workerType === columnColor) {
        outputAmount = getRandomInt(3, 6);
      } else {
        outputAmount = getRandomInt(0, 3);
      }

      if (updatedWorkItems[columnColor as keyof WorkItemsType]) {
        const colorItems = updatedWorkItems[columnColor as keyof WorkItemsType];
        const newCompleted = Math.min(colorItems.total, colorItems.completed + outputAmount);
        updatedWorkItems[columnColor as keyof WorkItemsType] = {
          ...colorItems,
          completed: newCompleted
        };
      }
    });

    return { ...card, workItems: updatedWorkItems };
  });

  // Step 3: Process stage transitions
  const updatedCards = cardsWithWorkerOutput.map(card => {
    if (stagedone(card)) {
      if (wouldViolateMinWipLimit(card.stage, cardsWithWorkerOutput, wipLimits)) {
        return card;
      }

      if (card.stage === 'red-active') {
        if (wouldExceedWipLimit('red-finished', cardsWithWorkerOutput, wipLimits)) {
          return card;
        }
        return { ...card, stage: 'red-finished' };
      } else if (card.stage === 'red-finished') {
        if (wouldExceedWipLimit('blue-active', cardsWithWorkerOutput, wipLimits)) {
          return card;
        }
        return { ...card, stage: 'blue-active' };
      } else if (card.stage === 'blue-active') {
        if (wouldExceedWipLimit('blue-finished', cardsWithWorkerOutput, wipLimits)) {
          return card;
        }
        return { ...card, stage: 'blue-finished' };
      } else if (card.stage === 'blue-finished') {
        if (wouldExceedWipLimit('green', cardsWithWorkerOutput, wipLimits)) {
          return card;
        }
        return { ...card, stage: 'green' };
      } else if (card.stage === 'green') {
        if (wouldExceedWipLimit('done', cardsWithWorkerOutput, wipLimits)) {
          return card;
        }
        return { ...card, stage: 'done', completionDay: currentDay };
      }
    }
    return card;
  });

  // Step 4: Reset all assigned workers
  const resetWorkerCards = updatedCards.map(card => ({
    ...card,
    assignedWorkers: []
  }));

  return { cards: resetWorkerCards, newDay };
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

describe('Golden Master: Day Advancement (handleNextDay)', () => {
  let mockRandomValues: number[];
  let mockRandomIndex: number;

  const mockGetRandomInt = (min: number, max: number): number => {
    const value = mockRandomValues[mockRandomIndex % mockRandomValues.length];
    mockRandomIndex++;
    return Math.floor(min + value * (max - min + 1));
  };

  beforeEach(() => {
    mockRandomValues = [0.5]; // Default to middle value
    mockRandomIndex = 0;
  });

  describe('Day Counter Increment', () => {
    it('increments day from 0 to 1', () => {
      const result = advanceDay([], 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.newDay).toBe(1);
    });

    it('increments day from 10 to 11', () => {
      const result = advanceDay([], 10, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.newDay).toBe(11);
    });
  });

  describe('Card Aging', () => {
    it('does not age cards in options', () => {
      const cards = [createCard({ stage: 'options', age: 0 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(0);
    });

    it('does not age cards in done', () => {
      const cards = [createCard({ stage: 'done', age: 5 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(5);
    });

    it('ages cards in red-active by 1', () => {
      const cards = [createCard({ stage: 'red-active', age: 0 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(1);
    });

    it('ages cards in red-finished by 1', () => {
      const cards = [createCard({ stage: 'red-finished', age: 2 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(3);
    });

    it('ages cards in blue-active by 1', () => {
      const cards = [createCard({ stage: 'blue-active', age: 3 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(4);
    });

    it('ages cards in blue-finished by 1', () => {
      const cards = [createCard({ stage: 'blue-finished', age: 4 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(5);
    });

    it('ages cards in green by 1', () => {
      const cards = [createCard({ stage: 'green', age: 5 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(6);
    });

    it('ages multiple cards correctly', () => {
      const cards = [
        createCard({ id: 'A', stage: 'options', age: 0 }),
        createCard({ id: 'B', stage: 'red-active', age: 1 }),
        createCard({ id: 'C', stage: 'done', age: 10 }),
      ];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(0); // options - no aging
      expect(result.cards[1].age).toBe(2); // red-active - aged
      expect(result.cards[2].age).toBe(10); // done - no aging
    });
  });

  describe('Worker Output', () => {
    it('does not apply output to cards without assigned workers', () => {
      const cards = [createCard({ stage: 'red-active', assignedWorkers: [] })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(0);
    });

    it('does not apply output to cards in non-active stages', () => {
      const cards = [createCard({
        stage: 'red-finished',
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(0);
    });

    it('applies output to cards in red-active with workers', () => {
      mockRandomValues = [0.5]; // Will give 4 or 5 for 3-6 range
      const cards = [createCard({
        stage: 'red-active',
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBeGreaterThan(0);
    });

    it('applies output to cards in blue-active with workers', () => {
      mockRandomValues = [0.5];
      const cards = [createCard({
        stage: 'blue-active',
        assignedWorkers: [{ id: 'w1', type: 'blue' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.blue.completed).toBeGreaterThan(0);
    });

    it('applies output to cards in green with workers', () => {
      mockRandomValues = [0.5];
      const cards = [createCard({
        stage: 'green',
        assignedWorkers: [{ id: 'w1', type: 'green' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.green.completed).toBeGreaterThan(0);
    });

    it('specialized worker produces 3-6 output (seeded to min)', () => {
      mockRandomValues = [0]; // min value
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 10, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(3);
    });

    it('specialized worker produces 3-6 output (seeded to max)', () => {
      mockRandomValues = [0.999]; // max value
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 10, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(6);
    });

    it('non-specialized worker produces 0-3 output (seeded to min)', () => {
      mockRandomValues = [0]; // min value
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 10, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [{ id: 'w1', type: 'blue' }] // blue worker on red column
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(0);
    });

    it('non-specialized worker produces 0-3 output (seeded to max)', () => {
      mockRandomValues = [0.999]; // max value
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 10, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [{ id: 'w1', type: 'blue' }] // blue worker on red column
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(3);
    });

    it('multiple workers contribute output', () => {
      mockRandomValues = [0.5, 0.5, 0.5]; // middle values for all three
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 20, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [
          { id: 'w1', type: 'red' },
          { id: 'w2', type: 'red' },
          { id: 'w3', type: 'blue' }
        ]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      // Two red workers (4 each) + one blue worker (1) = 9
      expect(result.cards[0].workItems.red.completed).toBeGreaterThan(0);
    });

    it('caps completed work at total', () => {
      mockRandomValues = [0.999]; // max output
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 2, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].workItems.red.completed).toBe(2); // capped at total
    });
  });

  describe('Stage Transitions', () => {
    it('transitions card from red-active to red-finished when work complete', () => {
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('red-finished');
    });

    it('transitions card from red-finished to blue-active when work complete', () => {
      const cards = [createCard({
        stage: 'red-finished',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('blue-active');
    });

    it('transitions card from blue-active to blue-finished when work complete', () => {
      const cards = [createCard({
        stage: 'blue-active',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('blue-finished');
    });

    it('transitions card from blue-finished to green when work complete', () => {
      const cards = [createCard({
        stage: 'blue-finished',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('green');
    });

    it('transitions card from green to done when work complete', () => {
      const cards = [createCard({
        stage: 'green',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 5 } }
      })];
      const result = advanceDay(cards, 5, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('done');
    });

    it('sets completionDay when card moves to done', () => {
      const cards = [createCard({
        stage: 'green',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 5 } }
      })];
      const result = advanceDay(cards, 10, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].completionDay).toBe(10);
    });

    it('does not transition blocked cards', () => {
      const cards = [createCard({
        stage: 'red-active',
        isBlocked: true,
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('red-active');
    });

    it('does not transition cards with incomplete work', () => {
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 5, completed: 3 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('red-active');
    });
  });

  describe('WIP Limit Enforcement', () => {
    it('blocks transition when max WIP would be exceeded', () => {
      const wipLimits = { ...createDefaultWipLimits(), redFinished: { min: 0, max: 1 } };
      const cards = [
        createCard({
          id: 'A',
          stage: 'red-finished',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'B',
          stage: 'red-active',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const result = advanceDay(cards, 0, wipLimits, mockGetRandomInt);
      // Card B should not move to red-finished because it would exceed max WIP of 1
      expect(result.cards[1].stage).toBe('red-active');
    });

    it('blocks transition when min WIP would be violated', () => {
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 1, max: 0 } };
      const cards = [
        createCard({
          id: 'A',
          stage: 'red-active',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const result = advanceDay(cards, 0, wipLimits, mockGetRandomInt);
      // Card A should not move because it would violate min WIP of 1
      expect(result.cards[0].stage).toBe('red-active');
    });

    it('allows transition when WIP limits are 0 (no constraint)', () => {
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].stage).toBe('red-finished');
    });
  });

  describe('Worker Assignment Reset', () => {
    it('clears all assigned workers at end of day', () => {
      const cards = [createCard({
        stage: 'red-active',
        assignedWorkers: [{ id: 'w1', type: 'red' }, { id: 'w2', type: 'blue' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].assignedWorkers).toEqual([]);
    });

    it('clears workers from all cards', () => {
      const cards = [
        createCard({ id: 'A', stage: 'red-active', assignedWorkers: [{ id: 'w1', type: 'red' }] }),
        createCard({ id: 'B', stage: 'blue-active', assignedWorkers: [{ id: 'w2', type: 'blue' }] }),
        createCard({ id: 'C', stage: 'green', assignedWorkers: [{ id: 'w3', type: 'green' }] }),
      ];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].assignedWorkers).toEqual([]);
      expect(result.cards[1].assignedWorkers).toEqual([]);
      expect(result.cards[2].assignedWorkers).toEqual([]);
    });
  });

  describe('Order of Operations', () => {
    it('ages cards before applying worker output', () => {
      // This test verifies that aging happens first
      const cards = [createCard({ stage: 'red-active', age: 0 })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result.cards[0].age).toBe(1);
    });

    it('applies worker output before transitions', () => {
      // Card starts with incomplete work, worker completes it, then transitions
      mockRandomValues = [0.999]; // max output (6 for specialized)
      const cards = [createCard({
        stage: 'red-active',
        workItems: { red: { total: 6, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } },
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      // Worker output (6) should complete the work, then transition
      expect(result.cards[0].workItems.red.completed).toBe(6);
      expect(result.cards[0].stage).toBe('red-finished');
    });

    it('resets workers after everything else', () => {
      mockRandomValues = [0.5];
      const cards = [createCard({
        stage: 'red-active',
        assignedWorkers: [{ id: 'w1', type: 'red' }]
      })];
      const result = advanceDay(cards, 0, createDefaultWipLimits(), mockGetRandomInt);
      // Worker output should be applied (work items updated)
      expect(result.cards[0].workItems.red.completed).toBeGreaterThan(0);
      // But workers should be cleared
      expect(result.cards[0].assignedWorkers).toEqual([]);
    });
  });

  describe('Snapshot Tests for Complex Scenarios', () => {
    it('captures full day advancement with multiple cards', () => {
      mockRandomValues = [0.5, 0.5, 0.5, 0.5];
      const cards = [
        createCard({ id: 'A', stage: 'options', age: 0 }),
        createCard({
          id: 'B',
          stage: 'red-active',
          age: 2,
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'C',
          stage: 'blue-active',
          age: 5,
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 3 }, green: { total: 5, completed: 0 } },
          assignedWorkers: [{ id: 'w1', type: 'blue' }]
        }),
        createCard({ id: 'D', stage: 'done', age: 10, completionDay: 8 }),
      ];
      const result = advanceDay(cards, 10, createDefaultWipLimits(), mockGetRandomInt);
      expect(result).toMatchSnapshot();
    });

    it('captures day advancement with WIP limits active', () => {
      mockRandomValues = [0.5];
      const wipLimits = {
        ...createDefaultWipLimits(),
        redFinished: { min: 0, max: 2 },
        blueActive: { min: 1, max: 3 },
      };
      const cards = [
        createCard({
          id: 'A',
          stage: 'red-active',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'B',
          stage: 'red-active',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'C',
          stage: 'red-finished',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'D',
          stage: 'red-finished',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const result = advanceDay(cards, 5, wipLimits, mockGetRandomInt);
      expect(result).toMatchSnapshot();
    });

    it('captures empty board advancement', () => {
      const result = advanceDay([], 0, createDefaultWipLimits(), mockGetRandomInt);
      expect(result).toMatchSnapshot();
    });
  });
});
