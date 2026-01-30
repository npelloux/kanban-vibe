import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from './use-toast';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('showToast', () => {
    it('adds a toast to the queue', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'Test message', type: 'info' });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
      expect(result.current.toasts[0].type).toBe('info');
    });

    it('generates unique ids for each toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'First', type: 'info' });
        result.current.showToast({ message: 'Second', type: 'info' });
      });

      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });

    it('supports all toast types', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'Info', type: 'info' });
        result.current.showToast({ message: 'Warning', type: 'warning' });
        result.current.showToast({ message: 'Error', type: 'error' });
        result.current.showToast({ message: 'Success', type: 'success' });
      });

      expect(result.current.toasts).toHaveLength(4);
      expect(result.current.toasts.map(t => t.type)).toEqual(['info', 'warning', 'error', 'success']);
    });

    it('supports custom duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'Test', type: 'info', duration: 2000 });
      });

      expect(result.current.toasts[0].duration).toBe(2000);
    });
  });

  describe('dismissToast', () => {
    it('removes a toast by id', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'Test', type: 'info' });
      });

      const toastId = result.current.toasts[0].id;

      act(() => {
        result.current.dismissToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('removes only the specified toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'First', type: 'info' });
        result.current.showToast({ message: 'Second', type: 'info' });
      });

      const firstToastId = result.current.toasts[0].id;

      act(() => {
        result.current.dismissToast(firstToastId);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Second');
    });
  });

  describe('clearAllToasts', () => {
    it('removes all toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast({ message: 'First', type: 'info' });
        result.current.showToast({ message: 'Second', type: 'warning' });
        result.current.showToast({ message: 'Third', type: 'error' });
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('convenience methods', () => {
    it('provides info method', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.info('Info message');
      });

      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].message).toBe('Info message');
    });

    it('provides warning method', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.warning('Warning message');
      });

      expect(result.current.toasts[0].type).toBe('warning');
      expect(result.current.toasts[0].message).toBe('Warning message');
    });

    it('provides error method', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.error('Error message');
      });

      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[0].message).toBe('Error message');
    });

    it('provides success method', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success('Success message');
      });

      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success message');
    });
  });

  describe('context usage', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a ToastProvider');
    });
  });

  describe('ToastProvider', () => {
    it('renders children', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders ToastContainer', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast({ message: 'Test', type: 'info' })}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Show Toast').click();
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
