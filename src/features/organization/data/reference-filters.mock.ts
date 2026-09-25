import type { RecordFilterExtraKey, RecordFilterKind } from '../filter.types';

type ExtraDefinition = Readonly<{
  key: RecordFilterExtraKey;
  labelKey: string;
  options: readonly string[];
}>;

export type RecordKindDefinition = Readonly<{
  categories: readonly string[];
  extras: readonly ExtraDefinition[];
  numberLabelKey: string;
  placeholder: string;
  subcategories: readonly string[];
}>;

export const REFERENCE_FILTERS = {
  locations: [
    'The Avenues',
    '360 Mall',
    'Al Kout',
    'SAMA Mall',
    'Riyadh Park',
    'The Gate Mall',
    'Assima Mall',
  ],
  zones: [
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
  ],
  assignees: [
    'A. Al-Rashid',
    'S. Al-Qahtani',
    'M. Faris',
    'L. Haddad',
    'O. Najjar',
    'R. Salem',
    'K. Ibrahim',
    'H. Al-Mutairi',
    'N. Al-Sabah',
    'F. Al-Duaij',
    'Unassigned',
  ],
  departments: [
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
  ],
  subjects: [
    'Awaiting action',
    'Awaiting approval',
    'Awaiting documents',
    'Awaiting supplier',
    'In review',
    'On hold',
    'Escalated',
    'Ready to close',
  ],
  priorities: ['Critical', 'High', 'Medium', 'Low'],
  flags: [
    { id: 'showstopper', labelKey: 'flags.showstopper' },
    { id: 'dependencies', labelKey: 'flags.dependencies' },
    { id: 'overdue', labelKey: 'flags.overdue' },
    { id: 'owner-exceeded', labelKey: 'flags.ownerExceeded' },
    { id: 'owner-empty', labelKey: 'flags.ownerEmpty' },
  ],
  kinds: {
    incident: {
      numberLabelKey: 'kinds.incident.number',
      placeholder: 'INC-2041',
      categories: [
        'Guest safety',
        'Staff safety',
        'Equipment & rides',
        'Property & assets',
        'Security',
        'Health & hygiene',
        'Fire & evacuation',
      ],
      subcategories: [
        'Slip / trip / fall',
        'Collision',
        'Entrapment',
        'Mechanical failure',
        'Power / network failure',
        'Theft',
        'Lost child',
        'Contamination',
      ],
      extras: [
        {
          key: 'risk',
          labelKey: 'fields.riskType',
          options: ['Low', 'Medium', 'High', 'Critical'],
        },
        {
          key: 'status',
          labelKey: 'fields.status',
          options: [
            'Open',
            'Under investigation',
            'Assigned',
            'Converted to task',
            'Resolved',
            'Closed',
          ],
        },
      ],
    },
    task: {
      numberLabelKey: 'kinds.task.number',
      placeholder: 'TSK-2026-318',
      categories: [
        'Emergency Maintenance',
        'Preventive Maintenance',
        'Facility Request',
        'Procurement / Purchase',
        'Guest Incident',
        'Commercial / Promotion',
        'QA / Compliance Check',
      ],
      subcategories: [
        'Counter / Till',
        'Play Structure',
        'Ticketing',
        'Lockers',
        'Seating Area',
        'Control Room',
        'Entrance Gate',
      ],
      extras: [
        {
          key: 'priority',
          labelKey: 'fields.priority',
          options: ['Low', 'Medium', 'High', 'Critical'],
        },
        {
          key: 'risk',
          labelKey: 'fields.risk',
          options: ['Low', 'Medium', 'High', 'Critical'],
        },
        {
          key: 'status',
          labelKey: 'fields.stage',
          options: [
            'Open',
            'In progress',
            'Blocked',
            'Review Required',
            'Completed',
          ],
        },
      ],
    },
    sheet: {
      numberLabelKey: 'kinds.sheet.number',
      placeholder: 'AS-2026-114',
      categories: [
        'Safety',
        'Crowd management',
        'Event readiness',
        'Reopening',
        'Compliance',
      ],
      subcategories: ['Pre-opening', 'During event', 'Post-event'],
      extras: [
        {
          key: 'status',
          labelKey: 'fields.status',
          options: ['Draft', 'In progress', 'Pending sign-off', 'Signed off'],
        },
      ],
    },
    observation: {
      numberLabelKey: 'kinds.observation.number',
      placeholder: 'OBS-2026-072',
      categories: [
        'Safety observation',
        'Housekeeping',
        'Guest behaviour',
        'Equipment condition',
        'Staff practice',
        'Near miss',
      ],
      subcategories: [
        'Positive',
        'Needs attention',
        'Unsafe condition',
        'Unsafe act',
      ],
      extras: [
        {
          key: 'risk',
          labelKey: 'fields.severity',
          options: ['Low', 'Medium', 'High'],
        },
        {
          key: 'status',
          labelKey: 'fields.status',
          options: ['Logged', 'Under review', 'Action raised', 'Closed'],
        },
      ],
    },
    enquiry: {
      numberLabelKey: 'kinds.enquiry.number',
      placeholder: 'ENQ-118',
      categories: [
        'Facilities',
        'Guest service',
        'Tenant',
        'Access & security',
        'Housekeeping',
      ],
      subcategories: ['Request', 'Complaint', 'Information'],
      extras: [
        {
          key: 'priority',
          labelKey: 'fields.priority',
          options: ['Low', 'Med', 'High'],
        },
        {
          key: 'status',
          labelKey: 'fields.status',
          options: ['Open', 'Assigned', 'Resolved'],
        },
      ],
    },
    budget: {
      numberLabelKey: 'kinds.budget.number',
      placeholder: 'BUD-2026-014',
      categories: [
        'Capex',
        'Opex',
        'Marketing',
        'Maintenance',
        'Staffing',
        'Events',
      ],
      subcategories: [
        'New budget',
        'Additional budget',
        'Transfer of fund',
        'Reallocation',
      ],
      extras: [
        {
          key: 'status',
          labelKey: 'fields.status',
          options: [
            'Draft',
            'Submitted',
            'Verified',
            'Approved',
            'Returned',
            'Rejected',
          ],
        },
      ],
    },
    history: {
      numberLabelKey: 'kinds.history.number',
      placeholder: 'REC-2026000',
      categories: [
        'Created',
        'Submitted',
        'Approved',
        'Verified',
        'Returned',
        'Rejected',
        'Edited',
        'Closed',
      ],
      subcategories: ['Own records', 'Team records', 'All records'],
      extras: [
        {
          key: 'status',
          labelKey: 'fields.user',
          options: [
            'A. Al-Rashid',
            'S. Al-Qahtani',
            'L. Haddad',
            'M. Faris',
            'O. Najjar',
            'R. Salem',
            'CEO Office',
          ],
        },
      ],
    },
    request: {
      numberLabelKey: 'kinds.request.number',
      placeholder: 'PC-2025-088',
      categories: [
        'Facilities Management',
        'IT & Systems',
        'Marketing',
        'Maintenance',
        'Operations',
      ],
      subcategories: [
        'Cleaning & Housekeeping',
        'End-user Hardware',
        'Print & Collateral',
        'HVAC Maintenance',
      ],
      extras: [
        {
          key: 'status',
          labelKey: 'fields.status',
          options: ['Pending CEO', 'Approved', 'Returned', 'Rejected'],
        },
      ],
    },
  } satisfies Record<RecordFilterKind, RecordKindDefinition>,
} as const;
