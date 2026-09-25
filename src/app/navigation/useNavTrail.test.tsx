import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useNavTrail } from '@/app/navigation/useNavTrail';

describe('useNavTrail', () => {
  it('reads the current route from React Router', () => {
    function Wrapper({ children }: PropsWithChildren) {
      return (
        <MemoryRouter initialEntries={['/hr/overtime/verify']}>
          {children}
        </MemoryRouter>
      );
    }

    const { result } = renderHook(() => useNavTrail(), { wrapper: Wrapper });
    expect(result.current.map((node) => node.id)).toEqual([
      'overtime',
      'overtime/overtime',
      'overtime/overtime/verify',
    ]);
  });
});
