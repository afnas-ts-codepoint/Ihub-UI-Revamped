export type ScoreBand = 'bad' | 'neutral' | 'ok';

export function scoreBand(score: number): ScoreBand {
  if (score >= 4) return 'ok';
  if (score >= 3) return 'neutral';
  return 'bad';
}
