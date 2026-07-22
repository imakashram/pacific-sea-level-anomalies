import { StorySection } from "./StorySection";
import { motion, useInView } from "framer-motion";
import {
  useGetDecadeAnalysis,
  useGetAcceleration,
  useGetClimateOverview,
  useGetThresholdCrossings,
  useGetRankings,
} from "@workspace/api-client-react";
import { useEffect, useRef, useState } from "react";
import { ChevronsUp, Waves, AlertCircle, AlertTriangle, ArrowUpCircle, Gauge, type LucideIcon } from "lucide-react";

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
 */
function AnimatedCount({ target, decimals = 0, prefix = "", suffix = "" }: AnimatedCountProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    const duration = 1800;
    const steps = 72;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (step >= steps) {
        setValue(target);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
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

/**
 * WhatThisMeans Component
 *
 * Concluding synthesis section aggregating key statistical findings from 30 years of observation across
 * 21 Pacific island territories into an animated 6-metric summary grid.
 */
export function WhatThisMeans() {
  const { data: apiAccelData } = useGetAcceleration();
  const { data: apiDecadeData } = useGetDecadeAnalysis();
  const { data: apiOverview } = useGetClimateOverview();
  const { data: apiThresholdData } = useGetThresholdCrossings();
  const { data: apiRankings } = useGetRankings();

  // Extract verified metric parameters or fallback defaults
  const acceleratingCount = apiAccelData ? apiAccelData.filter((a) => a.accelerating).length : 21;
  const totalCount = apiAccelData ? apiAccelData.length : 21;

  const d1Avg = apiDecadeData?.globalDecades.find((d) => d.key === "d1")?.avg ?? 0.0;
  const d3Avg = apiDecadeData?.globalDecades.find((d) => d.key === "d3")?.avg ?? 0.0852;
  const shift = apiDecadeData ? d3Avg - d1Avg : 0.0852;

  const crossedZero = apiThresholdData?.summary.crossedZero ?? 21;
  const crossedTenth = apiThresholdData?.summary.crossedTenth ?? 21;

  const maxRiseVal = apiOverview?.maxRiseValue ?? 0.2;
  const maxRiseCountry = apiOverview?.maxRiseCountry ?? "Papua New Guinea";

  const highestSlope = apiRankings
    ? apiRankings.slice().sort((a, b) => b.slope - a.slope)[0]
    : { country: "Papua New Guinea", slope: 0.0054 };

  // 6 Core Takeaway Metrics
  const takeaways: TakeawayItem[] = [
    {
      value: acceleratingCount,
      of: totalCount,
      label: "Nations Accelerating",
      color: "text-[#f43f5e]",
      desc: "are not just rising but rising faster",
      decimals: 0,
      prefix: "",
      suffix: "",
      icon: ChevronsUp,
    },
    {
      value: shift * 100,
      of: null,
      label: "Baseline Shift",
      color: "text-[#f97316]",
      desc: "average rise from Decade 1 to Decade 3",
      decimals: 1,
      prefix: "+",
      suffix: " cm",
      icon: Waves,
    },
    {
      value: crossedZero,
      of: null,
      label: "Nations Above Zero",
      color: "text-[#eab308]",
      desc: "have crossed into persistent positive anomaly",
      decimals: 0,
      prefix: "",
      suffix: "",
      icon: AlertCircle,
    },
    {
      value: crossedTenth,
      of: null,
      label: "Nations at +10 cm",
      color: "text-[#ef4444]",
      desc: "have breached the 10 cm threshold",
      decimals: 0,
      prefix: "",
      suffix: "",
      icon: AlertTriangle,
    },
    {
      value: maxRiseVal * 100,
      of: null,
      label: "Peak Nation Rise",
      color: "text-[#38bdf8]",
      desc: `highest single-nation cumulative rise (${maxRiseCountry})`,
      decimals: 0,
      prefix: "+",
      suffix: " cm",
      icon: ArrowUpCircle,
    },
    {
      value: (highestSlope?.slope ?? 0.0054) * 1000,
      of: null,
      label: "Fastest Rise",
      color: "text-[#2dd4bf]",
      desc: `${highestSlope?.country ?? "Papua New Guinea"} - fastest upward trend`,
      decimals: 2,
      prefix: "+",
      suffix: " mm/yr",
      icon: Gauge,
    },
  ];

  return (
    <StorySection id="what-this-means" className="pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center flex flex-col items-center justify-center mb-8 border-b border-border/10 pb-6 mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">What This Means</h2>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
            Over 30 years of observations across 21 Pacific nations reveal a persistent rise in
            sea level anomalies.
          </p>
        </motion.div>

        {/* Animated Counter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-16">
          {takeaways.map(
            (
              { value, of, label, color, desc, decimals, prefix, suffix, icon: Icon },
              i
            ) => {
              const theme = CARD_THEMES[color] || {
                text: color,
                bg: "bg-card/10",
                border: "border-border/30",
                glow: "hover:border-border/40",
              };

              return (
                <motion.div
                  key={label}
                  className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${theme.glow} hover:-translate-y-1`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                      {label}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${theme.text} opacity-60 group-hover:opacity-100 transition-all duration-300`}
                    />
                  </div>
                  <div className={`text-3xl font-serif font-bold tracking-tight ${theme.text}`}>
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
            }
          )}
        </div>

        {/* Footer Database Citation & Quote */}
        <motion.div
          className="pt-12 border-t border-border/30 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-muted-foreground text-sm mb-6">
            Data sourced from the Pacific Community (SPC) Climate Change Indicators Database. Indicator:
            SEA_LVL (Sea Level Anomaly).
          </p>
          <div className="font-serif italic text-primary text-2xl">
            "The ocean is speaking. The question is whether we are listening."
          </div>
        </motion.div>
      </div>
    </StorySection>
  );
}
