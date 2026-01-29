import { Card as CardFactory, type Card, type Stage } from '../domain/card/card';
import { CardId } from '../domain/card/card-id';
import type { WorkProgress } from '../domain/card/work-items';

type WorkerColor = 'red' | 'blue' | 'green';

function isWorkerColor(type: string): type is WorkerColor {
  return type === 'red' || type === 'blue' || type === 'green';
}

export interface CardInput {
  id: string;
  content: string;
  stage: string;
  age: number;
  startDay: number;
  isBlocked: boolean;
  workItems: {
    red: WorkProgress;
    blue: WorkProgress;
    green: WorkProgress;
  };
  assignedWorkers?: {
    id: string;
    type: 'red' | 'blue' | 'green' | 'options';
  }[];
  completionDay?: number;
}

const VALID_STAGES: readonly Stage[] = [
  'options',
  'red-active',
  'red-finished',
  'blue-active',
  'blue-finished',
  'green',
  'done',
];

function isValidStage(stage: string): stage is Stage {
  return VALID_STAGES.includes(stage as Stage);
}

export function toDomainCard(input: CardInput): Card {
  const cardId = CardId.create(input.id);
  if (cardId === null) {
    throw new Error(`Invalid card ID '${input.id}'`);
  }

  if (!isValidStage(input.stage)) {
    throw new Error(`Invalid stage '${input.stage}'`);
  }

  const workItems = input.workItems;
  if (
    workItems.red.total < 0 ||
    workItems.red.completed < 0 ||
    workItems.blue.total < 0 ||
    workItems.blue.completed < 0 ||
    workItems.green.total < 0 ||
    workItems.green.completed < 0 ||
    workItems.red.completed > workItems.red.total ||
    workItems.blue.completed > workItems.blue.total ||
    workItems.green.completed > workItems.green.total
  ) {
    throw new Error(`Invalid workItems for card '${input.id}'`);
  }

  const assignedWorkers = (input.assignedWorkers ?? [])
    .filter((w): w is { id: string; type: WorkerColor } => isWorkerColor(w.type))
    .map((w) => ({ id: w.id, type: w.type }));

  return CardFactory.create({
    id: cardId,
    content: input.content,
    stage: input.stage,
    workItems,
    startDay: input.startDay,
    age: input.age,
    isBlocked: input.isBlocked,
    completionDay: input.completionDay ?? null,
    assignedWorkers,
  });
}
