import { useState } from "react";
import { useGetCountryProfile, useGetRankings } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  vs,
  icon,
  themeClass = "primary"
}: {
  label: string;
  value: string;
  sub?: string;
  vs?: string;
  icon?: React.ReactNode;
  themeClass?: "primary" | "emerald" | "orange" | "purple";
}) {
  const themes = {
    primary: {
      text: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      glow: "hover:border-primary/40 hover:shadow-primary/5"
    },
    emerald: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/5"
    },
    orange: {
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      glow: "hover:border-orange-500/40 hover:shadow-orange-500/5"
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      glow: "hover:border-purple-500/40 hover:shadow-purple-500/5"
    }
  };

  const currentTheme = themes[themeClass];

  return (
    <div className={`group bg-card/25 backdrop-blur-md p-5 rounded-2xl border border-border/50 shadow-sm transition-all duration-300 ${currentTheme.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      </div>
      <div className={`text-2xl md:text-3xl font-serif font-bold ${currentTheme.text}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-1 font-mono">{sub}</div>}

      {vs && (
        <div className="text-xs mt-3 border-t border-border/10 pt-2">
          {vs.includes("✓") ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium leading-none">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {vs.replace(/[✓⚠]/g, '').trim()}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium leading-none">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {vs.replace(/[✓⚠]/g, '').trim()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function CustomTrajectoryTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload.find((p: any) => p.dataKey === "value")?.value;
    const rollingAvg = payload.find((p: any) => p.dataKey === "rollingAvg")?.value;

    return (
      <div className="bg-neutral-950/95 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs flex flex-col gap-2 min-w-[150px]">
        <div className="font-mono text-white/50 border-b border-white/5 pb-1 flex justify-between items-center">
          <span>Year</span>
          <span className="font-bold text-white">{data.year}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {value !== undefined && (
            <div className="flex justify-between items-center gap-6">
              <span className="text-white/60">Annual:</span>
              <span className="font-mono font-bold text-white/90">
                {value >= 0 ? "+" : ""}{value.toFixed(3)}m
              </span>
            </div>
          )}
          {rollingAvg !== undefined && (
            <div className="flex justify-between items-center gap-6">
              <span className="text-primary-light text-sky-400">5-Yr Avg:</span>
              <span className="font-mono font-bold text-sky-400">
                {rollingAvg >= 0 ? "+" : ""}{rollingAvg.toFixed(3)}m
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

function CustomDecadeTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-950/95 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs flex flex-col gap-2 min-w-[150px]">
        <div className="font-mono text-white/50 border-b border-white/5 pb-1 flex justify-between items-center">
          <span>Decade</span>
          <span className="font-bold text-white">{data.label}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-white/60">Avg Anomaly:</span>
          <span className="font-mono font-bold text-sky-400">
            {data.avg >= 0 ? "+" : ""}{data.avg.toFixed(4)}m
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function ExploreAnyNation({
  isNested = false,
  selectedCode: propsSelectedCode,
  setSelectedCode: propsSetSelectedCode,
}: {
  isNested?: boolean;
  selectedCode?: string;
  setSelectedCode?: (code: string) => void;
}) {
  const { data: rankings } = useGetRankings();
  const [localSelectedCode, localSetSelectedCode] = useState<string>("AS");
  const [isOpen, setIsOpen] = useState(false);

  const selectedCode = propsSelectedCode ?? localSelectedCode;
  const setSelectedCode = propsSetSelectedCode ?? localSetSelectedCode;

  const { data: profile, isLoading } = useGetCountryProfile(selectedCode, {
    query: { queryKey: ["countryProfile", selectedCode], enabled: !!selectedCode },
  });

  // Compute regional averages from rankings data
  const regionalAvg = rankings
    ? {
      cumulativeRise: rankings.reduce((s, r) => s + r.cumulativeRise, 0) / rankings.length,
      slope: rankings.reduce((s, r) => s + r.slope, 0) / rankings.length,
      volatility: rankings.reduce((s, r) => s + r.volatility, 0) / rankings.length,
      mean: rankings.reduce((s, r) => s + r.mean, 0) / rankings.length,
    }
    : null;

  const peakYear = profile?.stats.peakYear;

  const vsStr = (val: number, avg: number, unit: string, higherIsBad = true) => {
    const diff = val - avg;
    const pct = Math.abs(diff / avg) * 100;
    const dir = diff > 0 ? "above" : "below";
    const icon = (diff > 0) === higherIsBad ? "⚠" : "✓";
    return `${icon} ${pct.toFixed(0)}% ${dir} regional avg (${avg.toFixed(3)}${unit})`;
  };

  const mainContent = (
    <div className="max-w-5xl mx-auto w-full">
      {!isNested && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">Explore Any Nation</h2>
          <p className="text-xl text-muted-foreground">
            Every island, its own story. Select a territory to see its full 30-year profile
            compared to the regional average.
          </p>
        </motion.div>
      )}

      {/* Territory Dropdown Selector (Only if selection is not controlled by props) */}
      {!propsSelectedCode && rankings && (
        <div className="flex justify-end w-full mb-6 z-50 relative">
          <div className="relative w-full max-w-xs z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-card/45 backdrop-blur-md border border-border/80 text-foreground text-sm font-semibold shadow-lg hover:bg-card hover:border-border transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  {rankings.find(r => r.code === selectedCode)?.country || "Select Territory"}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-foreground' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-2 z-50 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                  >
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {rankings.map((r) => (
                        <button
                          key={r.code}
                          onClick={() => {
                            setSelectedCode(r.code);
                            setIsOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer text-left ${selectedCode === r.code
                              ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/15"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                          >
                          <span>{r.country}</span>
                          {selectedCode === r.code && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="min-h-[580px] relative w-full">
        <AnimatePresence mode="wait">
          {isLoading || !profile ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card/10 animate-pulse rounded-2xl border border-border/20 h-[580px]"
            />
          ) : (
            <motion.div
              key={profile.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-card/15 backdrop-blur-md border border-border/40 rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                    {profile.country}{" "}
                    <span className="text-muted-foreground text-lg md:text-xl ml-1 font-mono font-normal">({profile.code})</span>
                  </h3>
                </div>

                <div className="text-xs md:text-sm text-muted-foreground bg-card/30 border border-border/40 rounded-xl px-4 py-2 shadow-inner">
                  Ranked{" "}
                  <span className="font-bold text-primary">
                    #{profile.stats.rankByCumulativeRise}
                  </span>{" "}
                  of {profile.stats.totalCountries} by cumulative rise
                </div>
              </div>

              {/* Stat cards with regional comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Cumulative Rise"
                  value={`+${profile.stats.cumulativeRise.toFixed(3)}m`}
                  themeClass="primary"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                  vs={
                    regionalAvg
                      ? vsStr(profile.stats.cumulativeRise, regionalAvg.cumulativeRise, "m")
                      : undefined
                  }
                />
                <StatCard
                  label="Speed Rate"
                  value={`${(profile.stats.slope * 1000).toFixed(2)} mm/yr`}
                  themeClass="emerald"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  vs={
                    regionalAvg
                      ? vsStr(profile.stats.slope * 1000, regionalAvg.slope * 1000, " mm/yr")
                      : undefined
                  }
                />
                <StatCard
                  label="Volatility"
                  value={`±${profile.stats.volatility.toFixed(3)}m`}
                  themeClass="orange"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  vs={
                    regionalAvg
                      ? vsStr(profile.stats.volatility, regionalAvg.volatility, "m")
                      : undefined
                  }
                />
                <StatCard
                  label="Peak Record"
                  value={`${profile.stats.peakYear}`}
                  themeClass="purple"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                    </svg>
                  }
                  sub={`Peak: +${profile.stats.peakValue.toFixed(3)}m`}
                  vs={`Trough: ${profile.stats.troughYear} (${profile.stats.troughValue.toFixed(3)}m)`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 30-year trajectory with peak annotation */}
                <div className="lg:col-span-2 bg-card/10 border border-border/30 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                      30-Year Anomaly Trajectory
                    </h4>
                    <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-0.5 bg-muted-foreground/45 inline-block" />
                        Annual
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-0.5 bg-primary inline-block" />
                        5-yr Average
                      </span>
                    </div>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={profile.timeSeries}
                        margin={{ top: 35, right: 20, left: 20, bottom: 25 }}
                      >
                        <defs>
                          <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="barColorD1" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)"/>
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)"/>
                          </linearGradient>
                          <linearGradient id="barColorD2" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.15)"/>
                            <stop offset="100%" stopColor="rgba(14, 165, 233, 0.45)"/>
                          </linearGradient>
                          <linearGradient id="barColorD3" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)"/>
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.75)"/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(255,255,255,0.04)"
                        />
                        <XAxis
                          dataKey="year"
                          stroke="rgba(255,255,255,0.3)"
                          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
                          tickLine={false}
                          label={{ value: "Year", position: "insideBottom", offset: -12, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' } }}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.3)"
                          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
                          tickFormatter={(val) => val.toFixed(2)}
                          tickLine={false}
                          width={55}
                          label={{ value: "Anomaly (m)", angle: -90, position: "insideLeft", offset: 10, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' } }}
                        />
                        <RechartsTooltip
                          content={<CustomTrajectoryTooltip />}
                          cursor={{ stroke: "rgba(255, 255, 255, 0.1)", strokeWidth: 1 }}
                        />
                        <ReferenceLine
                          y={0}
                          stroke="rgba(255,255,255,0.2)"
                          strokeDasharray="3 3"
                        />
                        {/* Regional average line */}
                        {regionalAvg && (
                          <ReferenceLine
                            y={regionalAvg.mean}
                            stroke="#f97316"
                            strokeDasharray="4 3"
                            strokeWidth={1}
                            label={{
                              value: "Reg. avg",
                              position: "insideTopRight",
                              fill: "#f97316",
                              fontSize: 9,
                            }}
                          />
                        )}
                        <Area
                          type="monotone"
                          dataKey="rollingAvg"
                          stroke="none"
                          fill="url(#areaColor)"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Annual"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth={1.5}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="rollingAvg"
                          name="5-yr Avg"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={false}
                        />
                        {/* Peak year marker */}
                        {peakYear && (
                          <ReferenceDot
                            x={peakYear}
                            y={profile.stats.peakValue}
                            r={5}
                            fill="hsl(var(--primary))"
                            stroke="#fff"
                            strokeWidth={2}
                            label={{
                              value: `Peak ${peakYear}`,
                              position: "top",
                              fill: "#fff",
                              fontSize: 9,
                              fontWeight: "bold"
                            }}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Decade averages bar */}
                <div className="bg-card/10 border border-border/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 font-sans">
                      Decadal Comparisons
                    </h4>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={profile.decadeBreakdown}
                          layout="vertical"
                          margin={{ top: 5, right: 10, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            stroke="rgba(255,255,255,0.04)"
                          />
                          <XAxis
                            type="number"
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
                            tickLine={false}
                            tickFormatter={(v) => v.toFixed(2)}
                            label={{ value: "Avg Anomaly (m)", position: "insideBottom", offset: -12, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' } }}
                          />
                          <YAxis
                            dataKey="label"
                            type="category"
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.8)" }}
                            width={85}
                            tickLine={false}
                            label={{ value: "Decade", angle: -90, position: "insideLeft", offset: 10, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' } }}
                          />
                          <RechartsTooltip
                            cursor={{ fill: "rgba(255,255,255,0.03)" }}
                            content={<CustomDecadeTooltip />}
                          />
                          <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
                          <Bar dataKey="avg" name="Avg Anomaly" radius={[0, 4, 4, 0]} barSize={12}>
                            {profile.decadeBreakdown.map((_, index) => {
                              const colors = [
                                "url(#barColorD1)",
                                "url(#barColorD2)",
                                "url(#barColorD3)",
                              ];
                              return (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Decade Shift Delta callout */}
                  {profile.decadeBreakdown.length >= 3 && (
                    <div className="mt-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs text-muted-foreground font-semibold">D1 → D3 Shift:</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                        {(() => {
                          const d1 = profile.decadeBreakdown[0]?.avg ?? 0;
                          const d3 = profile.decadeBreakdown[2]?.avg ?? 0;
                          const delta = d3 - d1;
                          return `${delta > 0 ? "+" : ""}${delta.toFixed(4)}m`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isNested) {
    return mainContent;
  }

  return (
    <StorySection id="chapter-explorer">
      {mainContent}
    </StorySection>
  );
}
