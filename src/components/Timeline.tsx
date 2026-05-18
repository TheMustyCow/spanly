import React, { useMemo, useState, useRef } from 'react';
import type { SeasonRange } from '../types';
import './Timeline.css';


interface TimelineProps {
  ranges: SeasonRange[];
}

const DAY_WIDTH = 36; // px — generous so day numbers are crisp and bars are readable

/* ---------- date helpers ---------- */
function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}


export const Timeline: React.FC<TimelineProps> = ({ ranges }) => {
  const enabled = ranges.filter((r) => r.enabled);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: '' });

  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showTooltip(text: string, e: React.MouseEvent) {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => {
      setTooltip({ visible: true, x: e.clientX, y: e.clientY - 12, text });
    }, 300);
  }

  function moveTooltip(e: React.MouseEvent) {
    setTooltip((prev) =>
      prev.visible ? { ...prev, x: e.clientX, y: e.clientY - 12 } : prev
    );
  }

  function hideTooltip() {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip((prev) => ({ ...prev, visible: false }));
  }

  const {
    timelineStart,
    trackWidth,
    monthBlocks,
    dayNumbers,
    gridLines,
  } = useMemo(() => {
    if (enabled.length === 0) {
      return {
        timelineStart: null as Date | null,
        totalDays: 0,
        trackWidth: 0,
        monthBlocks: [] as { name: string; startIndex: number; dayCount: number }[],
        dayNumbers: [] as { num: number; index: number }[],
        gridLines: [] as { index: number; isWeek: boolean; isMonth: boolean }[],
      };
    }

    // Collect all sub-range dates across all enabled entries
    const allSubRanges = enabled.flatMap((r) => r.ranges);
    const starts = allSubRanges.map((sr) => parseDate(sr.startDate));
    const ends = allSubRanges.map((sr) => parseDate(sr.endDate));

    let min = new Date(Math.min(...starts.map((d) => d.getTime())));
    let max = new Date(Math.max(...ends.map((d) => d.getTime())));

    // Padding: at least 3 days or 5% of span so bars don't touch the edge
    const rawSpan = daysBetween(min, max);
    const pad = Math.max(3, Math.round(rawSpan * 0.05));
    min = addDays(min, -pad);
    max = addDays(max, pad);

    // Inclusive day count
    const total = Math.max(1, Math.round(daysBetween(min, max)) + 1);
    const trackWidth = total * DAY_WIDTH;

    // Month blocks
    const months: { name: string; startIndex: number; dayCount: number }[] = [];
    let currentMonth = -1;
    let currentYear = -1;
    let groupStart = 0;

    for (let i = 0; i < total; i++) {
      const d = addDays(min, i);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
        if (currentMonth !== -1) {
          months.push({
            name: formatMonth(addDays(min, groupStart)),
            startIndex: groupStart,
            dayCount: i - groupStart,
          });
        }
        currentMonth = d.getMonth();
        currentYear = d.getFullYear();
        groupStart = i;
      }
    }
    // last group
    months.push({
      name: formatMonth(addDays(min, groupStart)),
      startIndex: groupStart,
      dayCount: total - groupStart,
    });

    // Day numbers and grid lines (one per day boundary, so total + 1 lines)
    const days: { num: number; index: number }[] = [];
    const lines: { index: number; isWeek: boolean; isMonth: boolean }[] = [];
    for (let i = 0; i <= total; i++) {
      const d = addDays(min, i);
      if (i < total) {
        days.push({ num: d.getDate(), index: i });
      }
      lines.push({
        index: i,
        isWeek: d.getDay() === 0,
        isMonth: d.getDate() === 1,
      });
    }

    return { timelineStart: min, trackWidth, monthBlocks: months, dayNumbers: days, gridLines: lines };
  }, [enabled]);

  if (enabled.length === 0 || !timelineStart) {
    return (
      <div className="timeline-card empty">
        <p className="empty-text">No ranges enabled. Check the boxes below to view them on the timeline.</p>
      </div>
    );
  }

  const contentWidth = 180 + trackWidth;

  return (
    <div className="timeline-card">
      <div className="timeline-scroll-wrapper">
        <div className="timeline-content" style={{ width: `${contentWidth}px` }}>
          {/* Sticky header */}
          <div className="tl-sticky-header">
            <div className="tl-header-labels">
                <div className="tl-corner tl-corner-top">Range</div>
              <div className="tl-corner" />
            </div>
            <div className="tl-header-track" style={{ width: `${trackWidth}px` }}>
              {/* Month row */}
              <div className="tl-months">
                {monthBlocks.map((m, i) => (
                  <div
                    key={i}
                    className="tl-month-block"
                    style={{
                      left: `${m.startIndex * DAY_WIDTH}px`,
                      width: `${m.dayCount * DAY_WIDTH}px`,
                    }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>
              {/* Day numbers row */}
              <div className="tl-days">
                {dayNumbers.map((d) => (
                  <div
                    key={d.index}
                    className="tl-day-cell"
                    style={{
                      left: `${d.index * DAY_WIDTH}px`,
                      width: `${DAY_WIDTH}px`,
                    }}
                  >
                    {d.num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body rows */}
          <div className="tl-body">
            {enabled.map((s, idx) => {
              return (
                <div
                  key={s.id}
                  className={`tl-range-row ${idx % 2 === 0 ? 'even' : 'odd'}`}
                >
                  <div className="tl-row-label">
                    <span className="tl-dot" style={{ backgroundColor: s.color }} />
                    <span className="tl-row-name">{s.name}</span>
                    {s.category && (
                      <span className="tl-row-category"></span>
                    )}
                  </div>
                  <div className="tl-row-track" style={{ width: `${trackWidth}px` }}>
                    {/* vertical grid lines */}
                    {gridLines.map((line) => (
                      <div
                        key={line.index}
                        className={`tl-vline ${line.isMonth ? 'month' : ''} ${line.isWeek ? 'week' : ''}`}
                        style={{ left: `${line.index * DAY_WIDTH}px` }}
                      />
                    ))}
                    {/* bars — one per sub-range */}
                    {s.ranges.map((sr) => {
                      const start = parseDate(sr.startDate);
                      const end = parseDate(sr.endDate);
                      const offsetDays = daysBetween(timelineStart, start);
                      const durationDays = daysBetween(start, end) + 1; // inclusive

                      // const tooltipText = `${s.name} — ${sr.label}: ${formatShortDate(sr.startDate)} – ${formatShortDate(sr.endDate)} (${durationDays} days)`;
                      const tooltipText = `${s.name} — ${sr.label}: ${durationDays} days`;

                      return (
                        <div
                          key={sr.id}
                          className="tl-bar"
                          style={{
                            left: `${offsetDays * DAY_WIDTH}px`,
                            width: `${durationDays * DAY_WIDTH}px`,
                            backgroundColor: s.color,
                          }}
                          onMouseEnter={(e) => showTooltip(tooltipText, e)}
                          onMouseMove={moveTooltip}
                          onMouseLeave={hideTooltip}
                        >
                          {sr.label && (
                            <span className="tl-bar-label">{sr.label} - {s.category}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom tooltip */}
      {tooltip.visible && (
        <div
          className="tl-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
