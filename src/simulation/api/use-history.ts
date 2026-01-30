import { useEffect } from 'react';
import { isTextInputFocused } from './keyboard-utils';

export interface UseHistoryProps {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export function useHistory({ canUndo, canRedo, undo, redo }: UseHistoryProps): UseHistoryProps {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextInputFocused()) {
        return;
      }

      const key = event.key?.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      const isUndo = key === 'z' && hasModifier && !event.shiftKey;

      // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, or Ctrl+Y
      const isRedo = (key === 'z' && hasModifier && event.shiftKey) ||
                     (key === 'y' && event.ctrlKey && !event.shiftKey);

      if (isUndo && canUndo) {
        event.preventDefault();
        undo();
      } else if (isRedo && canRedo) {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, undo, redo]);

  return { canUndo, canRedo, undo, redo };
}
