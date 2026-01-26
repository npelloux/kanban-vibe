import { describe, it, expect } from 'vitest';
import { WipLimits, ALL_COLUMN_KEYS, type ColumnKey } from './wip-limits';

describe('WipLimits', () => {
  describe('create()', () => {
    it('creates valid WIP limits from valid input', () => {
      const input = {
        options: { min: 0, max: 0 },
        redActive: { min: 1, max: 5 },
        redFinished: { min: 0, max: 3 },
        blueActive: { min: 2, max: 4 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 2 },
        done: { min: 0, max: 0 },
      };

      const result = WipLimits.create(input);

      expect(result).toEqual(input);
    });

    it('throws for missing columns', () => {
      const input = {
        options: { min: 0, max: 0 },
        redActive: { min: 1, max: 5 },
      };

      expect(() => WipLimits.create(input)).toThrow('Invalid WIP limits');
    });

    it('throws for negative min', () => {
      const input = {
        options: { min: -1, max: 0 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      expect(() => WipLimits.create(input)).toThrow('Invalid WIP limits');
    });

    it('throws for negative max', () => {
      const input = {
        options: { min: 0, max: -1 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      expect(() => WipLimits.create(input)).toThrow('Invalid WIP limits');
    });

    it('throws for non-integer min', () => {
      const input = {
        options: { min: 1.5, max: 0 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      expect(() => WipLimits.create(input)).toThrow('Invalid WIP limits');
    });

    it('throws for non-integer max', () => {
      const input = {
        options: { min: 0, max: 2.5 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      expect(() => WipLimits.create(input)).toThrow('Invalid WIP limits');
    });

    it('throws when min > max (and max is not 0)', () => {
      const input = {
        options: { min: 5, max: 3 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      expect(() => WipLimits.create(input)).toThrow('Invalid WIP limits');
    });

    it('allows min > 0 when max is 0 (no max constraint)', () => {
      const input = {
        options: { min: 5, max: 0 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      const result = WipLimits.create(input);

      expect(result.options).toEqual({ min: 5, max: 0 });
    });

    it('allows min equal to max', () => {
      const input = {
        options: { min: 3, max: 3 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      const result = WipLimits.create(input);

      expect(result.options).toEqual({ min: 3, max: 3 });
    });
  });

  describe('parse()', () => {
    it('returns WipLimits for valid input', () => {
      const input = WipLimits.empty();

      const result = WipLimits.parse(input);

      expect(result).toEqual(input);
    });

    it('returns null for invalid input', () => {
      const input = { invalid: 'data' };

      const result = WipLimits.parse(input);

      expect(result).toBeNull();
    });

    it('returns null for min > max constraint violation', () => {
      const input = {
        options: { min: 5, max: 3 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      const result = WipLimits.parse(input);

      expect(result).toBeNull();
    });
  });

  describe('isValid()', () => {
    it('returns true for valid WipLimits', () => {
      const input = WipLimits.empty();

      expect(WipLimits.isValid(input)).toBe(true);
    });

    it('returns false for invalid input', () => {
      expect(WipLimits.isValid(null)).toBe(false);
      expect(WipLimits.isValid(undefined)).toBe(false);
      expect(WipLimits.isValid({})).toBe(false);
      expect(WipLimits.isValid('string')).toBe(false);
      expect(WipLimits.isValid(123)).toBe(false);
    });

    it('returns false when min > max', () => {
      const input = {
        options: { min: 5, max: 3 },
        redActive: { min: 0, max: 0 },
        redFinished: { min: 0, max: 0 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 0 },
        done: { min: 0, max: 0 },
      };

      expect(WipLimits.isValid(input)).toBe(false);
    });
  });

  describe('empty()', () => {
    it('creates WipLimits with all zeros', () => {
      const result = WipLimits.empty();

      for (const column of ALL_COLUMN_KEYS) {
        expect(result[column]).toEqual({ min: 0, max: 0 });
      }
    });

    it('returns valid WipLimits', () => {
      const result = WipLimits.empty();

      expect(WipLimits.isValid(result)).toBe(true);
    });
  });

  describe('withColumnLimit()', () => {
    it('updates a single column limit', () => {
      const initial = WipLimits.empty();

      const result = WipLimits.withColumnLimit(initial, 'redActive', {
        min: 1,
        max: 5,
      });

      expect(result.redActive).toEqual({ min: 1, max: 5 });
      expect(result.options).toEqual({ min: 0, max: 0 });
    });

    it('does not mutate the original', () => {
      const initial = WipLimits.empty();

      WipLimits.withColumnLimit(initial, 'redActive', { min: 1, max: 5 });

      expect(initial.redActive).toEqual({ min: 0, max: 0 });
    });

    it('throws for invalid column limit', () => {
      const initial = WipLimits.empty();

      expect(() =>
        WipLimits.withColumnLimit(initial, 'redActive', { min: 5, max: 3 })
      ).toThrow('Invalid column limit');
    });

    it.each(ALL_COLUMN_KEYS)('can update %s column', (column: ColumnKey) => {
      const initial = WipLimits.empty();

      const result = WipLimits.withColumnLimit(initial, column, {
        min: 2,
        max: 4,
      });

      expect(result[column]).toEqual({ min: 2, max: 4 });
    });
  });

  describe('getColumnLimit()', () => {
    it('returns the limit for a column', () => {
      const limits = WipLimits.create({
        options: { min: 1, max: 10 },
        redActive: { min: 2, max: 5 },
        redFinished: { min: 0, max: 3 },
        blueActive: { min: 0, max: 0 },
        blueFinished: { min: 0, max: 0 },
        green: { min: 0, max: 2 },
        done: { min: 0, max: 0 },
      });

      expect(WipLimits.getColumnLimit(limits, 'options')).toEqual({
        min: 1,
        max: 10,
      });
      expect(WipLimits.getColumnLimit(limits, 'redActive')).toEqual({
        min: 2,
        max: 5,
      });
      expect(WipLimits.getColumnLimit(limits, 'green')).toEqual({
        min: 0,
        max: 2,
      });
    });
  });

  describe('ALL_COLUMN_KEYS', () => {
    it('contains all 7 column keys', () => {
      expect(ALL_COLUMN_KEYS).toHaveLength(7);
    });

    it('contains expected keys', () => {
      expect(ALL_COLUMN_KEYS).toContain('options');
      expect(ALL_COLUMN_KEYS).toContain('redActive');
      expect(ALL_COLUMN_KEYS).toContain('redFinished');
      expect(ALL_COLUMN_KEYS).toContain('blueActive');
      expect(ALL_COLUMN_KEYS).toContain('blueFinished');
      expect(ALL_COLUMN_KEYS).toContain('green');
      expect(ALL_COLUMN_KEYS).toContain('done');
    });

    it('is frozen (immutable)', () => {
      expect(Object.isFrozen(ALL_COLUMN_KEYS)).toBe(true);
    });
  });

  describe('Zod schema', () => {
    it('exports the schema for external use', () => {
      expect(WipLimits.schema).toBeDefined();
      expect(typeof WipLimits.schema.parse).toBe('function');
    });
  });
});
