import { describe, it, expect } from 'vitest';
import {
  Stage as StageFactory,
  parseStage,
  isActiveStage,
  isFinishedStage,
  stageToString,
  ALL_STAGES,
} from './stage';

describe('Stage', () => {
  describe('factory functions', () => {
    it('should create options stage', () => {
      const stage = StageFactory.options();
      expect(stage.type).toBe('options');
    });

    it('should create red-active stage', () => {
      const stage = StageFactory.redActive();
      expect(stage.type).toBe('red-active');
    });

    it('should create red-finished stage', () => {
      const stage = StageFactory.redFinished();
      expect(stage.type).toBe('red-finished');
    });

    it('should create blue-active stage', () => {
      const stage = StageFactory.blueActive();
      expect(stage.type).toBe('blue-active');
    });

    it('should create blue-finished stage', () => {
      const stage = StageFactory.blueFinished();
      expect(stage.type).toBe('blue-finished');
    });

    it('should create green stage', () => {
      const stage = StageFactory.green();
      expect(stage.type).toBe('green');
    });

    it('should create done stage', () => {
      const stage = StageFactory.done();
      expect(stage.type).toBe('done');
    });
  });

  describe('ALL_STAGES', () => {
    it('should contain all 7 stage types', () => {
      expect(ALL_STAGES).toHaveLength(7);
    });

    it('should contain all expected stage types', () => {
      const types = ALL_STAGES.map((s) => s.type);
      expect(types).toEqual([
        'options',
        'red-active',
        'red-finished',
        'blue-active',
        'blue-finished',
        'green',
        'done',
      ]);
    });

    it('should be frozen for runtime immutability', () => {
      expect(Object.isFrozen(ALL_STAGES)).toBe(true);
    });
  });

  describe('parseStage', () => {
    it('should parse options', () => {
      const stage = parseStage('options');
      expect(stage?.type).toBe('options');
    });

    it('should parse red-active', () => {
      const stage = parseStage('red-active');
      expect(stage?.type).toBe('red-active');
    });

    it('should parse red-finished', () => {
      const stage = parseStage('red-finished');
      expect(stage?.type).toBe('red-finished');
    });

    it('should parse blue-active', () => {
      const stage = parseStage('blue-active');
      expect(stage?.type).toBe('blue-active');
    });

    it('should parse blue-finished', () => {
      const stage = parseStage('blue-finished');
      expect(stage?.type).toBe('blue-finished');
    });

    it('should parse green', () => {
      const stage = parseStage('green');
      expect(stage?.type).toBe('green');
    });

    it('should parse done', () => {
      const stage = parseStage('done');
      expect(stage?.type).toBe('done');
    });

    it('should return null for invalid string', () => {
      const stage = parseStage('INVALID');
      expect(stage).toBeNull();
    });

    it('should return null for empty string', () => {
      const stage = parseStage('');
      expect(stage).toBeNull();
    });

    it('should return null for undefined', () => {
      const stage = parseStage(undefined as unknown as string);
      expect(stage).toBeNull();
    });

    it('should return null for null', () => {
      const stage = parseStage(null as unknown as string);
      expect(stage).toBeNull();
    });
  });

  describe('isActiveStage', () => {
    it('should return true for red-active', () => {
      expect(isActiveStage(StageFactory.redActive())).toBe(true);
    });

    it('should return true for blue-active', () => {
      expect(isActiveStage(StageFactory.blueActive())).toBe(true);
    });

    it('should return true for green', () => {
      expect(isActiveStage(StageFactory.green())).toBe(true);
    });

    it('should return false for options', () => {
      expect(isActiveStage(StageFactory.options())).toBe(false);
    });

    it('should return false for red-finished', () => {
      expect(isActiveStage(StageFactory.redFinished())).toBe(false);
    });

    it('should return false for blue-finished', () => {
      expect(isActiveStage(StageFactory.blueFinished())).toBe(false);
    });

    it('should return false for done', () => {
      expect(isActiveStage(StageFactory.done())).toBe(false);
    });
  });

  describe('isFinishedStage', () => {
    it('should return true for red-finished', () => {
      expect(isFinishedStage(StageFactory.redFinished())).toBe(true);
    });

    it('should return true for blue-finished', () => {
      expect(isFinishedStage(StageFactory.blueFinished())).toBe(true);
    });

    it('should return true for done', () => {
      expect(isFinishedStage(StageFactory.done())).toBe(true);
    });

    it('should return false for options', () => {
      expect(isFinishedStage(StageFactory.options())).toBe(false);
    });

    it('should return false for red-active', () => {
      expect(isFinishedStage(StageFactory.redActive())).toBe(false);
    });

    it('should return false for blue-active', () => {
      expect(isFinishedStage(StageFactory.blueActive())).toBe(false);
    });

    it('should return false for green', () => {
      expect(isFinishedStage(StageFactory.green())).toBe(false);
    });
  });

  describe('stageToString', () => {
    it('should convert options to string', () => {
      expect(stageToString(StageFactory.options())).toBe('options');
    });

    it('should convert red-active to string', () => {
      expect(stageToString(StageFactory.redActive())).toBe('red-active');
    });

    it('should convert red-finished to string', () => {
      expect(stageToString(StageFactory.redFinished())).toBe('red-finished');
    });

    it('should convert blue-active to string', () => {
      expect(stageToString(StageFactory.blueActive())).toBe('blue-active');
    });

    it('should convert blue-finished to string', () => {
      expect(stageToString(StageFactory.blueFinished())).toBe('blue-finished');
    });

    it('should convert green to string', () => {
      expect(stageToString(StageFactory.green())).toBe('green');
    });

    it('should convert done to string', () => {
      expect(stageToString(StageFactory.done())).toBe('done');
    });
  });
});
