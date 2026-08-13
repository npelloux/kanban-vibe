import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';
import type { WorkerType } from '../worker/worker-type';
import type { ColumnColor, OutputRange } from '../worker/worker-output';

export interface Policy {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[];

  outputRangeFor(workerType: WorkerType, columnColor: ColumnColor): OutputRange;

  allowsPullFromOptions(cards: readonly Card[]): boolean;
}
