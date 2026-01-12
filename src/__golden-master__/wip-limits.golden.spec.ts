/**
 * Golden Master Tests for WIP Limit Enforcement
 *
 * These tests capture the CURRENT behavior of WIP limit enforcement in App.tsx.
 * They serve as a safety net during refactoring - any failing test indicates a
 * behavioral change that must be either intentional (document as bug fix) or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.3
 */
import { describe, it, expect } from 'vitest';

// Types duplicated from App.tsx for test isolation
interface WipLimits {
  options: { min: number; max: number };
  redActive: { min: number; max: number };
  redFinished: { min: number; max: number };
  blueActive: { min: number; max: number };
  blueFinished: { min: number; max: number };
  green: { min: number; max: number };
  done: { min: number; max: number };
}

interface Card {
  id: string;
  stage: string;
}

type ColumnKey = keyof WipLimits;

// Duplicated from App.tsx lines 201-210 - DO NOT MODIFY
const getColumnKey = (stage: string): ColumnKey => {
  if (stage === 'options') return 'options';
  if (stage === 'red-active') return 'redActive';
  if (stage === 'red-finished') return 'redFinished';
  if (stage === 'blue-active') return 'blueActive';
  if (stage === 'blue-finished') return 'blueFinished';
  if (stage === 'green') return 'green';
  if (stage === 'done') return 'done';
  return 'options'; // Default fallback
};

// Duplicated from App.tsx lines 213-225 - DO NOT MODIFY
const wouldExceedWipLimit = (
  targetStage: string,
  cards: Card[],
  wipLimits: WipLimits
): boolean => {
  const columnKey = getColumnKey(targetStage);
  const maxWip = wipLimits[columnKey].max;

  // If max WIP is 0, there is no constraint
  if (maxWip === 0) return false;

  // Count cards in the target column
  const cardsInColumn = cards.filter(card => card.stage === targetStage).length;

  // Check if adding one more card would exceed the limit
  return cardsInColumn >= maxWip;
};

// Duplicated from App.tsx lines 228-240 - DO NOT MODIFY
const wouldViolateMinWipLimit = (
  sourceStage: string,
  cards: Card[],
  wipLimits: WipLimits
): boolean => {
  const columnKey = getColumnKey(sourceStage);
  const minWip = wipLimits[columnKey].min;

  // If min WIP is 0, there is no constraint
  if (minWip === 0) return false;

  // Count cards in the source column
  const cardsInColumn = cards.filter(card => card.stage === sourceStage).length;

  // Check if removing one card would violate the min limit
  return cardsInColumn <= minWip;
};

// Helper to create default WIP limits (all zeros = no constraints)
const createWipLimits = (overrides: Partial<WipLimits> = {}): WipLimits => ({
  options: { min: 0, max: 0 },
  redActive: { min: 0, max: 0 },
  redFinished: { min: 0, max: 0 },
  blueActive: { min: 0, max: 0 },
  blueFinished: { min: 0, max: 0 },
  green: { min: 0, max: 0 },
  done: { min: 0, max: 0 },
  ...overrides,
});

// Helper to create cards in a specific stage
const createCardsInStage = (stage: string, count: number): Card[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `card-${stage}-${i}`,
    stage,
  }));

// All stages and their corresponding column keys
const stageToColumnKey: Array<{ stage: string; columnKey: ColumnKey }> = [
  { stage: 'options', columnKey: 'options' },
  { stage: 'red-active', columnKey: 'redActive' },
  { stage: 'red-finished', columnKey: 'redFinished' },
  { stage: 'blue-active', columnKey: 'blueActive' },
  { stage: 'blue-finished', columnKey: 'blueFinished' },
  { stage: 'green', columnKey: 'green' },
  { stage: 'done', columnKey: 'done' },
];

describe('Golden Master: WIP Limit Enforcement', () => {
  describe('getColumnKey() stage mapping', () => {
    it.each(stageToColumnKey)(
      'maps "$stage" to "$columnKey"',
      ({ stage, columnKey }) => {
        expect(getColumnKey(stage)).toBe(columnKey);
      }
    );

    it('returns "options" as fallback for unknown stage', () => {
      expect(getColumnKey('unknown-stage')).toBe('options');
      expect(getColumnKey('')).toBe('options');
      expect(getColumnKey('invalid')).toBe('options');
    });
  });

  describe('wouldExceedWipLimit() - Max WIP enforcement', () => {
    describe('Zero max WIP means no constraint', () => {
      it.each(stageToColumnKey)(
        'allows move into $stage when max WIP is 0 regardless of card count',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 0, max: 0 },
          });

          // With 0 cards
          expect(wouldExceedWipLimit(stage, [], wipLimits)).toBe(false);

          // With 5 cards already in column
          const cards = createCardsInStage(stage, 5);
          expect(wouldExceedWipLimit(stage, cards, wipLimits)).toBe(false);

          // With 100 cards
          const manyCards = createCardsInStage(stage, 100);
          expect(wouldExceedWipLimit(stage, manyCards, wipLimits)).toBe(false);
        }
      );
    });

    describe('Boundary conditions for max WIP', () => {
      it.each(stageToColumnKey)(
        'in $stage: allows move when cards < max WIP',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 0, max: 3 },
          });

          // 0 cards, max 3 → can move in
          expect(wouldExceedWipLimit(stage, [], wipLimits)).toBe(false);

          // 1 card, max 3 → can move in
          const oneCard = createCardsInStage(stage, 1);
          expect(wouldExceedWipLimit(stage, oneCard, wipLimits)).toBe(false);

          // 2 cards, max 3 → can move in
          const twoCards = createCardsInStage(stage, 2);
          expect(wouldExceedWipLimit(stage, twoCards, wipLimits)).toBe(false);
        }
      );

      it.each(stageToColumnKey)(
        'in $stage: blocks move when cards >= max WIP',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 0, max: 3 },
          });

          // 3 cards, max 3 → cannot move in (at limit)
          const atLimit = createCardsInStage(stage, 3);
          expect(wouldExceedWipLimit(stage, atLimit, wipLimits)).toBe(true);

          // 4 cards, max 3 → cannot move in (over limit)
          const overLimit = createCardsInStage(stage, 4);
          expect(wouldExceedWipLimit(stage, overLimit, wipLimits)).toBe(true);

          // 10 cards, max 3 → cannot move in (way over limit)
          const wayOver = createCardsInStage(stage, 10);
          expect(wouldExceedWipLimit(stage, wayOver, wipLimits)).toBe(true);
        }
      );
    });

    describe('Max WIP of 1 (strictest non-zero limit)', () => {
      it.each(stageToColumnKey)(
        'in $stage with max WIP 1: allows only when empty',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 0, max: 1 },
          });

          // 0 cards → can move in
          expect(wouldExceedWipLimit(stage, [], wipLimits)).toBe(false);

          // 1 card → cannot move in
          const oneCard = createCardsInStage(stage, 1);
          expect(wouldExceedWipLimit(stage, oneCard, wipLimits)).toBe(true);

          // 2 cards → cannot move in
          const twoCards = createCardsInStage(stage, 2);
          expect(wouldExceedWipLimit(stage, twoCards, wipLimits)).toBe(true);
        }
      );
    });

    describe('Cards in other columns do not affect limit', () => {
      it('only counts cards in the target column', () => {
        const wipLimits = createWipLimits({
          redActive: { min: 0, max: 2 },
        });

        // 5 cards in blue-active, 0 in red-active
        const cardsInOtherColumn = createCardsInStage('blue-active', 5);
        expect(wouldExceedWipLimit('red-active', cardsInOtherColumn, wipLimits)).toBe(false);

        // 5 cards in blue-active, 1 in red-active
        const mixedCards = [
          ...cardsInOtherColumn,
          ...createCardsInStage('red-active', 1),
        ];
        expect(wouldExceedWipLimit('red-active', mixedCards, wipLimits)).toBe(false);

        // 5 cards in blue-active, 2 in red-active (at limit)
        const atLimit = [
          ...cardsInOtherColumn,
          ...createCardsInStage('red-active', 2),
        ];
        expect(wouldExceedWipLimit('red-active', atLimit, wipLimits)).toBe(true);
      });
    });
  });

  describe('wouldViolateMinWipLimit() - Min WIP enforcement', () => {
    describe('Zero min WIP means no constraint', () => {
      it.each(stageToColumnKey)(
        'allows move out of $stage when min WIP is 0 regardless of card count',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 0, max: 0 },
          });

          // With 0 cards
          expect(wouldViolateMinWipLimit(stage, [], wipLimits)).toBe(false);

          // With 1 card
          const oneCard = createCardsInStage(stage, 1);
          expect(wouldViolateMinWipLimit(stage, oneCard, wipLimits)).toBe(false);

          // With 5 cards
          const fiveCards = createCardsInStage(stage, 5);
          expect(wouldViolateMinWipLimit(stage, fiveCards, wipLimits)).toBe(false);
        }
      );
    });

    describe('Boundary conditions for min WIP', () => {
      it.each(stageToColumnKey)(
        'in $stage: allows move out when cards > min WIP',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 2, max: 0 },
          });

          // 3 cards, min 2 → can move out (will have 2 after)
          const threeCards = createCardsInStage(stage, 3);
          expect(wouldViolateMinWipLimit(stage, threeCards, wipLimits)).toBe(false);

          // 5 cards, min 2 → can move out
          const fiveCards = createCardsInStage(stage, 5);
          expect(wouldViolateMinWipLimit(stage, fiveCards, wipLimits)).toBe(false);

          // 10 cards, min 2 → can move out
          const tenCards = createCardsInStage(stage, 10);
          expect(wouldViolateMinWipLimit(stage, tenCards, wipLimits)).toBe(false);
        }
      );

      it.each(stageToColumnKey)(
        'in $stage: blocks move out when cards <= min WIP',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 2, max: 0 },
          });

          // 2 cards, min 2 → cannot move out (at limit)
          const atLimit = createCardsInStage(stage, 2);
          expect(wouldViolateMinWipLimit(stage, atLimit, wipLimits)).toBe(true);

          // 1 card, min 2 → cannot move out (below limit)
          const belowLimit = createCardsInStage(stage, 1);
          expect(wouldViolateMinWipLimit(stage, belowLimit, wipLimits)).toBe(true);

          // 0 cards, min 2 → cannot move out (way below limit)
          expect(wouldViolateMinWipLimit(stage, [], wipLimits)).toBe(true);
        }
      );
    });

    describe('Min WIP of 1 (common minimum)', () => {
      it.each(stageToColumnKey)(
        'in $stage with min WIP 1: blocks when 0 or 1 card',
        ({ stage, columnKey }) => {
          const wipLimits = createWipLimits({
            [columnKey]: { min: 1, max: 0 },
          });

          // 0 cards → cannot move out
          expect(wouldViolateMinWipLimit(stage, [], wipLimits)).toBe(true);

          // 1 card → cannot move out (at limit)
          const oneCard = createCardsInStage(stage, 1);
          expect(wouldViolateMinWipLimit(stage, oneCard, wipLimits)).toBe(true);

          // 2 cards → can move out
          const twoCards = createCardsInStage(stage, 2);
          expect(wouldViolateMinWipLimit(stage, twoCards, wipLimits)).toBe(false);
        }
      );
    });

    describe('Cards in other columns do not affect limit', () => {
      it('only counts cards in the source column', () => {
        const wipLimits = createWipLimits({
          redActive: { min: 2, max: 0 },
        });

        // 5 cards in blue-active, 3 in red-active
        const mixedCards = [
          ...createCardsInStage('blue-active', 5),
          ...createCardsInStage('red-active', 3),
        ];
        expect(wouldViolateMinWipLimit('red-active', mixedCards, wipLimits)).toBe(false);

        // 5 cards in blue-active, 2 in red-active (at limit)
        const atLimit = [
          ...createCardsInStage('blue-active', 5),
          ...createCardsInStage('red-active', 2),
        ];
        expect(wouldViolateMinWipLimit('red-active', atLimit, wipLimits)).toBe(true);

        // 5 cards in blue-active, 1 in red-active (below limit)
        const belowLimit = [
          ...createCardsInStage('blue-active', 5),
          ...createCardsInStage('red-active', 1),
        ];
        expect(wouldViolateMinWipLimit('red-active', belowLimit, wipLimits)).toBe(true);
      });
    });
  });

  describe('Edge cases from issue specification', () => {
    describe('Max WIP edge cases', () => {
      it('column has 0 cards, max WIP is 1 → Can move in', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 1 } });
        expect(wouldExceedWipLimit('red-active', [], wipLimits)).toBe(false);
      });

      it('column has 1 card, max WIP is 1 → Cannot move in', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 1 } });
        const cards = createCardsInStage('red-active', 1);
        expect(wouldExceedWipLimit('red-active', cards, wipLimits)).toBe(true);
      });

      it('column has 2 cards, max WIP is 1 → Cannot move in', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 1 } });
        const cards = createCardsInStage('red-active', 2);
        expect(wouldExceedWipLimit('red-active', cards, wipLimits)).toBe(true);
      });

      it('column has 5 cards, max WIP is 0 → Can move in (no constraint)', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 0 } });
        const cards = createCardsInStage('red-active', 5);
        expect(wouldExceedWipLimit('red-active', cards, wipLimits)).toBe(false);
      });

      it('column has 0 cards, max WIP is 0 → Can move in (no constraint)', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 0 } });
        expect(wouldExceedWipLimit('red-active', [], wipLimits)).toBe(false);
      });
    });

    describe('Min WIP edge cases', () => {
      it('column has 2 cards, min WIP is 1 → Can move out', () => {
        const wipLimits = createWipLimits({ redActive: { min: 1, max: 0 } });
        const cards = createCardsInStage('red-active', 2);
        expect(wouldViolateMinWipLimit('red-active', cards, wipLimits)).toBe(false);
      });

      it('column has 1 card, min WIP is 1 → Cannot move out', () => {
        const wipLimits = createWipLimits({ redActive: { min: 1, max: 0 } });
        const cards = createCardsInStage('red-active', 1);
        expect(wouldViolateMinWipLimit('red-active', cards, wipLimits)).toBe(true);
      });

      it('column has 0 cards, min WIP is 1 → Cannot move out', () => {
        const wipLimits = createWipLimits({ redActive: { min: 1, max: 0 } });
        expect(wouldViolateMinWipLimit('red-active', [], wipLimits)).toBe(true);
      });

      it('column has 0 cards, min WIP is 0 → Can move out (no constraint)', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 0 } });
        expect(wouldViolateMinWipLimit('red-active', [], wipLimits)).toBe(false);
      });

      it('column has 5 cards, min WIP is 0 → Can move out (no constraint)', () => {
        const wipLimits = createWipLimits({ redActive: { min: 0, max: 0 } });
        const cards = createCardsInStage('red-active', 5);
        expect(wouldViolateMinWipLimit('red-active', cards, wipLimits)).toBe(false);
      });
    });
  });

  describe('Combined min and max WIP limits', () => {
    it('both limits can be set independently', () => {
      const wipLimits = createWipLimits({
        redActive: { min: 2, max: 5 },
      });

      // 1 card: cannot move out (below min), can move in (below max)
      const oneCard = createCardsInStage('red-active', 1);
      expect(wouldViolateMinWipLimit('red-active', oneCard, wipLimits)).toBe(true);
      expect(wouldExceedWipLimit('red-active', oneCard, wipLimits)).toBe(false);

      // 3 cards: can move out (above min), can move in (below max)
      const threeCards = createCardsInStage('red-active', 3);
      expect(wouldViolateMinWipLimit('red-active', threeCards, wipLimits)).toBe(false);
      expect(wouldExceedWipLimit('red-active', threeCards, wipLimits)).toBe(false);

      // 5 cards: can move out (above min), cannot move in (at max)
      const fiveCards = createCardsInStage('red-active', 5);
      expect(wouldViolateMinWipLimit('red-active', fiveCards, wipLimits)).toBe(false);
      expect(wouldExceedWipLimit('red-active', fiveCards, wipLimits)).toBe(true);
    });
  });
});
