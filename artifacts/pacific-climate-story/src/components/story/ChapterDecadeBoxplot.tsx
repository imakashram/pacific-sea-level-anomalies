import { useGetDecadeDistributions } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState } from "react";

const DECADE_COLORS = ["#38bdf8", "#818cf8", "#f97316"] as const;
const DECADE_BG = ["rgba(56,189,248,0.12)", "rgba(129,140,248,0.12)", "rgba(249,115,22,0.12)"] as const;

interface BoxStats {
  decade: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  count?: number;
}

interface BoxPlotProps {
  stats: BoxStats;
  color: string;
  xCenter: number;
  boxWidth: number;
  yScale: (v: number) => number;
  label?: boolean;
}

function BoxPlot({ stats, color, xCenter, boxWidth, yScale, label = false }: BoxPlotProps) {
  const bw = boxWidth;
  const whiskerW = bw * 0.45;
  const yMin = yScale(stats.min);
  const yQ1 = yScale(stats.q1);
  const yMed = yScale(stats.median);
  const yQ3 = yScale(stats.q3);
  const yMax = yScale(stats.max);
  const yMean = yScale(stats.mean);

  return (
    <g>
      <line
        x1={xCenter}
        y1={yMin}
        x2={xCenter}
        y2={yQ1}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3 2"
        opacity={0.6}
      />
      <line
        x1={xCenter - whiskerW / 2}
        y1={yMin}
        x2={xCenter + whiskerW / 2}
        y2={yMin}
        stroke={color}
        strokeWidth={2}
        opacity={0.8}
      />
      <rect
        x={xCenter - bw / 2}
        y={yQ3}
        width={bw}
        height={yQ1 - yQ3}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={1.5}
        rx={2}
      />
      <line
        x1={xCenter - bw / 2}
        y1={yMed}
        x2={xCenter + bw / 2}
        y2={yMed}
        stroke={color}
        strokeWidth={3}
      />
      <line
        x1={xCenter}
        y1={yQ3}
        x2={xCenter}
        y2={yMax}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3 2"
        opacity={0.6}
      />
      <line
        x1={xCenter - whiskerW / 2}
        y1={yMax}
        x2={xCenter + whiskerW / 2}
        y2={yMax}
        stroke={color}
        strokeWidth={2}
        opacity={0.8}
      />
      <circle
        cx={xCenter + bw / 2 + 8}
        cy={yMean}
        r={3}
        fill={color}
        opacity={0.7}
      />
      {label && (
        <>
          <text x={xCenter} y={yMax - 7} textAnchor="middle" fill={color} fontSize={8} opacity={0.7}>
            max {(stats.max * 100).toFixed(0)}cm
          </text>
          <text x={xCenter} y={yMin + 13} textAnchor="middle" fill={color} fontSize={8} opacity={0.7}>
            min {(stats.min * 100).toFixed(0)}cm
          </text>
          <text x={xCenter} y={yMed + 4} textAnchor="middle" fill="white" fontSize={8.5} fontWeight={700}>
            {(stats.median * 100).toFixed(0)}
          </text>
        </>
      )}
    </g>
  );
}

export function ChapterDecadeBoxplot() {
  const { data, isLoading } = useGetDecadeDistributions();
  const [selectedNation, setSelectedNation] = useState<string | null>(null);

  const SVG_W = 760;
  const SVG_H = 420;
  const PAD_L = 60;
  const PAD_R = 30;
  const PAD_T = 24;
  const PAD_B = 50;
  const plotH = SVG_H - PAD_T - PAD_B;
  const plotW = SVG_W - PAD_L - PAD_R;

  const allValues = data
    ? [
        ...data.global.map((d) => d.min),
        ...data.global.map((d) => d.max),
      ]
    : [-0.05, 0.25];
  const yMin = Math.min(...allValues) - 0.015;
  const yMax = Math.max(...allValues) + 0.015;

  const yScale = (v: number): number =>
    PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const nDecades = data?.decades.length ?? 3;
  const sectionW = plotW / nDecades;
  const BOX_W = Math.min(80, sectionW * 0.55);

  const selectedNationData = data?.nations.find((n) => n.code === selectedNation);

  const gridVals = [-0.05, 0, 0.05, 0.10, 0.15, 0.20, 0.25].filter(
    (v) => v >= yMin && v <= yMax
  );

  return (
    <StorySection id="chapter-decade-boxplot">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          Three Decades, Three Realities
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Each box shows the full distribution of all 21 nations' sea level anomalies within that
          decade — median, interquartile range (IQR), and whiskers to min/max. The diamond shows
          the mean. Watch what happens to both the center and the spread as each decade passes.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 italic">
          Box = IQR (25th–75th percentile). Thick line = median. Diamond = mean. Dashed line = whiskers to min/max.
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[420px] bg-card/20 animate-pulse rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <svg width={SVG_W} height={SVG_H} style={{ fontFamily: "inherit", display: "block" }}>
              {gridVals.map((v) => (
                <g key={v}>
                  <line
                    x1={PAD_L}
                    x2={SVG_W - PAD_R}
                    y1={yScale(v)}
                    y2={yScale(v)}
                    stroke="hsl(var(--border))"
                    strokeWidth={v === 0 ? 1.5 : 0.5}
                    strokeDasharray={v === 0 ? "0" : "3 3"}
                    opacity={0.4}
                  />
                  <text
                    x={PAD_L - 8}
                    y={yScale(v) + 4}
                    textAnchor="end"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={9}
                    opacity={0.7}
                  >
                    {v === 0 ? "0" : `${(v * 100).toFixed(0)}cm`}
                  </text>
                </g>
              ))}

              {data.decades.map((dec, i) => {
                const xCenter = PAD_L + sectionW * i + sectionW / 2;
                const globalStats = data.global[i];
                const nationStats = selectedNationData?.decades[i];
                if (!globalStats) return null;
                return (
                  <g key={dec}>
                    <rect
                      x={PAD_L + sectionW * i + 4}
                      y={PAD_T}
                      width={sectionW - 8}
                      height={plotH}
                      fill={DECADE_BG[i]}
                      rx={4}
                    />
                    <text
                      x={xCenter}
                      y={SVG_H - PAD_B + 18}
                      textAnchor="middle"
                      fill={DECADE_COLORS[i]}
                      fontSize={11}
                      fontWeight={700}
                    >
                      {dec}
                    </text>

                    <BoxPlot
                      stats={globalStats}
                      color={DECADE_COLORS[i] ?? "#38bdf8"}
                      xCenter={nationStats ? xCenter - BOX_W * 0.35 : xCenter}
                      boxWidth={nationStats ? BOX_W * 0.7 : BOX_W}
                      yScale={yScale}
                      label={true}
                    />

                    {nationStats && (
                      <>
                        <BoxPlot
                          stats={nationStats}
                          color="#f472b6"
                          xCenter={xCenter + BOX_W * 0.45}
                          boxWidth={BOX_W * 0.55}
                          yScale={yScale}
                          label={false}
                        />
                        <text
                          x={xCenter + BOX_W * 0.45}
                          y={SVG_H - PAD_B + 32}
                          textAnchor="middle"
                          fill="#f472b6"
                          fontSize={8}
                        >
                          {selectedNation}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              <text
                x={14}
                y={PAD_T + plotH / 2}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={9}
                opacity={0.5}
                transform={`rotate(-90, 14, ${PAD_T + plotH / 2})`}
              >
                Sea Level Anomaly
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            {data.global.map((g, i) => (
              <div
                key={g.decade}
                className="p-5 rounded-xl border"
                style={{
                  background: DECADE_BG[i],
                  borderColor: DECADE_COLORS[i] + "40",
                }}
              >
                <div className="text-xs font-bold mb-3" style={{ color: DECADE_COLORS[i] }}>
                  {g.decade}
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Median</span>
                    <span className="font-mono font-bold text-foreground">{(g.median * 100).toFixed(1)} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IQR</span>
                    <span className="font-mono text-foreground">{((g.q3 - g.q1) * 100).toFixed(1)} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-mono text-foreground">{((g.max - g.min) * 100).toFixed(1)} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mean</span>
                    <span className="font-mono text-foreground">{(g.mean * 100).toFixed(1)} cm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-foreground mb-3">
              Compare a nation's distribution (pink) vs. Pacific-wide:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.nations.map((n) => (
                <button
                  key={n.code}
                  onClick={() => setSelectedNation(selectedNation === n.code ? null : n.code)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    selectedNation === n.code
                      ? "bg-pink-500/20 border-pink-500/60 text-pink-300 font-bold"
                      : "bg-card/30 border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  {n.code}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Two things are happening simultaneously.</span>{" "}
              The entire distribution shifts upward — even the minimum anomaly in 2013–2023 is higher
              than the maximum in 1993–2002. And the spread widens: the IQR grows from{" "}
              <span className="text-foreground font-mono">
                {data.global[0] ? ((data.global[0].q3 - data.global[0].q1) * 100).toFixed(1) : "—"} cm
              </span>{" "}
              to{" "}
              <span className="text-foreground font-mono">
                {data.global[2] ? ((data.global[2].q3 - data.global[2].q1) * 100).toFixed(1) : "—"} cm
              </span>.{" "}
              Nations are not rising uniformly — the gap between the fastest and slowest is growing.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
