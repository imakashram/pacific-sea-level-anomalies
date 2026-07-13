import { useGetStartEndComparison } from "@workspace/api-client-react";
import { useRef, useState } from "react";

const REGION_COLORS: Record<string, { line: string; dot93: string; dot23: string; label: string }> = {
  Micronesia: { line: "#38bdf8", dot93: "#0c4a6e", dot23: "#38bdf8", label: "Micronesia" },
  Polynesia: { line: "#a78bfa", dot93: "#3b0764", dot23: "#a78bfa", label: "Polynesia" },
  Melanesia: { line: "#34d399", dot93: "#064e3b", dot23: "#34d399", label: "Melanesia" },
};

export function ChapterDumbbellLeap() {
  const { data } = useGetStartEndComparison();
  const [hovered, setHovered] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nations = data?.nations ?? [];
  const avgChange = data?.avgChange ?? 0;

  const PAD_L = 160;
  const PAD_R = 90;
  const PAD_T = 60;
  const PAD_B = 40;
  const ROW_H = 28;
  const SVG_W = 780;
  const SVG_H = PAD_T + nations.length * ROW_H + PAD_B;

  const allVals = nations.flatMap((n) => [n.val1993, n.val2023]);
  const minV = Math.min(...allVals, -0.02);
  const maxV = Math.max(...allVals, 0.22);
  const xScale = (v: number) => PAD_L + ((v - minV) / (maxV - minV)) * (SVG_W - PAD_L - PAD_R);

  const xTicks = [-0.02, 0, 0.04, 0.08, 0.12, 0.16, 0.20];

  return (
    <section
      id="chapter-dumbbell-leap"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-black"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-sky-400 mb-3 uppercase">Analytics · Dumbbell Chart</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            The 30-Year Leap
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Where each nation stood in 1993 — and where it ended up in 2023. The gap is the leap. 
            Nations are sorted by magnitude of change.
          </p>
        </div>

        <div className="flex gap-6 justify-center mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white/30 border border-white/50 inline-block" />
            <span className="text-white/50">1993 baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />
            <span className="text-white/60">2023 value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white/30" />
            <span className="text-white/50">30-year range</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="mx-auto block"
          >
            {xTicks.map((v) => {
              const x = xScale(v);
              return (
                <g key={v}>
                  <line x1={x} y1={PAD_T - 10} x2={x} y2={SVG_H - PAD_B} stroke="#ffffff12" strokeWidth={1} />
                  <text x={x} y={PAD_T - 15} textAnchor="middle" fill="#ffffff60" fontSize={10} fontFamily="monospace">
                    {v >= 0 ? `+${(v * 100).toFixed(0)}` : (v * 100).toFixed(0)}cm
                  </text>
                </g>
              );
            })}

            <line
              x1={xScale(0)} y1={PAD_T - 10} x2={xScale(0)} y2={SVG_H - PAD_B}
              stroke="#ffffff30" strokeWidth={1.5} strokeDasharray="4 3"
            />

            {nations.map((n, i) => {
              const y = PAD_T + i * ROW_H + ROW_H / 2;
              const x93 = xScale(n.val1993);
              const x23 = xScale(n.val2023);
              const col = REGION_COLORS[n.region] ?? REGION_COLORS.Polynesia;
              const isHovered = hovered === n.code;
              const changed = n.change >= 0;

              return (
                <g
                  key={n.code}
                  onMouseEnter={() => setHovered(n.code)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect x={0} y={y - ROW_H / 2} width={SVG_W} height={ROW_H}
                    fill={isHovered ? "#ffffff08" : "transparent"} />

                  <text x={PAD_L - 10} y={y + 4} textAnchor="end" fill={isHovered ? "#fff" : "#ffffff90"}
                    fontSize={11} fontFamily="monospace" fontWeight={isHovered ? "bold" : "normal"}>
                    {n.code}
                  </text>

                  <line
                    x1={x93} y1={y} x2={x23} y2={y}
                    stroke={isHovered ? col.line : col.line + "80"}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />

                  <circle cx={x93} cy={y} r={isHovered ? 5 : 3.5}
                    fill={isHovered ? "#fff" : "#ffffff50"} stroke={col.dot93} strokeWidth={1.5} />

                  <circle cx={x23} cy={y} r={isHovered ? 6 : 4}
                    fill={isHovered ? col.line : col.dot23}
                    stroke={isHovered ? "#fff" : "none"} strokeWidth={1.5} />

                  {isHovered && (
                    <g>
                      <text x={x23 + 8} y={y + 4} fill={col.line} fontSize={10} fontFamily="monospace">
                        {changed ? "+" : ""}{(n.change * 100).toFixed(1)}cm
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            <line
              x1={xScale(avgChange + (nations[0]?.val1993 ?? 0))} y1={PAD_T - 10}
              x2={xScale(avgChange + (nations[0]?.val1993 ?? 0))} y2={SVG_H - PAD_B}
              stroke="#f59e0b40" strokeWidth={1} strokeDasharray="2 4"
            />
          </svg>
        </div>

        {hovered && (() => {
          const n = nations.find((x) => x.code === hovered);
          if (!n) return null;
          const col = REGION_COLORS[n.region] ?? REGION_COLORS.Polynesia;
          return (
            <div className="mt-4 mx-auto max-w-md bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-center">
              <p className="font-mono text-white font-bold text-base mb-1">{n.country}</p>
              <p className="text-white/50 text-xs mb-3" style={{ color: col.line }}>{n.region}</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">1993</p>
                  <p className="text-white font-mono font-bold">{(n.val1993 * 100).toFixed(1)}cm</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">2023</p>
                  <p className="font-mono font-bold" style={{ color: col.line }}>{(n.val2023 * 100).toFixed(1)}cm</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Change</p>
                  <p className={`font-mono font-bold ${n.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {n.change >= 0 ? "+" : ""}{(n.change * 100).toFixed(1)}cm
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-3 gap-4 mt-8">
          {Object.entries(REGION_COLORS).map(([region, col]) => {
            const regionNations = nations.filter((n) => n.region === region);
            const avgRise = regionNations.length
              ? regionNations.reduce((s, n) => s + n.change, 0) / regionNations.length
              : 0;
            return (
              <div key={region} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: col.line }}>{region}</p>
                <p className="text-2xl font-mono font-bold text-white">
                  {avgRise >= 0 ? "+" : ""}{(avgRise * 100).toFixed(1)}cm
                </p>
                <p className="text-white/40 text-xs mt-1">avg 30-yr change</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
