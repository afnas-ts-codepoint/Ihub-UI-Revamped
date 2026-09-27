import type { MissingDocumentRow, PurchaseHistoryRow, PurchaseRequestRow, ReviewExtra } from '../types/purchasing.types';

/** @prototype index.html:L10070-L10106 `rows` */
export const purchaseRequestRows: readonly PurchaseRequestRow[] = [
  { dept: 'Procurement', id: 'PC-2025-088', status: 'Pending CEO', submitted: 'Apr 28', title: 'Cleaning services renewal — 24 months', tone: 'warn', value: '94,500.000', vendor: 'Nasim Facility' },
  { dept: 'IT', id: 'PC-2025-087', status: 'Pending CEO', submitted: 'Apr 27', title: 'IT hardware — 40 laptops', tone: 'warn', value: '38,200.000', vendor: 'Tech Source' },
  { dept: 'Marketing', id: 'PC-2025-086', status: 'Approved', submitted: 'Apr 26', title: 'Marketing collateral printing', tone: 'ok', value: '6,840.000', vendor: 'PrintHub' },
  { dept: 'Facilities', id: 'PC-2025-085', status: 'Approved', submitted: 'Apr 25', title: 'Annual maintenance — HVAC', tone: 'ok', value: '52,000.000', vendor: 'CoolWorks' },
];

/** @prototype index.html:L10163-L10167 `reqMissRows` */
export const missingDocumentRows: readonly MissingDocumentRow[] = [
  { days: '5', id: 'PC-2025-088', missing: ['Quotation', 'Signed contract'], title: 'Cleaning services renewal — 24 months', vendor: 'Nasim Facility' },
  { days: '3', id: 'PC-2025-084', missing: ['Quotation'], title: 'Security cameras — 12 units', vendor: 'SecureTech' },
  { days: '8', id: 'PC-2025-081', missing: ['Trade licence'], title: 'Landscaping — annual', vendor: 'GreenScape' },
];

/** @prototype index.html:L10175-L10179 `reqHistRows` */
export const purchaseHistoryRows: readonly PurchaseHistoryRow[] = [
  { action: 'Submitted', by: 'M. Faris', date: 'Apr 29', id: 'PC-2025-088', note: 'Sent to committee for review.', tone: 'warn' },
  { action: 'Approved', by: 'CEO Office', date: 'Apr 28', id: 'PC-2025-087', note: 'Approved — routed to Procurement.', tone: 'ok' },
  { action: 'Returned', by: 'Committee', date: 'Apr 26', id: 'PC-2025-086', note: 'Quotation mismatch — resubmit.', tone: 'bad' },
];

/** @prototype index.html:L10231-L10235 `revExtra` */
export const reviewExtraById: Readonly<Record<string, ReviewExtra>> = {
  'PC-2025-088': {
    activity: 'Facilities Management', budgetValue: '98,000.000', budgeted: 'Yes',
    docs: ['Contract_renewal.pdf', 'Legal_review.pdf', 'Quote_comparison.xlsx'],
    high: '112,300.000', just: '24-month renewal with Nasim Facility Services. 6% rate increase indexed to inflation; SLA tightened from 2h to 45m response. Legal has reviewed and cleared the terms.',
    locType: 'Local', location: 'The Avenues', low: '94,500.000', quotes: 3,
    remarks: 'Legal cleared the revised SLA on 26 Apr. Finance confirmed the line has headroom for the 6% uplift.',
    subActivity: 'Cleaning & Housekeeping',
    suppliers: ['Nasim Facility Services — 94,500.000 KWD', 'Gulf Care Services — 101,800.000 KWD', 'Almanar Cleaning Co. — 112,300.000 KWD'],
    year: '2026', zone: 'Zone A — Grand Avenue',
  },
  'PC-2025-087': {
    activity: 'IT & Systems', budgetValue: '40,000.000', budgeted: 'Yes',
    docs: ['Hardware_spec.pdf', 'Vendor_quotes.xlsx'],
    high: '44,900.000', just: 'Replacement of 40 end-of-life laptops across Finance and Operations. Current units are out of warranty and failing at ~3/month.',
    locType: 'Local', location: '360 Mall', low: '38,200.000', quotes: 3,
    remarks: 'IT confirmed the current fleet is out of warranty. Staged rollout over three weeks to avoid downtime.',
    subActivity: 'End-user Hardware',
    suppliers: ['Gulf Tech Solutions — 38,200.000 KWD', 'Alghanim Office IT — 41,600.000 KWD', 'Byte Distribution — 44,900.000 KWD'],
    year: '2026', zone: 'Back of house',
  },
  'PC-2025-086': {
    activity: 'Marketing', budgetValue: '8,000.000', budgeted: 'Yes',
    docs: ['Print_spec.pdf'],
    high: '7,510.000', just: 'Q3 marketing collateral print run for all venues — posters, wayfinding and redemption counter signage.',
    locType: 'Local', location: 'All venues', low: '6,840.000', quotes: 2,
    remarks: 'Print spec matches the approved Q3 campaign artwork.',
    subActivity: 'Print & Collateral',
    suppliers: ['Adwan Press — 6,840.000 KWD', 'Kuwait Print House — 7,510.000 KWD'],
    year: '2026', zone: 'Guest-facing',
  },
  'PC-2025-085': {
    activity: 'Facilities Management', budgetValue: '55,000.000', budgeted: 'Yes',
    docs: ['AMC_scope.pdf', 'Quote_comparison.xlsx'],
    high: '61,400.000', just: 'Annual HVAC preventive maintenance contract covering four venues, 12 scheduled visits and emergency call-out cover.',
    locType: 'Local', location: 'Al Kout · SAMA · 360 · Avenues', low: '52,000.000', quotes: 3,
    remarks: 'Scope includes 12 scheduled visits plus emergency call-out cover across four venues.',
    subActivity: 'HVAC Maintenance',
    suppliers: ['Cool Air MEP — 52,000.000 KWD', 'Nasim Facility Services — 57,300.000 KWD', 'Thermo Gulf — 61,400.000 KWD'],
    year: '2026', zone: 'MEP',
  },
};

/** @prototype index.html:L9952-L9955 */
export const PC_REQUEST_LOCATIONS = ['360 Mall', 'The Gate Mall', 'Al Kout Mall', 'Assima Mall', 'All locations'] as const;
export const PC_REQUEST_ZONES = ['Fun Tiki', 'The Bowl Room', 'Wonder Zone', 'Jump', 'The Court', 'Planet Laser', 'Pixel Run', 'Sky Zone', 'Make*', 'Retail'] as const;
export const PC_REQUEST_DEPARTMENTS = ['Operations', 'Total Experience (TX)', 'Guest Services', 'Facilities', 'Maintenance', 'Marketing', 'Procurement', 'Finance', 'HR', 'IT', 'QA & Compliance', 'Franchise Operations', 'Development'] as const;
export const PC_REQUEST_YEARS = ['2024', '2025', '2026', '2027'] as const;
