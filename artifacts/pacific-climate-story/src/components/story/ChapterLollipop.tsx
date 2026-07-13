import { useGetAnnualDeviation } from "@workspace/api-client-react";
import { useState } from "react";

const ENSO_COLORS = {
  "el-nino": { line: "#f97316", dot: "#ea580c", label: "El Niño", bg: "#f9731620" },
  "la-nina": { line: "#38bdf8", dot: "#0284c7", label: "La Niña", bg: "#38bdf820" },
  neutral: { line: "#ffffff60", dot: "#ffffff90", label: "Neutral", bg: "#ffffff08" },
};

export function ChapterLollipop() {
  const { data } = useGetAnnualDeviation();
  const [hovered, setHovered] = useState<number | null>(null);

  const deviations = data?.deviations ?? [];
  const mean30yr = data?.mean30yr ?? 0;
  const maxDev = data?.maxDeviation ?? 0.01;
  const minDev = data?.minDeviation ?? -0.01;

  const PAD_L = 48;
  const PAD_R = 24;
  const PAD_T = 50;
  const PAD_B = 50;
  const SVG_W = 760;
  const SVG_H = 380;
  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  const n = deviations.length;
  const absMax = Math.max(Math.abs(maxDev), Math.abs(minDev)) * 1.15;

  const midY = PAD_T + PLOT_H / 2;
  const xOf = (i: number) => PAD_L + (i / (n - 1)) * PLOT_W;
  const yOf = (dev: number) => midY - (dev / absMax) * (PLOT_H / 2);

  const barW = Math.max(4, (PLOT_W / n) * 0.55);

  const yTicks = [-0.04, -0.02, 0, 0.02, 0.04].filter(
    (v) => Math.abs(v) <= absMax * 1.05
  );

  const hoveredEntry = hovered !== null ? deviations[hovered] : null;

  return (
    <section
      id="chapter-lollipop"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-black"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-amber-400 mb-3 uppercase">
            Analytics · Lollipop Chart
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Above &amp; Below the Mean
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Each stick is one year's Pacific-wide average — how far above or
            below the 30-year grand mean it sits. El Niño years (orange) dip
            below; La Niña years (blue) push far above. The rising floor tells
            the real story.
          </p>
        </div>

        <div className="flex gap-6 justify-center mb-6 text-sm">
          {Object.entries(ENSO_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: val.dot }}
              />
              <span style={{ color: val.dot }}>{val.label}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <svg
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="mx-auto block"
          >
            {yTicks.map((v) => {
              const y = yOf(v);
              return (
                <g key={v}>
                  <line
                    x1={PAD_L} y1={y} x2={SVG_W - PAD_R} y2={y}
                    stroke={v === 0 ? "#ffffff35" : "#ffffff12"}
                    strokeWidth={v === 0 ? 1.5 : 1}
                    strokeDasharray={v === 0 ? "none" : "3 4"}
                  />
                  <text
                    x={PAD_L - 6} y={y + 4}
                    textAnchor="end" fill="#ffffff50" fontSize={9} fontFamily="monospace"
                  >
                    {v >= 0 ? `+${(v * 100).toFixed(0)}` : (v * 100).toFixed(0)}cm
                  </text>
                </g>
              );
            })}

            <text
              x={PAD_L + PLOT_W / 2} y={midY - 6}
              textAnchor="middle" fill="#ffffff25" fontSize={9} fontFamily="monospace"
            >
              30-yr mean ({(mean30yr * 100).toFixed(2)}cm)
            </text>

            {deviations.map((d, i) => {
              const x = xOf(i);
              const y = yOf(d.deviation);
              const col = ENSO_COLORS[d.enso as keyof typeof ENSO_COLORS] ?? ENSO_COLORS.neutral;
              const isUp = d.deviation >= 0;
              const isHovered = hovered === i;

              return (
                <g
                  key={d.year}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x - barW / 2 - 4} y={Math.min(y, midY) - 4}
                    width={barW + 8} height={Math.abs(midY - y) + 8}
                    fill={isHovered ? col.bg : "transparent"}
                    rx={3}
                  />

                  <line
                    x1={x} y1={midY}
                    x2={x} y2={y}
                    stroke={col.line}
                    strokeWidth={isHovered ? barW : barW * 0.7}
                    strokeOpacity={isHovered ? 0.9 : 0.65}
                    strokeLinecap="round"
                  />

                  <circle
                    cx={x} cy={y}
                    r={isHovered ? 6 : 4}
                    fill={col.dot}
                    stroke={isHovered ? "#fff" : "none"}
                    strokeWidth={1.5}
                  />

                  {(d.year % 5 === 0 || d.year === 1993 || d.year === 2023) && !isHovered && (
                    <text
                      x={x} y={PAD_T + PLOT_H + 18}
                      textAnchor="middle" fill="#ffffff50" fontSize={9} fontFamily="monospace"
                    >
                      {d.year}
                    </text>
                  )}

                  {isHovered && (
                    <text
                      x={x}
                      y={isUp ? y - 12 : y + 16}
                      textAnchor="middle"
                      fill={col.dot}
                      fontSize={10}
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {d.deviation >= 0 ? "+" : ""}{(d.deviation * 100).toFixed(1)}cm
                    </text>
                  )}
                </g>
              );
            })}

            <text
              x={PAD_L - 6} y={PAD_T - 10}
              textAnchor="middle" fill="#ffffff40" fontSize={9} fontFamily="monospace"
            >↑ above</text>
            <text
              x={PAD_L - 6} y={PAD_T + PLOT_H + 10}
              textAnchor="middle" fill="#ffffff40" fontSize={9} fontFamily="monospace"
            >↓ below</text>
          </svg>
        </div>

        {hoveredEntry ? (
          <div className="mt-4 mx-auto max-w-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="font-mono font-bold text-2xl text-white mb-1">{hoveredEntry.year}</p>
            <p
              className="text-sm font-mono font-bold mb-2"
              style={{ color: ENSO_COLORS[hoveredEntry.enso as keyof typeof ENSO_COLORS]?.dot }}
            >
              {ENSO_COLORS[hoveredEntry.enso as keyof typeof ENSO_COLORS]?.label} year
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Pacific avg</p>
                <p className="text-white font-mono font-bold text-lg">
                  +{(hoveredEntry.avg * 100).toFixed(2)}cm
                </p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">vs mean</p>
                <p
                  className="font-mono font-bold text-lg"
                  style={{ color: ENSO_COLORS[hoveredEntry.enso as keyof typeof ENSO_COLORS]?.dot }}
                >
                  {hoveredEntry.deviation >= 0 ? "+" : ""}{(hoveredEntry.deviation * 100).toFixed(2)}cm
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {(["el-nino", "la-nina", "neutral"] as const).map((type) => {
              const years = deviations.filter((d) => d.enso === type);
              const avgDev = years.length
                ? years.reduce((s, d) => s + d.deviation, 0) / years.length
                : 0;
              const col = ENSO_COLORS[type];
              return (
                <div key={type} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: col.dot }}>
                    {col.label}
                  </p>
                  <p className="text-2xl font-mono font-bold text-white">{years.length} yrs</p>
                  <p className="text-xs font-mono mt-1" style={{ color: col.dot }}>
                    avg {avgDev >= 0 ? "+" : ""}{(avgDev * 100).toFixed(2)}cm
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
