import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHistoricalTracking } from './use-historical-tracking';
import { Board } from '../domain/board/board';
import { WipLimits } from '../domain/wip/wip-limits';
import { createTestCard } from '../application/test-fixtures';

describe('useHistoricalTracking', () => {
  let emptyBoard: Board;

  beforeEach(() => {
    emptyBoard = Board.empty(WipLimits.empty());
  });

  it('captures initial snapshot on day 0', () => {
    const { result } = renderHook(() => useHistoricalTracking(emptyBoard, 0));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].day).toBe(0);
  });

  it('adds new snapshot when day advances', async () => {
    const { result, rerender } = renderHook(
      ({ board, day }) => useHistoricalTracking(board, day),
      { initialProps: { board: emptyBoard, day: 0 } }
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].day).toBe(0);

    rerender({ board: emptyBoard, day: 1 });

    await waitFor(() => {
      expect(result.current).toHaveLength(2);
    });

    expect(result.current[1]).toEqual({
      day: 1,
      columnData: {
        options: 0,
        redActive: 0,
        redFinished: 0,
        blueActive: 0,
        blueFinished: 0,
        green: 0,
        done: 0,
      },
    });
  });

  it('accumulates snapshots as days advance', async () => {
    const { result, rerender } = renderHook(
      ({ board, day }) => useHistoricalTracking(board, day),
      { initialProps: { board: emptyBoard, day: 1 } }
    );

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });

    rerender({ board: emptyBoard, day: 2 });

    await waitFor(() => {
      expect(result.current).toHaveLength(2);
    });

    rerender({ board: emptyBoard, day: 3 });

    await waitFor(() => {
      expect(result.current).toHaveLength(3);
    });

    expect(result.current.map(s => s.day)).toEqual([1, 2, 3]);
  });

  it('does not duplicate snapshot when day stays the same', async () => {
    const { result, rerender } = renderHook(
      ({ board, day }) => useHistoricalTracking(board, day),
      { initialProps: { board: emptyBoard, day: 1 } }
    );

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });

    rerender({ board: emptyBoard, day: 1 });
    rerender({ board: emptyBoard, day: 1 });
    rerender({ board: emptyBoard, day: 1 });

    expect(result.current).toHaveLength(1);
  });

  it('counts cards by stage correctly', async () => {
    const optionsCard = createTestCard({ stage: 'options' });
    const redActiveCard1 = createTestCard({ stage: 'red-active' });
    const redActiveCard2 = createTestCard({ stage: 'red-active' });
    const doneCard = createTestCard({ stage: 'done' });

    let board = emptyBoard;
    board = Board.addCard(board, optionsCard);
    board = Board.addCard(board, redActiveCard1);
    board = Board.addCard(board, redActiveCard2);
    board = Board.addCard(board, doneCard);

    const { result } = renderHook(() => useHistoricalTracking(board, 1));

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });

    expect(result.current[0].columnData).toEqual({
      options: 1,
      redActive: 2,
      redFinished: 0,
      blueActive: 0,
      blueFinished: 0,
      green: 0,
      done: 1,
    });
  });

  it('updates counts when board changes', async () => {
    const { result, rerender } = renderHook(
      ({ board, day }) => useHistoricalTracking(board, day),
      { initialProps: { board: emptyBoard, day: 1 } }
    );

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });

    expect(result.current[0].columnData.options).toBe(0);

    const card = createTestCard({ stage: 'options' });
    const boardWithCard = Board.addCard(emptyBoard, card);

    rerender({ board: boardWithCard, day: 2 });

    await waitFor(() => {
      expect(result.current).toHaveLength(2);
    });

    expect(result.current[1].columnData.options).toBe(1);
  });
});
