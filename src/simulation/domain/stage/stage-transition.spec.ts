import { describe, it, expect } from 'vitest';
import { canTransition } from './stage-transition';
import type { Card, Stage, WorkItems } from '../card/card';
import { CardId } from '../card/card-id';

function buildCard(stage: Stage, workItems: WorkItems, isBlocked = false): Card {
  return {
    id: CardId.create('TEST'),
    content: 'Test Card',
    stage,
    age: 0,
    workItems,
    isBlocked,
    startDay: 1,
    completionDay: null,
    assignedWorkers: [],
  };
}

function buildWorkItems(
  red: { total: number; completed: number },
  blue: { total: number; completed: number },
  green: { total: number; completed: number }
): WorkItems {
  return { red, blue, green };
}

const redComplete = { total: 5, completed: 5 };
const redIncomplete = { total: 5, completed: 4 };
const redNoWork = { total: 0, completed: 0 };
const blueComplete = { total: 3, completed: 3 };
const blueIncomplete = { total: 3, completed: 2 };
const blueNoWork = { total: 0, completed: 0 };
const greenComplete = { total: 2, completed: 2 };
const greenIncomplete = { total: 2, completed: 1 };
const greenNoWork = { total: 0, completed: 0 };

describe('StageTransitionService.canTransition', () => {
  describe('blocked cards', () => {
    it('returns false for blocked card regardless of work completion', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems(redComplete, blueNoWork, greenNoWork),
        true
      );

      expect(canTransition(card)).toBe(false);
    });

    it.each<Stage>([
      'options',
      'red-active',
      'red-finished',
      'blue-active',
      'blue-finished',
      'green',
      'done',
    ])('returns false for blocked card in %s stage', (stage) => {
      const card = buildCard(
        stage,
        buildWorkItems(redComplete, blueComplete, greenComplete),
        true
      );
      expect(canTransition(card)).toBe(false);
    });
  });

  describe('options stage', () => {
    it('returns false even when all work is complete', () => {
      const card = buildCard(
        'options',
        buildWorkItems(redComplete, blueComplete, greenComplete)
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('red-active stage', () => {
    it('returns true when red work is complete and total > 0', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems(redComplete, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when red work is incomplete', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems(redIncomplete, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red total is 0', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems(redNoWork, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns true when red completed exceeds total', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems({ total: 5, completed: 7 }, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });
  });

  describe('red-finished stage', () => {
    it('returns true when red work is complete and total > 0', () => {
      const card = buildCard(
        'red-finished',
        buildWorkItems(redComplete, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when red work is incomplete', () => {
      const card = buildCard(
        'red-finished',
        buildWorkItems({ total: 5, completed: 3 }, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red total is 0', () => {
      const card = buildCard(
        'red-finished',
        buildWorkItems(redNoWork, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('blue-active stage', () => {
    it('returns true when blue work is complete, total > 0, and red is complete', () => {
      const card = buildCard(
        'blue-active',
        buildWorkItems(redComplete, blueComplete, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when blue work is incomplete', () => {
      const card = buildCard(
        'blue-active',
        buildWorkItems(redComplete, blueIncomplete, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red work is incomplete', () => {
      const card = buildCard(
        'blue-active',
        buildWorkItems(redIncomplete, blueComplete, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when blue total is 0', () => {
      const card = buildCard(
        'blue-active',
        buildWorkItems(redComplete, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns true when red total is 0 but blue has work and is complete', () => {
      const card = buildCard(
        'blue-active',
        buildWorkItems(redNoWork, blueComplete, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });
  });

  describe('blue-finished stage', () => {
    it('returns true when blue work is complete, total > 0, and red is complete', () => {
      const card = buildCard(
        'blue-finished',
        buildWorkItems(redComplete, blueComplete, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when blue work is incomplete', () => {
      const card = buildCard(
        'blue-finished',
        buildWorkItems(redComplete, { total: 3, completed: 1 }, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when blue total is 0', () => {
      const card = buildCard(
        'blue-finished',
        buildWorkItems(redComplete, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('green stage', () => {
    it('returns true when all work is complete and green total > 0', () => {
      const card = buildCard(
        'green',
        buildWorkItems(redComplete, blueComplete, greenComplete)
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when green work is incomplete', () => {
      const card = buildCard(
        'green',
        buildWorkItems(redComplete, blueComplete, greenIncomplete)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when blue work is incomplete', () => {
      const card = buildCard(
        'green',
        buildWorkItems(redComplete, blueIncomplete, greenComplete)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red work is incomplete', () => {
      const card = buildCard(
        'green',
        buildWorkItems(redIncomplete, blueComplete, greenComplete)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when green total is 0', () => {
      const card = buildCard(
        'green',
        buildWorkItems(redComplete, blueComplete, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns true when red and blue totals are 0 but green is complete', () => {
      const card = buildCard(
        'green',
        buildWorkItems(redNoWork, blueNoWork, greenComplete)
      );

      expect(canTransition(card)).toBe(true);
    });
  });

  describe('done stage', () => {
    it('returns false even when all work is complete', () => {
      const card = buildCard(
        'done',
        buildWorkItems(redComplete, blueComplete, greenComplete)
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles cards with zero work in all colors in red-active', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems(redNoWork, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(false);
    });

    it('handles cards with very large work values', () => {
      const card = buildCard(
        'red-active',
        buildWorkItems({ total: 1000000, completed: 1000000 }, blueNoWork, greenNoWork)
      );

      expect(canTransition(card)).toBe(true);
    });
  });
});
