import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectedWorkerPool } from '../ConnectedWorkerPool';
import { BoardProvider } from '../../simulation/api/board-context';
import { Board } from '../../simulation/domain/board/board';
import { Worker } from '../../simulation/domain/worker/worker';
import { WipLimits } from '../../simulation/domain/wip/wip-limits';
import { StateRepository } from '../../simulation/infra/state-repository';

vi.mock('../../simulation/infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
  },
}));

function createBoardWithWorkers(
  workers: Array<{ id: string; type: 'red' | 'blue' | 'green' }>
) {
  let board = Board.empty(WipLimits.empty());
  for (const w of workers) {
    board = Board.addWorker(board, Worker.create(w.id, w.type));
  }
  return board;
}

function renderWithProvider(
  initialWorkers: Array<{ id: string; type: 'red' | 'blue' | 'green' }> = []
) {
  const board = createBoardWithWorkers(initialWorkers);
  vi.mocked(StateRepository.loadBoard).mockReturnValue(board);

  return render(
    <BoardProvider>
      <ConnectedWorkerPool />
    </BoardProvider>
  );
}

describe('ConnectedWorkerPool Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all workers from context', () => {
    const mockWorkers = [
      { id: '1', type: 'red' as const },
      { id: '2', type: 'blue' as const },
      { id: '3', type: 'green' as const },
    ];

    renderWithProvider(mockWorkers);

    expect(screen.getByTestId('worker-1')).toBeInTheDocument();
    expect(screen.getByTestId('worker-2')).toBeInTheDocument();
    expect(screen.getByTestId('worker-3')).toBeInTheDocument();
  });

  it('marks the selected worker when clicked', async () => {
    const mockWorkers = [
      { id: '1', type: 'red' as const },
      { id: '2', type: 'blue' as const },
      { id: '3', type: 'green' as const },
    ];

    renderWithProvider(mockWorkers);

    await act(async () => {
      fireEvent.click(screen.getByTestId('worker-2'));
    });

    expect(screen.getByTestId('worker-2')).toHaveClass('worker-selected');
    expect(screen.getByTestId('worker-1')).not.toHaveClass('worker-selected');
    expect(screen.getByTestId('worker-3')).not.toHaveClass('worker-selected');
  });

  it('renders empty pool when no workers in context', () => {
    renderWithProvider([]);

    expect(screen.queryByTestId(/worker-/)).not.toBeInTheDocument();
    expect(screen.getByText('Workers')).toBeInTheDocument();
    expect(screen.getByText('+ Add Worker')).toBeInTheDocument();
  });

  it('shows add worker options when add button clicked', async () => {
    renderWithProvider([]);

    await act(async () => {
      fireEvent.click(screen.getByText('+ Add Worker'));
    });

    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('adds a new worker to context when confirm clicked', async () => {
    renderWithProvider([]);

    await act(async () => {
      fireEvent.click(screen.getByText('+ Add Worker'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm'));
    });

    expect(screen.getAllByTestId(/^worker-/)).toHaveLength(1);
  });

  it('deletes a worker from context when delete button clicked', async () => {
    const mockWorkers = [{ id: 'R1', type: 'red' as const }];

    renderWithProvider(mockWorkers);

    expect(screen.getByTestId('worker-R1')).toBeInTheDocument();

    const deleteButton = screen.getByTitle('Delete worker');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(screen.queryByTestId('worker-R1')).not.toBeInTheDocument();
  });
});
