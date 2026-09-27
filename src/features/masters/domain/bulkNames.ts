export type BulkNameKind = 'projectCategory' | 'subArea';
export type BulkNameValue = boolean | number | string | null | undefined;

const HEADER_WORDS: Readonly<Record<BulkNameKind, readonly string[]>> = {
  projectCategory: ['name', 'names', 'category name', 'project category', 'project category master'],
  subArea: ['sub area', 'sub areas', 'subarea', 'subareas', 'name', 'names'],
};

/** Prototype CSV behavior: flatten comma, semicolon and line delimiters. */
export function namesFromDelimitedText(text: string) {
  return text.split(/[\r\n,;]+/).map((value) => value.replace(/^"|"$/g, ''));
}

/** Spreadsheet behavior: only column zero of the first sheet contributes. */
export function namesFromSpreadsheet(rows: readonly (readonly unknown[])[]) {
  return rows.map((row): BulkNameValue => {
    const value = row.length ? row[0] : '';
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value == null
      ? value
      : '';
  });
}

/** Trim, drop blanks and strip one recognized first value as the header. */
export function cleanBulkNames(values: readonly BulkNameValue[], kind: BulkNameKind) {
  const names = values
    .map((value) => String(value == null ? '' : value).trim())
    .filter(Boolean);

  if (names.length && HEADER_WORDS[kind].includes(names[0]?.toLowerCase() ?? '')) {
    names.shift();
  }

  return names;
}

/**
 * Keep non-blank editable rows first, append the cleaned import, then perform
 * the prototype's exact, case-sensitive, stable de-duplication.
 */
export function mergeBulkNames(existing: readonly string[], imported: readonly string[]) {
  return [...existing.filter((value) => value.trim()), ...imported]
    .filter((value, index, all) => all.indexOf(value) === index);
}
