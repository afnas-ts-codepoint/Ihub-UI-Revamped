import type { SnagDraft, SnagRow } from '../types/snag-lists.types';

export const SNAG_LOCATIONS = [
  'The Avenues',
  '360 Mall',
  'Al Kout',
  'SAMA Mall',
  'Riyadh Park',
  'The Gate Mall',
  'Assima Mall',
] as const;
export const SNAG_ZONES = [
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
export const SNAG_DEPARTMENTS = [
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
export const SNAG_AREAS = [
  'Front of house',
  'Arena / play area',
  'Back of house',
  'Entrance / queue',
  'F&B',
  'Redemption counter',
] as const;
export const SNAG_SUB_AREAS = [
  'Counter / till',
  'Play structure',
  'Ticketing',
  'Lockers',
  'Seating area',
  'Control room',
  'Entrance gate',
  'Washrooms',
] as const;
export const SNAG_TOUCH_POINTS = [
  'Arrival & parking',
  'Ticketing & entry',
  'Wayfinding',
  'Activity / play',
  'F&B service',
  'Redemption',
  'Retail',
  'Exit & feedback',
] as const;
export const SNAG_KPIS = [
  'CSAT',
  'NPS',
  'Customer Effort Score',
  'Google rating',
  'Mystery visit score',
  'Complaint rate',
] as const;
export const SNAG_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export const SNAG_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const SNAG_ENQUIRIES = [
  'ENQ-118 — Party booking availability, Al Kout',
  'ENQ-121 — Group rate request, 360 Mall',
  'ENQ-126 — Lost item follow-up, The Avenues',
  'ENQ-130 — Corporate event enquiry, SAMA Mall',
] as const;
export const SNAG_OBSERVATIONS = [
  'OBS-2026-072 — Wet floor near Jump entry',
  'OBS-2026-071 — Harness inspection log completed',
  'OBS-2026-069 — Queue barrier tape frayed',
  'OBS-2026-066 — Near miss on soft play stairs',
] as const;
export const SNAG_INCIDENTS = [
  'INC-2034 — Access-control door fault, The Avenues',
  'INC-2037 — Payment gateway latency, all venues',
  'INC-2039 — HVAC failure, SAMA Cinema',
  'INC-2041 — POS network outage, 360 Mall',
] as const;

export const SNAG_ROWS = [
  {
    closed: 11,
    due: '05 Aug',
    id: 'SNG-2026-041',
    items: 18,
    party: 'Nasim Facility',
    priority: 'High',
    priorityTone: 'bad',
    site: 'The Avenues',
    status: 'Open',
    statusTone: 'warn',
    title: 'Wonder Zone soft play refurbishment — handover snags',
  },
  {
    closed: 9,
    due: '31 Jul',
    id: 'SNG-2026-039',
    items: 9,
    party: 'PrintHub Interiors',
    priority: 'Med',
    priorityTone: 'warn',
    site: '360 Mall',
    status: 'Ready to close',
    statusTone: 'ok',
    title: 'Party rooms repaint — finishing defects',
  },
  {
    closed: 6,
    due: '08 Aug',
    id: 'SNG-2026-036',
    items: 14,
    party: 'Advanced Tech Systems',
    priority: 'High',
    priorityTone: 'bad',
    site: 'Al Kout',
    status: 'With contractor',
    statusTone: 'neutral',
    title: 'Pixel Run lighting install — outstanding works',
  },
  {
    closed: 2,
    due: '11 Aug',
    id: 'SNG-2026-033',
    items: 6,
    party: 'In-house Maintenance',
    priority: 'Low',
    priorityTone: 'neutral',
    site: 'SAMA Mall',
    status: 'Open',
    statusTone: 'warn',
    title: 'Redemption counter joinery — minor snags',
  },
  {
    closed: 12,
    due: '24 Jul',
    id: 'SNG-2026-028',
    items: 12,
    party: 'CoolWorks',
    priority: 'Med',
    priorityTone: 'warn',
    site: 'Assima Mall',
    status: 'Closed',
    statusTone: 'ok',
    title: 'The Court flooring replacement — post-works inspection',
  },
] as const satisfies readonly SnagRow[];

export function createBlankSnag(): SnagDraft {
  return {
    area: '',
    details: '',
    enqRef: '',
    files: [],
    incRef: '',
    kpi: '',
    location: '',
    logNote: '',
    matrix: [],
    obsRef: '',
    owner: '',
    priority: '',
    severity: '',
    subArea: '',
    touch: '',
    zone: '',
  };
}
