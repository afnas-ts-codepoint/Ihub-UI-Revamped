import type {
  AutoRoutingCategory,
  WorkflowDepartment,
  WorkflowTabId,
} from '../types/workflow.types';

/** @prototype index.html:L21201-L21335 */
export const WORKFLOW_DEPARTMENTS: readonly WorkflowDepartment[] = [
  {
    id: 'tx',
    name: { en: 'Total Experience', ar: 'التجربة الشاملة' },
    divisions: [
      { id: 'gx', name: { en: 'Guest Experience', ar: 'تجربة الضيف' } },
      { id: 'events', name: { en: 'Events & Activation', ar: 'الفعاليات والتفعيل' } },
      { id: 'creative', name: { en: 'Creative Studio', ar: 'الاستوديو الإبداعي' } },
      { id: 'digital', name: { en: 'Digital & App', ar: 'الرقمية والتطبيق' } },
    ],
    tasks: [
      {
        id: 'complaint',
        name: { en: 'Guest Complaint', ar: 'شكوى ضيف' },
        steps: [
          { owner: 'GX Agent', action: 'Log & acknowledge guest', duration: '5m' },
          { owner: 'GX Supervisor', action: 'Categorise & assign owner', duration: '15m' },
          { owner: 'Assigned Division', action: 'Investigate & resolve', duration: '2h' },
          { owner: 'GX Supervisor', action: 'Verify fix with guest', duration: '30m' },
          { owner: 'GX Agent', action: 'Close & capture CSAT', duration: '10m' },
        ],
      },
      {
        id: 'event',
        name: { en: 'Event Request', ar: 'طلب فعالية' },
        steps: [
          { owner: 'GX Agent', action: 'Capture brief & date', duration: '20m' },
          { owner: 'Events Lead', action: 'Feasibility & costing', duration: '1d' },
          { owner: 'Commercial', action: 'Approve budget', duration: '1d' },
          { owner: 'Events & Creative', action: 'Produce & stage', duration: '5d' },
          { owner: 'Events Lead', action: 'Debrief & report', duration: '1d' },
        ],
      },
      {
        id: 'vip',
        name: { en: 'VIP Request', ar: 'طلب كبار الشخصيات' },
        steps: [
          { owner: 'GX Concierge', action: 'Confirm VIP profile', duration: '5m' },
          { owner: 'GX Supervisor', action: 'Assign host & itinerary', duration: '20m' },
          { owner: 'Assigned Host', action: 'Deliver experience', duration: '—' },
          { owner: 'GX Supervisor', action: 'Follow-up & thank you', duration: '1h' },
        ],
      },
    ],
    rules: [
      { type: 'Guest Complaint', label: 'Safety', condition: 'Any venue', route: 'Operations · Facilities', sla: '15m / 1h', active: true },
      { type: 'Guest Complaint', label: 'VIP', condition: 'Any venue', route: 'TX · Guest Experience (Lead)', sla: '5m / 30m', active: true },
      { type: 'Guest Complaint', label: '—', condition: 'Default', route: 'TX · Guest Experience', sla: '15m / 4h', active: true },
      { type: 'Event Request', label: 'Corporate', condition: '> 50 pax', route: 'TX · Events & Activation', sla: '1d / 3d', active: true },
      { type: 'Experience Feedback', label: 'Digital', condition: 'App / web', route: 'TX · Digital & App', sla: '4h / 2d', active: true },
      { type: 'Lost & Found', label: '—', condition: 'Default', route: 'Operations · Security', sla: '30m / 24h', active: false },
    ],
  },
  {
    id: 'ops',
    name: { en: 'Operations', ar: 'العمليات' },
    divisions: [
      { id: 'fac', name: { en: 'Facilities', ar: 'المرافق' } },
      { id: 'hk', name: { en: 'Housekeeping', ar: 'التدبير المنزلي' } },
      { id: 'sec', name: { en: 'Security', ar: 'الأمن' } },
      { id: 'tech', name: { en: 'Technical / MEP', ar: 'الفني' } },
    ],
    tasks: [
      {
        id: 'jobOrder', name: { en: 'Job Order', ar: 'أمر عمل' }, steps: [
          { owner: 'Duty Manager', action: 'Raise & triage', duration: '10m' },
          { owner: 'Facilities Dispatch', action: 'Assign technician', duration: '20m' },
          { owner: 'Technician', action: 'Attend & fix', duration: '2h' },
          { owner: 'Duty Manager', action: 'Inspect & close', duration: '15m' },
        ],
      },
      {
        id: 'incident', name: { en: 'Incident', ar: 'حادث' }, steps: [
          { owner: 'Security Officer', action: 'Log & secure area', duration: '5m' },
          { owner: 'Duty Manager', action: 'Assess severity', duration: '15m' },
          { owner: 'Assigned Team', action: 'Contain & mitigate', duration: '1h' },
          { owner: 'QA', action: 'Root-cause report', duration: '2d' },
        ],
      },
    ],
    rules: [
      { type: 'Job Order', label: 'Urgent', condition: 'Guest-facing', route: 'Operations · Technical (on-call)', sla: '10m / 1h', active: true },
      { type: 'Job Order', label: 'HVAC', condition: 'Any venue', route: 'Operations · Technical / MEP', sla: '30m / 4h', active: true },
      { type: 'Incident', label: 'Safety', condition: 'Any venue', route: 'Operations · Security + Duty Mgr', sla: '5m / 30m', active: true },
      { type: 'Cleaning', label: '—', condition: 'Default', route: 'Operations · Housekeeping', sla: '20m / 2h', active: true },
    ],
  },
  {
    id: 'comm',
    name: { en: 'Commercial', ar: 'التجاري' },
    divisions: [
      { id: 'lease', name: { en: 'Leasing', ar: 'التأجير' } },
      { id: 'mkt', name: { en: 'Marketing', ar: 'التسويق' } },
      { id: 'retail', name: { en: 'Retail Ops', ar: 'عمليات التجزئة' } },
    ],
    tasks: [
      {
        id: 'price', name: { en: 'Price Change', ar: 'تغيير سعر' }, steps: [
          { owner: 'Retail Ops', action: 'Raise request', duration: '15m' },
          { owner: 'Marketing', action: 'Validate promo rules', duration: '2h' },
          { owner: 'Commercial Head', action: 'Approve', duration: '1d' },
          { owner: 'Retail Ops', action: 'Apply at POS', duration: '30m' },
        ],
      },
      {
        id: 'promo', name: { en: 'Promotion Setup', ar: 'إعداد عرض' }, steps: [
          { owner: 'Marketing', action: 'Build campaign brief', duration: '1d' },
          { owner: 'Creative Studio', action: 'Produce assets', duration: '3d' },
          { owner: 'Commercial Head', action: 'Sign-off', duration: '1d' },
          { owner: 'Retail Ops', action: 'Activate in venue', duration: '1d' },
        ],
      },
    ],
    rules: [
      { type: 'Price Change', label: 'Discount', condition: '> 20%', route: 'Commercial · Head (approval)', sla: '—/ 1d', active: true },
      { type: 'Promotion Setup', label: 'Seasonal', condition: 'Any venue', route: 'Commercial · Marketing', sla: '1d / 5d', active: true },
      { type: 'Leasing Enquiry', label: '—', condition: 'Default', route: 'Commercial · Leasing', sla: '4h / 2d', active: true },
    ],
  },
  {
    id: 'fin',
    name: { en: 'Finance', ar: 'المالية' },
    divisions: [
      { id: 'ap', name: { en: 'Accounts Payable', ar: 'الحسابات الدائنة' } },
      { id: 'proc', name: { en: 'Procurement', ar: 'المشتريات' } },
      { id: 'budg', name: { en: 'Budgets', ar: 'الميزانيات' } },
    ],
    tasks: [
      {
        id: 'payment', name: { en: 'Payment Settlement', ar: 'تسوية دفعة' }, steps: [
          { owner: 'Requester', action: 'Submit invoice', duration: '—' },
          { owner: 'Accounts Payable', action: 'Verify & code', duration: '1d' },
          { owner: 'Budgets', action: 'Check budget line', duration: '4h' },
          { owner: 'Finance Head', action: 'Approve payment', duration: '1d' },
          { owner: 'Accounts Payable', action: 'Release & record', duration: '1d' },
        ],
      },
      {
        id: 'purchase', name: { en: 'Purchase Request', ar: 'طلب شراء' }, steps: [
          { owner: 'Requester', action: 'Raise PR', duration: '—' },
          { owner: 'Procurement', action: 'Source & quote', duration: '2d' },
          { owner: 'Budgets', action: 'Confirm availability', duration: '4h' },
          { owner: 'Finance Head', action: 'Approve PO', duration: '1d' },
        ],
      },
    ],
    rules: [
      { type: 'Payment Settlement', label: '> KWD 5k', condition: 'Any venue', route: 'Finance · Head (CEO co-sign)', sla: '—/ 2d', active: true },
      { type: 'Purchase Request', label: 'Capex', condition: 'Any venue', route: 'Finance · Procurement + Budgets', sla: '—/ 3d', active: true },
      { type: 'Petty Cash', label: '—', condition: '< KWD 200', route: 'Finance · Accounts Payable', sla: '—/ 1d', active: true },
    ],
  },
  {
    id: 'hr',
    name: { en: 'Human Resources', ar: 'الموارد البشرية' },
    divisions: [
      { id: 'rec', name: { en: 'Recruitment', ar: 'التوظيف' } },
      { id: 'er', name: { en: 'Employee Relations', ar: 'علاقات الموظفين' } },
      { id: 'pay', name: { en: 'Payroll', ar: 'الرواتب' } },
    ],
    tasks: [
      {
        id: 'leave', name: { en: 'Leave / Investigation', ar: 'إجازة / تحقيق' }, steps: [
          { owner: 'Employee', action: 'Submit request', duration: '—' },
          { owner: 'Line Manager', action: 'Review & endorse', duration: '1d' },
          { owner: 'Employee Relations', action: 'Verify policy', duration: '4h' },
          { owner: 'HR Head', action: 'Approve', duration: '1d' },
        ],
      },
    ],
    rules: [
      { type: 'Investigation', label: 'Misconduct', condition: 'Any venue', route: 'HR · Employee Relations', sla: '1d / 5d', active: true },
      { type: 'Loan Request', label: '—', condition: 'Default', route: 'HR · Payroll', sla: '1d / 3d', active: true },
      { type: 'End of Probation', label: '—', condition: 'Default', route: 'HR · Recruitment', sla: '—/ 2d', active: true },
    ],
  },
  {
    id: 'qa',
    name: { en: 'Quality & Compliance', ar: 'الجودة والامتثال' },
    divisions: [
      { id: 'aud', name: { en: 'Audits', ar: 'التدقيق' } },
      { id: 'std', name: { en: 'Standards', ar: 'المعايير' } },
    ],
    tasks: [
      {
        id: 'obs', name: { en: 'Observation', ar: 'ملاحظة' }, steps: [
          { owner: 'Auditor', action: 'Log observation', duration: '10m' },
          { owner: 'QA Lead', action: 'Assign to owner', duration: '2h' },
          { owner: 'Responsible Division', action: 'Corrective action', duration: '3d' },
          { owner: 'Auditor', action: 'Re-inspect & verify', duration: '1d' },
        ],
      },
    ],
    rules: [
      { type: 'Observation', label: 'Critical', condition: 'Any venue', route: 'Ops + QA · Lead (24h)', sla: '2h / 1d', active: true },
      { type: 'Checklist Fail', label: '—', condition: 'Default', route: 'Responsible Division', sla: '4h / 3d', active: true },
    ],
  },
] as const;

/** @prototype index.html:L21337-L21346 */
export const AUTO_ROUTING_CATEGORIES: readonly AutoRoutingCategory[] = [
  { name: { en: 'Guest Complaint', ar: 'شكوى ضيف' }, owner: 'TX · Guest Experience', labels: [{ label: 'Safety', route: 'Operations · Facilities' }, { label: 'VIP', route: 'GX Lead' }], sla: '15m / 4h' },
  { name: { en: 'Guest Compliment', ar: 'إشادة ضيف' }, owner: 'TX · Guest Experience', labels: [{ label: 'Staff', route: 'HR · Recognition' }], sla: '1d / 3d' },
  { name: { en: 'Experience Feedback', ar: 'ملاحظات التجربة' }, owner: 'TX · Digital & App', labels: [{ label: 'App', route: 'Digital' }, { label: 'Venue', route: 'GX' }], sla: '4h / 2d' },
  { name: { en: 'Event Request', ar: 'طلب فعالية' }, owner: 'TX · Events & Activation', labels: [{ label: 'Corporate', route: 'Events Lead' }], sla: '1d / 3d' },
  { name: { en: 'VIP Request', ar: 'طلب كبار الشخصيات' }, owner: 'TX · Guest Experience', labels: [{ label: 'Concierge', route: 'GX Concierge' }], sla: '5m / 30m' },
  { name: { en: 'Accessibility', ar: 'إمكانية الوصول' }, owner: 'TX · Guest Experience', labels: [{ label: 'Facilities', route: 'Operations' }], sla: '10m / 1h' },
  { name: { en: 'Lost & Found', ar: 'المفقودات' }, owner: 'Operations · Security', labels: [], sla: '30m / 24h' },
] as const;

export const WORKFLOW_TAB_IDS: readonly WorkflowTabId[] = [
  'rules',
  'flow',
  'auto',
  'sla',
];
