import type { WorkerType } from './worker-type';

export type ColumnColor = 'red' | 'blue' | 'green';

export type RandomFn = () => number;

export interface OutputRange {
  readonly min: number;
  readonly max: number;
}

const SPECIALIZED_RANGE: OutputRange = { min: 3, max: 6 };
const NON_SPECIALIZED_RANGE: OutputRange = { min: 0, max: 3 };

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
    const range = this.getOutputRange(workerType, columnColor);
    return Math.floor(random() * (range.max - range.min + 1)) + range.min;
  }
}
