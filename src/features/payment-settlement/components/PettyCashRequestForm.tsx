import { PettyCashFormBase } from './PettyCashFormBase';

/**
 * Exported for Home (M10.1). Create mode only: the prototype's
 * `review`/`resubmit`/`verify`/`onDecision` branches (index.html:L7813-L7822,
 * L7826-L7827) are never passed by any caller — `PettyCashScreen` renders
 * `PettyCashRequestCreate` with `locale` alone and the Home drawer embeds the
 * whole `PettyCashScreen` — so they are dead source and not ported (human
 * decision, M6.7 Option A). Whether M10.1 needs them is an open question for
 * that phase.
 * @prototype index.html:L7744-L7828 `PettyCashRequestCreate`
 */
export function PettyCashRequestForm() {
  return <PettyCashFormBase variant="request" />;
}
