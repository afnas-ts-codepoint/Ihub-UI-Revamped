import { describe, expect, it } from 'vitest';
import {
  filterWorkAreaMappings,
  onTimePercentage,
  overallPerformance,
  saveWorkAreaMapping,
  timeUsedProgress,
} from './sla';
import {
  SLA_LEVELS,
  SLA_PERFORMANCE,
  WORK_AREA_MAPPINGS,
} from '../data/sla.mock';

describe('SLA prototype calculations', () => {
  it('calculates rendered one-decimal on-time values and the zero boundary', () => {
    expect(onTimePercentage(SLA_PERFORMANCE.P1)).toBe(100);
    expect(onTimePercentage(SLA_PERFORMANCE.P2)).toBe(93);
    expect(onTimePercentage(SLA_PERFORMANCE.P3)).toBe(92.8);
    expect(onTimePercentage(SLA_PERFORMANCE.P4)).toBe(93.8);
    expect(onTimePercentage({ onTime: 0, workOrders: 0 })).toBe(0);
    expect(overallPerformance(SLA_LEVELS, SLA_PERFORMANCE)).toEqual({
      onTime: 295,
      percentage: 93.4,
      workOrders: 316,
    });
  });
  it('ports hour/day conversion, rounding, and progress bounds', () => {
    expect(timeUsedProgress('24 hrs', '19 hrs')).toMatchObject({
      percentage: 79,
      fillPercentage: 79,
      over: false,
    });
    expect(timeUsedProgress('2 hrs', '8 hrs')).toMatchObject({
      percentage: 400,
      fillPercentage: 100,
      ratio: 150,
      over: true,
    });
    expect(timeUsedProgress('7 days', '2 days')).toMatchObject({
      agreed: 168,
      used: 48,
      percentage: 29,
    });
    expect(timeUsedProgress('0 hrs', '2 hrs')).toMatchObject({
      percentage: 0,
      fillPercentage: 0,
      over: true,
    });
  });
});

describe('work-area prototype rules', () => {
  const valid = {
    area: ' New area ',
    conditional: ' condition ',
    priorities: ['P2'] as const,
    resolution: ' 24 hrs ',
    response: ' 1 hr ',
  };
  it('keeps a missing Area save as a silent no-op', () => {
    const result = saveWorkAreaMapping(WORK_AREA_MAPPINGS, null, {
      ...valid,
      area: '   ',
      priorities: [...valid.priorities],
    });
    expect(result).toBe(WORK_AREA_MAPPINGS);
  });
  it('defaults an empty priority to P3 and trims values', () => {
    const result = saveWorkAreaMapping(WORK_AREA_MAPPINGS, null, {
      ...valid,
      priorities: [],
    });
    expect(result.at(-1)).toMatchObject({
      area: 'New area',
      priorities: ['P3'],
      response: '1 hr',
      resolution: '24 hrs',
      conditional: 'condition',
    });
  });
  it('edits while preserving the existing id and count', () => {
    const existing = WORK_AREA_MAPPINGS[0];
    const result = saveWorkAreaMapping(WORK_AREA_MAPPINGS, existing.id, {
      ...valid,
      priorities: [...valid.priorities],
    });
    expect(result).toHaveLength(WORK_AREA_MAPPINGS.length);
    expect(result[0]).toMatchObject({
      id: existing.id,
      area: 'New area',
      priorities: ['P2'],
    });
  });
  it('searches Area and triggers only, case-insensitively, with priority filtering', () => {
    expect(
      filterWorkAreaMappings(WORK_AREA_MAPPINGS, 'SHATTERED', 'all'),
    ).toHaveLength(1);
    expect(
      filterWorkAreaMappings(WORK_AREA_MAPPINGS, 'within 15', 'all'),
    ).toHaveLength(0);
    expect(filterWorkAreaMappings(WORK_AREA_MAPPINGS, '', 'P4')).toHaveLength(
      1,
    );
  });
});
