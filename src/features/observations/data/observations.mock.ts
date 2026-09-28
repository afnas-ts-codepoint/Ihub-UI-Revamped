import type {
  ObservationDraft,
  ObservationLinkKind,
  ObservationPriority,
  ObservationRow,
  ObservationSeverity,
} from '../types/observations.types';

export const OBSERVATION_LOCATIONS = [
  'The Avenues',
  '360 Mall',
  'Al Kout',
  'SAMA Mall',
  'Riyadh Park',
  'The Gate Mall',
  'Assima Mall',
] as const;

export const OBSERVATION_ZONES = [
  'Fun Tiki',
  'The Bowl Room',
  'Wonder Zone',
  'Jump',
  'The Court',
  'Planet Laser',
  'Pixel Run',
  'Sky Zone',
  'Make*',
  'Retail',
] as const;

export const OBSERVATION_DEPARTMENTS = [
  'Operations',
  'Facilities',
  'Maintenance',
  'Safety & Security',
  'IT & Systems',
  'Guest Experience',
  'Marketing',
  'Procurement',
  'Finance',
  'HR',
  'QA & Compliance',
] as const;

export const OBSERVATION_AREAS = [
  'Front of house',
  'Arena / play area',
  'Back of house',
  'Entrance / queue',
  'F&B',
  'Redemption counter',
] as const;

export const OBSERVATION_SUB_AREAS = [
  'Counter / till',
  'Play structure',
  'Ticketing',
  'Lockers',
  'Seating area',
  'Control room',
  'Entrance gate',
  'Washrooms',
] as const;

export const OBSERVATION_TOUCH_POINTS = [
  'Arrival & parking',
  'Ticketing & entry',
  'Wayfinding',
  'Activity / play',
  'F&B service',
  'Redemption',
  'Retail',
  'Exit & feedback',
] as const;

export const OBSERVATION_SEVERITIES = [
  'Low',
  'Medium',
  'High',
] as const satisfies readonly ObservationSeverity[];

export const OBSERVATION_PRIORITIES = [
  'Low',
  'Medium',
  'High',
] as const satisfies readonly ObservationPriority[];

export const OBSERVATION_ASSIGNMENT_OPTIONS = [
  'Unassigned',
  'Operations — K. Ibrahim',
  'Facilities — O. Najjar',
  'Safety & Security — R. Salem',
  'Maintenance — Y. Al-Mutairi',
  'Guest Experience — L. Haddad',
] as const;

export const OBSERVATION_LINK_OPTIONS = {
  enquiry: [
    'ENQ-118 — Party booking availability, Al Kout',
    'ENQ-121 — Group rate request, 360 Mall',
    'ENQ-126 — Lost item follow-up, The Avenues',
    'ENQ-130 — Corporate event enquiry, SAMA Mall',
    'ENQ-134 — Birthday package amendment, Al Kout',
  ],
  task: [
    'TSK-2026-311 — Replace queue barrier tape, 360 Mall',
    'TSK-2026-318 — Signage restock, The Avenues',
    'TSK-2026-322 — Harness inspection log review',
    'TSK-2026-327 — Soft play stair grip check, SAMA Mall',
    'TSK-2026-331 — Redemption counter deep clean',
  ],
  incident: [
    'INC-2030 — Digital signage display down, Al Kout',
    'INC-2034 — Access-control door fault, The Avenues',
    'INC-2037 — Payment gateway latency, all venues',
    'INC-2039 — HVAC failure, SAMA Cinema',
    'INC-2041 — POS network outage, 360 Mall',
  ],
} as const satisfies Record<ObservationLinkKind, readonly string[]>;

// D16: these are the dedicated ObservationsView rows. They intentionally do not
// consolidate the separate ProcessesScreen observation dataset.
export const OBSERVATION_ROWS = [
  {
    assignee: 'Facilities — O. Najjar',
    date: '28 Jul',
    id: 'OBS-2026-072',
    raised: 'M. Faris',
    severity: 'High',
    severityTone: 'bad',
    site: 'The Avenues',
    status: 'Action raised',
    title: 'Wet floor near Jump entry — no signage placed',
  },
  {
    assignee: 'Operations — K. Ibrahim',
    date: '28 Jul',
    id: 'OBS-2026-071',
    raised: 'O. Najjar',
    severity: 'Low',
    severityTone: 'neutral',
    site: 'Al Kout',
    status: 'Logged',
    title: 'Harness inspection log completed ahead of shift',
  },
  {
    assignee: 'Unassigned',
    date: '27 Jul',
    id: 'OBS-2026-069',
    raised: 'R. Salem',
    severity: 'Medium',
    severityTone: 'warn',
    site: '360 Mall',
    status: 'Under review',
    title: 'Queue barrier tape frayed at Planet Laser',
  },
  {
    assignee: 'Safety & Security — R. Salem',
    date: '26 Jul',
    id: 'OBS-2026-066',
    raised: 'K. Ibrahim',
    severity: 'Medium',
    severityTone: 'warn',
    site: 'SAMA Mall',
    status: 'Closed',
    title: 'Near miss — guest ran on soft play stairs',
  },
] as const satisfies readonly ObservationRow[];

export const OBSERVATION_HISTORY_ROWS = [
  [
    'REC-2026412',
    'OBS-2026-072',
    'Action raised',
    'M. Faris',
    '28 Jul 2026 09:14',
    'Task TSK-2026-401 created',
  ],
  [
    'REC-2026410',
    'OBS-2026-072',
    'Assigned',
    'Duty Manager',
    '28 Jul 2026 08:52',
    'Routed to Facilities',
  ],
  [
    'REC-2026406',
    'OBS-2026-069',
    'Logged',
    'R. Salem',
    '27 Jul 2026 19:30',
    'Photo attached',
  ],
  [
    'REC-2026399',
    'OBS-2026-066',
    'Closed',
    'R. Salem',
    '26 Jul 2026 21:05',
    'Coaching delivered, no injury',
  ],
] as const;

export function createBlankObservation(): ObservationDraft {
  return {
    area: '',
    department: '',
    enquirySelection: '',
    files: [],
    finding: '',
    incidentSelection: '',
    linkedEnquiries: [],
    linkedIncidents: [],
    linkedTasks: [],
    location: '',
    logNote: '',
    matrix: [],
    owner: '',
    priority: '',
    recommendations: '',
    severity: '',
    subArea: '',
    subject: '',
    taskSelection: '',
    touchPoint: '',
    zone: '',
  };
}
