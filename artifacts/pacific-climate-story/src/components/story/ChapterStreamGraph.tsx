import { useGetRegionalStreams } from "@workspace/api-client-react";
import { useState } from "react";

type Region = "Micronesia" | "Polynesia" | "Melanesia";

const REGION_COLORS: Record<Region, string> = {
  Micronesia: "#38bdf8",
  Polynesia: "#a78bfa",
  Melanesia: "#34d399",
};

const REGIONS: Region[] = ["Micronesia", "Polynesia", "Melanesia"];

function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function ChapterStreamGraph() {
  const { data } = useGetRegionalStreams();
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; year: number; region: Region; value: number } | null>(null);

  const streams = data?.streams ?? [];

  const PAD_L = 48;
  const PAD_R = 20;
  const PAD_T = 50;
  const PAD_B = 40;
  const SVG_W = 760;
  const SVG_H = 380;
  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  const years = streams.map((s) => s.year);
  const n = streams.length;
  if (n === 0) return null;

  const xOf = (i: number) => PAD_L + (i / (n - 1)) * PLOT_W;

  const maxTotal = Math.max(...streams.map((s) => s.Micronesia + s.Polynesia + s.Melanesia));
  const yScale = PLOT_H / (maxTotal * 1.1);
  const midY = PAD_T + PLOT_H / 2;

  type StackedRow = { lower: number; upper: number };
  const stacked: Array<Record<Region, StackedRow>> = streams.map((s) => {
    const total = s.Micronesia + s.Polynesia + s.Melanesia;
    const baseline = -total / 2;
    let cursor = baseline;
    const row: Partial<Record<Region, StackedRow>> = {};
    for (const region of REGIONS) {
      const v = s[region];
      row[region] = { lower: cursor, upper: cursor + v };
      cursor += v;
    }
    return row as Record<Region, StackedRow>;
  });

  const toSvgY = (v: number) => midY - v * yScale;

  const makeBand = (region: Region) => {
    const topPts = stacked.map((row, i) => ({ x: xOf(i), y: toSvgY(row[region].upper) }));
    const botPts = stacked.map((row, i) => ({ x: xOf(i), y: toSvgY(row[region].lower) })).reverse();
    const topPath = smoothPath(topPts);
    const botPath = smoothPath(botPts).replace(/^M/, "L");
    return topPath + " " + botPath + " Z";
  };

  const xTicks = years.filter((y) => y % 5 === 0 || y === years[0] || y === years[years.length - 1]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const relX = px - PAD_L;
    if (relX < 0 || relX > PLOT_W) { setTooltip(null); return; }
    const frac = relX / PLOT_W;
    const idx = Math.round(frac * (n - 1));
    const row = stacked[idx];
    if (!row) { setTooltip(null); return; }
    const py = e.clientY - rect.top;
    const svgY = py;
    let closestRegion: Region = "Polynesia";
    let closestDist = Infinity;
    for (const region of REGIONS) {
      const midVal = (row[region].upper + row[region].lower) / 2;
      const dist = Math.abs(svgY - toSvgY(midVal));
      if (dist < closestDist) { closestDist = dist; closestRegion = region; }
    }
    const stream = streams[idx];
    if (stream) {
      setTooltip({ x: xOf(idx), y: (e.clientY - rect.top), year: stream.year, region: closestRegion, value: stream[closestRegion] });
      setHoveredRegion(closestRegion);
    }
  };

  return (
    <section
      id="chapter-stream-graph"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-black"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-sky-400 mb-3 uppercase">
            Analytics · Stream Graph
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Tides of Three Worlds
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            30 years of sea level rise, seen as three flowing rivers — one
            per geographic region. The width of each stream at any year reflects
            that region's average anomaly. Watch how the streams swell together
            after 2012.
          </p>
        </div>

        <div className="flex gap-6 justify-center mb-6">
          {REGIONS.map((region) => (
            <button
              key={region}
              className={`flex items-center gap-2 text-sm font-mono transition-all ${
                hoveredRegion === region ? "opacity-100" : hoveredRegion ? "opacity-40" : "opacity-80"
              }`}
              onMouseEnter={() => setHoveredRegion(region)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: REGION_COLORS[region] }}
              />
              <span style={{ color: REGION_COLORS[region] }}>{region}</span>
            </button>
          ))}
        </div>

        <div className="relative overflow-x-auto">
          <svg
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="mx-auto block cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setTooltip(null); setHoveredRegion(null); }}
          >
            {REGIONS.map((region) => (
              <path
                key={region}
                d={makeBand(region)}
                fill={REGION_COLORS[region]}
                fillOpacity={hoveredRegion === null ? 0.75 : hoveredRegion === region ? 0.9 : 0.2}
                stroke={REGION_COLORS[region]}
                strokeWidth={0.5}
                strokeOpacity={0.4}
                style={{ transition: "fill-opacity 0.2s" }}
              />
            ))}

            <line
              x1={PAD_L} y1={midY} x2={SVG_W - PAD_R} y2={midY}
              stroke="#ffffff20" strokeWidth={1} strokeDasharray="4 3"
            />

            {xTicks.map((yr) => {
              const i = years.indexOf(yr);
              const x = xOf(i);
              return (
                <g key={yr}>
                  <line x1={x} y1={PAD_T + PLOT_H + 4} x2={x} y2={PAD_T + PLOT_H + 10}
                    stroke="#ffffff40" strokeWidth={1} />
                  <text x={x} y={PAD_T + PLOT_H + 22} textAnchor="middle"
                    fill="#ffffff60" fontSize={10} fontFamily="monospace">{yr}</text>
                </g>
              );
            })}

            <text x={PAD_L - 6} y={PAD_T - 10} textAnchor="middle"
              fill="#ffffff40" fontSize={9} fontFamily="monospace">cm</text>

            {[-0.08, -0.04, 0, 0.04, 0.08].map((v) => {
              const y = toSvgY(v);
              if (y < PAD_T || y > PAD_T + PLOT_H) return null;
              return (
                <g key={v}>
                  <line x1={PAD_L - 4} y1={y} x2={PAD_L} y2={y}
                    stroke="#ffffff30" strokeWidth={1} />
                  <text x={PAD_L - 6} y={y + 4} textAnchor="end"
                    fill="#ffffff40" fontSize={9} fontFamily="monospace">
                    {v >= 0 ? `+${(v * 100).toFixed(0)}` : (v * 100).toFixed(0)}
                  </text>
                </g>
              );
            })}

            {tooltip && (
              <>
                <line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + PLOT_H}
                  stroke="#ffffff30" strokeWidth={1} strokeDasharray="3 3" />
                <circle cx={tooltip.x} cy={tooltip.y} r={4}
                  fill={REGION_COLORS[tooltip.region]} stroke="#fff" strokeWidth={1.5} />
              </>
            )}
          </svg>
        </div>

        {tooltip ? (
          <div className="mt-4 mx-auto max-w-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="font-mono font-bold text-xl text-white">{tooltip.year}</p>
            <p className="text-sm mt-1" style={{ color: REGION_COLORS[tooltip.region] }}>
              {tooltip.region}
            </p>
            <p className="font-mono font-bold text-2xl mt-1" style={{ color: REGION_COLORS[tooltip.region] }}>
              {tooltip.value >= 0 ? "+" : ""}{(tooltip.value * 100).toFixed(1)}cm
            </p>
            <p className="text-white/40 text-xs mt-1">mean anomaly</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {REGIONS.map((region) => {
              const last = streams[streams.length - 1];
              const first = streams[0];
              const change = last && first ? last[region] - first[region] : 0;
              return (
                <div key={region} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: REGION_COLORS[region] }}>
                    {region}
                  </p>
                  <p className="text-2xl font-mono font-bold text-white">
                    {last ? `+${(last[region] * 100).toFixed(1)}cm` : "—"}
                  </p>
                  <p className="text-white/40 text-xs mt-1">2023 avg anomaly</p>
                  <p className="text-xs font-mono mt-1" style={{ color: change >= 0 ? "#34d399" : "#f87171" }}>
                    {change >= 0 ? "▲" : "▼"} {Math.abs(change * 100).toFixed(1)}cm since 1993
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
