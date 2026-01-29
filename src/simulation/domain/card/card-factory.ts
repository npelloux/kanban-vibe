import type { CardId } from './card-id';
import { CardId as CardIdUtil } from './card-id';
import { Card, type Card as CardType } from './card';
import type { WorkItems } from './work-items';

export type RandomFn = () => number;

const ACTIONS = [
  'Create',
  'Implement',
  'Design',
  'Develop',
  'Test',
  'Refactor',
  'Optimize',
  'Fix',
  'Update',
  'Add',
];

const SUBJECTS = [
  'user interface',
  'authentication',
  'database',
  'API',
  'dashboard',
  'reporting',
  'search functionality',
  'payment system',
  'notification system',
  'user profile',
  'settings page',
  'analytics',
  'integration',
  'documentation',
  'error handling',
  'performance',
  'security',
  'accessibility',
  'mobile view',
];

const WORK_ITEMS_MIN = 1;
const WORK_ITEMS_MAX = 8;

function getRandomInt(min: number, max: number, random: RandomFn): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function generateContent(random: RandomFn): string {
  const actionIndex = Math.floor(random() * ACTIONS.length);
  const subjectIndex = Math.floor(random() * SUBJECTS.length);
  return `${ACTIONS[actionIndex]} ${SUBJECTS[subjectIndex]}`;
}

function generateWorkItems(random: RandomFn): WorkItems {
  return {
    red: {
      total: getRandomInt(WORK_ITEMS_MIN, WORK_ITEMS_MAX, random),
      completed: 0,
    },
    blue: {
      total: getRandomInt(WORK_ITEMS_MIN, WORK_ITEMS_MAX, random),
      completed: 0,
    },
    green: {
      total: getRandomInt(WORK_ITEMS_MIN, WORK_ITEMS_MAX, random),
      completed: 0,
    },
  };
}

export interface CardFactoryCreateProps {
  readonly id: CardId;
  readonly currentDay: number;
  readonly random?: RandomFn;
}

export const CardFactory = {
  create(props: CardFactoryCreateProps): CardType {
    const random = props.random ?? Math.random;

    return Card.create({
      id: props.id,
      content: generateContent(random),
      stage: 'options',
      workItems: generateWorkItems(random),
      startDay: props.currentDay,
    });
  },

  nextId(cards: readonly CardType[]): CardId {
    if (cards.length === 0) {
      const initialId = CardIdUtil.create('A');
      if (!initialId) {
        throw new Error("Expected 'A' to be a valid CardId");
      }
      return initialId;
    }

    const sortedIds = cards
      .map((card) => card.id)
      .sort((a, b) => {
        if (a.length !== b.length) {
          return a.length - b.length;
        }
        return a.localeCompare(b);
      });

    const highestId = sortedIds[sortedIds.length - 1];
    return CardIdUtil.next(highestId);
  },
} as const;
