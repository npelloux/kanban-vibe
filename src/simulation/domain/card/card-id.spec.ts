import { describe, it, expect } from 'vitest';
import { CardId } from './card-id';
import { createValidCardId } from './card-test-fixtures';

describe('CardId', () => {
  describe('create', () => {
    it('should create a valid CardId from "A"', () => {
      const result = CardId.create('A');
      expect(result).toBe('A');
    });

    it('should create a valid CardId from "Z"', () => {
      const result = CardId.create('Z');
      expect(result).toBe('Z');
    });

    it('should create a valid CardId from "AA"', () => {
      const result = CardId.create('AA');
      expect(result).toBe('AA');
    });

    it('should create a valid CardId from "ZZ"', () => {
      const result = CardId.create('ZZ');
      expect(result).toBe('ZZ');
    });

    it('should create a valid CardId from "AAA"', () => {
      const result = CardId.create('AAA');
      expect(result).toBe('AAA');
    });

    it('should return null for lowercase letters', () => {
      const result = CardId.create('a');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = CardId.create('');
      expect(result).toBeNull();
    });

    it('should return null for numbers', () => {
      const result = CardId.create('1');
      expect(result).toBeNull();
    });

    it('should return null for mixed alphanumeric', () => {
      const result = CardId.create('A1');
      expect(result).toBeNull();
    });

    it('should return null for mixed case', () => {
      const result = CardId.create('Aa');
      expect(result).toBeNull();
    });
  });

  describe('isValid', () => {
    it('should return true for valid single letter', () => {
      expect(CardId.isValid('A')).toBe(true);
      expect(CardId.isValid('Z')).toBe(true);
    });

    it('should return true for valid double letters', () => {
      expect(CardId.isValid('AA')).toBe(true);
      expect(CardId.isValid('ZZ')).toBe(true);
      expect(CardId.isValid('AB')).toBe(true);
    });

    it('should return true for valid triple letters', () => {
      expect(CardId.isValid('AAA')).toBe(true);
      expect(CardId.isValid('ZZZ')).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(CardId.isValid('')).toBe(false);
      expect(CardId.isValid('a')).toBe(false);
      expect(CardId.isValid('1')).toBe(false);
      expect(CardId.isValid('A1')).toBe(false);
    });
  });

  describe('next', () => {
    it('should return "B" for "A"', () => {
      const id = createValidCardId('A');
      expect(CardId.next(id)).toBe('B');
    });

    it('should return "AA" for "Z"', () => {
      const id = createValidCardId('Z');
      expect(CardId.next(id)).toBe('AA');
    });

    it('should return "AB" for "AA"', () => {
      const id = createValidCardId('AA');
      expect(CardId.next(id)).toBe('AB');
    });

    it('should return "BA" for "AZ"', () => {
      const id = createValidCardId('AZ');
      expect(CardId.next(id)).toBe('BA');
    });

    it('should return "AAA" for "ZZ"', () => {
      const id = createValidCardId('ZZ');
      expect(CardId.next(id)).toBe('AAA');
    });

    it('should return "ZZA" for "ZYZ"', () => {
      const id = createValidCardId('ZYZ');
      expect(CardId.next(id)).toBe('ZZA');
    });

    it('should return "AAAA" for "ZZZ"', () => {
      const id = createValidCardId('ZZZ');
      expect(CardId.next(id)).toBe('AAAA');
    });
  });
});
