import { StorySection } from "./StorySection";
import { useGetClimateHeatmap } from "@workspace/api-client-react";
import { motion, useInView } from "framer-motion";
import { useRef, useMemo, useState } from "react";

type SortKey = "name" | "avg" | "totalRise" | "peak";

function avgOfRow(row: (number | null)[]): number {
  const valid = row.filter((v): v is number => v !== null);
  return valid.length ? valid.reduce((s, v) => s + v, 0) / valid.length : 0;
}
function totalRiseOfRow(row: (number | null)[]): number {
  const valid = row.filter((v): v is number => v !== null);
  if (!valid.length) return 0;
  return valid[valid.length - 1] - valid[0];
}
function peakOfRow(row: (number | null)[]): number {
  return Math.max(...row.filter((v): v is number => v !== null));
}

export function Chapter5Heatmap() {
  const { data: heatmapData, isLoading } = useGetClimateHeatmap();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [sortKey, setSortKey] = useState<SortKey>("totalRise");

  const getColor = (value: number, min: number, max: number) => {
    if (value < 0) {
      const intensity = Math.min(1, Math.abs(value / (min || -0.001)));
      return `rgba(56, 189, 248, ${0.08 + intensity * 0.85})`;
    }
    const intensity = Math.min(1, value / (max || 0.001));
    return `rgba(251, 113, 133, ${0.08 + intensity * 0.85})`;
  };

  const sortedIndices = useMemo(() => {
    if (!heatmapData) return [];
    const indices = heatmapData.countries.map((_, i) => i);
    return indices.sort((a, b) => {
      if (sortKey === "name") return heatmapData.countries[a].localeCompare(heatmapData.countries[b]);
      if (sortKey === "avg") return avgOfRow(heatmapData.matrix[b]) - avgOfRow(heatmapData.matrix[a]);
      if (sortKey === "totalRise") return totalRiseOfRow(heatmapData.matrix[b]) - totalRiseOfRow(heatmapData.matrix[a]);
      if (sortKey === "peak") return peakOfRow(heatmapData.matrix[b]) - peakOfRow(heatmapData.matrix[a]);
      return 0;
    });
  }, [heatmapData, sortKey]);

  const decade2003Idx = heatmapData?.years.findIndex((y) => y === 2003) ?? -1;
  const decade2013Idx = heatmapData?.years.findIndex((y) => y === 2013) ?? -1;
  const numYears = heatmapData?.years.length ?? 31;

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "totalRise", label: "Total Rise" },
    { key: "avg", label: "Avg Anomaly" },
    { key: "peak", label: "Peak Value" },
    { key: "name", label: "Country Name" },
  ];

  return (
    <StorySection id="the-heatmap" className="bg-background">
      <div className="mb-8">
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">The Heatmap</h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
          A matrix of every nation across every year. The shift from cool blues (below baseline) to alarming reds (above baseline) tells the entire story in a single view. Each decade is separated to make the escalation visible.
        </p>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground uppercase tracking-wide mr-2">Sort by:</span>
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              sortKey === key
                ? "bg-primary/20 border-primary/60 text-primary"
                : "bg-card/20 border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div ref={ref} className="w-full overflow-x-auto pb-6">
        <div className="min-w-[820px] border border-border/30 rounded-lg p-6 bg-card/30 backdrop-blur-md">
          {isLoading || !heatmapData ? (
            <div className="h-[420px] flex items-center justify-center text-muted-foreground font-serif animate-pulse">
              Generating heatmap matrix...
            </div>
          ) : isInView ? (
            <div>
              {/* Year header with decade labels */}
              <div className="flex mb-1">
                <div className="w-36 flex-shrink-0" />
                <div className="flex-1 flex relative">
                  {decade2003Idx > 0 && (
                    <div
                      className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                      style={{ left: `${(decade2003Idx / numYears) * 100}%` }}
                    >
                      <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider -rotate-0 whitespace-nowrap">2003</span>
                    </div>
                  )}
                  {decade2013Idx > 0 && (
                    <div
                      className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                      style={{ left: `${(decade2013Idx / numYears) * 100}%` }}
                    >
                      <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">2013</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex mb-2">
                <div className="w-36 flex-shrink-0" />
                <div className="flex-1 flex justify-between text-[10px] text-muted-foreground/70">
                  {heatmapData.years.filter((_, i) => i % 5 === 0).map((year) => (
                    <span key={year}>{year}</span>
                  ))}
                </div>
              </div>

              {/* Decade labels above */}
              <div className="flex mb-2">
                <div className="w-36 flex-shrink-0" />
                <div className="flex-1 flex relative">
                  <span className="text-[9px] uppercase tracking-wider text-blue-400/50" style={{ position: "absolute", left: "5%" }}>Decade 1</span>
                  <span className="text-[9px] uppercase tracking-wider text-yellow-400/50" style={{ position: "absolute", left: "37%" }}>Decade 2</span>
                  <span className="text-[9px] uppercase tracking-wider text-red-400/60" style={{ position: "absolute", left: "68%" }}>Decade 3</span>
                </div>
              </div>

              <div className="space-y-[3px]">
                {sortedIndices.map((origIdx, sortedPos) => {
                  const country = heatmapData.countries[origIdx];
                  const row = heatmapData.matrix[origIdx];
                  return (
                    <div key={country} className="flex items-center group">
                      <div className="w-36 flex-shrink-0 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate pr-2">
                        {country}
                      </div>
                      <div className="flex-1 flex h-[18px] relative">
                        {/* Decade separator lines */}
                        {decade2003Idx > 0 && (
                          <div
                            className="absolute top-0 bottom-0 w-[2px] bg-border/40 z-10"
                            style={{ left: `${(decade2003Idx / numYears) * 100}%` }}
                          />
                        )}
                        {decade2013Idx > 0 && (
                          <div
                            className="absolute top-0 bottom-0 w-[2px] bg-border/40 z-10"
                            style={{ left: `${(decade2013Idx / numYears) * 100}%` }}
                          />
                        )}
                        {row.map((val, j) => (
                          <motion.div
                            key={`${country}-${heatmapData.years[j]}`}
                            className="flex-1 h-full mx-[1px] rounded-[2px] relative group/cell"
                            style={{ backgroundColor: val !== null ? getColor(val, heatmapData.minValue, heatmapData.maxValue) : "transparent" }}
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            transition={{ delay: (sortedPos * 0.03) + (j * 0.006), duration: 0.25 }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/cell:block z-50 bg-background border border-border px-2 py-1 text-xs rounded pointer-events-none whitespace-nowrap shadow-lg">
                              {country} · {heatmapData.years[j]}: {val !== null ? `${val >= 0 ? "+" : ""}${val.toFixed(3)}m` : "N/A"}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {/* Row total */}
                      <div className="w-16 flex-shrink-0 text-right text-[10px] font-mono pl-2 text-muted-foreground/60">
                        {totalRiseOfRow(row) >= 0 ? "+" : ""}{(totalRiseOfRow(row) * 100).toFixed(0)}cm
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Color legend */}
              <div className="flex items-center justify-center gap-4 mt-8 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm" style={{ background: "rgba(56,189,248,0.85)" }} />
                  <span>Below baseline ({Math.abs(heatmapData.minValue).toFixed(2)}m max)</span>
                </div>
                <div className="flex-1 max-w-40 h-2 rounded-full bg-gradient-to-r from-sky-400 via-background/40 to-rose-400 border border-border/30" />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm" style={{ background: "rgba(251,113,133,0.85)" }} />
                  <span>Above baseline (+{heatmapData.maxValue.toFixed(2)}m max)</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-3 text-[10px] text-muted-foreground/60 justify-center">
                <span className="flex items-center gap-1.5"><span className="inline-block w-[2px] h-4 bg-border/60" />Decade boundary</span>
                <span>Hover any cell for exact value · Right column = total rise (cm)</span>
              </div>
            </div>
          ) : (
            <div className="h-[420px]" />
          )}
        </div>
      </div>
    </StorySection>
  );
}
