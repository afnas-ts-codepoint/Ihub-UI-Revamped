export type PurchasingSubActivity = Readonly<{
  active: boolean;
  alloc: number;
  code: string;
  committed: number;
  desc: string;
  name: string;
  nameAr: string;
}>;

export type PurchasingActivity = Readonly<{
  account: string;
  accountNo: string;
  active: boolean;
  budget: number;
  code: string;
  committed: number;
  name: string;
  nameAr: string;
  owner: string;
  subs: readonly PurchasingSubActivity[];
  type: 'Capex' | 'Opex';
  year: string;
}>;

/**
 * Feature-local port of the prototype's global `window.ACTIVITY_MASTER` fixture.
 * `src/features/budgeting` owns the same literal data for its own dropdowns but
 * does not export its activity-map handling via `index.ts`; per G8 ("no forced
 * cross-feature reuse"), Purchasing keeps its own local copy rather than reaching
 * into Budgeting's internals. See `docs/migration/DECISIONS.md` M6.3 entry.
 * @prototype index.html:L10907-L10935
 */
export const activityMasterFixture: readonly PurchasingActivity[] = [
  {
    code: 'ACT-01', name: 'Marketing & Campaigns', nameAr: 'التسويق والحملات', type: 'Opex', owner: 'Marketing', account: 'Marketing & Promotions', accountNo: '5100-2040', year: '2026', budget: 30000, committed: 21400, active: true,
    subs: [
      { code: '01-01', name: 'Seasonal campaigns', nameAr: 'حملات موسمية', alloc: 14000, committed: 11200, desc: 'Media buying, creative production and in-venue dressing for seasonal campaigns across TEC venues.', active: true },
      { code: '01-02', name: 'Digital & social', nameAr: 'رقمي واجتماعي', alloc: 8000, committed: 5600, desc: 'Paid social, search and influencer activity supporting venue footfall and booking conversion.', active: true },
      { code: '01-03', name: 'School holiday programmes', nameAr: 'برامج العطلات', alloc: 8000, committed: 4600, desc: 'Themed holiday programming, activation kits and staff costumes for school holiday periods.', active: true },
    ],
  },
  {
    code: 'ACT-02', name: 'Operations', nameAr: 'العمليات', type: 'Opex', owner: 'Operations', account: 'Venue Operating Costs', accountNo: '5200-1010', year: '2026', budget: 45000, committed: 30800, active: true,
    subs: [
      { code: '02-01', name: 'Staffing & overtime', nameAr: 'الموارد والعمل الإضافي', alloc: 22000, committed: 16400, desc: 'Additional operating hours coverage, peak-period overtime and temporary crew for venue operations.', active: true },
      { code: '02-02', name: 'Consumables & wristbands', nameAr: 'مواد استهلاكية', alloc: 11000, committed: 7300, desc: 'Wristbands, tokens, redemption stock and single-use operating consumables.', active: true },
      { code: '02-03', name: 'Party & group events', nameAr: 'الحفلات والمجموعات', alloc: 12000, committed: 7100, desc: 'Party host resourcing, decoration packs and group booking fulfilment costs.', active: true },
    ],
  },
  {
    code: 'ACT-03', name: 'Facilities & Maintenance', nameAr: 'المرافق والصيانة', type: 'Opex', owner: 'Facilities', account: 'Repairs & Maintenance', accountNo: '5300-3025', year: '2026', budget: 24000, committed: 19100, active: true,
    subs: [
      { code: '03-01', name: 'Planned maintenance', nameAr: 'صيانة مخططة', alloc: 10000, committed: 8200, desc: 'Scheduled servicing of rides, soft play structures, HVAC and building systems.', active: true },
      { code: '03-02', name: 'Reactive repairs', nameAr: 'إصلاحات طارئة', alloc: 6000, committed: 5400, desc: 'Unplanned repairs to attractions, surfaces and equipment raised through work orders.', active: true },
      { code: '03-03', name: 'Refurbishment', nameAr: 'تجديد', alloc: 8000, committed: 5500, desc: 'Refresh of guest-facing areas — surfaces, paint, seating and party rooms.', active: true },
    ],
  },
  {
    code: 'ACT-04', name: 'IT & Systems', nameAr: 'التقنية والأنطمة', type: 'Opex', owner: 'IT', account: 'IT Infrastructure & Licences', accountNo: '5400-4008', year: '2026', budget: 20000, committed: 12400, active: true,
    subs: [
      { code: '04-01', name: 'POS & ticketing', nameAr: 'نقاط البيع والتذاكر', alloc: 9000, committed: 6100, desc: 'Point of sale terminals, ticketing hardware and licence renewals across venues.', active: true },
      { code: '04-02', name: 'Network & security', nameAr: 'الشبكة والأمن', alloc: 6000, committed: 3800, desc: 'Connectivity, access control and cyber-security tooling for venue systems.', active: true },
      { code: '04-03', name: 'Software licences', nameAr: 'تراخيص البرمجيات', alloc: 5000, committed: 2500, desc: 'Annual platform subscriptions and user licences for operational systems.', active: true },
    ],
  },
  {
    code: 'ACT-05', name: 'Safety & Compliance', nameAr: 'السلامة والامتذال', type: 'Opex', owner: 'QA & Compliance', account: 'Health, Safety & Compliance', accountNo: '5500-5012', year: '2026', budget: 12000, committed: 7600, active: true,
    subs: [
      { code: '05-01', name: 'Inspections & certification', nameAr: 'التفتيش والشهادات', alloc: 5000, committed: 3600, desc: 'Third-party ride inspections, certification renewals and compliance audits.', active: true },
      { code: '05-02', name: 'Training & drills', nameAr: 'التدريب والتمارين', alloc: 4000, committed: 2600, desc: 'Safety training, evacuation drills and first-aid certification for venue teams.', active: true },
      { code: '05-03', name: 'PPE & safety stock', nameAr: 'معدات الوقاية', alloc: 3000, committed: 1400, desc: 'Harnesses, protective equipment and safety consumables replacement.', active: true },
    ],
  },
  {
    code: 'ACT-06', name: 'Capital & Fit-out', nameAr: 'رأسمالي وتجهيز', type: 'Capex', owner: 'Development', account: 'Capital Works & Fit-out', accountNo: '1250-1005', year: '2026', budget: 120000, committed: 96500, active: true,
    subs: [
      { code: '06-01', name: 'New venue', nameAr: 'موقع جديد', alloc: 70000, committed: 61000, desc: 'Design, build and first fit-out of a new venue, including FF&E and signage.', active: true },
      { code: '06-02', name: 'Refurbishment programme', nameAr: 'برنامج تجديد', alloc: 35000, committed: 26500, desc: 'Multi-phase refurbishment of an existing venue against an approved capital plan.', active: true },
      { code: '06-03', name: 'Asset purchase', nameAr: 'شراء أصول', alloc: 15000, committed: 9000, desc: 'Purchase of attractions, games or major equipment capitalised on the asset register.', active: true },
    ],
  },
  {
    code: 'ACT-07', name: 'Utilities', nameAr: 'المرافق', type: 'Opex', owner: 'Facilities', account: 'Utilities & Telecom', accountNo: '5600-6003', year: '2026', budget: 18000, committed: 13900, active: true,
    subs: [
      { code: '07-01', name: 'Electricity & water', nameAr: 'كهرباء وماء', alloc: 15000, committed: 12400, desc: 'Metered electricity and water consumption charges per venue.', active: true },
      { code: '07-02', name: 'Telecom', nameAr: 'اتصالات', alloc: 3000, committed: 1500, desc: 'Fixed lines, mobile fleet and internet circuits.', active: false },
    ],
  },
];
