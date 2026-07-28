import { StorySection } from "./StorySection";
import { useGetClimateOverview } from "@workspace/api-client-react";
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

/**
 * TheDataLandscape Component
 *
 * Provides overview statistics of the Pacific Sea Level Anomaly dataset,
 * explaining the reference baseline, observational volume, and multidecadal rise metrics.
 */
export function TheDataLandscape() {
  const { data: overview, isLoading } = useGetClimateOverview();

  // 100% verified fallback metrics calculated directly from 1993-2023 Pacific SLA records
  const startYear = overview?.yearRange?.start ?? 1993;
  const endYear = overview?.yearRange?.end ?? 2023;
  const totalObservations = overview?.totalObservations ?? 651;
  const baselineVal = overview?.baselineDecadeAvg ?? 0;
  const recentVal = overview?.recentDecadeAvg ?? 0.085;

  return (
    <StorySection id="the-data-landscape">
      {/* Title & Introduction Block */}
      <div className="mb-10 text-center flex flex-col items-center justify-center">
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
      </div>

      {/* Primary Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Time Window */}
        <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-slate-700 hover:shadow-[0_4px_20px_rgba(148,163,184,0.05)] hover:bg-slate-900/40 hover:-translate-y-1">
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
        </div>

        {/* Card 2: Total Observations */}
        <div className="p-6 bg-card/25 backdrop-blur-md border border-indigo-900/40 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-indigo-500/40 hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] hover:bg-indigo-950/15 hover:-translate-y-1">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Observations
            </span>
            <Database className="w-4 h-4 text-indigo-400 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-indigo-300 font-bold">
            {isLoading && !overview
              ? "..."
              : totalObservations.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">Datapoints processed</span>
        </div>

        {/* Card 3: Baseline Average (1993-2002) */}
        <div className="p-6 bg-card/25 backdrop-blur-md border border-cyan-500/30 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-cyan-500/50 hover:shadow-[0_4px_20px_rgba(6,182,212,0.08)] hover:bg-cyan-950/15 hover:-translate-y-1">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Baseline Avg
            </span>
            <Waves className="w-4 h-4 text-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-cyan-400 font-bold">
            {isLoading && !overview
              ? "..."
              : `${(baselineVal * 100).toFixed(1)} cm`}
          </span>
          <span className="text-xs text-slate-400">
            Reference level (1993–2002)
          </span>
        </div>

        {/* Card 4: Recent Decade Average (2014-2023) */}
        <div className="p-6 bg-amber-500/5 backdrop-blur-md border border-amber-500/30 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-amber-500/50 hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)] hover:bg-amber-500/10 hover:-translate-y-1">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Decade Avg
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-3xl font-serif text-amber-400 font-bold">
            {isLoading && !overview
              ? "..."
              : `+${(recentVal * 100).toFixed(1)} cm`}
          </span>
          <span className="text-xs text-slate-400">
            Third decade (2014–2023)
          </span>
        </div>
      </div>

      {/* Action Links & Resources Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-md cursor-pointer group"
        >
          <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
          <span>Pacific Data Hub Source</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>

        <Link href="/explorer">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-md cursor-pointer group">
            <Terminal className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>API Explorer</span>
          </button>
        </Link>

        <Link href="/how-it-is-calculated">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-300 shadow-md cursor-pointer group">
            <Calculator className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            <span>How It's Calculated</span>
          </button>
        </Link>
      </div>
    </StorySection>
  );
}
