import { StorySection } from "./StorySection";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import {
  useGetDecadeAnalysis,
  useGetPaceOfChange,
  useGetDataLandscape,
  useGetWhatThisMeans,
  useGetPacificAtAGlance,
} from "@workspace/api-client-react";
import { useEffect, useRef } from "react";
import {
  ChevronsUp,
  Waves,
  AlertCircle,
  AlertTriangle,
  ArrowUpCircle,
  Gauge,
  type LucideIcon,
} from "lucide-react";

/**
 * Props definition for the AnimatedCount component.
 */
interface AnimatedCountProps {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Utility component that smoothly animates numeric counters when scrolled into view.
 * Powered by Framer Motion native animation to avoid React re-rendering latency.
 */
function AnimatedCount({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
}: AnimatedCountProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, target, decimals, prefix, suffix, motionValue]);

  return (
    <span ref={ref}>
      {prefix}
      {target.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Card theme color dictionary for key takeaway cards.
 */
interface CardTheme {
  text: string;
  bg: string;
  border: string;
  glow: string;
}

const CARD_THEMES: Record<string, CardTheme> = {
  "text-[#f43f5e]": {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "hover:border-rose-500/40 hover:shadow-rose-500/5 hover:bg-rose-950/5",
  },
  "text-[#f97316]": {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "hover:border-orange-500/40 hover:shadow-orange-500/5 hover:bg-orange-950/5",
  },
  "text-[#eab308]": {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    glow: "hover:border-yellow-500/40 hover:shadow-yellow-500/5 hover:bg-yellow-950/5",
  },
  "text-[#ef4444]": {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "hover:border-red-500/40 hover:shadow-red-500/5 hover:bg-red-950/5",
  },
  "text-[#38bdf8]": {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "hover:border-cyan-500/40 hover:shadow-cyan-500/5 hover:bg-cyan-950/5",
  },
  "text-[#2dd4bf]": {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "hover:border-teal-500/40 hover:shadow-teal-500/5 hover:bg-teal-950/5",
  },
};

/**
 * Metric item definition for takeaways grid.
 */
interface TakeawayItem {
  value: number;
  of: number | null;
  label: string;
  color: string;
  desc: string;
  decimals: number;
  prefix: string;
  suffix: string;
  icon: LucideIcon;
}

const headerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const childVariants = {
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

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
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
 * WhatThisMeans Component
 *
 * Concluding synthesis section aggregating key statistical findings from 30 years of observation across
 * 21 Pacific island territories into an animated 6-metric summary grid.
 */
export function WhatThisMeans() {
  const { data: apiAccelData, isLoading: accelLoading, isError: accelError } = useGetPaceOfChange();
  const { data: apiDecadeData, isLoading: decadeLoading, isError: decadeError } = useGetDecadeAnalysis();
  const { data: apiOverview, isLoading: overviewLoading, isError: overviewError } = useGetDataLandscape();
  const { data: apiThresholdData, isLoading: thresholdLoading, isError: thresholdError } = useGetWhatThisMeans();
  const { data: apiRankings, isLoading: rankingsLoading, isError: rankingsError } = useGetPacificAtAGlance();

  const isLoading = accelLoading || decadeLoading || overviewLoading || thresholdLoading || rankingsLoading;
  const isError = accelError || decadeError || overviewError || thresholdError || rankingsError;

  // Extract verified metric parameters or fallback defaults
  const acceleratingCount = apiAccelData
    ? apiAccelData.filter((a) => a.accelerating).length
    : 0;
  const totalCount = apiAccelData ? apiAccelData.length : 0;

  const d1Avg =
    apiDecadeData?.globalDecades.find((d) => d.key === "d1")?.avg ?? 0.0;
  const d3Avg =
    apiDecadeData?.globalDecades.find((d) => d.key === "d3")?.avg ?? 0.0;
  const shift = d3Avg - d1Avg;

  const crossedZero = apiThresholdData?.summary.crossedZero ?? 0;
  const crossedTenth = apiThresholdData?.summary.crossedTenth ?? 0;

  const maxRiseVal = apiOverview?.maxRiseValue ?? 0;
  const maxRiseCountry = apiOverview?.maxRiseCountry ?? "";

  const highestSlope = apiRankings
    ? apiRankings.slice().sort((a, b) => b.slope - a.slope)[0]
    : null;

  // 6 Core Takeaway Metrics
  const takeaways: TakeawayItem[] = [
    {
      value: acceleratingCount,
      of: totalCount,
      label: "Nations Rising Faster",
      color: "text-[#f43f5e]",
      desc: "Sea levels are rising faster in these nations.",
      decimals: 0,
      prefix: "",
      suffix: "",
      icon: ChevronsUp,
    },
    {
      value: shift * 100,
      of: null,
      label: "30-Year Rise",
      color: "text-[#f97316]",
      desc: "Average increase from the first decade to the third.",
      decimals: 1,
      prefix: "+",
      suffix: " cm",
      icon: Waves,
    },
    {
      value: crossedZero,
      of: null,
      label: "Nations Above Average",
      color: "text-[#eab308]",
      desc: "All 21 nations now show higher sea levels than the 1993–2002 average.",
      decimals: 0,
      prefix: "",
      suffix: "",
      icon: AlertCircle,
    },
    {
      value: crossedTenth,
      of: null,
      label: "Nations With +10 cm Rise",
      color: "text-[#ef4444]",
      desc: "All 21 nations have reached +10 cm.",
      decimals: 0,
      prefix: "",
      suffix: "",
      icon: AlertTriangle,
    },
    {
      value: maxRiseVal * 100,
      of: null,
      label: "Biggest Rise",
      color: "text-[#38bdf8]",
      desc: `${maxRiseCountry || "Palau"} has the biggest total rise.`,
      decimals: 0,
      prefix: "+",
      suffix: " cm",
      icon: ArrowUpCircle,
    },
    {
      value: (highestSlope?.slope ?? 0) * 1000,
      of: null,
      label: "Fastest Rise",
      color: "text-[#2dd4bf]",
      desc: `${highestSlope?.country ?? "Papua New Guinea"} has the fastest rise.`,
      decimals: 2,
      prefix: "+",
      suffix: " mm/year",
      icon: Gauge,
    },
  ];

  return (
    <>
      <StorySection id="what-this-means">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center flex flex-col items-center justify-center mb-8 border-b border-border/10 pb-6 mx-auto"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              variants={childVariants}
              className="text-5xl md:text-6xl font-serif font-bold mb-6"
            >
              What This Means
            </motion.h2>
            <motion.p
              variants={childVariants}
              className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto"
            >
              30 years of data from 21 Pacific nations show that sea levels have continued to rise.
            </motion.p>
          </motion.div>

          {/* Animated Counter Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[148px] bg-card/10 animate-pulse rounded-2xl border border-slate-800/40" />
              ))}
            </div>
          ) : isError ? null : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {takeaways.map(
                ({
                  value,
                  of,
                  label,
                  color,
                  desc,
                  decimals,
                  prefix,
                  suffix,
                  icon: Icon,
                }) => {
                  const theme = CARD_THEMES[color] || {
                    text: color,
                    bg: "bg-card/10",
                    border: "border-border/30",
                    glow: "hover:border-border/40",
                  };

                  return (
                    <motion.div
                      key={label}
                      variants={cardVariants}
                      whileHover={{
                        y: -6,
                        scale: 1.02,
                        transition: { duration: 0.3, ease: "easeOut" },
                      }}
                      className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${theme.glow}`}
                    >
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                          {label}
                        </span>
                        <Icon
                          className={`w-4 h-4 ${theme.text} opacity-60 group-hover:opacity-100 transition-all duration-300`}
                        />
                      </div>
                      <div
                        className={`text-3xl font-serif font-bold tracking-tight ${theme.text}`}
                      >
                        <AnimatedCount
                          target={value}
                          decimals={decimals}
                          prefix={prefix}
                          suffix={suffix}
                        />
                        {of != null && (
                          <span className="text-sm text-muted-foreground/60 font-mono font-normal ml-0.5">
                            /{of}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {desc}
                      </span>
                    </motion.div>
                  );
                },
              )}
            </motion.div>
          )}


        </div>
      </StorySection>

    </>
  );
}
