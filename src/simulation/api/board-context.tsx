import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Board } from '../domain/board/board';
import { Board as BoardFactory } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { StateRepository } from '../infra/state-repository';

interface BoardContextValue {
  board: Board;
  setBoard: (board: Board) => void;
  updateBoard: (updater: (board: Board) => Board) => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [board, setBoardState] = useState<Board>(() => {
    return StateRepository.loadBoard() ?? BoardFactory.empty(WipLimits.empty());
  });

  const setBoard = useCallback((newBoard: Board) => {
    setBoardState(newBoard);
    StateRepository.saveBoard(newBoard);
  }, []);

  const updateBoard = useCallback((updater: (board: Board) => Board) => {
    setBoardState((current) => {
      const newBoard = updater(current);
      StateRepository.saveBoard(newBoard);
      return newBoard;
    });
  }, []);

  return (
    <BoardContext.Provider value={{ board, setBoard, updateBoard }}>
      {children}
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
