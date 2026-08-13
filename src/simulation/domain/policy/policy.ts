import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';

/**
 * The part of a simulation policy that varies between strategies.
 *
 * The day pipeline (pull, age, apply output, transition) is shared and lives in
 * the RunPolicy use case; only the decision of which worker works on which card
 * belongs here.
 */
export interface Policy {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[];
}
