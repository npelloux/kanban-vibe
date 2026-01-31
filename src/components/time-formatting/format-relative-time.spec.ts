import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from './format-relative-time';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('with Date input', () => {
    it('returns "just now" for times less than 60 seconds ago', () => {
      const date = new Date('2026-01-31T11:59:30Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('returns "just now" for future times', () => {
      const date = new Date('2026-01-31T12:01:00Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('returns minutes for times between 1-59 minutes ago', () => {
      const date = new Date('2026-01-31T11:58:00Z');
      expect(formatRelativeTime(date)).toBe('2 min ago');
    });

    it('returns "1 hour ago" for times exactly 1 hour ago', () => {
      const date = new Date('2026-01-31T11:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 hour ago');
    });

    it('returns hours for times between 2-23 hours ago', () => {
      const date = new Date('2026-01-31T09:00:00Z');
      expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    it('returns "1 day ago" for times exactly 1 day ago', () => {
      const date = new Date('2026-01-30T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 day ago');
    });

    it('returns days for times more than 1 day ago', () => {
      const date = new Date('2026-01-28T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('3 days ago');
    });
  });

  describe('with timestamp input', () => {
    it('returns "just now" for timestamps less than 60 seconds ago', () => {
      const timestamp = new Date('2026-01-31T11:59:30Z').getTime();
      expect(formatRelativeTime(timestamp)).toBe('just now');
    });

    it('returns minutes for timestamps between 1-59 minutes ago', () => {
      const timestamp = new Date('2026-01-31T11:55:00Z').getTime();
      expect(formatRelativeTime(timestamp)).toBe('5 min ago');
    });

    it('returns "1 hour ago" for timestamps exactly 1 hour ago', () => {
      const timestamp = new Date('2026-01-31T11:00:00Z').getTime();
      expect(formatRelativeTime(timestamp)).toBe('1 hour ago');
    });

    it('returns "1 day ago" for timestamps exactly 1 day ago', () => {
      const timestamp = new Date('2026-01-30T12:00:00Z').getTime();
      expect(formatRelativeTime(timestamp)).toBe('1 day ago');
    });
  });
});
