import type { Board } from '../domain/board/board';

export interface HistoryEntry {
  readonly timestamp: number;
  readonly action: string;
  readonly state: Board;
}

export interface HistoryManagerState {
  readonly entries: readonly HistoryEntry[];
  readonly currentIndex: number;
  readonly maxDepth: number;
}

export interface UndoRedoResult {
  readonly manager: HistoryManagerState;
  readonly state: Board;
}

const DEFAULT_MAX_DEPTH = 50;

export const HistoryManager = {
  create(maxDepth: number = DEFAULT_MAX_DEPTH): HistoryManagerState {
    return {
      entries: [],
      currentIndex: -1,
      maxDepth,
    };
  },

  push(
    manager: HistoryManagerState,
    action: string,
    state: Board
  ): HistoryManagerState {
    const entry: HistoryEntry = {
      timestamp: Date.now(),
      action,
      state,
    };

    const entriesUpToCurrent = manager.entries.slice(0, manager.currentIndex + 1);
    const newEntries = [...entriesUpToCurrent, entry];

    const trimmedEntries =
      newEntries.length > manager.maxDepth
        ? newEntries.slice(newEntries.length - manager.maxDepth)
        : newEntries;

    return {
      ...manager,
      entries: trimmedEntries,
      currentIndex: trimmedEntries.length - 1,
    };
  },

  canUndo(manager: HistoryManagerState): boolean {
    return manager.currentIndex > 0;
  },

  canRedo(manager: HistoryManagerState): boolean {
    return manager.currentIndex < manager.entries.length - 1;
  },

  undo(manager: HistoryManagerState): UndoRedoResult | null {
    if (!HistoryManager.canUndo(manager)) {
      return null;
    }

    const newIndex = manager.currentIndex - 1;
    const state = manager.entries[newIndex].state;

    return {
      manager: {
        ...manager,
        currentIndex: newIndex,
      },
      state,
    };
  },

  redo(manager: HistoryManagerState): UndoRedoResult | null {
    if (!HistoryManager.canRedo(manager)) {
      return null;
    }

    const newIndex = manager.currentIndex + 1;
    const state = manager.entries[newIndex].state;

    return {
      manager: {
        ...manager,
        currentIndex: newIndex,
      },
      state,
    };
  },

  getCurrentState(manager: HistoryManagerState): Board | null {
    if (manager.currentIndex < 0 || manager.entries.length === 0) {
      return null;
    }
    return manager.entries[manager.currentIndex].state;
  },
} as const;
