import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { SeasonRange } from '../types';
import { TimelineTooltip } from './TimelineTooltip';
import type { TimelineTooltipHandle } from './TimelineTooltip';
import './Timeline.css';


interface TimelineProps {
  ranges: SeasonRange[];
}

const DAY_WIDTH = 36; // px — generous so day numbers are crisp and bars are readable

interface TimelineDay {
  num: number;
  index: number;
  weekday: string;
  fullDate: string;
  isWeekend: boolean;
}

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

function TimelineIndicators({ ranges, timelineStart, scrollRef }: {
  ranges: SeasonRange[];
  timelineStart: Date;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Only the earliest end and latest start can change a row's edge indicators.
  const sections = useMemo(() => ranges.map((range) => ({
    firstEnd: Math.min(...range.ranges.map((section) =>
      (daysBetween(timelineStart, parseDate(section.endDate)) + 1) * DAY_WIDTH)),
    lastStart: Math.max(...range.ranges.map((section) =>
      daysBetween(timelineStart, parseDate(section.startDate)) * DAY_WIDTH)),
  })), [ranges, timelineStart]);
  const [hidden, setHidden] = useState<{ left: boolean; right: boolean }[]>([]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const labels = scroller.querySelector('.tl-header-labels');
    let frame = 0;
    let visibleWidth = 0;
    let previous: { left: boolean; right: boolean }[] = [];

    function update() {
      frame = 0;
      if (!scroller) return;
      const left = scroller.scrollLeft;
      const right = left + visibleWidth;
      // Do not allocate new state or enter React unless a dot actually changes.
      if (sections.every((row, i) =>
        previous[i]?.left === (row.firstEnd <= left) &&
        previous[i]?.right === (row.lastStart >= right)
      )) return;
      const next = sections.map((row) => ({
        left: row.firstEnd <= left,
        right: row.lastStart >= right,
      }));
      previous = next;
      setHidden(next);
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    // Cache geometry on resize instead of requesting layout measurements during a swipe.
    const observer = new ResizeObserver(() => {
      visibleWidth = scroller.clientWidth - (labels?.getBoundingClientRect().width ?? 0);
      scheduleUpdate();
    });
    observer.observe(scroller);
    if (labels) observer.observe(labels);
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener('scroll', scheduleUpdate);
    };
  }, [sections, scrollRef]);

  return (
    <div className="tl-edge-indicators">
      {ranges.map((range, i) => (
        <div key={range.id} className="tl-edge-row" style={{ color: range.color }}>
          {(['left', 'right'] as const).map((direction) => hidden[i]?.[direction] && (
            <span
              key={direction}
              className={`tl-edge-indicator ${direction}`}
              role="img"
              aria-label={`${range.name}: more sections to the ${direction}`}
              title={`More sections to the ${direction}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}


export const Timeline: React.FC<TimelineProps> = ({ ranges }) => {
  const enabled = useMemo(() => ranges.filter((r) => r.enabled), [ranges]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<TimelineTooltipHandle>(null);

  function showTooltip(text: string, e: React.PointerEvent | React.FocusEvent) {
    if ('pointerType' in e) {
      if (e.pointerType !== 'touch') tooltipRef.current?.show(text, e.clientX, e.clientY);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      tooltipRef.current?.show(text, rect.left + rect.width / 2, rect.top);
    }
  }

  function moveTooltip(e: React.PointerEvent) {
    if (e.pointerType !== 'touch') tooltipRef.current?.move(e.clientX, e.clientY);
  }

  function hideTooltip() {
    tooltipRef.current?.hide();
  }

  const {
    timelineStart,
    trackWidth,
    monthBlocks,
    dayNumbers,
    weekOffset,
  } = useMemo(() => {
    if (enabled.length === 0) {
      return {
        timelineStart: null as Date | null,
        totalDays: 0,
        trackWidth: 0,
        monthBlocks: [] as { name: string; startIndex: number; dayCount: number }[],
        dayNumbers: [] as TimelineDay[],
        weekOffset: 0,
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

    // Day numbers; the body grid is painted once with repeating backgrounds.
    const days: TimelineDay[] = [];
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
    const dateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    for (let i = 0; i < total; i++) {
      const d = addDays(min, i);
      days.push({
        num: d.getDate(),
        index: i,
        weekday: weekdayFormatter.format(d),
        fullDate: dateFormatter.format(d),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }

    return { timelineStart: min, trackWidth, monthBlocks: months, dayNumbers: days, weekOffset: ((7 - min.getDay()) % 7) * DAY_WIDTH };
  }, [enabled]);

  if (enabled.length === 0 || !timelineStart) {
    return (
      <div className="timeline-card empty">
        <p className="empty-text">No ranges enabled. Check the boxes below to view them on the timeline.</p>
      </div>
    );
  }

  return (
    <div className="timeline-card">
      <div ref={scrollRef} className="timeline-scroll-wrapper" onScroll={hideTooltip}>
        <div className="timeline-content" style={{ width: `calc(var(--tl-label-width) + ${trackWidth}px)` }}>
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
                    <span className="tl-month-label">{m.name}</span>
                  </div>
                ))}
              </div>
              {/* Day numbers row */}
              <div className="tl-days">
                {dayNumbers.map((d) => (
                  <button
                    key={d.index}
                    type="button"
                    className={`tl-day-cell${d.isWeekend ? ' weekend' : ''}`}
                    aria-label={d.fullDate}
                    style={{
                      left: `${d.index * DAY_WIDTH}px`,
                      width: `${DAY_WIDTH}px`,
                    }}
                    onPointerEnter={(e) => showTooltip(d.weekday, e)}
                    onPointerMove={moveTooltip}
                    onPointerLeave={hideTooltip}
                    onFocus={(e) => showTooltip(d.weekday, e)}
                    onBlur={hideTooltip}
                    onKeyDown={(e) => { if (e.key === 'Escape') hideTooltip(); }}
                  >
                    {d.num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Body rows */}
          <div className="tl-body">
            <div
              className="tl-grid"
              aria-hidden="true"
              style={{
                width: `${trackWidth}px`,
                backgroundSize: `${DAY_WIDTH * 7}px 100%, ${DAY_WIDTH}px 100%`,
                backgroundPosition: `${weekOffset}px 0, 0 0`,
              }}
            >
              {monthBlocks.filter((month) => month.startIndex > 0 || timelineStart.getDate() === 1).map((month) => (
                <div key={month.startIndex} className="tl-vline month" style={{ left: `${month.startIndex * DAY_WIDTH}px` }} />
              ))}
            </div>
            {enabled.map((s, idx) => {
              return (
                <div
                  key={s.id}
                  className={`tl-range-row ${idx % 2 === 0 ? 'even' : 'odd'}`}
                >
                  <div className="tl-row-label">
                    <span className="tl-dot" style={{ backgroundColor: s.color }} />
                    <span className="tl-row-name" title={s.name}>{s.name}</span>
                  </div>
                  <div className="tl-row-track" style={{ width: `${trackWidth}px` }}>
                    {/* bars — one per sub-range */}
                    {s.ranges.map((sr) => {
                      const start = parseDate(sr.startDate);
                      const end = parseDate(sr.endDate);
                      const offsetDays = daysBetween(timelineStart, start);
                      const durationDays = daysBetween(start, end) + 1; // inclusive

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
                          onPointerEnter={(e) => showTooltip(tooltipText, e)}
                          onPointerMove={moveTooltip}
                          onPointerLeave={hideTooltip}
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

      <TimelineIndicators ranges={enabled} timelineStart={timelineStart} scrollRef={scrollRef} />

      <TimelineTooltip ref={tooltipRef} />
    </div>
  );
};
