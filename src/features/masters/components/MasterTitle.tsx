const ARABIC_CHARACTERS = /[؀-ۿ]/;

/**
 * Mirrors the prototype's shared `PageHeader.renderTitle` exactly: it tests
 * the title *string* for Arabic characters, not the active locale, so a
 * Masters title (always English, even in Arabic mode, per the M2.1 fallback
 * decision) keeps its accent-italic final word regardless of locale.
 * @prototype index.html:L3435-L3446
 */
export function MasterTitle({ title }: Readonly<{ title: string }>) {
  if (ARABIC_CHARACTERS.test(title)) return title;

  const words = title.trim().split(' ');
  const finalWord = words.pop();

  if (!finalWord || words.length === 0) return title;

  return (
    <>
      {`${words.join(' ')} `}
      <em className="accent-em">{finalWord}</em>
    </>
  );
}
