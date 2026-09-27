import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { initializeI18n } from '@/shared/i18n/i18n';

import { AttachmentList } from './AttachmentList';
import type { PoAttachmentFile } from '../types/purchasing.types';

beforeAll(async () => initializeI18n('en'));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Harness({ initial }: Readonly<{ initial: readonly PoAttachmentFile[] }>) {
  const [files, setFiles] = useState(initial);
  return (
    <AttachmentList
      files={files}
      onAdd={(added) => { setFiles((current) => [...current, ...added]); }}
      onCaptionChange={(index, caption) => {
        setFiles((current) => current.map((file, itemIndex) => (itemIndex === index ? { ...file, caption } : file)));
      }}
      onRemove={(index) => { setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index)); }}
    />
  );
}

describe('AttachmentList', () => {
  it('renders no rows and only the file picker when empty', () => {
    render(<Harness initial={[]} />);
    expect(screen.queryByPlaceholderText('Caption (required)…')).toBeNull();
    expect(screen.getByText('Click to upload or drag and drop')).toBeVisible();
    expect(screen.getByText('Each attachment requires a caption')).toBeVisible();
  });

  it('renders an untitled-file fallback when a name is empty', () => {
    render(<Harness initial={[{ caption: '', name: '' }]} />);
    expect(screen.getByText('Untitled file')).toBeVisible();
  });

  it('marks a missing caption with the bad-tone border, live on every render', () => {
    render(<Harness initial={[{ caption: '', name: 'quote.pdf' }]} />);
    const captionInput = screen.getByPlaceholderText('Caption (required)…');
    expect(captionInput.parentElement).toHaveClass('border-bad');
    expect(captionInput.parentElement).not.toHaveClass('border-line');
  });

  it('clears the bad-tone border once a caption is entered, and restores it when cleared again', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[{ caption: '', name: 'quote.pdf' }]} />);
    const captionInput = screen.getByPlaceholderText('Caption (required)…');

    await user.type(captionInput, 'Vendor quotation');
    expect(captionInput.parentElement).toHaveClass('border-line');
    expect(captionInput.parentElement).not.toHaveClass('border-bad');

    await user.clear(captionInput);
    expect(captionInput.parentElement).toHaveClass('border-bad');
  });

  it('treats a whitespace-only caption as missing', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[{ caption: '', name: 'quote.pdf' }]} />);
    const captionInput = screen.getByPlaceholderText('Caption (required)…');
    await user.type(captionInput, '   ');
    expect(captionInput.parentElement).toHaveClass('border-bad');
  });

  it('adds a picked file with a blank caption, appended after existing rows (order preserved)', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial={[{ caption: 'Already captioned', name: 'first.pdf' }]} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'second.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    const rowNames = screen.getAllByText(/\.pdf$/).map((node) => node.textContent);
    expect(rowNames).toEqual(['first.pdf', 'second.pdf']);
    const captions = screen.getAllByPlaceholderText('Caption (required)…');
    expect(captions[1]).toHaveValue('');
  });

  it('supports selecting multiple files at once', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial={[]} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('multiple');

    await user.upload(fileInput, [
      new File(['a'], 'a.pdf', { type: 'application/pdf' }),
      new File(['b'], 'b.pdf', { type: 'application/pdf' }),
    ]);

    expect(screen.getByText('a.pdf')).toBeVisible();
    expect(screen.getByText('b.pdf')).toBeVisible();
  });

  it('removes a row via its remove control, leaving the others in order', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initial={[
          { caption: 'One', name: 'a.pdf' },
          { caption: 'Two', name: 'b.pdf' },
        ]}
      />,
    );
    const rowA = screen.getByText('a.pdf').closest('div') as HTMLElement;
    await user.click(within(rowA).getByRole('button'));

    expect(screen.queryByText('a.pdf')).toBeNull();
    expect(screen.getByText('b.pdf')).toBeVisible();
  });

  it('has no drag-and-drop handlers on the file-picker label (dead copy text only)', () => {
    const { container } = render(<Harness initial={[]} />);
    const label = container.querySelector('label') as HTMLLabelElement;
    expect(label.ondrop).toBeNull();
    expect(label.ondragover).toBeNull();
    expect(label.ondragenter).toBeNull();
  });
});
