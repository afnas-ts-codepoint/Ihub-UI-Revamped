export type JsonParseResult<T> =
  | { ok: true; value: T }
  | { ok: false };

/** Parses `raw` as JSON, reporting failure instead of throwing. */
export function parseJson<T = unknown>(raw: string): JsonParseResult<T> {
  try {
    return { ok: true, value: JSON.parse(raw) as T };
  } catch {
    return { ok: false };
  }
}

/** Serializes `value` as pretty-printed JSON, matching `JSON.stringify(value, null, 2)`. */
export function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function jsonBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(toJson(value));
}
