export type StageType =
  | 'options'
  | 'red-active'
  | 'red-finished'
  | 'blue-active'
  | 'blue-finished'
  | 'green'
  | 'done';

export interface Stage {
  readonly type: StageType;
}

export const ALL_STAGES = Object.freeze([
  { type: 'options' },
  { type: 'red-active' },
  { type: 'red-finished' },
  { type: 'blue-active' },
  { type: 'blue-finished' },
  { type: 'green' },
  { type: 'done' },
] as const satisfies readonly Stage[]);

export const Stage = {
  options(): Stage {
    return { type: 'options' };
  },

  redActive(): Stage {
    return { type: 'red-active' };
  },

  redFinished(): Stage {
    return { type: 'red-finished' };
  },

  blueActive(): Stage {
    return { type: 'blue-active' };
  },

  blueFinished(): Stage {
    return { type: 'blue-finished' };
  },

  green(): Stage {
    return { type: 'green' };
  },

  done(): Stage {
    return { type: 'done' };
  },
} as const;

const STAGE_MAP = new Map<string, Stage>(
  ALL_STAGES.map((stage) => [stage.type, stage])
);

export function parseStage(value: string): Stage | null {
  if (typeof value !== 'string') {
    return null;
  }
  return STAGE_MAP.get(value) ?? null;
}

export function isActiveStage(stage: Stage): boolean {
  return (
    stage.type === 'red-active' ||
    stage.type === 'blue-active' ||
    stage.type === 'green'
  );
}

export function isFinishedStage(stage: Stage): boolean {
  return (
    stage.type === 'red-finished' ||
    stage.type === 'blue-finished' ||
    stage.type === 'done'
  );
}

export function stageToString(stage: Stage): string {
  return stage.type;
}
