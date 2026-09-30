export type PaymentSettlementSubActivity = Readonly<{
  active: boolean;
  code: string;
  name: string;
  nameAr: string;
}>;

export type PaymentSettlementActivity = Readonly<{
  active: boolean;
  code: string;
  name: string;
  nameAr: string;
  subs: readonly PaymentSettlementSubActivity[];
}>;

/**
 * Feature-local port of the prototype's global `window.ACTIVITY_MASTER`
 * fixture (names/codes only — Action Sheet's "Budgeted" toggle is a manual
 * yes/no, not a computed availability, so the budget/committed amounts
 * Purchasing carries for its own dropdown are not needed here). Per G8 ("no
 * forced cross-feature reuse") and the architecture's feature-import
 * allowlist (only `organization` may be imported by other features),
 * Payment Settlement keeps its own local copy rather than reaching into
 * Purchasing's internals — same precedent as Purchasing's own copy of this
 * fixture relative to Budgeting.
 * @prototype index.html:L10907-L10935
 */
export const activityMasterFixture: readonly PaymentSettlementActivity[] = [
  {
    active: true, code: 'ACT-01', name: 'Marketing & Campaigns', nameAr: 'التسويق والحملات',
    subs: [
      { active: true, code: '01-01', name: 'Seasonal campaigns', nameAr: 'حملات موسمية' },
      { active: true, code: '01-02', name: 'Digital & social', nameAr: 'رقمي واجتماعي' },
      { active: true, code: '01-03', name: 'School holiday programmes', nameAr: 'برامج العطلات' },
    ],
  },
  {
    active: true, code: 'ACT-02', name: 'Operations', nameAr: 'العمليات',
    subs: [
      { active: true, code: '02-01', name: 'Staffing & overtime', nameAr: 'الموارد والعمل الإضافي' },
      { active: true, code: '02-02', name: 'Consumables & wristbands', nameAr: 'مواد استهلاكية' },
      { active: true, code: '02-03', name: 'Party & group events', nameAr: 'الحفلات والمجموعات' },
    ],
  },
  {
    active: true, code: 'ACT-03', name: 'Facilities & Maintenance', nameAr: 'المرافق والصيانة',
    subs: [
      { active: true, code: '03-01', name: 'Planned maintenance', nameAr: 'صيانة مخططة' },
      { active: true, code: '03-02', name: 'Reactive repairs', nameAr: 'إصلاحات طارئة' },
      { active: true, code: '03-03', name: 'Refurbishment', nameAr: 'تجديد' },
    ],
  },
  {
    active: true, code: 'ACT-04', name: 'IT & Systems', nameAr: 'التقنية والأنطمة',
    subs: [
      { active: true, code: '04-01', name: 'POS & ticketing', nameAr: 'نقاط البيع والتذاكر' },
      { active: true, code: '04-02', name: 'Network & security', nameAr: 'الشبكة والأمن' },
      { active: true, code: '04-03', name: 'Software licences', nameAr: 'تراخيص البرمجيات' },
    ],
  },
  {
    active: true, code: 'ACT-05', name: 'Safety & Compliance', nameAr: 'السلامة والامتذال',
    subs: [
      { active: true, code: '05-01', name: 'Inspections & certification', nameAr: 'التفتيش والشهادات' },
      { active: true, code: '05-02', name: 'Training & drills', nameAr: 'التدريب والتمارين' },
      { active: true, code: '05-03', name: 'PPE & safety stock', nameAr: 'معدات الوقاية' },
    ],
  },
  {
    active: true, code: 'ACT-06', name: 'Capital & Fit-out', nameAr: 'رأسمالي وتجهيز',
    subs: [
      { active: true, code: '06-01', name: 'New venue', nameAr: 'موقع جديد' },
      { active: true, code: '06-02', name: 'Refurbishment programme', nameAr: 'برنامج تجديد' },
      { active: true, code: '06-03', name: 'Asset purchase', nameAr: 'شراء أصول' },
    ],
  },
  {
    active: true, code: 'ACT-07', name: 'Utilities', nameAr: 'المرافق',
    subs: [
      { active: true, code: '07-01', name: 'Electricity & water', nameAr: 'كهرباء وماء' },
      { active: false, code: '07-02', name: 'Telecom', nameAr: 'اتصالات' },
    ],
  },
];
