import { describe, it, expect } from 'vitest';
import { WorkItems, type WorkProgress } from './work-items';

describe('WorkItems', () => {
  describe('create', () => {
    it('should create work items with given progress for each color', () => {
      const red: WorkProgress = { total: 5, completed: 2 };
      const blue: WorkProgress = { total: 3, completed: 0 };
      const green: WorkProgress = { total: 4, completed: 4 };

      const items = WorkItems.create(red, blue, green);

      expect(items.red).toEqual(red);
      expect(items.blue).toEqual(blue);
      expect(items.green).toEqual(green);
    });
  });

  describe('empty', () => {
    it('should create work items with zero totals and completed', () => {
      const items = WorkItems.empty();

      expect(items.red).toEqual({ total: 0, completed: 0 });
      expect(items.blue).toEqual({ total: 0, completed: 0 });
      expect(items.green).toEqual({ total: 0, completed: 0 });
    });
  });

  describe('isColorComplete', () => {
    it('should return true when completed equals total', () => {
      const items = WorkItems.create(
        { total: 5, completed: 5 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      expect(WorkItems.isColorComplete(items, 'red')).toBe(true);
    });

    it('should return false when completed is less than total', () => {
      const items = WorkItems.create(
        { total: 5, completed: 4 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      expect(WorkItems.isColorComplete(items, 'red')).toBe(false);
    });

    it('should return true when completed exceeds total (over-completed)', () => {
      const items = WorkItems.create(
        { total: 5, completed: 6 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      expect(WorkItems.isColorComplete(items, 'red')).toBe(true);
    });

    it('should return true when total is zero (no work required)', () => {
      const items = WorkItems.create(
        { total: 0, completed: 0 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      expect(WorkItems.isColorComplete(items, 'red')).toBe(true);
    });

    it('should return true when blue is complete', () => {
      const items = WorkItems.create(
        { total: 5, completed: 0 },
        { total: 3, completed: 3 },
        { total: 4, completed: 0 }
      );

      expect(WorkItems.isColorComplete(items, 'blue')).toBe(true);
    });

    it('should return true when green is complete', () => {
      const items = WorkItems.create(
        { total: 5, completed: 0 },
        { total: 3, completed: 0 },
        { total: 4, completed: 4 }
      );

      expect(WorkItems.isColorComplete(items, 'green')).toBe(true);
    });
  });

  describe('isAllComplete', () => {
    it('should return true when all colors are complete', () => {
      const items = WorkItems.create(
        { total: 5, completed: 5 },
        { total: 3, completed: 3 },
        { total: 4, completed: 4 }
      );

      expect(WorkItems.isAllComplete(items)).toBe(true);
    });

    it('should return false when red is incomplete', () => {
      const items = WorkItems.create(
        { total: 5, completed: 4 },
        { total: 3, completed: 3 },
        { total: 4, completed: 4 }
      );

      expect(WorkItems.isAllComplete(items)).toBe(false);
    });

    it('should return false when blue is incomplete', () => {
      const items = WorkItems.create(
        { total: 5, completed: 5 },
        { total: 3, completed: 2 },
        { total: 4, completed: 4 }
      );

      expect(WorkItems.isAllComplete(items)).toBe(false);
    });

    it('should return false when green is incomplete', () => {
      const items = WorkItems.create(
        { total: 5, completed: 5 },
        { total: 3, completed: 3 },
        { total: 4, completed: 3 }
      );

      expect(WorkItems.isAllComplete(items)).toBe(false);
    });

    it('should return true when all totals are zero', () => {
      const items = WorkItems.empty();

      expect(WorkItems.isAllComplete(items)).toBe(true);
    });
  });

  describe('applyWork', () => {
    it('should return new work items with increased completed count', () => {
      const original = WorkItems.create(
        { total: 5, completed: 2 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      const updated = WorkItems.applyWork(original, 'red', 2);

      expect(updated.red.completed).toBe(4);
      expect(updated).not.toBe(original);
      expect(original.red.completed).toBe(2);
    });

    it('should cap completed at total', () => {
      const original = WorkItems.create(
        { total: 5, completed: 3 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      const updated = WorkItems.applyWork(original, 'red', 10);

      expect(updated.red.completed).toBe(5);
    });

    it('should apply work to blue color', () => {
      const original = WorkItems.create(
        { total: 5, completed: 0 },
        { total: 3, completed: 1 },
        { total: 4, completed: 0 }
      );

      const updated = WorkItems.applyWork(original, 'blue', 2);

      expect(updated.blue.completed).toBe(3);
      expect(updated.red.completed).toBe(0);
    });

    it('should apply work to green color', () => {
      const original = WorkItems.create(
        { total: 5, completed: 0 },
        { total: 3, completed: 0 },
        { total: 4, completed: 1 }
      );

      const updated = WorkItems.applyWork(original, 'green', 2);

      expect(updated.green.completed).toBe(3);
    });

    it('should not change anything when applying zero work', () => {
      const original = WorkItems.create(
        { total: 5, completed: 2 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      const updated = WorkItems.applyWork(original, 'red', 0);

      expect(updated.red.completed).toBe(2);
    });

    it('should treat negative amounts as zero', () => {
      const original = WorkItems.create(
        { total: 5, completed: 2 },
        { total: 3, completed: 0 },
        { total: 4, completed: 0 }
      );

      const updated = WorkItems.applyWork(original, 'red', -5);

      expect(updated.red.completed).toBe(2);
    });

    it('should preserve other colors when applying work', () => {
      const original = WorkItems.create(
        { total: 5, completed: 2 },
        { total: 3, completed: 1 },
        { total: 4, completed: 3 }
      );

      const updated = WorkItems.applyWork(original, 'red', 1);

      expect(updated.blue).toEqual(original.blue);
      expect(updated.green).toEqual(original.green);
    });
  });
});
