"use client";

type Point = { label: string; value: number; max?: number };

export function RadarChart({ data, size = 320 }: { data: Point[]; size?: number }) {
  const center = size / 2;
  const radius = size * 0.32;
  const points = data.map((item, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const ratio = Math.max(0, Math.min(1, item.value / (item.max ?? 20)));
    const labelRadius = radius + 32;
    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio,
      labelX: center + Math.cos(angle) * labelRadius,
      labelY: center + Math.sin(angle) * labelRadius,
      angle,
      ...item
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label="雷达图">
      {[0.25, 0.5, 0.75, 1].map((ratio) => {
        const ring = data
          .map((_, index) => {
            const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
            return `${center + Math.cos(angle) * radius * ratio},${center + Math.sin(angle) * radius * ratio}`;
          })
          .join(" ");
        return <polygon key={ratio} points={ring} fill="none" stroke="rgba(148,163,184,.35)" strokeWidth="1" />;
      })}
      {data.map((_, index) => {
        const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
        return <line key={index} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="rgba(148,163,184,.35)" />;
      })}
      <polygon points={polygon} fill="rgba(34,211,238,.28)" stroke="#22d3ee" strokeWidth="3" />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4" fill="#34d399" />
          <text
            x={point.labelX}
            y={point.labelY}
            textAnchor={getTextAnchor(point.labelX, center)}
            dominantBaseline="middle"
            className="fill-slate-700 text-[10px] font-semibold"
          >
            {splitLabel(point.label).map((line, index) => (
              <tspan key={line} x={point.labelX} dy={index === 0 ? 0 : 13}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}
    </svg>
  );
}

function getTextAnchor(x: number, center: number) {
  if (x > center + 60) return "end";
  if (x < center - 60) return "start";
  return "middle";
}

function splitLabel(label: string) {
  if (label.length <= 4) return [label];
  return [label.slice(0, 4), label.slice(4)];
}
