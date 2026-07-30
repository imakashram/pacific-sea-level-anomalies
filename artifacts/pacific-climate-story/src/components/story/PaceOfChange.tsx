import { useGetPaceOfChange } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  LabelList,
} from "recharts";
import { motion, useMotionValue, animate } from "framer-motion";
import { useMemo, useState, useEffect, useRef } from "react";
import { TrendingUp, ArrowUpRight, Shield, Activity } from "lucide-react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({
  value,
  decimals = 1,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [value, decimals, prefix, suffix, motionValue]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Iterative relaxation algorithm to resolve label overlaps along the Y-axis.
 * Prevents SVG text overlaps on tight datasets by shifting coordinates vertically.
 *
 * @param yPositions Array of items with their initial Y coordinates.
 * @param labelHeight The height boundary assigned to each label to prevent overlap.
 * @param minBound Minimum Y coordinate limit.
 * @param maxBound Maximum Y coordinate limit.
 */
function solveLabelOverlap(
  yPositions: { id: string; y: number }[],
  labelHeight: number,
  minBound: number,
  maxBound: number,
) {
  // Sort positions sequentially along the Y axis
  const items = [...yPositions].sort((a, b) => a.y - b.y);
  const n = items.length;
  if (n === 0) return {};

  // Iteratively push overlapping neighbors apart
  for (let iter = 0; iter < 12; iter++) {
    for (let i = 0; i < n - 1; i++) {
      const cur = items[i];
      const next = items[i + 1];
      const diff = next.y - cur.y;
      if (diff < labelHeight) {
        const overlap = labelHeight - diff;
        cur.y -= overlap / 2;
        next.y += overlap / 2;
      }
    }
  }

  // Constrain coordinates to boundaries and maintain structural sequence order
  for (let iter = 0; iter < 5; iter++) {
    if (items[0].y < minBound) {
      items[0].y = minBound;
    }
    for (let i = 0; i < n - 1; i++) {
      if (items[i + 1].y < items[i].y + labelHeight) {
        items[i + 1].y = items[i].y + labelHeight;
      }
    }

    if (items[n - 1].y > maxBound) {
      items[n - 1].y = maxBound;
    }
    for (let i = n - 1; i > 0; i--) {
      if (items[i - 1].y > items[i].y - labelHeight) {
        items[i - 1].y = items[i].y - labelHeight;
      }
    }
  }

  // Map resolved Y positions to their corresponding IDs (country codes)
  const result: Record<string, number> = {};
  for (const item of items) {
    result[item.id] = item.y;
  }
  return result;
}

/**
 * Interactive Slope Chart comparing sea level rise rates across two 15-year epochs.
 * Taps into root SVG offsets for stable coordinates and prevents text collisions.
 */
function SlopeChart({
  data,
}: {
  data: {
    country: string;
    code: string;
    slopeFirstHalf: number;
    slopeSecondHalf: number;
    accelerating: boolean;
  }[];
}) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    country: string;
    code: string;
    slopeFirstHalf: number;
    slopeSecondHalf: number;
    x: number;
    y: number;
  } | null>(null);

  const countries = data;

  // Global dataset bounds covering Guam (-1.76 mm/yr) and Tuvalu (10.00 mm/yr)
  const minSlope = -2.0;
  const maxSlope = 10.0;
  const range = maxSlope - minSlope; // 12.0

  const W = 540;
  const H = 420;
  const leftX = 120;
  const rightX = W - 80;
  const topPad = 40;
  const botPad = 25;
  const plotH = H - topPad - botPad;

  // Convert a slope value (mm/yr) into its absolute SVG Y coordinate
  const slopeToY = (s: number) =>
    topPad + plotH - ((s - minSlope) / range) * plotH;

  // Standardized Y axis ticks
  const ticks = [10.0, 7.0, 4.0, 1.0, -2.0];

  // Resolve overlaps along the left axis (1993-2007)
  const leftLabelsY = useMemo(() => {
    const raw = countries.map((d) => ({
      id: d.code,
      y: slopeToY(d.slopeFirstHalf * 1000),
    }));
    return solveLabelOverlap(raw, 13, topPad, topPad + plotH);
  }, [countries, topPad, plotH]);

  // Resolve overlaps along the right axis (2008-2023)
  const rightLabelsY = useMemo(() => {
    const raw = countries.map((d) => ({
      id: d.code,
      y: slopeToY(d.slopeSecondHalf * 1000),
    }));
    return solveLabelOverlap(raw, 13, topPad, topPad + plotH);
  }, [countries, topPad, plotH]);

  // Dynamic sorting to ensure active/highlighted SVG paths are drawn last (on top)
  const sortedLines = useMemo(() => {
    return [...countries].sort((a, b) => {
      if (hoveredCode === a.code) return 1;
      if (hoveredCode === b.code) return -1;
      const aKey = a.code === "PF" || a.code === "VU" || a.code === "NC";
      const bKey = b.code === "PF" || b.code === "VU" || b.code === "NC";
      if (aKey && !bKey) return 1;
      if (!aKey && bKey) return -1;
      return (
        countries.findIndex((x) => x.code === b.code) -
        countries.findIndex((x) => x.code === a.code)
      );
    });
  }, [countries, hoveredCode]);

  // Measure mouse offsets relative to the parent SVG container to prevent tooltip jumps
  const handleMouseMove = (
    e: React.MouseEvent<SVGElement>,
    countryData: (typeof countries)[0],
  ) => {
    const svg = e.currentTarget.closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setHoveredData({
      ...countryData,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredCode(countryData.code);
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    setHoveredCode(null);
  };

  return (
    <div className="relative w-full">
      {/* Screen Reader Alternative description */}
      <div className="sr-only">
        This interactive slope chart visualizes and compares the pace of sea level rise in millimeters per year (mm/yr) for all 21 Pacific territories across two epochs: the first half from 1993 to 2007, and the second half from 2008 to 2023. High rise rates are highlighted. Most nations exhibit accelerating rates in the second half epoch.
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        style={{ maxHeight: 440 }}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label="Interactive slope chart comparing the pace of sea level rise in mm/year across two 15-year epochs (1993-2007 vs 2008-2023)."
      >
        {/* Vertical baseline axis track lines */}
        <line
          x1={leftX}
          y1={topPad - 15}
          x2={leftX}
          y2={topPad + plotH + 15}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.5}
        />
        <line
          x1={rightX}
          y1={topPad - 15}
          x2={rightX}
          y2={topPad + plotH + 15}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.5}
        />

        {/* Column epoch headers */}
        <text
          x={leftX}
          y={22}
          textAnchor="middle"
          fontSize={11}
          fill="hsl(var(--muted-foreground))"
          fontWeight="600"
          className="font-mono"
        >
          1993–2007
        </text>
        <text
          x={rightX}
          y={22}
          textAnchor="middle"
          fontSize={11}
          fill="hsl(var(--muted-foreground))"
          fontWeight="600"
          className="font-mono"
        >
          2008–2023
        </text>

        {/* Horizontal grid lines and Y-axis scale values */}
        {ticks.map((val) => {
          const y = slopeToY(val);
          return (
            <g key={val} className="transition-opacity duration-300">
              <line
                x1={leftX - 20}
                y1={y}
                x2={rightX + 20}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                strokeDasharray="3 3"
                opacity={0.6}
              />
              <text
                x={leftX - 45}
                y={y + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="hsl(var(--muted-foreground))"
                className="font-mono"
                fontWeight="500"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Y Axis unit label */}
        <text
          x={leftX - 75}
          y={topPad + plotH / 2}
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
          transform={`rotate(-90 ${leftX - 75} ${topPad + plotH / 2})`}
          textAnchor="middle"
          className="font-mono"
          letterSpacing="0.05em"
        >
          mm/yr
        </text>

        {sortedLines.map((d) => {
          const y1 = slopeToY(d.slopeFirstHalf * 1000);
          const y2 = slopeToY(d.slopeSecondHalf * 1000);

          const resolvedY1 = leftLabelsY[d.code] ?? y1;
          const resolvedY2 = rightLabelsY[d.code] ?? y2;

          const isKeyCountry =
            d.code === "PF" || d.code === "VU" || d.code === "NC";
          const isHovered = hoveredCode === d.code;
          const isAnyHovered = hoveredCode !== null;
          const shouldHighlight = isHovered || (!isAnyHovered && isKeyCountry);

          // Path styling
          const accel = d.slopeSecondHalf > d.slopeFirstHalf;
          const lineColor = accel
            ? "hsl(var(--primary))"
            : "hsl(var(--destructive))";
          const strokeWidth = shouldHighlight ? 2.5 : 1.0;
          const strokeOpacity = isHovered
              ? 1.0
              : isAnyHovered
                ? 0.08
                : isKeyCountry
                  ? 0.85
                  : 0.15;
          const dotRadius = shouldHighlight ? 5.5 : 3.5;
          const textOpacity = shouldHighlight ? 1.0 : isAnyHovered ? 0.1 : 0.4;

          return (
            <g
              key={d.code}
              className="cursor-pointer"
              onMouseMove={(e) => handleMouseMove(e, d)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Thick transparent line to expand hover buffer area */}
              <line
                x1={leftX}
                y1={y1}
                x2={rightX}
                y2={y2}
                stroke="transparent"
                strokeWidth={15}
              />

              {/* Vector slope line */}
              <line
                x1={leftX}
                y1={y1}
                x2={rightX}
                y2={y2}
                stroke={lineColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                className="transition-all duration-300"
              />

              {/* Left coordinate dot */}
              <circle
                cx={leftX}
                cy={y1}
                r={dotRadius}
                fill={
                  shouldHighlight
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))"
                }
                fillOpacity={strokeOpacity}
                className="transition-all duration-300"
              />

              {/* Pulsing indicator ring for active points */}
              {shouldHighlight && (
                <circle
                  cx={leftX}
                  cy={y1}
                  r={dotRadius + 3}
                  fill="none"
                  stroke={
                    shouldHighlight ? "hsl(var(--foreground))" : lineColor
                  }
                  strokeWidth={0.8}
                  strokeDasharray="2 2"
                  opacity={strokeOpacity * 0.6}
                  className="transition-all duration-300 animate-pulse"
                />
              )}

              {/* Right coordinate dot */}
              <circle
                cx={rightX}
                cy={y2}
                r={dotRadius}
                fill={lineColor}
                fillOpacity={strokeOpacity}
                className="transition-all duration-300"
              />

              {/* Pulsing indicator ring for active points */}
              {shouldHighlight && (
                <circle
                  cx={rightX}
                  cy={y2}
                  r={dotRadius + 3}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={0.8}
                  strokeDasharray="2 2"
                  opacity={strokeOpacity * 0.6}
                  className="transition-all duration-300 animate-pulse"
                />
              )}

              {/* Left axis offset connector paths */}
              {shouldHighlight && Math.abs(resolvedY1 - y1) > 2 && (
                <path
                  d={`M ${leftX - 6} ${y1} L ${leftX - 12} ${y1} L ${leftX - 18} ${resolvedY1}`}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  fill="none"
                  strokeDasharray="2 2"
                  className="transition-all duration-300"
                />
              )}

              {/* Right axis offset connector paths */}
              {shouldHighlight && Math.abs(resolvedY2 - y2) > 2 && (
                <path
                  d={`M ${rightX + 6} ${y2} L ${rightX + 12} ${y2} L ${rightX + 18} ${resolvedY2}`}
                  stroke={lineColor}
                  strokeWidth={0.5}
                  fill="none"
                  strokeDasharray="2 2"
                  opacity={strokeOpacity}
                  className="transition-all duration-300"
                />
              )}

              {/* Static left axis label */}
              <text
                x={leftX - 22}
                y={resolvedY1 + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="hsl(var(--muted-foreground))"
                fontWeight={shouldHighlight ? "700" : "400"}
                opacity={textOpacity}
                className="transition-all duration-300 font-mono"
              >
                {d.code}
              </text>

              {/* Static right axis label and transition rate value */}
              <text
                x={rightX + 22}
                y={resolvedY2 + 3.5}
                textAnchor="start"
                fontSize={10}
                fill={lineColor}
                fontWeight={shouldHighlight ? "700" : "500"}
                opacity={textOpacity}
                className="transition-all duration-300 font-mono"
              >
                {d.code} {accel ? "↑" : "↓"}
                {Math.abs(
                  (d.slopeSecondHalf - d.slopeFirstHalf) * 1000,
                ).toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* High-Fidelity Custom Tooltip styled like FutureOutlook */}
      {hoveredData && (
        <div
          className="absolute bg-[#0b1528]/95 border p-4 rounded-xl shadow-xl pointer-events-none text-left z-50 min-w-[245px] w-max font-mono transition-all duration-75"
          style={{
            left: hoveredData.x + 15,
            top: hoveredData.y - 45,
            borderColor:
              hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                ? "rgba(34,211,238,0.3)"
                : "rgba(239,68,68,0.3)",
            boxShadow:
              hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                ? "0 10px 30px rgba(34,211,238,0.2)"
                : "0 10px 30px rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5 gap-4">
            <span className="font-serif text-sm font-bold text-white">
              {hoveredData.country}
            </span>
            <span
              className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border ${
                hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                ? "Accelerating"
                : "Slowing"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400/90 font-medium">
                1993–2007 (Before)
              </span>
              <span className="font-bold text-slate-300 text-sm">
                {(hoveredData.slopeFirstHalf * 1000).toFixed(2)} mm/yr
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400/90 font-medium">
                2008–2023 (After)
              </span>
              <span className="font-bold text-slate-300 text-sm">
                {(hoveredData.slopeSecondHalf * 1000).toFixed(2)} mm/yr
              </span>
            </div>

            <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-white/5 mt-1">
              <span
                className={
                  hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                    ? "text-cyan-300/90 font-medium"
                    : "text-red-300/90 font-medium"
                }
              >
                Pace Acceleration
              </span>
              <span
                className={`font-bold text-sm ${hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf ? "text-cyan-300" : "text-red-300"}`}
              >
                {hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                  ? "+"
                  : ""}
                {(
                  (hoveredData.slopeSecondHalf - hoveredData.slopeFirstHalf) *
                  1000
                ).toFixed(2)}{" "}
                mm/yr
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Recharts BarChart Tooltip rendering the full country name and comparative global ratio.
 */
function BarChartTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const val = payload[0].value * 1000;
  const ratio = val / 3.3;
  const isAboveAvg = val > 3.3;

  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[240px] w-max font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5 gap-4">
        <span className="font-serif text-sm font-bold text-white">
          {d.country}
        </span>
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border ${
            d.accelerating
              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              : "bg-slate-500/20 text-slate-400 border-slate-500/30"
          }`}
        >
          {d.accelerating ? "Accelerating" : "Stable"}
        </span>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-400/90 font-medium">30-Year Trend</span>
          <span className="font-bold text-slate-300 text-sm">
            {val >= 0 ? "+" : ""}
            {val.toFixed(2)} mm/yr
          </span>
        </div>

        <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-white/5 mt-1">
          <span className="text-slate-400/90 font-medium">Vs. Global Avg</span>
          <span
            className={`font-bold ${isAboveAvg ? "text-rose-400" : "text-slate-400"}`}
          >
            {ratio.toFixed(1)}x baseline
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Pace of Change Section Component.
 * Integrates metrics grid, long-term pace comparison, and decadal acceleration transitions.
 */
const paceContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const paceCardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

/**
 * Main Pace of Change Section Component.
 * Integrates metrics grid, long-term pace comparison, and decadal acceleration transitions.
 */
export function PaceOfChange() {
  const { data, isLoading } = useGetPaceOfChange();
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  // Sorting arrays for specific visualizations (Full Period desc and acceleration delta desc)
  const sortedByFull =
    data?.slice().sort((a, b) => b.slopeFullPeriod - a.slopeFullPeriod) || [];
  const sortedByAccel =
    data
      ?.slice()
      .sort(
        (a, b) =>
          b.slopeSecondHalf -
          b.slopeFirstHalf -
          (a.slopeSecondHalf - a.slopeFirstHalf),
      ) || [];

  // Metrics aggregates (converts meters/yr data items directly to mm/yr using * 1000 multiplier)
  const acceleratingCount = data?.filter((d) => d.accelerating).length ?? 0;
  const avgDelta = data
    ? (data.reduce((s, d) => s + (d.slopeSecondHalf - d.slopeFirstHalf), 0) /
        data.length) *
      1000
    : 0;

  const mostAccel = sortedByAccel[0];
  const mostStable = sortedByAccel[sortedByAccel.length - 1];

  return (
    <StorySection id="pace-of-change">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center flex flex-col items-center justify-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            The Pace Of Change
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
            Sea levels are not only rising - they're rising faster. By comparing
            the first 15 years with the most recent 15 years, this analysis
            reveals how the rate of change has accelerated across Pacific
            nations.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={paceContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 w-full text-left"
        >
          {/* Card 1: Nations accelerating */}
          <motion.div
            variants={paceCardVariants}
            className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-red-500/40 hover:shadow-red-500/5 hover:bg-red-950/5 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Nations accelerating
              </span>
              <div className="text-red-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-red-400">
              {isLoading || !data ? (
                "—"
              ) : (
                <>
                  <AnimatedCounter value={acceleratingCount} decimals={0} /> / {data.length}
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Nations where sea level rise is speeding up
            </div>
          </motion.div>

          {/* Card 2: Average speed increase */}
          <motion.div
            variants={paceCardVariants}
            className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-orange-500/40 hover:shadow-orange-500/5 hover:bg-orange-950/5 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Avg Speed Increase
              </span>
              <div className="text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-orange-400">
              {isLoading || !data ? (
                "—"
              ) : (
                <>
                  <AnimatedCounter
                    value={avgDelta}
                    decimals={2}
                    prefix={avgDelta >= 0 ? "+" : ""}
                  />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    mm/yr
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Comparison between first and second 15 years
            </div>
          </motion.div>

          {/* Card 3: Most Accelerating */}
          <motion.div
            variants={paceCardVariants}
            className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-cyan-500/40 hover:shadow-cyan-500/5 hover:bg-cyan-950/5 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Most Accelerating
              </span>
              <div className="text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-serif font-bold tracking-tight text-cyan-400">
              {isLoading || !mostAccel ? "—" : mostAccel.country}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isLoading || !mostAccel
                ? "Checking territories..."
                : `Pace jumped from ${(mostAccel.slopeFirstHalf * 1000).toFixed(2)} to ${(mostAccel.slopeSecondHalf * 1000).toFixed(2)} mm/yr - a ${((mostAccel.slopeSecondHalf - mostAccel.slopeFirstHalf) * 1000).toFixed(2)} mm/yr increase.`}
            </div>
          </motion.div>

          {/* Card 4: Most Stable Pace */}
          <motion.div
            variants={paceCardVariants}
            className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-teal-500/40 hover:shadow-teal-500/5 hover:bg-teal-950/5 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Most Stable Pace
              </span>
              <div className="text-teal-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-serif font-bold tracking-tight text-teal-400">
              {isLoading || !mostStable ? "—" : mostStable.country}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isLoading || !mostStable
                ? "Checking territories..."
                : `Pace shifted from ${(mostStable.slopeFirstHalf * 1000).toFixed(2)} to ${(mostStable.slopeSecondHalf * 1000).toFixed(2)} mm/yr.`}
            </div>
          </motion.div>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[400px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            onViewportEnter={() => {
              setIsInView(true);
              setTimeout(() => {
                setIsAnimationActive(false);
              }, 1500);
            }}
          >
            {/* Visual 1: 30-Year Pace Comparison */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="bg-card/10 border border-border/30 rounded-2xl p-6 mb-10 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/5 select-none px-1 text-left">
                <div className="max-w-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
                    30-Year Pace Comparison
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Linear regression slope (mm/yr) calculated over the entire
                    30-year observation period (1993–2023).
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-1 md:mt-0 flex-shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    Accelerating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    Stable
                  </span>
                </div>
              </div>
              <div className="h-[520px] w-full">
                {isInView ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedByFull}
                      layout="vertical"
                      margin={{ top: 25, right: 48, left: 60, bottom: 35 }}
                      onMouseMove={(state) => {
                        if (
                          state &&
                          typeof state.activeTooltipIndex === "number"
                        ) {
                          setHoveredBarIndex(state.activeTooltipIndex);
                        } else {
                          setHoveredBarIndex(null);
                        }
                      }}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      <defs>
                        <linearGradient
                          id="barAccelerating"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary)/0.4)"
                          />
                          <stop offset="100%" stopColor="hsl(var(--primary))" />
                        </linearGradient>
                        <linearGradient
                          id="barStable"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="rgba(148, 163, 184, 0.15)"
                          />
                          <stop
                            offset="100%"
                            stopColor="rgba(148, 163, 184, 0.45)"
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        vertical={true}
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        type="number"
                        domain={[0, "auto"]}
                        stroke="hsl(var(--muted-foreground))"
                        axisLine={false}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 10,
                          fontFamily: "monospace",
                        }}
                        tickFormatter={(v) => `${(v * 1000).toFixed(1)}`}
                      >
                        <Label
                          value="Pace of Sea Level Rise (mm/yr)"
                          position="insideBottom"
                          offset={-20}
                          style={{
                            textAnchor: "middle",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 10,
                            fontFamily: "monospace",
                            fontWeight: 600,
                          }}
                        />
                      </XAxis>
                      <YAxis
                        dataKey="code"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        axisLine={false}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 10,
                          fontFamily: "monospace",
                        }}
                        width={60}
                        interval={0}
                      >
                        <Label
                          value="Pacific Nation"
                          angle={-90}
                          position="insideLeft"
                          offset={10}
                          style={{
                            textAnchor: "middle",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 10,
                            fontFamily: "monospace",
                            fontWeight: 600,
                          }}
                        />
                      </YAxis>
                      <Tooltip
                        content={<BarChartTooltip />}
                        cursor={{ fill: "hsl(var(--muted)/0.15)" }}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="slopeFullPeriod"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                        isAnimationActive={isAnimationActive}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        <LabelList
                          dataKey="slopeFullPeriod"
                          position="right"
                          formatter={(v: number) => (v * 1000).toFixed(1)}
                          fill="hsl(var(--muted-foreground))"
                          fontSize={10}
                          fontWeight={600}
                          fontFamily="monospace"
                          dx={8}
                        />
                        {sortedByFull.map((entry, index) => {
                          const isHovered = hoveredBarIndex === index;
                          const isAnyHovered = hoveredBarIndex !== null;
                          const baseOpacity = entry.accelerating ? 1.0 : 0.45;
                          const opacity = isHovered
                            ? 1.0
                            : isAnyHovered
                              ? 0.15
                              : baseOpacity;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.accelerating
                                  ? "url(#barAccelerating)"
                                  : "url(#barStable)"
                              }
                              opacity={opacity}
                              className="transition-opacity duration-100 cursor-pointer"
                            />
                          );
                        })}
                      </Bar>
                      <ReferenceLine
                        x={0.0033}
                        stroke="rgba(239, 68, 68, 0.8)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        label={(refProps: any) => {
                          const viewBox = refProps.viewBox;
                          if (!viewBox) return <g />;
                          const { x, y } = viewBox;
                          return (
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize={9}
                              fontFamily="monospace"
                              fontWeight={600}
                            >
                              Global Avg (3.3 mm/yr)
                            </text>
                          );
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            </motion.div>

            {/* Interaction Helper Text */}
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.5 } },
              }}
              className="text-center text-xs text-muted-foreground mt-4 mb-10 font-sans select-none"
            >
              Hover over any bar to inspect that nation's 30-year sea level rise
              pace and compare it to the global average.
            </motion.p>

            {/* Visual 2: Acceleration Before & After 2008 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-white/5 select-none px-1 text-left">
                <div className="max-w-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
                    Acceleration Before & After 2008
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Each line connects a nation's 1993–2007 rise rate (left) to
                    its 2008–2023 rise rate (right).
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-1 self-end">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    Accelerating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                    Slowing
                  </span>
                </div>
              </div>
              <SlopeChart data={sortedByAccel} />
            </motion.div>

            {/* Interaction Helper Text */}
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.5 } },
              }}
              className="text-center text-xs text-muted-foreground mt-4 font-sans select-none"
            >
              Hover over any line or label to isolate its trajectory and trace
              how that nation's rate of rise accelerated or slowed between
              epochs.
            </motion.p>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
