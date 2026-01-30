import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndo } from './use-undo';

function withFocusedElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attrs: Record<string, string>,
  callback: () => void
): void {
  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  document.body.appendChild(element);
  element.focus();
  try {
    callback();
  } finally {
    document.body.removeChild(element);
  }
}

describe('useUndo', () => {
  const mockUndo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canUndo', () => {
    it('returns false when canUndo option is false', () => {
      const { result } = renderHook(() =>
        useUndo({ canUndo: false, undo: mockUndo })
      );

      expect(result.current.canUndo).toBe(false);
    });

    it('returns true when canUndo option is true', () => {
      const { result } = renderHook(() =>
        useUndo({ canUndo: true, undo: mockUndo })
      );

      expect(result.current.canUndo).toBe(true);
    });
  });

  describe('undo function', () => {
    it('calls the provided undo callback', () => {
      const { result } = renderHook(() =>
        useUndo({ canUndo: true, undo: mockUndo })
      );

      result.current.undo();

      expect(mockUndo).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard shortcut', () => {
    it('triggers undo on Ctrl+Z', () => {
      renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          shiftKey: false,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it('triggers undo on Cmd+Z (Mac)', () => {
      renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          metaKey: true,
          shiftKey: false,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it('triggers undo on Ctrl+Z with uppercase Z (caps lock)', () => {
      renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'Z',
          ctrlKey: true,
          shiftKey: false,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it('does not trigger on Ctrl+Shift+Z (redo shortcut)', () => {
      renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockUndo).not.toHaveBeenCalled();
    });

    it('does not trigger on regular z key', () => {
      renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockUndo).not.toHaveBeenCalled();
    });

    it('prevents default browser undo behavior', () => {
      renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('does not trigger when input is focused', () => {
      withFocusedElement('input', {}, () => {
        renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: false,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockUndo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when textarea is focused', () => {
      withFocusedElement('textarea', {}, () => {
        renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: false,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockUndo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when contenteditable is focused', () => {
      withFocusedElement('div', { contenteditable: 'true' }, () => {
        renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: false,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockUndo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when contenteditable with empty string value is focused', () => {
      withFocusedElement('div', { contenteditable: '' }, () => {
        renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: false,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockUndo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when select is focused', () => {
      withFocusedElement('select', {}, () => {
        renderHook(() => useUndo({ canUndo: true, undo: mockUndo }));

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: false,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockUndo).not.toHaveBeenCalled();
      });
    });

    it('cleans up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useUndo({ canUndo: true, undo: mockUndo })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });
});
