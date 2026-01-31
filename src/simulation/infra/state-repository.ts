import { z } from 'zod';
import type { Board } from '../domain/board/board';
import {
  BoardStateSchema,
  serializeBoard,
  deserializeBoard,
} from './board-serialization';

const STORAGE_KEY = 'kanban-vibe-state';
const AUTOSAVE_KEY = 'kanban-vibe-autosave';
const SLOT_KEYS = [
  'kanban-vibe-slot-1',
  'kanban-vibe-slot-2',
  'kanban-vibe-slot-3',
] as const;

const SlotDataSchema = z.object({
  name: z.string(),
  savedAt: z.number(),
  state: BoardStateSchema,
});

export type SlotNumber = 1 | 2 | 3;

export interface SlotInfo {
  name: string;
  savedAt: number;
}

export interface SlotData extends SlotInfo {
  board: Board;
}

function isValidSlotNumber(slot: number): slot is SlotNumber {
  return slot >= 1 && slot <= 3;
}

function getSlotKey(slot: SlotNumber): string {
  return SLOT_KEYS[slot - 1];
}

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

  saveToSlot(slot: number, board: Board, name: string): void {
    if (!isValidSlotNumber(slot)) {
      throw new Error('Invalid slot number');
    }
    const key = getSlotKey(slot);
    const slotData = {
      name,
      savedAt: Date.now(),
      state: serializeBoard(board),
    };
    const json = JSON.stringify(slotData);
    try {
      localStorage.setItem(key, json);
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : '';
      if (errorName === 'QuotaExceededError') {
        console.warn(`LocalStorage quota exceeded while saving to slot ${slot}.`, error);
        return;
      }
      throw error;
    }
  },

  loadFromSlot(slot: number): SlotData | null {
    if (!isValidSlotNumber(slot)) {
      throw new Error('Invalid slot number');
    }
    const key = getSlotKey(slot);
    const json = localStorage.getItem(key);
    if (json === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(json);
      const result = SlotDataSchema.safeParse(parsed);

      if (!result.success) {
        console.error(`Failed to parse slot ${slot}:`, result.error.format());
        return null;
      }

      return {
        name: result.data.name,
        savedAt: result.data.savedAt,
        board: deserializeBoard(result.data.state),
      };
    } catch (error) {
      console.error(`Failed to load slot ${slot}:`, error);
      return null;
    }
  },

  clearSlot(slot: number): void {
    if (!isValidSlotNumber(slot)) {
      throw new Error('Invalid slot number');
    }
    const key = getSlotKey(slot);
    localStorage.removeItem(key);
  },

  renameSlot(slot: number, newName: string): void {
    if (!isValidSlotNumber(slot)) {
      throw new Error('Invalid slot number');
    }
    const slotData = this.loadFromSlot(slot);
    if (slotData === null) {
      throw new Error('Slot is empty');
    }
    const key = getSlotKey(slot);
    const updatedData = {
      name: newName,
      savedAt: slotData.savedAt,
      state: serializeBoard(slotData.board),
    };
    const json = JSON.stringify(updatedData);
    localStorage.setItem(key, json);
  },

  getSlotInfo(slot: number): SlotInfo | null {
    if (!isValidSlotNumber(slot)) {
      throw new Error('Invalid slot number');
    }
    const key = getSlotKey(slot);
    const json = localStorage.getItem(key);
    if (json === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(json);
      const result = SlotDataSchema.safeParse(parsed);

      if (!result.success) {
        return null;
      }

      return {
        name: result.data.name,
        savedAt: result.data.savedAt,
      };
    } catch {
      return null;
    }
  },

  getAllSlotInfo(): [SlotInfo | null, SlotInfo | null, SlotInfo | null] {
    return [
      this.getSlotInfo(1),
      this.getSlotInfo(2),
      this.getSlotInfo(3),
    ];
  },
} as const;
