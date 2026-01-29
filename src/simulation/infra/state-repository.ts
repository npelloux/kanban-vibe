import type { Board } from '../domain/board/board';
import {
  BoardStateSchema,
  serializeBoard,
  deserializeBoard,
} from './board-serialization';

const STORAGE_KEY = 'kanban-vibe-state';

export const StateRepository = {
  saveBoard(board: Board): void {
    const state = serializeBoard(board);
    const json = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded while saving board.', error);
        return;
      }
      throw error;
    }
  },

  loadBoard(): Board | null {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(json);
      const result = BoardStateSchema.safeParse(parsed);

      if (!result.success) {
        console.error(
          'Failed to parse saved board state:',
          result.error.format()
        );
        return null;
      }

      return deserializeBoard(result.data);
    } catch (error) {
      console.error('Failed to load board from localStorage:', error);
      return null;
    }
  },

  clearBoard(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
} as const;
