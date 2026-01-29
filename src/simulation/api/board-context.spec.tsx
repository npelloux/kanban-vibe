import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BoardProvider, useBoardContext } from './board-context';
import { Board } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { StateRepository } from '../infra/state-repository';

vi.mock('../infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
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
        data-testid="set-board"
        onClick={() => setBoard(createTestBoard(42))}
      >
        Set Board
      </button>
      <button
        data-testid="update-board"
        onClick={() => updateBoard((b) => Board.withCurrentDay(b, b.currentDay + 1))}
      >
        Increment Day
      </button>
    </div>
  );
}

describe('BoardContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BoardProvider', () => {
    it('renders children', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(null);

      render(
        <BoardProvider>
          <div data-testid="child">Child content</div>
        </BoardProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Child content');
    });

    it('initializes with empty board when no saved state exists', () => {
      vi.mocked(StateRepository.loadBoard).mockReturnValue(null);

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
      vi.mocked(StateRepository.loadBoard).mockReturnValue(null);

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
        vi.mocked(StateRepository.loadBoard).mockReturnValue(null);

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
        vi.mocked(StateRepository.loadBoard).mockReturnValue(null);

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
        vi.mocked(StateRepository.loadBoard).mockReturnValue(createTestBoard(0));

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
      vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
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
      vi.mocked(StateRepository.loadBoard).mockReturnValue(null);
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
});
