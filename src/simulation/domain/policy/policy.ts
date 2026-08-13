import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';

export interface Policy {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[];
}
