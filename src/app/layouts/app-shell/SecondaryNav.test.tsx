import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SecondaryNav } from '@/app/layouts/app-shell/SecondaryNav';
import type { NavNode } from '@/app/navigation/types';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => {
  await initializeI18n('en');
});

afterEach(() => {
  cleanup();
});

function node(
  id: string,
  labelKey: string,
  children?: readonly NavNode[],
): NavNode {
  return { children, id, labelKey, path: `/${id}` };
}

describe('SecondaryNav', () => {
  it.each(['dashboard', 'masters'])('is hidden for %s routes', (id) => {
    const { container } = render(
      <SecondaryNav
        activeTrail={[node(id, 'navigation.dashboard')]}
        onNavigate={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('uses underline treatment for both Masters List levels', () => {
    const item = node(
      'masters-list/admin/project-category-master',
      'masters.items.project-category-master',
    );
    const category = node(
      'masters-list/admin',
      'masters.categories.admin',
      [item],
    );
    const root = node('masters-list', 'masters.listTitle', [category]);

    render(
      <SecondaryNav
        activeTrail={[root, category, item]}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Admin' })).toHaveClass(
      'border-b-2',
    );
    expect(
      screen.getByRole('button', { name: 'Project Category Master' }),
    ).toHaveClass('border-b-2');
  });

  it('renders L3 segmented and L4 link treatments and routes selections', () => {
    const onNavigate = vi.fn();
    const leaf = node('root/group/sub/leaf', 'navigation.overtime_overtime_verify');
    const sub = node('root/group/sub', 'navigation.overtime_overtime', [leaf]);
    const group = node('root/group', 'navigation.overtime', [sub]);
    const root = node('root', 'navigation.overtime', [group]);

    render(
      <SecondaryNav
        activeTrail={[root, group, sub, leaf]}
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByRole('button', { name: 'Overtime' })).toHaveClass(
      'rounded-compact',
    );
    const verify = screen.getByRole('button', { name: 'Verify' });
    expect(verify).toHaveClass('data-[active=true]:underline-offset-4');
    fireEvent.click(verify);
    expect(onNavigate).toHaveBeenCalledWith(leaf);
  });
});
