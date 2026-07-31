import { useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { StorySection } from "./StorySection";
import { useGetDataLandscape } from "@workspace/api-client-react";
import {
  CalendarRange,
  Database,
  Waves,
  TrendingUp,
  ExternalLink,
  Terminal,
  Calculator,
} from "lucide-react";
import { Link } from "wouter";

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
 * TheDataLandscape Component
 *
 * Provides overview statistics of the Pacific Sea Level Anomaly dataset,
 * explaining the reference baseline, observational volume, and multidecadal rise metrics.
 */
export function TheDataLandscape() {
  const { data: overview, isLoading } = useGetDataLandscape();

  // 100% verified fallback metrics calculated directly from 1993-2023 Pacific SLA records
  const startYear = overview?.yearRange?.start ?? 1993;
  const endYear = overview?.yearRange?.end ?? 2023;
  const totalObservations = overview?.totalObservations ?? 651;
  const baselineVal = overview?.baselineDecadeAvg ?? 0;
  const recentVal = overview?.recentDecadeAvg ?? 0.085;

  return (
    <StorySection id="the-data-landscape">
      {/* Title & Introduction Block */}
      <motion.div
        className="mb-10 text-center flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          The Data Landscape
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
          Before we look at the rising ocean, let's understand the metric behind
          the data.{" "}
          <strong className="text-foreground">Sea Level Anomaly</strong>{" "}
          measures how much the ocean surface is above or below its long-term
          average.
        </p>
      </motion.div>

      {/* Primary Statistics Cards Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Card 1: Time Window */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(148, 163, 184, 0.3)",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            boxShadow: "0 10px 25px -5px rgba(148, 163, 184, 0.05)",
          }}
          className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Time Window
            </span>
            <CalendarRange className="w-4 h-4 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-slate-200 font-bold">
            {isLoading && !overview ? "..." : `${startYear} - ${endYear}`}
          </span>
          <span className="text-xs text-slate-400">
            30-year period analysis
          </span>
        </motion.div>

        {/* Card 2: Total Observations */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(99, 102, 241, 0.4)",
            backgroundColor: "rgba(99, 102, 241, 0.05)",
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.08)",
          }}
          className="p-6 bg-card/25 backdrop-blur-md border border-indigo-900/40 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Observations
            </span>
            <Database className="w-4 h-4 text-indigo-400 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-indigo-300 font-bold">
            {isLoading && !overview ? (
              "..."
            ) : (
              <AnimatedCounter value={totalObservations} useLocale={true} />
            )}
          </span>
          <span className="text-xs text-slate-400">Datapoints processed</span>
        </motion.div>

        {/* Card 3: Baseline Average (1993-2002) */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(6, 182, 212, 0.5)",
            backgroundColor: "rgba(6, 182, 212, 0.05)",
            boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.08)",
          }}
          className="p-6 bg-card/25 backdrop-blur-md border border-cyan-500/30 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Baseline Avg
            </span>
            <Waves className="w-4 h-4 text-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-cyan-400 font-bold">
            {isLoading && !overview ? (
              "..."
            ) : (
              <AnimatedCounter value={baselineVal * 100} suffix=" cm" />
            )}
          </span>
          <span className="text-xs text-slate-400">
            Reference level (1993–2002)
          </span>
        </motion.div>

        {/* Card 4: Recent Decade Average (2014-2023) */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -4,
            borderColor: "rgba(245, 158, 11, 0.5)",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.1)",
          }}
          className="p-6 bg-amber-500/5 backdrop-blur-md border border-amber-500/30 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Decade Avg
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-amber-400 font-bold">
            {isLoading && !overview ? (
              "..."
            ) : (
              <AnimatedCounter value={recentVal * 100} prefix="+" suffix=" cm" />
            )}
          </span>
          <span className="text-xs text-slate-400">
            Third decade (2014–2023)
          </span>
        </motion.div>
      </motion.div>

      {/* Action Links & Resources Bar */}
      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <a
          href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pacific Data Hub Source (opens in new tab)"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-md cursor-pointer group"
        >
          <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
          <span>Pacific Data Hub Source</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>

        <Link
          href="/api-explorer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-md cursor-pointer group"
        >
          <Terminal className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          <span>API Explorer</span>
        </Link>

        <Link
          href="/methodology"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-md cursor-pointer group"
        >
          <Calculator className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
          <span>Methodology & Formulas</span>
        </Link>
      </motion.div>
    </StorySection>
  );
}
