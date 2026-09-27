import { describe, expect, it } from 'vitest';

import { retainCompatibleZones, zonesForLocations } from './zonesForLocation';
import { AA_ZONES, aaZonesFor } from '../data/seedRows';

describe('location to zone cascade', () => {
  const expected = {
    '360 MALL': ['FnB FUNTIKI - 360', 'Events and Parties-360', 'VR by Fun Tiki', 'FnB BowlRoom - 360'],
    'AlKout Mall': ['PIXEL RUN - Al Kout'],
    'KHIRAN MALL': ['WONDERZONE-Al Khiran', 'Jump -Al Khiran'],
    MANGAF: ['Production Room'],
    Offsite: ['The Court - Offsite', 'Fun Tiki - Offsite', 'Jump - Offsite', 'Sky Zone - Offsite', 'Wonder Zone - Offsite', 'Make - Offsite'],
    'WAREHOUSE MALL': ['FUNTIKI-WAREHOUSE'],
  } as const;

  it('returns the full fixture set without a location', () => {
    expect(aaZonesFor(undefined)).toEqual(AA_ZONES);
  });

  it('returns the exact prototype zone fixture for every location', () => {
    for (const [location, zones] of Object.entries(expected)) {
      expect(aaZonesFor(location)).toEqual(zones);
    }
  });

  it('deduplicates multi-location unions', () => {
    expect(zonesForLocations(['KHIRAN MALL', 'KHIRAN MALL'])).toEqual([
      'WONDERZONE-Al Khiran',
      'Jump -Al Khiran',
    ]);
  });

  it('drops already-selected zones that become incompatible', () => {
    expect(
      retainCompatibleZones(
        ['MANGAF'],
        ['Production Room', 'VR by Fun Tiki'],
      ),
    ).toEqual(['Production Room']);
  });
});
