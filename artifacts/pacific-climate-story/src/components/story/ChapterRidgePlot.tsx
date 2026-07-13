import { useGetAnomalyProfiles } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const REGION_COLORS: Record<string, string> = {
  Polynesia: "#f97316",
  Melanesia: "#22c55e",
  Micronesia: "#38bdf8",
  Unknown: "#a78bfa",
};

function gaussianKDE(values: number[], xPoints: number[], bandwidth: number): number[] {
  return xPoints.map((x) => {
    const sum = values.reduce((s, xi) => {
      const z = (x - xi) / bandwidth;
      return s + Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
    }, 0);
    return sum / values.length;
  });
}

const SVG_W = 800;
const PAD_L = 52;
const PAD_R = 10;
const PAD_T = 16;
const PAD_B = 36;
const ROW_H = 32;
const LABEL_W = 90;
const CURVE_SCALE = 90;
const X_MIN = -0.06;
const X_MAX = 0.28;
const N_POINTS = 80;

export function ChapterRidgePlot() {
  const { data, isLoading } = useGetAnomalyProfiles();
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const { xPoints, plotW, xScale, kdeCurves } = useMemo(() => {
    const plotW = SVG_W - PAD_L - PAD_R - LABEL_W;
    const xScale = (v: number) => PAD_L + LABEL_W + ((v - X_MIN) / (X_MAX - X_MIN)) * plotW;
    const xPoints: number[] = Array.from({ length: N_POINTS }, (_, i) =>
      X_MIN + (i / (N_POINTS - 1)) * (X_MAX - X_MIN)
    );

    const kdeCurves = (data?.nations ?? []).map((n) => {
      const bw = n.std > 0 ? 1.06 * n.std * Math.pow(n.values.length, -0.2) : 0.01;
      return gaussianKDE(n.values, xPoints, bw);
    });

    return { xPoints, plotW, xScale, kdeCurves };
  }, [data]);

  const nations = data?.nations ?? [];
  const svgH = PAD_T + nations.length * ROW_H + PAD_B + 20;

  const gridVals = [-0.05, 0, 0.05, 0.10, 0.15, 0.20, 0.25].filter(
    (v) => v >= X_MIN && v <= X_MAX
  );

  return (
    <StorySection id="chapter-ridge-plot">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Anomaly Profiles</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Each ridge is a nation's probability density — where its sea level anomaly has
          spent its time across 31 years. A narrow, rightward ridge means consistently
          high sea levels. A wide ridge means high ENSO-driven volatility. A leftward
          position means still relatively low — but for how much longer?
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 italic">
          Gaussian KDE over 31 annual anomaly values. Sorted by mean anomaly (highest at top).
          Color = geographic region.{" "}
          <span style={{ color: REGION_COLORS.Micronesia }}>■ Micronesia</span>{" "}
          <span style={{ color: REGION_COLORS.Polynesia }}>■ Polynesia</span>{" "}
          <span style={{ color: REGION_COLORS.Melanesia }}>■ Melanesia</span>
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[740px] bg-card/20 animate-pulse rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <svg
              width={SVG_W}
              height={svgH}
              style={{ fontFamily: "inherit", display: "block" }}
            >
              {gridVals.map((v) => (
                <g key={v}>
                  <line
                    x1={xScale(v)} x2={xScale(v)}
                    y1={PAD_T} y2={svgH - PAD_B}
                    stroke="hsl(var(--border))"
                    strokeWidth={v === 0 ? 1.5 : 0.5}
                    strokeDasharray={v === 0 ? "0" : "3 3"}
                    opacity={0.35}
                  />
                  <text
                    x={xScale(v)} y={svgH - PAD_B + 16}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={9} opacity={0.7}
                  >
                    {v === 0 ? "0" : `${(v * 100).toFixed(0)}cm`}
                  </text>
                </g>
              ))}

              {nations.map((nation, i) => {
                const kde = kdeCurves[i] ?? [];
                const maxKde = Math.max(...kde, 0.001);
                const color = REGION_COLORS[nation.region] ?? "#a78bfa";
                const isHov = highlighted === nation.code;
                const isOther = highlighted !== null && !isHov;
                const baseY = PAD_T + i * ROW_H + ROW_H * 0.85;
                const opacity = isOther ? 0.15 : isHov ? 1 : 0.7;
                const strokeW = isHov ? 2 : 1;

                const pathPoints = xPoints
                  .map((x, j) => {
                    const px = xScale(x);
                    const py = baseY - (kde[j] ?? 0) * CURVE_SCALE * (ROW_H / 30);
                    return `${px},${py}`;
                  })
                  .join(" ");

                const areaPath =
                  `M ${xScale(xPoints[0]!)},${baseY} ` +
                  xPoints
                    .map((x, j) => {
                      const px = xScale(x);
                      const py = baseY - (kde[j] ?? 0) * CURVE_SCALE * (ROW_H / 30);
                      return `L ${px},${py}`;
                    })
                    .join(" ") +
                  ` L ${xScale(xPoints[xPoints.length - 1]!)},${baseY} Z`;

                const meanX = xScale(nation.mean);

                return (
                  <g
                    key={nation.code}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHighlighted(nation.code)}
                    onMouseLeave={() => setHighlighted(null)}
                  >
                    <path
                      d={areaPath}
                      fill={color}
                      fillOpacity={isHov ? 0.25 : 0.1}
                      style={{ transition: "fill-opacity 0.15s" }}
                    />
                    <polyline
                      points={pathPoints}
                      fill="none"
                      stroke={color}
                      strokeWidth={strokeW}
                      opacity={opacity}
                      style={{ transition: "opacity 0.15s, stroke-width 0.1s" }}
                    />
                    <line
                      x1={meanX} x2={meanX}
                      y1={baseY - ROW_H * 0.6}
                      y2={baseY}
                      stroke={color}
                      strokeWidth={isHov ? 2 : 1}
                      strokeDasharray="2 2"
                      opacity={opacity * 0.8}
                    />
                    <text
                      x={PAD_L + LABEL_W - 6}
                      y={baseY - 2}
                      textAnchor="end"
                      fill={color}
                      fontSize={isHov ? 11 : 9.5}
                      fontWeight={isHov ? 700 : 500}
                      opacity={isOther ? 0.3 : 1}
                      style={{ transition: "opacity 0.15s" }}
                    >
                      {nation.code}
                    </text>
                    {isHov && (
                      <>
                        <text
                          x={meanX + 4}
                          y={baseY - ROW_H * 0.65}
                          fill={color}
                          fontSize={8}
                          fontWeight={600}
                        >
                          μ={( nation.mean * 100).toFixed(1)}cm
                        </text>
                        <text
                          x={meanX + 4}
                          y={baseY - ROW_H * 0.65 + 11}
                          fill={color}
                          fontSize={7.5}
                          opacity={0.8}
                        >
                          σ={(nation.std * 100).toFixed(1)}cm
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {highlighted && (() => {
            const n = nations.find((x) => x.code === highlighted);
            if (!n) return null;
            return (
              <div className="mt-3 p-4 bg-card/40 border border-border/50 rounded-xl flex flex-wrap gap-5 items-center text-sm">
                <span
                  className="font-bold text-base"
                  style={{ color: REGION_COLORS[n.region] }}
                >
                  {n.country} ({n.code}) · {n.region}
                </span>
                <span className="text-muted-foreground">
                  Mean: <span className="font-mono text-foreground">{(n.mean * 100).toFixed(1)} cm</span>
                </span>
                <span className="text-muted-foreground">
                  Std dev: <span className="font-mono text-foreground">{(n.std * 100).toFixed(1)} cm</span>
                </span>
                <span className="text-muted-foreground">
                  Range: <span className="font-mono text-foreground">{(n.min * 100).toFixed(1)}–{(n.max * 100).toFixed(1)} cm</span>
                </span>
                <span className="text-muted-foreground">
                  Median: <span className="font-mono text-foreground">{(n.median * 100).toFixed(1)} cm</span>
                </span>
              </div>
            );
          })()}

          <div className="mt-8 grid grid-cols-3 gap-5">
            {(["Micronesia", "Polynesia", "Melanesia"] as const).map((region) => {
              const regionNations = nations.filter((n) => n.region === region);
              const avgMean = regionNations.reduce((s, n) => s + n.mean, 0) / (regionNations.length || 1);
              const avgStd = regionNations.reduce((s, n) => s + n.std, 0) / (regionNations.length || 1);
              return (
                <div
                  key={region}
                  className="p-5 rounded-xl border"
                  style={{
                    background: REGION_COLORS[region] + "12",
                    borderColor: REGION_COLORS[region] + "40",
                  }}
                >
                  <div className="text-xs font-bold mb-2" style={{ color: REGION_COLORS[region] }}>
                    {region}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Avg mean</span>
                      <span className="font-mono text-foreground">{(avgMean * 100).toFixed(1)} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg σ</span>
                      <span className="font-mono text-foreground">{(avgStd * 100).toFixed(1)} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nations</span>
                      <span className="font-mono text-foreground">{regionNations.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">
                Wide ridges are not a sign of resilience — they signal exposure.
              </span>{" "}
              Nations with high standard deviations experience dramatic swings driven by ENSO.
              Nations with narrow, rightward ridges have already locked in high sea levels regardless
              of ENSO phase. The most concerning are nations whose ridge is both rightward AND
              widening — facing both a high mean and growing volatility simultaneously.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
