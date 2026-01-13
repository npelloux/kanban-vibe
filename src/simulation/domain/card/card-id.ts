export type CardId = string & { readonly __brand: 'CardId' };

const VALID_CARD_ID_PATTERN = /^[A-Z]+$/;
const CHAR_CODE_Z = 90;

export const CardId = {
  create(value: string): CardId | null {
    if (!CardId.isValid(value)) {
      return null;
    }
    return value as CardId;
  },

  isValid(value: string): boolean {
    return VALID_CARD_ID_PATTERN.test(value);
  },

  next(current: CardId): CardId {
    const chars = current.split('');
    let carry = true;

    for (let i = chars.length - 1; i >= 0 && carry; i--) {
      const charCode = chars[i].charCodeAt(0);

      if (charCode < CHAR_CODE_Z) {
        chars[i] = String.fromCharCode(charCode + 1);
        carry = false;
      } else {
        chars[i] = 'A';
      }
    }

    if (carry) {
      chars.unshift('A');
    }

    return chars.join('') as CardId;
  },
} as const;
