import type { QueueIncident } from '../types/queue.types';

/**
 * Live-incident seed. The queue store owns it because the workflow drawer's
 * incident body (pin, escalate, dismiss) mutates it; the incident cards and
 * views that read it land in M10.2/M10.3.
 * @prototype ihub/index.html:L10169-L10236 `INCIDENTS`
 */
export const INCIDENTS: readonly QueueIncident[] = [
  {
    id: 'INC-2041',
    icon: 'bolt',
    title: 'POS network outage — 360 Mall',
    severity: 'critical',
    status: 'Investigating',
    owner: 'Yazan Malik (IT)',
    location: '360 Mall',
    sla: 'breached',
    slaLabel: 'SLA breached · 18m over',
    opened: '52m ago',
    lastUpdate: '2m ago',
    progress: 0.4,
    pinned: true,
    detail:
      'All point-of-sale terminals across 360 Mall retail and F&B lost connectivity at 13:08. Cash-only fallback active. Network team isolated a failed core switch; failover in progress.',
    feed: [
      {
        t: '2m ago',
        type: 'status',
        who: 'Yazan Malik',
        text: 'Failover to backup switch initiated. ETA to restore 10–15 min.',
      },
      {
        t: '11m ago',
        type: 'escalation',
        who: 'System',
        text: 'Escalated to Critical — SLA breach threshold passed.',
      },
      {
        t: '24m ago',
        type: 'owner',
        who: 'Yazan Malik',
        text: 'Took ownership. On site at 360 Mall comms room.',
      },
      {
        t: '38m ago',
        type: 'comment',
        who: 'Store Ops',
        text: 'Cash-only fallback in place across all tenants.',
      },
      {
        t: '52m ago',
        type: 'status',
        who: 'System',
        text: 'Incident opened — POS terminals offline.',
      },
    ],
  },
  {
    id: 'INC-2039',
    icon: 'sun',
    title: 'HVAC failure — SAMA Cinema',
    severity: 'high',
    status: 'Assigned',
    owner: 'Facilities',
    location: 'SAMA Mall',
    sla: 'at-risk',
    slaLabel: 'SLA at risk · 40m left',
    opened: '1h 20m ago',
    lastUpdate: '15m ago',
    progress: 0.25,
    pinned: false,
    detail:
      'Cooling lost in cinema screens 1–3. Temperatures rising; contractor dispatched. Screens may need to be paused if not restored within the hour.',
    feed: [
      {
        t: '15m ago',
        type: 'comment',
        who: 'Facilities',
        text: 'Contractor 25 min out. Compressor suspected.',
      },
      {
        t: '48m ago',
        type: 'owner',
        who: 'Dispatch',
        text: 'Assigned to Cool-Tech contractor.',
      },
      {
        t: '1h 20m ago',
        type: 'status',
        who: 'System',
        text: 'Incident opened — HVAC alarm.',
      },
    ],
  },
  {
    id: 'INC-2037',
    icon: 'wallet',
    read: true,
    title: 'Payment gateway latency',
    severity: 'high',
    status: 'Monitoring',
    owner: 'Payments',
    location: 'All venues',
    sla: 'ok',
    slaLabel: 'Within SLA',
    opened: '3h ago',
    lastUpdate: '34m ago',
    progress: 0.7,
    pinned: false,
    detail:
      'Intermittent card-authorisation delays (4–8s) reported across venues. Provider acknowledged upstream issue; mitigations applied, error rate falling.',
    feed: [
      {
        t: '34m ago',
        type: 'status',
        who: 'Payments',
        text: 'Error rate down to 1.2%. Monitoring for stability.',
      },
      {
        t: '2h ago',
        type: 'comment',
        who: 'Provider',
        text: 'Upstream processor degradation confirmed.',
      },
    ],
  },
  {
    id: 'INC-2034',
    icon: 'shield',
    title: 'Access-control door fault — Avenues',
    severity: 'medium',
    status: 'Assigned',
    owner: 'Security',
    location: 'The Avenues',
    sla: 'ok',
    slaLabel: 'Within SLA',
    opened: '5h ago',
    lastUpdate: '1h ago',
    progress: 0.5,
    pinned: false,
    detail:
      'Staff entrance B fails to authenticate badges intermittently. Manual sign-in active; technician scheduled.',
    feed: [
      {
        t: '1h ago',
        type: 'owner',
        who: 'Security',
        text: 'Technician booked for 16:00.',
      },
    ],
  },
  {
    id: 'INC-2030',
    icon: 'megaphone',
    read: true,
    title: 'Digital signage display down',
    severity: 'low',
    status: 'Monitoring',
    owner: 'Marketing Tech',
    location: 'Al Kout',
    sla: 'ok',
    slaLabel: 'Within SLA',
    opened: '1d ago',
    lastUpdate: '5h ago',
    progress: 0.8,
    pinned: false,
    detail:
      'Atrium video wall showing one dark panel. Cosmetic; replacement panel ordered.',
    feed: [
      {
        t: '5h ago',
        type: 'comment',
        who: 'Marketing Tech',
        text: 'Replacement panel ETA 2 days.',
      },
    ],
  },
];
