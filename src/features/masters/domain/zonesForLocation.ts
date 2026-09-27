import { aaZonesFor } from '../data/seedRows';

export function zonesForLocations(locations: readonly string[]): string[] {
  const zones: string[] = [];
  for (const location of locations) {
    for (const zone of aaZonesFor(location)) if (!zones.includes(zone)) zones.push(zone);
  }
  return zones;
}

export function retainCompatibleZones(
  locations: readonly string[],
  zones: readonly string[],
): string[] {
  const allowed = zonesForLocations(locations);
  return zones.filter((zone) => allowed.includes(zone));
}
