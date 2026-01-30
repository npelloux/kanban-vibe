import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from './use-history';

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

describe('useHistory', () => {
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canUndo', () => {
    it('returns false when canUndo option is false', () => {
      const { result } = renderHook(() =>
        useHistory({ canUndo: false, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

      expect(result.current.canUndo).toBe(false);
    });

    it('returns true when canUndo option is true', () => {
      const { result } = renderHook(() =>
        useHistory({ canUndo: true, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

      expect(result.current.canUndo).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('returns false when canRedo option is false', () => {
      const { result } = renderHook(() =>
        useHistory({ canUndo: false, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

      expect(result.current.canRedo).toBe(false);
    });

    it('returns true when canRedo option is true', () => {
      const { result } = renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      expect(result.current.canRedo).toBe(true);
    });
  });

  describe('undo function', () => {
    it('calls the provided undo callback', () => {
      const { result } = renderHook(() =>
        useHistory({ canUndo: true, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

      result.current.undo();

      expect(mockUndo).toHaveBeenCalledTimes(1);
    });
  });

  describe('redo function', () => {
    it('calls the provided redo callback', () => {
      const { result } = renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      result.current.redo();

      expect(mockRedo).toHaveBeenCalledTimes(1);
    });
  });

  describe('undo keyboard shortcut', () => {
    it('triggers undo on Ctrl+Z', () => {
      renderHook(() =>
        useHistory({ canUndo: true, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

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
      expect(mockRedo).not.toHaveBeenCalled();
    });

    it('triggers undo on Cmd+Z (Mac)', () => {
      renderHook(() =>
        useHistory({ canUndo: true, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

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

    it('does not trigger undo when canUndo is false', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

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

    it('does not trigger when input is focused', () => {
      withFocusedElement('input', {}, () => {
        renderHook(() =>
          useHistory({ canUndo: true, canRedo: false, undo: mockUndo, redo: mockRedo })
        );

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
  });

  describe('redo keyboard shortcut', () => {
    it('triggers redo on Ctrl+Shift+Z', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockRedo).toHaveBeenCalledTimes(1);
      expect(mockUndo).not.toHaveBeenCalled();
    });

    it('triggers redo on Cmd+Shift+Z (Mac)', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          metaKey: true,
          shiftKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockRedo).toHaveBeenCalledTimes(1);
    });

    it('triggers redo on Ctrl+Y (alternative Windows shortcut)', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'y',
          ctrlKey: true,
          shiftKey: false,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockRedo).toHaveBeenCalledTimes(1);
    });

    it('triggers redo with uppercase Z (caps lock)', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'Z',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockRedo).toHaveBeenCalledTimes(1);
    });

    it('does not trigger redo when canRedo is false', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: false, undo: mockUndo, redo: mockRedo })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockRedo).not.toHaveBeenCalled();
    });

    it('does not trigger when input is focused', () => {
      withFocusedElement('input', {}, () => {
        renderHook(() =>
          useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
        );

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockRedo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when textarea is focused', () => {
      withFocusedElement('textarea', {}, () => {
        renderHook(() =>
          useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
        );

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockRedo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when select is focused', () => {
      withFocusedElement('select', {}, () => {
        renderHook(() =>
          useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
        );

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockRedo).not.toHaveBeenCalled();
      });
    });

    it('does not trigger when contenteditable is focused', () => {
      withFocusedElement('div', { contenteditable: 'true' }, () => {
        renderHook(() =>
          useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
        );

        act(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
          });
          document.dispatchEvent(event);
        });

        expect(mockRedo).not.toHaveBeenCalled();
      });
    });

    it('prevents default browser redo behavior', () => {
      renderHook(() =>
        useHistory({ canUndo: false, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('cleans up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useHistory({ canUndo: true, canRedo: true, undo: mockUndo, redo: mockRedo })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });
});
