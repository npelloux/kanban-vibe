import {
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
import {
  BoardContext,
  HistoryContext,
  SaveStateContext,
  ResetBoardContext,
} from './board-contexts';
import type { SaveStatus } from './board-contexts';

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
    setSaveStatus('dirty');
    autosaveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      try {
        StateRepository.saveAutosave(boardToSave);
        autosaveTimeoutRef.current = null;
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } catch {
        autosaveTimeoutRef.current = null;
        setSaveStatus('error');
      }
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

  const resetBoard = useCallback(() => {
    if (autosaveTimeoutRef.current !== null) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    const emptyBoard = BoardFactory.empty(WipLimits.empty());
    setBoardState(emptyBoard);
    StateRepository.clearAutosave();
    StateRepository.saveBoard(emptyBoard);
    setSaveStatus('saved');
  }, []);

  const resetBoardValue = useMemo(
    () => ({
      resetBoard,
    }),
    [resetBoard]
  );

  return (
    <BoardContext.Provider value={{ board, setBoard, updateBoard }}>
      <HistoryContext.Provider value={historyValue}>
        <SaveStateContext.Provider value={saveStateValue}>
          <ResetBoardContext.Provider value={resetBoardValue}>
            {children}
          </ResetBoardContext.Provider>
        </SaveStateContext.Provider>
      </HistoryContext.Provider>
    </BoardContext.Provider>
  );
}
