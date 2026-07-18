import { StorySection } from "./StorySection";
import { useGetSeaLevelTrend, useGetNationsRisingByYear } from "@workspace/api-client-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Line, ComposedChart, BarChart, Bar, Cell
} from "recharts";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const avgEntry = payload.find((p: any) => p.dataKey === "avgAnomaly");
  const dataPoint = payload[0]?.payload;
  if (!avgEntry || !dataPoint) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
      <p className="font-serif text-lg font-bold text-foreground mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        <p className="text-primary font-medium">
          Avg Anomaly: <span className="text-foreground">{Number(avgEntry.value).toFixed(3)}m</span>
        </p>
        <p className="text-muted-foreground">
          Range: {Number(dataPoint.minAnomaly).toFixed(3)}m → {Number(dataPoint.maxAnomaly).toFixed(3)}m
        </p>
        <p className="text-muted-foreground pt-2 border-t border-border/50 mt-2">
          {dataPoint.countriesRising} / 21 nations rising this year
        </p>
      </div>
    </div>
  );
};

const RisingTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      <p className="text-primary">{d?.count} of {d?.total} nations positive</p>
      <p className="text-muted-foreground">{d?.pct}% above baseline</p>
    </div>
  );
};

export function TheOceanIsRising() {
  const { data: trendData, isLoading: trendLoading } = useGetSeaLevelTrend();
  const { data: risingData, isLoading: risingLoading } = useGetNationsRisingByYear();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const formattedData = trendData?.map((d) => ({ ...d, range: [d.minAnomaly, d.maxAnomaly] }));

  const maxPct = risingData ? Math.max(...risingData.map((d) => d.pct)) : 100;
  const latestRising = trendData?.[trendData.length - 1]?.countriesRising ?? 0;
  const peakYear = risingData?.reduce((best, d) => d.pct > best.pct ? d : best, { pct: 0, year: 0, count: 0, total: 21 });

  return (
    <StorySection id="the-ocean-is-rising">
      <div className="mb-10 text-center flex flex-col items-center justify-center">
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-center">The Ocean Is Rising</h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed text-center mx-auto">
          Across 21 Pacific nations, sea levels have risen steadily over the past 30 years. Short-term climate cycles create temporary ups and downs, but the long-term trend remains unmistakably upward.
        </p>
      </div>

      <div ref={ref} className="w-full h-[55vh] min-h-[380px] border border-border/30 bg-card/20 rounded-xl p-6 md:p-8 backdrop-blur-sm">
        {trendLoading ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif">
            Loading oceanic data...
          </div>
        ) : isInView && formattedData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickMargin={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(2)}m`} width={70} />
              <Tooltip content={<TrendTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <ReferenceLine x={1998} stroke="hsl(var(--accent))" strokeDasharray="3 3" label={{ position: "top", value: "1998 El Niño", fill: "hsl(var(--accent))", fontSize: 11 }} />
              <ReferenceLine x={2011} stroke="#60a5fa" strokeDasharray="3 3" label={{ position: "top", value: "2011 La Niña", fill: "#60a5fa", fontSize: 11 }} />
              <ReferenceLine x={2016} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: "top", value: "2016 El Niño", fill: "hsl(var(--destructive))", fontSize: 11 }} />
              <Area type="monotone" dataKey="range" stroke="none" fill="url(#colorAvg)" isAnimationActive />
              <Line type="monotone" dataKey="avgAnomaly" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} isAnimationActive animationDuration={3000} animationEasing="ease-out" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      {/* Nations Rising Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6"
      >
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Nations with Positive Anomaly Each Year
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-muted-foreground/40" />Fewer rising</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(var(--primary))" }} />Most rising</span>
          </div>
        </div>
        <div className="h-28 w-full bg-card/10 rounded-xl border border-border/20 px-4 py-2">
          {risingLoading || !risingData ? (
            <div className="h-full animate-pulse bg-card/20 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risingData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <Tooltip content={<RisingTooltip />} cursor={{ fill: "hsl(var(--muted)/0.15)" }} />
                <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                  {risingData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={`hsl(var(--primary) / ${0.25 + (entry.pct / maxPct) * 0.75})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="border-l-2 border-accent pl-4">
          <h4 className="text-accent font-bold mb-1 uppercase tracking-wide text-sm">1998 Anomaly</h4>
          <p className="text-muted-foreground text-sm">A massive El Niño event caused a temporary, drastic drop in sea levels across the Western Pacific, masking the underlying rising trend.</p>
        </div>
        <div className="border-l-2 border-[#60a5fa] pl-4">
          <h4 className="text-[#60a5fa] font-bold mb-1 uppercase tracking-wide text-sm">Peak Year: {peakYear?.year}</h4>
          <p className="text-muted-foreground text-sm">{peakYear?.count} of {peakYear?.total} nations ({peakYear?.pct}%) recorded positive anomalies simultaneously — the highest co-occurrence on record.</p>
        </div>
        <div className="border-l-2 border-primary pl-4">
          <h4 className="text-primary font-bold mb-1 uppercase tracking-wide text-sm">2023: {latestRising} Nations</h4>
          <p className="text-muted-foreground text-sm">In the most recent year, {latestRising} of 21 nations are above their historical average — underscoring the regional scale of the crisis.</p>
        </div>
      </div>
    </StorySection>
  );
}
