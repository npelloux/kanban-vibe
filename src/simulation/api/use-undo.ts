import { useEffect } from 'react';

export interface UseUndoOptions {
  canUndo: boolean;
  undo: () => void;
}

export interface UseUndoResult {
  canUndo: boolean;
  undo: () => void;
}

function isTextInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') {
    return true;
  }

  if (activeElement.getAttribute('contenteditable') === 'true') {
    return true;
  }

  return false;
}

export function useUndo({ canUndo, undo }: UseUndoOptions): UseUndoResult {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextInputFocused()) {
        return;
      }

      const isUndo =
        event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey;

      if (isUndo && canUndo) {
        event.preventDefault();
        undo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, undo]);

  return { canUndo, undo };
}
