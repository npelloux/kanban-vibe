import { z } from 'zod';

const ColumnLimitSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((data) => data.max === 0 || data.min <= data.max, {
    message: 'min must be less than or equal to max (when max is not 0)',
  });

export type ColumnLimit = z.infer<typeof ColumnLimitSchema>;

const WipLimitsSchema = z.object({
  options: ColumnLimitSchema,
  redActive: ColumnLimitSchema,
  redFinished: ColumnLimitSchema,
  blueActive: ColumnLimitSchema,
  blueFinished: ColumnLimitSchema,
  green: ColumnLimitSchema,
  done: ColumnLimitSchema,
});

export type WipLimits = z.infer<typeof WipLimitsSchema>;

export type ColumnKey = keyof WipLimits;

export const ALL_COLUMN_KEYS: readonly ColumnKey[] = Object.freeze([
  'options',
  'redActive',
  'redFinished',
  'blueActive',
  'blueFinished',
  'green',
  'done',
] as const);

export const WipLimits = {
  schema: WipLimitsSchema,

  create(limits: unknown): WipLimits {
    const result = WipLimitsSchema.safeParse(limits);
    if (!result.success) {
      throw new Error(`Invalid WIP limits: ${result.error.message}`);
    }
    return result.data;
  },

  parse(limits: unknown): WipLimits | null {
    const result = WipLimitsSchema.safeParse(limits);
    return result.success ? result.data : null;
  },

  isValid(limits: unknown): limits is WipLimits {
    return WipLimitsSchema.safeParse(limits).success;
  },

  empty(): WipLimits {
    return {
      options: { min: 0, max: 0 },
      redActive: { min: 0, max: 0 },
      redFinished: { min: 0, max: 0 },
      blueActive: { min: 0, max: 0 },
      blueFinished: { min: 0, max: 0 },
      green: { min: 0, max: 0 },
      done: { min: 0, max: 0 },
    };
  },

  withColumnLimit(
    limits: WipLimits,
    column: ColumnKey,
    columnLimit: ColumnLimit
  ): WipLimits {
    const result = ColumnLimitSchema.safeParse(columnLimit);
    if (!result.success) {
      throw new Error(`Invalid column limit: ${result.error.message}`);
    }
    return { ...limits, [column]: result.data };
  },

  getColumnLimit(limits: WipLimits, column: ColumnKey): ColumnLimit {
    return limits[column];
  },
} as const;
