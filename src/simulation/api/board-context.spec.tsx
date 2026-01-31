import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import {
  BoardProvider,
  useBoardContext,
  useHistoryContext,
  useSaveStateContext,
  useResetBoardContext,
} from './board-context';
import { Board } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { StateRepository } from '../infra/state-repository';
import type { ReactNode } from 'react';

vi.mock('../infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
    loadAutosave: vi.fn(),
    saveAutosave: vi.fn(),
    clearAutosave: vi.fn(),
    clearBoard: vi.fn(),
  },
}));

function createTestBoard(currentDay = 0): Board {
  return Board.create({
    wipLimits: WipLimits.empty(),
    currentDay,
  });
}

function TestConsumer() {
  const { board, setBoard, updateBoard } = useBoardContext();
  return (
    <div>
      <span data-testid="current-day">{board.currentDay}</span>
      <button
        type="button"
        data-testid="set-board"
        onClick={() => setBoard(createTestBoard(42))}
      >
        Set Board
      </button>
      <button
        type="button"
        data-testid="update-board"
        onClick={() => updateBoard((b) => Board.withCurrentDay(b, b.currentDay + 1))}
      >
        Increment Day
      </button>
    </div>
  );
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <BoardProvider>{children}</BoardProvider>
);

describe('BoardContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
    vi.mocked(StateRepository.loadAutosave).mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('BoardProvider', () => {
    it('renders children', () => {
      render(
        <BoardProvider>
          <div data-testid="child">Child content</div>
        </BoardProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Child content');
    });

    it('initializes with empty board when no saved state exists', () => {
      render(
        <BoardProvider>
          <TestConsumer />
        </BoardProvider>
      );

      expect(screen.getByTestId('current-day')).toHaveTextContent('0');
    });

    it('initializes with saved board from localStorage', () => {
      const savedBoard = createTestBoard(10);
      vi.mocked(StateRepository.loadBoard).mockReturnValue(savedBoard);

      render(
        <BoardProvider>
          <TestConsumer />
        </BoardProvider>
      );

      expect(screen.getByTestId('current-day')).toHaveTextContent('10');
    });

    it('calls StateRepository.loadBoard on mount', () => {
      render(
        <BoardProvider>
          <TestConsumer />
        </BoardProvider>
      );

      expect(StateRepository.loadBoard).toHaveBeenCalledTimes(1);
    });
  });

  describe('useBoardContext', () => {
    it('returns board from context', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(5));

      render(
        <BoardProvider>
          <TestConsumer />
        </BoardProvider>
      );

      expect(screen.getByTestId('current-day')).toHaveTextContent('5');
    });

    it('throws error when used outside BoardProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        'useBoardContext must be used within BoardProvider'
      );

      consoleError.mockRestore();
    });

    describe('setBoard', () => {
      it('updates the board state', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        expect(screen.getByTestId('current-day')).toHaveTextContent('0');

        act(() => {
          screen.getByTestId('set-board').click();
        });

        expect(screen.getByTestId('current-day')).toHaveTextContent('42');
      });

      it('persists board changes to localStorage', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          screen.getByTestId('set-board').click();
        });

        expect(StateRepository.saveBoard).toHaveBeenCalledWith(
          expect.objectContaining({ currentDay: 42 })
        );
      });
    });

    describe('updateBoard', () => {
      it('updates board using updater function', () => {
        vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(5));

        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        expect(screen.getByTestId('current-day')).toHaveTextContent('5');

        act(() => {
          screen.getByTestId('update-board').click();
        });

        expect(screen.getByTestId('current-day')).toHaveTextContent('6');
      });

      it('persists board changes to localStorage after update', () => {
        vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(5));

        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          screen.getByTestId('update-board').click();
        });

        expect(StateRepository.saveBoard).toHaveBeenCalledWith(
          expect.objectContaining({ currentDay: 6 })
        );
      });

      it('allows multiple consecutive updates', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          screen.getByTestId('update-board').click();
        });
        act(() => {
          screen.getByTestId('update-board').click();
        });
        act(() => {
          screen.getByTestId('update-board').click();
        });

        expect(screen.getByTestId('current-day')).toHaveTextContent('3');
      });
    });
  });

  describe('nested providers', () => {
    it('inner provider wins (standard React behavior)', () => {
      vi.mocked(StateRepository.loadBoard)
        .mockReturnValueOnce(createTestBoard(10))
        .mockReturnValueOnce(createTestBoard(20));

      render(
        <BoardProvider>
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        </BoardProvider>
      );

      expect(screen.getByTestId('current-day')).toHaveTextContent('20');
    });
  });

  describe('context value stability', () => {
    it('setBoard maintains referential identity across renders', () => {
      const capturedSetBoards: Array<(board: Board) => void> = [];

      function SetBoardCapture() {
        const { setBoard } = useBoardContext();
        capturedSetBoards.push(setBoard);
        return null;
      }

      const { rerender } = render(
        <BoardProvider>
          <SetBoardCapture />
        </BoardProvider>
      );

      rerender(
        <BoardProvider>
          <SetBoardCapture />
        </BoardProvider>
      );

      expect(capturedSetBoards[0]).toBe(capturedSetBoards[1]);
    });

    it('updateBoard maintains referential identity across renders', () => {
      const capturedUpdateBoards: Array<(updater: (board: Board) => Board) => void> = [];

      function UpdateBoardCapture() {
        const { updateBoard } = useBoardContext();
        capturedUpdateBoards.push(updateBoard);
        return null;
      }

      const { rerender } = render(
        <BoardProvider>
          <UpdateBoardCapture />
        </BoardProvider>
      );

      rerender(
        <BoardProvider>
          <UpdateBoardCapture />
        </BoardProvider>
      );

      expect(capturedUpdateBoards[0]).toBe(capturedUpdateBoards[1]);
    });
  });

  describe('autosave', () => {
    describe('loading on mount', () => {
      it('loads from autosave when no manual save exists', () => {
        const autosavedBoard = createTestBoard(15);
        vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
        vi.mocked(StateRepository.loadAutosave).mockReturnValue(autosavedBoard);

        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        expect(screen.getByTestId('current-day')).toHaveTextContent('15');
      });

      it('prefers manual save over autosave', () => {
        const manualBoard = createTestBoard(10);
        const autosavedBoard = createTestBoard(15);
        vi.mocked(StateRepository.loadBoard).mockReturnValue(manualBoard);
        vi.mocked(StateRepository.loadAutosave).mockReturnValue(autosavedBoard);

        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        expect(screen.getByTestId('current-day')).toHaveTextContent('10');
      });

      it('falls back to empty board when both saves are null', () => {
        vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
        vi.mocked(StateRepository.loadAutosave).mockReturnValue(null);

        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        expect(screen.getByTestId('current-day')).toHaveTextContent('0');
      });
    });

    describe('debounced saving', () => {
      it('triggers autosave 500ms after state change', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          screen.getByTestId('update-board').click();
        });

        expect(StateRepository.saveAutosave).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(500);
        });

        expect(StateRepository.saveAutosave).toHaveBeenCalledTimes(1);
        expect(StateRepository.saveAutosave).toHaveBeenCalledWith(
          expect.objectContaining({ currentDay: 1 })
        );
      });

      it('only saves final state when rapid changes occur within 500ms', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          screen.getByTestId('update-board').click();
        });
        act(() => {
          vi.advanceTimersByTime(200);
        });
        act(() => {
          screen.getByTestId('update-board').click();
        });
        act(() => {
          vi.advanceTimersByTime(200);
        });
        act(() => {
          screen.getByTestId('update-board').click();
        });

        expect(StateRepository.saveAutosave).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(500);
        });

        expect(StateRepository.saveAutosave).toHaveBeenCalledTimes(1);
        expect(StateRepository.saveAutosave).toHaveBeenCalledWith(
          expect.objectContaining({ currentDay: 3 })
        );
      });

      it('does not autosave if no state changes occur', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          vi.advanceTimersByTime(1000);
        });

        expect(StateRepository.saveAutosave).not.toHaveBeenCalled();
      });

      it('autosaves after setBoard changes', () => {
        render(
          <BoardProvider>
            <TestConsumer />
          </BoardProvider>
        );

        act(() => {
          screen.getByTestId('set-board').click();
        });

        expect(StateRepository.saveAutosave).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(500);
        });

        expect(StateRepository.saveAutosave).toHaveBeenCalledTimes(1);
        expect(StateRepository.saveAutosave).toHaveBeenCalledWith(
          expect.objectContaining({ currentDay: 42 })
        );
      });
    });
  });
});

describe('BoardProvider with History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
    vi.mocked(StateRepository.loadAutosave).mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useHistoryContext', () => {
    it('provides history manager state', () => {
      const { result } = renderHook(() => useHistoryContext(), { wrapper });

      expect(result.current.historyManager).toBeDefined();
      expect(result.current.historyManager.entries).toEqual([]);
      expect(result.current.historyManager.currentIndex).toBe(-1);
    });

    it('provides canUndo that reflects history state', () => {
      const { result } = renderHook(() => useHistoryContext(), { wrapper });

      expect(result.current.canUndo).toBe(false);
    });

    it('provides canRedo that reflects history state', () => {
      const { result } = renderHook(() => useHistoryContext(), { wrapper });

      expect(result.current.canRedo).toBe(false);
    });

    it('throws error when used outside BoardProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => renderHook(() => useHistoryContext())).toThrow(
        'useHistoryContext must be used within BoardProvider'
      );

      consoleError.mockRestore();
    });
  });

  describe('pushHistory', () => {
    it('adds entry to history when board is updated', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          history: useHistoryContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.history.pushHistory('test-action', result.current.board.board);
      });

      expect(result.current.history.historyManager.entries).toHaveLength(1);
      expect(result.current.history.historyManager.entries[0].action).toBe('test-action');
    });
  });

  describe('undo', () => {
    it('restores previous board state', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          history: useHistoryContext(),
        }),
        { wrapper }
      );

      const initialBoard = result.current.board.board;

      act(() => {
        result.current.history.pushHistory('initial', initialBoard);
      });

      const newBoard = Board.withCurrentDay(initialBoard, 5);
      act(() => {
        result.current.board.setBoard(newBoard);
        result.current.history.pushHistory('day-5', newBoard);
      });

      expect(result.current.board.board.currentDay).toBe(5);
      expect(result.current.history.canUndo).toBe(true);

      act(() => {
        result.current.history.undo();
      });

      expect(result.current.board.board.currentDay).toBe(0);
    });

    it('does nothing when canUndo is false', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          history: useHistoryContext(),
        }),
        { wrapper }
      );

      const initialBoard = result.current.board.board;

      act(() => {
        result.current.history.undo();
      });

      expect(result.current.board.board).toEqual(initialBoard);
    });

    it('persists undone state to localStorage', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          history: useHistoryContext(),
        }),
        { wrapper }
      );

      const initialBoard = result.current.board.board;

      act(() => {
        result.current.history.pushHistory('initial', initialBoard);
      });

      const newBoard = Board.withCurrentDay(initialBoard, 5);
      act(() => {
        result.current.board.setBoard(newBoard);
        result.current.history.pushHistory('day-5', newBoard);
      });

      vi.mocked(StateRepository.saveBoard).mockClear();

      act(() => {
        result.current.history.undo();
      });

      expect(StateRepository.saveBoard).toHaveBeenCalledWith(
        expect.objectContaining({ currentDay: 0 })
      );
    });
  });

  describe('redo', () => {
    it('restores undone board state', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          history: useHistoryContext(),
        }),
        { wrapper }
      );

      const initialBoard = result.current.board.board;

      act(() => {
        result.current.history.pushHistory('initial', initialBoard);
      });

      const newBoard = Board.withCurrentDay(initialBoard, 5);
      act(() => {
        result.current.board.setBoard(newBoard);
        result.current.history.pushHistory('day-5', newBoard);
      });

      act(() => {
        result.current.history.undo();
      });

      expect(result.current.board.board.currentDay).toBe(0);
      expect(result.current.history.canRedo).toBe(true);

      act(() => {
        result.current.history.redo();
      });

      expect(result.current.board.board.currentDay).toBe(5);
    });

    it('persists redone state to localStorage', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          history: useHistoryContext(),
        }),
        { wrapper }
      );

      const initialBoard = result.current.board.board;

      act(() => {
        result.current.history.pushHistory('initial', initialBoard);
      });

      const newBoard = Board.withCurrentDay(initialBoard, 5);
      act(() => {
        result.current.board.setBoard(newBoard);
        result.current.history.pushHistory('day-5', newBoard);
      });

      act(() => {
        result.current.history.undo();
      });

      vi.mocked(StateRepository.saveBoard).mockClear();

      act(() => {
        result.current.history.redo();
      });

      expect(StateRepository.saveBoard).toHaveBeenCalledWith(
        expect.objectContaining({ currentDay: 5 })
      );
    });
  });
});

describe('useSaveStateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
    vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
    vi.mocked(StateRepository.loadAutosave).mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws error when used outside BoardProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSaveStateContext())).toThrow(
      'useSaveStateContext must be used within BoardProvider'
    );

    consoleError.mockRestore();
  });

  it('provides initial saved state when no changes have been made', () => {
    const { result } = renderHook(() => useSaveStateContext(), { wrapper });

    expect(result.current.saveStatus).toBe('saved');
  });

  it('provides lastSavedAt as null initially when no save has occurred', () => {
    const { result } = renderHook(() => useSaveStateContext(), { wrapper });

    expect(result.current.lastSavedAt).toBeNull();
  });

  describe('save state transitions', () => {
    it('transitions to dirty when board changes during debounce', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      expect(result.current.saveState.saveStatus).toBe('saved');

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 1));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');
    });

    it('transitions to saved after debounce completes', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 1));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.saveState.saveStatus).toBe('saved');
    });

    it('updates lastSavedAt when save completes', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      const initialTime = result.current.saveState.lastSavedAt;

      vi.setSystemTime(new Date('2026-01-31T12:01:00Z'));

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 1));
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.saveState.lastSavedAt?.getTime()).toBeGreaterThan(
        initialTime?.getTime() ?? 0
      );
    });

    it('stays dirty when rapid changes occur', () => {
      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 1));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');

      act(() => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 2));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.saveState.saveStatus).toBe('saved');
    });

    it('transitions to error when autosave fails', () => {
      const mockSaveAutosave = vi.spyOn(StateRepository, 'saveAutosave');
      mockSaveAutosave.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 1));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.saveState.saveStatus).toBe('error');

      mockSaveAutosave.mockRestore();
    });
  });
});

describe('useResetBoardContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
    vi.mocked(StateRepository.loadAutosave).mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws error when used outside BoardProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useResetBoardContext())).toThrow(
      'useResetBoardContext must be used within BoardProvider'
    );

    consoleError.mockRestore();
  });

  it('provides resetBoard function', () => {
    const { result } = renderHook(() => useResetBoardContext(), { wrapper });

    expect(result.current.resetBoard).toBeDefined();
    expect(typeof result.current.resetBoard).toBe('function');
  });

  describe('resetBoard', () => {
    it('resets board to empty state', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(10));

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          reset: useResetBoardContext(),
        }),
        { wrapper }
      );

      expect(result.current.board.board.currentDay).toBe(10);

      act(() => {
        result.current.reset.resetBoard();
      });

      expect(result.current.board.board.currentDay).toBe(0);
    });

    it('clears autosave from localStorage', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(10));

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          reset: useResetBoardContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.reset.resetBoard();
      });

      expect(StateRepository.clearAutosave).toHaveBeenCalledTimes(1);
    });

    it('saves the empty board to localStorage', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(10));

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          reset: useResetBoardContext(),
        }),
        { wrapper }
      );

      vi.mocked(StateRepository.saveBoard).mockClear();

      act(() => {
        result.current.reset.resetBoard();
      });

      expect(StateRepository.saveBoard).toHaveBeenCalledWith(
        expect.objectContaining({ currentDay: 0 })
      );
    });

    it('resets saveStatus to saved', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(10));

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          reset: useResetBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 15));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');

      act(() => {
        result.current.reset.resetBoard();
      });

      expect(result.current.saveState.saveStatus).toBe('saved');
    });

    it('clears pending autosave timeout', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(10));

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          reset: useResetBoardContext(),
          saveState: useSaveStateContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.board.updateBoard((b) => Board.withCurrentDay(b, 15));
      });

      expect(result.current.saveState.saveStatus).toBe('dirty');

      act(() => {
        result.current.reset.resetBoard();
      });

      expect(result.current.saveState.saveStatus).toBe('saved');

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.saveState.saveStatus).toBe('saved');
    });

    it('does not affect manual save slots (separate key)', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(10));

      const { result } = renderHook(
        () => ({
          board: useBoardContext(),
          reset: useResetBoardContext(),
        }),
        { wrapper }
      );

      act(() => {
        result.current.reset.resetBoard();
      });

      expect(StateRepository.clearAutosave).toHaveBeenCalled();
      expect(StateRepository.clearBoard).not.toHaveBeenCalled();
    });
  });
});
