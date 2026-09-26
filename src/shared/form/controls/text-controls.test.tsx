import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TextArea } from './TextArea';
import { TextInput } from './TextInput';
afterEach(cleanup);
describe('shared text controls', () => {
  it('preserves native labels, disabled state, and inherited RTL', () => {
    const nameLabel = 'Name';
    const notesLabel = 'Notes';
    render(
      <div dir="rtl">
        <label htmlFor="name">{nameLabel}</label>
        <TextInput disabled id="name" />
        <label htmlFor="notes">{notesLabel}</label>
        <TextArea id="notes" />
      </div>,
    );
    expect(screen.getByLabelText(nameLabel)).toBeDisabled();
    expect(screen.getByLabelText(notesLabel)).toBeInstanceOf(
      HTMLTextAreaElement,
    );
    expect(
      screen.getByLabelText(notesLabel).closest('[dir="rtl"]'),
    ).not.toBeNull();
  });
});
