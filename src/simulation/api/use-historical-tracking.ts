import { useState, useEffect } from 'react';
import { Board } from '../domain/board/board';

interface ColumnData {
  options: number;
  redActive: number;
  redFinished: number;
  blueActive: number;
  blueFinished: number;
  green: number;
  done: number;
}

export interface DaySnapshot {
  day: number;
  columnData: ColumnData;
}

export function useHistoricalTracking(board: Board, currentDay: number): DaySnapshot[] {
  const [snapshots, setSnapshots] = useState<DaySnapshot[]>([]);

  useEffect(() => {
    const newEntry: DaySnapshot = {
      day: currentDay,
      columnData: {
        options: Board.getCardCountByStage(board, 'options'),
        redActive: Board.getCardCountByStage(board, 'red-active'),
        redFinished: Board.getCardCountByStage(board, 'red-finished'),
        blueActive: Board.getCardCountByStage(board, 'blue-active'),
        blueFinished: Board.getCardCountByStage(board, 'blue-finished'),
        green: Board.getCardCountByStage(board, 'green'),
        done: Board.getCardCountByStage(board, 'done'),
      },
    };
    setSnapshots((prev) => {
      if (prev.length === 0 || prev[prev.length - 1].day !== currentDay) {
        return [...prev, newEntry];
      }
      return prev;
    });
  }, [currentDay, board]);

  return snapshots;
}
