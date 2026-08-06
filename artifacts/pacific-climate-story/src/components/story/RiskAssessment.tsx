import { useGetRiskAssessment } from "@workspace/api-client-react";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LabelList,
  Label,
  ReferenceLine,
} from "recharts";
import { motion, AnimatePresence, useMotionValue, animate, Variants } from "framer-motion";
import { useState, useRef, useEffect } from "react";

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
import {
  AlertOctagon,
  AlertTriangle,
  Shield,
  Activity,
  type LucideIcon,
} from "lucide-react";

/**
 * Risk Level color mapping.
 */
const RISK_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

/**
 * Risk tier card theme properties.
 */
interface RiskTheme {
  text: string;
  bg: string;
  border: string;
  hover: {
    y: number;
    borderColor: string;
    backgroundColor: string;
    boxShadow: string;
  };
  icon: LucideIcon;
}

const RISK_THEMES: Record<string, RiskTheme> = {
  Critical: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(239, 68, 68, 0.5)",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.08)",
    },
    icon: AlertOctagon,
  },
  High: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(249, 115, 22, 0.5)",
      backgroundColor: "rgba(249, 115, 22, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.08)",
    },
    icon: AlertTriangle,
  },
  Medium: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(234, 179, 8, 0.5)",
      backgroundColor: "rgba(234, 179, 8, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.08)",
    },
    icon: Activity,
  },
  Low: {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    hover: {
      y: -6,
      borderColor: "rgba(34, 197, 94, 0.5)",
      backgroundColor: "rgba(34, 197, 94, 0.05)",
      boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.08)",
    },
    icon: Shield,
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

const octagonIconVariants: Variants = {
  hover: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6, ease: "easeInOut" as const },
  },
};

const triangleIconVariants: Variants = {
  hover: {
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.5, ease: "easeInOut" as const },
  },
};

const activityIconVariants: Variants = {
  hover: {
    scale: [1, 1.25, 0.9, 1.15, 1],
    transition: { duration: 0.7, ease: "easeInOut" as const },
  },
};

const shieldIconVariants: Variants = {
  hover: {
    scale: 1.2,
    transition: { type: "spring" as const, stiffness: 300, damping: 10 },
  },
};

/**
 * Helper returning color hexadecimal code for risk score (0-100).
 */
const getScoreColor = (score: number): string => {
  if (score >= 80) return "#ef4444";
  if (score >= 60) return "#f97316";
  if (score >= 40) return "#eab308";
  return "#22c55e";
};

/**
 * Data structure representing a country's risk score assessment.
 */
interface RiskCountry {
  code: string;
  country: string;
  riskScore: number;
  riskLevel: string;
  cumulativeRise: number;
  slope: number;
  volatility: number;
  decadeAcceleration: number;
  components: {
    riseScore: number;
    slopeScore: number;
    volatilityScore: number;
    accelerationScore: number;
  };
}

/**
 * Props definition for the custom BarChart tooltip.
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RiskCountry;
  }>;
}

/**
 * Custom Tooltip displaying detailed breakdown of composite risk index, cumulative rise,
 * annual speed, volatility, and decadal acceleration per nation.
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const d = payload[0]?.payload;
  if (!d) return null;

  const color = RISK_COLORS[d.riskLevel] || "#38bdf8";

  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[240px]">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-2 gap-3">
        <span className="font-serif text-lg font-bold text-white">
          {d.country}
        </span>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border font-semibold"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}40`,
          }}
        >
          {d.riskLevel} Risk
        </span>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center gap-6">
          <span className="text-muted-foreground font-medium">Risk Index</span>
          <span className="font-mono font-bold text-sm" style={{ color }}>
            {d.riskScore}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              / 100
            </span>
          </span>
        </div>

        <div className="flex justify-between items-center gap-6">
          <span className="text-cyan-400/90 font-medium">Cumulative Rise</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {d.cumulativeRise > 0 ? "+" : ""}
            {(d.cumulativeRise * 100).toFixed(1)} cm
          </span>
        </div>

        <div className="flex justify-between items-center gap-6">
          <span className="text-teal-400/90 font-medium">Annual Speed</span>
          <span className="font-mono font-bold text-teal-400">
            {d.slope.toFixed(2)} mm/yr
          </span>
        </div>

        <div className="flex justify-between items-center gap-6">
          <span className="text-purple-400/90 font-medium">
            Volatility Spread
          </span>
          <span className="font-mono font-bold text-purple-400">
            ±{(d.volatility * 100).toFixed(1)} cm
          </span>
        </div>

        <div className="flex justify-between items-center gap-6 pt-1 border-t border-cyan-500/10">
          <span className="text-orange-400/90 font-medium">Decadal Shift</span>
          <span className="font-mono font-bold text-orange-400">
            +{(d.decadeAcceleration * 100).toFixed(1)} cm
          </span>
        </div>
      </div>
    </div>
  );
}


/**
 * RiskAssessment Component
 *
 * Master-detail interactive dashboard evaluating composite climate risk index across 21 Pacific island nations.
 * Combines a master horizontal bar chart with a detailed multi-vector spider/radar chart.
 */
export function RiskAssessment() {
  const { data: apiData, isLoading, isError } = useGetRiskAssessment();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const isChartInView = true;

  const data = apiData!;

  const selectedCountry = selectedCode && data
    ? data.countries.find((c) => c.code === selectedCode)
    : null;

  const radarData = selectedCountry
    ? [
      {
        subject: "Rise",
        value: selectedCountry.components.riseScore,
        fullMark: 100,
      },
      {
        subject: "Speed",
        value: selectedCountry.components.slopeScore,
        fullMark: 100,
      },
      {
        subject: "Volatility",
        value: selectedCountry.components.volatilityScore,
        fullMark: 100,
      },
      {
        subject: "Accel.",
        value: selectedCountry.components.accelerationScore,
        fullMark: 100,
      },
    ]
    : [];

  return (
    <StorySection id="chapter-risk">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-center flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-3">
            Risk Assessment
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            A composite risk score (0–100) combining cumulative rise, rate of
            change, volatility, and decade-over-decade acceleration. This is the
            full picture of existential threat by nation.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="h-[600px] bg-card/20 animate-pulse rounded-xl" />
        ) : isError || !apiData ? null : (
          <>
            {/* Risk Tier Summary Cards Grid */}
            <motion.div
              variants={cardContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8"
            >
              {(["Critical", "High", "Medium", "Low"] as const).map((level) => {
                const count =
                  level === "Critical"
                    ? data.criticalCount
                    : level === "High"
                      ? data.highCount
                      : level === "Medium"
                        ? data.mediumCount
                        : data.lowCount;

                const theme = RISK_THEMES[level];
                const Icon = theme.icon;

                const iconVariants =
                  level === "Critical"
                    ? octagonIconVariants
                    : level === "High"
                      ? triangleIconVariants
                      : level === "Medium"
                        ? activityIconVariants
                        : shieldIconVariants;

                return (
                  <motion.div
                    key={level}
                    variants={cardVariants}
                    whileHover={theme.hover}
                    className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
                  >
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        {level} Risk
                      </span>
                      <motion.div
                        variants={iconVariants}
                        className={`${theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    </div>
                    <div
                      className={`text-4xl font-serif font-bold tracking-tight ${theme.text}`}
                    >
                      <AnimatedCounter value={count} decimals={0} />
                    </div>
                    <div className="text-xs text-muted-foreground/60 font-mono font-medium -mt-1">
                      {level === "Critical"
                        ? "Score ≥ 80"
                        : level === "High"
                          ? "Score 60–79"
                          : level === "Medium"
                            ? "Score 40–59"
                            : "Score < 40"}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {level === "Critical"
                        ? "Existential and immediate threat levels."
                        : level === "High"
                          ? "Significant coastal vulnerability observed."
                          : level === "Medium"
                            ? "Moderate susceptibility to storm surges."
                            : "Relatively stable elevation profiles."}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Master-Detail Dashboard: Ranked Bar Chart + Radar/Spider Chart Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              {/* Left Column: Ranked Bar Chart (Master List) */}
              <div className="lg:col-span-7 bg-card/10 border border-border/30 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-col gap-1 mb-4 pb-3 border-b border-white/5 select-none text-left">
                    <h3 className="text-xs font-mono font-semibold  tracking-wider text-muted-foreground">
                      Composite Risk Score by Nation
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Rankings based on cumulative rise, rate of change,
                      volatility, and exposure.
                    </p>
                  </div>
                  <div className="h-[500px] flex items-center justify-center">
                    <div className="sr-only">
                      This bar chart visualizes the composite risk scores across all 21 Pacific nations.
                      The risk score is calculated as a composite of cumulative rise, rate of change (slope), volatility, and decadal acceleration.
                      Nations are grouped by risk categories such as Critical, High, Moderate, and Low, showing their exposure and vulnerability.
                    </div>
                    {isChartInView ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.countries}
                          layout="vertical"
                          margin={{ top: 25, right: 40, left: 15, bottom: 28 }}
                          barCategoryGap="20%"
                        >
                          <defs>
                            <linearGradient
                              id="grad-Critical"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#f87171" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                            <linearGradient
                              id="grad-High"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#fb923c" />
                              <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                            <linearGradient
                              id="grad-Medium"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#fde047" />
                              <stop offset="100%" stopColor="#eab308" />
                            </linearGradient>
                            <linearGradient
                              id="grad-Low"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#4ade80" />
                              <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                            <filter
                              id="glow"
                              x="-10%"
                              y="-10%"
                              width="120%"
                              height="120%"
                            >
                              <feDropShadow
                                dx="0"
                                dy="0"
                                stdDeviation="3"
                                floodOpacity="0.4"
                              />
                            </filter>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          >
                            <Label
                              value="Risk Score"
                              position="insideBottom"
                              offset={-14}
                              style={{
                                textAnchor: "middle",
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 11,
                                fontWeight: 600,
                                fontFamily: "sans-serif",
                                letterSpacing: "0.05em",
                              }}
                            />
                          </XAxis>
                          <YAxis
                            dataKey="country"
                            type="category"
                            stroke="hsl(var(--muted-foreground))"
                            interval={0}
                            axisLine={false}
                            tick={(tickProps: {
                              x: number;
                              y: number;
                              payload: { value: string };
                            }) => {
                              const { x, y, payload } = tickProps;
                              const countryData = data.countries.find(
                                (c) => c.country === payload.value,
                              );
                              const isSelected =
                                countryData &&
                                selectedCode === countryData.code;
                              const displayCode = countryData
                                ? countryData.code
                                : payload.value;
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  dy={4}
                                  textAnchor="end"
                                  tabIndex={0}
                                  role="button"
                                  aria-label={`Select ${countryData?.country || displayCode}`}
                                  aria-pressed={isSelected}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      if (countryData) {
                                        setSelectedCode(
                                          countryData.code === selectedCode
                                            ? null
                                            : countryData.code,
                                        );
                                      }
                                    }
                                  }}
                                  fill={
                                    isSelected
                                      ? RISK_COLORS[
                                      countryData?.riskLevel || "Low"
                                      ]
                                      : "hsl(var(--muted-foreground))"
                                  }
                                  className={`text-xs font-mono transition-all duration-300 focus:outline-none focus:fill-primary focus:underline ${isSelected ? "font-bold" : "font-normal"
                                    }`}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    countryData &&
                                    setSelectedCode(
                                      countryData.code === selectedCode
                                        ? null
                                        : countryData.code,
                                    )
                                  }
                                >
                                  {displayCode}
                                </text>
                              );
                            }}
                            width={55}
                            tickLine={false}
                          >
                            <Label
                              value="Nation"
                              angle={-90}
                              position="insideLeft"
                              offset={-4}
                              style={{
                                textAnchor: "middle",
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                                fontWeight: 600,
                                fontFamily: "monospace",
                                letterSpacing: "0.05em",
                              }}
                            />
                          </YAxis>
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "hsl(var(--muted)/0.1)" }}
                          />
                          <ReferenceLine
                            x={data.avgRiskScore}
                            stroke="#38bdf8"
                            strokeDasharray="3 3"
                            strokeWidth={1.5}
                            label={(refProps: {
                              viewBox?: {
                                x: number;
                                y: number;
                                height: number;
                              };
                            }) => {
                              const viewBox = refProps.viewBox;
                              if (!viewBox) return <g />;
                              const { x, y, height } = viewBox;
                              return (
                                <g>
                                  {/* Top Label */}
                                  <g transform={`translate(${x}, -10)`}>
                                    <rect
                                      x={-36}
                                      y={-9}
                                      width={72}
                                      height={18}
                                      rx={4}
                                      fill="hsl(var(--card))"
                                      stroke="#38bdf8"
                                      strokeWidth={1}
                                    />
                                    <text
                                      x={0}
                                      y={0}
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      fill="#38bdf8"
                                      fontSize={10}
                                      fontFamily="monospace"
                                      fontWeight={700}
                                    >
                                      Avg: {data.avgRiskScore}
                                    </text>
                                  </g>

                                  {/* Bottom Label */}
                                  <g
                                    transform={`translate(${x}, ${y + height - 12})`}
                                  >
                                    <rect
                                      x={-36}
                                      y={-9}
                                      width={72}
                                      height={18}
                                      rx={4}
                                      fill="hsl(var(--card))"
                                      stroke="#38bdf8"
                                      strokeWidth={1}
                                    />
                                    <text
                                      x={0}
                                      y={0}
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      fill="#38bdf8"
                                      fontSize={10}
                                      fontFamily="monospace"
                                      fontWeight={700}
                                    >
                                      Avg: {data.avgRiskScore}
                                    </text>
                                  </g>
                                </g>
                              );
                            }}
                          />
                          <Bar
                            dataKey="riskScore"
                            name="Risk Score"
                            radius={[0, 4, 4, 0]}
                            onClick={(d: unknown) => {
                              const item = d as RiskCountry;
                              setSelectedCode(
                                item.code === selectedCode ? null : item.code,
                              );
                            }}
                            cursor="pointer"
                            isAnimationActive={false}
                          >
                            <LabelList
                              dataKey="riskScore"
                              position="right"
                              fill="hsl(var(--muted-foreground))"
                              fontSize={10}
                              fontWeight={600}
                              fontFamily="monospace"
                              dx={8}
                            />
                            {data.countries.map((entry) => (
                              <Cell
                                key={entry.code}
                                fill={`url(#grad-${entry.riskLevel})`}
                                opacity={
                                  selectedCode === null ||
                                    selectedCode === entry.code
                                    ? 1
                                    : 0.35
                                }
                                stroke={
                                  selectedCode === entry.code
                                    ? RISK_COLORS[entry.riskLevel]
                                    : "none"
                                }
                                strokeWidth={
                                  selectedCode === entry.code ? 1.5 : 0
                                }
                                style={{
                                  filter:
                                    selectedCode === entry.code
                                      ? `url(#glow)`
                                      : "none",
                                  transition: "all 0.3s ease",
                                }}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-muted-foreground/35 text-xs font-mono animate-pulse">
                        Loading risk profile visualization...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Radar/Spider Chart (Detail Vulnerability Vectors) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="lg:col-span-5 bg-card/10 border border-border/30 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between min-h-[560px]"
              >
                <div>
                  <div className="flex flex-col gap-1 mb-4 pb-3 border-b border-white/5 select-none text-left">
                    <h3 className="text-xs font-mono font-semibold  tracking-wider text-muted-foreground">
                      {selectedCountry
                        ? `${selectedCountry.country} (${selectedCountry.code})`
                        : "Nation Detail Breakdown"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Vulnerability vectors mapping localized exposure.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedCountry ? (
                      <motion.div
                        key={selectedCode || "detail"}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="flex flex-col gap-1"
                      >
                        <div>
                          <div
                            className="text-4xl font-mono font-bold tracking-tight mb-0.5"
                            style={{
                              color: RISK_COLORS[selectedCountry.riskLevel],
                            }}
                          >
                            <AnimatedCounter value={selectedCountry.riskScore} decimals={1} />
                            <span className="text-base font-mono text-muted-foreground ml-2">
                              / 100
                            </span>
                          </div>
                          <p
                            className="text-xs font-mono font-semibold uppercase tracking-wider"
                            style={{
                              color: RISK_COLORS[selectedCountry.riskLevel],
                            }}
                          >
                            {selectedCountry.riskLevel} Risk
                          </p>
                        </div>

                        <div className="h-[360px] w-full flex items-center justify-center -mt-2">
                          <div className="sr-only">
                            This radar chart displays the relative risk component scores for the selected country, {selectedCountry.country}.
                            It details the individual scores for sea level rise, rate of change (slope), volatility, and decadal acceleration, each normalized on a scale from 0 to 100.
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={radarData}
                              outerRadius="84%"
                              margin={{
                                top: 10,
                                right: 35,
                                bottom: 10,
                                left: 35,
                              }}
                            >
                              <defs>
                                <linearGradient
                                  id={`radar-grad-${selectedCountry.riskLevel}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor={
                                      RISK_COLORS[selectedCountry.riskLevel]
                                    }
                                    stopOpacity={0.4}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor={
                                      RISK_COLORS[selectedCountry.riskLevel]
                                    }
                                    stopOpacity={0.05}
                                  />
                                </linearGradient>
                              </defs>
                              <PolarGrid stroke="hsl(var(--border)/0.5)" />
                              <PolarAngleAxis
                                dataKey="subject"
                                tick={(polarProps: {
                                  x: number;
                                  y: number;
                                  cx: number;
                                  cy: number;
                                  payload: { value: string };
                                  textAnchor:
                                  | "end"
                                  | "inherit"
                                  | "middle"
                                  | "start"
                                  | undefined;
                                }) => {
                                  const { x, y, cx, cy, payload, textAnchor } =
                                    polarProps;
                                  const angle = Math.atan2(y - cy, x - cx);
                                  const offset = 8;
                                  const newX = x + Math.cos(angle) * offset;
                                  const newY = y + Math.sin(angle) * offset;
                                  return (
                                    <g transform={`translate(${newX}, ${newY})`}>
                                      <text
                                        textAnchor={textAnchor}
                                        fontSize={11}
                                        fontFamily="monospace"
                                        fill="hsl(var(--foreground))"
                                        fontWeight={600}
                                      >
                                        {payload.value}
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              <Radar
                                name={selectedCountry.country}
                                dataKey="value"
                                stroke={RISK_COLORS[selectedCountry.riskLevel]}
                                fill={`url(#radar-grad-${selectedCountry.riskLevel})`}
                                fillOpacity={1}
                                strokeWidth={2.5}
                                dot={{
                                  fill: RISK_COLORS[selectedCountry.riskLevel],
                                  r: 4,
                                  strokeWidth: 2,
                                  stroke: "hsl(var(--background))",
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Component breakdown mini cards */}
                        <motion.div
                          variants={cardContainerVariants}
                          initial="hidden"
                          animate="show"
                          className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/20"
                        >
                          {radarData.map((item) => {
                            const itemColor = getScoreColor(item.value);
                            return (
                              <motion.div
                                key={item.subject}
                                variants={cardVariants}
                                className="bg-card/40 border border-border/30 rounded-lg p-2 text-center"
                              >
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                  {item.subject}
                                </p>
                                <p
                                  className="text-base font-mono font-bold mt-0.5"
                                  style={{ color: itemColor }}
                                >
                                  <AnimatedCounter value={item.value} decimals={0} />
                                  <span className="text-[9px] text-muted-foreground font-normal">
                                    /100
                                  </span>
                                </p>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/20 rounded-xl my-6 min-h-[300px]"
                      >
                        <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-4">
                          <AlertTriangle className="w-6 h-6 text-muted-foreground/50 animate-pulse" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          No nation selected
                        </p>
                        <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                          Click on any nation's bar or label to view its detailed
                          climate vulnerability vectors and index scores on the
                          radar chart.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Interaction Helper Text */}
            <p className="text-center text-xs text-muted-foreground mt-4 font-sans select-none">
              Click on any nation's bar or label to view its detailed climate
              vulnerability vectors and index scores on the radar chart.
            </p>
          </>
        )}
      </div>
    </StorySection>
  );
}
