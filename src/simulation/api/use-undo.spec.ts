import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndo } from './use-undo';

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
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

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

      document.body.removeChild(input);
    });

    it('does not trigger when textarea is focused', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

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

      document.body.removeChild(textarea);
    });

    it('does not trigger when contenteditable is focused', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      document.body.appendChild(div);
      div.focus();

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

      document.body.removeChild(div);
    });

    it('does not trigger when contenteditable with empty string value is focused', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', '');
      document.body.appendChild(div);
      div.focus();

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

      document.body.removeChild(div);
    });

    it('does not trigger when select is focused', () => {
      const select = document.createElement('select');
      document.body.appendChild(select);
      select.focus();

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

      document.body.removeChild(select);
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
