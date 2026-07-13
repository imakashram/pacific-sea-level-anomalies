import { useGetNationRankings } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState, useMemo, useRef } from "react";

const NATION_COLORS: Record<string, string> = {
  AS: "#fb923c", CK: "#f97316", PF: "#fbbf24", NU: "#eab308",
  WS: "#84cc16", TK: "#22c55e", TO: "#10b981", TV: "#14b8a6", WF: "#06b6d4",
  FJ: "#0ea5e9", NC: "#38bdf8", PG: "#818cf8", SB: "#a78bfa", VU: "#c084fc",
  FM: "#f472b6", GU: "#fb7185", KI: "#f43f5e", MH: "#ef4444", NR: "#f97316",
  MP: "#facc15", PW: "#4ade80",
};

function nationColor(code: string, index: number): string {
  if (NATION_COLORS[code]) return NATION_COLORS[code];
  const hue = (index * 360) / 21;
  return `hsl(${hue}, 70%, 60%)`;
}

function buildBumpPath(
  points: { x: number; y: number }[],
): string {
  if (points.length === 0) return "";
  const segments: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]!;
    const p1 = points[i]!;
    const mx = (p1.x - p0.x) * 0.45;
    segments.push(`C ${p0.x + mx} ${p0.y}, ${p1.x - mx} ${p1.y}, ${p1.x} ${p1.y}`);
  }
  return segments.join(" ");
}

const PLOT_LEFT = 50;
const PLOT_RIGHT = 80;
const PLOT_TOP = 20;
const PLOT_BOTTOM = 36;
const SVG_H = 560;
const LABEL_W = 100;

export function ChapterRankBump() {
  const { data, isLoading } = useGetNationRankings();
  const [hovered, setHovered] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { years, nations, sortedByFinal } = useMemo(() => {
    if (!data) return { years: [], nations: [], sortedByFinal: [] };
    const sortedByFinal = [...data.nations].sort(
      (a, b) => (b.finalRank ?? 0) - (a.finalRank ?? 0)
    );
    return { years: data.years, nations: data.nations, sortedByFinal };
  }, [data]);

  const plotH = SVG_H - PLOT_TOP - PLOT_BOTTOM;
  const maxRank = nations.length || 21;

  function xPos(yearIdx: number, svgW: number): number {
    const plotW = svgW - PLOT_LEFT - PLOT_RIGHT - LABEL_W;
    return PLOT_LEFT + (yearIdx / Math.max(years.length - 1, 1)) * plotW;
  }

  function yPos(rank: number): number {
    return PLOT_TOP + ((maxRank - rank) / Math.max(maxRank - 1, 1)) * plotH;
  }

  const SVG_W = 860;
  const plotW = SVG_W - PLOT_LEFT - PLOT_RIGHT - LABEL_W;

  const hoveredNation = hovered ? nations.find((n) => n.code === hovered) : null;
  const hoveredFinalRank = hoveredNation?.finalRank ?? null;

  return (
    <StorySection id="chapter-rank-bump">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">The Rankings Race</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Every year, 21 nations are ranked by how far their sea levels have risen above the
          1993 baseline. Rank 21 means highest anomaly. Some nations lock into the top — others
          climb, fall, and recover. Hover any line to isolate a nation's 31-year journey.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 italic">
          Rank 21 = highest sea level anomaly that year. Lines connect each nation's rank across 1993–2023.
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[560px] bg-card/20 animate-pulse rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <svg
              ref={svgRef}
              width={SVG_W + LABEL_W}
              height={SVG_H}
              style={{ fontFamily: "inherit", display: "block" }}
            >
              {[1, 5, 10, 15, 21].map((rank) => (
                <g key={rank}>
                  <line
                    x1={PLOT_LEFT}
                    x2={SVG_W - PLOT_RIGHT}
                    y1={yPos(rank)}
                    y2={yPos(rank)}
                    stroke="hsl(var(--border))"
                    strokeWidth={rank === 21 || rank === 1 ? 1 : 0.5}
                    strokeDasharray={rank === 21 || rank === 1 ? "0" : "3 3"}
                    opacity={0.4}
                  />
                  <text
                    x={PLOT_LEFT - 8}
                    y={yPos(rank) + 4}
                    textAnchor="end"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={9}
                    opacity={0.6}
                  >
                    {rank}
                  </text>
                </g>
              ))}

              {years.filter((_, i) => i % 5 === 0).map((yr, i) => (
                <text
                  key={yr}
                  x={xPos(years.indexOf(yr), SVG_W)}
                  y={SVG_H - 6}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={10}
                  opacity={0.7}
                >
                  {yr}
                </text>
              ))}

              {nations.map((nation, idx) => {
                const color = nationColor(nation.code, idx);
                const isHov = hovered === nation.code;
                const isOther = hovered !== null && !isHov;
                const opacity = isHov ? 1 : isOther ? 0.05 : 0.25;
                const strokeW = isHov ? 3 : 1.5;

                const points = nation.ranks
                  .map((rank, i) =>
                    rank !== null
                      ? { x: xPos(i, SVG_W), y: yPos(rank) }
                      : null
                  )
                  .filter((p): p is { x: number; y: number } => p !== null);

                const pathD = buildBumpPath(points);

                return (
                  <path
                    key={nation.code}
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={opacity}
                    style={{ cursor: "pointer", transition: "opacity 0.15s, stroke-width 0.15s" }}
                    onMouseEnter={() => setHovered(nation.code)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}

              {sortedByFinal.map((nation, i) => {
                const color = nationColor(nation.code, nations.indexOf(nation));
                const isHov = hovered === nation.code;
                const isOther = hovered !== null && !isHov;
                const rank = nation.finalRank ?? 1;
                const y = yPos(rank);
                const x = SVG_W - PLOT_RIGHT + 6;

                return (
                  <g
                    key={nation.code}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(nation.code)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <circle
                      cx={SVG_W - PLOT_RIGHT}
                      cy={y}
                      r={isHov ? 5 : 3}
                      fill={color}
                      opacity={isOther ? 0.1 : 1}
                      style={{ transition: "opacity 0.15s, r 0.1s" }}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      fill={color}
                      fontSize={isHov ? 11 : 9}
                      fontWeight={isHov ? 700 : 400}
                      opacity={isOther ? 0.1 : 1}
                      style={{ transition: "opacity 0.15s" }}
                    >
                      {nation.code}
                    </text>
                  </g>
                );
              })}

              <text
                x={PLOT_LEFT + plotW / 2}
                y={SVG_H - 20}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={9}
                opacity={0.5}
              >
                Year
              </text>
              <text
                x={14}
                y={PLOT_TOP + plotH / 2}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={9}
                opacity={0.5}
                transform={`rotate(-90, 14, ${PLOT_TOP + plotH / 2})`}
              >
                Rank (21 = highest anomaly)
              </text>
            </svg>
          </div>

          {hovered && hoveredNation ? (
            <div className="mt-4 p-4 bg-card/40 border border-border/50 rounded-xl flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ background: nationColor(hoveredNation.code, nations.indexOf(hoveredNation)), display: "inline-block" }}
                />
                <span className="font-bold text-foreground">{hoveredNation.country}</span>
                <span className="text-muted-foreground text-sm">({hoveredNation.code})</span>
              </div>
              <div className="text-sm text-muted-foreground">
                2023 rank: <span className="font-mono font-bold text-foreground">{hoveredNation.finalRank} / {maxRank}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Rank volatility (σ): <span className="font-mono font-bold text-foreground">{hoveredNation.rankVolatility}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                1993 rank: <span className="font-mono text-foreground">{hoveredNation.ranks[0] ?? "—"}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Rank change: <span className={`font-mono font-bold ${(hoveredNation.finalRank ?? 0) - (hoveredNation.ranks[0] ?? 0) > 0 ? "text-red-400" : "text-green-400"}`}>
                  {(hoveredNation.finalRank ?? 0) - (hoveredNation.ranks[0] ?? 0) > 0 ? "+" : ""}{(hoveredNation.finalRank ?? 0) - (hoveredNation.ranks[0] ?? 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-card/20 border border-border/30 rounded-xl text-sm text-muted-foreground/60 italic">
              Hover a line to see that nation's ranking history
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
            {sortedByFinal.slice(0, 4).map((n) => (
              <div
                key={n.code}
                className="p-4 bg-card/30 border border-border/50 rounded-xl cursor-pointer hover:bg-card/50 transition-colors"
                onMouseEnter={() => setHovered(n.code)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: nationColor(n.code, nations.indexOf(n)) }}
                >
                  {n.code} · Rank {n.finalRank}
                </div>
                <div className="text-sm font-medium text-foreground">{n.country}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  σ = {n.rankVolatility} · was #{n.ranks[0] ?? "—"} in 1993
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Most top-ranked nations stay at the top.</span>{" "}
              Low rank volatility in the permanent leaders — Palau, Guam, Marshall Islands — shows
              these nations don't just experience more sea level rise, they have been consistently
              above all others for the entire 31-year record. Meanwhile nations with high rank
              volatility are most exposed to ENSO swings, temporarily retreating then surging back.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
