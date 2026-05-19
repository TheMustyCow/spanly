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

export const CATEGORIES = [
  'Archery',
  'Modern Firearm',
  'Muzzleloader',
  'Youth',
  'General',
];

export function getNextColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export const SEED_DATA: SeasonRange[] = [];
