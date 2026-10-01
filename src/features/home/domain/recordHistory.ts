export type RecordHistoryKind = 'incident' | 'request' | 'task';
export type RecordHistoryTone = 'created' | 'update' | 'warn';

export type RecordHistoryEntry = Readonly<{
  by: string;
  text: string;
  tone: RecordHistoryTone;
  when: string;
}>;

type Template = readonly (readonly [string, RecordHistoryTone])[];

const PEOPLE = ['M. Faris', 'L. Haddad', 'K. Ibrahim', 'R. Salem', 'O. Najjar'] as const;

const WHENS = [
  '4 days ago',
  '3 days ago',
  '2 days ago',
  'yesterday',
  '6 hours ago',
  '2 hours ago',
  '48 min ago',
] as const;

/**
 * The prototype never wraps these strings in `T()`: the history text, people
 * and relative times are English in both locales, so they stay data here.
 * (The `enquiry` and `sheet` templates are not reachable from the drawer and
 * are not ported.)
 */
const TEMPLATES: Readonly<Record<RecordHistoryKind, Template>> = {
  incident: [
    ['Reported', 'created'],
    ['Acknowledged by duty manager', 'update'],
    ['Severity confirmed', 'update'],
    ['Assigned for follow-up', 'update'],
  ],
  request: [
    ['Request submitted', 'created'],
    ['Budget line checked', 'update'],
    ['Sent to committee', 'warn'],
  ],
  task: [
    ['Task created', 'created'],
    ['Owner assigned', 'update'],
    ['Stage moved to Ongoing', 'update'],
    ['Progress note added', 'update'],
  ],
};

const at = <Item>(list: readonly Item[], index: number): Item => {
  const item = list[index];
  if (item === undefined) throw new Error(`Index ${String(index)} is out of range`);
  return item;
};

/**
 * Synthetic, deterministic record history, oldest first (the drawer reverses
 * it). The seed is the sum of the id's char codes; each entry's author is
 * `PEOPLE[(seed + i) % 5]` and its time is the last N of the seven fixed times.
 * @prototype ihub/index.html:L1243-L1256 `HUD_HISTORY`
 */
export function recordHistory(id: string, kind: RecordHistoryKind): readonly RecordHistoryEntry[] {
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const template = TEMPLATES[kind];
  return template.map(([text, tone], index) => ({
    by: at(PEOPLE, (seed + index) % PEOPLE.length),
    text,
    tone,
    when: WHENS[WHENS.length - template.length + index] ?? at(WHENS, index),
  }));
}
