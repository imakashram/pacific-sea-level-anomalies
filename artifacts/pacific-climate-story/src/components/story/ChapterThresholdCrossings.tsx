import { useGetThresholdCrossings } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, BarChart, Bar,
} from "recharts";
import { motion } from "framer-motion";
import { useMemo } from "react";

const THRESHOLD_COLOR: Record<string, string> = {
  firstPositive: "#34d399",
  firstTenth: "#f97316",
  firstFifth: "#ef4444",
};

const THRESHOLD_LABEL: Record<string, string> = {
  firstPositive: "First > 0m",
  firstTenth: "First ≥ 0.1m",
  firstFifth: "First ≥ 0.2m",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{d.country}</p>
      <div className="space-y-0.5">
        {d.firstPositive && (
          <div className="flex justify-between gap-4">
            <span style={{ color: THRESHOLD_COLOR.firstPositive }}>First &gt; 0m</span>
            <span className="font-mono">{d.firstPositive}</span>
          </div>
        )}
        {d.firstTenth && (
          <div className="flex justify-between gap-4">
            <span style={{ color: THRESHOLD_COLOR.firstTenth }}>First ≥ 0.1m</span>
            <span className="font-mono">{d.firstTenth}</span>
          </div>
        )}
        {d.firstFifth && (
          <div className="flex justify-between gap-4">
            <span style={{ color: THRESHOLD_COLOR.firstFifth }}>First ≥ 0.2m</span>
            <span className="font-mono">{d.firstFifth}</span>
          </div>
        )}
        <div className="border-t border-border/30 pt-1 mt-1 flex justify-between gap-4">
          <span className="text-muted-foreground">Years above zero</span>
          <span className="font-mono">{d.yearsPositive}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Latest value</span>
          <span className="font-mono">{d.latestValue >= 0 ? "+" : ""}{d.latestValue}m</span>
        </div>
      </div>
    </div>
  );
};

export function ChapterThresholdCrossings() {
  const { data, isLoading } = useGetThresholdCrossings();

  const scatterData = useMemo(() => {
    if (!data) return { zero: [], tenth: [], fifth: [] };
    const indexed = data.nations.map((n, idx) => ({ ...n, idx }));
    return {
      zero: indexed
        .filter((n) => n.firstPositive != null)
        .map((n) => ({ ...n, year: n.firstPositive, threshold: "firstPositive" })),
      tenth: indexed
        .filter((n) => n.firstTenth != null)
        .map((n) => ({ ...n, year: n.firstTenth, threshold: "firstTenth" })),
      fifth: indexed
        .filter((n) => n.firstFifth != null)
        .map((n) => ({ ...n, year: n.firstFifth, threshold: "firstFifth" })),
    };
  }, [data]);

  const streakData = useMemo(() => {
    if (!data) return [];
    return [...data.nations]
      .sort((a, b) => b.yearsPositive - a.yearsPositive)
      .slice(0, 12)
      .map((n) => ({
        country: n.country.length > 14 ? n.country.slice(0, 13) + "…" : n.country,
        yearsPositive: n.yearsPositive,
        yearsAboveTenth: n.yearsAboveTenth,
        code: n.code,
      }));
  }, [data]);

  const yTickFormatter = (_: any, index: number) => {
    return data?.nations[index]?.country ?? "";
  };

  return (
    <StorySection id="chapter-thresholds">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            When the Line Was Crossed
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            Every nation has a year when the ocean first broke past zero — its first recorded positive anomaly. Some followed quickly with 0.1m, then 0.2m. These threshold crossings mark the moment the future arrived.
          </p>
          {data && (
            <p className="text-base text-primary/80 mb-12">
              <span className="font-bold text-foreground">{data.summary.crossedZero} of {data.summary.total}</span> nations have gone above zero, and{" "}
              <span className="font-bold text-foreground">{data.summary.crossedTenth}</span> have reached 0.1m.{" "}
              The average year of first positive crossing:{" "}
              <span className="font-bold text-primary">{data.summary.avgFirstPositiveYear.toFixed(0)}</span>.
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
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Nations above 0m", value: data.summary.crossedZero, color: THRESHOLD_COLOR.firstPositive, of: data.summary.total },
                { label: "Nations above 0.1m", value: data.summary.crossedTenth, color: THRESHOLD_COLOR.firstTenth, of: data.summary.total },
                { label: "Nations above 0.2m", value: data.summary.crossedFifth, color: THRESHOLD_COLOR.firstFifth, of: data.summary.total },
                { label: "Avg year of first crossing", value: data.summary.avgFirstPositiveYear.toFixed(0), color: "#06b6d4", of: null },
              ].map(({ label, value, color, of }, i) => (
                <motion.div
                  key={label}
                  className="p-4 bg-card/30 border border-border/40 rounded-xl text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="text-3xl font-serif font-bold mb-1" style={{ color }}>
                    {value}
                    {of != null && <span className="text-base text-muted-foreground font-normal"> /{of}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Timeline scatter: Y = nation (sorted by firstPositive), X = year, dots by threshold */}
            <div className="bg-card/10 p-5 rounded-xl border border-border/30">
              <h3 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Threshold Crossing Timeline — Each Dot = First Year at That Level
              </h3>
              <div className="flex items-center justify-center gap-6 mb-4">
                {Object.entries(THRESHOLD_LABEL).map(([k, label]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THRESHOLD_COLOR[k] }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <div className="h-[520px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 5, right: 20, left: 110, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      type="number"
                      dataKey="year"
                      domain={[1993, 2023]}
                      ticks={[1993, 1996, 1999, 2002, 2005, 2008, 2011, 2014, 2017, 2020, 2023]}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="idx"
                      domain={[-0.5, data.nations.length - 0.5]}
                      tickCount={data.nations.length}
                      tickFormatter={yTickFormatter}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                      width={108}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={1998} stroke="hsl(var(--accent))" strokeDasharray="3 3" strokeWidth={1} label={{ value: "El Niño", fill: "hsl(var(--accent))", fontSize: 9, position: "top" }} />
                    <ReferenceLine x={2010} stroke="#60a5fa" strokeDasharray="3 3" strokeWidth={1} label={{ value: "La Niña", fill: "#60a5fa", fontSize: 9, position: "top" }} />

                    <Scatter data={scatterData.zero} shape={(props: any) => {
                      const { cx, cy } = props;
                      return <circle cx={cx} cy={cy} r={6} fill={THRESHOLD_COLOR.firstPositive} opacity={0.9} />;
                    }} />
                    <Scatter data={scatterData.tenth} shape={(props: any) => {
                      const { cx, cy } = props;
                      return <circle cx={cx} cy={cy} r={7} fill={THRESHOLD_COLOR.firstTenth} opacity={0.85} />;
                    }} />
                    <Scatter data={scatterData.fifth} shape={(props: any) => {
                      const { cx, cy } = props;
                      return <circle cx={cx} cy={cy} r={9} fill={THRESHOLD_COLOR.firstFifth} opacity={0.85} />;
                    }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time above zero / time above 0.1m comparison bar chart */}
            <div className="bg-card/10 p-5 rounded-xl border border-border/30">
              <h3 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Years Spent Above Key Thresholds (top 12 by exposure)
              </h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streakData} layout="vertical" margin={{ top: 0, right: 60, left: 115, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      label={{ value: "Years", position: "insideBottomRight", offset: -5, fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      domain={[0, 31]}
                    />
                    <YAxis
                      dataKey="country"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                      width={115}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background)/0.95)", borderColor: "hsl(var(--border)/0.5)", borderRadius: "0.5rem", fontSize: 11 }}
                      formatter={(v: number, name: string) => [`${v} years`, name]}
                    />
                    <Bar dataKey="yearsPositive" name="Years > 0m" fill={THRESHOLD_COLOR.firstPositive} opacity={0.7} radius={[0, 3, 3, 0]} label={{ position: "right", fontSize: 9, fill: "hsl(var(--muted-foreground))", formatter: (v: number) => `${v}yr` }} />
                    <Bar dataKey="yearsAboveTenth" name="Years ≥ 0.1m" fill={THRESHOLD_COLOR.firstTenth} opacity={0.8} radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">First Movers</h4>
                <p className="text-sm text-foreground/80">
                  The earliest threshold crossers went above zero in the late 1990s to early 2000s — before the globally coordinated climate response was fully in motion.
                </p>
              </div>
              <div className="p-5 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">El Niño Delay</h4>
                <p className="text-sm text-foreground/80">
                  The 1998 El Niño suppressed values, delaying some crossings into the early 2000s. Without this temporary cooling, most nations would have crossed zero sooner.
                </p>
              </div>
              <div className="p-5 bg-card/40 border border-primary/30 rounded-xl">
                <h4 className="text-sm uppercase tracking-wider text-primary mb-2">Accumulating Exposure</h4>
                <p className="text-sm text-foreground/80">
                  Nations that crossed 0m earliest now have the most cumulative years of exposure above each threshold — embedding long-term infrastructure and ecosystem damage.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
