import { useGetRateOfChange } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md min-w-[200px]">
      <p className="font-bold text-foreground mb-3">{label}</p>
      {payload.map((p: any) => {
        if (p.value == null) return null;
        const isMm = p.dataKey === "yoyDelta";
        const val = isMm ? (p.value * 1000).toFixed(1) + " mm" : p.value.toFixed(4) + " m";
        return (
          <p key={p.dataKey} className="text-sm flex justify-between gap-6">
            <span style={{ color: p.color || p.fill }} className="opacity-80">{p.name}</span>
            <span className="font-mono font-semibold text-foreground">{isMm && p.value > 0 ? "+" : ""}{val}</span>
          </p>
        );
      })}
    </div>
  );
};

export function ChapterRateOfChange() {
  const { data, isLoading } = useGetRateOfChange();

  const maxDeltaPoint = data?.reduce(
    (prev, current) => ((current.yoyDelta || 0) > (prev.yoyDelta || 0) ? current : prev),
    { yoyDelta: 0, year: 0 }
  );

  const minDeltaPoint = data?.reduce(
    (prev, current) => ((current.yoyDelta || 0) < (prev.yoyDelta || 0) ? current : prev),
    { yoyDelta: 0, year: 0 }
  );

  return (
    <StorySection id="chapter-roc">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">The Acceleration Signal</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12">
            Year-over-year deltas expose the ocean's heartbeat. Blue bars show years when the
            average rose faster than the prior year; red bars show years it fell back. The amber
            rolling average cuts through the noise — its steady upward creep is the real story.
          </p>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[400px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Legend */}
            <div className="flex flex-wrap gap-6 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-8 h-3 rounded-sm bg-muted/40 inline-block" />
                Avg Anomaly (m, left axis)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-3 bg-primary/80 rounded-sm inline-block" />
                <span className="w-4 h-3 bg-destructive/80 rounded-sm inline-block" />
                YoY Delta (mm, right axis — blue rise / red drop)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#f59e0b] inline-block" />
                5-yr Rolling Avg (m, left axis)
              </span>
            </div>

            <div className="h-[500px] w-full bg-card/10 p-4 rounded-xl border border-border/30 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 55, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                  />
                  {/* Left axis: metres (for anomaly area + rolling avg) */}
                  <YAxis
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(val) => `${val.toFixed(2)}m`}
                    tickLine={false}
                    label={{ value: "Anomaly (m)", angle: -90, position: "insideLeft", dx: -4, fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  {/* Right axis: millimetres (for YoY delta bars) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(val) => `${(val * 1000).toFixed(0)}mm`}
                    tickLine={false}
                    label={{ value: "YoY Δ (mm)", angle: 90, position: "insideRight", dx: 10, fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* Background area showing the raw anomaly level */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgAnomaly"
                    name="Avg Anomaly"
                    fill="hsl(var(--muted)/0.25)"
                    stroke="none"
                  />

                  {/* YoY delta bars on the right axis */}
                  <Bar yAxisId="right" dataKey="yoyDelta" name="YoY Delta" maxBarSize={16}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          (entry.yoyDelta || 0) > 0
                            ? "hsl(var(--primary))"
                            : "hsl(var(--destructive))"
                        }
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>

                  {/* 5-yr rolling average — the headline trend */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rollingAvg"
                    name="5yr Rolling Avg"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={false}
                    connectNulls
                  />

                  <ReferenceLine
                    yAxisId="right"
                    y={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x={1998}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                    label={{ position: "top", value: "1998 El Niño", fill: "hsl(var(--destructive))", fontSize: 10 }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x={2011}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                    label={{ position: "top", value: "2011 La Niña", fill: "hsl(var(--primary))", fontSize: 10 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-card/40 border border-destructive/20 rounded-xl border-l-4 border-l-destructive">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Largest Single-Year Drop</h4>
                <div className="text-2xl font-serif font-bold text-destructive mb-1">{minDeltaPoint?.year} — {((minDeltaPoint?.yoyDelta ?? 0) * 1000).toFixed(1)} mm</div>
                <p className="text-sm text-muted-foreground">The 1998 El Niño temporarily drew water eastward, creating the sharpest negative delta in the record.</p>
              </div>
              <div className="p-6 bg-card/40 border border-primary/20 rounded-xl border-l-4 border-l-primary">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Largest Single-Year Surge</h4>
                <div className="text-2xl font-serif font-bold text-primary mb-1">{maxDeltaPoint?.year} — +{((maxDeltaPoint?.yoyDelta ?? 0) * 1000).toFixed(1)} mm</div>
                <p className="text-sm text-muted-foreground">Following the La Niña rebound, water piled back into the Western Pacific at an unprecedented rate.</p>
              </div>
              <div className="p-6 bg-card/40 border border-[#f59e0b]/20 rounded-xl border-l-4 border-l-[#f59e0b]">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Rolling Trend Verdict</h4>
                <div className="text-2xl font-serif font-bold text-[#f59e0b] mb-1">Steadily Rising</div>
                <p className="text-sm text-muted-foreground">The amber rolling average has only moved in one direction over 30 years — upward — regardless of individual year noise.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
