import type { Card } from './card';

export class CardAgingService {
  static ageCard(card: Card): Card {
    const shouldAge = card.stage !== 'options' && card.stage !== 'done';

    return {
      ...card,
      age: shouldAge ? card.age + 1 : card.age,
    };
  }

  static ageCards(cards: Card[]): Card[] {
    return cards.map(card => CardAgingService.ageCard(card));
  }
}