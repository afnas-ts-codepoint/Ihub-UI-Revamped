import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';

describe('App', () => {
  it('renders an empty root', () => {
    const { container } = render(<App />);

    expect(container).toBeEmptyDOMElement();
  });
});
