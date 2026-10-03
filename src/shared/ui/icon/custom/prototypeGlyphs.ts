import { createLucideIcon } from 'lucide-react';

/** The prototype's lightning `bolt` (Lucide's `Bolt` is a hex nut). @prototype index.html:L924 `I.bolt` */
export const PrototypeBolt = createLucideIcon('prototype-bolt', [
  ['path', { d: 'M13 2L4 14h7l-1 8 9-12h-7z', key: 'bolt' }],
]);

/** The prototype's plus-like `pin`. @prototype index.html:L934 `I.pin` */
export const PrototypePin = createLucideIcon('prototype-pin', [
  ['path', { d: 'M12 2v8', key: 'head' }],
  ['path', { d: 'M5 10h14l-2 4H7z', key: 'plate' }],
  ['path', { d: 'M12 14v8', key: 'stem' }],
]);
