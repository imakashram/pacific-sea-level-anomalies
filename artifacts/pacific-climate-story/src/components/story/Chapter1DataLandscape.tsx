import { StorySection } from "./StorySection";
import { useGetClimateOverview } from "@workspace/api-client-react";
import { StatCard } from "./StatCard";

export function Chapter1DataLandscape() {
  const { data: overview, isLoading } = useGetClimateOverview();

  return (
    <StorySection id="chapter-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8">The Data Landscape</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              To understand the crisis in the Pacific, we must first look at the numbers. We are tracking "sea level anomaly"—the difference between the measured sea level and the historical average.
            </p>
            <p>
              A positive anomaly means the ocean is higher than the baseline. Over time, consistent positive anomalies indicate a rising trend.
            </p>
            <p>
              This dataset covers <strong className="text-foreground">{overview?.totalCountries || "multiple"}</strong> Pacific Island countries and territories over <strong className="text-foreground">{((overview?.yearRange.end || 2023) - (overview?.yearRange.start || 1993))}</strong> years, capturing the subtle but relentless encroachment of the ocean.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard 
            label="Years Tracked" 
            value={isLoading ? "..." : `${overview?.yearRange.start} - ${overview?.yearRange.end}`} 
          />
          <StatCard 
            label="Total Observations" 
            value={isLoading ? "..." : overview?.totalObservations.toLocaleString()} 
            className="sm:translate-y-8"
          />
          <StatCard 
            label="Baseline Avg" 
            value={isLoading ? "..." : `${overview?.baselineDecadeAvg.toFixed(3)}m`} 
          />
          <StatCard 
            label="Recent Decade Avg" 
            value={isLoading ? "..." : `+${overview?.recentDecadeAvg.toFixed(3)}m`} 
            className="sm:translate-y-8 border-primary/50 bg-primary/5"
          />
        </div>
      </div>
    </StorySection>
  );
}
