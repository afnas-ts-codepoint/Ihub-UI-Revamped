import { useSearchParams } from 'react-router';

export function useSearchParamState<const Value extends string>(
  key: string,
  allowed: readonly Value[],
  fallback: Value,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawValue = searchParams.get(key);
  const value = allowed.includes(rawValue as Value)
    ? (rawValue as Value)
    : fallback;

  const setValue = (nextValue: Value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextValue === fallback) next.delete(key);
      else next.set(key, nextValue);
      return next;
    });
  };

  return [value, setValue] as const;
}
