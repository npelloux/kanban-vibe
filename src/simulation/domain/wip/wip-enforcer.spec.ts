import { describe, it, expect } from 'vitest';
import { WipLimitEnforcer } from './wip-enforcer';
import { WipLimits, type ColumnKey } from './wip-limits';

describe('WipLimitEnforcer', () => {
  describe('canMoveIn', () => {
    describe('zero max WIP means no constraint', () => {
      it('allows move when max WIP is 0, regardless of current count', () => {
        const limit = { min: 0, max: 0 };

        expect(WipLimitEnforcer.canMoveIn(limit, 0)).toBe(true);
        expect(WipLimitEnforcer.canMoveIn(limit, 5)).toBe(true);
        expect(WipLimitEnforcer.canMoveIn(limit, 100)).toBe(true);
      });
    });

    describe('boundary conditions for max WIP', () => {
      it('allows move when current count < max WIP', () => {
        const limit = { min: 0, max: 3 };

        expect(WipLimitEnforcer.canMoveIn(limit, 0)).toBe(true);
        expect(WipLimitEnforcer.canMoveIn(limit, 1)).toBe(true);
        expect(WipLimitEnforcer.canMoveIn(limit, 2)).toBe(true);
      });

      it('blocks move when current count >= max WIP', () => {
        const limit = { min: 0, max: 3 };

        expect(WipLimitEnforcer.canMoveIn(limit, 3)).toBe(false);
        expect(WipLimitEnforcer.canMoveIn(limit, 4)).toBe(false);
        expect(WipLimitEnforcer.canMoveIn(limit, 10)).toBe(false);
      });
    });

    describe('max WIP of 1 (strictest non-zero limit)', () => {
      it('allows move only when column is empty', () => {
        const limit = { min: 0, max: 1 };

        expect(WipLimitEnforcer.canMoveIn(limit, 0)).toBe(true);
        expect(WipLimitEnforcer.canMoveIn(limit, 1)).toBe(false);
        expect(WipLimitEnforcer.canMoveIn(limit, 2)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('column has 0 cards, max WIP is 1 → can move in', () => {
        const limit = { min: 0, max: 1 };
        expect(WipLimitEnforcer.canMoveIn(limit, 0)).toBe(true);
      });

      it('column has 1 card, max WIP is 1 → cannot move in', () => {
        const limit = { min: 0, max: 1 };
        expect(WipLimitEnforcer.canMoveIn(limit, 1)).toBe(false);
      });

      it('column has 2 cards, max WIP is 1 → cannot move in', () => {
        const limit = { min: 0, max: 1 };
        expect(WipLimitEnforcer.canMoveIn(limit, 2)).toBe(false);
      });

      it('column has 5 cards, max WIP is 0 → can move in (no constraint)', () => {
        const limit = { min: 0, max: 0 };
        expect(WipLimitEnforcer.canMoveIn(limit, 5)).toBe(true);
      });

      it('column has 0 cards, max WIP is 0 → can move in (no constraint)', () => {
        const limit = { min: 0, max: 0 };
        expect(WipLimitEnforcer.canMoveIn(limit, 0)).toBe(true);
      });
    });
  });

  describe('canMoveInToColumn', () => {
    const emptyLimits = WipLimits.empty();

    it('uses the column limit from WipLimits', () => {
      const limits = WipLimits.withColumnLimit(emptyLimits, 'redActive', {
        min: 0,
        max: 2,
      });

      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'redActive', 0)).toBe(
        true
      );
      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'redActive', 1)).toBe(
        true
      );
      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'redActive', 2)).toBe(
        false
      );
      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'redActive', 3)).toBe(
        false
      );
    });

    it('respects different limits for different columns', () => {
      let limits = WipLimits.withColumnLimit(emptyLimits, 'redActive', {
        min: 0,
        max: 2,
      });
      limits = WipLimits.withColumnLimit(limits, 'blueActive', {
        min: 0,
        max: 5,
      });

      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'redActive', 2)).toBe(
        false
      );
      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'blueActive', 2)).toBe(
        true
      );
      expect(WipLimitEnforcer.canMoveInToColumn(limits, 'blueActive', 5)).toBe(
        false
      );
    });

    it('works with all column keys', () => {
      const columnKeys: ColumnKey[] = [
        'options',
        'redActive',
        'redFinished',
        'blueActive',
        'blueFinished',
        'green',
        'done',
      ];

      for (const key of columnKeys) {
        const limits = WipLimits.withColumnLimit(emptyLimits, key, {
          min: 0,
          max: 1,
        });

        expect(WipLimitEnforcer.canMoveInToColumn(limits, key, 0)).toBe(true);
        expect(WipLimitEnforcer.canMoveInToColumn(limits, key, 1)).toBe(false);
      }
    });
  });
});