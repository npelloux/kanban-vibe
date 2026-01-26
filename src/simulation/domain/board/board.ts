import type { Card, Stage } from '../card/card';
import type { Worker } from '../worker/worker';
import type { WipLimits } from '../wip/wip-limits';

export interface Board {
  readonly cards: readonly Card[];
  readonly workers: readonly Worker[];
  readonly currentDay: number;
  readonly wipLimits: WipLimits;
}

export interface BoardCreateProps {
  readonly cards?: readonly Card[];
  readonly workers?: readonly Worker[];
  readonly currentDay?: number;
  readonly wipLimits: WipLimits;
}

export const ALL_STAGES: readonly Stage[] = Object.freeze([
  'options',
  'red-active',
  'red-finished',
  'blue-active',
  'blue-finished',
  'green',
  'done',
] as const);

export const Board = {
  create(props: BoardCreateProps): Board {
    const currentDay = props.currentDay ?? 0;

    if (currentDay < 0) {
      throw new Error('Current day cannot be negative');
    }

    if (!Number.isInteger(currentDay)) {
      throw new Error('Current day must be an integer');
    }

    return {
      cards: props.cards ? [...props.cards] : [],
      workers: props.workers ? [...props.workers] : [],
      currentDay,
      wipLimits: props.wipLimits,
    };
  },

  empty(wipLimits: WipLimits): Board {
    return Board.create({ wipLimits });
  },

  withCards(board: Board, cards: readonly Card[]): Board {
    return { ...board, cards: [...cards] };
  },

  withWorkers(board: Board, workers: readonly Worker[]): Board {
    return { ...board, workers: [...workers] };
  },

  withCurrentDay(board: Board, currentDay: number): Board {
    if (currentDay < 0) {
      throw new Error('Current day cannot be negative');
    }
    if (!Number.isInteger(currentDay)) {
      throw new Error('Current day must be an integer');
    }
    return { ...board, currentDay };
  },

  withWipLimits(board: Board, wipLimits: WipLimits): Board {
    return { ...board, wipLimits };
  },

  addCard(board: Board, card: Card): Board {
    return { ...board, cards: [...board.cards, card] };
  },

  removeCard(board: Board, cardId: string): Board {
    return {
      ...board,
      cards: board.cards.filter((c) => c.id !== cardId),
    };
  },

  updateCard(board: Board, cardId: string, updater: (card: Card) => Card): Board {
    return {
      ...board,
      cards: board.cards.map((c) => (c.id === cardId ? updater(c) : c)),
    };
  },

  addWorker(board: Board, worker: Worker): Board {
    return { ...board, workers: [...board.workers, worker] };
  },

  removeWorker(board: Board, workerId: string): Board {
    return {
      ...board,
      workers: board.workers.filter((w) => w.id !== workerId),
    };
  },

  findCard(board: Board, cardId: string): Card | undefined {
    return board.cards.find((c) => c.id === cardId);
  },

  findWorker(board: Board, workerId: string): Worker | undefined {
    return board.workers.find((w) => w.id === workerId);
  },

  getCardsByStage(board: Board, stage: Stage): readonly Card[] {
    return board.cards.filter((c) => c.stage === stage);
  },

  getCardCountByStage(board: Board, stage: Stage): number {
    return board.cards.filter((c) => c.stage === stage).length;
  },

  advanceDay(board: Board): Board {
    return { ...board, currentDay: board.currentDay + 1 };
  },
} as const;
