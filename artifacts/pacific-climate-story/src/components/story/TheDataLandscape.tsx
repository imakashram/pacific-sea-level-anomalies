import { StorySection } from "./StorySection";
import { useGetClimateOverview } from "@workspace/api-client-react";
import { CalendarRange, Database, Waves, TrendingUp, ExternalLink, Terminal, Calculator } from "lucide-react";
import { Link } from "wouter";

export function TheDataLandscape() {
  const { data: overview, isLoading } = useGetClimateOverview();

  const baselineVal = overview?.baselineDecadeAvg ?? 0;
  const recentVal = overview?.recentDecadeAvg ?? 0.085;

  return (
    <StorySection id="chapter-1">
      {/* Title & Introduction Block */}
      <div className="mb-10 text-center flex flex-col items-center justify-center">
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-center">The Data Landscape</h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed text-center mx-auto">
          Before we look at the rising ocean, let's understand the metric behind the data. <strong className="text-foreground">Sea Level Anomaly</strong> measures how much the ocean surface is above or below its long-term average.
        </p>
      </div>

      {/* Middle Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.05)] hover:bg-slate-900/40 hover:-translate-y-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Time Window</span>
            <CalendarRange className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-foreground font-bold">
            {isLoading ? "..." : `${overview?.yearRange.start} - ${overview?.yearRange.end}`}
          </span>
          <span className="text-xs text-muted-foreground">30-year period analysis</span>
        </div>

        <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.05)] hover:bg-slate-900/40 hover:-translate-y-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Observations</span>
            <Database className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-foreground font-bold">
            {isLoading ? "..." : overview?.totalObservations.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">Datapoints processed</span>
        </div>

        <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-cyan-500/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.05)] hover:bg-cyan-950/5 hover:-translate-y-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Baseline Avg</span>
            <Waves className="w-4 h-4 text-cyan-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-cyan-500/95 font-bold">
            {isLoading ? "..." : `${(baselineVal * 100).toFixed(1)}cm`}
          </span>
          <span className="text-xs text-muted-foreground">Reference level (1993–2002)</span>
        </div>

        <div className="p-6 bg-primary/5 backdrop-blur-md border border-primary/20 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.05)] hover:bg-primary/10 hover:-translate-y-1">
          <div className="flex items-center justify-between text-primary mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Recent Decade Avg</span>
            <TrendingUp className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-primary font-bold">
            {isLoading ? "..." : `+${(recentVal * 100).toFixed(1)}cm`}
          </span>
          <span className="text-xs text-primary/70">Third decade (2014–2023)</span>
        </div>
      </div>

      {/* Bottom Action Bar below cards */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-300 shadow-md cursor-pointer group"
        >
          <Database className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
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
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-all duration-300 shadow-md cursor-pointer group">
            <Calculator className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            <span>How It's Calculated</span>
          </button>
        </Link>
      </div>
    </StorySection>
  );
}
