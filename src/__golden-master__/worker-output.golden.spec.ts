/**
 * Golden Master Tests for Worker Output Calculation
 *
 * These tests capture the CURRENT behavior of worker output calculation in App.tsx.
 * They serve as a safety net during refactoring - any failing test indicates a
 * behavioral change that must be either intentional (document as bug fix) or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.2
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Types duplicated from App.tsx for test isolation
type WorkerType = 'red' | 'blue' | 'green';
type ColumnColor = 'red' | 'blue' | 'green';

interface WorkItemsType {
  red: { total: number; completed: number };
  blue: { total: number; completed: number };
  green: { total: number; completed: number };
}

interface AssignedWorker {
  id: string;
  type: WorkerType;
}

interface Card {
  id: string;
  stage: string;
  workItems: WorkItemsType;
  assignedWorkers: AssignedWorker[];
}

// Duplicated from App.tsx lines 17-19 - DO NOT MODIFY
// This captures the exact current behavior for golden master comparison
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Duplicated worker output calculation logic from App.tsx lines 336-378
// DO NOT MODIFY - this captures exact current behavior
const calculateWorkerOutput = (card: Card): WorkItemsType => {
  // Skip cards without workers or not in active/green stages
  if (!card.assignedWorkers.length || (!card.stage.includes('active') && card.stage !== 'green')) {
    return card.workItems;
  }

  const updatedWorkItems = { ...card.workItems };
  const columnColor: ColumnColor = card.stage.includes('red') ? 'red' :
    card.stage.includes('blue') ? 'blue' : 'green';

  // Process each assigned worker
  card.assignedWorkers.forEach(worker => {
    const workerType = worker.type;

    // Determine output based on worker color and column color
    let outputAmount = 0;

    if (workerType === columnColor) {
      // Worker is specialized in this color - output 3-6 boxes
      outputAmount = getRandomInt(3, 6);
    } else {
      // Worker is not specialized - output 0-3 boxes
      outputAmount = getRandomInt(0, 3);
    }

    // Apply the output to the work items
    if (updatedWorkItems[columnColor]) {
      const newCompleted = Math.min(
        updatedWorkItems[columnColor].total,
        updatedWorkItems[columnColor].completed + outputAmount
      );

      updatedWorkItems[columnColor] = {
        ...updatedWorkItems[columnColor],
        completed: newCompleted
      };
    }
  });

  return updatedWorkItems;
};

// Helper to create a card with defaults
const createCard = (
  stage: string,
  assignedWorkers: AssignedWorker[],
  workItems?: Partial<WorkItemsType>
): Card => ({
  id: 'test-card',
  stage,
  assignedWorkers,
  workItems: {
    red: workItems?.red ?? { total: 10, completed: 0 },
    blue: workItems?.blue ?? { total: 10, completed: 0 },
    green: workItems?.green ?? { total: 10, completed: 0 },
  },
});

// Helper to create an assigned worker
const createWorker = (type: WorkerType, id = 'worker-1'): AssignedWorker => ({
  id,
  type,
});

describe('Golden Master: getRandomInt() helper function', () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  it('returns min value when Math.random() returns 0', () => {
    mathRandomSpy.mockReturnValue(0);
    expect(getRandomInt(3, 6)).toBe(3);
    expect(getRandomInt(0, 3)).toBe(0);
  });

  it('returns max value when Math.random() returns 0.999', () => {
    mathRandomSpy.mockReturnValue(0.999);
    expect(getRandomInt(3, 6)).toBe(6);
    expect(getRandomInt(0, 3)).toBe(3);
  });

  it('returns values within range for various random values', () => {
    // Test middle value
    mathRandomSpy.mockReturnValue(0.5);
    // For range 3-6: floor(0.5 * 4) + 3 = floor(2) + 3 = 5
    expect(getRandomInt(3, 6)).toBe(5);
    // For range 0-3: floor(0.5 * 4) + 0 = floor(2) + 0 = 2
    expect(getRandomInt(0, 3)).toBe(2);
  });

  it('handles single value range (min === max)', () => {
    mathRandomSpy.mockReturnValue(0);
    expect(getRandomInt(5, 5)).toBe(5);
    mathRandomSpy.mockReturnValue(0.999);
    expect(getRandomInt(5, 5)).toBe(5);
  });
});

describe('Golden Master: Worker Output Calculation', () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  describe('Stage filtering', () => {
    it('does not apply output to cards without assigned workers', () => {
      mathRandomSpy.mockReturnValue(0.5);
      const card = createCard('red-active', []);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(0);
    });

    it.each([
      'options',
      'red-finished',
      'blue-finished',
      'done',
    ])('does not apply output to cards in %s stage', (stage) => {
      mathRandomSpy.mockReturnValue(0.5);
      const card = createCard(stage, [createWorker('red')]);
      const result = calculateWorkerOutput(card);
      // Work items should be unchanged
      expect(result.red.completed).toBe(0);
      expect(result.blue.completed).toBe(0);
      expect(result.green.completed).toBe(0);
    });

    it.each([
      'red-active',
      'blue-active',
      'green',
    ])('applies output to cards in %s stage', (stage) => {
      mathRandomSpy.mockReturnValue(0.5);
      const color = stage.includes('red') ? 'red' : stage.includes('blue') ? 'blue' : 'green';
      const card = createCard(stage, [createWorker(color as WorkerType)]);
      const result = calculateWorkerOutput(card);
      // Specialized worker with random 0.5 produces 5 units (3-6 range)
      expect(result[color].completed).toBe(5);
    });
  });

  describe('Specialized worker output (3-6 range)', () => {
    it.each([
      ['red', 'red-active'],
      ['blue', 'blue-active'],
      ['green', 'green'],
    ] as const)('%s worker on %s column produces 3-6 units', (workerColor, stage) => {
      // Test minimum (random = 0)
      mathRandomSpy.mockReturnValue(0);
      let card = createCard(stage, [createWorker(workerColor)]);
      let result = calculateWorkerOutput(card);
      const color = stage.includes('red') ? 'red' : stage.includes('blue') ? 'blue' : 'green';
      expect(result[color].completed).toBe(3);

      // Test maximum (random = 0.999)
      mathRandomSpy.mockReturnValue(0.999);
      card = createCard(stage, [createWorker(workerColor)]);
      result = calculateWorkerOutput(card);
      expect(result[color].completed).toBe(6);
    });
  });

  describe('Non-specialized worker output (0-3 range)', () => {
    it.each([
      // Red worker on non-red columns
      ['red', 'blue-active', 'blue'],
      ['red', 'green', 'green'],
      // Blue worker on non-blue columns
      ['blue', 'red-active', 'red'],
      ['blue', 'green', 'green'],
      // Green worker on non-green columns
      ['green', 'red-active', 'red'],
      ['green', 'blue-active', 'blue'],
    ] as const)('%s worker on %s column produces 0-3 units', (workerColor, stage, columnColor) => {
      // Test minimum (random = 0)
      mathRandomSpy.mockReturnValue(0);
      let card = createCard(stage, [createWorker(workerColor)]);
      let result = calculateWorkerOutput(card);
      expect(result[columnColor].completed).toBe(0);

      // Test maximum (random = 0.999)
      mathRandomSpy.mockReturnValue(0.999);
      card = createCard(stage, [createWorker(workerColor)]);
      result = calculateWorkerOutput(card);
      expect(result[columnColor].completed).toBe(3);
    });
  });

  describe('All 9 worker/column combinations', () => {
    const stages: Array<{ stage: string; color: ColumnColor }> = [
      { stage: 'red-active', color: 'red' },
      { stage: 'blue-active', color: 'blue' },
      { stage: 'green', color: 'green' },
    ];

    const workerTypes: WorkerType[] = ['red', 'blue', 'green'];

    it.each(
      stages.flatMap(({ stage, color }) =>
        workerTypes.map(workerType => ({
          workerType,
          stage,
          columnColor: color,
          isSpecialized: workerType === color,
          expectedMin: workerType === color ? 3 : 0,
          expectedMax: workerType === color ? 6 : 3,
        }))
      )
    )(
      '$workerType worker on $stage: specialized=$isSpecialized, range=$expectedMin-$expectedMax',
      ({ workerType, stage, columnColor, expectedMin, expectedMax }) => {
        // Test minimum
        mathRandomSpy.mockReturnValue(0);
        let card = createCard(stage, [createWorker(workerType)]);
        let result = calculateWorkerOutput(card);
        expect(result[columnColor].completed).toBe(expectedMin);

        // Test maximum
        mathRandomSpy.mockReturnValue(0.999);
        card = createCard(stage, [createWorker(workerType)]);
        result = calculateWorkerOutput(card);
        expect(result[columnColor].completed).toBe(expectedMax);
      }
    );
  });

  describe('Work item capping', () => {
    it('caps output at total work items (does not exceed)', () => {
      mathRandomSpy.mockReturnValue(0.999); // Would produce 6 units
      const card = createCard('red-active', [createWorker('red')], {
        red: { total: 4, completed: 0 },
      });
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(4); // Capped at total
    });

    it('caps output when already partially completed', () => {
      mathRandomSpy.mockReturnValue(0.999); // Would produce 6 units
      const card = createCard('red-active', [createWorker('red')], {
        red: { total: 10, completed: 8 },
      });
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(10); // 8 + 6 = 14, capped at 10
    });

    it('does not change completed when already at total', () => {
      mathRandomSpy.mockReturnValue(0.999);
      const card = createCard('red-active', [createWorker('red')], {
        red: { total: 10, completed: 10 },
      });
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(10);
    });

    it('handles 0 total work items', () => {
      mathRandomSpy.mockReturnValue(0.5);
      const card = createCard('red-active', [createWorker('red')], {
        red: { total: 0, completed: 0 },
      });
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(0); // Capped at 0
    });
  });

  describe('Multiple workers on same card', () => {
    it('applies output from each worker independently', () => {
      // Two specialized workers, each producing 3 units (min)
      mathRandomSpy.mockReturnValue(0);
      const card = createCard('red-active', [
        createWorker('red', 'worker-1'),
        createWorker('red', 'worker-2'),
      ]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(6); // 3 + 3
    });

    it('applies output from mixed worker types', () => {
      // One specialized (3-6) and one non-specialized (0-3)
      mathRandomSpy.mockReturnValue(0);
      const card = createCard('red-active', [
        createWorker('red', 'worker-1'),   // Specialized: 3 units
        createWorker('blue', 'worker-2'),  // Non-specialized: 0 units
      ]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(3); // 3 + 0
    });

    it('caps combined output at total', () => {
      mathRandomSpy.mockReturnValue(0.999); // Each produces max
      const card = createCard('red-active', [
        createWorker('red', 'worker-1'),   // 6 units
        createWorker('red', 'worker-2'),   // 6 units
      ], {
        red: { total: 10, completed: 0 },
      });
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(10); // 6 + 6 = 12, capped at 10
    });

    it('applies sequential output respecting running total', () => {
      // First worker brings to 8, second would add 6 but caps at 10
      mathRandomSpy.mockReturnValue(0.999);
      const card = createCard('red-active', [
        createWorker('red', 'worker-1'),
        createWorker('red', 'worker-2'),
      ], {
        red: { total: 10, completed: 5 },
      });
      const result = calculateWorkerOutput(card);
      // 5 + 6 = 11 -> 10, then 10 + 6 = 16 -> 10
      expect(result.red.completed).toBe(10);
    });
  });

  describe('Column color detection', () => {
    it('detects red column from red-active stage', () => {
      mathRandomSpy.mockReturnValue(0);
      const card = createCard('red-active', [createWorker('red')]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(3);
      expect(result.blue.completed).toBe(0);
      expect(result.green.completed).toBe(0);
    });

    it('detects blue column from blue-active stage', () => {
      mathRandomSpy.mockReturnValue(0);
      const card = createCard('blue-active', [createWorker('blue')]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(0);
      expect(result.blue.completed).toBe(3);
      expect(result.green.completed).toBe(0);
    });

    it('detects green column from green stage', () => {
      mathRandomSpy.mockReturnValue(0);
      const card = createCard('green', [createWorker('green')]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(0);
      expect(result.blue.completed).toBe(0);
      expect(result.green.completed).toBe(3);
    });
  });

  describe('Edge cases from issue specification', () => {
    it('handles Math.random() returning exactly 0', () => {
      mathRandomSpy.mockReturnValue(0);
      const card = createCard('red-active', [createWorker('red')]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(3); // Minimum of specialized range
    });

    it('handles Math.random() returning 0.999 (near 1)', () => {
      mathRandomSpy.mockReturnValue(0.999);
      const card = createCard('red-active', [createWorker('red')]);
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(6); // Maximum of specialized range
    });

    it('handles card with 0 remaining work (already complete)', () => {
      mathRandomSpy.mockReturnValue(0.999);
      const card = createCard('red-active', [createWorker('red')], {
        red: { total: 5, completed: 5 },
      });
      const result = calculateWorkerOutput(card);
      expect(result.red.completed).toBe(5); // No change, already complete
    });
  });
});
