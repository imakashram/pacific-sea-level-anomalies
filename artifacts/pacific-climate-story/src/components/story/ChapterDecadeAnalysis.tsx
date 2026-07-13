import { useGetDecadeAnalysis } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

export function ChapterDecadeAnalysis() {
  const { data, isLoading } = useGetDecadeAnalysis();

  const top10 = data?.countries?.slice().sort((a, b) => b.acceleration - a.acceleration).slice(0, 10) || [];

  const accelData = data?.countries
    ?.map((c) => ({
      country: c.country,
      code: c.code,
      delta: parseFloat(((c.d3 ?? 0) - (c.d1 ?? 0)).toFixed(4)),
      d1: c.d1 ?? 0,
      d3: c.d3 ?? 0,
    }))
    .sort((a, b) => b.delta - a.delta) || [];

  const d1Avg = data?.globalDecades.find((d) => d.key === "d1")?.avg ?? 0;
  const d2Avg = data?.globalDecades.find((d) => d.key === "d2")?.avg ?? 0;
  const d3Avg = data?.globalDecades.find((d) => d.key === "d3")?.avg ?? 0;
  const overallAccel = parseFloat((d3Avg - d1Avg).toFixed(4));

  return (
    <StorySection id="chapter-decade">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Three Decades of Escalation</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12">
            The data splits cleanly into three acts. Each decade tells a different story about the same ocean — and the gap between the first and last is undeniable.
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
            className="mb-10"
          >
            {/* Grouped bar chart: top 10 by acceleration */}
            <div className="h-[480px] w-full bg-card/10 p-4 rounded-xl border border-border/30 mb-8">
              <h3 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-3">Top 10 by Decade-on-Decade Acceleration — Avg Sea Level Anomaly (m)</h3>
              <ResponsiveContainer width="100%" height="92%">
                <BarChart data={top10} layout="vertical" margin={{ top: 10, right: 30, left: 110, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(2)}m`} />
                  <YAxis dataKey="country" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={110} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    contentStyle={{ backgroundColor: "hsl(var(--background)/0.95)", borderColor: "hsl(var(--border)/0.5)", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(v: number, name: string) => [`${v.toFixed(3)}m avg`, name]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px", fontSize: 12 }} />
                  <Bar dataKey="d1" name="1993–2002" fill="hsl(var(--muted-foreground))" opacity={0.5} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="d2" name="2003–2012" fill="hsl(var(--secondary))" opacity={0.8} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="d3" name="2013–2023" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lollipop chart: D3 - D1 acceleration delta */}
            <div className="bg-card/20 p-6 rounded-xl border border-border/30 mb-8">
              <h3 className="text-base font-serif font-bold text-foreground mb-1">Acceleration Delta: Decade 3 vs Decade 1</h3>
              <p className="text-sm text-muted-foreground mb-5">
                How much higher was the average sea level in 2013–2023 compared to 1993–2002?
                <span className="text-primary ml-2">Positive = rising faster. Regional avg: {overallAccel >= 0 ? "+" : ""}{(overallAccel * 100).toFixed(1)}cm</span>
              </p>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accelData} layout="vertical" margin={{ top: 5, right: 70, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}cm`} domain={["auto", "auto"]} />
                    <YAxis dataKey="country" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={110} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted)/0.15)" }}
                      contentStyle={{ backgroundColor: "hsl(var(--background)/0.95)", borderColor: "hsl(var(--border)/0.5)", borderRadius: "0.5rem" }}
                      formatter={(v: number) => [`${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}cm`, "D3 vs D1 delta"]}
                    />
                    <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
                    <ReferenceLine x={overallAccel} stroke="hsl(var(--primary))" strokeDasharray="4 2" strokeWidth={1} label={{ value: `avg +${(overallAccel * 100).toFixed(0)}cm`, fill: "hsl(var(--primary))", fontSize: 10, position: "top" }} />
                    <Bar dataKey="delta" radius={[0, 4, 4, 0]} label={{ position: "right", formatter: (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)}cm`, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}>
                      {accelData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.delta > 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} opacity={entry.delta > 0 ? 0.85 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Decade summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">The Baseline (1993–2002)</h4>
                <div className="text-3xl font-serif font-bold text-foreground mb-3">{d1Avg.toFixed(3)}m</div>
                <p className="text-sm text-muted-foreground">The initial decade established a near-baseline of gradual, almost imperceptible rise across the region.</p>
              </div>
              <div className="p-6 bg-card/40 border border-border/50 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">The Warning (2003–2012)</h4>
                <div className="text-3xl font-serif font-bold text-secondary mb-3">+{d2Avg.toFixed(3)}m</div>
                <p className="text-sm text-muted-foreground">The second decade saw the ocean break from its steady pace, showing distinct signs of broader systemic change.</p>
              </div>
              <div className="p-6 bg-card/40 border border-primary/30 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <h4 className="text-xs uppercase tracking-wider text-primary mb-2 relative z-10">The Crisis (2013–2023)</h4>
                <div className="text-3xl font-serif font-bold text-primary mb-3 relative z-10">+{d3Avg.toFixed(3)}m</div>
                <p className="text-sm text-muted-foreground relative z-10">The final decade reveals undeniable acceleration — {(overallAccel * 100).toFixed(0)}cm above the first decade's average.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
