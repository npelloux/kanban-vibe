import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastContainer } from '../ToastContainer';
import type { ToastData } from '../ToastContainer';

describe('ToastContainer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders nothing when there are no toasts', () => {
      render(<ToastContainer toasts={[]} onDismiss={() => {}} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders a single toast', () => {
      const toasts: ToastData[] = [
        { id: '1', message: 'Test message', type: 'info' },
      ];

      render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders multiple toasts', () => {
      const toasts: ToastData[] = [
        { id: '1', message: 'First message', type: 'info' },
        { id: '2', message: 'Second message', type: 'warning' },
        { id: '3', message: 'Third message', type: 'error' },
      ];

      render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);

      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText('Third message')).toBeInTheDocument();
    });
  });

  describe('stacking behavior', () => {
    it('renders toasts in order (first toast at bottom)', () => {
      const toasts: ToastData[] = [
        { id: '1', message: 'First message', type: 'info' },
        { id: '2', message: 'Second message', type: 'warning' },
      ];

      render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);

      const allToasts = screen.getAllByRole('alert');
      expect(allToasts).toHaveLength(2);
      expect(allToasts[0]).toHaveTextContent('First message');
      expect(allToasts[1]).toHaveTextContent('Second message');
    });

    it('limits visible toasts to maxVisible (default 5)', () => {
      const toasts: ToastData[] = Array.from({ length: 7 }, (_, i) => ({
        id: String(i),
        message: `Message ${i}`,
        type: 'info' as const,
      }));

      render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);

      const visibleToasts = screen.getAllByRole('alert');
      expect(visibleToasts).toHaveLength(5);
    });

    it('respects custom maxVisible prop', () => {
      const toasts: ToastData[] = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        message: `Message ${i}`,
        type: 'info' as const,
      }));

      render(<ToastContainer toasts={toasts} onDismiss={() => {}} maxVisible={3} />);

      const visibleToasts = screen.getAllByRole('alert');
      expect(visibleToasts).toHaveLength(3);
    });

    it('shows newest toasts when queue is full', () => {
      const toasts: ToastData[] = Array.from({ length: 7 }, (_, i) => ({
        id: String(i),
        message: `Message ${i}`,
        type: 'info' as const,
      }));

      render(<ToastContainer toasts={toasts} onDismiss={() => {}} maxVisible={3} />);

      expect(screen.queryByText('Message 0')).not.toBeInTheDocument();
      expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
      expect(screen.getByText('Message 4')).toBeInTheDocument();
      expect(screen.getByText('Message 5')).toBeInTheDocument();
      expect(screen.getByText('Message 6')).toBeInTheDocument();
    });
  });

  describe('dismiss behavior', () => {
    it('calls onDismiss when a toast dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      const toasts: ToastData[] = [
        { id: 'toast-1', message: 'Test message', type: 'info' },
      ];

      render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss notification'));

      expect(onDismiss).toHaveBeenCalledWith('toast-1');
    });

    it('auto-dismisses toasts after their duration', () => {
      const onDismiss = vi.fn();
      const toasts: ToastData[] = [
        { id: 'toast-1', message: 'Test message', type: 'info' },
      ];

      render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(onDismiss).toHaveBeenCalledWith('toast-1');
    });
  });

  describe('container positioning', () => {
    it('has correct container class for positioning', () => {
      const toasts: ToastData[] = [
        { id: '1', message: 'Test message', type: 'info' },
      ];

      const { container } = render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);

      expect(container.querySelector('.toast-container')).toBeInTheDocument();
    });
  });
});
