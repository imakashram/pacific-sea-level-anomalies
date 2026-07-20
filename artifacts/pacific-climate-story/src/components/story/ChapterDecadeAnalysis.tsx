import { useState } from "react";
import { useGetDecadeAnalysis } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion, AnimatePresence } from "framer-motion";

const D1_COLOR = "#94a3b8"; // Slate (Act 1: Baseline)
const D2_COLOR = "#f97316"; // Orange (Act 1->2 Step Jump)
const D3_COLOR = "#22d3ee"; // Cyan (Act 2->3 Acceleration Step)

export function ChapterDecadeAnalysis() {
  const { data, isLoading } = useGetDecadeAnalysis();
  const [chartStyle, setChartStyle] = useState<"waterfall" | "stepped" | "slope">("waterfall");
  const [displayMode, setDisplayMode] = useState<"top10" | "all">("top10");
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const countries = data?.countries ?? [];
  const top10 = [...countries].sort((a, b) => (b.d3 - b.d1) - (a.d3 - a.d1)).slice(0, 10);
  const displayedCountries = displayMode === "top10" ? top10 : countries;

  const d1Avg = data?.globalDecades.find((d) => d.key === "d1")?.avg ?? 0;
  const d2Avg = data?.globalDecades.find((d) => d.key === "d2")?.avg ?? 0;
  const d3Avg = data?.globalDecades.find((d) => d.key === "d3")?.avg ?? 0;
  const overallAccel = parseFloat((d3Avg - d1Avg).toFixed(4));

  // Compute Scale Boundaries in cm
  let minCm = -5;
  let maxCm = 25;
  if (countries.length > 0) {
    const allVals = [
      ...countries.flatMap((c) => [c.d1 * 100, c.d2 * 100, c.d3 * 100]),
      d1Avg * 100,
      d2Avg * 100,
      d3Avg * 100,
    ];
    minCm = Math.floor(Math.min(...allVals) - 2);
    maxCm = Math.ceil(Math.max(...allVals) + 2);
  }

  const range = maxCm - minCm;
  const getPct = (valCm: number) => Math.max(0, Math.min(100, ((valCm - minCm) / range) * 100));
  const zeroPct = getPct(0);

  // X-axis ticks (every 5cm)
  const ticks: number[] = [];
  const step = 5;
  const startTick = Math.ceil(minCm / step) * step;
  for (let t = startTick; t <= maxCm; t += step) {
    ticks.push(t);
  }

  // SVG Dimensions for Slope Graph
  const svgWidth = 800;
  const svgHeight = 440;
  const paddingLeft = 90;
  const paddingRight = 140;
  const paddingTop = 40;
  const paddingBottom = 380;
  const plotHeight = paddingBottom - paddingTop;
  const plotWidth = svgWidth - paddingLeft - paddingRight;

  const getSvgY = (valM: number) => {
    const ratio = (valM - minCm / 100) / (maxCm / 100 - minCm / 100);
    return paddingBottom - ratio * plotHeight;
  };

  const x1 = paddingLeft;
  const x2 = paddingLeft + plotWidth / 2;
  const x3 = paddingLeft + plotWidth;

  return (
    <StorySection id="chapter-decade">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">
                Three Decades of Escalation
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                The data splits cleanly into three acts. Each decade tells a different story about the same ocean — and decomposing the rise into sequential steps reveals undeniable acceleration.
              </p>
            </div>

            {/* Controls Header */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto flex-shrink-0">
              {/* Chart Style Switcher */}
              <div className="flex bg-card/40 p-1 rounded-full border border-border/50">
                <button
                  onClick={() => setChartStyle("waterfall")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    chartStyle === "waterfall"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Waterfall Growth
                </button>
                <button
                  onClick={() => setChartStyle("stepped")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    chartStyle === "stepped"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Stepped Range Tracks
                </button>
                <button
                  onClick={() => setChartStyle("slope")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    chartStyle === "slope"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  3-Act Slope Graph
                </button>
              </div>

              {/* Display Count Switcher */}
              <div className="flex bg-card/40 p-1 rounded-full border border-border/50">
                <button
                  onClick={() => setDisplayMode("top10")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    displayMode === "top10"
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setDisplayMode("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    displayMode === "all"
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All 21
                </button>
              </div>
            </div>
          </div>

          {/* Legend Banner */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-xs text-muted-foreground bg-card/20 p-3.5 rounded-xl border border-border/30">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Waterfall Breakdown:</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-slate-400" />
              <span>Act 1 Baseline (1993–2002)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
              <span>Step 1 Jump (Act 1 → 2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span>Step 2 Acceleration (Act 2 → 3)</span>
            </div>
            <div className="flex items-center gap-2 ml-auto text-primary font-mono text-[11px]">
              <span className="w-6 h-0.5 border-t-2 border-dashed border-primary inline-block" />
              <span>Pacific Avg: +{(overallAccel * 100).toFixed(1)} cm total leap</span>
            </div>
          </div>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[520px] bg-card/20 animate-pulse rounded-3xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card/20 backdrop-blur-md border border-border/40 rounded-3xl p-6 md:p-8 shadow-2xl relative"
          >
            {/* VIEW 1: DIVERGING ACCELERATION WATERFALL GROWTH (Option 3) */}
            {chartStyle === "waterfall" && (
              <div>
                {/* Scale Header */}
                <div className="relative w-full h-8 border-b border-border/30 mb-4 text-xs font-mono text-muted-foreground">
                  {ticks.map((t) => {
                    const leftPct = getPct(t);
                    return (
                      <div
                        key={t}
                        className="absolute transform -translate-x-1/2 flex flex-col items-center"
                        style={{ left: `calc(180px + (100% - 280px) * ${leftPct / 100})` }}
                      >
                        <span className={t === 0 ? "font-bold text-primary" : ""}>
                          {t > 0 ? `+${t}` : t}cm
                        </span>
                        <div className={`w-px h-2 mt-1 ${t === 0 ? "bg-primary" : "bg-border/60"}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Waterfall Rows */}
                <div className="space-y-4 relative">
                  {/* Zero Line Guide */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-primary/25 border-r border-dashed border-primary/40 pointer-events-none z-0"
                    style={{ left: `calc(180px + (100% - 280px) * ${zeroPct / 100})` }}
                  />

                  {displayedCountries.map((c, idx) => {
                    const d1Cm = Math.max(0, c.d1 * 100);
                    const d2Cm = c.d2 * 100;
                    const d3Cm = c.d3 * 100;

                    const step1Jump = d2Cm - d1Cm; // Jump from D1 to D2
                    const step2Jump = d3Cm - d2Cm; // Jump from D2 to D3
                    const totalLeap = d3Cm - d1Cm;

                    const d1StartPct = zeroPct;
                    const d1EndPct = getPct(d1Cm);

                    const step1StartPct = d1EndPct;
                    const step1EndPct = getPct(d2Cm);

                    const step2StartPct = step1EndPct;
                    const step2EndPct = getPct(d3Cm);

                    const isHovered = hoveredCode === c.code;

                    return (
                      <motion.div
                        key={c.code}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.03, duration: 0.4 }}
                        onMouseEnter={() => setHoveredCode(c.code)}
                        onMouseLeave={() => setHoveredCode(null)}
                        className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 group ${
                          isHovered ? "bg-card/60 border border-primary/30 shadow-md scale-[1.01]" : "hover:bg-card/30"
                        }`}
                      >
                        {/* Country Label */}
                        <div className="w-[170px] flex items-center gap-2 flex-shrink-0 pr-2">
                          <span className="text-xs font-mono font-semibold text-muted-foreground/60 w-5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {c.country}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/60">
                            ({c.code})
                          </span>
                        </div>

                        {/* Waterfall Stacked Bar Track Area */}
                        <div className="relative flex-1 h-full flex items-center">
                          {/* Segment 1: Act 1 Baseline Bar */}
                          {d1Cm > 0 && (
                            <div
                              className="absolute h-3.5 rounded-l-md transition-all duration-300 bg-slate-400/80 shadow-sm"
                              style={{
                                left: `${d1StartPct}%`,
                                width: `${Math.max(0.5, d1EndPct - d1StartPct)}%`,
                                opacity: isHovered ? 1 : 0.75,
                              }}
                              title={`Act 1 Baseline: +${d1Cm.toFixed(1)} cm`}
                            />
                          )}

                          {/* Segment 2: Act 1 -> Act 2 Step Jump */}
                          {step1Jump > 0 && (
                            <div
                              className="absolute h-3.5 transition-all duration-300 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] border-l border-white/20"
                              style={{
                                left: `${step1StartPct}%`,
                                width: `${Math.max(0.5, step1EndPct - step1StartPct)}%`,
                                opacity: isHovered ? 1 : 0.85,
                              }}
                              title={`Step 1 Jump (Act 1->2): +${step1Jump.toFixed(1)} cm`}
                            />
                          )}

                          {/* Segment 3: Act 2 -> Act 3 Acceleration Step */}
                          {step2Jump > 0 && (
                            <div
                              className="absolute h-3.5 rounded-r-md transition-all duration-300 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] border-l border-white/30"
                              style={{
                                left: `${step2StartPct}%`,
                                width: `${Math.max(0.5, step2EndPct - step2StartPct)}%`,
                                opacity: isHovered ? 1 : 0.9,
                              }}
                              title={`Step 2 Acceleration (Act 2->3): +${step2Jump.toFixed(1)} cm`}
                            />
                          )}

                          {/* End Cap Pulse Dot */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-10"
                            style={{ left: `${step2EndPct}%` }}
                          />
                        </div>

                        {/* Leap Badge */}
                        <div className="w-[90px] text-right flex-shrink-0 pl-3">
                          <span
                            className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                              isHovered
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm"
                                : "bg-card/40 text-cyan-400/90 border-border/40"
                            }`}
                          >
                            +{totalLeap.toFixed(1)} cm
                          </span>
                        </div>

                        {/* Detailed Waterfall Floating Tooltip */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute right-24 top-[-65px] z-50 bg-neutral-950/95 border border-cyan-400/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs pointer-events-none min-w-[240px]"
                            >
                              <div className="font-bold text-white mb-2 flex justify-between items-center border-b border-white/10 pb-1.5">
                                <span>{c.country} ({c.code})</span>
                                <span className="text-cyan-400 font-mono">+{totalLeap.toFixed(1)} cm total leap</span>
                              </div>
                              <div className="space-y-1.5 text-muted-foreground">
                                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-md">
                                  <span className="text-slate-300 font-medium">Act 1 Baseline (1993–02):</span>
                                  <span className="font-mono font-bold text-white">+{d1Cm.toFixed(1)} cm</span>
                                </div>
                                <div className="flex justify-between items-center bg-orange-950/40 border border-orange-500/30 px-2 py-1 rounded-md">
                                  <span className="text-orange-400 font-medium">Step 1 Jump (Act 1→2):</span>
                                  <span className="font-mono font-bold text-orange-200">+{step1Jump.toFixed(1)} cm</span>
                                </div>
                                <div className="flex justify-between items-center bg-cyan-950/50 border border-cyan-500/30 px-2 py-1 rounded-md">
                                  <span className="text-cyan-300 font-bold">Step 2 Acceleration (Act 2→3):</span>
                                  <span className="font-mono font-bold text-cyan-200">+{step2Jump.toFixed(1)} cm</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: STEPPED ESCALATION RANGE TRACKS */}
            {chartStyle === "stepped" && (
              <div>
                {/* Scale Header */}
                <div className="relative w-full h-8 border-b border-border/30 mb-4 text-xs font-mono text-muted-foreground">
                  {ticks.map((t) => {
                    const leftPct = getPct(t);
                    return (
                      <div
                        key={t}
                        className="absolute transform -translate-x-1/2 flex flex-col items-center"
                        style={{ left: `calc(180px + (100% - 280px) * ${leftPct / 100})` }}
                      >
                        <span className={t === 0 ? "font-bold text-primary" : ""}>
                          {t > 0 ? `+${t}` : t}cm
                        </span>
                        <div className={`w-px h-2 mt-1 ${t === 0 ? "bg-primary" : "bg-border/60"}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Tracks */}
                <div className="space-y-4 relative">
                  {/* Zero Line Guide */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-primary/25 border-r border-dashed border-primary/40 pointer-events-none z-0"
                    style={{ left: `calc(180px + (100% - 280px) * ${zeroPct / 100})` }}
                  />

                  {displayedCountries.map((c, idx) => {
                    const d1Cm = c.d1 * 100;
                    const d2Cm = c.d2 * 100;
                    const d3Cm = c.d3 * 100;
                    const leapCm = (c.d3 - c.d1) * 100;

                    const d1Pct = getPct(d1Cm);
                    const d2Pct = getPct(d2Cm);
                    const d3Pct = getPct(d3Cm);

                    const minPct = Math.min(d1Pct, d2Pct, d3Pct);
                    const maxPct = Math.max(d1Pct, d2Pct, d3Pct);

                    const isHovered = hoveredCode === c.code;

                    return (
                      <motion.div
                        key={c.code}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.03, duration: 0.4 }}
                        onMouseEnter={() => setHoveredCode(c.code)}
                        onMouseLeave={() => setHoveredCode(null)}
                        className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 group ${
                          isHovered ? "bg-card/60 border border-primary/30 shadow-md scale-[1.01]" : "hover:bg-card/30"
                        }`}
                      >
                        {/* Country Label */}
                        <div className="w-[170px] flex items-center gap-2 flex-shrink-0 pr-2">
                          <span className="text-xs font-mono font-semibold text-muted-foreground/60 w-5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {c.country}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/60">
                            ({c.code})
                          </span>
                        </div>

                        {/* Dumbbell Track Area */}
                        <div className="relative flex-1 h-full flex items-center">
                          {/* Track Line */}
                          <div
                            className="absolute h-1.5 rounded-full transition-all duration-300 shadow-sm"
                            style={{
                              left: `${minPct}%`,
                              width: `${maxPct - minPct}%`,
                              background: `linear-gradient(to right, ${D1_COLOR}, ${D2_COLOR}, ${D3_COLOR})`,
                              opacity: isHovered ? 1 : 0.75,
                            }}
                          />

                          {/* Act 1 Dot (1993-2002) */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-background cursor-pointer transition-transform duration-200 group-hover:scale-125 z-10"
                            style={{
                              left: `${d1Pct}%`,
                              backgroundColor: D1_COLOR,
                            }}
                            title={`Act 1 (1993-02): +${d1Cm.toFixed(1)} cm`}
                          />

                          {/* Act 2 Dot (2003-2012) */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-background cursor-pointer transition-transform duration-200 group-hover:scale-125 z-10"
                            style={{
                              left: `${d2Pct}%`,
                              backgroundColor: D2_COLOR,
                              boxShadow: `0 0 8px ${D2_COLOR}`,
                            }}
                            title={`Act 2 (2003-12): +${d2Cm.toFixed(1)} cm`}
                          />

                          {/* Act 3 Dot (2013-2023) */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-2 border-background cursor-pointer transition-transform duration-200 group-hover:scale-125 z-10"
                            style={{
                              left: `${d3Pct}%`,
                              backgroundColor: D3_COLOR,
                              boxShadow: `0 0 12px ${D3_COLOR}`,
                            }}
                            title={`Act 3 (2013-23): +${d3Cm.toFixed(1)} cm`}
                          />
                        </div>

                        {/* Leap Badge */}
                        <div className="w-[90px] text-right flex-shrink-0 pl-3">
                          <span
                            className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                              isHovered
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm"
                                : "bg-card/40 text-cyan-400/90 border-border/40"
                            }`}
                          >
                            +{leapCm.toFixed(1)} cm
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: 3-ACT SLOPE GRAPH */}
            {chartStyle === "slope" && (
              <div className="relative w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto min-w-[650px] overflow-visible"
                >
                  <defs>
                    <linearGradient id="slopeGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="slopeGradMuted" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#64748b" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>

                  {/* Y Ticks */}
                  {ticks.map((cm) => {
                    const y = getSvgY(cm / 100);
                    const isZero = cm === 0;
                    return (
                      <g key={cm}>
                        <line
                          x1={paddingLeft - 10}
                          y1={y}
                          x2={paddingLeft + plotWidth + 10}
                          y2={y}
                          stroke={isZero ? "hsl(var(--primary))" : "hsl(var(--border))"}
                          strokeWidth={isZero ? 1.5 : 1}
                          strokeDasharray={isZero ? undefined : "3 3"}
                          opacity={isZero ? 0.7 : 0.25}
                        />
                        <text
                          x={paddingLeft - 18}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fontFamily="monospace"
                          fill={isZero ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                          fontWeight={isZero ? "bold" : "normal"}
                        >
                          {cm > 0 ? `+${cm}` : cm}cm
                        </text>
                      </g>
                    );
                  })}

                  {/* 3 Stage Columns */}
                  {[
                    { x: x1, label: "ACT 1: BASELINE", years: "1993–2002", color: "#94a3b8" },
                    { x: x2, label: "ACT 2: WARNING", years: "2003–2012", color: "#f97316" },
                    { x: x3, label: "ACT 3: CRISIS", years: "2013–2023", color: "#22d3ee" },
                  ].map((col) => (
                    <g key={col.label}>
                      <line
                        x1={col.x}
                        y1={paddingTop - 15}
                        x2={col.x}
                        y2={paddingBottom + 10}
                        stroke={col.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.3"
                      />
                      <text
                        x={col.x}
                        y={paddingTop - 24}
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={col.color}
                        className="uppercase tracking-wider"
                      >
                        {col.label}
                      </text>
                      <text
                        x={col.x}
                        y={paddingTop - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="semibold"
                        fill="hsl(var(--foreground))"
                      >
                        {col.years}
                      </text>
                    </g>
                  ))}

                  {/* Regional Benchmark Line */}
                  {(() => {
                    const ry1 = getSvgY(d1Avg);
                    const ry2 = getSvgY(d2Avg);
                    const ry3 = getSvgY(d3Avg);
                    return (
                      <g className="pointer-events-none">
                        <path
                          d={`M ${x1} ${ry1} L ${x2} ${ry2} L ${x3} ${ry3}`}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray="6 4"
                          opacity="0.85"
                        />
                        <circle cx={x1} cy={ry1} r="4" fill="hsl(var(--primary))" />
                        <circle cx={x2} cy={ry2} r="4" fill="hsl(var(--primary))" />
                        <circle cx={x3} cy={ry3} r="5" fill="hsl(var(--primary))" className="animate-pulse" />
                        <text
                          x={x3 + 12}
                          y={ry3 + 4}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="hsl(var(--primary))"
                        >
                          PACIFIC AVG (+{(d3Avg * 100).toFixed(1)}cm)
                        </text>
                      </g>
                    );
                  })()}

                  {/* Slope Paths */}
                  {displayedCountries.map((c) => {
                    const y1 = getSvgY(c.d1);
                    const y2 = getSvgY(c.d2);
                    const y3 = getSvgY(c.d3);

                    const isHovered = hoveredCode === c.code;
                    const isAnyHovered = hoveredCode !== null;
                    const lineOpacity = isHovered ? 1 : isAnyHovered ? 0.15 : 0.45;
                    const strokeWidth = isHovered ? 3.5 : 1.8;

                    return (
                      <g
                        key={c.code}
                        onMouseEnter={() => setHoveredCode(c.code)}
                        onMouseLeave={() => setHoveredCode(null)}
                        className="cursor-pointer transition-opacity duration-300"
                      >
                        <path
                          d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="16"
                        />
                        <path
                          d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`}
                          fill="none"
                          stroke={isHovered ? "url(#slopeGradActive)" : "url(#slopeGradMuted)"}
                          strokeWidth={strokeWidth}
                          opacity={lineOpacity}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx={x1} cy={y1} r={isHovered ? "5" : "3"} fill={D1_COLOR} opacity={lineOpacity} />
                        <circle cx={x2} cy={y2} r={isHovered ? "5" : "3"} fill={D2_COLOR} opacity={lineOpacity} />
                        <circle cx={x3} cy={y3} r={isHovered ? "6" : "3.5"} fill={D3_COLOR} opacity={lineOpacity} />

                        {(isHovered || (!isAnyHovered && displayMode === "top10")) && (
                          <text
                            x={x3 + 10}
                            y={y3 + 3}
                            fontSize={isHovered ? "11" : "10"}
                            fontWeight={isHovered ? "bold" : "500"}
                            fill={isHovered ? D3_COLOR : "hsl(var(--muted-foreground))"}
                            opacity={isHovered ? 1 : 0.8}
                          >
                            {c.code} (+{(c.d3 * 100).toFixed(0)}cm)
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border/20 text-xs text-muted-foreground flex justify-between items-center">
              <span>
                {chartStyle === "waterfall"
                  ? "Showing sequential waterfall growth: Act 1 Baseline (slate), Step 1 Jump (orange), and Step 2 Acceleration (cyan)."
                  : chartStyle === "stepped"
                  ? "Showing 3-stage dumbbell rows connecting Act 1 (slate), Act 2 (orange), and Act 3 (cyan)."
                  : "Hover over any sloping line to inspect a territory's 3-act escalation step by step."}
              </span>
              {displayMode === "top10" && (
                <button
                  onClick={() => setDisplayMode("all")}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  View all 21 nations →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* 3 Decade Summary Act Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 bg-card/40 border border-border/50 rounded-2xl relative overflow-hidden group hover:border-slate-400/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Act 1 · The Baseline</span>
                <span className="text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full">1993–2002</span>
              </div>
              <div className="text-4xl font-serif font-bold text-foreground mb-3">
                +{(d1Avg * 100).toFixed(1)} <span className="text-xl font-sans font-normal text-muted-foreground">cm</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/10 pt-3">
                The initial decade established a baseline of gradual, subtle sea level anomaly across the Pacific basin.
              </p>
            </div>

            <div className="p-6 bg-card/40 border border-border/50 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs uppercase tracking-wider text-orange-400 font-semibold">Act 2 · The Warning</span>
                <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">2003–2012</span>
              </div>
              <div className="text-4xl font-serif font-bold text-orange-400 mb-3">
                +{(d2Avg * 100).toFixed(1)} <span className="text-xl font-sans font-normal text-muted-foreground">cm</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/10 pt-3">
                The second decade broke from the steady baseline, lifting regional average sea levels by <strong className="text-orange-400">+{( (d2Avg - d1Avg) * 100 ).toFixed(1)} cm</strong> over Decade 1.
              </p>
            </div>

            <div className="p-6 bg-card/40 border border-primary/40 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg shadow-primary/5">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">Act 3 · The Crisis</span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full">2013–2023</span>
              </div>
              <div className="text-4xl font-serif font-bold text-primary mb-3 relative z-10">
                +{(d3Avg * 100).toFixed(1)} <span className="text-xl font-sans font-normal text-muted-foreground">cm</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/10 pt-3 relative z-10">
                The final decade reveals unmistakable acceleration — leaping <strong className="text-primary">+{(overallAccel * 100).toFixed(1)} cm</strong> above Decade 1 averages.
              </p>
            </div>
          </div>
        )}

        {/* Narrative Key Takeaway */}
        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
          <p className="text-base text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">The slope does not flatten.</span>{" "}
            Across 30 years, every single Pacific territory experienced an upward progression from Decade 1 to Decade 3. The regional average escalated from{" "}
            <span className="text-foreground font-mono">+{(d1Avg * 100).toFixed(1)} cm</span> in 1993–2002 to{" "}
            <span className="text-primary font-mono font-bold">+{(d3Avg * 100).toFixed(1)} cm</span> in 2013–2023 — demonstrating that sea level rise in the Pacific is not just continuing, but accelerating.
          </p>
        </div>
      </div>
    </StorySection>
  );
}
