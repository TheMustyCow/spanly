import React from 'react';
import type { SeasonRange } from '../types';
import './SummaryCard.css';

interface SummaryCardProps {
  ranges: SeasonRange[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ ranges }) => {
  const enabledRanges = ranges.filter((r) => r.enabled);
  const total = ranges.length;
  const active = enabledRanges.length;

  let earliest: string | null = null;
  let latest: string | null = null;

  function parseDate(str: string): Date {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  if (enabledRanges.length > 0) {
    const starts = enabledRanges.map((r) => parseDate(r.startDate));
    const ends = enabledRanges.map((r) => parseDate(r.endDate));
    const minDate = new Date(Math.min(...starts.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...ends.map((d) => d.getTime())));
    earliest = minDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    latest = maxDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="summary-card">
      <h3>Overview</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-value">{total}</span>
          <span className="summary-label">Total Ranges</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{active}</span>
          <span className="summary-label">Enabled</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{earliest ?? '—'}</span>
          <span className="summary-label">Earliest Start</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{latest ?? '—'}</span>
          <span className="summary-label">Latest End</span>
        </div>
      </div>
    </div>
  );
};
