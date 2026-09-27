import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { homeBannerData } from '../../data/home.mock';
import { deriveHomeCounts } from '../../domain/homeCounts';
import { initializeI18n } from '@/shared/i18n/i18n';
import { HERO_ADVANCE_MS, HeroCarousel } from './HeroCarousel';

beforeAll(async () => initializeI18n('en'));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderCarousel() {
  return render(
    <HeroCarousel
      actions={homeBannerData.actions}
      counts={deriveHomeCounts(homeBannerData)}
      incidents={homeBannerData.incidents}
    >
      <span>{'Profile slide'}</span>
    </HeroCarousel>,
  );
}

function activeSlide(index: number) {
  return screen.getByTestId(`hero-slide-${String(index)}`);
}

describe('HeroCarousel', () => {
  it('starts on the status slide, advances every 6 seconds, and wraps', () => {
    vi.useFakeTimers();
    renderCarousel();
    expect(activeSlide(0)).toHaveAttribute('data-active', 'true');

    for (let index = 1; index <= 4; index += 1) {
      act(() => {
        vi.advanceTimersByTime(HERO_ADVANCE_MS);
      });
      expect(activeSlide(index % 4)).toHaveAttribute('data-active', 'true');
    }
  });

  it('supports the next control and direct slide dots', () => {
    vi.useFakeTimers();
    renderCarousel();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(activeSlide(1)).toHaveAttribute('data-active', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Slide 4' }));
    expect(activeSlide(3)).toHaveAttribute('data-active', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(activeSlide(0)).toHaveAttribute('data-active', 'true');
  });

  it('pauses on hover and resumes after the pointer leaves', () => {
    vi.useFakeTimers();
    renderCarousel();
    const carousel = screen.getByTestId('hero-carousel');
    fireEvent.mouseEnter(carousel);
    act(() => {
      vi.advanceTimersByTime(HERO_ADVANCE_MS * 2);
    });
    expect(activeSlide(0)).toHaveAttribute('data-active', 'true');
    fireEvent.mouseLeave(carousel);
    act(() => {
      vi.advanceTimersByTime(HERO_ADVANCE_MS);
    });
    expect(activeSlide(1)).toHaveAttribute('data-active', 'true');
  });

  it('pauses while a control is focused and resumes after blur', () => {
    vi.useFakeTimers();
    renderCarousel();
    const dot = screen.getByRole('button', { name: 'Slide 1' });
    fireEvent.focus(dot);
    act(() => {
      vi.advanceTimersByTime(HERO_ADVANCE_MS * 2);
    });
    expect(activeSlide(0)).toHaveAttribute('data-active', 'true');
    fireEvent.blur(dot);
    act(() => {
      vi.advanceTimersByTime(HERO_ADVANCE_MS);
    });
    expect(activeSlide(1)).toHaveAttribute('data-active', 'true');
  });
});
