import { createContext } from 'react';
import type { Board } from '../domain/board/board';
import type { HistoryManagerState } from '../application/history-manager';

export interface BoardContextValue {
  board: Board;
  setBoard: (board: Board) => void;
  updateBoard: (updater: (board: Board) => Board) => void;
}

export interface HistoryContextValue {
  historyManager: HistoryManagerState;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (action: string, state: Board) => void;
  undo: () => void;
  redo: () => void;
}

export type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';

export interface SaveStateContextValue {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
}

export interface ResetBoardContextValue {
  resetBoard: () => void;
}

export const BoardContext = createContext<BoardContextValue | null>(null);
export const HistoryContext = createContext<HistoryContextValue | null>(null);
export const SaveStateContext = createContext<SaveStateContextValue | null>(null);
export const ResetBoardContext = createContext<ResetBoardContextValue | null>(null);
