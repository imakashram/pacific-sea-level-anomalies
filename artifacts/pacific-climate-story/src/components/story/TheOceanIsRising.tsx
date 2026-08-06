import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { StorySection } from "./StorySection";
import { useGetOceanRising } from "@workspace/api-client-react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Line,
  ComposedChart,
} from "recharts";
import { Waves, Sun, CloudRain, Flame } from "lucide-react";



const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
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
 * Interface representing a single sea level trend observation point.
 */
interface TrendDataPoint {
  year: number;
  avgAnomaly: number;
  minAnomaly: number;
  maxAnomaly: number;
  countriesRising: number;
  linearTrend?: number;
  movingAvg?: number | null;
}

/**
 * Props definition for the custom Recharts Tooltip.
 */
interface TrendTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: TrendDataPoint;
  }>;
  label?: string | number;
  showRegression: boolean;
  showMovingAvg: boolean;
}

/**
 * Custom Tooltip component for displaying annual anomalies, moving averages, trendlines, and nation counts.
 */
function TrendTooltip({
  active,
  payload,
  label,
  showRegression,
  showMovingAvg,
}: TrendTooltipProps) {
  if (!active || !payload?.length) return null;

  const avgEntry = payload.find((p) => p.dataKey === "avgAnomaly");
  const movingEntry = payload.find((p) => p.dataKey === "movingAvg");
  const regressionEntry = payload.find((p) => p.dataKey === "linearTrend");
  const dataPoint = payload[0]?.payload;

  if (!avgEntry || !dataPoint) return null;

  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[240px]">
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-2">
        <span className="font-serif text-lg font-bold text-white">{label}</span>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 rounded-full uppercase">
          SLA Record
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Annual Anomaly Readout */}
        <div className="flex justify-between items-center gap-6">
          <span className="text-cyan-400/90 font-medium">Annual</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {Number(avgEntry.value) > 0 ? "+" : ""}
            {(Number(avgEntry.value) * 100).toFixed(1)} cm
          </span>
        </div>

        {/* 5-Year Moving Average Readout */}
        {showMovingAvg && movingEntry && movingEntry.value != null && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-amber-400/90 font-medium">5-yr Avg</span>
            <span className="font-mono font-bold text-amber-400">
              {Number(movingEntry.value) > 0 ? "+" : ""}
              {(Number(movingEntry.value) * 100).toFixed(1)} cm
            </span>
          </div>
        )}

        {/* Linear Trend Readout */}
        {showRegression && regressionEntry && regressionEntry.value != null && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-teal-400/90 font-medium">Linear Trend</span>
            <span className="font-mono font-bold text-teal-400">
              {Number(regressionEntry.value) > 0 ? "+" : ""}
              {(Number(regressionEntry.value) * 100).toFixed(1)} cm
            </span>
          </div>
        )}

        {/* Min - Max Regional Range */}
        <div className="flex justify-between items-center gap-6 pt-1 border-t border-cyan-500/10">
          <span className="text-muted-foreground font-medium">
            Min – Max Range
          </span>
          <span className="font-mono text-slate-300">
            {(Number(dataPoint.minAnomaly) * 100).toFixed(1)} cm →{" "}
            {(Number(dataPoint.maxAnomaly) * 100).toFixed(1)} cm
          </span>
        </div>

        {/* Nations Rising Count */}
        <div className="pt-1 flex justify-between items-center gap-6">
          <span className="text-muted-foreground flex items-center gap-1 font-medium">
            <Waves className="w-3.5 h-3.5 text-cyan-400/80" />
            Nations Rising
          </span>
          <span className="font-mono text-cyan-200 font-bold bg-cyan-900/30 px-1.5 py-0.5 rounded">
            {dataPoint.countriesRising} / 21
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * TheOceanIsRising Component
 *
 * Visualizes the 30-year Pacific sea level anomaly trajectory using a composed Recharts diagram
 * with moving average smoothing, linear regression trendline analysis, and milestone annotations.
 */
export function TheOceanIsRising() {
  const { data: trendData, isLoading: trendLoading, isError } = useGetOceanRising();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [showRegression, setShowRegression] = useState(true);
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [showEnso, setShowEnso] = useState(true);

  // Fallback calculations for data
  const data = (trendData && trendData.length > 0 ? trendData : []) as TrendDataPoint[];

  // Compute Linear Regression
  const reg =
    data.length > 0
      ? (() => {
        const n = data.length;
        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumXX = 0;
        for (let i = 0; i < n; i++) {
          sumX += data[i].year;
          sumY += data[i].avgAnomaly;
          sumXY += data[i].year * data[i].avgAnomaly;
          sumXX += data[i].year * data[i].year;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
      })()
      : { slope: 0, intercept: 0 };

  // Calculate Net 30y Rise & Decadal Shift
  const startVal = data.length > 0 ? data[0].avgAnomaly : 0;
  const endVal = data.length > 0 ? data[data.length - 1].avgAnomaly : 0;
  const totalRiseCm = (endVal - startVal) * 100;

  const firstDecadeAvg =
    data.length >= 10
      ? data.slice(0, 10).reduce((acc, cur) => acc + cur.avgAnomaly, 0) / 10
      : 0.0;
  const recentDecadeAvg =
    data.length >= 10
      ? data.slice(-10).reduce((acc, cur) => acc + cur.avgAnomaly, 0) / 10
      : 0.0;
  const shiftCm = (recentDecadeAvg - firstDecadeAvg) * 100;

  // Format dataset with linear trendline and 5-year moving average
  let formattedData: TrendDataPoint[] = data.map((d) => ({
    ...d,
    range: [d.minAnomaly, d.maxAnomaly],
  })) as unknown as TrendDataPoint[];

  if (data.length > 0) {
    const { slope, intercept } = reg;
    // 1. Calculate Linear Regression trendline points
    formattedData = formattedData.map((d) => ({
      ...d,
      linearTrend: parseFloat((slope * d.year + intercept).toFixed(4)),
    }));

    // 2. Calculate 5-year Moving Average points
    const windowSize = 5;
    formattedData = formattedData.map((d, i) => {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(
        formattedData.length - 1,
        i + Math.floor(windowSize / 2),
      );
      let sum = 0;
      let count = 0;
      for (let j = start; j <= end; j++) {
        if (formattedData[j].avgAnomaly != null) {
          sum += formattedData[j].avgAnomaly;
          count++;
        }
      }
      return {
        ...d,
        movingAvg: count > 0 ? parseFloat((sum / count).toFixed(4)) : null,
      };
    });
  } return (
    <StorySection
      id="the-ocean-is-rising"
      className="relative overflow-visible"
    >
      {/* Decorative ambient background lighting */}
      <div className="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Section Header */}
      <motion.div
        className="mb-12 text-center flex flex-col items-center justify-center relative z-10"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          The Ocean Is Rising
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
          Across 21 Pacific nations, sea levels have continued to rise over the
          past 30 years. Natural climate events cause the sea level to go up and
          down for a short time, but overall it keeps rising.
        </p>
      </motion.div>

      {/* Climate Milestone Feature Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 max-w-5xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Card 1: 1998 El Niño Warm Event */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(249, 115, 22, 0.4)",
            backgroundColor: "rgba(249, 115, 22, 0.05)",
            boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.08)",
          }}
          className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
              El Niño (1997-1998)
            </span>
            <div className="text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold tracking-tight text-orange-400">
            Warm Event
          </div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            A natural warming of the Pacific Ocean that caused sea levels to temporarily drop in many western Pacific islands.
          </div>
        </motion.div>

        {/* Card 2: 2011 La Niña Cool Event */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(56, 189, 248, 0.4)",
            backgroundColor: "rgba(56, 189, 248, 0.05)",
            boxShadow: "0 10px 25px -5px rgba(56, 189, 248, 0.08)",
          }}
          className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
              La Niña (2010-2011, 2020-2021)
            </span>
            <div className="text-sky-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold tracking-tight text-sky-400">
            Cool Event
          </div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            A natural cooling of the Pacific Ocean that caused sea levels to temporarily rise in many western Pacific islands.
          </div>
        </motion.div>

        {/* Card 3: 2016 El Niño Extreme Event */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(244, 63, 94, 0.4)",
            backgroundColor: "rgba(244, 63, 94, 0.05)",
            boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.08)",
          }}
          className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
              El Niño (2015-2016)
            </span>
            <div className="text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold tracking-tight text-rose-400">
            Extreme Warm Event
          </div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            A very strong El Niño that temporarily changed sea levels across the Pacific.
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive Main Composed Chart Container */}
      <motion.div
        ref={ref}
        className="w-full relative mb-12 bg-card/10 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {/* Chart Title & Subtitle */}
        <div className="mb-6 relative z-10 text-left">
          <h3 className="text-xs font-mono font-bold text-slate-100">
            30 Years of Sea Level Change & El Niño/La Niña
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-3xl">
            This chart shows how sea levels changed each year from 1993 to 2023, compared with the 1993–2002 average. It also shows the overall trend line and the major El Niño and La Niña periods.
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center justify-end gap-6 border-b border-cyan-500/10 pb-6 mb-6 relative z-10">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3.5 h-0.5 bg-cyan-400 inline-block rounded" />
              <span className="font-semibold">Annual</span>
            </span>

            <button
              onClick={() => setShowMovingAvg(!showMovingAvg)}
              aria-pressed={showMovingAvg}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-amber-400 ${showMovingAvg ? "opacity-100" : "opacity-40"
                }`}
            >
              <span className="w-3.5 h-0.5 bg-amber-400 inline-block rounded" />
              <span className="font-semibold">5-yr Avg</span>
            </button>

            <button
              onClick={() => setShowRegression(!showRegression)}
              aria-pressed={showRegression}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-teal-400 ${showRegression ? "opacity-100" : "opacity-40"
                }`}
            >
              <span className="w-4 h-0 border-t-2 border-dotted border-teal-400 inline-block shrink-0" />
              <span className="font-semibold">Linear Trend</span>
            </button>

            <button
              onClick={() => setShowEnso(!showEnso)}
              aria-pressed={showEnso}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-slate-300 ${showEnso ? "opacity-100" : "opacity-40"
                }`}
            >
              <span className="w-3.5 h-2 bg-slate-400/20 border border-slate-400/50 inline-block" />
              <span className="font-semibold">El Niño & La Niña</span>
            </button>
          </div>
        </div>

        {/* Recharts Render Area */}
        <div className="w-full h-[400px] relative z-10">
          <div className="sr-only">
            This line chart visualizes the rising trend of annual Pacific sea level anomalies from 1993 to 2023.
            Over the 30-year period, sea levels exhibit a net rise of {totalRiseCm.toFixed(1)} cm and a decadal baseline shift of {shiftCm.toFixed(1)} cm, rising at a linear speed rate of {(reg.slope * 1000).toFixed(2)} mm/year.
            Major positive anomalies peak during El Niño events (such as 1997-1998 and 2015-2016), with a 5-year moving average showing a sustained upward trend.
          </div>
          {trendLoading ? (
            <div className="w-full h-full flex items-center justify-center text-cyan-400/60 font-serif gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
              <span>Loading oceanic dataset...</span>
            </div>
          ) : isError ? null : isInView && formattedData ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={formattedData}
                margin={{ top: 20, right: 30, left: 25, bottom: 35 }}
              >
                <defs>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  stroke="rgba(148, 163, 184, 0.3)"
                  height={45}
                  tick={{
                    fill: "rgba(148, 163, 184, 0.7)",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                  tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                  tickMargin={6}
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: 0,
                    style: {
                      textAnchor: "middle",
                      fill: "rgba(255, 255, 255, 0.6)",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                    },
                  }}
                />
                <YAxis
                  stroke="rgba(148, 163, 184, 0.3)"
                  tick={{
                    fill: "rgba(148, 163, 184, 0.7)",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                  tickFormatter={(v) =>
                    `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}`
                  }
                  tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                  width={65}
                  label={{
                    value: "Sea Level Anomaly (cm)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: {
                      textAnchor: "middle",
                      fill: "rgba(255, 255, 255, 0.6)",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                    },
                  }}
                />
                <Tooltip
                  content={
                    <TrendTooltip
                      showRegression={showRegression}
                      showMovingAvg={showMovingAvg}
                    />
                  }
                  cursor={{
                    stroke: "rgba(34, 211, 238, 0.25)",
                    strokeWidth: 1.5,
                    strokeDasharray: "4 4",
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="rgba(148, 163, 184, 0.4)"
                  strokeDasharray="3 3"
                />

                {/* Milestone Reference Areas for ENSO events */}
                {/* 1997-1998 El Niño */}
                <ReferenceArea
                  x1={1997}
                  x2={1998}
                  fill="#f97316"
                  fillOpacity={showEnso ? 0.06 : 0}
                  stroke="#f97316"
                  strokeOpacity={showEnso ? 0.15 : 0}
                  style={{
                    transition:
                      "fill-opacity 0.3s ease-in-out, stroke-opacity 0.3s ease-in-out",
                  }}
                  label={{
                    position: "top",
                    value: "El Niño (1997-1998)",
                    fill: "#f97316",
                    fontSize: 9,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    opacity: showEnso ? 1 : 0,
                    style: { transition: "opacity 0.3s ease-in-out" },
                  }}
                />

                {/* 2010-2011 La Niña */}
                <ReferenceArea
                  x1={2010}
                  x2={2011}
                  fill="#38bdf8"
                  fillOpacity={showEnso ? 0.06 : 0}
                  stroke="#38bdf8"
                  strokeOpacity={showEnso ? 0.15 : 0}
                  style={{
                    transition:
                      "fill-opacity 0.3s ease-in-out, stroke-opacity 0.3s ease-in-out",
                  }}
                  label={{
                    position: "top",
                    value: "La Niña (2010-2011)",
                    fill: "#38bdf8",
                    fontSize: 9,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    opacity: showEnso ? 1 : 0,
                    style: { transition: "opacity 0.3s ease-in-out" },
                  }}
                />

                {/* 2015-2016 El Niño */}
                <ReferenceArea
                  x1={2015}
                  x2={2016}
                  fill="#f43f5e"
                  fillOpacity={showEnso ? 0.06 : 0}
                  stroke="#f43f5e"
                  strokeOpacity={showEnso ? 0.15 : 0}
                  style={{
                    transition:
                      "fill-opacity 0.3s ease-in-out, stroke-opacity 0.3s ease-in-out",
                  }}
                  label={{
                    position: "top",
                    value: "El Niño (2015-2016)",
                    fill: "#f43f5e",
                    fontSize: 9,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    opacity: showEnso ? 1 : 0,
                    style: { transition: "opacity 0.3s ease-in-out" },
                  }}
                />

                {/* 2020-2021 La Niña */}
                <ReferenceArea
                  x1={2020}
                  x2={2021}
                  fill="#06b6d4"
                  fillOpacity={showEnso ? 0.06 : 0}
                  stroke="#06b6d4"
                  strokeOpacity={showEnso ? 0.15 : 0}
                  style={{
                    transition:
                      "fill-opacity 0.3s ease-in-out, stroke-opacity 0.3s ease-in-out",
                  }}
                  label={{
                    position: "top",
                    value: "La Niña (2020-2021)",
                    fill: "#06b6d4",
                    fontSize: 9,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    opacity: showEnso ? 1 : 0,
                    style: { transition: "opacity 0.3s ease-in-out" },
                  }}
                />

                {/* Range Spread Fill */}
                <Area
                  type="monotone"
                  dataKey="range"
                  stroke="none"
                  fill="url(#rangeGrad)"
                  isAnimationActive
                />

                {/* Annual Average Line */}
                <Line
                  type="monotone"
                  dataKey="avgAnomaly"
                  name="Annual"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#38bdf8",
                    stroke: "#ffffff",
                    strokeWidth: 1.5,
                  }}
                  isAnimationActive
                  animationDuration={1500}
                />

                {/* 5-Year Moving Average Line */}
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  name="5-yr Avg"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive
                  animationDuration={1500}
                  opacity={showMovingAvg ? 1 : 0}
                  style={{ transition: "opacity 0.4s ease-in-out" }}
                />

                {/* Linear Regression Trendline */}
                <Line
                  type="monotone"
                  dataKey="linearTrend"
                  name="Linear Trend"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive
                  animationDuration={1500}
                  opacity={showRegression ? 1 : 0}
                  style={{ transition: "opacity 0.4s ease-in-out" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4 font-sans">
          Move your mouse over the chart to see details for each year. Use the buttons above to show or hide different lines.        </p>
      </motion.div>
    </StorySection>
  );
}
