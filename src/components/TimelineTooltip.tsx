import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';

export interface TimelineTooltipHandle {
  show: (text: string, x: number, y: number) => void;
  move: (x: number, y: number) => void;
  hide: () => void;
}

// Keep tooltip updates out of the timeline's render path.
export function TimelineTooltip({ ref }: { ref: Ref<TimelineTooltipHandle> }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = useRef(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useImperativeHandle(ref, () => ({
    show(text, x, y) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        visible.current = true;
        setTooltip({ visible: true, x, y: y - 12, text });
      }, 300);
    },
    move(x, y) {
      if (visible.current) setTooltip((prev) => ({ ...prev, x, y: y - 12 }));
    },
    hide() {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      if (visible.current) {
        visible.current = false;
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    },
  }), []);

  if (!tooltip.visible) return null;
  return (
    <div
      className="tl-tooltip"
      role="tooltip"
      style={{
        left: `clamp(132px, ${tooltip.x}px, calc(100vw - 132px))`,
        top: `${tooltip.y}px`,
      }}
    >
      {tooltip.text}
    </div>
  );
}
