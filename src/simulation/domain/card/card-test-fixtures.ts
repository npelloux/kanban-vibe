import { Card, type Card as CardType } from './card';
import { CardId } from './card-id';
import type { WorkItems } from './work-items';

export function createValidCardId(id: string): CardId {
  const cardId = CardId.create(id);
  if (!cardId) throw new Error(`Invalid card ID: ${id}`);
  return cardId;
}

export interface CardOverrides {
  id?: CardType['id'];
  content?: string;
  stage?: CardType['stage'];
  age?: number;
  workItems?: WorkItems;
  isBlocked?: boolean;
  startDay?: number;
  completionDay?: number | null;
  assignedWorkers?: CardType['assignedWorkers'];
}

function createDefaultCardId(): CardType['id'] {
  const defaultId = CardId.create('A');
  if (!defaultId) throw new Error("Expected 'A' to be a valid CardId");
  return defaultId;
}

export function createTestCard(overrides: CardOverrides = {}): CardType {
  const id = overrides.id ?? createDefaultCardId();

  return Card.create({
    id,
    content: overrides.content ?? 'Test card',
    stage: overrides.stage ?? 'options',
    workItems: overrides.workItems ?? {
      red: { total: 5, completed: 0 },
      blue: { total: 5, completed: 0 },
      green: { total: 5, completed: 0 },
    },
    startDay: overrides.startDay ?? 0,
    age: overrides.age ?? 0,
    isBlocked: overrides.isBlocked ?? false,
    assignedWorkers: overrides.assignedWorkers ?? [],
    completionDay: overrides.completionDay ?? null,
  });
}

export function createTestCardWithId(
  id: string,
  overrides: Omit<CardOverrides, 'id'> = {}
): CardType {
  const cardId = CardId.create(id);
  if (!cardId) throw new Error(`Invalid card ID: ${id}`);

  return createTestCard({ ...overrides, id: cardId });
}
