export type WorkloadGanttItem = Readonly<{
  id: string;
  span: number;
  start: number;
  status: 'Done' | 'In progress' | 'Open' | 'Review';
  title: string;
  tone: 'bad' | 'info' | 'ok' | 'warn';
}>;

const titles = [
  'HVAC compressor overhaul', 'Escalator quarterly service',
  'Fire panel diagnostics', 'POS terminal replacement', 'CCTV recalibration',
  'Water pump inspection', 'Signage installation', 'Restroom deep clean',
  'Ride sensor calibration', 'Electrical load test', 'Access-control repair',
  'Lighting retrofit',
] as const;
const tones = ['bad', 'warn', 'info', 'ok'] as const;
const statuses = ['Open', 'In progress', 'Review', 'Done'] as const;

export function workloadColor(value: number) {
  if (value <= 10) return '#4FA87E';
  if (value <= 20) return '#D9A441';
  if (value <= 30) return '#E07B39';
  if (value <= 40) return '#D9534F';
  return '#E0538A';
}

/** Exact deterministic generator used by the reachable prototype heatmap rows. */
export function workloadGanttFor(label: string): readonly WorkloadGanttItem[] {
  let seed = 0;
  for (const character of label) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  const random = () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const count = 3 + Math.floor(random() * 3);
  return Array.from({ length: count }, () => {
    const start = Math.floor(random() * 4);
    const span = 1 + Math.floor(random() * (7 - start));
    return {
      id: `JO-${String(1000 + Math.floor(random() * 900))}`,
      span,
      start,
      status: statuses[Math.floor(random() * statuses.length)] ?? 'Open',
      title: titles[Math.floor(random() * titles.length)] ?? titles[0],
      tone: tones[Math.floor(random() * tones.length)] ?? 'info',
    };
  });
}
