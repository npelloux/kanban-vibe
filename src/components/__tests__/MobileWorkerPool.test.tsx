import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MobileWorkerPool } from '../MobileWorkerPool';

describe('MobileWorkerPool Component', () => {
  const mockWorkers = [
    { id: '1', type: 'red' as const },
    { id: '2', type: 'blue' as const },
    { id: '3', type: 'green' as const },
  ];

  const mockOnWorkerSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Collapsed State (FAB)', () => {
    it('renders a floating action button when collapsed', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      expect(screen.getByRole('button', { name: /open worker pool/i })).toBeInTheDocument();
    });

    it('shows worker count badge on FAB', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows zero count when no workers', () => {
      render(
        <MobileWorkerPool
          workers={[]}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('does not show bottom sheet when collapsed', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Expanded State (Bottom Sheet)', () => {
    it('opens bottom sheet when FAB is clicked', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows all workers in bottom sheet', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      expect(screen.getByTestId('worker-1')).toBeInTheDocument();
      expect(screen.getByTestId('worker-2')).toBeInTheDocument();
      expect(screen.getByTestId('worker-3')).toBeInTheDocument();
    });

    it('shows close button in bottom sheet', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      const closeButton = screen.getByRole('dialog').querySelector('.mobile-worker-pool-close');
      expect(closeButton).toBeInTheDocument();
    });

    it('closes bottom sheet when close button is clicked', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByRole('dialog').querySelector('.mobile-worker-pool-close') as HTMLButtonElement;
      fireEvent.click(closeButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes bottom sheet when overlay is clicked', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const overlay = screen.getByTestId('bottom-sheet-overlay');
      fireEvent.click(overlay);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Worker Selection', () => {
    it('calls onWorkerSelect when a worker is clicked', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));
      fireEvent.click(screen.getByTestId('worker-2'));

      expect(mockOnWorkerSelect).toHaveBeenCalledWith('2');
    });

    it('marks the selected worker', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId="2"
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      expect(screen.getByTestId('worker-2')).toHaveClass('worker-selected');
      expect(screen.getByTestId('worker-1')).not.toHaveClass('worker-selected');
    });
  });

  describe('Worker Management', () => {
    const mockOnAddWorker = vi.fn();
    const mockOnDeleteWorker = vi.fn();

    it('shows add worker button when onAddWorker is provided', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
          onAddWorker={mockOnAddWorker}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      expect(screen.getByRole('button', { name: /add worker/i })).toBeInTheDocument();
    });

    it('shows delete buttons when onDeleteWorker is provided', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
          onDeleteWorker={mockOnDeleteWorker}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      const deleteButtons = screen.getAllByRole('button', { name: /delete worker/i });
      expect(deleteButtons).toHaveLength(3);
    });

    it('calls onDeleteWorker when delete button is clicked', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
          onDeleteWorker={mockOnDeleteWorker}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      const deleteButtons = screen.getAllByRole('button', { name: /delete worker/i });
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDeleteWorker).toHaveBeenCalledWith('1');
    });

    it('completes add worker flow when type is selected and confirmed', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
          onAddWorker={mockOnAddWorker}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));
      fireEvent.click(screen.getByRole('button', { name: /add worker/i }));

      const blueRadio = screen.getByRole('radio', { name: /blue/i });
      fireEvent.click(blueRadio);

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockOnAddWorker).toHaveBeenCalledWith('blue');
      expect(screen.queryByRole('radio', { name: /blue/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('FAB has appropriate aria-label', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      const fab = screen.getByRole('button', { name: /open worker pool/i });
      expect(fab).toHaveAttribute('aria-label', 'Open worker pool');
    });

    it('bottom sheet has role dialog', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Worker pool');
    });

    it('overlay is keyboard accessible', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));

      const overlay = screen.getByTestId('bottom-sheet-overlay');
      expect(overlay).toHaveAttribute('role', 'button');
      expect(overlay).toHaveAttribute('tabIndex', '0');
      expect(overlay).toHaveAttribute('aria-label', 'Close worker pool');
    });

    it('closes bottom sheet when overlay receives Enter key', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const overlay = screen.getByTestId('bottom-sheet-overlay');
      fireEvent.keyDown(overlay, { key: 'Enter' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes bottom sheet when overlay receives Escape key', () => {
      render(
        <MobileWorkerPool
          workers={mockWorkers}
          selectedWorkerId={null}
          onWorkerSelect={mockOnWorkerSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /open worker pool/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const overlay = screen.getByTestId('bottom-sheet-overlay');
      fireEvent.keyDown(overlay, { key: 'Escape' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
