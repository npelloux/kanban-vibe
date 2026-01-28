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

  describe('canMoveOut', () => {
    describe('zero min WIP means no constraint', () => {
      it('allows move out when min WIP is 0, regardless of current count', () => {
        const limit = { min: 0, max: 0 };

        expect(WipLimitEnforcer.canMoveOut(limit, 0)).toBe(true);
        expect(WipLimitEnforcer.canMoveOut(limit, 1)).toBe(true);
        expect(WipLimitEnforcer.canMoveOut(limit, 5)).toBe(true);
        expect(WipLimitEnforcer.canMoveOut(limit, 100)).toBe(true);
      });
    });

    describe('boundary conditions for min WIP', () => {
      it('allows move out when current count > min WIP', () => {
        const limit = { min: 2, max: 0 };

        expect(WipLimitEnforcer.canMoveOut(limit, 3)).toBe(true);
        expect(WipLimitEnforcer.canMoveOut(limit, 5)).toBe(true);
        expect(WipLimitEnforcer.canMoveOut(limit, 10)).toBe(true);
      });

      it('blocks move out when current count <= min WIP', () => {
        const limit = { min: 2, max: 0 };

        expect(WipLimitEnforcer.canMoveOut(limit, 2)).toBe(false);
        expect(WipLimitEnforcer.canMoveOut(limit, 1)).toBe(false);
        expect(WipLimitEnforcer.canMoveOut(limit, 0)).toBe(false);
      });
    });

    describe('min WIP of 1 (strictest non-zero limit)', () => {
      it('allows move out only when column has more than 1 card', () => {
        const limit = { min: 1, max: 0 };

        expect(WipLimitEnforcer.canMoveOut(limit, 0)).toBe(false);
        expect(WipLimitEnforcer.canMoveOut(limit, 1)).toBe(false);
        expect(WipLimitEnforcer.canMoveOut(limit, 2)).toBe(true);
        expect(WipLimitEnforcer.canMoveOut(limit, 3)).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('column has 0 cards, min WIP is 1 → cannot move out', () => {
        const limit = { min: 1, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 0)).toBe(false);
      });

      it('column has 1 card, min WIP is 1 → cannot move out', () => {
        const limit = { min: 1, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 1)).toBe(false);
      });

      it('column has 2 cards, min WIP is 1 → can move out', () => {
        const limit = { min: 1, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 2)).toBe(true);
      });

      it('column has 5 cards, min WIP is 0 → can move out (no constraint)', () => {
        const limit = { min: 0, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 5)).toBe(true);
      });

      it('column has 0 cards, min WIP is 0 → can move out (no constraint)', () => {
        const limit = { min: 0, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 0)).toBe(true);
      });

      it('column has 3 cards, min WIP is 3 → cannot move out', () => {
        const limit = { min: 3, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 3)).toBe(false);
      });

      it('column has 4 cards, min WIP is 3 → can move out', () => {
        const limit = { min: 3, max: 0 };
        expect(WipLimitEnforcer.canMoveOut(limit, 4)).toBe(true);
      });
    });
  });

  describe('canMoveOutFromColumn', () => {
    const emptyLimits = WipLimits.empty();

    it('uses the column limit from WipLimits', () => {
      const limits = WipLimits.withColumnLimit(emptyLimits, 'redActive', {
        min: 2,
        max: 0,
      });

      expect(WipLimitEnforcer.canMoveOutFromColumn(limits, 'redActive', 3)).toBe(
        true
      );
      expect(WipLimitEnforcer.canMoveOutFromColumn(limits, 'redActive', 2)).toBe(
        false
      );
      expect(WipLimitEnforcer.canMoveOutFromColumn(limits, 'redActive', 1)).toBe(
        false
      );
    });

    it('respects different limits for different columns', () => {
      let limits = WipLimits.withColumnLimit(emptyLimits, 'redActive', {
        min: 2,
        max: 0,
      });
      limits = WipLimits.withColumnLimit(limits, 'blueActive', {
        min: 1,
        max: 0,
      });

      expect(WipLimitEnforcer.canMoveOutFromColumn(limits, 'redActive', 2)).toBe(
        false
      );
      expect(WipLimitEnforcer.canMoveOutFromColumn(limits, 'blueActive', 2)).toBe(
        true
      );
      expect(WipLimitEnforcer.canMoveOutFromColumn(limits, 'blueActive', 1)).toBe(
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
          min: 1,
          max: 0,
        });

        expect(WipLimitEnforcer.canMoveOutFromColumn(limits, key, 1)).toBe(
          false
        );
        expect(WipLimitEnforcer.canMoveOutFromColumn(limits, key, 2)).toBe(true);
      }
    });
  });
});