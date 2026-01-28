import { describe, it, expect } from 'vitest';
import { WorkerOutputCalculator } from './worker-output';
import type { WorkerType } from './worker-type';

type ColumnColor = 'red' | 'blue' | 'green';

describe('WorkerOutputCalculator', () => {
  describe('calculate', () => {
    describe('specialized worker output (3-6 range)', () => {
      it.each([
        ['red', 'red'],
        ['blue', 'blue'],
        ['green', 'green'],
      ] as const)(
        '%s worker on %s column produces 3-6 units',
        (workerType: WorkerType, columnColor: ColumnColor) => {
          const minResult = WorkerOutputCalculator.calculate(
            workerType,
            columnColor,
            () => 0
          );
          expect(minResult).toBe(3);

          const maxResult = WorkerOutputCalculator.calculate(
            workerType,
            columnColor,
            () => 0.999
          );
          expect(maxResult).toBe(6);
        }
      );
    });

    describe('non-specialized worker output (0-3 range)', () => {
      it.each([
        ['red', 'blue'],
        ['red', 'green'],
        ['blue', 'red'],
        ['blue', 'green'],
        ['green', 'red'],
        ['green', 'blue'],
      ] as const)(
        '%s worker on %s column produces 0-3 units',
        (workerType: WorkerType, columnColor: ColumnColor) => {
          const minResult = WorkerOutputCalculator.calculate(
            workerType,
            columnColor,
            () => 0
          );
          expect(minResult).toBe(0);

          const maxResult = WorkerOutputCalculator.calculate(
            workerType,
            columnColor,
            () => 0.999
          );
          expect(maxResult).toBe(3);
        }
      );
    });

    describe('all 9 worker/column combinations', () => {
      const columnColors: ColumnColor[] = ['red', 'blue', 'green'];
      const workerTypes: WorkerType[] = ['red', 'blue', 'green'];

      it.each(
        columnColors.flatMap((columnColor) =>
          workerTypes.map((workerType) => ({
            workerType,
            columnColor,
            isSpecialized: workerType === columnColor,
            expectedMin: workerType === columnColor ? 3 : 0,
            expectedMax: workerType === columnColor ? 6 : 3,
          }))
        )
      )(
        '$workerType worker on $columnColor: specialized=$isSpecialized, range=$expectedMin-$expectedMax',
        ({ workerType, columnColor, expectedMin, expectedMax }) => {
          const minResult = WorkerOutputCalculator.calculate(
            workerType,
            columnColor,
            () => 0
          );
          expect(minResult).toBe(expectedMin);

          const maxResult = WorkerOutputCalculator.calculate(
            workerType,
            columnColor,
            () => 0.999
          );
          expect(maxResult).toBe(expectedMax);
        }
      );
    });

    describe('random value distribution', () => {
      it('returns min value when random returns 0', () => {
        const result = WorkerOutputCalculator.calculate('red', 'red', () => 0);
        expect(result).toBe(3);
      });

      it('returns max value when random returns 0.999', () => {
        const result = WorkerOutputCalculator.calculate(
          'red',
          'red',
          () => 0.999
        );
        expect(result).toBe(6);
      });

      it('returns middle value when random returns 0.5', () => {
        const result = WorkerOutputCalculator.calculate(
          'red',
          'red',
          () => 0.5
        );
        expect(result).toBe(5);
      });

      it('uses Math.random when no random function provided', () => {
        const result = WorkerOutputCalculator.calculate('red', 'red');
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(6);
      });
    });

    describe('edge cases', () => {
      it('handles random returning exactly 0', () => {
        const specialized = WorkerOutputCalculator.calculate(
          'red',
          'red',
          () => 0
        );
        expect(specialized).toBe(3);

        const nonSpecialized = WorkerOutputCalculator.calculate(
          'red',
          'blue',
          () => 0
        );
        expect(nonSpecialized).toBe(0);
      });

      it('handles random returning very close to 1', () => {
        const specialized = WorkerOutputCalculator.calculate(
          'red',
          'red',
          () => 0.9999999
        );
        expect(specialized).toBe(6);

        const nonSpecialized = WorkerOutputCalculator.calculate(
          'red',
          'blue',
          () => 0.9999999
        );
        expect(nonSpecialized).toBe(3);
      });
    });
  });

  describe('isSpecialized', () => {
    it('returns true when worker type matches column color', () => {
      expect(WorkerOutputCalculator.isSpecialized('red', 'red')).toBe(true);
      expect(WorkerOutputCalculator.isSpecialized('blue', 'blue')).toBe(true);
      expect(WorkerOutputCalculator.isSpecialized('green', 'green')).toBe(true);
    });

    it('returns false when worker type does not match column color', () => {
      expect(WorkerOutputCalculator.isSpecialized('red', 'blue')).toBe(false);
      expect(WorkerOutputCalculator.isSpecialized('red', 'green')).toBe(false);
      expect(WorkerOutputCalculator.isSpecialized('blue', 'red')).toBe(false);
      expect(WorkerOutputCalculator.isSpecialized('blue', 'green')).toBe(false);
      expect(WorkerOutputCalculator.isSpecialized('green', 'red')).toBe(false);
      expect(WorkerOutputCalculator.isSpecialized('green', 'blue')).toBe(false);
    });
  });

  describe('getOutputRange', () => {
    it('returns 3-6 range for specialized worker', () => {
      const range = WorkerOutputCalculator.getOutputRange('red', 'red');
      expect(range).toEqual({ min: 3, max: 6 });
    });

    it('returns 0-3 range for non-specialized worker', () => {
      const range = WorkerOutputCalculator.getOutputRange('red', 'blue');
      expect(range).toEqual({ min: 0, max: 3 });
    });
  });
});
