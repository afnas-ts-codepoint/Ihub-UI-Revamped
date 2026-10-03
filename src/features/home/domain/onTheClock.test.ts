import { describe, expect, it } from 'vitest';

import { ACTIONS } from '../data/actions.mock';
import { INCIDENTS } from '../data/incidents.mock';
import { JOB_ORDERS } from '../data/jobOrders.mock';
import { buildClockRows, summariseClock } from './onTheClock';
import { rankQueue } from './prioritization';
import type { SlaLabels } from './sla';

const labels: SlaLabels = {
  days: 'd',
  hours: 'h',
  left: ' left',
  minutes: 'm',
  over: 'Over by ',
  target: 'Target ',
  waiting: 'waiting ',
};

// Golden values read from the rendered prototype (index.html, Overview "On the clock").
const rows = buildClockRows(rankQueue(ACTIONS), JOB_ORDERS, INCIDENTS, labels);
const summary = summariseClock(rows);

describe('On the clock rows', () => {
  it('lists every approval, task and incident (21 items)', () => {
    expect(rows).toHaveLength(21);
  });

  it('matches the prototype counts: 13 on time, 5 running out, 3 past due', () => {
    expect([summary.ok, summary.risk, summary.breached]).toEqual([13, 5, 3]);
    expect(summary.attention).toHaveLength(8);
    expect(summary.onTime).toHaveLength(13);
  });

  it('orders "Needs attention" breached first, then by elapsed share', () => {
    expect(
      summary.attention.slice(0, 6).map((row) => [row.title, row.label]),
    ).toEqual([
      ['Budget Release — Eid Activation, 360 Mall', 'Over by 5.3h'],
      ['Arcade machine maintenance — 12 units', 'Over by 6.7h'],
      ['POS network outage — 360 Mall', '18m over'],
      ['Action Sheet — Crowd Safety Plan, Summer Festival', '12m left'],
      ['Repair escalator B2', '1.4h left'],
      ['Purchase Approval (PC) — Cinema Projector Units ×2', '5.8h left'],
    ]);
  });

  it('puts action sheets in their own queue and counts each queue as on-time/total', () => {
    const tally = (queue: string) => {
      const inQueue = rows.filter((row) => row.queue === queue);
      return `${String(inQueue.filter((row) => row.state === 'ok').length)}/${String(inQueue.length)}`;
    };
    expect(['approvals', 'sheets', 'tasks', 'incidents'].map(tally)).toEqual([
      '5/8',
      '1/2',
      '4/6',
      '3/5',
    ]);
  });

  it('strips the "SLA" prefix and state phrase from an incident label', () => {
    const labelOf = (id: string) => rows.find((row) => row.key === `I${id}`)?.label;
    expect(labelOf('INC-2041')).toBe('18m over');
    expect(labelOf('INC-2039')).toBe('40m left');
    expect(labelOf('INC-2037')).toBe('Within SLA');
  });

  it('gives incidents fixed bar fills by state', () => {
    const pct = (id: string) => rows.find((row) => row.key === `I${id}`)?.pct;
    expect([pct('INC-2041'), pct('INC-2039'), pct('INC-2037')]).toEqual([1.12, 0.86, 0.45]);
  });

  it('carries the SLA tip for queue items and the incident label for incidents', () => {
    const budget = rows.find((row) => row.key === 'AA1');
    expect(budget?.tip).toMatch(/^Target .* · waiting /);
    expect(rows.find((row) => row.key === 'IINC-2041')?.tip).toBe('SLA breached · 18m over');
  });
});
