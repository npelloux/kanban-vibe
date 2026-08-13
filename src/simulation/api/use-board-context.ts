import { useContext } from 'react';
import {
  BoardContext,
  HistoryContext,
  SaveStateContext,
  ResetBoardContext,
} from './board-contexts';
import type {
  BoardContextValue,
  HistoryContextValue,
  SaveStateContextValue,
  ResetBoardContextValue,
} from './board-contexts';

export function useBoardContext(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
}

export function useHistoryContext(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within BoardProvider');
  }
  return context;
}

export function useSaveStateContext(): SaveStateContextValue {
  const context = useContext(SaveStateContext);
  if (!context) {
    throw new Error('useSaveStateContext must be used within BoardProvider');
  }
  return context;
}

export function useResetBoardContext(): ResetBoardContextValue {
  const context = useContext(ResetBoardContext);
  if (!context) {
    throw new Error('useResetBoardContext must be used within BoardProvider');
  }
  return context;
}
