import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;     // 0–100+ (utilization %)
  height?: number;   // px, default 8
  showLabel?: boolean;
}

function barColor(value: number): string {
  if (value >= 100) return 'bg-danger';
  if (value >= 80) return 'bg-warning';
  return 'bg-success';
}

export default function ProgressBar({ value, height = 8, showLabel = false }: Props) {
  const [width, setWidth] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const raf = requestAnimationFrame(() => setWidth(Math.min(value, 100)));
      return () => cancelAnimationFrame(raf);
    }
  }, [value]);

  useEffect(() => {
    setWidth(Math.min(value, 100));
  }, [value]);

  return (
    <div className="w-full">
      <div
        className="w-full rounded-full overflow-hidden bg-border"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor(value)}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs mt-1 font-medium ${value >= 100 ? 'text-danger' : value >= 80 ? 'text-warning' : 'text-success'}`}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
