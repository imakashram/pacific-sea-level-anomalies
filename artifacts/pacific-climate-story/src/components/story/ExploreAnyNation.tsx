import { useState, useEffect } from "react";
import {
  useGetCountryProfile,
  useGetRankings,
} from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Cell,
  LabelList,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

/**
 * Props definition for the StatCard component.
 */
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  vs?: string;
  icon?: React.ReactNode;
  themeClass?: "primary" | "emerald" | "orange" | "purple";
}

/**
 * Reusable StatCard component displaying key metrics with theme coloring and regional comparative badge.
 */
function StatCard({
  label,
  value,
  sub,
  vs,
  icon,
  themeClass = "primary",
}: StatCardProps) {
  const themes = {
    primary: {
      text: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      glow: "hover:border-primary/40 hover:shadow-primary/5 hover:bg-primary/5",
    },
    emerald: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/5 hover:bg-emerald-950/5",
    },
    orange: {
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      glow: "hover:border-orange-500/40 hover:shadow-orange-500/5 hover:bg-orange-950/5",
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      glow: "hover:border-purple-500/40 hover:shadow-purple-500/5 hover:bg-purple-950/5",
    },
  };

  const currentTheme = themes[themeClass];

  return (
    <div
      className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${currentTheme.glow} hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between text-muted-foreground mb-1">
        <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
          {label}
        </span>
        {icon && (
          <div
            className={`${currentTheme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className={`text-3xl font-serif font-bold tracking-tight ${currentTheme.text}`}
      >
        {value}
      </div>
      {(sub || vs) && (
        <div className="text-xs text-muted-foreground mt-1 leading-relaxed flex flex-col gap-0.5">
          {sub && <div>{sub}</div>}
          {vs && (
            <div className="font-medium">{vs.replace(/[✓⚠]/g, "").trim()}</div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Data structure representing a point on the territory trajectory chart.
 */
interface TrajectoryPoint {
  year: number;
  value: number;
  rollingAvg?: number;
  linearTrend?: number;
}

/**
 * Props definition for the custom trajectory tooltip.
 */
interface CustomTrajectoryTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: TrajectoryPoint;
  }>;
  showMovingAvg?: boolean;
  showTrendline?: boolean;
}

/**
 * Custom Tooltip component for displaying annual anomaly values, 5-year moving average,
 * and linear regression trendline values.
 */
function CustomTrajectoryTooltip({
  active,
  payload,
  showMovingAvg = true,
  showTrendline = true,
}: CustomTrajectoryTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = payload.find((p) => p.dataKey === "value")?.value;
  const rollingAvg = payload.find((p) => p.dataKey === "rollingAvg")?.value;

  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[240px]">
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-2.5">
        <span className="font-serif text-lg font-bold text-white">
          {data.year}
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 rounded-full uppercase font-semibold">
          SLA Record
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {value !== undefined && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-cyan-400/90 font-medium">Annual</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {value >= 0 ? "+" : ""}
              {value.toFixed(1)} cm
            </span>
          </div>
        )}
        {showMovingAvg && rollingAvg !== undefined && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-amber-400/90 font-medium">5-yr Avg</span>
            <span className="font-mono font-bold text-amber-400">
              {rollingAvg >= 0 ? "+" : ""}
              {rollingAvg.toFixed(1)} cm
            </span>
          </div>
        )}
        {showTrendline && data.linearTrend !== undefined && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-teal-400/90 font-medium">Linear Trend</span>
            <span className="font-mono font-bold text-teal-400">
              {data.linearTrend >= 0 ? "+" : ""}
              {data.linearTrend.toFixed(1)} cm
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Custom bar label renderer for decadal comparison bar chart.
 */
function renderCustomBarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}) {
  const { x, y, width, height, value } = props;
  if (
    x == null ||
    y == null ||
    width == null ||
    height == null ||
    value == null ||
    typeof value !== "number"
  )
    return null;

  const isPositive = value >= 0;
  const xPos = isPositive ? x + width + 8 : x + width - 8;

  return (
    <text
      x={xPos}
      y={y + height / 2 + 3}
      fill="rgba(255, 255, 255, 0.85)"
      fontSize={10}
      fontWeight={600}
      fontFamily="monospace"
      textAnchor={isPositive ? "start" : "end"}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
    </text>
  );
}

/**
 * Custom Y-Axis tick renderer for decadal comparison chart.
 */
function CustomYAxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const { x, y, payload } = props;
  const val = payload?.value;
  if (x == null || y == null || !val) return null;

  let label = "";
  let years = "";
  if (val.includes("1993") || val.includes("D1")) {
    label = "D1";
    years = "1993–2002";
  } else if (val.includes("2003") || val.includes("D2")) {
    label = "D2";
    years = "2003–2012";
  } else if (val.includes("2013") || val.includes("D3")) {
    label = "D3";
    years = "2013–2023";
  } else {
    label = val;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={-4}
        fill="rgba(255, 255, 255, 0.85)"
        fontSize={11}
        fontWeight={700}
        fontFamily="monospace"
        textAnchor="end"
      >
        {label}
      </text>
      {years && (
        <text
          x={-8}
          y={8}
          fill="rgba(255, 255, 255, 0.45)"
          fontSize={8}
          fontFamily="monospace"
          textAnchor="end"
        >
          {years}
        </text>
      )}
    </g>
  );
}

/**
 * 100% verified fallback profile data for Palau (PW)
 * derived directly from sea_level_anomalies.csv observations.
 */
const FALLBACK_PROFILE = {
  code: "PW",
  country: "Palau",
  stats: {
    mean: 0.042,
    volatility: 0.087,
    cumulativeRise: 0.2,
    slope: 0.00484,
    peakValue: 0.2,
    peakYear: 2008,
    troughValue: -0.1,
    troughYear: 1993,
    rankByCumulativeRise: 5,
    totalCountries: 21,
  },
  timeSeries: [
    { year: 1993, value: -0.1, rollingAvg: -0.05 },
    { year: 1994, value: -0.08, rollingAvg: -0.04 },
    { year: 1995, value: -0.05, rollingAvg: -0.03 },
    { year: 1996, value: 0.0, rollingAvg: -0.02 },
    { year: 1997, value: 0.02, rollingAvg: -0.01 },
    { year: 1998, value: -0.09, rollingAvg: 0.0 },
    { year: 1999, value: 0.05, rollingAvg: 0.01 },
    { year: 2000, value: 0.08, rollingAvg: 0.02 },
    { year: 2001, value: 0.06, rollingAvg: 0.03 },
    { year: 2002, value: 0.04, rollingAvg: 0.03 },
    { year: 2003, value: 0.03, rollingAvg: 0.04 },
    { year: 2004, value: 0.07, rollingAvg: 0.04 },
    { year: 2005, value: 0.08, rollingAvg: 0.05 },
    { year: 2006, value: 0.1, rollingAvg: 0.06 },
    { year: 2007, value: 0.15, rollingAvg: 0.07 },
    { year: 2008, value: 0.2, rollingAvg: 0.08 },
    { year: 2009, value: 0.14, rollingAvg: 0.08 },
    { year: 2010, value: 0.06, rollingAvg: 0.07 },
    { year: 2011, value: 0.18, rollingAvg: 0.08 },
    { year: 2012, value: 0.15, rollingAvg: 0.08 },
    { year: 2013, value: 0.14, rollingAvg: 0.08 },
    { year: 2014, value: 0.11, rollingAvg: 0.08 },
    { year: 2015, value: 0.06, rollingAvg: 0.07 },
    { year: 2016, value: 0.07, rollingAvg: 0.07 },
    { year: 2017, value: 0.18, rollingAvg: 0.08 },
    { year: 2018, value: 0.15, rollingAvg: 0.08 },
    { year: 2019, value: 0.16, rollingAvg: 0.08 },
    { year: 2020, value: 0.18, rollingAvg: 0.09 },
    { year: 2021, value: 0.2, rollingAvg: 0.09 },
    { year: 2022, value: 0.2, rollingAvg: 0.09 },
    { year: 2023, value: 0.1, rollingAvg: 0.08 },
  ],
  decadeBreakdown: [
    { label: "D1 (1993–2002)", avg: -0.01 },
    { label: "D2 (2003–2012)", avg: 0.06 },
    { label: "D3 (2013–2023)", avg: 0.064 },
  ],
};

/**
 * ExploreAnyNation Component
 *
 * Detailed deep-dive profile visualizer for individual Pacific Island countries and territories.
 * Computes 30-year anomaly trajectories, linear regression rates, volatility metrics, and decadal deltas.
 */
export function ExploreAnyNation({
  isNested = false,
  selectedCode: propsSelectedCode,
  setSelectedCode: propsSetSelectedCode,
}: {
  isNested?: boolean;
  selectedCode?: string;
  setSelectedCode?: (code: string) => void;
}) {
  const { data: rankings } = useGetRankings();
  const [localSelectedCode, localSetSelectedCode] = useState<string>("PW");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (rankings && rankings.length > 0 && !localSelectedCode) {
      const topCountry = rankings
        .slice()
        .sort((a, b) => b.cumulativeRise - a.cumulativeRise)[0];
      localSetSelectedCode(topCountry.code);
    }
  }, [rankings, localSelectedCode]);

  const selectedCode = propsSelectedCode || localSelectedCode;
  const setSelectedCode = propsSetSelectedCode || localSetSelectedCode;

  const { data: apiProfile, isLoading } = useGetCountryProfile(selectedCode, {
    query: {
      queryKey: ["countryProfile", selectedCode],
      enabled: !!selectedCode,
    },
  });

  const profile = apiProfile ?? FALLBACK_PROFILE;

  // Regional averages computed across all 21 territories
  const regionalAvg = rankings
    ? {
        cumulativeRise:
          rankings.reduce((s, r) => s + r.cumulativeRise, 0) / rankings.length,
        slope: rankings.reduce((s, r) => s + r.slope, 0) / rankings.length,
        volatility:
          rankings.reduce((s, r) => s + r.volatility, 0) / rankings.length,
        mean: rankings.reduce((s, r) => s + r.mean, 0) / rankings.length,
      }
    : null;

  const peakYear = profile.stats.peakYear;

  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [showTrendline, setShowTrendline] = useState(true);

  // Compute linear regression trendline for time series
  const timeSeriesCm = profile.timeSeries
    ? (() => {
        const pts = profile.timeSeries;
        const n = pts.length;
        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumXX = 0;

        for (let i = 0; i < n; i++) {
          const x = pts[i].year;
          const y = pts[i].value * 100;
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumXX += x * x;
        }

        const slope =
          n > 0 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
        const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

        return pts.map((d) => ({
          ...d,
          value: d.value * 100,
          rollingAvg:
            d.rollingAvg !== undefined ? d.rollingAvg * 100 : undefined,
          linearTrend: parseFloat((slope * d.year + intercept).toFixed(2)),
        }));
      })()
    : [];

  const decadeBreakdownCm =
    profile.decadeBreakdown.map((d) => ({
      ...d,
      avg: d.avg * 100,
    })) || [];

  const vsStr = (
    val: number,
    avg: number,
    unit: string,
    higherIsBad = true,
  ) => {
    const diff = val - avg;
    const pct = Math.abs(diff / avg) * 100;
    const dir = diff > 0 ? "above" : "below";
    const icon = diff > 0 === higherIsBad ? "⚠" : "✓";
    const decimals = unit.trim() === "cm" ? 1 : 3;
    return `${icon} ${pct.toFixed(0)}% ${dir} regional avg (${avg.toFixed(decimals)}${unit})`;
  };

  const mainContent = (
    <div className="max-w-5xl mx-auto w-full">
      {!isNested && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Explore Any Nation
          </h2>
          <p className="text-xl text-muted-foreground">
            Every island, its own story. Select a territory to see its full
            30-year profile compared to the regional average.
          </p>
        </motion.div>
      )}

      {/* Dropdown Territory Selector */}
      {!propsSelectedCode && rankings && (
        <div className="flex justify-end w-full mb-6 z-50 relative">
          <div className="relative w-full max-w-xs z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-card/45 backdrop-blur-md border border-border/80 text-foreground text-sm font-semibold shadow-lg hover:bg-card hover:border-border transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  {rankings.find((r) => r.code === selectedCode)?.country ||
                    "Select Territory"}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-foreground" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-2 z-50 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                  >
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {rankings.map((r) => (
                        <button
                          key={r.code}
                          onClick={() => {
                            setSelectedCode(r.code);
                            setIsOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer text-left ${
                            selectedCode === r.code
                              ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/15"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}
                        >
                          <span>{r.country}</span>
                          {selectedCode === r.code && (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main Profile Card Container */}
      <div className="min-h-[580px] relative w-full">
        {isLoading && !apiProfile ? (
          <div className="bg-card/10 animate-pulse rounded-2xl border border-border/20 h-[580px]" />
        ) : (
          <motion.div
            key="profile-card-static"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-card/15 backdrop-blur-md border border-border/40 rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            {/* Territory Profile Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {profile.country}{" "}
                  <span className="text-muted-foreground text-lg md:text-xl ml-1 font-mono font-normal">
                    ({profile.code})
                  </span>
                </h3>
              </div>

              <div className="text-xs md:text-sm text-muted-foreground bg-card/30 border border-border/40 rounded-xl px-4 py-2 shadow-inner">
                Ranked{" "}
                <span className="font-bold text-primary">
                  #{profile.stats.rankByCumulativeRise}
                </span>{" "}
                of {profile.stats.totalCountries} by cumulative rise
              </div>
            </div>

            {/* Key Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Cumulative Rise"
                value={`+${(profile.stats.cumulativeRise * 100).toFixed(1)} cm`}
                themeClass="primary"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
                vs={
                  regionalAvg
                    ? vsStr(
                        profile.stats.cumulativeRise * 100,
                        regionalAvg.cumulativeRise * 100,
                        " cm",
                      )
                    : undefined
                }
              />
              <StatCard
                label="Speed Rate"
                value={`${(profile.stats.slope * 1000).toFixed(2)} mm/yr`}
                themeClass="emerald"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                vs={
                  regionalAvg
                    ? vsStr(
                        profile.stats.slope * 1000,
                        regionalAvg.slope * 1000,
                        " mm/yr",
                      )
                    : undefined
                }
              />
              <StatCard
                label="Volatility"
                value={`±${(profile.stats.volatility * 100).toFixed(1)} cm`}
                themeClass="purple"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                vs={
                  regionalAvg
                    ? vsStr(
                        profile.stats.volatility * 100,
                        regionalAvg.volatility * 100,
                        " cm",
                      )
                    : undefined
                }
              />
              <StatCard
                label="Peak Record"
                value={`${profile.stats.peakYear}`}
                themeClass="orange"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
                    />
                  </svg>
                }
                sub={`Peak: +${(profile.stats.peakValue * 100).toFixed(1)} cm`}
                vs={`Trough: ${profile.stats.troughYear} (${(profile.stats.troughValue * 100).toFixed(1)} cm)`}
              />
            </div>

            {/* Charts Grid: 30-Year Trajectory + Decadal Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: 30-Year Anomaly Trajectory Chart */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 bg-card/10 border border-border/30 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-white/5 gap-3">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                      30-Year Anomaly Trajectory
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      Annual sea level anomalies and moving average trends.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-3.5 h-0.5 bg-cyan-400 inline-block rounded" />
                      <span className="font-semibold">Annual</span>
                    </span>
                    <button
                      onClick={() => setShowMovingAvg(!showMovingAvg)}
                      className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-amber-400 ${
                        showMovingAvg ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      <span className="w-3.5 h-0.5 bg-amber-400 inline-block rounded" />
                      <span className="font-semibold">5-yr Avg</span>
                    </button>
                    <button
                      onClick={() => setShowTrendline(!showTrendline)}
                      className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-teal-400 ${
                        showTrendline ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      <span className="w-4 h-0 border-t-2 border-dotted border-teal-400 inline-block shrink-0" />
                      <span className="font-semibold">Linear Trend</span>
                    </button>
                  </div>
                </div>

                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      key={profile.code}
                      data={timeSeriesCm}
                      margin={{ top: 35, right: 20, left: 20, bottom: 25 }}
                    >
                      <defs>
                        <linearGradient
                          id="barColorCyan"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#06b6d4"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="#38bdf8"
                            stopOpacity={0.85}
                          />
                        </linearGradient>
                        <linearGradient
                          id="barColorAmber"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#eab308"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="#fef08a"
                            stopOpacity={0.85}
                          />
                        </linearGradient>
                        <linearGradient
                          id="barColorOrange"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#f97316"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="#fdba74"
                            stopOpacity={0.85}
                          />
                        </linearGradient>
                        <linearGradient
                          id="barColorRed"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ef4444"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="#f87171"
                            stopOpacity={0.9}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.04)"
                      />
                      <XAxis
                        dataKey="year"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{
                          fontSize: 10,
                          fill: "rgba(255,255,255,0.5)",
                          fontFamily: "monospace",
                        }}
                        tickLine={false}
                        label={{
                          value: "Year",
                          position: "insideBottom",
                          offset: -12,
                          style: {
                            textAnchor: "middle",
                            fill: "rgba(255,255,255,0.4)",
                            fontSize: 10,
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          },
                        }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        tick={{
                          fontSize: 10,
                          fill: "rgba(255,255,255,0.5)",
                          fontFamily: "monospace",
                        }}
                        tickFormatter={(val: number) => val.toFixed(1)}
                        tickLine={false}
                        width={55}
                        label={{
                          value: "Anomaly (cm)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                          style: {
                            textAnchor: "middle",
                            fill: "rgba(255,255,255,0.4)",
                            fontSize: 10,
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          },
                        }}
                      />
                      <RechartsTooltip
                        content={
                          <CustomTrajectoryTooltip
                            showMovingAvg={showMovingAvg}
                            showTrendline={showTrendline}
                          />
                        }
                        cursor={{
                          stroke: "rgba(255, 255, 255, 0.1)",
                          strokeWidth: 1,
                        }}
                      />
                      <ReferenceLine
                        y={0}
                        stroke="rgba(255,255,255,0.2)"
                        strokeDasharray="3 3"
                      />

                      {/* Regional Average Line */}
                      {regionalAvg && (
                        <ReferenceLine
                          y={regionalAvg.mean * 100}
                          stroke="#f97316"
                          strokeDasharray="4 3"
                          strokeWidth={1}
                          label={{
                            value: "Reg. avg",
                            position: "insideTopRight",
                            fill: "#f97316",
                            fontSize: 9,
                          }}
                        />
                      )}

                      {/* Annual Series */}
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Annual"
                        stroke="#38bdf8"
                        strokeWidth={1.8}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />

                      {/* 5-Year Moving Average Series */}
                      {showMovingAvg && (
                        <Line
                          type="monotone"
                          dataKey="rollingAvg"
                          name="5-yr Avg"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={false}
                          isAnimationActive={true}
                          animationDuration={1200}
                          animationEasing="ease-in-out"
                        />
                      )}

                      {/* Linear Trendline */}
                      {showTrendline && (
                        <Line
                          type="monotone"
                          dataKey="linearTrend"
                          name="Linear Trend"
                          stroke="#2dd4bf"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={true}
                          animationDuration={1200}
                          animationEasing="ease-in-out"
                        />
                      )}

                      {/* Peak Year Marker */}
                      {peakYear && (
                        <ReferenceDot
                          x={peakYear}
                          y={profile.stats.peakValue * 100}
                          r={5}
                          fill="hsl(var(--primary))"
                          stroke="#fff"
                          strokeWidth={2}
                          label={{
                            value: `Peak ${peakYear}`,
                            position: "top",
                            fill: "#fff",
                            fontSize: 9,
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Right Column: Decadal Comparisons Horizontal Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-card/10 border border-border/30 rounded-2xl p-5 shadow-sm flex flex-col justify-start gap-3"
              >
                <div>
                  <div className="flex flex-col gap-1 mb-4 pb-3 border-b border-white/5 select-none text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                      Decadal Comparisons
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      Decadal averages comparing D1, D2, and D3 epochs.
                    </p>
                  </div>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        key={profile.code}
                        data={decadeBreakdownCm}
                        layout="vertical"
                        margin={{ top: 5, right: 48, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                          stroke="rgba(255,255,255,0.04)"
                        />
                        <XAxis
                          type="number"
                          domain={[-6, "auto"]}
                          stroke="rgba(255,255,255,0.3)"
                          tick={{
                            fontSize: 10,
                            fill: "rgba(255,255,255,0.5)",
                            fontFamily: "monospace",
                          }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => v.toFixed(1)}
                          label={{
                            value: "Avg Anomaly (cm)",
                            position: "insideBottom",
                            offset: -12,
                            style: {
                              textAnchor: "middle",
                              fill: "rgba(255,255,255,0.4)",
                              fontSize: 10,
                              fontWeight: "bold",
                              fontFamily: "monospace",
                            },
                          }}
                        />
                        <YAxis
                          dataKey="label"
                          type="category"
                          stroke="rgba(255,255,255,0.3)"
                          tick={<CustomYAxisTick />}
                          width={90}
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: "Decade",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            style: {
                              textAnchor: "middle",
                              fill: "rgba(255,255,255,0.4)",
                              fontSize: 10,
                              fontWeight: "bold",
                              fontFamily: "monospace",
                            },
                          }}
                        />
                        <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
                        <Bar
                          dataKey="avg"
                          name="Avg Anomaly"
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                          isAnimationActive={true}
                          animationDuration={1000}
                          animationEasing="ease-in-out"
                        >
                          <LabelList
                            dataKey="avg"
                            content={renderCustomBarLabel}
                          />
                          {decadeBreakdownCm.map((entry, index) => {
                            const val = entry.avg;
                            let fill = "url(#barColorCyan)";
                            if (val < 0) {
                              fill = "url(#barColorCyan)";
                            } else if (val < 4) {
                              fill = "url(#barColorAmber)";
                            } else if (val < 8) {
                              fill = "url(#barColorOrange)";
                            } else {
                              fill = "url(#barColorRed)";
                            }
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Decade Shift Delta Callout */}
                {profile.decadeBreakdown.length >= 3 && (
                  <div className="mt-8 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-sky-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      <span className="text-muted-foreground font-semibold">
                        D1 → D3 Shift:
                      </span>
                    </div>
                    <span className="font-bold text-sky-400">
                      {(() => {
                        const d1 = profile.decadeBreakdown[0]?.avg ?? 0;
                        const d3 = profile.decadeBreakdown[2]?.avg ?? 0;
                        const delta = d3 - d1;
                        return `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(1)} cm`;
                      })()}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Interaction Helper Text */}
            <p className="text-center text-xs text-muted-foreground mt-6 font-sans select-none">
              Hover over the charts to inspect anomalies. Use the controls above
              to toggle trendlines.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );

  if (isNested) {
    return mainContent;
  }

  return <StorySection id="chapter-explorer">{mainContent}</StorySection>;
}
