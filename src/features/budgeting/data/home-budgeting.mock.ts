import type { BarChartDatum } from '@/shared/ui/charts/BarChart';

import type { BudgetActivity } from '../types/budgeting.types';

export const activityMaster: readonly BudgetActivity[] = [
  {
    account: 'Marketing & Promotions', accountNo: '5100-2040', active: true,
    budget: 30_000, code: 'ACT-01', committed: 21_400,
    desc: '', name: 'Marketing & Campaigns', nameAr: 'التسويق والحملات', owner: 'Marketing', type: 'Opex', year: '2026',
    subs: [
      { active: true, alloc: 14_000, code: '01-01', committed: 11_200, name: 'Seasonal campaigns', nameAr: 'حملات موسمية', desc: 'Media buying, creative production and in-venue dressing for seasonal campaigns across TEC venues.' },
      { active: true, alloc: 8_000, code: '01-02', committed: 5_600, name: 'Digital & social', nameAr: 'رقمي واجتماعي', desc: 'Paid social, search and influencer activity supporting venue footfall and booking conversion.' },
      { active: true, alloc: 8_000, code: '01-03', committed: 4_600, name: 'School holiday programmes', nameAr: 'برامج العطلات', desc: 'Themed holiday programming, activation kits and staff costumes for school holiday periods.' },
    ],
  },
  {
    account: 'Venue Operating Costs', accountNo: '5200-1010', active: true,
    budget: 45_000, code: 'ACT-02', committed: 30_800,
    desc: '', name: 'Operations', nameAr: 'العمليات', owner: 'Operations', type: 'Opex', year: '2026',
    subs: [
      { active: true, alloc: 22_000, code: '02-01', committed: 16_400, name: 'Staffing & overtime', nameAr: 'الموارد والعمل الإضافي', desc: 'Additional operating hours coverage, peak-period overtime and temporary crew for venue operations.' },
      { active: true, alloc: 11_000, code: '02-02', committed: 7_300, name: 'Consumables & wristbands', nameAr: 'مواد استهلاكية', desc: 'Wristbands, tokens, redemption stock and single-use operating consumables.' },
      { active: true, alloc: 12_000, code: '02-03', committed: 7_100, name: 'Party & group events', nameAr: 'الحفلات والمجموعات', desc: 'Party host resourcing, decoration packs and group booking fulfilment costs.' },
    ],
  },
  {
    account: 'Repairs & Maintenance', accountNo: '5300-3025', active: true,
    budget: 24_000, code: 'ACT-03', committed: 19_100,
    desc: '', name: 'Facilities & Maintenance', nameAr: 'المرافق والصيانة', owner: 'Facilities', type: 'Opex', year: '2026',
    subs: [
      { active: true, alloc: 10_000, code: '03-01', committed: 8_200, name: 'Planned maintenance', nameAr: 'صيانة مخططة', desc: 'Scheduled servicing of rides, soft play structures, HVAC and building systems.' },
      { active: true, alloc: 6_000, code: '03-02', committed: 5_400, name: 'Reactive repairs', nameAr: 'إصلاحات طارئة', desc: 'Unplanned repairs to attractions, surfaces and equipment raised through work orders.' },
      { active: true, alloc: 8_000, code: '03-03', committed: 5_500, name: 'Refurbishment', nameAr: 'تجديد', desc: 'Refresh of guest-facing areas — surfaces, paint, seating and party rooms.' },
    ],
  },
  {
    account: 'IT Infrastructure & Licences', accountNo: '5400-4008', active: true,
    budget: 20_000, code: 'ACT-04', committed: 12_400,
    desc: '', name: 'IT & Systems', nameAr: 'التقنية والأنظمة', owner: 'IT', type: 'Opex', year: '2026',
    subs: [
      { active: true, alloc: 9_000, code: '04-01', committed: 6_100, name: 'POS & ticketing', nameAr: 'نقاط البيع والتذاكر', desc: 'Point of sale terminals, ticketing hardware and licence renewals across venues.' },
      { active: true, alloc: 6_000, code: '04-02', committed: 3_800, name: 'Network & security', nameAr: 'الشبكة والأمن', desc: 'Connectivity, access control and cyber-security tooling for venue systems.' },
      { active: true, alloc: 5_000, code: '04-03', committed: 2_500, name: 'Software licences', nameAr: 'تراخيص البرمجيات', desc: 'Annual platform subscriptions and user licences for operational systems.' },
    ],
  },
  {
    account: 'Health, Safety & Compliance', accountNo: '5500-5012', active: true,
    budget: 12_000, code: 'ACT-05', committed: 7_600,
    desc: '', name: 'Safety & Compliance', nameAr: 'السلامة والامتثال', owner: 'QA & Compliance', type: 'Opex', year: '2026',
    subs: [
      { active: true, alloc: 5_000, code: '05-01', committed: 3_600, name: 'Inspections & certification', nameAr: 'التفتيش والشهادات', desc: 'Third-party ride inspections, certification renewals and compliance audits.' },
      { active: true, alloc: 4_000, code: '05-02', committed: 2_600, name: 'Training & drills', nameAr: 'التدريب والتمارين', desc: 'Safety training, evacuation drills and first-aid certification for venue teams.' },
      { active: true, alloc: 3_000, code: '05-03', committed: 1_400, name: 'PPE & safety stock', nameAr: 'معدات الوقاية', desc: 'Harnesses, protective equipment and safety consumables replacement.' },
    ],
  },
  {
    account: 'Capital Works & Fit-out', accountNo: '1250-1005', active: true,
    budget: 120_000, code: 'ACT-06', committed: 96_500,
    desc: '', name: 'Capital & Fit-out', nameAr: 'رأسمالي وتجهيز', owner: 'Development', type: 'Capex', year: '2026',
    subs: [
      { active: true, alloc: 70_000, code: '06-01', committed: 61_000, name: 'New venue', nameAr: 'موقع جديد', desc: 'Design, build and first fit-out of a new venue, including FF&E and signage.' },
      { active: true, alloc: 35_000, code: '06-02', committed: 26_500, name: 'Refurbishment programme', nameAr: 'برنامج تجديد', desc: 'Multi-phase refurbishment of an existing venue against an approved capital plan.' },
      { active: true, alloc: 15_000, code: '06-03', committed: 9_000, name: 'Asset purchase', nameAr: 'شراء أصول', desc: 'Purchase of attractions, games or major equipment capitalised on the asset register.' },
    ],
  },
  {
    account: 'Utilities & Telecom', accountNo: '5600-6003', active: true,
    budget: 18_000, code: 'ACT-07', committed: 13_900,
    desc: '', name: 'Utilities', nameAr: 'المرافق', owner: 'Facilities', type: 'Opex', year: '2026',
    subs: [
      { active: true, alloc: 15_000, code: '07-01', committed: 12_400, name: 'Electricity & water', nameAr: 'كهرباء وماء', desc: 'Metered electricity and water consumption charges per venue.' },
      { active: false, alloc: 3_000, code: '07-02', committed: 1_500, name: 'Telecom', nameAr: 'اتصالات', desc: 'Fixed lines, mobile fleet and internet circuits.' },
    ],
  },
];

export const budgetSheetCategories = [
  { activityCodes: ['ACT-01'], key: 'C1', name: 'Commercial & Marketing', nameAr: 'التسويق التجاري' },
  { activityCodes: ['ACT-02'], key: 'C2', name: 'Venue Operations', nameAr: 'عمليات المواقع' },
  { activityCodes: ['ACT-03', 'ACT-07'], key: 'C3', name: 'Facilities & Utilities', nameAr: 'المرافق والخدمات' },
  { activityCodes: ['ACT-04'], key: 'C4', name: 'Technology', nameAr: 'التقنية' },
  { activityCodes: ['ACT-05'], key: 'C5', name: 'Safety & Compliance', nameAr: 'السلامة والامتثال' },
  { activityCodes: ['ACT-06'], key: 'C6', name: 'Capital Projects', nameAr: 'المشاريع الرأسمالية' },
] as const;

export const projectedRevenueChart: readonly BarChartDatum[] = [720, 760, 810, 850, 830, 900, 960, 940, 890, 970, 1020, 1000]
  .map((value, index) => ({ label: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index] ?? '', value }));

export const projectedRevenueRows = [
  { actual: '1,410,000', attainment: '67%', dept: 'Marketing', projected: '2,100,000', status: 'On track', tone: 'ok', variance: '+3.2%' },
  { actual: '2,290,000', attainment: '67%', dept: 'Operations', projected: '3,400,000', status: 'On track', tone: 'ok', variance: '+1.8%' },
  { actual: '390,000', attainment: '61%', dept: 'IT', projected: '640,000', status: 'Watch', tone: 'warn', variance: '-2.4%' },
  { actual: '128,000', attainment: '71%', dept: 'HR', projected: '180,000', status: 'On track', tone: 'ok', variance: '+0.6%' },
  { actual: '1,320,000', attainment: '69%', dept: 'Executive', projected: '1,900,000', status: 'On track', tone: 'ok', variance: '+4.1%' },
  { actual: '250,000', attainment: '60%', dept: 'QA', projected: '420,000', status: 'Watch', tone: 'warn', variance: '-1.1%' },
  { actual: '1,512,000', attainment: '59%', dept: 'Facilities', projected: '2,560,000', status: 'On track', tone: 'ok', variance: '+2.7%' },
] as const;
