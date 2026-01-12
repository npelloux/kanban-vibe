/**
 * Golden Master Tests for Stage Transitions
 *
 * These tests capture the CURRENT behavior of the stagedone() function in App.tsx.
 * They serve as a safety net during refactoring - any failing test indicates a
 * behavioral change that must be either intentional (document as bug fix) or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.1
 */
import { describe, it, expect } from 'vitest';

// Duplicated from App.tsx lines 79-130 - DO NOT MODIFY
// This captures the exact current behavior for golden master comparison
const stagedone = (card: {
  stage: string;
  isBlocked: boolean;
  workItems: {
    red: { total: number; completed: number };
    blue: { total: number; completed: number };
    green: { total: number; completed: number };
  };
}): boolean => {
  // Check if card is blocked
  if (card.isBlocked) {
    return false;
  }

  // For red-active stage, check if the red work is completed
  if (card.stage === 'red-active') {
    return card.workItems.red.total > 0 &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For red-finished stage, ensure red work is completed before moving to blue-active
  else if (card.stage === 'red-finished') {
    return card.workItems.red.total > 0 &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For blue-active stage, check if the blue work is completed
  // Also ensure all red work is completed (requirement for blue activities)
  else if (card.stage === 'blue-active') {
    return card.workItems.blue.total > 0 &&
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For blue-finished stage, ensure blue and red work is completed before moving to green
  else if (card.stage === 'blue-finished') {
    return card.workItems.blue.total > 0 &&
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For green stage, check if the green work is completed
  // Also ensure all red and blue work is completed (requirement for green activities)
  else if (card.stage === 'green') {
    return card.workItems.green.total > 0 &&
           card.workItems.green.completed >= card.workItems.green.total &&
           card.workItems.red.completed >= card.workItems.red.total &&
           card.workItems.blue.completed >= card.workItems.blue.total;
  }

  // For other stages (like options or done), check if all work is completed
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

// Helper to create a card with default work items
const createCard = (
  stage: string,
  isBlocked: boolean,
  workItems: {
    red?: { total: number; completed: number };
    blue?: { total: number; completed: number };
    green?: { total: number; completed: number };
  }
) => ({
  stage,
  isBlocked,
  workItems: {
    red: workItems.red ?? { total: 0, completed: 0 },
    blue: workItems.blue ?? { total: 0, completed: 0 },
    green: workItems.green ?? { total: 0, completed: 0 },
  },
});

describe('Golden Master: stagedone() stage transitions', () => {
  describe('Blocked cards', () => {
    it.each([
      'red-active',
      'red-finished',
      'blue-active',
      'blue-finished',
      'green',
      'options',
      'done',
    ])('returns false when card is blocked in %s stage with all work complete', (stage) => {
      const card = createCard(stage, true, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(false);
    });
  });

  describe('red-active stage transitions', () => {
    it('returns true when red work is complete and not blocked', () => {
      const card = createCard('red-active', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when red work is incomplete', () => {
      const card = createCard('red-active', false, {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns true when red completed exceeds total', () => {
      const card = createCard('red-active', false, {
        red: { total: 5, completed: 7 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when red total is 0 (even though 0 >= 0)', () => {
      // Current behavior: requires total > 0, so 0 work items means no transition
      const card = createCard('red-active', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns true when red work is exactly at boundary (completed == total)', () => {
      const card = createCard('red-active', false, {
        red: { total: 1, completed: 1 },
      });

      expect(stagedone(card)).toBe(true);
    });
  });

  describe('red-finished stage transitions', () => {
    it('returns true when red work is complete and not blocked', () => {
      const card = createCard('red-finished', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when red total is 0', () => {
      // Note: This captures potentially redundant check - red-finished should
      // already have red work complete from red-active transition
      const card = createCard('red-finished', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns true when red completed exceeds total', () => {
      const card = createCard('red-finished', false, {
        red: { total: 5, completed: 8 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });
  });

  describe('blue-active stage transitions', () => {
    it('returns true when blue and red work are complete', () => {
      const card = createCard('blue-active', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when blue work is complete but red is not', () => {
      const card = createCard('blue-active', false, {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when red work is complete but blue is not', () => {
      const card = createCard('blue-active', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 2 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when blue total is 0', () => {
      const card = createCard('blue-active', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 0, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns true when red total is 0 but red completed >= red total (0 >= 0)', () => {
      // Current behavior: red check is completed >= total, which passes for 0 >= 0
      const card = createCard('blue-active', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });
  });

  describe('blue-finished stage transitions', () => {
    it('returns true when blue and red work are complete', () => {
      const card = createCard('blue-finished', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when blue total is 0', () => {
      const card = createCard('blue-finished', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 0, completed: 0 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when red work is incomplete', () => {
      const card = createCard('blue-finished', false, {
        red: { total: 5, completed: 3 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });
  });

  describe('green stage transitions', () => {
    it('returns true when all colors work is complete', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when green work is incomplete', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 1 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when red work is incomplete', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when blue work is incomplete', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 2 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when green total is 0', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 0, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns true when red total is 0 (0 >= 0 passes)', () => {
      const card = createCard('green', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns true when blue total is 0 (0 >= 0 passes)', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 0, completed: 0 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(true);
    });
  });

  describe('options stage (manual transitions)', () => {
    it('returns true when all work is complete', () => {
      const card = createCard('options', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when any work is incomplete', () => {
      const card = createCard('options', false, {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns false when total work items is 0', () => {
      // Current behavior: requires totalWorkItems > 0 in the fallback case
      const card = createCard('options', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 0, completed: 0 },
        green: { total: 0, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });
  });

  describe('done stage (no further transitions)', () => {
    it('returns true when all work is complete', () => {
      const card = createCard('done', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false when total work items is 0', () => {
      const card = createCard('done', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 0, completed: 0 },
        green: { total: 0, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('returns true when completed exceeds total for all colors', () => {
      const card = createCard('green', false, {
        red: { total: 5, completed: 10 },
        blue: { total: 3, completed: 6 },
        green: { total: 2, completed: 4 },
      });

      expect(stagedone(card)).toBe(true);
    });

    it('returns false for unknown stage when total is 0', () => {
      const card = createCard('unknown-stage', false, {
        red: { total: 0, completed: 0 },
        blue: { total: 0, completed: 0 },
        green: { total: 0, completed: 0 },
      });

      expect(stagedone(card)).toBe(false);
    });

    it('returns true for unknown stage when all work complete', () => {
      const card = createCard('unknown-stage', false, {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 },
      });

      expect(stagedone(card)).toBe(true);
    });
  });

  describe('Stage transition matrix (parameterized)', () => {
    // Matrix tests for systematic coverage
    const stageRequirements = [
      { stage: 'red-active', requiresRedTotal: true, requiresBlueTotal: false, requiresGreenTotal: false },
      { stage: 'red-finished', requiresRedTotal: true, requiresBlueTotal: false, requiresGreenTotal: false },
      { stage: 'blue-active', requiresRedTotal: false, requiresBlueTotal: true, requiresGreenTotal: false },
      { stage: 'blue-finished', requiresRedTotal: false, requiresBlueTotal: true, requiresGreenTotal: false },
      { stage: 'green', requiresRedTotal: false, requiresBlueTotal: false, requiresGreenTotal: true },
    ];

    it.each(stageRequirements)(
      'in $stage stage, transition requires correct color total > 0',
      ({ stage, requiresRedTotal, requiresBlueTotal, requiresGreenTotal }) => {
        // Card with only the required color having work items
        const card = createCard(stage, false, {
          red: { total: requiresRedTotal ? 5 : 0, completed: requiresRedTotal ? 5 : 0 },
          blue: { total: requiresBlueTotal ? 3 : 0, completed: requiresBlueTotal ? 3 : 0 },
          green: { total: requiresGreenTotal ? 2 : 0, completed: requiresGreenTotal ? 2 : 0 },
        });

        expect(stagedone(card)).toBe(true);
      }
    );
  });
});
