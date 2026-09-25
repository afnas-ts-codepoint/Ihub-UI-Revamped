import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeLocale } from '@/shared/i18n/i18n';
import { getLocalizedText } from '@/shared/i18n/localized';
import { Icon } from '@/shared/ui/icon/Icon';

import { navSearch, type NavSearchEntry } from './navSearch';
import { createNavSearchIndex } from './navSearchIndex';

type CommandSearchProps = Readonly<{
  onSelect: (path: string) => void;
}>;

/** @prototype index.html:L3171-L3183 SearchHighlight */
function SearchHighlight({
  query,
  text,
}: Readonly<{ query: string; text: string }>) {
  const search = query.trim();
  const index = search ? text.toLowerCase().indexOf(search.toLowerCase()) : -1;

  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[3px] bg-accent-dim p-0 font-semibold text-accent">
        {text.slice(index, index + search.length)}
      </mark>
      {text.slice(index + search.length)}
    </>
  );
}

/** @prototype index.html:L3184-L3335 SearchBox */
export function CommandSearch({ onSelect }: CommandSearchProps) {
  const { i18n, t } = useTranslation('common');
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const index = useMemo(() => createNavSearchIndex(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => navSearch(index, query), [index, query]);
  const showResults = isOpen && query.trim().length > 0;

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [close, isOpen]);

  useEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>(
      '[data-highlighted="true"]',
    );
    selected?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const select = (entry: NavSearchEntry | undefined) => {
    if (!entry) return;
    close();
    onSelect(entry.path);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex(
        (current) => (current - 1 + results.length) % results.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(results[highlightedIndex]);
    }
  };

  return (
    <div
      className="relative h-[38px] w-[38px] shrink-0 max-tablet:hidden"
      ref={wrapperRef}
    >
      {isOpen ? (
        <div className="absolute end-0 top-0 z-10 flex h-[38px] w-[248px] items-center gap-2 rounded-lg border border-line-strong bg-raised px-3 text-base text-fg-2 shadow-menu">
          <Icon name="search" size={18} />
          <input
            aria-autocomplete="list"
            aria-controls="command-search-results"
            aria-expanded={showResults}
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-fg outline-none"
            onBlur={() => {
              if (!query) setIsOpen(false);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t('topBar.search.placeholder')}
            ref={inputRef}
            role="combobox"
            value={query}
          />
          <span className="rounded-compact border border-line-strong bg-inset px-1.5 py-0.5 text-xs text-fg-3">
            {t('topBar.search.shortcut')}
          </span>
        </div>
      ) : (
        <button
          aria-label={t('topBar.search.title')}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-line-strong bg-raised text-fg-2 hover:bg-pressed hover:text-fg"
          onClick={() => {
            setIsOpen(true);
          }}
          title={t('topBar.search.title')}
          type="button"
        >
          <Icon name="search" size={18} />
        </button>
      )}

      {showResults ? (
        <div
          className="absolute end-0 top-[calc(100%+8px)] z-[61] w-[340px] max-w-[92vw] overflow-hidden rounded-xl border border-line-strong bg-surface shadow-popover"
          id="command-search-results"
          role="listbox"
        >
          <div className="flex items-center justify-between gap-2.5 px-3.5 pt-2.5 pb-1.5">
            <span className="text-xs font-semibold tracking-wide text-fg-3 uppercase">
              {t('topBar.search.menus')}
            </span>
            <span className="text-xs-plus font-semibold text-fg-4" data-num>
              {results.length}
            </span>
          </div>
          {results.length ? (
            <div
              className="max-h-[360px] overflow-y-auto px-2 pt-0.5 pb-2"
              ref={listRef}
            >
              {results.map((entry, resultIndex) => {
                const isHighlighted = resultIndex === highlightedIndex;
                const label = getLocalizedText(entry.label, locale);
                const trail = entry.trail
                  .map((item) => getLocalizedText(item, locale))
                  .join(' › ');

                return (
                  <button
                    aria-selected={isHighlighted}
                    className="group flex w-full items-center gap-2.5 rounded-lg bg-transparent px-2.5 py-2 text-start text-fg-2 data-[highlighted=true]:bg-raised"
                    data-highlighted={isHighlighted}
                    key={entry.key}
                    onClick={() => {
                      select(entry);
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(resultIndex);
                    }}
                    role="option"
                    type="button"
                  >
                    <span
                      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-inset text-fg-3 data-[highlighted=true]:bg-accent-dim data-[highlighted=true]:text-accent"
                      data-highlighted={isHighlighted}
                    >
                      <Icon name={entry.icon ?? 'grid'} size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block overflow-hidden text-base leading-[1.35] font-medium text-ellipsis whitespace-nowrap text-fg">
                        <SearchHighlight query={query} text={label} />
                      </span>
                      {trail ? (
                        <span className="mt-0.5 block overflow-hidden text-xs-plus text-ellipsis whitespace-nowrap text-fg-3">
                          {trail}
                        </span>
                      ) : null}
                    </span>
                    <Icon
                      className="shrink-0 text-fg-4 opacity-0 group-data-[highlighted=true]:opacity-100 rtl:-scale-x-100"
                      name="arrow-right"
                      size={14}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-base text-fg-4">
              {t('topBar.search.noMatches', { query: query.trim() })}
            </div>
          )}
          {results.length ? (
            <div className="flex items-center gap-3 border-t border-line px-3.5 py-2 text-xs-plus text-fg-3">
              <span>{t('topBar.search.navigateHint')}</span>
              <span>{t('topBar.search.openHint')}</span>
              <span>{t('topBar.search.closeHint')}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
