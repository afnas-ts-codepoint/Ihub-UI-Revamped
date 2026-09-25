export const paths = {
  home: {
    root: '/home',
    overview: '/home/overview',
    view: <View extends string>(view: View): `/home/${View}` => `/home/${view}`,
    assigned: <Queue extends string>(queue: Queue): `/home/assigned/${Queue}` =>
      `/home/assigned/${queue}`,
    incidents: <Sub extends string>(sub: Sub): `/home/incidents/${Sub}` =>
      `/home/incidents/${sub}`,
    workCentre: (section: string, child?: string) =>
      child
        ? `/home/work-centre/${section}/${child}`
        : `/home/work-centre/${section}`,
    paymentSettlement: <Module extends string>(module: Module) =>
      `/home/payment-settlement/${module}` as const,
  },
  tasks: {
    view: <TaskId extends string>(taskId: TaskId): `/tasks/${TaskId}` =>
      `/tasks/${taskId}`,
    edit: <TaskId extends string>(taskId: TaskId): `/tasks/${TaskId}/edit` =>
      `/tasks/${taskId}/edit`,
  },
  finance: {
    root: '/finance',
    dashboard: '/finance/dashboard',
    budgeting: '/finance/budgeting',
  },
  hr: {
    root: '/hr',
    item: <Item extends string>(item: Item): `/hr/${Item}` => `/hr/${item}`,
  },
  appraisal: '/appraisal',
  workflows: '/workflows',
  notifications: '/notifications',
  quality: {
    root: '/quality',
    item: <Item extends string>(item: Item): `/quality/${Item}` =>
      `/quality/${item}`,
  },
  history: {
    root: '/history',
    item: <Item extends string>(item: Item): `/history/${Item}` =>
      `/history/${item}`,
  },
  settings: {
    root: '/settings',
    configuration: '/settings/configuration',
    item: <Item extends string>(item: Item): `/settings/${Item}` =>
      `/settings/${item}`,
  },
  reports: {
    root: '/reports',
    item: <Item extends string>(item: Item): `/reports/${Item}` =>
      `/reports/${item}`,
  },
  masters: {
    root: '/masters',
    category: <Category extends string>(
      category: Category,
    ): `/masters/${Category}` => `/masters/${category}`,
    item: <Category extends string, Item extends string>(
      category: Category,
      item: Item,
    ): `/masters/${Category}/${Item}` => `/masters/${category}/${item}`,
  },
  mastersList: {
    root: '/masters-list',
    category: <Category extends string>(
      category: Category,
    ): `/masters-list/${Category}` => `/masters-list/${category}`,
    item: <Category extends string, Item extends string>(
      category: Category,
      item: Item,
    ): `/masters-list/${Category}/${Item}` =>
      `/masters-list/${category}/${item}`,
  },
} as const;
