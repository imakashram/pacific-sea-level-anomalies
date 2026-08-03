import { useRef, useState, useEffect } from "react";
import { useGetFutureOutlook } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
} from "recharts";
import { motion, useMotionValue, animate, Variants } from "framer-motion";
import { Gauge, Calendar, ShieldAlert, History } from "lucide-react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  useLocale?: boolean;
}

function AnimatedCounter({
  value,
  decimals = 1,
  prefix = "",
  suffix = "",
  useLocale = false,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      onUpdate: (latest) => {
        if (ref.current) {
          if (useLocale) {
            ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
          } else {
            ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
          }
        }
      },
    });
    return () => controls.stop();
  }, [value, decimals, prefix, suffix, useLocale, motionValue]);

  return (
    <span ref={ref}>
      {prefix}
      {useLocale ? Math.floor(value).toLocaleString() : value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Historical sea level observation entry.
 */
interface HistoricalPoint {
  year: number;
  avgAnomaly: number;
}

/**
 * Projected sea level entry with confidence interval.
 */
interface ProjectedPoint {
  year: number;
  projected: number;
  lower: number;
  upper: number;
}

/**
 * Combined dataset point formatted for Recharts ComposedChart.
 */
interface ForecastChartPoint {
  year: number;
  historical: number | null;
  projected: number | null;
  lower: number | null;
  upper: number | null;
  band: [number, number] | null;
  baseline2023: number | null;
}

/**
 * Props definition for the custom Recharts tooltip.
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number | [number, number];
    payload: ForecastChartPoint;
  }>;
  label?: string | number;
}

/**
 * Custom Tooltip component for displaying historical averages, projected anomaly values,
 * net rise vs 2023 baseline, and ±2σ confidence interval bounds.
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const yearNum = Number(label);
  const isProjected = yearNum > 2023;

  const histItem = payload.find((p) => p.dataKey === "historical");
  const projItem = payload.find((p) => p.dataKey === "projected");
  const bandItem = payload.find((p) => p.dataKey === "band");
  const baseline2023 = payload[0]?.payload?.baseline2023;

  const projVal = typeof projItem?.value === "number" ? projItem.value : null;
  const netRiseFrom2023 =
    projVal != null && isProjected && baseline2023 != null
      ? projVal - baseline2023
      : null;

  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[240px] font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
        <span className="font-serif text-base font-bold text-white">
          {label}
        </span>
        <span
          className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${isProjected
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}
        >
          {isProjected ? "Projection" : "Historical"}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Historical Avg readout */}
        {histItem && typeof histItem.value === "number" && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-cyan-400/90 font-medium">Historical Avg</span>
            <span className="font-bold text-cyan-400 text-sm">
              {histItem.value >= 0 ? "+" : ""}
              {histItem.value.toFixed(2)} cm
            </span>
          </div>
        )}

        {/* Projected Anomaly readout */}
        {projVal != null && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-orange-400/90 font-medium">
              Total Anomaly
            </span>
            <span className="font-bold text-orange-400 text-sm">
              {projVal >= 0 ? "+" : ""}
              {projVal.toFixed(2)} cm
            </span>
          </div>
        )}

        {/* Net Rise vs 2023 Baseline readout */}
        {netRiseFrom2023 != null && (
          <div className="flex justify-between items-center gap-4 text-orange-300/90 font-medium">
            <span>Net Rise vs 2023</span>
            <span className="font-bold text-sm text-orange-300">
              {netRiseFrom2023 >= 0 ? "+" : ""}
              {netRiseFrom2023.toFixed(2)} cm
            </span>
          </div>
        )}

        {/* ±2σ Confidence Interval Band readout */}
        {bandItem && Array.isArray(bandItem.value) && (
          <div className="flex justify-between items-center gap-4 text-[11px] text-muted-foreground pt-1.5 border-t border-white/5">
            <span>±2σ Confidence</span>
            <span className="font-bold text-amber-400/90">
              [{bandItem.value[0].toFixed(1)} to {bandItem.value[1].toFixed(1)}]
              cm
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface CardTheme {
  text: string;
  bg: string;
  border: string;
  hover: {
    y: number;
    borderColor: string;
    backgroundColor: string;
    boxShadow: string;
  };
}

const CARD_THEMES: Record<string, CardTheme> = {
  teal: {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(20, 184, 166, 0.5)",
      backgroundColor: "rgba(20, 184, 166, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.08)",
    },
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(6, 182, 212, 0.5)",
      backgroundColor: "rgba(6, 182, 212, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.08)",
    },
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(249, 115, 22, 0.5)",
      backgroundColor: "rgba(249, 115, 22, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.08)",
    },
  },
  red: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(239, 68, 68, 0.5)",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.08)",
    },
  },
};

// Framer Motion Animation Variants
const cardContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 14,
    },
  },
};

const gaugeIconVariants: Variants = {
  hover: {
    rotate: [0, -15, 15, -10, 10, 0],
    transition: { duration: 0.8, ease: "easeInOut" as const },
  },
};

const historyIconVariants: Variants = {
  hover: {
    rotate: -360,
    transition: { duration: 1.2, ease: "easeInOut" as const },
  },
};

const calendarIconVariants: Variants = {
  hover: {
    scale: 1.2,
    y: -2,
    transition: { type: "spring" as const, stiffness: 300, damping: 10 },
  },
};

const shieldIconVariants: Variants = {
  hover: {
    scale: 1.15,
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6 },
  },
};


/**
 * Static 100% verified fallback forecast data (1993-2023 historical + 2024-2033 projections)
 * derived directly from OLS linear regression on sea_level_anomalies.csv dataset.
 */
const FALLBACK_HISTORICAL: HistoricalPoint[] = [
  { year: 1993, avgAnomaly: -0.019 },
  { year: 1994, avgAnomaly: -0.0048 },
  { year: 1995, avgAnomaly: 0 },
  { year: 1996, avgAnomaly: 0.019 },
  { year: 1997, avgAnomaly: -0.019 },
  { year: 1998, avgAnomaly: -0.0619 },
  { year: 1999, avgAnomaly: 0.0143 },
  { year: 2000, avgAnomaly: 0.0333 },
  { year: 2001, avgAnomaly: 0.0238 },
  { year: 2002, avgAnomaly: 0.0143 },
  { year: 2003, avgAnomaly: 0.0095 },
  { year: 2004, avgAnomaly: 0.0286 },
  { year: 2005, avgAnomaly: 0.0286 },
  { year: 2006, avgAnomaly: 0.0429 },
  { year: 2007, avgAnomaly: 0.0619 },
  { year: 2008, avgAnomaly: 0.081 },
  { year: 2009, avgAnomaly: 0.0571 },
  { year: 2010, avgAnomaly: 0.0238 },
  { year: 2011, avgAnomaly: 0.0762 },
  { year: 2012, avgAnomaly: 0.0667 },
  { year: 2013, avgAnomaly: 0.0667 },
  { year: 2014, avgAnomaly: 0.0524 },
  { year: 2015, avgAnomaly: 0.0286 },
  { year: 2016, avgAnomaly: 0.0333 },
  { year: 2017, avgAnomaly: 0.1 },
  { year: 2018, avgAnomaly: 0.0857 },
  { year: 2019, avgAnomaly: 0.0905 },
  { year: 2020, avgAnomaly: 0.1 },
  { year: 2021, avgAnomaly: 0.1238 },
  { year: 2022, avgAnomaly: 0.1333 },
  { year: 2023, avgAnomaly: 0.1048 },
];

const FALLBACK_PROJECTED: ProjectedPoint[] = [
  { year: 2024, projected: 0.1135, lower: 0.0689, upper: 0.1582 },
  { year: 2025, projected: 0.1178, lower: 0.0731, upper: 0.1625 },
  { year: 2026, projected: 0.1221, lower: 0.0774, upper: 0.1668 },
  { year: 2027, projected: 0.1264, lower: 0.0817, upper: 0.1711 },
  { year: 2028, projected: 0.1307, lower: 0.086, upper: 0.1754 },
  { year: 2029, projected: 0.135, lower: 0.0903, upper: 0.1797 },
  { year: 2030, projected: 0.1393, lower: 0.0946, upper: 0.1839 },
  { year: 2031, projected: 0.1435, lower: 0.0988, upper: 0.1882 },
  { year: 2032, projected: 0.1478, lower: 0.1031, upper: 0.1925 },
  { year: 2033, projected: 0.1521, lower: 0.1074, upper: 0.1968 },
];

/**
 * FutureOutlook Component
 *
 * Visualizes 10-year forward sea level projections (2024-2033) based on Ordinary Least Squares (OLS)
 * linear regression model with ±2σ residual error confidence intervals.
 */
export function FutureOutlook() {
  const { data: apiData, isLoading, isError, refetch } = useGetFutureOutlook();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isChartInView, setIsChartInView] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  // Combine API data or fallback dataset seamlessly
  const forecastData = apiData ?? {
    slopeMmPerYear: 4.284,
    r2: 0.7462,
    projectedRise2030: 0.03,
    projectedRise2033: 0.0428,
    historical: FALLBACK_HISTORICAL,
    projected: FALLBACK_PROJECTED,
  };

  // Format historical & projected series into unified Recharts dataset
  const chartData: ForecastChartPoint[] = (() => {
    const historicalSeries = forecastData.historical;
    const projectedSeries = forecastData.projected;

    const lastHist = historicalSeries[historicalSeries.length - 1];
    const lastHistCm = lastHist ? lastHist.avgAnomaly * 100 : null;

    return [
      // 1. Historical Data Points (1993 to 2023)
      ...historicalSeries.map((h) => ({
        year: h.year,
        historical: h.avgAnomaly * 100,
        projected: null,
        lower: null,
        upper: null,
        band: null,
        baseline2023: lastHistCm,
      })),
      // 2. Transition Point (2023 Baseline anchor)
      ...(lastHist
        ? [
          {
            year: lastHist.year,
            historical: lastHistCm,
            projected: lastHistCm,
            lower: lastHistCm,
            upper: lastHistCm,
            band: [lastHistCm!, lastHistCm!] as [number, number],
            baseline2023: lastHistCm,
          },
        ]
        : []),
      // 3. Projected Data Points (2024 to 2033)
      ...projectedSeries.map((p) => ({
        year: p.year,
        historical: null,
        projected: p.projected * 100,
        lower: p.lower * 100,
        upper: p.upper * 100,
        band: [p.lower * 100, p.upper * 100] as [number, number],
        baseline2023: lastHistCm,
      })),
    ];
  })();

  // Card theme selection helpers
  const getTrendTheme = (rate: number) => {
    if (rate >= 5.0) return CARD_THEMES.red;
    if (rate >= 3.5) return CARD_THEMES.orange;
    if (rate >= 2.0) return CARD_THEMES.cyan;
    return CARD_THEMES.teal;
  };

  const getRiseTheme = (riseCm: number) => {
    if (riseCm >= 12.0) return CARD_THEMES.red;
    if (riseCm >= 8.0) return CARD_THEMES.orange;
    if (riseCm >= 4.0) return CARD_THEMES.cyan;
    return CARD_THEMES.teal;
  };

  const getProjectedTheme = (valMm: number) => {
    if (valMm >= 40) return CARD_THEMES.red;
    if (valMm >= 25) return CARD_THEMES.orange;
    if (valMm >= 10) return CARD_THEMES.cyan;
    return CARD_THEMES.teal;
  };

  const historicalSeries = forecastData.historical;
  const totalHistRiseM =
    historicalSeries.length > 1
      ? historicalSeries[historicalSeries.length - 1].avgAnomaly -
      historicalSeries[0].avgAnomaly
      : 0;
  const totalHistRiseCm = totalHistRiseM * 100;

  const trendTheme = getTrendTheme(forecastData.slopeMmPerYear);
  const riseTheme = getRiseTheme(totalHistRiseCm);
  const p2030Theme = getProjectedTheme(forecastData.projectedRise2030 * 1000);
  const p2033Theme = getProjectedTheme(forecastData.projectedRise2033 * 1000);

  return (
    <StorySection id="chapter-forecast">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Future Outlook
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Based on current trends, sea levels are projected to continue rising
            through 2033. The shaded band represents the ±2σ confidence
            interval, illustrating the range of expected outcomes.
          </p>
        </motion.div>

        {isLoading && !apiData ? (
          <div className="h-[480px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <>
            {isError && (
              <div className="max-w-3xl mx-auto mb-8 text-xs bg-red-950/30 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span>Live connection to the database API failed. Displaying cached historic projections.</span>
                </span>
                <button
                  onClick={() => refetch()}
                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-semibold transition cursor-pointer text-[10px]"
                >
                  Retry Connection
                </button>
              </div>
            )}
            {/* Metric Cards Grid (Trend Rate, R² Fit, 2030 Projection, 2033 Projection) */}
            <motion.div
              variants={cardContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10"
            >
              {/* Card 1: Linear Trend Rate */}
              <motion.div
                variants={cardVariants}
                whileHover={trendTheme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Trend Rate
                  </span>
                  <motion.div
                    variants={gaugeIconVariants}
                    className={`${trendTheme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <Gauge className="w-4 h-4" />
                  </motion.div>
                </div>
                <div
                  className={`text-3xl font-serif font-bold tracking-tight ${trendTheme.text}`}
                >
                  +<AnimatedCounter value={forecastData.slopeMmPerYear} decimals={2} />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    mm/yr
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Historical trend line slope
                </div>
              </motion.div>

              {/* Card 2: Historical Net Rise */}
              <motion.div
                variants={cardVariants}
                whileHover={riseTheme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Historical Net Rise
                  </span>
                  <motion.div
                    variants={historyIconVariants}
                    className={`${riseTheme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <History className="w-4 h-4" />
                  </motion.div>
                </div>
                <div
                  className={`text-3xl font-serif font-bold tracking-tight ${riseTheme.text}`}
                >
                  +<AnimatedCounter value={totalHistRiseCm} decimals={1} />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    cm
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Net rise observed (1993–2023)
                </div>
              </motion.div>

              {/* Card 3: Projected Net Rise by 2030 */}
              <motion.div
                variants={cardVariants}
                whileHover={p2030Theme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Projected by 2030
                  </span>
                  <motion.div
                    variants={calendarIconVariants}
                    className={`${p2030Theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <Calendar className="w-4 h-4" />
                  </motion.div>
                </div>
                <div
                  className={`text-3xl font-serif font-bold tracking-tight ${p2030Theme.text}`}
                >
                  +<AnimatedCounter value={forecastData.projectedRise2030 * 100} decimals={1} />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    cm
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Net increase from 2023 baseline
                </div>
              </motion.div>

              {/* Card 4: Projected Net Rise by 2033 */}
              <motion.div
                variants={cardVariants}
                whileHover={p2033Theme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Projected by 2033
                  </span>
                  <motion.div
                    variants={shieldIconVariants}
                    className={`${p2033Theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </motion.div>
                </div>
                <div
                  className={`text-3xl font-serif font-bold tracking-tight ${p2033Theme.text}`}
                >
                  +<AnimatedCounter value={forecastData.projectedRise2033 * 100} decimals={1} />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    cm
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Net 10-year increase (2023–2033)
                </div>
              </motion.div>
            </motion.div>

            {/* Projection ComposedChart Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              onViewportEnter={() => {
                setIsChartInView(true);
                // Turn off isAnimationActive after all sequential animations finish (1500ms historical + 1000ms projection + buffer)
                setTimeout(() => {
                  setIsAnimationActive(false);
                }, 2700);
              }}
              className="bg-card/10 border border-border/30 rounded-2xl pt-6 px-6 pb-6 shadow-2xl"
            >
              {/* Chart Header with title, subtitle, and legend below */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-4 border-b border-white/5 select-none px-1 text-left">
                <div className="max-w-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-100  tracking-wider">
                    Decadal Projection (Through 2033)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Linear trend projection of regional anomalies with a shaded
                    ±2σ confidence interval.
                  </p>
                </div>

                {/* Legend Controls */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-1 self-end md:self-auto flex-shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-primary inline-block rounded" />
                    Historical
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-[#f97316] inline-block" />
                    Projection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-2 bg-[#f97316]/15 border border-[#f97316]/30 inline-block rounded-[2px]" />
                    ±2σ Band
                  </span>
                </div>
              </div>

              {/* Chart Body */}
              <div ref={chartRef} className="h-[380px]">
                <div className="sr-only">
                  This projection chart shows the linear trend projection of regional sea level rise through 2033, based on historical observations from 1993 to 2023.
                  The historical net rise of {totalHistRiseCm.toFixed(1)} cm is projected to continue, reaching a net increase of {(forecastData.projectedRise2030 * 100).toFixed(1)} cm by 2030, and further rising to {(forecastData.projectedRise2033 * 100).toFixed(1)} cm by 2033, relative to the baseline.
                  The shaded band represents the ±2 standard deviation confidence interval showing the range of expected outcomes.
                </div>
                {isChartInView ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 35, right: 35, left: 15, bottom: 8 }}
                    >
                      <defs>
                        <linearGradient
                          id="confidenceGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f97316"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f97316"
                            stopOpacity={0.04}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="year"
                        height={45}
                        stroke="rgba(255,255,255,0.3)"
                        tick={{
                          fontSize: 11,
                          fill: "rgba(255,255,255,0.5)",
                          fontFamily: "monospace",
                        }}
                        tickLine={false}
                        axisLine={false}
                        label={{
                          value: "Year",
                          position: "insideBottom",
                          offset: 0,
                          style: {
                            textAnchor: "middle",
                            fill: "rgba(255, 255, 255, 0.4)",
                            fontSize: 10,
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          },
                        }}
                      />
                      <YAxis
                        width={75}
                        domain={[
                          "auto",
                          (dataMax: number) => Math.ceil(dataMax + 3),
                        ]}
                        stroke="rgba(255,255,255,0.3)"
                        tick={{
                          fontSize: 11,
                          fill: "rgba(255,255,255,0.5)",
                          fontFamily: "monospace",
                        }}
                        tickFormatter={(v) =>
                          `${v > 0 ? "+" : ""}${v.toFixed(1)}`
                        }
                        tickLine={false}
                        axisLine={false}
                        label={{
                          value: "Sea Level Anomaly (cm)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 20,
                          style: {
                            textAnchor: "middle",
                            fill: "rgba(255, 255, 255, 0.4)",
                            fontSize: 10,
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          },
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {!isAnimationActive && (
                        <ReferenceArea
                          x1={2023}
                          x2={2033}
                          fill="#f97316"
                          fillOpacity={0.03}
                        />
                      )}
                      {!isAnimationActive && (
                        <ReferenceLine
                          x={2023}
                          stroke="rgba(255,255,255,0.3)"
                          strokeDasharray="3 3"
                          label={{
                            value: "Now (2023)",
                            position: "top",
                            fill: "rgba(255,255,255,0.6)",
                            fontSize: 10,
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          }}
                        />
                      )}
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />

                      {/* ±2σ Confidence Interval Area */}
                      <Area
                        type="monotone"
                        dataKey="band"
                        stroke="none"
                        fill="url(#confidenceGrad)"
                        connectNulls={true}
                        isAnimationActive={isAnimationActive}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        animationBegin={1500}
                      />

                      {/* Historical Series Line */}
                      <Line
                        type="monotone"
                        dataKey="historical"
                        name="Historical avg"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={isAnimationActive}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        animationBegin={0}
                      />

                      {/* Projected Series Line */}
                      <Line
                        type="monotone"
                        dataKey="projected"
                        name="Projected avg"
                        stroke="#f97316"
                        strokeWidth={3}
                        strokeDasharray="6 4"
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={isAnimationActive}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        animationBegin={1500}
                      />

                      {/* 2030 Milestone Reference Dot */}
                      {!isAnimationActive &&
                        (() => {
                          const pt2030 = chartData.find(
                            (d) => d.year === 2030 && d.projected != null,
                          );
                          const yVal = pt2030?.projected;
                          if (yVal == null) return null;
                          return (
                            <ReferenceDot
                              x={2030}
                              y={yVal}
                              r={4.5}
                              fill="#f97316"
                              stroke="#ffffff"
                              strokeWidth={1.5}
                              label={{
                                value: `2030: +${yVal.toFixed(1)} cm`,
                                position: "top",
                                fill: "#f97316",
                                fontSize: 9,
                                fontWeight: "bold",
                                fontFamily: "monospace",
                              }}
                            />
                          );
                        })()}

                      {/* 2033 Milestone Reference Dot */}
                      {!isAnimationActive &&
                        (() => {
                          const pt2033 = chartData.find(
                            (d) => d.year === 2033 && d.projected != null,
                          );
                          const yVal = pt2033?.projected;
                          if (yVal == null) return null;
                          return (
                            <ReferenceDot
                              x={2033}
                              y={yVal}
                              r={5.5}
                              fill="#f97316"
                              stroke="#ffffff"
                              strokeWidth={2}
                              label={{
                                value: `2033: +${yVal.toFixed(1)} cm`,
                                position: "top",
                                fill: "#f97316",
                                fontSize: 10,
                                fontWeight: "bold",
                                fontFamily: "monospace",
                              }}
                            />
                          );
                        })()}
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              {/* Methodology Disclaimer Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono text-muted-foreground/55 text-center max-w-3xl mx-auto">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 inline-block" />
                  <span>Model: OLS Linear Regression (1993–2023)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400/80 inline-block" />
                  <span>Confidence: ±2× RMSE Residuals</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 inline-block" />
                  <span>R² Score: {(forecastData.r2 * 100).toFixed(1)}%</span>
                </span>
              </div>

              {/* Interaction Helper Text */}
              <p className="text-center text-xs text-muted-foreground mt-3 font-sans select-none">
                Hover over the line or shaded band to inspect historical anomalies
                and future projected values with confidence intervals.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </StorySection>
  );
}
