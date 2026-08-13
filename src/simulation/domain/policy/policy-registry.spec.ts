import { describe, it, expect } from 'vitest';
import { PolicyRegistry } from './policy-registry';
import { UnknownPolicyError } from './unknown-policy-error';

describe('PolicyRegistry', () => {
  describe('looking up a policy', () => {
    it('returns the siloted-expert policy', () => {
      const policy = PolicyRegistry.get('siloted-expert');

      expect(policy.id).toBe('siloted-expert');
    });

    it('exposes a name and a description for the UI', () => {
      const policy = PolicyRegistry.get('siloted-expert');

      expect(policy.name).toBe('Siloted Expert');
      expect(policy.description).not.toBe('');
    });

    it('rejects an unknown policy id instead of falling back silently', () => {
      expect(() => PolicyRegistry.get('does-not-exist')).toThrow(UnknownPolicyError);
    });

    it('names the offending policy id on the error', () => {
      try {
        PolicyRegistry.get('does-not-exist');
        expect.unreachable('PolicyRegistry.get should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnknownPolicyError);
        expect((error as UnknownPolicyError).policyId).toBe('does-not-exist');
      }
    });

    it('rejects an empty policy id', () => {
      expect(() => PolicyRegistry.get('')).toThrow(UnknownPolicyError);
    });
  });

  describe('listing policies', () => {
    it('includes the siloted-expert policy', () => {
      const ids = PolicyRegistry.list().map((policy) => policy.id);

      expect(ids).toContain('siloted-expert');
    });

    it('reports every registered policy id as known', () => {
      const ids = PolicyRegistry.list().map((policy) => policy.id);

      expect(ids.every((id) => PolicyRegistry.isKnown(id))).toBe(true);
    });
  });

  describe('checking whether a policy id is known', () => {
    it('accepts a registered id', () => {
      expect(PolicyRegistry.isKnown('siloted-expert')).toBe(true);
    });

    it('rejects an unregistered id', () => {
      expect(PolicyRegistry.isKnown('does-not-exist')).toBe(false);
    });
  });
});
