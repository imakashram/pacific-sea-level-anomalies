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
          {isProjected ? "Expected" : "Past Data"}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Historical Avg readout */}
        {histItem && typeof histItem.value === "number" && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-cyan-400/90 font-medium">Past Data Avg</span>
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
            <span>Likely Range</span>
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
 * FutureOutlook Component
 *
 * Visualizes 10-year forward sea level projections (2024-2033) based on Ordinary Least Squares (OLS)
 * linear regression model or IPCC SSP acceleration scenarios with ±2σ residual error confidence intervals.
 */
export function FutureOutlook() {
  const { data: apiData, isLoading, isError } = useGetFutureOutlook();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isChartInView, setIsChartInView] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [scenario, setScenario] = useState<"linear" | "ssp126" | "ssp245" | "ssp585">("linear");

  const forecastData = apiData!;

  const SCENARIOS = [
    {
      key: "linear" as const,
      label: "Linear (OLS)",
      accel: 0,
      desc: "Extrapolates the historical 30-year trend line with no acceleration."
    },
    {
      key: "ssp126" as const,
      label: "Low Emissions (SSP1-2.6)",
      accel: 0.05,
      desc: "Low emission scenario aligning with Paris target (+1.8°C warming by 2100). Moderate acceleration."
    },
    {
      key: "ssp245" as const,
      label: "Medium Emissions (SSP2-4.5)",
      accel: 0.10,
      desc: "Medium emission scenario aligning with current global policies (+2.7°C warming)."
    },
    {
      key: "ssp585" as const,
      label: "High Emissions (SSP5-8.5)",
      accel: 0.20,
      desc: "High emission, fossil-fueled development scenario (+4.4°C warming). Significant acceleration."
    }
  ];

  const activeScenario = SCENARIOS.find((s) => s.key === scenario) || SCENARIOS[0];
  const accelMm = activeScenario.accel; // mm/yr^2

  // Format historical & projected series into unified Recharts dataset
  const chartData = (() => {
    if (!apiData) return [];
    const historicalSeries = apiData.historical;
    const projectedSeries = apiData.projected;

    const lastHist = historicalSeries[historicalSeries.length - 1];
    const lastHistCm = lastHist ? lastHist.avgAnomaly * 100 : null;

    return [
      ...historicalSeries.map((h) => ({
        year: h.year,
        historical: h.avgAnomaly * 100,
        projected: null,
        lower: null,
        upper: null,
        band: null,
        baseline2023: lastHistCm,
      })),
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
      ...projectedSeries.map((p) => {
        const dt = p.year - 2023;
        // quadratic offset in cm: 0.05 * accelMm * dt^2
        const offsetCm = 0.05 * accelMm * dt * dt;
        const projectedCm = p.projected * 100 + offsetCm;

        const linearProjCm = p.projected * 100;
        const linearUpperCm = p.upper * 100;
        const sigmaCm = linearUpperCm - linearProjCm;

        return {
          year: p.year,
          historical: null,
          projected: parseFloat(projectedCm.toFixed(4)),
          lower: parseFloat((projectedCm - sigmaCm).toFixed(4)),
          upper: parseFloat((projectedCm + sigmaCm).toFixed(4)),
          band: [parseFloat((projectedCm - sigmaCm).toFixed(4)), parseFloat((projectedCm + sigmaCm).toFixed(4))] as [number, number],
          baseline2023: lastHistCm,
        };
      }),
    ];
  })();

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

  const historicalSeries = apiData?.historical ?? [];
  const totalHistRiseM =
    historicalSeries.length > 1
      ? historicalSeries[historicalSeries.length - 1].avgAnomaly -
      historicalSeries[0].avgAnomaly
      : 0;
  const totalHistRiseCm = totalHistRiseM * 100;

  // Calculate dynamic projected net rise vs 2023 baseline in meters
  const dt30 = 2030 - 2023; // 7 years
  const dt33 = 2033 - 2023; // 10 years
  const offset30m = 0.0005 * accelMm * dt30 * dt30;
  const offset33m = 0.0005 * accelMm * dt33 * dt33;

  const activeProjectedRise2030 = apiData ? apiData.projectedRise2030 + offset30m : 0;
  const activeProjectedRise2033 = apiData ? apiData.projectedRise2033 + offset33m : 0;

  const trendTheme = getTrendTheme(apiData?.slopeMmPerYear ?? 0);
  const riseTheme = getRiseTheme(totalHistRiseCm);
  const p2030Theme = getProjectedTheme(activeProjectedRise2030 * 1000);
  const p2033Theme = getProjectedTheme(activeProjectedRise2033 * 1000);

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
            If current trends continue, sea levels are expected to keep rising through 2033. The shaded area shows the likely range of future sea levels.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="h-[480px] bg-card/20 animate-pulse rounded-xl" />
        ) : isError || !apiData ? null : (
          <>
            {/* Metric Cards Grid (Trend Rate, R² Fit, 2030 Projection, 2033 Projection) */}
            <motion.div
              variants={cardContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10 text-left"
            >
              {/* Card 1: Average Rise Rate */}
              <motion.div
                variants={cardVariants}
                whileHover={trendTheme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Average Rise Rate
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
                    mm/year
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Average yearly rise (1993–2023)
                </div>
              </motion.div>

              {/* Card 2: Total Rise So Far */}
              <motion.div
                variants={cardVariants}
                whileHover={riseTheme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Total Rise So Far
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
                  Total rise from 1993–2023
                </div>
              </motion.div>

              {/* Card 3: Expected by 2030 */}
              <motion.div
                variants={cardVariants}
                whileHover={p2030Theme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Expected by 2030
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
                  +<AnimatedCounter value={activeProjectedRise2030 * 100} decimals={1} />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    cm
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Expected rise after 2023
                </div>
              </motion.div>

              {/* Card 4: Expected by 2033 */}
              <motion.div
                variants={cardVariants}
                whileHover={p2033Theme.hover}
                className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                    Expected by 2033
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
                  +<AnimatedCounter value={activeProjectedRise2033 * 100} decimals={1} />
                  <span className="text-sm font-sans text-muted-foreground ml-1">
                    cm
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Expected rise from 2023–2033
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
                setTimeout(() => {
                  setIsAnimationActive(false);
                }, 2700);
              }}
              className="bg-card/10 border border-border/30 rounded-2xl pt-6 px-6 pb-6 shadow-2xl"
            >
              {/* Chart Header with title, subtitle, and legend below */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-4 border-b border-white/5 px-1 text-left">
                <div className="max-w-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-100  tracking-wider">
                    Sea Level Outlook to 2033
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Shows the expected sea level change through 2033 based on past trends. The shaded area shows the likely range of future sea levels.
                  </p>
                </div>

                {/* Legend Controls */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-1 self-end md:self-auto flex-shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-primary inline-block rounded" />
                    Past Data
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-[#f97316] inline-block" />
                    Expected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-2 bg-[#f97316]/15 border border-[#f97316]/30 inline-block rounded-[2px]" />
                    Likely Range
                  </span>
                </div>
              </div>

              {/* Scenario Selector & Explanation */}
              <div className="mb-6 flex flex-col items-center">
                {/* Scenario Tab Selector */}
                <div className="flex flex-wrap justify-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 w-fit">
                  {SCENARIOS.map((s) => {
                    const isActive = s.key === scenario;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setScenario(s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 ${isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                          }`}
                        title={s.desc}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Active Scenario Description */}
                <div className="mt-3 px-1 text-xs text-slate-400 font-sans leading-relaxed max-w-2xl text-center">
                  <span className="font-bold text-slate-200 mr-1.5">Active Scenario:</span>
                  {activeScenario.desc}
                  {accelMm > 0 && (
                    <span className="text-amber-400/90 ml-1.5 font-mono whitespace-nowrap">
                      (Acceleration rate: +{accelMm.toFixed(2)} mm/yr²)
                    </span>
                  )}
                </div>
              </div>

              {/* Chart Body */}
              <div ref={chartRef} className="h-[380px]">
                <div className="sr-only">
                  This projection chart shows the sea level rise projection through 2033, based on historical observations from 1993 to 2023.
                  The historical net rise of {totalHistRiseCm.toFixed(1)} cm is projected to continue, reaching a net increase of {(activeProjectedRise2030 * 100).toFixed(1)} cm by 2030, and further rising to {(activeProjectedRise2033 * 100).toFixed(1)} cm by 2033, relative to the baseline.
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
                            fill: "rgba(255, 255, 255, 0.6)",
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "sans-serif",
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
                          value: "Sea Level Change (cm)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 20,
                          style: {
                            textAnchor: "middle",
                            fill: "rgba(255, 255, 255, 0.6)",
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "sans-serif",
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
                  <span>
                    {scenario === "linear" && "Model: OLS Linear Regression (1993–2023)"}
                    {scenario === "ssp126" && "Model: IPCC SSP1-2.6 (Low Acceleration)"}
                    {scenario === "ssp245" && "Model: IPCC SSP2-4.5 (Medium Acceleration)"}
                    {scenario === "ssp585" && "Model: IPCC SSP5-8.5 (Extreme Acceleration)"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400/80 inline-block" />
                  <span>
                    {scenario === "linear"
                      ? "Confidence: ±2× RMSE Residuals"
                      : "Confidence: Projected ±2× RMSE Baseline"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 inline-block" />
                  <span>
                    {scenario === "linear" && `Historical R² Fit: ${(apiData.r2 * 100).toFixed(1)}%`}
                    {scenario === "ssp126" && "Scenario Target: +1.8°C Warming (2100)"}
                    {scenario === "ssp245" && "Scenario Target: +2.7°C Warming (2100)"}
                    {scenario === "ssp585" && "Scenario Target: +4.4°C Warming (2100)"}
                  </span>
                </span>
              </div>

              {/* Interaction Helper Text */}
              <p className="text-center text-xs text-muted-foreground mt-3 font-sans">
                Move your mouse over the line or shaded area to see past sea levels, expected future sea levels, and their likely range.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </StorySection>
  );
}
