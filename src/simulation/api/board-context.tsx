import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Board } from '../domain/board/board';
import { Board as BoardFactory } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { StateRepository } from '../infra/state-repository';
import {
  HistoryManager,
  type HistoryManagerState,
} from '../application/history-manager';

interface BoardContextValue {
  board: Board;
  setBoard: (board: Board) => void;
  updateBoard: (updater: (board: Board) => Board) => void;
}

interface HistoryContextValue {
  historyManager: HistoryManagerState;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (action: string, state: Board) => void;
  undo: () => void;
  redo: () => void;
}

export type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';

interface SaveStateContextValue {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
}

const BoardContext = createContext<BoardContextValue | null>(null);
const HistoryContext = createContext<HistoryContextValue | null>(null);
const SaveStateContext = createContext<SaveStateContextValue | null>(null);

export interface BoardProviderProps {
  children: ReactNode;
}

const AUTOSAVE_DEBOUNCE_MS = 500;

export function BoardProvider({ children }: BoardProviderProps) {
  const [board, setBoardState] = useState<Board>(() => {
    return (
      StateRepository.loadBoard() ??
      StateRepository.loadAutosave() ??
      BoardFactory.empty(WipLimits.empty())
    );
  });

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const scheduleAutosave = useCallback((boardToSave: Board) => {
    if (autosaveTimeoutRef.current !== null) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    setSaveStatus('saving');
    autosaveTimeoutRef.current = setTimeout(() => {
      StateRepository.saveAutosave(boardToSave);
      autosaveTimeoutRef.current = null;
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current !== null) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  const [historyManager, setHistoryManager] = useState<HistoryManagerState>(
    () => HistoryManager.create()
  );

  const setBoard = useCallback((newBoard: Board) => {
    setBoardState(newBoard);
    StateRepository.saveBoard(newBoard);
    scheduleAutosave(newBoard);
  }, [scheduleAutosave]);

  const updateBoard = useCallback((updater: (board: Board) => Board) => {
    setBoardState((current) => {
      const newBoard = updater(current);
      StateRepository.saveBoard(newBoard);
      scheduleAutosave(newBoard);
      return newBoard;
    });
  }, [scheduleAutosave]);

  const canUndo = useMemo(
    () => HistoryManager.canUndo(historyManager),
    [historyManager]
  );

  const canRedo = useMemo(
    () => HistoryManager.canRedo(historyManager),
    [historyManager]
  );

  const pushHistory = useCallback((action: string, state: Board) => {
    setHistoryManager((current) => HistoryManager.push(current, action, state));
  }, []);

  const undo = useCallback(() => {
    const result = HistoryManager.undo(historyManager);
    if (result) {
      setBoardState(result.state);
      StateRepository.saveBoard(result.state);
      setHistoryManager(result.manager);
    }
  }, [historyManager]);

  const redo = useCallback(() => {
    const result = HistoryManager.redo(historyManager);
    if (result) {
      setBoardState(result.state);
      StateRepository.saveBoard(result.state);
      setHistoryManager(result.manager);
    }
  }, [historyManager]);

  const historyValue = useMemo(
    () => ({
      historyManager,
      canUndo,
      canRedo,
      pushHistory,
      undo,
      redo,
    }),
    [historyManager, canUndo, canRedo, pushHistory, undo, redo]
  );

  const saveStateValue = useMemo(
    () => ({
      saveStatus,
      lastSavedAt,
    }),
    [saveStatus, lastSavedAt]
  );

  return (
    <BoardContext.Provider value={{ board, setBoard, updateBoard }}>
      <HistoryContext.Provider value={historyValue}>
        <SaveStateContext.Provider value={saveStateValue}>
          {children}
        </SaveStateContext.Provider>
      </HistoryContext.Provider>
    </BoardContext.Provider>
  );
}

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
