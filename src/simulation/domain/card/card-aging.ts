import type { Card } from './card';

export class CardAgingService {
  /**
   * Ages a single card according to the stage-based aging rules:
   * - Cards in 'options' and 'done' stages do not age
   * - Cards in all other stages age by 1
   *
   * @param card The card to age
   * @returns A new card instance with updated age
   */
  static ageCard(card: Card): Card {
    const shouldAge = card.stage !== 'options' && card.stage !== 'done';

    return {
      ...card,
      age: shouldAge ? card.age + 1 : card.age,
    };
  }

  /**
   * Ages an array of cards, applying the aging rules to each card.
   *
   * @param cards The array of cards to age
   * @returns A new array with new card instances with updated ages
   */
  static ageCards(cards: Card[]): Card[] {
    return cards.map(card => CardAgingService.ageCard(card));
  }
}