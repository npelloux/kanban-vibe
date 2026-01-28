import { type ColumnKey, type ColumnLimit, WipLimits } from './wip-limits';

export class WipLimitEnforcer {
  static canMoveIn(limit: ColumnLimit, currentCount: number): boolean {
    if (limit.max === 0) {
      return true;
    }
    return currentCount < limit.max;
  }

  static canMoveInToColumn(
    limits: WipLimits,
    column: ColumnKey,
    currentCount: number
  ): boolean {
    const columnLimit = WipLimits.getColumnLimit(limits, column);
    return WipLimitEnforcer.canMoveIn(columnLimit, currentCount);
  }
}
