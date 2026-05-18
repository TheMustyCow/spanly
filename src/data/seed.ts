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
    name: 'Team Retreat A',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    category: 'Internal',
    color: '#0ea5e9',
    enabled: true,
  },
  {
    id: '2',
    name: 'Client Project Alpha',
    startDate: '2026-11-15',
    endDate: '2026-11-30',
    category: 'Client',
    color: '#f59e0b',
    enabled: true,
  },
  {
    id: '3',
    name: 'Q4 Planning Cycle',
    startDate: '2026-10-26',
    endDate: '2026-11-03',
    category: 'Planning',
    color: '#10b981',
    enabled: true,
  },
  {
    id: '4',
    name: 'Holiday Coverage',
    startDate: '2026-08-15',
    endDate: '2026-11-30',
    category: 'Operations',
    color: '#8b5cf6',
    enabled: true,
  },
  {
    id: '5',
    name: 'Spring Outreach',
    startDate: '2026-04-15',
    endDate: '2026-05-31',
    category: 'Marketing',
    color: '#ef4444',
    enabled: true,
  },
];
