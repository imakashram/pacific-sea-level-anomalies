import { useGetCumulativeRiseTimeseries } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const PALETTE = [
  "#06b6d4", "#f97316", "#a78bfa", "#34d399", "#fb7185",
  "#fbbf24", "#60a5fa", "#f472b6", "#4ade80", "#e879f9",
  "#38bdf8", "#fdba74", "#c4b5fd", "#6ee7b7", "#fca5a5",
];

const CustomTooltip = ({ active, payload, label, topCountries }: any) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => (b.value ?? -99) - (a.value ?? -99));
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs max-h-64 overflow-y-auto">
      <p className="font-serif font-bold text-foreground mb-2 text-sm">{label}</p>
      {sorted.slice(0, 10).map((entry: any) => (
        entry.value != null && (
          <div key={entry.dataKey} className="flex justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="text-foreground font-mono">
              {entry.value >= 0 ? "+" : ""}{(entry.value * 100).toFixed(1)}cm
            </span>
          </div>
        )
      ))}
    </div>
  );
};

export function ChapterCumulativeRise() {
  const { data, isLoading } = useGetCumulativeRiseTimeseries();
  const [showAll, setShowAll] = useState(false);

  const { chartData, displayCountries } = useMemo(() => {
    if (!data) return { chartData: [], displayCountries: [] };
    const top = showAll ? data.countries : data.countries.slice(0, 10);
    const rows = data.years.map((year) => {
      const row: Record<string, number | null | string> = { year };
      for (const c of top) {
        const pt = c.data.find((d) => d.year === year);
        row[c.code] = pt?.cumulative ?? null;
      }
      return row;
    });
    return { chartData: rows, displayCountries: top };
  }, [data, showAll]);

  const topCountry = data?.countries[0];
  const totalRiseArr = data?.countries.map((c) => c.totalRise) ?? [];
  const avgTotalRise = totalRiseArr.length ? totalRiseArr.reduce((s, v) => s + v, 0) / totalRiseArr.length : 0;
  const posCount = totalRiseArr.filter((v) => v > 0).length;

  return (
    <StorySection id="chapter-cumulative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Racing to the Top</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            Each line traces a nation's cumulative sea level departure from its own 1993 baseline. 
            The steeper the slope and higher the endpoint, the more that nation has experienced.
          </p>
          <div className="flex items-center gap-4 mb-10">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="border-l-2 border-primary pl-3">
                <div className="text-2xl font-serif font-bold text-primary">
                  {topCountry ? `+${(topCountry.totalRise * 100).toFixed(0)}cm` : "—"}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                  {topCountry?.country ?? "—"} (highest)
                </div>
              </div>
              <div className="border-l-2 border-muted-foreground/50 pl-3">
                <div className="text-2xl font-serif font-bold text-foreground">
                  {avgTotalRise >= 0 ? "+" : ""}{(avgTotalRise * 100).toFixed(1)}cm
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                  Regional average rise
                </div>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <div className="text-2xl font-serif font-bold text-accent">
                  {posCount} / {totalRiseArr.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                  Nations above 1993 level
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAll((p) => !p)}
              className="text-xs text-muted-foreground border border-border/50 rounded px-3 py-1.5 hover:text-foreground hover:border-primary/50 transition-colors"
            >
              {showAll ? "Show Top 10" : "Show All 21"}
            </button>
          </div>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[500px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="h-[520px] w-full bg-card/10 p-4 rounded-xl border border-border/30">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}cm`}
                    width={64}
                  />
                  <Tooltip content={<CustomTooltip topCountries={displayCountries} />} />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "1993 baseline", fill: "hsl(var(--muted-foreground))", fontSize: 11, position: "insideTopLeft" }} />
                  <ReferenceLine x={1998} stroke="hsl(var(--accent))" strokeDasharray="3 3" strokeWidth={1} label={{ value: "El Niño", fill: "hsl(var(--accent))", fontSize: 10, position: "top" }} />
                  <ReferenceLine x={2011} stroke="#60a5fa" strokeDasharray="3 3" strokeWidth={1} label={{ value: "La Niña", fill: "#60a5fa", fontSize: 10, position: "top" }} />
                  {displayCountries.map((c, i) => (
                    <Line
                      key={c.code}
                      type="monotone"
                      dataKey={c.code}
                      name={c.country}
                      stroke={PALETTE[i % PALETTE.length]}
                      strokeWidth={showAll ? 1.5 : 2}
                      dot={false}
                      connectNulls
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      isAnimationActive={true}
                      animationDuration={2000}
                    />
                  ))}
                  <Legend
                    iconType="line"
                    iconSize={16}
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-5 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">1998 Dip</h4>
                <p className="text-sm text-foreground/80">The 1998 El Niño pulled water eastward, causing a sharp downward inflection visible across nearly all trajectories — a false reprieve.</p>
              </div>
              <div className="p-5 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Post-2010 Divergence</h4>
                <p className="text-sm text-foreground/80">After 2010, the lines fan out as different nations feel different intensities of the same global warming signal — the spread is widening.</p>
              </div>
              <div className="p-5 bg-card/40 border border-primary/30 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-primary mb-3">The Top Tier</h4>
                <p className="text-sm text-foreground/80">The top 3 nations by 2023 are already {topCountry ? `${(topCountry.totalRise * 100).toFixed(0)}cm` : "—"}, {data.countries[1] ? `${(data.countries[1].totalRise * 100).toFixed(0)}cm` : "—"}, and {data.countries[2] ? `${(data.countries[2].totalRise * 100).toFixed(0)}cm` : "—"} above their 1993 baselines.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
