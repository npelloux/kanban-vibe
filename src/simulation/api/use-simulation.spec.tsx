import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { useSimulationControls } from './use-simulation';
import { BoardProvider } from './board-context';
import { Board } from '../domain/board/board';
import { Card, type Stage } from '../domain/card/card';
import { CardId } from '../domain/card/card-id';
import { WorkItems } from '../domain/card/work-items';
import { Worker } from '../domain/worker/worker';
import { WipLimits } from '../domain/wip/wip-limits';
import { StateRepository } from '../infra/state-repository';
import { ToastProvider } from '../../api/use-toast';
import * as advanceDayModule from '../application/advance-day';
import * as runPolicyModule from '../application/run-policy';
import '@testing-library/jest-dom';

vi.mock('../infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
  },
}));

function createTestCard(
  id: string,
  overrides: Partial<{
    stage: Stage;
    completionDay: number | null;
  }> = {}
): Card {
  return Card.create({
    id: CardId.create(id),
    content: `Card ${id}`,
    stage: overrides.stage ?? 'options',
    workItems: WorkItems.create(
      { total: 100, completed: 100 },
      { total: 100, completed: 100 },
      { total: 100, completed: 100 }
    ),
    startDay: 1,
    completionDay: overrides.completionDay ?? null,
  });
}

function createTestBoard(
  overrides: Partial<{
    currentDay: number;
    cards: Card[];
    workers: Worker[];
  }> = {}
): Board {
  return Board.create({
    wipLimits: WipLimits.empty(),
    cards: overrides.cards ?? [],
    workers: overrides.workers ?? [],
    currentDay: overrides.currentDay ?? 0,
  });
}

interface HookResult {
  currentDay: number;
  advanceDay: () => void;
  runPolicy: (days: number) => Promise<void>;
  cancelPolicy: () => void;
  isRunning: boolean;
  policyProgress: number | null;
}

function TestConsumer({ onResult }: { onResult: (result: HookResult) => void }) {
  const result = useSimulationControls();
  onResult(result);
  return (
    <div>
      <span data-testid="current-day">{result.currentDay}</span>
      <span data-testid="is-running">{result.isRunning ? 'true' : 'false'}</span>
      <span data-testid="policy-progress">{result.policyProgress ?? 'null'}</span>
    </div>
  );
}

function renderHook(board: Board) {
  let hookResult: HookResult | null = null;
  vi.mocked(StateRepository.loadBoard).mockReturnValue(board);

  const result = render(
    <ToastProvider>
      <BoardProvider>
        <TestConsumer onResult={(r) => { hookResult = r; }} />
      </BoardProvider>
    </ToastProvider>
  );

  return { ...result, getHookResult: () => hookResult! };
}

describe('useSimulationControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('hook return value', () => {
    it('exposes currentDay from board', () => {
      const board = createTestBoard({ currentDay: 5 });
      const { getHookResult } = renderHook(board);

      expect(getHookResult().currentDay).toBe(5);
    });

    it('exposes isRunning as false initially', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      expect(getHookResult().isRunning).toBe(false);
    });

    it('exposes policyProgress as null initially', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      expect(getHookResult().policyProgress).toBeNull();
    });

    it('exposes all control functions', () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      expect(typeof getHookResult().advanceDay).toBe('function');
      expect(typeof getHookResult().runPolicy).toBe('function');
      expect(typeof getHookResult().cancelPolicy).toBe('function');
    });
  });

  describe('advanceDay', () => {
    it('advances day by calling advanceDay use case', () => {
      const board = createTestBoard({ currentDay: 3 });
      const advanceDaySpy = vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [],
        newDay: 4,
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().advanceDay();
      });

      expect(advanceDaySpy).toHaveBeenCalledWith({
        cards: board.cards,
        currentDay: board.currentDay,
        wipLimits: board.wipLimits,
      });
    });

    it('updates board with new day and cards', () => {
      const board = createTestBoard({ currentDay: 3 });
      vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [],
        newDay: 4,
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().advanceDay();
      });

      expect(getHookResult().currentDay).toBe(4);
    });

    it('does not advance when policy is running', async () => {
      const board = createTestBoard({ currentDay: 3 });
      const advanceDaySpy = vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [],
        newDay: 4,
      });
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 4,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        getHookResult().runPolicy(10);
        advanceDaySpy.mockClear();
        getHookResult().advanceDay();
      });

      expect(advanceDaySpy).not.toHaveBeenCalled();
    });
  });

  describe('runPolicy', () => {
    it('prevents concurrent advanceDay calls when running', async () => {
      const board = createTestBoard({ currentDay: 0 });
      const advanceDaySpy = vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        getHookResult().advanceDay();
        return { cards: [], newDay: 1 };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(1);
      });

      expect(advanceDaySpy).not.toHaveBeenCalled();
    });

    it('sets isRunning to false when completed', async () => {
      const board = createTestBoard();
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(1);
      });

      expect(getHookResult().isRunning).toBe(false);
    });

    it('calls runPolicyDay for each day with incremented day count', async () => {
      const board = createTestBoard();
      let runCount = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        runCount++;
        return { cards: [], newDay: runCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(runCount).toBe(3);
    });

    it('clears policyProgress when completed', async () => {
      const board = createTestBoard();
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(2);
      });

      expect(getHookResult().policyProgress).toBeNull();
    });

    it('calls runPolicyDay for each day', async () => {
      const board = createTestBoard({ currentDay: 0 });
      const runPolicySpy = vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(runPolicySpy).toHaveBeenCalledTimes(3);
    });

    it('updates currentDay after each policy day', async () => {
      const board = createTestBoard({ currentDay: 0 });
      let callCount = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        callCount++;
        return { cards: [], newDay: callCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(getHookResult().currentDay).toBe(3);
    });

    it('does not start when already running', async () => {
      const board = createTestBoard();
      const runPolicySpy = vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        const firstRun = getHookResult().runPolicy(5);
        getHookResult().runPolicy(5);
        await firstRun;
      });

      expect(runPolicySpy).toHaveBeenCalledTimes(5);
    });
  });

  describe('cancelPolicy', () => {
    it('stops policy execution mid-run', async () => {
      const board = createTestBoard();
      let callCount = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          getHookResult().cancelPolicy();
        }
        return { cards: [], newDay: callCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(10);
      });

      expect(callCount).toBeLessThan(10);
    });

    it('sets isRunning to false after cancel', async () => {
      const board = createTestBoard();
      let callCount = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          getHookResult().cancelPolicy();
        }
        return { cards: [], newDay: callCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(10);
      });

      expect(getHookResult().isRunning).toBe(false);
    });

    it('clears policyProgress after cancel', async () => {
      const board = createTestBoard();
      let callCount = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          getHookResult().cancelPolicy();
        }
        return { cards: [], newDay: callCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(10);
      });

      expect(getHookResult().policyProgress).toBeNull();
    });

    it('allows new policy run after cancel', async () => {
      const board = createTestBoard();
      let totalCallCount = 0;

      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        totalCallCount++;
        if (totalCallCount === 2) {
          getHookResult().cancelPolicy();
        }
        return { cards: [], newDay: totalCallCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(10);
      });

      const callsAfterFirstRun = totalCallCount;

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(callsAfterFirstRun).toBe(2);
      expect(totalCallCount - callsAfterFirstRun).toBe(3);
    });
  });

  describe('persistence', () => {
    it('persists board changes when advanceDay is called', () => {
      const board = createTestBoard();
      vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().advanceDay();
      });

      expect(StateRepository.saveBoard).toHaveBeenCalled();
    });

    it('persists board changes during policy run', async () => {
      const board = createTestBoard();
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);
      vi.mocked(StateRepository.saveBoard).mockClear();

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(StateRepository.saveBoard).toHaveBeenCalledTimes(3);
    });
  });

  describe('days validation', () => {
    it('throws error for zero days', async () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      await expect(
        act(async () => {
          await getHookResult().runPolicy(0);
        })
      ).rejects.toThrow('Invalid days parameter: 0');
    });

    it('throws error for negative days', async () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      await expect(
        act(async () => {
          await getHookResult().runPolicy(-5);
        })
      ).rejects.toThrow('Invalid days parameter: -5');
    });

    it('throws error for non-integer days', async () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      await expect(
        act(async () => {
          await getHookResult().runPolicy(2.5);
        })
      ).rejects.toThrow('Invalid days parameter: 2.5');
    });

    it('throws error for Infinity', async () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      await expect(
        act(async () => {
          await getHookResult().runPolicy(Infinity);
        })
      ).rejects.toThrow('Invalid days parameter: Infinity');
    });

    it('throws error for NaN', async () => {
      const board = createTestBoard();
      const { getHookResult } = renderHook(board);

      await expect(
        act(async () => {
          await getHookResult().runPolicy(NaN);
        })
      ).rejects.toThrow('Invalid days parameter: NaN');
    });
  });

  describe('error recovery', () => {
    it('resets isRunning after cancel mid-run', async () => {
      const board = createTestBoard();
      let callCount = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        callCount++;
        if (callCount >= 2) {
          getHookResult().cancelPolicy();
        }
        return { cards: [], newDay: callCount };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(10);
      });

      expect(getHookResult().isRunning).toBe(false);
      expect(callCount).toBeLessThan(10);
    });

    it('allows subsequent runs after cancellation', async () => {
      const board = createTestBoard();
      let totalCalls = 0;
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockImplementation(() => {
        totalCalls++;
        if (totalCalls === 1) {
          getHookResult().cancelPolicy();
        }
        return { cards: [], newDay: totalCalls };
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(5);
      });

      const callsAfterFirst = totalCalls;

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(callsAfterFirst).toBe(1);
      expect(totalCalls).toBeGreaterThan(callsAfterFirst);
    });
  });

  describe('day advance notifications', () => {
    it('shows info toast when day is advanced', () => {
      const board = createTestBoard({ currentDay: 5 });
      vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [],
        newDay: 6,
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().advanceDay();
      });

      expect(screen.getByRole('alert')).toHaveTextContent('Day 6');
      expect(screen.getByRole('alert')).toHaveAttribute('data-toast-type', 'info');
    });
  });

  describe('card completion notifications', () => {
    it('shows success toast when card reaches done', () => {
      const card = createTestCard('ABC', { stage: 'green' });
      const board = createTestBoard({ currentDay: 5, cards: [card] });
      const completedCard = { ...card, stage: 'done' as Stage, completionDay: 6 };
      vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [completedCard],
        newDay: 6,
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().advanceDay();
      });

      expect(screen.getByText(/Card ABC completed/)).toBeInTheDocument();
      expect(screen.getByText(/Card ABC completed/).closest('[role="alert"]'))
        .toHaveAttribute('data-toast-type', 'success');
    });

    it('shows multiple toasts when multiple cards complete same day', () => {
      const card1 = createTestCard('ABC', { stage: 'green' });
      const card2 = createTestCard('DEF', { stage: 'green' });
      const board = createTestBoard({ currentDay: 5, cards: [card1, card2] });
      const completedCard1 = { ...card1, stage: 'done' as Stage, completionDay: 6 };
      const completedCard2 = { ...card2, stage: 'done' as Stage, completionDay: 6 };
      vi.spyOn(advanceDayModule, 'advanceDay').mockReturnValue({
        cards: [completedCard1, completedCard2],
        newDay: 6,
      });
      const { getHookResult } = renderHook(board);

      act(() => {
        getHookResult().advanceDay();
      });

      expect(screen.getByText(/Card ABC completed/)).toBeInTheDocument();
      expect(screen.getByText(/Card DEF completed/)).toBeInTheDocument();
    });
  });

  describe('policy notifications', () => {
    it('shows info toast when policy starts', async () => {
      const board = createTestBoard();
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        getHookResult().runPolicy(30);
        await Promise.resolve();
      });

      expect(screen.getByText(/Running siloted-expert for 30 days/)).toBeInTheDocument();
      expect(screen.getByText(/Running siloted-expert for 30 days/).closest('[role="alert"]'))
        .toHaveAttribute('data-toast-type', 'info');

      await act(async () => {
        await getHookResult().runPolicy(1);
      });
    });

    it('shows success toast when policy completes', async () => {
      const board = createTestBoard({ currentDay: 0 });
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      await act(async () => {
        await getHookResult().runPolicy(3);
      });

      expect(screen.getByText(/Policy completed/)).toBeInTheDocument();
      expect(screen.getByText(/Policy completed/).closest('[role="alert"]'))
        .toHaveAttribute('data-toast-type', 'success');
    });

    it('shows warning toast when policy is cancelled', async () => {
      const board = createTestBoard();
      vi.spyOn(runPolicyModule, 'runPolicyDay').mockReturnValue({
        cards: [],
        newDay: 1,
      });
      const { getHookResult } = renderHook(board);

      let policyPromise: Promise<void>;
      await act(async () => {
        policyPromise = getHookResult().runPolicy(10);
        getHookResult().cancelPolicy();
        await policyPromise;
      });

      const toasts = screen.getAllByRole('alert');
      const warningToast = toasts.find(t => t.getAttribute('data-toast-type') === 'warning');
      expect(warningToast).toBeDefined();
      expect(warningToast?.textContent).toMatch(/Policy cancelled/);
    });
  });
});
