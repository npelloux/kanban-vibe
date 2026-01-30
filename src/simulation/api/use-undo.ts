import { useEffect } from 'react';

export interface UseUndoProps {
  canUndo: boolean;
  undo: () => void;
}

function isTextInputFocused(): boolean {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) return false;

  if (element.matches('input, textarea, select')) return true;
  if (element.isContentEditable || element.matches('[contenteditable="true"], [contenteditable=""]')) return true;

  return false;
}

export function useUndo({ canUndo, undo }: UseUndoProps): UseUndoProps {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextInputFocused()) {
        return;
      }

      const isUndo =
        event.key?.toLowerCase() === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey;

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
