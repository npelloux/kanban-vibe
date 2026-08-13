export class UnknownPolicyError extends Error {
  readonly code = 'UNKNOWN_POLICY' as const;
  readonly policyId: string;

  constructor(policyId: string) {
    super(`Unknown policy '${policyId}'`);
    this.name = 'UnknownPolicyError';
    this.policyId = policyId;
  }
}
