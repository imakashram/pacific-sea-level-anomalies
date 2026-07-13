import { useGetGeographicClusters } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useMemo } from "react";

const REGION_COLORS: Record<string, string> = {
  Polynesia: "#06b6d4",
  Melanesia: "#f97316",
  Micronesia: "#a78bfa",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-6 py-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-foreground">
            {p.value >= 0 ? "+" : ""}{(p.value * 100).toFixed(1)}cm
          </span>
        </div>
      ))}
    </div>
  );
};

export function ChapterRegionalClusters() {
  const { data, isLoading } = useGetGeographicClusters();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.years.map((year) => {
      const row: Record<string, number | string> = { year };
      for (const r of data.regions) {
        const pt = r.yearlyAvg.find((y) => y.year === year);
        row[r.region] = pt?.avgAnomaly ?? 0;
      }
      return row;
    });
  }, [data]);

  const radarData = useMemo(() => {
    if (!data) return [];
    const metrics = [
      { key: "avgCumulativeRise", label: "Cumulative Rise", scale: 100 },
      { key: "avgSlopeMmPerYear", label: "Rise Rate (mm/yr)", scale: 1 },
      { key: "avgDecadeAcceleration", label: "Acceleration", scale: 1000 },
      { key: "avgVolatility", label: "Volatility", scale: 1000 },
    ];
    return metrics.map(({ key, label, scale }) => {
      const row: Record<string, any> = { metric: label };
      for (const r of data.regions) {
        row[r.region] = Math.abs((r.stats as any)[key] * scale);
      }
      return row;
    });
  }, [data]);

  const sortedRegions = data?.regions.slice().sort(
    (a, b) => b.stats.avgCumulativeRise - a.stats.avgCumulativeRise
  ) ?? [];

  const topRegion = sortedRegions[0];

  return (
    <StorySection id="chapter-clusters">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            The Pacific Is Not One Ocean
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            Polynesia, Melanesia, and Micronesia share the same warming ocean — but they are not
            experiencing it equally. Geography, ocean currents, and local climate patterns create
            starkly different realities across the Pacific sub-regions.
          </p>
          {topRegion && (
            <p className="text-base text-primary/80 mb-12 font-medium">
              <span className="text-foreground font-bold">{topRegion.region}</span> leads all sub-regions with an average cumulative rise of{" "}
              <span className="text-primary font-bold">+{(topRegion.stats.avgCumulativeRise * 100).toFixed(1)}cm</span> since 1993 —
              its {topRegion.nationCount} nations rising faster than any other regional cluster.
            </p>
          )}
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[500px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Regional stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sortedRegions.map((r, i) => (
                <motion.div
                  key={r.region}
                  className="p-6 rounded-xl border bg-card/30 relative overflow-hidden"
                  style={{ borderColor: REGION_COLORS[r.region] + "44" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: REGION_COLORS[r.region] }}
                  />
                  <div className="pl-2">
                    <div
                      className="text-xs uppercase tracking-widest font-bold mb-3"
                      style={{ color: REGION_COLORS[r.region] }}
                    >
                      {r.region} · {r.nationCount} nations
                    </div>
                    <div className="text-3xl font-serif font-bold text-foreground mb-1">
                      {r.stats.avgCumulativeRise >= 0 ? "+" : ""}
                      {(r.stats.avgCumulativeRise * 100).toFixed(1)}cm
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">avg cumulative rise since 1993</div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Rise rate</span>
                        <span className="text-foreground font-mono">+{r.stats.avgSlopeMmPerYear.toFixed(2)} mm/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Decade acceleration</span>
                        <span className="text-foreground font-mono">+{(r.stats.avgDecadeAcceleration * 100).toFixed(1)}cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volatility (±)</span>
                        <span className="text-foreground font-mono">{r.stats.avgVolatility.toFixed(3)}m</span>
                      </div>
                      <div className="flex justify-between border-t border-border/30 pt-1.5 mt-1.5">
                        <span>Top nation</span>
                        <span className="text-foreground font-semibold">{r.stats.topNation}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Regional trajectory chart */}
            <div className="bg-card/10 p-5 rounded-xl border border-border/30">
              <h3 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Regional Average Sea Level Anomaly by Year (m)
              </h3>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickMargin={8}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}cm`}
                      width={58}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "0 baseline", fill: "hsl(var(--muted-foreground))", fontSize: 10, position: "insideTopLeft" }} />
                    <ReferenceLine x={1998} stroke="hsl(var(--accent))" strokeDasharray="3 3" strokeWidth={1} label={{ value: "El Niño", fill: "hsl(var(--accent))", fontSize: 10, position: "top" }} />
                    {data.regions.map((r) => (
                      <Line
                        key={r.region}
                        type="monotone"
                        dataKey={r.region}
                        stroke={REGION_COLORS[r.region]}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        animationDuration={2000}
                      />
                    ))}
                    <Legend
                      iconType="line"
                      iconSize={16}
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Nation bar charts per region */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sortedRegions.map((r) => {
                const sorted = [...r.nations].sort((a, b) => b.cumulativeRise - a.cumulativeRise);
                return (
                  <div key={r.region} className="bg-card/10 p-4 rounded-xl border border-border/30">
                    <h4
                      className="text-xs uppercase tracking-wider font-bold mb-3"
                      style={{ color: REGION_COLORS[r.region] }}
                    >
                      {r.region} — Cumulative Rise
                    </h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 40, left: 90, bottom: 0 }}>
                          <XAxis
                            type="number"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                            tickFormatter={(v) => `${(v * 100).toFixed(0)}cm`}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis
                            dataKey="country"
                            type="category"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                            width={90}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background)/0.95)", borderColor: "hsl(var(--border)/0.5)", borderRadius: "0.5rem", fontSize: 11 }}
                            formatter={(v: number) => [`${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}cm`, "Cumulative rise"]}
                          />
                          <Bar dataKey="cumulativeRise" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 8, fill: "hsl(var(--muted-foreground))", formatter: (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)}cm` }}>
                            {sorted.map((entry, i) => (
                              <Cell
                                key={entry.code}
                                fill={REGION_COLORS[r.region]}
                                opacity={1 - i * (0.55 / sorted.length)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Radar comparison */}
            <div className="bg-card/10 p-5 rounded-xl border border-border/30">
              <h3 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Multi-Metric Comparison by Sub-Region
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    {data.regions.map((r) => (
                      <Radar
                        key={r.region}
                        name={r.region}
                        dataKey={r.region}
                        stroke={REGION_COLORS[r.region]}
                        fill={REGION_COLORS[r.region]}
                        fillOpacity={0.18}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background)/0.95)", borderColor: "hsl(var(--border)/0.5)", borderRadius: "0.5rem", fontSize: 11 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Why the Differences?</h4>
                <p className="text-sm text-foreground/80">Ocean basin thermodynamics, wind-driven circulation patterns, and proximity to the warm pool all modulate how global sea level rise manifests locally across sub-regions.</p>
              </div>
              <div className="p-5 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">El Niño Divides</h4>
                <p className="text-sm text-foreground/80">The 1998 El Niño event suppressed Polynesian and Micronesian levels more severely than Melanesia, exposing how ENSO cycles amplify geographic inequality in sea level exposure.</p>
              </div>
              <div className="p-5 bg-card/40 border border-primary/30 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-primary mb-2">No Safe Region</h4>
                <p className="text-sm text-foreground/80">Despite variation in magnitude, every sub-region ends 2023 significantly above its 1993 baseline. The Pacific climate story is universal — only the severity differs.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
