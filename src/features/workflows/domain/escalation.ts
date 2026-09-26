export type EscalationTarget = Readonly<{
  kind: 'department-head' | 'next-owner';
  stepNumber?: number;
}>;

/** @prototype index.html:L21514 */
export function escalationTarget(
  stepIndex: number,
  stepCount: number,
): EscalationTarget {
  return stepIndex < stepCount - 1
    ? { kind: 'next-owner', stepNumber: stepIndex + 2 }
    : { kind: 'department-head' };
}
