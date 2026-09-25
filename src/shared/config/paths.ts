export const paths = {
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
