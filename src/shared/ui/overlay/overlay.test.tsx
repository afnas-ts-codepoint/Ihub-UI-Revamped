import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/overlay/Dialog';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/DropdownMenu';

afterEach(cleanup);

const labels = {
  dialogAction: 'Focusable action',
  dialogDescription: 'Example description',
  dialogTitle: 'Example dialog',
  dialogTrigger: 'Open dialog',
  menuItem: 'First action',
  menuTrigger: 'Open menu',
} as const;

describe('M3.1 overlay primitives', () => {
  it('closes a dialog with Escape and restores trigger focus', async () => {
    const user = userEvent.setup();
    render(
      <DialogRoot>
        <DialogTrigger>{labels.dialogTrigger}</DialogTrigger>
        <DialogContent>
          <DialogTitle>{labels.dialogTitle}</DialogTitle>
          <DialogDescription>{labels.dialogDescription}</DialogDescription>
          <button type="button">{labels.dialogAction}</button>
        </DialogContent>
      </DialogRoot>,
    );
    const trigger = screen.getByRole('button', { name: labels.dialogTrigger });

    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('supports keyboard selection and Escape focus restoration in a menu', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenuRoot>
        <DropdownMenuTrigger>{labels.menuTrigger}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>{labels.menuItem}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>,
    );
    const trigger = screen.getByRole('button', { name: labels.menuTrigger });

    await user.click(trigger);
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('menuitem', { name: labels.menuItem }),
    ).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
