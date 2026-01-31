import type { Board } from '../domain/board/board';
import {
  BoardStateSchema,
  serializeBoard,
  deserializeBoard,
} from './board-serialization';

const STORAGE_KEY = 'kanban-vibe-state';
const AUTOSAVE_KEY = 'kanban-vibe-autosave';

function saveToStorage(key: string, board: Board, operation: string): void {
  const state = serializeBoard(board);
  const json = JSON.stringify(state);
  try {
    localStorage.setItem(key, json);
  } catch (error) {
    const name = error instanceof DOMException ? error.name : '';
    if (name === 'QuotaExceededError') {
      console.warn(`LocalStorage quota exceeded while ${operation}.`, error);
      return;
    }
    throw error;
  }
}

function loadFromStorage(key: string, operation: string): Board | null {
  const json = localStorage.getItem(key);
  if (json === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(json);
    const result = BoardStateSchema.safeParse(parsed);

    if (!result.success) {
      console.error(`Failed to parse ${operation}:`, result.error.format());
      return null;
    }

    return deserializeBoard(result.data);
  } catch (error) {
    console.error(`Failed to load ${operation}:`, error);
    return null;
  }
}

export const StateRepository = {
  saveBoard(board: Board): void {
    saveToStorage(STORAGE_KEY, board, 'saving board');
  },

  loadBoard(): Board | null {
    return loadFromStorage(STORAGE_KEY, 'board from localStorage');
  },

  clearBoard(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  saveAutosave(board: Board): void {
    saveToStorage(AUTOSAVE_KEY, board, 'autosaving board');
  },

  loadAutosave(): Board | null {
    return loadFromStorage(AUTOSAVE_KEY, 'autosave from localStorage');
  },

  clearAutosave(): void {
    localStorage.removeItem(AUTOSAVE_KEY);
  },
} as const;
