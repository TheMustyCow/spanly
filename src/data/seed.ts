import type { SeasonRange } from '../types';

export const DEFAULT_COLORS = [
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

export function getNextColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export const SEED_DATA: SeasonRange[] = [
  {
    id: '1',
    name: 'Archery Deer',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    category: 'Archery',
    color: '#0ea5e9',
    enabled: true,
  },
  {
    id: '2',
    name: 'Modern Firearm Deer',
    startDate: '2026-11-15',
    endDate: '2026-11-30',
    category: 'Firearm',
    color: '#f59e0b',
    enabled: true,
  },
  {
    id: '3',
    name: 'Elk Season',
    startDate: '2026-10-26',
    endDate: '2026-11-03',
    category: 'Firearm',
    color: '#10b981',
    enabled: true,
  },
  {
    id: '4',
    name: 'Bear Season',
    startDate: '2026-08-15',
    endDate: '2026-11-30',
    category: 'General',
    color: '#8b5cf6',
    enabled: true,
  },
  {
    id: '5',
    name: 'Turkey Season',
    startDate: '2026-04-15',
    endDate: '2026-05-31',
    category: 'Shotgun',
    color: '#ef4444',
    enabled: true,
  },
];
