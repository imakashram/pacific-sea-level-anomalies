import { useGetYoyBudget } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState } from "react";

const ENSO_YEARS: Record<number, string> = {
  1998: "El Niño", 2016: "El Niño",
  2011: "La Niña", 2021: "La Niña",
};

const SVG_W = 820;
const SVG_H = 400;
const PAD_L = 58;
const PAD_R = 24;
const PAD_T = 28;
const PAD_B = 48;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

export function ChapterYoYBudget() {
  const { data, isLoading } = useGetYoyBudget();
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <StorySection id="chapter-yoy-budget">
        <div className="h-[500px] bg-card/20 animate-pulse rounded-xl" />
      </StorySection>
    );
  }

  const entries = data.entries;
  const allTotals = entries.map((e) => e.runningTotal);
  const allSpacers = entries.map((e) => e.spacer);
  const yMin = Math.min(...allSpacers, 0) - 0.005;
  const yMax = Math.max(...allTotals) + 0.008;

  const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;
  const xScale = (i: number) => PAD_L + (i / (entries.length - 1)) * PLOT_W;

  const barW = Math.max(12, PLOT_W / entries.length - 3);
  const zeroY = yScale(0);

  const hoveredEntry = hoveredYear != null ? entries.find((e) => e.year === hoveredYear) : null;

  const gridVals: number[] = [];
  for (let v = 0; v <= yMax + 0.01; v = parseFloat((v + 0.02).toFixed(3))) {
    if (v >= yMin) gridVals.push(v);
  }

  const linePts = entries
    .map((e, i) => `${xScale(i)},${yScale(e.runningTotal)}`)
    .join(" ");

  return (
    <StorySection id="chapter-yoy-budget">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          Every Millimeter Accounted For
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Each bar is one year's contribution to total Pacific sea level rise. Green bars
          pushed the ocean up; red bars — driven by El Niño — temporarily pulled it back.
          The cumulative line shows the running total building inexorably upward.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 italic">
          Bars show year-over-year change in Pacific-wide average sea level anomaly. Line = running total.
          Hover any bar for detail.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <svg
            width={SVG_W}
            height={SVG_H}
            style={{ fontFamily: "inherit", display: "block", cursor: "crosshair" }}
          >
            {gridVals.map((v) => (
              <g key={v}>
                <line
                  x1={PAD_L} x2={SVG_W - PAD_R}
                  y1={yScale(v)} y2={yScale(v)}
                  stroke="hsl(var(--border))"
                  strokeWidth={v === 0 ? 1.5 : 0.5}
                  strokeDasharray={v === 0 ? "0" : "3 3"}
                  opacity={0.45}
                />
                <text
                  x={PAD_L - 6} y={yScale(v) + 4}
                  textAnchor="end"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={9} opacity={0.7}
                >
                  {v === 0 ? "0" : `${(v * 100).toFixed(0)}cm`}
                </text>
              </g>
            ))}

            {entries.map((e, i) => {
              const x = xScale(i);
              const barTop = yScale(e.spacer + e.absChange);
              const barBot = yScale(e.spacer);
              const h = Math.max(1, barBot - barTop);
              const isHov = hoveredYear === e.year;
              const color = e.positive ? (isHov ? "#4ade80" : "#22c55e") : (isHov ? "#f87171" : "#ef4444");
              const enso = ENSO_YEARS[e.year];

              return (
                <g key={e.year}>
                  <rect
                    x={x - barW / 2}
                    y={barTop}
                    width={barW}
                    height={h}
                    fill={color}
                    opacity={isHov ? 1 : 0.75}
                    rx={1.5}
                    style={{ cursor: "pointer", transition: "opacity 0.1s" }}
                    onMouseEnter={() => setHoveredYear(e.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                  />
                  {enso && (
                    <text
                      x={x} y={e.positive ? barTop - 5 : barBot + 11}
                      textAnchor="middle"
                      fill={e.positive ? "#4ade80" : "#f87171"}
                      fontSize={7} fontWeight={700}
                      opacity={0.9}
                    >
                      {enso}
                    </text>
                  )}
                  {i % 5 === 0 && (
                    <text
                      x={x} y={SVG_H - PAD_B + 16}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={10} opacity={0.7}
                    >
                      {e.year}
                    </text>
                  )}
                </g>
              );
            })}

            <polyline
              points={linePts}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              opacity={0.85}
            />
            {entries.map((e, i) => (
              <circle
                key={e.year}
                cx={xScale(i)}
                cy={yScale(e.runningTotal)}
                r={hoveredYear === e.year ? 5 : 2.5}
                fill="hsl(var(--primary))"
                opacity={hoveredYear === e.year ? 1 : 0.7}
                style={{ cursor: "pointer", transition: "r 0.1s" }}
                onMouseEnter={() => setHoveredYear(e.year)}
                onMouseLeave={() => setHoveredYear(null)}
              />
            ))}

            <text
              x={14} y={PAD_T + PLOT_H / 2}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize={9} opacity={0.5}
              transform={`rotate(-90, 14, ${PAD_T + PLOT_H / 2})`}
            >
              Sea Level Anomaly
            </text>
          </svg>
        </div>

        {hoveredEntry ? (
          <div className="mt-3 p-4 bg-card/40 border border-border/50 rounded-xl flex flex-wrap gap-5 items-center text-sm">
            <span className="font-bold text-foreground text-base">{hoveredEntry.year}</span>
            <span className={hoveredEntry.positive ? "text-green-400" : "text-red-400"}>
              {hoveredEntry.positive ? "▲" : "▼"} {hoveredEntry.positive ? "+" : "−"}{(hoveredEntry.absChange * 100).toFixed(2)} cm
            </span>
            <span className="text-muted-foreground">
              Running total: <span className="font-mono text-foreground">+{(hoveredEntry.runningTotal * 100).toFixed(2)} cm</span>
            </span>
            <span className="text-muted-foreground">
              Annual avg anomaly: <span className="font-mono text-foreground">+{(hoveredEntry.avgAnomaly * 100).toFixed(2)} cm</span>
            </span>
            {ENSO_YEARS[hoveredEntry.year] && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {ENSO_YEARS[hoveredEntry.year]} year
              </span>
            )}
          </div>
        ) : (
          <div className="mt-3 p-3 bg-card/20 border border-border/30 rounded-xl text-sm text-muted-foreground/60 italic">
            Hover any bar to see that year's contribution
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Up years</div>
            <div className="text-3xl font-serif font-bold text-green-400">{data.positiveYears}</div>
            <div className="text-xs text-muted-foreground mt-1">Years sea level rose</div>
          </div>
          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Down years</div>
            <div className="text-3xl font-serif font-bold text-red-400">{data.negativeYears}</div>
            <div className="text-xs text-muted-foreground mt-1">Years sea level fell</div>
          </div>
          <div className="p-5 bg-card/30 border border-border/50 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Biggest single gain</div>
            <div className="text-3xl font-serif font-bold text-primary">
              +{(data.biggestGain.absChange * 100).toFixed(1)} cm
            </div>
            <div className="text-xs text-muted-foreground mt-1">{data.biggestGain.year}</div>
          </div>
          <div className="p-5 bg-card/30 border border-border/50 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Biggest single drop</div>
            <div className="text-3xl font-serif font-bold text-red-400">
              −{(data.biggestLoss.absChange * 100).toFixed(1)} cm
            </div>
            <div className="text-xs text-muted-foreground mt-1">{data.biggestLoss.year}</div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-base text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">
              {data.positiveYears} of {data.entries.length} years pushed sea levels higher.
            </span>{" "}
            Only {data.negativeYears} years saw a net drop — every one of them during strong El Niño events.
            Yet even those drops were insufficient to cancel the gains from the surrounding years.
            The total accumulated rise across 31 years:{" "}
            <span className="text-foreground font-mono">+{(data.totalRise * 100).toFixed(1)} cm</span> Pacific-wide average.
          </p>
        </div>
      </motion.div>
    </StorySection>
  );
}
