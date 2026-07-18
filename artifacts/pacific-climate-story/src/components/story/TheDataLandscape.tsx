import { StorySection } from "./StorySection";
import { useGetClimateOverview } from "@workspace/api-client-react";
import { CalendarRange, Database, Waves, TrendingUp, ExternalLink } from "lucide-react";

export function TheDataLandscape() {
  const { data: overview, isLoading } = useGetClimateOverview();

  const baselineVal = overview?.baselineDecadeAvg ?? 0;
  const recentVal = overview?.recentDecadeAvg ?? 0.085;

  return (
    <StorySection id="chapter-1">
      {/* Title & Introduction Block with Right-aligned Data Link */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-5xl md:text-6xl font-serif font-bold">The Data Landscape</h2>
          <a
            href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition shadow-md self-start md:self-auto"
          >
            <Database className="w-4 h-4 text-primary" />
            Pacific Data Hub Source
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
          Before we look at the rising ocean, let's understand the metric behind the data. <strong className="text-foreground">Sea Level Anomaly</strong> measures how much the ocean surface is above or below its long-term average.
        </p>
      </div>

      {/* Middle Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border border-slate-800/80 bg-card/20 backdrop-blur-sm rounded-xl flex flex-col gap-2 hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Time Window</span>
            <CalendarRange className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-foreground font-bold">
            {isLoading ? "..." : `${overview?.yearRange.start} - ${overview?.yearRange.end}`}
          </span>
          <span className="text-xs text-muted-foreground">30-year period analysis</span>
        </div>

        <div className="p-6 border border-slate-800/80 bg-card/20 backdrop-blur-sm rounded-xl flex flex-col gap-2 hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Observations</span>
            <Database className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-foreground font-bold">
            {isLoading ? "..." : overview?.totalObservations.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">Datapoints processed</span>
        </div>

        <div className="p-6 border border-slate-800/80 bg-card/20 backdrop-blur-sm rounded-xl flex flex-col gap-2 hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Baseline Avg</span>
            <Waves className="w-4 h-4 text-cyan-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-cyan-500/95 font-bold">
            {isLoading ? "..." : `${baselineVal.toFixed(3)}m`}
          </span>
          <span className="text-xs text-muted-foreground">Reference level (1993–2002)</span>
        </div>

        <div className="p-6 border border-primary/20 bg-primary/5 backdrop-blur-sm rounded-xl flex flex-col gap-2 hover:border-primary/30 transition group shadow-[0_0_15px_rgba(6,182,212,0.04)]">
          <div className="flex items-center justify-between text-primary mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Recent Decade Avg</span>
            <TrendingUp className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 transition" />
          </div>
          <span className="text-3xl font-serif text-primary font-bold">
            {isLoading ? "..." : `+${recentVal.toFixed(3)}m`}
          </span>
          <span className="text-xs text-primary/70">Third decade (2014–2023)</span>
        </div>
      </div>
    </StorySection>
  );
}
