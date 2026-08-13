import type { WorkerType } from './worker-type';

export type ColumnColor = 'red' | 'blue' | 'green';

export type RandomFn = () => number;

export interface OutputRange {
  readonly min: number;
  readonly max: number;
}

export const SPECIALIZED_RANGE: OutputRange = { min: 3, max: 6 };
export const NON_SPECIALIZED_RANGE: OutputRange = { min: 0, max: 3 };

export class WorkerOutputCalculator {
  static isSpecialized(workerType: WorkerType, columnColor: ColumnColor): boolean {
    return workerType === columnColor;
  }

  static getOutputRange(workerType: WorkerType, columnColor: ColumnColor): OutputRange {
    return this.isSpecialized(workerType, columnColor)
      ? SPECIALIZED_RANGE
      : NON_SPECIALIZED_RANGE;
  }

  static calculate(
    workerType: WorkerType,
    columnColor: ColumnColor,
    random: RandomFn = Math.random
  ): number {
    return this.calculateInRange(this.getOutputRange(workerType, columnColor), random);
  }

  static calculateInRange(range: OutputRange, random: RandomFn = Math.random): number {
    return Math.floor(random() * (range.max - range.min + 1)) + range.min;
  }
}

export type OutputRangeFor = (
  workerType: WorkerType,
  columnColor: ColumnColor
) => OutputRange;

export const standardOutputRange: OutputRangeFor = (workerType, columnColor) =>
  WorkerOutputCalculator.getOutputRange(workerType, columnColor);
