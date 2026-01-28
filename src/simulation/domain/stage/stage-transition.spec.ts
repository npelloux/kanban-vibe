import { describe, it, expect } from 'vitest';
import { canTransition } from './stage-transition';
import type { Card, Stage, WorkItems } from '../card/card';
import { CardId } from '../card/card-id';

// Helper to create test cards with specific configurations
function createTestCard(
  stage: Stage,
  workItems: WorkItems,
  isBlocked = false
): Card {
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

// Helper for creating work items
function createWorkItems(
  red: { total: number; completed: number },
  blue: { total: number; completed: number },
  green: { total: number; completed: number }
): WorkItems {
  return { red, blue, green };
}

describe('StageTransitionService.canTransition', () => {
  describe('blocked cards', () => {
    it('returns false for blocked card regardless of work completion', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 5, completed: 5 }, // red complete
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        ),
        true // blocked
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false for blocked card in any stage', () => {
      const stages: Stage[] = [
        'options',
        'red-active',
        'red-finished',
        'blue-active',
        'blue-finished',
        'green',
        'done',
      ];

      for (const stage of stages) {
        const card = createTestCard(
          stage,
          createWorkItems(
            { total: 5, completed: 5 },
            { total: 3, completed: 3 },
            { total: 2, completed: 2 }
          ),
          true
        );
        expect(canTransition(card)).toBe(false);
      }
    });
  });

  describe('options stage', () => {
    it('returns false even when all work is complete', () => {
      const card = createTestCard(
        'options',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 3 },
          { total: 2, completed: 2 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('red-active stage', () => {
    it('returns true when red work is complete and total > 0', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 5, completed: 5 }, // red complete
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when red work is incomplete', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 5, completed: 4 }, // red incomplete
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red total is 0', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 0, completed: 0 }, // no red work
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns true when red completed exceeds total', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 5, completed: 7 }, // over-completed (shouldn't happen but edge case)
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });
  });

  describe('red-finished stage', () => {
    it('returns true when red work is complete and total > 0', () => {
      const card = createTestCard(
        'red-finished',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when red work is incomplete', () => {
      const card = createTestCard(
        'red-finished',
        createWorkItems(
          { total: 5, completed: 3 },
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red total is 0', () => {
      const card = createTestCard(
        'red-finished',
        createWorkItems(
          { total: 0, completed: 0 },
          { total: 3, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('blue-active stage', () => {
    it('returns true when blue work is complete, total > 0, and red is complete', () => {
      const card = createTestCard(
        'blue-active',
        createWorkItems(
          { total: 5, completed: 5 }, // red complete
          { total: 3, completed: 3 }, // blue complete
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when blue work is incomplete', () => {
      const card = createTestCard(
        'blue-active',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 2 }, // blue incomplete
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red work is incomplete', () => {
      const card = createTestCard(
        'blue-active',
        createWorkItems(
          { total: 5, completed: 4 }, // red incomplete
          { total: 3, completed: 3 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when blue total is 0', () => {
      const card = createTestCard(
        'blue-active',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 0, completed: 0 }, // no blue work
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns true when red total is 0 but completed >= total', () => {
      const card = createTestCard(
        'blue-active',
        createWorkItems(
          { total: 0, completed: 0 }, // red has no work, counts as complete
          { total: 3, completed: 3 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });
  });

  describe('blue-finished stage', () => {
    it('returns true when blue work is complete, total > 0, and red is complete', () => {
      const card = createTestCard(
        'blue-finished',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 3 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when blue work is incomplete', () => {
      const card = createTestCard(
        'blue-finished',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 1 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when blue total is 0', () => {
      const card = createTestCard(
        'blue-finished',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 0, completed: 0 },
          { total: 2, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('green stage', () => {
    it('returns true when all work is complete and green total > 0', () => {
      const card = createTestCard(
        'green',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 3 },
          { total: 2, completed: 2 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });

    it('returns false when green work is incomplete', () => {
      const card = createTestCard(
        'green',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 3 },
          { total: 2, completed: 1 } // green incomplete
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when blue work is incomplete', () => {
      const card = createTestCard(
        'green',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 2 }, // blue incomplete
          { total: 2, completed: 2 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when red work is incomplete', () => {
      const card = createTestCard(
        'green',
        createWorkItems(
          { total: 5, completed: 4 }, // red incomplete
          { total: 3, completed: 3 },
          { total: 2, completed: 2 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns false when green total is 0', () => {
      const card = createTestCard(
        'green',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 3 },
          { total: 0, completed: 0 } // no green work
        )
      );

      expect(canTransition(card)).toBe(false);
    });

    it('returns true when red and blue totals are 0 but green is complete', () => {
      const card = createTestCard(
        'green',
        createWorkItems(
          { total: 0, completed: 0 },
          { total: 0, completed: 0 },
          { total: 2, completed: 2 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });
  });

  describe('done stage', () => {
    it('returns false even when all work is complete', () => {
      const card = createTestCard(
        'done',
        createWorkItems(
          { total: 5, completed: 5 },
          { total: 3, completed: 3 },
          { total: 2, completed: 2 }
        )
      );

      expect(canTransition(card)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles cards with zero work in all colors', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 0, completed: 0 },
          { total: 0, completed: 0 },
          { total: 0, completed: 0 }
        )
      );

      // red total is 0, so cannot transition
      expect(canTransition(card)).toBe(false);
    });

    it('handles cards with very large work values', () => {
      const card = createTestCard(
        'red-active',
        createWorkItems(
          { total: 1000000, completed: 1000000 },
          { total: 0, completed: 0 },
          { total: 0, completed: 0 }
        )
      );

      expect(canTransition(card)).toBe(true);
    });
  });
});
