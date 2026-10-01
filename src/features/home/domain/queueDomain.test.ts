import { describe, expect, it } from 'vitest';

import { ACTIONS } from '../data/actions.mock';
import { INCIDENTS } from '../data/incidents.mock';
import { JOB_ORDERS } from '../data/jobOrders.mock';
import {
  actionShortTitle,
  escalateAction,
  escalateSeverity,
} from './escalation';
import {
  rankActions,
  rankIncidents,
  rankQueue,
  scoreAction,
  scoreIncident,
} from './prioritization';
import { referenceCode } from './referenceCode';
import { slaDur, slaLabelOf, slaOf, slaTip } from './sla';
import type { SlaLabels } from './sla';

const EN: SlaLabels = {
  days: 'd',
  hours: 'h',
  left: ' left',
  minutes: 'm',
  over: 'Over by ',
  target: 'Target ',
  waiting: 'waiting ',
};
const AR: SlaLabels = {
  days: 'ي',
  hours: 'س',
  left: ' متبقٍ',
  minutes: 'د',
  over: 'متجاوز بـ ',
  target: 'المدة المستهدفة ',
  waiting: 'قيد الانتظار ',
};

const byId = (id: string) => {
  const action = ACTIONS.find((candidate) => candidate.id === id);
  if (!action) throw new Error(`missing ${id}`);
  return action;
};

/** Golden values executed against the prototype source (ihub/index.html L10283-L10338). */
const GOLDEN: readonly (readonly [
  string,
  number,
  number,
  number,
  number,
  string,
  string,
  string,
])[] = [
  ['A1', 213, 24, 29.3, -5.3, 'breached', 'Over by 5.3h', 'متجاوز بـ 5.3س'],
  ['A2', 139, 48, 42.2, 5.8, 'at-risk', '5.8h left', '5.8س متبقٍ'],
  ['A3', 117, 8, 7.8, 0.2, 'at-risk', '12m left', '12د متبقٍ'],
  ['A4', 70, 72, 39.6, 32.4, 'ok', '1d 8h left', '1ي 8س متبقٍ'],
  ['A5', 110, 72, 39.6, 32.4, 'ok', '1d 8h left', '1ي 8س متبقٍ'],
  ['A6', 102, 24, 21.1, 2.9, 'at-risk', '2.9h left', '2.9س متبقٍ'],
  ['A7', 80, 120, 66, 54, 'ok', '2d 6h left', '2ي 6س متبقٍ'],
  ['A8', 15, 48, 10.6, 37.4, 'ok', '1d 13h left', '1ي 13س متبقٍ'],
  ['A9', 55, 8, 2.7, 5.3, 'ok', '5.3h left', '5.3س متبقٍ'],
  ['A10', 79, 72, 39.6, 32.4, 'ok', '1d 8h left', '1ي 8س متبقٍ'],
];

describe('action scoring and SLA — golden parity', () => {
  it.each(GOLDEN)(
    '%s score %i, SLA target %f/elapsed %f/left %f (%s)',
    (id, score, target, elapsed, left, state, labelEn, labelAr) => {
      const action = byId(id);
      expect(scoreAction(action)).toBe(score);
      expect(slaOf(action)).toMatchObject({ elapsed, left, state, target });
      expect(slaLabelOf(action, EN)).toBe(labelEn);
      expect(slaLabelOf(action, AR)).toBe(labelAr);
    },
  );

  it('ranks the queue by score with stable ties', () => {
    expect(
      rankActions(ACTIONS).map(
        (action) => `${action.id}:${String(scoreAction(action))}`,
      ),
    ).toEqual([
      'A1:213',
      'A2:139',
      'A3:117',
      'A5:110',
      'A6:102',
      'A7:80',
      'A10:79',
      'A4:70',
      'A9:55',
      'A8:15',
    ]);
  });

  it('puts pinned items first as a stable partition of the score order', () => {
    const pinned = ACTIONS.map((action) =>
      action.id === 'A8' || action.id === 'A4'
        ? { ...action, pinned: true }
        : action,
    );
    expect(rankQueue(pinned).map((action) => action.id)).toEqual([
      'A4',
      'A8',
      'A1',
      'A2',
      'A3',
      'A5',
      'A6',
      'A7',
      'A10',
      'A9',
    ]);
  });

  it('keeps the A3/A9 SLA overrides independent of dueState', () => {
    expect(slaOf(byId('A3')).pct).toBeCloseTo(0.975, 6);
    expect(slaOf(escalateAction(byId('A3'))).elapsed).toBe(7.8);
    expect(slaOf(escalateAction(byId('A9'))).elapsed).toBe(2.7);
  });

  it('exposes the SLA tooltip text', () => {
    expect(slaTip(byId('A1'), EN)).toBe('Target 1d · waiting 1d 5h');
  });
});

describe('job-order and incident SLA/score', () => {
  it.each([
    ['JO-7782', 'ok', 7, '7h left'],
    ['JO-7781', 'ok', 23, '23h left'],
    ['JO-7779', 'at-risk', 1.4, '1.4h left'],
    ['JO-7775', 'ok', 34.6, '1d 11h left'],
    ['JO-7770', 'ok', 66.2, '2d 18h left'],
    ['JO-7768', 'breached', -6.7, 'Over by 6.7h'],
  ] as const)('%s is %s', (id, state, left, label) => {
    const order = JOB_ORDERS.find((candidate) => candidate.id === id);
    if (!order) throw new Error('missing job order');
    expect(slaOf(order)).toMatchObject({ left, state });
    expect(slaLabelOf(order, EN)).toBe(label);
  });

  it('scores incidents with the severity weight plus the SLA bonus', () => {
    expect(INCIDENTS.map(scoreIncident)).toEqual([150, 95, 70, 40, 15]);
    expect(rankIncidents(INCIDENTS).map((incident) => incident.id)).toEqual(
      INCIDENTS.map((incident) => incident.id),
    );
  });
});

describe('slaDur', () => {
  it.each([
    [0.2, '12m', '12د'],
    [23.9, '23.9h', '23.9س'],
    [24, '1d', '1ي'],
    [50.4, '2d 2h', '2ي 2س'],
    [0, '0m', '0د'],
    [-3.6, '3.6h', '3.6س'],
    [0.99, '59m', '59د'],
    [23.96, '24h', '24س'],
    [47.6, '1d 24h', '1ي 24س'],
  ] as const)('%f → %s', (hours, en, ar) => {
    expect(slaDur(hours, EN)).toBe(en);
    expect(slaDur(hours, AR)).toBe(ar);
  });

  it('falls back to a 24h target and 0.4 fraction for unknown subjects', () => {
    expect(slaOf({ id: 'X1', kind: 'mystery' })).toMatchObject({
      elapsed: 9.6,
      left: 14.4,
      state: 'ok',
      target: 24,
    });
  });
});

describe('escalation rules', () => {
  it('forces critical/today and leaves the due text untouched', () => {
    const escalated = escalateAction(byId('A5'));
    expect(escalated).toMatchObject({
      due: 'Due in 3 days',
      dueState: 'today',
      priority: 'critical',
    });
    expect(escalateAction(escalated)).toEqual(escalated);
  });

  it.each([
    ['A1', 170, 'at-risk'],
    ['A2', 169, 'at-risk'],
    ['A3', 147, 'at-risk'],
    ['A4', 162, 'at-risk'],
    ['A5', 172, 'at-risk'],
    ['A6', 162, 'at-risk'],
    ['A7', 172, 'at-risk'],
    ['A8', 147, 'at-risk'],
    ['A9', 135, 'ok'],
    ['A10', 171, 'at-risk'],
  ] as const)('%s escalates to score %i (%s)', (id, score, state) => {
    const escalated = escalateAction(byId(id));
    expect(scoreAction(escalated)).toBe(score);
    expect(slaOf(escalated).state).toBe(state);
  });

  it('walks the incident severity ladder and caps at critical', () => {
    expect(escalateSeverity('low')).toBe('medium');
    expect(escalateSeverity('medium')).toBe('high');
    expect(escalateSeverity('high')).toBe('critical');
    expect(escalateSeverity('critical')).toBe('critical');
    expect(escalateSeverity('unknown' as never)).toBe('low');
  });

  it('shortens a title at the em-dash separator', () => {
    expect(actionShortTitle(byId('A1').title)).toBe('Budget Release');
    expect(actionShortTitle('No separator')).toBe('No separator');
  });
});

describe('reference codes and groups', () => {
  it.each([
    ['A1', 'BUD-2026-107'],
    ['A2', 'PC-2026-114'],
    ['A3', 'AS-2026-121'],
    ['A4', 'PCV-2026-128'],
    ['A5', 'BUD-2026-135'],
    ['A6', 'REQ-2026-142'],
    ['A7', 'PC-2026-149'],
    ['A8', 'REQ-2026-156'],
    ['A9', 'AS-2026-163'],
    ['A10', 'BUD-2026-170'],
  ])('%s → %s', (id, code) => {
    expect(referenceCode(byId(id))).toBe(code);
  });

  it('keeps only three suffix characters, so large ids wrap', () => {
    expect(referenceCode({ group: 'other', id: 'A129', kind: 'leave' })).toBe(
      'REQ-2026-003',
    );
  });

  it('groups actions by kind; other has no chip group', () => {
    expect(ACTIONS.map((action) => action.group)).toEqual([
      'transfer-funds',
      'purchase-committee',
      'action-sheet',
      'transfer-funds',
      'new-budget',
      'other',
      'purchase-committee',
      'other',
      'action-sheet',
      'new-budget',
    ]);
  });
});
