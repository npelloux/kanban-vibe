/**
 * CardId is a branded string type representing a unique card identifier.
 * Valid CardIds consist of uppercase letters only (A-Z, AA-ZZ, AAA-ZZZ, etc.)
 */
export type CardId = string & { readonly __brand: 'CardId' };

const VALID_CARD_ID_PATTERN = /^[A-Z]+$/;

/**
 * CardId factory and utility functions
 */
export const CardId = {
  /**
   * Creates a CardId from a string value.
   * Returns null if the value is not a valid CardId format.
   */
  create(value: string): CardId | null {
    if (!CardId.isValid(value)) {
      return null;
    }
    return value as CardId;
  },

  /**
   * Checks if a string value is a valid CardId format.
   * Valid formats: A-Z, AA-ZZ, AAA-ZZZ, etc.
   */
  isValid(value: string): boolean {
    if (!value || value.length === 0) {
      return false;
    }
    return VALID_CARD_ID_PATTERN.test(value);
  },

  /**
   * Generates the next CardId in the sequence.
   * A -> B, Z -> AA, AZ -> BA, ZZ -> AAA
   */
  next(current: CardId): CardId {
    const chars = current.split('');
    let carry = true;

    // Process from right to left
    for (let i = chars.length - 1; i >= 0 && carry; i--) {
      const charCode = chars[i].charCodeAt(0);

      if (charCode < 90) {
        // Not Z, just increment
        chars[i] = String.fromCharCode(charCode + 1);
        carry = false;
      } else {
        // Is Z, wrap to A and carry
        chars[i] = 'A';
      }
    }

    // If we still have a carry, prepend 'A'
    if (carry) {
      chars.unshift('A');
    }

    return chars.join('') as CardId;
  },
} as const;
