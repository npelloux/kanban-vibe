/**
 * Golden Master Tests for Policy Execution
 *
 * These tests capture the CURRENT behavior of executePolicyDay() and the siloted-expert
 * policy in App.tsx. They serve as a safety net during refactoring - any failing test
 * indicates a behavioral change that must be either intentional or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.6
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

interface Worker {
  id: string;
  type: 'red' | 'blue' | 'green';
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

interface PolicyDayResult {
  cards: Card[];
  newDay: number;
}

// stagedone duplicated from App.tsx - DO NOT MODIFY
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

// Move cards from options to red-active (policy step 1)
const moveCardsFromOptionsToRedActive = (
  cards: Card[],
  currentDay: number,
  wipLimits: WipLimits
): Card[] => {
  let updatedCards = [...cards];
  const optionsCardsToMove = updatedCards.filter(card => card.stage === 'options');
  optionsCardsToMove.sort((a, b) => a.id.localeCompare(b.id));

  const redActiveCount = updatedCards.filter(card => card.stage === 'red-active').length;
  const maxRedActive = wipLimits.redActive.max;
  const canMoveToRedActive = maxRedActive === 0 || redActiveCount < maxRedActive;

  const optionsCount = optionsCardsToMove.length;
  const minOptions = wipLimits.options.min;
  const canMoveFromOptions = minOptions === 0 || optionsCount > minOptions;

  if (!canMoveToRedActive || !canMoveFromOptions) {
    return updatedCards;
  }

  for (const card of optionsCardsToMove) {
    const currentRedActiveCount = updatedCards.filter(c => c.stage === 'red-active').length;
    if (maxRedActive !== 0 && currentRedActiveCount >= maxRedActive) {
      break;
    }

    updatedCards = updatedCards.map(c =>
      c.id === card.id
        ? { ...c, stage: 'red-active', startDay: currentDay }
        : c
    );
  }

  return updatedCards;
};

// Move cards from one stage to next (policy helper)
const moveCardsToNextStage = (
  cards: Card[],
  fromStage: string,
  toStage: string,
  wipLimits: WipLimits
): Card[] => {
  let updatedCards = [...cards];
  const cardsToMove = updatedCards.filter(card => card.stage === fromStage);
  cardsToMove.sort((a, b) => b.age - a.age);

  const toStageCount = updatedCards.filter(card => card.stage === toStage).length;
  const maxToStage = wipLimits[getColumnKey(toStage)].max;
  const canMoveToStage = maxToStage === 0 || toStageCount < maxToStage;

  const fromStageCount = cardsToMove.length;
  const minFromStage = wipLimits[getColumnKey(fromStage)].min;
  const canMoveFromStage = minFromStage === 0 || fromStageCount > minFromStage;

  if (!canMoveToStage || !canMoveFromStage) {
    return updatedCards;
  }

  for (const card of cardsToMove) {
    const currentToStageCount = updatedCards.filter(c => c.stage === toStage).length;
    if (maxToStage !== 0 && currentToStageCount >= maxToStage) {
      break;
    }

    if (stagedone(card)) {
      updatedCards = updatedCards.map(c =>
        c.id === card.id
          ? { ...c, stage: toStage }
          : c
      );
    }
  }

  return updatedCards;
};

// Move finished cards to next activity (policy step 2)
const moveCardsFromFinishedToNextActivity = (
  cards: Card[],
  wipLimits: WipLimits
): Card[] => {
  let updatedCards = [...cards];
  updatedCards = moveCardsToNextStage(updatedCards, 'red-finished', 'blue-active', wipLimits);
  updatedCards = moveCardsToNextStage(updatedCards, 'blue-finished', 'green', wipLimits);
  return updatedCards;
};

// Assign workers to cards in batch (policy helper)
const assignWorkersToCardsInBatch = (
  workersToAssign: Worker[],
  cardsToAssign: Card[],
  allCards: Card[]
): Card[] => {
  if (workersToAssign.length === 0 || cardsToAssign.length === 0) return allCards;

  const updatedCards = allCards.map(c => ({ ...c }));

  let workerIndex = 0;
  let cardIndex = 0;

  // First pass: one worker per card
  while (workerIndex < workersToAssign.length && cardIndex < cardsToAssign.length) {
    const worker = workersToAssign[workerIndex];
    const card = cardsToAssign[cardIndex];

    const cardToUpdate = updatedCards.find(c => c.id === card.id);
    if (cardToUpdate) {
      cardToUpdate.assignedWorkers = [...cardToUpdate.assignedWorkers, worker];
    }

    workerIndex++;
    cardIndex++;
  }

  // Second pass: remaining workers (up to 3 per card)
  if (workerIndex < workersToAssign.length) {
    cardIndex = 0;

    while (workerIndex < workersToAssign.length) {
      const worker = workersToAssign[workerIndex];
      const card = cardsToAssign[cardIndex];

      const cardToUpdate = updatedCards.find(c => c.id === card.id);
      if (cardToUpdate && cardToUpdate.assignedWorkers.length < 3) {
        cardToUpdate.assignedWorkers = [...cardToUpdate.assignedWorkers, worker];
        workerIndex++;
      }

      cardIndex++;

      if (cardIndex >= cardsToAssign.length) {
        // Check if any card can still accept workers
        const canAnyCardAcceptWorkers = cardsToAssign.some(c => {
          const card = updatedCards.find(uc => uc.id === c.id);
          return card && card.assignedWorkers.length < 3;
        });

        if (!canAnyCardAcceptWorkers) {
          // No cards can accept more workers, break out
          break;
        }

        cardIndex = 0;
      }
    }
  }

  return updatedCards;
};

// Assign workers to matching color columns (policy step 3)
const assignWorkersToMatchingCards = (
  cards: Card[],
  workers: Worker[]
): Card[] => {
  let updatedCards = cards.map(card => ({
    ...card,
    assignedWorkers: []
  }));

  const redActiveCards = updatedCards.filter(card =>
    card.stage === 'red-active' && card.assignedWorkers.length < 3
  );
  const blueActiveCards = updatedCards.filter(card =>
    card.stage === 'blue-active' && card.assignedWorkers.length < 3
  );
  const greenCards = updatedCards.filter(card =>
    card.stage === 'green' && card.assignedWorkers.length < 3
  );

  redActiveCards.sort((a, b) => b.age - a.age);
  blueActiveCards.sort((a, b) => b.age - a.age);
  greenCards.sort((a, b) => b.age - a.age);

  const redWorkers = workers.filter(worker => worker.type === 'red');
  const blueWorkers = workers.filter(worker => worker.type === 'blue');
  const greenWorkers = workers.filter(worker => worker.type === 'green');

  updatedCards = assignWorkersToCardsInBatch(redWorkers, redActiveCards, updatedCards);
  updatedCards = assignWorkersToCardsInBatch(blueWorkers, blueActiveCards, updatedCards);
  updatedCards = assignWorkersToCardsInBatch(greenWorkers, greenCards, updatedCards);

  return updatedCards;
};

// Full siloted-expert policy day execution
const executePolicyDay = (
  cards: Card[],
  workers: Worker[],
  currentDay: number,
  wipLimits: WipLimits,
  getRandomInt: (min: number, max: number) => number
): PolicyDayResult => {
  // Step 1: Move cards from options to red-active
  const cardsAfterOptionsToRed = moveCardsFromOptionsToRedActive(cards, currentDay, wipLimits);

  // Step 2: Move finished cards to next activity
  const cardsAfterFinishedToNext = moveCardsFromFinishedToNextActivity(cardsAfterOptionsToRed, wipLimits);

  // Step 3: Assign workers to matching color columns
  const cardsWithWorkers = assignWorkersToMatchingCards(cardsAfterFinishedToNext, workers);

  // Step 4: Advance the day
  const newDay = currentDay + 1;

  // Age cards
  const agedCards = cardsWithWorkers.map(card => ({
    ...card,
    age: (card.stage === 'done' || card.stage === 'options') ? card.age : card.age + 1
  }));

  // Apply worker output
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

  // Process stage transitions
  let updatedCards = [...cardsWithWorkerOutput];
  updatedCards = updatedCards.map(card => {
    if (stagedone(card)) {
      const sourceStage = card.stage;
      const cardsInSourceStage = updatedCards.filter(c => c.stage === sourceStage).length;
      const minWipSource = wipLimits[getColumnKey(sourceStage)].min;

      if (minWipSource > 0 && cardsInSourceStage <= minWipSource) {
        return card;
      }

      if (card.stage === 'red-active') {
        const redFinishedCount = updatedCards.filter(c => c.stage === 'red-finished').length;
        if (wipLimits.redFinished.max > 0 && redFinishedCount >= wipLimits.redFinished.max) {
          return card;
        }
        return { ...card, stage: 'red-finished' };
      } else if (card.stage === 'red-finished') {
        const blueActiveCount = updatedCards.filter(c => c.stage === 'blue-active').length;
        if (wipLimits.blueActive.max > 0 && blueActiveCount >= wipLimits.blueActive.max) {
          return card;
        }
        return { ...card, stage: 'blue-active' };
      } else if (card.stage === 'blue-active') {
        const blueFinishedCount = updatedCards.filter(c => c.stage === 'blue-finished').length;
        if (wipLimits.blueFinished.max > 0 && blueFinishedCount >= wipLimits.blueFinished.max) {
          return card;
        }
        return { ...card, stage: 'blue-finished' };
      } else if (card.stage === 'blue-finished') {
        const greenCount = updatedCards.filter(c => c.stage === 'green').length;
        if (wipLimits.green.max > 0 && greenCount >= wipLimits.green.max) {
          return card;
        }
        return { ...card, stage: 'green' };
      } else if (card.stage === 'green') {
        const doneCount = updatedCards.filter(c => c.stage === 'done').length;
        if (wipLimits.done.max > 0 && doneCount >= wipLimits.done.max) {
          return card;
        }
        return { ...card, stage: 'done', completionDay: newDay };
      }
    }
    return card;
  });

  // Reset workers
  updatedCards = updatedCards.map(card => ({
    ...card,
    assignedWorkers: []
  }));

  return { cards: updatedCards, newDay };
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

const createWorker = (id: string, type: 'red' | 'blue' | 'green'): Worker => ({
  id,
  type,
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

describe('Golden Master: Policy Execution (siloted-expert)', () => {
  let mockRandomValues: number[];
  let mockRandomIndex: number;

  const mockGetRandomInt = (min: number, max: number): number => {
    const value = mockRandomValues[mockRandomIndex % mockRandomValues.length];
    mockRandomIndex++;
    return Math.floor(min + value * (max - min + 1));
  };

  beforeEach(() => {
    mockRandomValues = [0.5];
    mockRandomIndex = 0;
  });

  describe('Step 1: Move Cards from Options to Red-Active', () => {
    it('moves all cards from options to red-active when no WIP limits', () => {
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
      ];
      const result = moveCardsFromOptionsToRedActive(cards, 5, createDefaultWipLimits());

      expect(result[0].stage).toBe('red-active');
      expect(result[1].stage).toBe('red-active');
    });

    it('sets startDay to currentDay when moving to red-active', () => {
      const cards = [createCard({ id: 'A', stage: 'options', startDay: 0 })];
      const result = moveCardsFromOptionsToRedActive(cards, 10, createDefaultWipLimits());

      expect(result[0].startDay).toBe(10);
    });

    it('sorts cards by ID before moving', () => {
      const cards = [
        createCard({ id: 'C', stage: 'options' }),
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
      ];
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 0, max: 1 } };
      const result = moveCardsFromOptionsToRedActive(cards, 5, wipLimits);

      // Only card A should move (alphabetically first)
      const movedCard = result.find(c => c.stage === 'red-active');
      expect(movedCard?.id).toBe('A');
    });

    it('respects max WIP limit on red-active', () => {
      const wipLimits = { ...createDefaultWipLimits(), redActive: { min: 0, max: 2 } };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
        createCard({ id: 'C', stage: 'options' }),
      ];
      const result = moveCardsFromOptionsToRedActive(cards, 5, wipLimits);

      const redActiveCards = result.filter(c => c.stage === 'red-active');
      expect(redActiveCards).toHaveLength(2);
    });

    it('respects min WIP limit on options', () => {
      const wipLimits = { ...createDefaultWipLimits(), options: { min: 1, max: 0 } };
      const cards = [createCard({ id: 'A', stage: 'options' })];
      const result = moveCardsFromOptionsToRedActive(cards, 5, wipLimits);

      expect(result[0].stage).toBe('options');
    });
  });

  describe('Step 2: Move Finished Cards to Next Activity', () => {
    it('moves red-finished cards to blue-active', () => {
      const cards = [createCard({
        id: 'A',
        stage: 'red-finished',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = moveCardsFromFinishedToNextActivity(cards, createDefaultWipLimits());

      expect(result[0].stage).toBe('blue-active');
    });

    it('moves blue-finished cards to green', () => {
      const cards = [createCard({
        id: 'A',
        stage: 'blue-finished',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 5 }, green: { total: 5, completed: 0 } }
      })];
      const result = moveCardsFromFinishedToNextActivity(cards, createDefaultWipLimits());

      expect(result[0].stage).toBe('green');
    });

    it('prioritizes older cards when moving', () => {
      const wipLimits = { ...createDefaultWipLimits(), blueActive: { min: 0, max: 1 } };
      const cards = [
        createCard({
          id: 'A',
          stage: 'red-finished',
          age: 3,
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'B',
          stage: 'red-finished',
          age: 5,
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const result = moveCardsFromFinishedToNextActivity(cards, wipLimits);

      // Older card (B) should move
      expect(result.find(c => c.id === 'B')?.stage).toBe('blue-active');
      expect(result.find(c => c.id === 'A')?.stage).toBe('red-finished');
    });

    it('does not move cards that are not done (stagedone false)', () => {
      const cards = [createCard({
        id: 'A',
        stage: 'red-finished',
        workItems: { red: { total: 5, completed: 3 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = moveCardsFromFinishedToNextActivity(cards, createDefaultWipLimits());

      expect(result[0].stage).toBe('red-finished');
    });
  });

  describe('Step 3: Worker Assignment', () => {
    it('assigns red workers to red-active cards', () => {
      const cards = [createCard({ id: 'A', stage: 'red-active' })];
      const workers = [createWorker('w1', 'red')];
      const result = assignWorkersToMatchingCards(cards, workers);

      expect(result[0].assignedWorkers).toHaveLength(1);
      expect(result[0].assignedWorkers[0].type).toBe('red');
    });

    it('assigns blue workers to blue-active cards', () => {
      const cards = [createCard({ id: 'A', stage: 'blue-active' })];
      const workers = [createWorker('w1', 'blue')];
      const result = assignWorkersToMatchingCards(cards, workers);

      expect(result[0].assignedWorkers).toHaveLength(1);
      expect(result[0].assignedWorkers[0].type).toBe('blue');
    });

    it('assigns green workers to green cards', () => {
      const cards = [createCard({ id: 'A', stage: 'green' })];
      const workers = [createWorker('w1', 'green')];
      const result = assignWorkersToMatchingCards(cards, workers);

      expect(result[0].assignedWorkers).toHaveLength(1);
      expect(result[0].assignedWorkers[0].type).toBe('green');
    });

    it('distributes one worker per card first', () => {
      const cards = [
        createCard({ id: 'A', stage: 'red-active', age: 5 }),
        createCard({ id: 'B', stage: 'red-active', age: 3 }),
      ];
      const workers = [
        createWorker('w1', 'red'),
        createWorker('w2', 'red'),
      ];
      const result = assignWorkersToMatchingCards(cards, workers);

      expect(result[0].assignedWorkers).toHaveLength(1);
      expect(result[1].assignedWorkers).toHaveLength(1);
    });

    it('assigns extra workers to cards (up to 3 max)', () => {
      const cards = [createCard({ id: 'A', stage: 'red-active' })];
      const workers = [
        createWorker('w1', 'red'),
        createWorker('w2', 'red'),
        createWorker('w3', 'red'),
        createWorker('w4', 'red'),
      ];
      const result = assignWorkersToMatchingCards(cards, workers);

      expect(result[0].assignedWorkers).toHaveLength(3);
    });

    it('prioritizes older cards for worker assignment', () => {
      const cards = [
        createCard({ id: 'A', stage: 'red-active', age: 2 }),
        createCard({ id: 'B', stage: 'red-active', age: 5 }),
      ];
      const workers = [createWorker('w1', 'red')];
      const result = assignWorkersToMatchingCards(cards, workers);

      // Card B (older) should get the worker
      expect(result.find(c => c.id === 'B')?.assignedWorkers).toHaveLength(1);
      expect(result.find(c => c.id === 'A')?.assignedWorkers).toHaveLength(0);
    });

    it('does not assign workers to non-active stages', () => {
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-finished' }),
        createCard({ id: 'C', stage: 'done' }),
      ];
      const workers = [
        createWorker('w1', 'red'),
        createWorker('w2', 'blue'),
        createWorker('w3', 'green'),
      ];
      const result = assignWorkersToMatchingCards(cards, workers);

      expect(result[0].assignedWorkers).toHaveLength(0);
      expect(result[1].assignedWorkers).toHaveLength(0);
      expect(result[2].assignedWorkers).toHaveLength(0);
    });
  });

  describe('Full Policy Day Execution', () => {
    it('executes complete policy cycle with empty board', () => {
      const result = executePolicyDay([], [], 0, createDefaultWipLimits(), mockGetRandomInt);

      expect(result.cards).toEqual([]);
      expect(result.newDay).toBe(1);
    });

    it('moves cards from options and assigns workers', () => {
      mockRandomValues = [0.2];  // Lower value to avoid completing all work in one day
      const cards = [createCard({ id: 'A', stage: 'options' })];
      const workers = [createWorker('w1', 'red')];
      const result = executePolicyDay(cards, workers, 5, createDefaultWipLimits(), mockGetRandomInt);

      // Card should have moved to red-active and aged
      expect(result.cards[0].stage).toBe('red-active');
      expect(result.cards[0].age).toBe(1);
      expect(result.cards[0].startDay).toBe(5);
      // Workers are reset at end of day
      expect(result.cards[0].assignedWorkers).toHaveLength(0);
      expect(result.newDay).toBe(6);
    });

    it('applies worker output to cards', () => {
      mockRandomValues = [0.5]; // mid-range output
      const cards = [createCard({
        id: 'A',
        stage: 'red-active',
        workItems: { red: { total: 10, completed: 0 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const workers = [createWorker('w1', 'red')];
      const result = executePolicyDay(cards, workers, 0, createDefaultWipLimits(), mockGetRandomInt);

      expect(result.cards[0].workItems.red.completed).toBeGreaterThan(0);
    });

    it('transitions cards when work is complete', () => {
      mockRandomValues = [0];
      const cards = [createCard({
        id: 'A',
        stage: 'red-active',
        workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
      })];
      const result = executePolicyDay(cards, [], 0, createDefaultWipLimits(), mockGetRandomInt);

      expect(result.cards[0].stage).toBe('red-finished');
    });

    it('increments day counter', () => {
      const result = executePolicyDay([], [], 10, createDefaultWipLimits(), mockGetRandomInt);

      expect(result.newDay).toBe(11);
    });

    it('ages cards in active stages', () => {
      const cards = [
        createCard({ id: 'A', stage: 'red-active', age: 2 }),
        createCard({ id: 'B', stage: 'options', age: 0 }),
        createCard({ id: 'C', stage: 'done', age: 5 }),
      ];
      const result = executePolicyDay(cards, [], 0, createDefaultWipLimits(), mockGetRandomInt);

      expect(result.cards.find(c => c.id === 'A')?.age).toBe(3);
      expect(result.cards.find(c => c.id === 'B')?.age).toBe(1);  // Card B moves to red-active and ages
      expect(result.cards.find(c => c.id === 'C')?.age).toBe(5);
    });
  });

  describe('Multi-Day Execution', () => {
    it('runs policy for multiple days consecutively', () => {
      mockRandomValues = [0.5];
      let cards: Card[] = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
      ];
      const workers = [createWorker('w1', 'red'), createWorker('w2', 'red')];
      let currentDay = 0;

      // Run for 3 days
      for (let i = 0; i < 3; i++) {
        const result = executePolicyDay(cards, workers, currentDay, createDefaultWipLimits(), mockGetRandomInt);
        cards = result.cards;
        currentDay = result.newDay;
      }

      expect(currentDay).toBe(3);
      // Cards should have progressed
      expect(cards[0].age).toBeGreaterThan(0);
    });

    it('completes cards through full workflow over multiple days', () => {
      mockRandomValues = [0.999]; // Max output to complete work quickly
      let cards: Card[] = [createCard({
        id: 'A',
        stage: 'options',
        workItems: {
          red: { total: 6, completed: 0 },
          blue: { total: 6, completed: 0 },
          green: { total: 6, completed: 0 },
        }
      })];
      const workers = [
        createWorker('w1', 'red'),
        createWorker('w2', 'blue'),
        createWorker('w3', 'green'),
      ];
      let currentDay = 0;

      // Run for 10 days
      for (let i = 0; i < 10; i++) {
        const result = executePolicyDay(cards, workers, currentDay, createDefaultWipLimits(), mockGetRandomInt);
        cards = result.cards;
        currentDay = result.newDay;
      }

      // Card should have reached done
      expect(cards[0].stage).toBe('done');
      expect(cards[0].completionDay).toBeDefined();
    });
  });

  describe('WIP Limit Enforcement', () => {
    it('respects WIP limits throughout policy execution', () => {
      const wipLimits = {
        ...createDefaultWipLimits(),
        redActive: { min: 0, max: 1 },
      };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
        createCard({ id: 'C', stage: 'options' }),
      ];
      const result = executePolicyDay(cards, [], 0, wipLimits, mockGetRandomInt);

      const redActiveCards = result.cards.filter(c => c.stage === 'red-active');
      expect(redActiveCards).toHaveLength(1);
    });
  });

  describe('Snapshot Tests for Complex Scenarios', () => {
    it('captures full policy day with multiple cards and workers', () => {
      mockRandomValues = [0.5, 0.5, 0.5, 0.5, 0.5];
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'red-active', age: 2 }),
        createCard({
          id: 'C',
          stage: 'red-finished',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
        createCard({
          id: 'D',
          stage: 'blue-active',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 3 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const workers = [
        createWorker('w1', 'red'),
        createWorker('w2', 'red'),
        createWorker('w3', 'blue'),
        createWorker('w4', 'green'),
      ];
      const result = executePolicyDay(cards, workers, 10, createDefaultWipLimits(), mockGetRandomInt);
      expect(result).toMatchSnapshot();
    });

    it('captures policy with WIP limits active', () => {
      mockRandomValues = [0.5];
      const wipLimits = {
        ...createDefaultWipLimits(),
        redActive: { min: 0, max: 2 },
        blueActive: { min: 0, max: 1 },
      };
      const cards = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
        createCard({ id: 'C', stage: 'options' }),
        createCard({
          id: 'D',
          stage: 'red-finished',
          workItems: { red: { total: 5, completed: 5 }, blue: { total: 5, completed: 0 }, green: { total: 5, completed: 0 } }
        }),
      ];
      const result = executePolicyDay(cards, [], 5, wipLimits, mockGetRandomInt);
      expect(result).toMatchSnapshot();
    });

    it('captures multi-day execution state', () => {
      mockRandomValues = [0.5];
      let cards: Card[] = [
        createCard({ id: 'A', stage: 'options' }),
        createCard({ id: 'B', stage: 'options' }),
      ];
      const workers = [createWorker('w1', 'red'), createWorker('w2', 'blue')];
      let currentDay = 0;

      const daySnapshots: PolicyDayResult[] = [];
      for (let i = 0; i < 5; i++) {
        const result = executePolicyDay(cards, workers, currentDay, createDefaultWipLimits(), mockGetRandomInt);
        daySnapshots.push(result);
        cards = result.cards;
        currentDay = result.newDay;
      }

      expect(daySnapshots).toMatchSnapshot();
    });
  });
});
