import React from 'react';
import type { SeasonRange } from '../types';
import './SummaryCard.css';

interface SummaryCardProps {
  ranges: SeasonRange[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ ranges }) => {
  const enabledRanges = ranges.filter((r) => r.enabled);
  const total = ranges.length;
  const activeSubRanges = enabledRanges.reduce((sum, r) => sum + r.ranges.length, 0);

  let earliest: string | null = null;
  let latest: string | null = null;

  function parseDate(str: string): Date {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const allSubRanges = enabledRanges.flatMap((r) => r.ranges);
  if (allSubRanges.length > 0) {
    const starts = allSubRanges.map((sr) => parseDate(sr.startDate));
    const ends = allSubRanges.map((sr) => parseDate(sr.endDate));
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
          <span className="summary-label">Total Groups</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{activeSubRanges}</span>
          <span className="summary-label">Active Ranges</span>
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
