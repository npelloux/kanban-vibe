import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useKanbanBoard } from './use-kanban-board';
import { BoardProvider } from './board-context';
import { Board } from '../domain/board/board';
import { Card, type Stage } from '../domain/card/card';
import { CardId } from '../domain/card/card-id';
import { WipLimits } from '../domain/wip/wip-limits';
import { Worker } from '../domain/worker/worker';
import { WorkItems } from '../domain/card/work-items';
import { StateRepository } from '../infra/state-repository';

vi.mock('../infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
  },
}));

function createValidCardId(value: string): ReturnType<typeof CardId.create> & string {
  const id = CardId.create(value);
  if (id === null) {
    throw new Error(`Test setup: Invalid CardId '${value}'`);
  }
  return id;
}

function createTestCard(
  id: string,
  overrides: Partial<{
    content: string;
    stage: Stage;
    age: number;
    isBlocked: boolean;
    startDay: number;
  }> = {}
): Card {
  return Card.create({
    id: createValidCardId(id),
    content: overrides.content ?? 'Test card',
    stage: overrides.stage ?? 'options',
    workItems: WorkItems.create(
      { total: 5, completed: 0 },
      { total: 3, completed: 0 },
      { total: 2, completed: 0 }
    ),
    startDay: overrides.startDay ?? 0,
    age: overrides.age ?? 0,
    isBlocked: overrides.isBlocked ?? false,
  });
}

function createTestBoard(
  overrides: Partial<{
    cards: readonly Card[];
    workers: readonly Worker[];
    currentDay: number;
    wipLimits: WipLimits;
  }> = {}
): Board {
  return Board.create({
    wipLimits: overrides.wipLimits ?? WipLimits.empty(),
    cards: overrides.cards ?? [],
    workers: overrides.workers ?? [],
    currentDay: overrides.currentDay ?? 0,
  });
}

interface HookResult {
  board: Board;
  cards: readonly Card[];
  cardsInStage: (stage: Stage) => readonly Card[];
  moveCard: (cardId: ReturnType<typeof CardId.create> & string) => void;
  assignWorker: (cardId: ReturnType<typeof CardId.create> & string, workerId: string) => void;
  addCard: () => void;
  toggleBlock: (cardId: ReturnType<typeof CardId.create> & string) => void;
}

function TestConsumer({ onResult }: { onResult: (result: HookResult) => void }) {
  const result = useKanbanBoard();
  onResult(result);
  return (
    <div>
      <span data-testid="card-count">{result.cards.length}</span>
      <span data-testid="current-day">{result.board.currentDay}</span>
    </div>
  );
}

function renderHook(board: Board) {
  let hookResult: HookResult | null = null;
  vi.mocked(StateRepository.loadBoard).mockReturnValue(board);

  const result = render(
    <BoardProvider>
      <TestConsumer onResult={(r) => { hookResult = r; }} />
    </BoardProvider>
  );

  return { ...result, getHookResult: () => hookResult! };
}

describe('useKanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  describe('hook return value', () => {
    it('returns board from context', () => {
      const board = createTestBoard({ currentDay: 5 });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().board.currentDay).toBe(5);
    });

    it('returns cards from board', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().cards).toHaveLength(1);
      expect(getHookResult().cards[0].id).toBe('ABC');
    });

    it('returns all expected functions', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      expect(typeof getHookResult().cardsInStage).toBe('function');
      expect(typeof getHookResult().moveCard).toBe('function');
      expect(typeof getHookResult().assignWorker).toBe('function');
      expect(typeof getHookResult().addCard).toBe('function');
      expect(typeof getHookResult().toggleBlock).toBe('function');
    });
  });

  describe('cardsInStage', () => {
    it('returns cards in the specified stage', () => {
      const optionsCard = createTestCard('ABC', { stage: 'options' });
      const redActiveCard = createTestCard('DEF', { stage: 'red-active' });
      const board = createTestBoard({ cards: [optionsCard, redActiveCard] });
      const { getHookResult } = renderHook(board);

      const optionsCards = getHookResult().cardsInStage('options');
      const redActiveCards = getHookResult().cardsInStage('red-active');

      expect(optionsCards).toHaveLength(1);
      expect(optionsCards[0].id).toBe('ABC');
      expect(redActiveCards).toHaveLength(1);
      expect(redActiveCards[0].id).toBe('DEF');
    });

    it('returns empty array when no cards in stage', () => {
      const card = createTestCard('ABC', { stage: 'options' });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      const greenCards = getHookResult().cardsInStage('green');

      expect(greenCards).toHaveLength(0);
    });
  });

  describe('moveCard', () => {
    it('moves card from options to red-active', () => {
      const card = createTestCard('ABC', { stage: 'options' });
      const board = createTestBoard({ cards: [card], currentDay: 5 });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(getHookResult().cards[0].stage).toBe('red-active');
      expect(getHookResult().cards[0].startDay).toBe(5);
    });

    it('moves card from red-finished to blue-active', () => {
      const card = createTestCard('ABC', { stage: 'red-finished' });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(getHookResult().cards[0].stage).toBe('blue-active');
    });

    it('moves card from blue-finished to green', () => {
      const card = createTestCard('ABC', { stage: 'blue-finished' });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(getHookResult().cards[0].stage).toBe('green');
    });

    it('shows alert when max WIP limit would be exceeded', () => {
      const card = createTestCard('ABC', { stage: 'options' });
      const existingCard = createTestCard('DEF', { stage: 'red-active' });
      const wipLimits = WipLimits.withColumnLimit(
        WipLimits.empty(),
        'redActive',
        { min: 0, max: 1 }
      );
      const board = createTestBoard({
        cards: [card, existingCard],
        wipLimits
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Max WIP limit')
      );
      expect(getHookResult().cards.find(c => c.id === 'ABC')?.stage).toBe('options');
    });

    it('shows alert when min WIP limit would be violated', () => {
      const card = createTestCard('ABC', { stage: 'options' });
      const wipLimits = WipLimits.withColumnLimit(
        WipLimits.empty(),
        'options',
        { min: 1, max: 0 }
      );
      const board = createTestBoard({ cards: [card], wipLimits });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Min WIP limit')
      );
      expect(getHookResult().cards[0].stage).toBe('options');
    });

    it('does nothing when card is not in clickable stage', () => {
      const card = createTestCard('ABC', { stage: 'red-active' });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(getHookResult().cards[0].stage).toBe('red-active');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('assignWorker', () => {
    it('assigns worker to card', () => {
      const card = createTestCard('ABC', { stage: 'red-active' });
      const worker = Worker.create('w1', 'red');
      const board = createTestBoard({ cards: [card], workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().assignWorker(createValidCardId('ABC'), 'w1');
      });

      expect(getHookResult().cards[0].assignedWorkers).toHaveLength(1);
      expect(getHookResult().cards[0].assignedWorkers[0].id).toBe('w1');
    });

    it('removes worker from previous card when reassigning', () => {
      const card1 = Card.create({
        id: createValidCardId('ABC'),
        content: 'Card 1',
        stage: 'red-active',
        workItems: WorkItems.empty(),
        startDay: 0,
        assignedWorkers: [{ id: 'w1', type: 'red' }],
      });
      const card2 = createTestCard('DEF', { stage: 'red-active' });
      const worker = Worker.create('w1', 'red');
      const board = createTestBoard({ cards: [card1, card2], workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().assignWorker(createValidCardId('DEF'), 'w1');
      });

      expect(getHookResult().cards.find(c => c.id === 'ABC')?.assignedWorkers).toHaveLength(0);
      expect(getHookResult().cards.find(c => c.id === 'DEF')?.assignedWorkers).toHaveLength(1);
    });

    it('does nothing when worker not found', () => {
      const card = createTestCard('ABC', { stage: 'red-active' });
      const board = createTestBoard({ cards: [card], workers: [] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().assignWorker(createValidCardId('ABC'), 'nonexistent');
      });

      expect(getHookResult().cards[0].assignedWorkers).toHaveLength(0);
    });

    it('does nothing when card not found', () => {
      const worker = Worker.create('w1', 'red');
      const board = createTestBoard({ cards: [], workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().assignWorker(createValidCardId('NONEXISTENT'), 'w1');
      });

      expect(getHookResult().cards).toHaveLength(0);
    });
  });

  describe('addCard', () => {
    it('adds a new card to the board', () => {
      const board = createTestBoard({ currentDay: 3 });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().cards).toHaveLength(0);

      act(() => {
        getHookResult().addCard();
      });

      expect(getHookResult().cards).toHaveLength(1);
    });

    it('creates card in options stage', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addCard();
      });

      expect(getHookResult().cards[0].stage).toBe('options');
    });

    it('generates sequential card IDs', () => {
      const existingCard = createTestCard('ABC');
      const board = createTestBoard({ cards: [existingCard] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addCard();
      });

      expect(getHookResult().cards).toHaveLength(2);
      const newCard = getHookResult().cards.find(c => c.id !== 'ABC');
      expect(newCard).toBeDefined();
    });

    it('sets startDay to currentDay', () => {
      const board = createTestBoard({ currentDay: 7 });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addCard();
      });

      expect(getHookResult().cards[0].startDay).toBe(7);
    });
  });

  describe('toggleBlock', () => {
    it('blocks an unblocked card', () => {
      const card = createTestCard('ABC', { isBlocked: false });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().cards[0].isBlocked).toBe(false);

      act(() => {
        getHookResult().toggleBlock(createValidCardId('ABC'));
      });

      expect(getHookResult().cards[0].isBlocked).toBe(true);
    });

    it('unblocks a blocked card', () => {
      const card = createTestCard('ABC', { isBlocked: true });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().cards[0].isBlocked).toBe(true);

      act(() => {
        getHookResult().toggleBlock(createValidCardId('ABC'));
      });

      expect(getHookResult().cards[0].isBlocked).toBe(false);
    });

    it('throws error when card not found', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      expect(() => {
        act(() => {
          getHookResult().toggleBlock(createValidCardId('NONEXISTENT'));
        });
      }).toThrow("Card 'NONEXISTENT' not found");
    });
  });

  describe('persistence', () => {
    it('persists board changes when moveCard is called', () => {
      const card = createTestCard('ABC', { stage: 'options' });
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().moveCard(createValidCardId('ABC'));
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });

    it('persists board changes when addCard is called', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().addCard();
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });

    it('persists board changes when toggleBlock is called', () => {
      const card = createTestCard('ABC');
      const board = createTestBoard({ cards: [card] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().toggleBlock(createValidCardId('ABC'));
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });

    it('persists board changes when assignWorker is called', () => {
      const card = createTestCard('ABC', { stage: 'red-active' });
      const worker = Worker.create('w1', 'red');
      const board = createTestBoard({ cards: [card], workers: [worker] });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().assignWorker(createValidCardId('ABC'), 'w1');
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });
  });
});
