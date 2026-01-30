import { useEffect } from 'react';
import { isTextInputFocused } from './keyboard-utils';

export interface UseUndoProps {
  canUndo: boolean;
  undo: () => void;
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
