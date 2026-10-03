import { create } from 'zustand';

export type TrackSeverity = 'critical' | 'high' | 'low' | 'medium';

/** A record another feature asks Home to track (the argument of `window.__ihubTrack`). */
export type TrackRecord = Readonly<{
  by?: string;
  detail?: string;
  id: string;
  location?: string;
  severity?: TrackSeverity;
  title: string;
}>;

type TrackingState = {
  /** Requests waiting for the Home tracker to take them. */
  pending: readonly TrackRecord[];
  /** Hands the pending requests over and empties the queue. */
  drain: () => readonly TrackRecord[];
  reset: () => void;
  track: (record: TrackRecord) => void;
};

/**
 * Cross-feature "Track this item" hand-off (incidents → Home tracker). It is
 * not persisted, like the prototype's `window.__ihubTrack`, which only existed
 * while the Home dashboard was mounted: the Home layout drains the queue and
 * discards it on unmount.
 * @prototype index.html:L8729 caller, L14274-L14290 handler
 */
export const useTrackingStore = create<TrackingState>()((set, get) => ({
  drain: () => {
    const { pending } = get();
    if (pending.length) set({ pending: [] });
    return pending;
  },
  pending: [],
  reset: () => {
    set({ pending: [] });
  },
  track: (record) => {
    set((state) => ({ pending: [...state.pending, record] }));
  },
}));
