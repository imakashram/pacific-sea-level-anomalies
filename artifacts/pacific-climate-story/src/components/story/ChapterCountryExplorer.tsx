import { useState } from "react";
import { useGetCountryProfile, useGetRankings } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  LineChart,
  Line,
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

function StatCard({
  label,
  value,
  sub,
  color,
  vs,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  vs?: string;
}) {
  return (
    <div className="bg-card/40 p-4 rounded-lg border border-border/50">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-serif font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      {vs && (
        <div className="text-xs text-muted-foreground/60 mt-1 italic border-t border-border/20 pt-1">
          {vs}
        </div>
      )}
    </div>
  );
}

export function ChapterCountryExplorer() {
  const { data: rankings } = useGetRankings();
  const [selectedCode, setSelectedCode] = useState<string>("AS");

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

  return (
    <StorySection id="chapter-explorer">
      <div className="max-w-5xl mx-auto">
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

        {rankings && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {rankings.map((r) => (
              <button
                key={r.code}
                onClick={() => setSelectedCode(r.code)}
                className={`px-4 py-2 text-sm rounded-full transition-all border ${
                  selectedCode === r.code
                    ? "bg-primary border-primary text-primary-foreground font-bold"
                    : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                }`}
              >
                {r.country}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-[600px] relative">
          <AnimatePresence mode="wait">
            {isLoading || !profile ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-card/20 animate-pulse rounded-xl"
              />
            ) : (
              <motion.div
                key={profile.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-card/10 border border-border/30 rounded-2xl p-8 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-2">
                  <h3 className="text-4xl font-serif font-bold text-foreground">
                    {profile.country}{" "}
                    <span className="text-muted-foreground text-2xl">({profile.code})</span>
                  </h3>
                  <div className="text-sm text-muted-foreground bg-card/40 border border-border/40 rounded-lg px-4 py-2">
                    Ranked{" "}
                    <span className="font-bold text-foreground">
                      #{profile.stats.rankByCumulativeRise}
                    </span>{" "}
                    of {profile.stats.totalCountries} by cumulative rise
                  </div>
                </div>

                {/* Stat cards with regional comparison */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatCard
                    label="Cumulative Rise"
                    value={`+${profile.stats.cumulativeRise.toFixed(3)}m`}
                    color="hsl(var(--primary))"
                    vs={
                      regionalAvg
                        ? vsStr(profile.stats.cumulativeRise, regionalAvg.cumulativeRise, "m")
                        : undefined
                    }
                  />
                  <StatCard
                    label="Speed"
                    value={`${(profile.stats.slope * 1000).toFixed(2)} mm/yr`}
                    vs={
                      regionalAvg
                        ? vsStr(profile.stats.slope, regionalAvg.slope, " slope")
                        : undefined
                    }
                  />
                  <StatCard
                    label="Volatility"
                    value={`±${profile.stats.volatility.toFixed(3)}m`}
                    color="#f97316"
                    vs={
                      regionalAvg
                        ? vsStr(profile.stats.volatility, regionalAvg.volatility, "m")
                        : undefined
                    }
                  />
                  <StatCard
                    label="Peak Year"
                    value={`${profile.stats.peakYear}`}
                    sub={`+${profile.stats.peakValue.toFixed(3)}m`}
                    vs={`Trough: ${profile.stats.troughYear} (${profile.stats.troughValue.toFixed(3)}m)`}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 30-year trajectory with peak annotation */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        30-Year Trajectory
                      </h4>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-8 h-0.5 bg-muted-foreground/40 inline-block" />
                          Annual
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-8 h-0.5 bg-primary inline-block" />
                          5-yr Avg
                        </span>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={profile.timeSeries}
                          margin={{ top: 15, right: 20, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="year"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(val) => val.toFixed(2)}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background)/0.95)",
                              borderColor: "hsl(var(--border)/0.5)",
                              borderRadius: "0.5rem",
                            }}
                            formatter={(val: number, name: string) => [
                              `${val.toFixed(3)}m`,
                              name,
                            ]}
                          />
                          <ReferenceLine
                            y={0}
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="3 3"
                            strokeOpacity={0.5}
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
                                fontSize: 10,
                              }}
                            />
                          )}
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Annual"
                            stroke="hsl(var(--muted-foreground)/0.4)"
                            strokeWidth={1}
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
                              r={6}
                              fill="hsl(var(--primary))"
                              stroke="#fff"
                              strokeWidth={2}
                              label={{
                                value: `Peak ${peakYear}`,
                                position: "top",
                                fill: "hsl(var(--primary))",
                                fontSize: 10,
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Decade averages bar */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      Decade Averages
                    </h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={profile.decadeBreakdown}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            type="number"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            tickFormatter={(v) => v.toFixed(2)}
                          />
                          <YAxis
                            dataKey="label"
                            type="category"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 11 }}
                            width={80}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background)/0.95)",
                              borderColor: "hsl(var(--border)/0.5)",
                              borderRadius: "0.5rem",
                            }}
                            formatter={(val: number) => [`${val.toFixed(4)}m`, "Avg Anomaly"]}
                          />
                          <ReferenceLine x={0} stroke="hsl(var(--border))" />
                          <Bar dataKey="avg" name="Avg Anomaly" radius={[0, 4, 4, 0]}>
                            {profile.decadeBreakdown.map((_, index) => {
                              const colors = [
                                "hsl(var(--muted-foreground))",
                                "hsl(var(--secondary))",
                                "hsl(var(--primary))",
                              ];
                              return (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Delta callout */}
                    {profile.decadeBreakdown.length >= 3 && (
                      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                        <span className="text-muted-foreground">D1 → D3 shift: </span>
                        <span className="font-mono font-bold text-primary">
                          {(() => {
                            const d1 = profile.decadeBreakdown[0]?.avg ?? 0;
                            const d3 = profile.decadeBreakdown[2]?.avg ?? 0;
                            const delta = d3 - d1;
                            return `${delta > 0 ? "+" : ""}${delta.toFixed(4)}m`;
                          })()}
                        </span>
                        <span className="text-muted-foreground ml-1">avg anomaly</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StorySection>
  );
}
