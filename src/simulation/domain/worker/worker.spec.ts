import { describe, it, expect } from 'vitest';
import {
  type WorkerType,
  ALL_WORKER_TYPES,
  isValidWorkerType,
} from './worker-type';
import { Worker } from './worker';

describe('WorkerType', () => {
  describe('ALL_WORKER_TYPES', () => {
    it('should contain red, blue, and green', () => {
      expect(ALL_WORKER_TYPES).toContain('red');
      expect(ALL_WORKER_TYPES).toContain('blue');
      expect(ALL_WORKER_TYPES).toContain('green');
    });

    it('should have exactly 3 types', () => {
      expect(ALL_WORKER_TYPES).toHaveLength(3);
    });

    it('should be readonly', () => {
      const types: readonly WorkerType[] = ALL_WORKER_TYPES;
      expect(types).toBe(ALL_WORKER_TYPES);
    });
  });

  describe('isValidWorkerType', () => {
    it('should return true for red', () => {
      expect(isValidWorkerType('red')).toBe(true);
    });

    it('should return true for blue', () => {
      expect(isValidWorkerType('blue')).toBe(true);
    });

    it('should return true for green', () => {
      expect(isValidWorkerType('green')).toBe(true);
    });

    it('should return false for invalid string', () => {
      expect(isValidWorkerType('purple')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidWorkerType('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidWorkerType(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidWorkerType(undefined)).toBe(false);
    });

    it('should return false for number', () => {
      expect(isValidWorkerType(123)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isValidWorkerType({ type: 'red' })).toBe(false);
    });
  });
});

describe('Worker', () => {
  describe('create', () => {
    it('should create a red worker', () => {
      const worker = Worker.create('R1', 'red');

      expect(worker.id).toBe('R1');
      expect(worker.type).toBe('red');
    });

    it('should create a blue worker', () => {
      const worker = Worker.create('B2', 'blue');

      expect(worker.id).toBe('B2');
      expect(worker.type).toBe('blue');
    });

    it('should create a green worker', () => {
      const worker = Worker.create('G3', 'green');

      expect(worker.id).toBe('G3');
      expect(worker.type).toBe('green');
    });

    it('should throw for empty id', () => {
      expect(() => Worker.create('', 'red')).toThrow(
        'Worker id cannot be empty'
      );
    });

    it('should throw for invalid worker type', () => {
      expect(() => Worker.create('W1', 'yellow' as WorkerType)).toThrow(
        'Invalid worker type: yellow'
      );
    });
  });

  describe('immutability', () => {
    it('should return a new object on each create call', () => {
      const worker1 = Worker.create('R1', 'red');
      const worker2 = Worker.create('R1', 'red');

      expect(worker1).not.toBe(worker2);
      expect(worker1).toEqual(worker2);
    });
  });
});
