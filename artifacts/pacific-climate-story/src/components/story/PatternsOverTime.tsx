import { StorySection } from "./StorySection";
import { useGetPatternsOverTime } from "@workspace/api-client-react";
import { motion, useInView } from "framer-motion";
import { useRef, useMemo, useState } from "react";

type SortKey = "avg" | "totalRise" | "peak";

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

export function PatternsOverTime() {
  const { data: heatmapData, isLoading, isError } = useGetPatternsOverTime();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [sortKey, setSortKey] = useState<SortKey>("totalRise");

  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const currentIndex = sortOptions.findIndex((o) => o.key === sortKey);
      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") {
        nextIndex = currentIndex === sortOptions.length - 1 ? 0 : currentIndex + 1;
      } else {
        nextIndex = currentIndex === 0 ? sortOptions.length - 1 : currentIndex - 1;
      }
      const nextKey = sortOptions[nextIndex].key;
      setSortKey(nextKey);
      setTimeout(() => {
        document.getElementById(`tab-${nextKey}`)?.focus();
      }, 50);
    }
  };

  const getColor = (value: number, min: number, max: number) => {
    if (value === 0) {
      return "rgba(148, 163, 184, 0.25)"; // Zero deviation represented in grey
    }
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
      if (sortKey === "avg")
        return (
          avgOfRow(heatmapData.matrix[b]) - avgOfRow(heatmapData.matrix[a])
        );
      if (sortKey === "totalRise")
        return (
          totalRiseOfRow(heatmapData.matrix[b]) -
          totalRiseOfRow(heatmapData.matrix[a])
        );
      if (sortKey === "peak")
        return (
          peakOfRow(heatmapData.matrix[b]) - peakOfRow(heatmapData.matrix[a])
        );
      return 0;
    });
  }, [heatmapData, sortKey]);

  const decade2003Idx = heatmapData?.years.findIndex((y) => y === 2003) ?? -1;
  const decade2013Idx = heatmapData?.years.findIndex((y) => y === 2013) ?? -1;
  const numYears = heatmapData?.years.length ?? 31;

  const d1Center =
    decade2003Idx > 0 ? ((0 + decade2003Idx) / 2 / numYears) * 100 : 16;
  const d2Center =
    decade2003Idx > 0 && decade2013Idx > 0
      ? ((decade2003Idx + decade2013Idx) / 2 / numYears) * 100
      : 50;
  const d3Center =
    decade2013Idx > 0 ? ((decade2013Idx + numYears) / 2 / numYears) * 100 : 83;

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "totalRise", label: "Total Sea Level Rise" },
    { key: "avg", label: "Average Sea Level" },
    { key: "peak", label: "Highest Sea Level" },
  ];

  return (
    <StorySection id="the-heatmap">
      <div className="mb-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          Patterns Over Time
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
          See sea level changes for every Pacific nation from 1993 to 2023 in one view. The colors show how sea levels changed over time, from lower to higher levels.
        </p>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mx-auto mb-6 bg-slate-900/40 border border-white/5 rounded-xl px-4 py-2 w-fit">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Sort by:
        </span>
        <div
          className="flex flex-wrap justify-center bg-slate-950/60 p-0.5 rounded-lg border border-white/5"
          role="tablist"
          aria-label="Sort heatmaps"
          onKeyDown={handleTablistKeyDown}
        >
          {sortOptions.map(({ key, label }) => {
            const isActive = sortKey === key;
            return (
              <button
                key={key}
                id={`tab-${key}`}
                role="tab"
                aria-selected={isActive}
                aria-controls="heatmap-grid"
                onClick={() => setSortKey(key)}
                className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer relative z-10 ${isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-white"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeHeatmapTab"
                    className="absolute inset-0 bg-primary rounded-md -z-10 shadow-md shadow-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sr-only">
        This heatmap visualizes annual sea level anomalies from 1993 to 2023 for 21 Pacific nations.
        The grid is currently sorted by {sortOptions.find((o) => o.key === sortKey)?.label || sortKey}.
        To skip this keyboard-heavy grid of 651 data points, use the skip link below.
      </div>

      <a
        href="#heatmap-end"
        className="sr-only focus:not-sr-only focus:block focus:text-center focus:py-2 focus:bg-slate-900 focus:text-primary focus:rounded-xl focus:border focus:border-primary/30 mb-4 transition-all"
      >
        Skip heatmap grid to summary statistics
      </a>

      {/* Static Card Container */}
      <div
        ref={ref}
        id="heatmap-grid"
        role="tabpanel"
        aria-labelledby={`tab-${sortKey}`}
        className="max-w-5xl mx-auto w-full border border-border/30 rounded-xl p-6 bg-card/30 backdrop-blur-md relative z-10"
      >
        {/* Chart Header */}
        <div className="mb-6 pb-4 border-b border-white/5 text-left">
          <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            Sea Level Change Heatmap (1993–2023)
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            This heatmap shows sea level changes for each year from 1993 to 2023. Blue colors show lower sea levels, while red colors show higher sea levels compared with the 1993–2002 average.
          </p>
        </div>

        {isLoading ? (
          <div className="h-[420px] flex items-center justify-center text-muted-foreground font-serif animate-pulse">
            Generating heatmap matrix...
          </div>
        ) : isError || !heatmapData ? null : isInView ? (
          <div>
            {/* Scrollable Heatmap Grid */}
            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[820px]">
                {/* Decade labels above */}
                <div className="flex mb-2 px-2">
                  <div className="w-44 flex-shrink-0" />
                  <div className="flex-1 flex relative h-4">
                    <span
                      className="text-[9px] uppercase tracking-wider text-blue-400/70 font-semibold absolute -translate-x-1/2 whitespace-nowrap"
                      style={{ left: `${d1Center}%` }}
                    >
                      Decade 1 (1993-2002)
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-wider text-amber-400/70 font-semibold absolute -translate-x-1/2 whitespace-nowrap"
                      style={{ left: `${d2Center}%` }}
                    >
                      Decade 2 (2003-2012)
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-wider text-rose-400/80 font-semibold absolute -translate-x-1/2 whitespace-nowrap"
                      style={{ left: `${d3Center}%` }}
                    >
                      Decade 3 (2013-2023)
                    </span>
                  </div>
                  <div className="w-16 flex-shrink-0" />
                </div>

                <div className="space-y-[3px] group/heatmap">
                  {sortedIndices.map((origIdx, sortedPos) => {
                    const country = heatmapData.countries[origIdx];
                    const row = heatmapData.matrix[origIdx];
                    return (
                      <motion.div
                        key={country}
                        layout="position"
                        transition={{
                          layout: { type: "spring", stiffness: 280, damping: 28 }
                        }}
                        className="flex items-center group/row transition-[opacity,transform,background-color] duration-200 hover:relative hover:z-40 hover:scale-[1.01] hover:bg-slate-800/30 px-2 py-0.5 rounded-md group-hover/heatmap:opacity-30 hover:!opacity-100"
                      >
                        <div className="w-44 flex-shrink-0 text-[11px] font-semibold text-muted-foreground group-hover/row:text-white transition-colors pr-2">
                          {country}
                        </div>
                        <div className="flex-1 flex h-[18px] relative">
                          {/* Decade separator lines */}
                          {decade2003Idx > 0 && (
                            <div
                              className="absolute top-0 bottom-0 w-[1.5px] bg-slate-400 z-10 pointer-events-none"
                              style={{
                                left: `${(decade2003Idx / numYears) * 100}%`,
                              }}
                            />
                          )}
                          {decade2013Idx > 0 && (
                            <div
                              className="absolute top-0 bottom-0 w-[1.5px] bg-slate-400 z-10 pointer-events-none"
                              style={{
                                left: `${(decade2013Idx / numYears) * 100}%`,
                              }}
                            />
                          )}
                          {row.map((val, j) => {
                            const isPositive = val !== null && val > 0;
                            const isNegative = val !== null && val < 0;

                            let cellBorderColor = "border-slate-700/50";
                            let cellTextColor = "text-slate-400";
                            let badgeBg = "bg-slate-950";
                            let badgeText = "text-slate-400";
                            let badgeBorder = "border-slate-800";
                            let shadowColor = "rgba(148, 163, 184, 0.15)";

                            if (isPositive) {
                              cellBorderColor = "border-rose-500/40";
                              cellTextColor = "text-rose-400";
                              badgeBg = "bg-rose-950";
                              badgeText = "text-rose-400";
                              badgeBorder = "border-rose-500/20";
                              shadowColor = "rgba(244, 63, 94, 0.15)";
                            } else if (isNegative) {
                              cellBorderColor = "border-cyan-500/40";
                              cellTextColor = "text-cyan-400";
                              badgeBg = "bg-cyan-950";
                              badgeText = "text-cyan-400";
                              badgeBorder = "border-cyan-500/20";
                              shadowColor = "rgba(6, 182, 212, 0.15)";
                            }

                            const isTopHalf =
                              sortedPos < sortedIndices.length / 2;
                            const isLeftCol = j < 5;
                            const isRightCol = j > numYears - 6;

                            let positionClasses = `absolute hidden group-hover/cell:block z-50 bg-[#0b1528] border p-4 rounded-xl shadow-[0_10px_30px_${shadowColor}] backdrop-blur-md min-w-[240px] font-sans text-left `;

                            if (isTopHalf) {
                              positionClasses += "top-full mt-2.5 ";
                            } else {
                              positionClasses += "bottom-full mb-3.5 ";
                            }

                            if (isLeftCol) {
                              positionClasses += "left-0 -translate-x-2";
                            } else if (isRightCol) {
                              positionClasses +=
                                "right-0 left-auto translate-x-2";
                            } else {
                              positionClasses += "left-1/2 -translate-x-1/2";
                            }

                            return (
                              <motion.div
                                key={`${country}-${heatmapData.years[j]}`}
                                className="flex-1 h-full mx-[1px] rounded-[2px] relative group/cell cursor-pointer transition-all duration-150 hover:scale-125 hover:z-30 hover:ring-2 hover:ring-white hover:shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                                style={{
                                  backgroundColor:
                                    val !== null
                                      ? getColor(
                                        val,
                                        heatmapData.minValue,
                                        heatmapData.maxValue,
                                      )
                                      : "transparent",
                                }}
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                transition={{
                                  delay: sortedPos * 0.03 + j * 0.006,
                                  duration: 0.25,
                                }}
                              >
                                {/* Custom premium Tooltip matching The Ocean Is Rising */}
                                <div
                                  className={`${positionClasses} ${cellBorderColor}`}
                                >
                                  <div
                                    className={`flex items-center justify-between border-b ${isPositive ? "border-rose-500/10" : isNegative ? "border-cyan-500/10" : "border-slate-800"} pb-2 mb-2`}
                                  >
                                    <span className="font-serif text-lg font-bold text-white">
                                      {heatmapData.years[j]}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono px-2 py-0.5 ${badgeBg} ${badgeText} border ${badgeBorder} rounded-full uppercase`}
                                    >
                                      Annual Record
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center gap-6">
                                      <span className="text-slate-400/90 font-medium">
                                        Nation
                                      </span>
                                      <span className="font-sans font-bold text-white text-right truncate max-w-[140px]">
                                        {country}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6">
                                      <span
                                        className={`${cellTextColor}/90 font-medium`}
                                      >
                                        Sea Level
                                      </span>
                                      <span
                                        className={`font-mono font-bold text-sm ${cellTextColor}`}
                                      >
                                        {val !== null
                                          ? `${val > 0 ? "+" : ""}${(val * 100).toFixed(1)} cm`
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        {/* Row total */}
                        <div className="w-16 flex-shrink-0 text-right text-[10px] font-mono pl-2 text-muted-foreground/60 group-hover/row:text-white transition-colors">
                          {totalRiseOfRow(row) > 0 ? "+" : ""}
                          {(totalRiseOfRow(row) * 100).toFixed(0)}cm
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Year/Boundary labels below */}
                <div className="flex mt-2 px-2 relative">
                  <div className="w-44 flex-shrink-0" />
                  <div className="flex-1 flex relative h-6">
                    {/* Start year */}
                    <span className="text-[10px] font-mono text-muted-foreground/80 absolute left-0">
                      1993
                    </span>

                    {/* Boundary 1 (2002/2003) */}
                    {decade2003Idx > 0 && (
                      <span
                        className="text-[9px] font-mono text-slate-400 absolute -translate-x-1/2 flex flex-col items-center"
                        style={{ left: `${(decade2003Idx / numYears) * 100}%` }}
                      >
                        <span className="w-[1.5px] h-1.5 bg-slate-400 mb-0.5" />
                        <span>2003</span>
                      </span>
                    )}

                    {/* Boundary 2 (2012/2013) */}
                    {decade2013Idx > 0 && (
                      <span
                        className="text-[9px] font-mono text-slate-400 absolute -translate-x-1/2 flex flex-col items-center"
                        style={{ left: `${(decade2013Idx / numYears) * 100}%` }}
                      >
                        <span className="w-[1.5px] h-1.5 bg-slate-400 mb-0.5" />
                        <span>2013</span>
                      </span>
                    )}

                    {/* End year */}
                    <span className="text-[10px] font-mono text-muted-foreground/80 absolute right-0">
                      2023
                    </span>
                  </div>
                  <div className="w-16 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Color legend */}
            <div className="mt-6 flex px-2">
              {/* Left spacer matching country name column width */}
              <div className="w-44 flex-shrink-0" />

              {/* Color scale wrapper centered under the year blocks */}
              <div className="flex-1 max-w-xl mx-auto w-full">
                <div className="flex flex-col gap-2">
                  {/* The continuous color scale bar */}
                  <div className="relative w-full">
                    {/* The bar itself (sharp/unrounded with middle baseline tick) */}
                    <div className="h-4 bg-gradient-to-r from-cyan-400/80 via-slate-500/25 to-rose-400/80 border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] relative">
                      {/* Vertical line indicator for Baseline (middle) */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-200 z-10 -translate-x-1/2" />
                    </div>
                  </div>

                  {/* Scale labels */}
                  <div className="grid grid-cols-3 text-[10px] font-mono text-muted-foreground mt-1">
                    <span className="text-left font-semibold">-{Math.abs(heatmapData.minValue * 100).toFixed(0)} cm (Lower than Average)</span>
                    <span className="text-center text-slate-300 font-bold">0.0 cm (1993–2002 Average)</span>
                    <span className="text-right font-semibold">+{(heatmapData.maxValue * 100).toFixed(0)} cm (Higher than Average)</span>
                  </div>
                </div>
              </div>

              {/* Right spacer matching summary values column width */}
              <div className="w-16 flex-shrink-0" />
            </div>

            {/* Interaction Helper Text */}
            <p className="text-center text-xs text-muted-foreground mt-4 font-sans">
              Move your mouse over a year to see the sea level for that nation. Use the options above to sort countries by total rise, average sea level, or highest sea level.
            </p>
          </div>
        ) : (
          <div className="h-[420px]" />
        )}
      </div>
      <div id="heatmap-end" />
    </StorySection>
  );
}
