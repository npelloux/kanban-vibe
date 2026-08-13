import type { Policy } from './policy';
import { SilotedExpertPolicy } from './siloted-expert-policy';
import { GeneralistPolicy } from './generalist-policy';
import { UnknownPolicyError } from './unknown-policy-error';

const POLICIES = {
  'siloted-expert': SilotedExpertPolicy,
  generalist: GeneralistPolicy,
} as const satisfies Record<string, Policy>;

export type PolicyType = keyof typeof POLICIES;

function isRegistered(id: string): id is PolicyType {
  return Object.prototype.hasOwnProperty.call(POLICIES, id);
}

export const PolicyRegistry = {
  get(id: string): Policy {
    if (!isRegistered(id)) {
      throw new UnknownPolicyError(id);
    }
    return POLICIES[id];
  },

  isKnown(id: string): id is PolicyType {
    return isRegistered(id);
  },

  list(): readonly Policy[] {
    return Object.values(POLICIES);
  },
};
