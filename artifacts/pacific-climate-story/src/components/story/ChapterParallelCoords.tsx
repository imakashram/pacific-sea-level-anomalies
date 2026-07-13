import { useGetNationMetrics } from "@workspace/api-client-react";
import { useRef, useState } from "react";

const REGION_COLORS: Record<string, string> = {
  Micronesia: "#38bdf8",
  Polynesia: "#a78bfa",
  Melanesia: "#34d399",
};

type AxisKey = "totalRise" | "ensoSensitivity" | "volatility" | "acceleration" | "finalRank";
const AXIS_KEYS: AxisKey[] = ["totalRise", "ensoSensitivity", "volatility", "acceleration", "finalRank"];
const AXIS_LABELS: Record<AxisKey, string> = {
  totalRise: "Total Rise",
  ensoSensitivity: "ENSO Sensitivity",
  volatility: "Volatility σ",
  acceleration: "Acceleration",
  finalRank: "2023 Rank",
};
const AXIS_UNITS: Record<AxisKey, string> = {
  totalRise: "m",
  ensoSensitivity: "m",
  volatility: "m",
  acceleration: "m",
  finalRank: "",
};

export function ChapterParallelCoords() {
  const { data } = useGetNationMetrics();
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nations = data?.nations ?? [];
  const axes = data?.axes ?? [];

  const PAD_L = 20;
  const PAD_R = 20;
  const PAD_T = 60;
  const PAD_B = 50;
  const SVG_W = 760;
  const SVG_H = 400;
  const AXIS_H = SVG_H - PAD_T - PAD_B;

  const axisXs = AXIS_KEYS.map((_, i) =>
    PAD_L + (i / (AXIS_KEYS.length - 1)) * (SVG_W - PAD_L - PAD_R)
  );

  const yPos = (axisKey: AxisKey, nation: typeof nations[0]) => {
    const normVal = nation.normalized[axisKey] ?? 0;
    return PAD_T + (1 - normVal) * AXIS_H;
  };

  const makePath = (nation: typeof nations[0]) => {
    const points = AXIS_KEYS.map((key, i) => ({
      x: axisXs[i],
      y: yPos(key, nation),
    }));
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const filteredNations = filter ? nations.filter((n) => n.region === filter) : nations;
  const backgroundNations = filter ? nations.filter((n) => n.region !== filter) : [];

  const hoveredNation = nations.find((n) => n.code === hovered);
  const ax = axes.find((a) => a.key === "totalRise");
  const fmt = (key: AxisKey, raw: number) => {
    if (key === "finalRank") return `#${Math.round(raw)}`;
    return `${raw >= 0 ? "+" : ""}${(raw * 100).toFixed(1)}cm`;
  };

  return (
    <section
      id="chapter-parallel-coords"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-black"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-emerald-400 mb-3 uppercase">Analytics · Parallel Coordinates</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Five Dimensions at Once
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Each line is a nation. Each vertical axis is a different metric. Lines that stay parallel across 
            all axes reveal nations with correlated profiles — rising fast <em>and</em> volatile <em>and</em> ENSO-driven.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
              !filter ? "bg-white text-black" : "bg-white/10 text-white/50 hover:bg-white/20"
            }`}
          >
            All regions
          </button>
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <button
              key={region}
              onClick={() => setFilter(filter === region ? null : region)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all border ${
                filter === region ? "text-white" : "bg-white/10 text-white/50 hover:bg-white/20 border-transparent"
              }`}
              style={filter === region ? { backgroundColor: color + "40", borderColor: color } : {}}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="mx-auto block"
          >
            {backgroundNations.map((nation) => (
              <path
                key={`bg-${nation.code}`}
                d={makePath(nation)}
                fill="none"
                stroke="#ffffff08"
                strokeWidth={1}
              />
            ))}

            {filteredNations.map((nation) => {
              const color = REGION_COLORS[nation.region] ?? "#888";
              const isHovered = hovered === nation.code;
              return (
                <path
                  key={nation.code}
                  d={makePath(nation)}
                  fill="none"
                  stroke={isHovered ? "#fff" : color}
                  strokeWidth={isHovered ? 2.5 : 1}
                  strokeOpacity={isHovered ? 1 : hovered ? 0.2 : 0.55}
                  style={{ cursor: "pointer", transition: "stroke-opacity 0.15s, stroke-width 0.1s" }}
                  onMouseEnter={() => setHovered(nation.code)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {AXIS_KEYS.map((key, i) => {
              const ax = axes.find((a) => a.key === key);
              const x = axisXs[i];
              const ticks = [0, 0.25, 0.5, 0.75, 1.0];
              return (
                <g key={key}>
                  <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + AXIS_H} stroke="#ffffff40" strokeWidth={1.5} />

                  {ticks.map((t) => {
                    const y = PAD_T + (1 - t) * AXIS_H;
                    const rawVal = ax ? ax.min + t * (ax.max - ax.min) : t;
                    return (
                      <g key={t}>
                        <line x1={x - 3} y1={y} x2={x + 3} y2={y} stroke="#ffffff40" strokeWidth={1} />
                        {t === 0 || t === 1 ? (
                          <text x={x} y={y + (t === 1 ? -4 : 12)} textAnchor="middle"
                            fill="#ffffff50" fontSize={8} fontFamily="monospace">
                            {fmt(key, rawVal)}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}

                  <text x={x} y={PAD_T - 22} textAnchor="middle" fill="#ffffffcc"
                    fontSize={11} fontFamily="monospace" fontWeight="bold">
                    {AXIS_LABELS[key]}
                  </text>
                  <text x={x} y={PAD_T - 10} textAnchor="middle" fill="#ffffff50"
                    fontSize={8} fontFamily="monospace">
                    {key === "finalRank" ? "1=lowest · 21=highest" : "↑ higher = more extreme"}
                  </text>
                </g>
              );
            })}

            {filteredNations.map((nation) => {
              const isHovered = hovered === nation.code;
              if (!isHovered) return null;
              const color = REGION_COLORS[nation.region] ?? "#888";
              return AXIS_KEYS.map((key, i) => (
                <circle
                  key={`dot-${nation.code}-${key}`}
                  cx={axisXs[i]}
                  cy={yPos(key, nation)}
                  r={4}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              ));
            })}
          </svg>
        </div>

        {hoveredNation ? (
          <div className="mt-4 mx-auto max-w-2xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-center font-mono font-bold text-white mb-3">
              {hoveredNation.country}
              <span className="ml-2 text-xs font-normal" style={{ color: REGION_COLORS[hoveredNation.region] }}>
                {hoveredNation.region}
              </span>
            </p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {AXIS_KEYS.map((key) => {
                const rawVal = hoveredNation[key as keyof typeof hoveredNation] as number;
                return (
                  <div key={key} className="bg-white/5 rounded-lg p-2">
                    <p className="text-white/40 text-xs font-mono leading-tight mb-1">{AXIS_LABELS[key]}</p>
                    <p className="text-white font-mono font-bold text-sm">{fmt(key, rawVal)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-white/30 text-sm mt-4 font-mono">hover a line to identify a nation</p>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          {Object.entries(REGION_COLORS).map(([region, color]) => {
            const regionNations = nations.filter((n) => n.region === region);
            const avgRise = regionNations.length ? regionNations.reduce((s, n) => s + n.totalRise, 0) / regionNations.length : 0;
            const avgVolatility = regionNations.length ? regionNations.reduce((s, n) => s + n.volatility, 0) / regionNations.length : 0;
            return (
              <div key={region} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-white/20"
                style={filter === region ? { borderColor: color + "60", backgroundColor: color + "10" } : {}}
                onClick={() => setFilter(filter === region ? null : region)}>
                <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color }}>{region}</p>
                <p className="text-lg font-mono font-bold text-white">{(avgRise * 100).toFixed(1)}cm</p>
                <p className="text-white/40 text-xs mt-0.5">avg rise</p>
                <p className="text-sm font-mono text-white/70 mt-2">σ {(avgVolatility * 100).toFixed(1)}cm</p>
                <p className="text-white/40 text-xs">avg volatility</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
