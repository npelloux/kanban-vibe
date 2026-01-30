import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toast } from '../Toast';
import type { ToastType } from '../Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders toast with message', () => {
      render(<Toast id="1" message="Test message" type="info" onDismiss={() => {}} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders toast with correct role for accessibility', () => {
      render(<Toast id="1" message="Test message" type="info" onDismiss={() => {}} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders dismiss button', () => {
      render(<Toast id="1" message="Test message" type="info" onDismiss={() => {}} />);

      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });
  });

  describe('toast types', () => {
    const types: ToastType[] = ['info', 'warning', 'error', 'success'];

    types.forEach((type) => {
      it(`renders ${type} toast with correct styling class`, () => {
        render(<Toast id="1" message="Test message" type={type} onDismiss={() => {}} />);

        expect(screen.getByRole('alert')).toHaveClass(`toast-${type}`);
      });
    });
  });

  describe('dismiss behavior', () => {
    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      render(<Toast id="1" message="Test message" type="info" onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss notification'));

      expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('auto-dismisses after 4 seconds by default', () => {
      const onDismiss = vi.fn();
      render(<Toast id="1" message="Test message" type="info" onDismiss={onDismiss} />);

      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('respects custom duration for auto-dismiss', () => {
      const onDismiss = vi.fn();
      render(<Toast id="1" message="Test message" type="info" onDismiss={onDismiss} duration={2000} />);

      act(() => {
        vi.advanceTimersByTime(1999);
      });

      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('does not auto-dismiss when duration is 0', () => {
      const onDismiss = vi.fn();
      render(<Toast id="1" message="Test message" type="info" onDismiss={onDismiss} duration={0} />);

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('clears timeout on unmount', () => {
      const onDismiss = vi.fn();
      const { unmount } = render(<Toast id="1" message="Test message" type="info" onDismiss={onDismiss} />);

      unmount();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has aria-live polite attribute', () => {
      render(<Toast id="1" message="Test message" type="info" onDismiss={() => {}} />);

      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('long messages', () => {
    it('renders long messages without truncation', () => {
      const longMessage = 'This is a very long message that should wrap to multiple lines without being truncated because users need to read the entire notification content';
      render(<Toast id="1" message={longMessage} type="info" onDismiss={() => {}} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
