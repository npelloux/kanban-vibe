import { useCallback } from 'react';
import { useBoardContext } from './board-context';
import { Board } from '../domain/board/board';
import { Card, type Stage } from '../domain/card/card';
import type { CardId } from '../domain/card/card-id';
import { CardFactory } from '../domain/card/card-factory';
import { moveCard as moveCardUseCase } from '../application/move-card';
import { assignWorker as assignWorkerUseCase } from '../application/assign-worker';
import { useToast } from '../../api/use-toast';

export function useKanbanBoard() {
  const { board, updateBoard } = useBoardContext();
  const { warning } = useToast();

  const cardsInStage = useCallback(
    (stage: Stage): readonly Card[] => {
      return Board.getCardsByStage(board, stage);
    },
    [board]
  );

  const moveCard = useCallback(
    (cardId: CardId) => {
      const result = moveCardUseCase({
        cardId,
        cards: board.cards,
        currentDay: board.currentDay,
        wipLimits: board.wipLimits,
      });

      if (result.alertMessage) {
        warning(result.alertMessage);
      } else {
        updateBoard((current) => Board.withCards(current, result.cards));
      }
    },
    [board, updateBoard, warning]
  );

  const assignWorker = useCallback(
    (cardId: CardId, workerId: string) => {
      const result = assignWorkerUseCase({
        cardId,
        workerId,
        cards: board.cards,
        workers: board.workers,
      });

      updateBoard((current) => Board.withCards(current, result.cards));
    },
    [board, updateBoard]
  );

  const addCard = useCallback(() => {
    updateBoard((current) => {
      const nextId = CardFactory.nextId(current.cards);
      const newCard = CardFactory.create({
        id: nextId,
        currentDay: current.currentDay,
      });
      return Board.addCard(current, newCard);
    });
  }, [updateBoard]);

  const toggleBlock = useCallback(
    (cardId: CardId) => {
      updateBoard((current) => {
        const card = Board.findCard(current, cardId);
        if (!card) {
          throw new Error(`Card '${cardId}' not found`);
        }
        return Board.updateCard(current, cardId, (c) =>
          Card.withBlocked(c, !c.isBlocked)
        );
      });
    },
    [updateBoard]
  );

  return {
    board,
    cards: board.cards,
    cardsInStage,
    moveCard,
    assignWorker,
    addCard,
    toggleBlock,
  };
}
