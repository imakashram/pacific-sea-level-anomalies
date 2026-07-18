import { StorySection } from "./StorySection";
import { useGetElNinoImpact } from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";

const ImpactTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
      <p className="font-bold text-foreground mb-2">{d?.country || label}</p>
      {d && (
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            1997: <span className="font-mono text-foreground">{d.v1997 != null ? `${d.v1997 > 0 ? "+" : ""}${d.v1997.toFixed(3)}m` : "n/a"}</span>
          </p>
          <p className="text-accent">
            1998 El Niño: <span className="font-mono font-bold">{d.v1998 != null ? `${d.v1998 > 0 ? "+" : ""}${d.v1998.toFixed(3)}m` : "n/a"}</span>
          </p>
          <p className="text-primary">
            1999: <span className="font-mono text-foreground">{d.v1999 != null ? `${d.v1999 > 0 ? "+" : ""}${d.v1999.toFixed(3)}m` : "n/a"}</span>
          </p>
          {d.recovery != null && (
            <p className="text-green-400 border-t border-border/30 pt-1 mt-1">
              Recovery: <span className="font-mono font-bold">+{d.recovery.toFixed(3)}m rebound</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const TrajectoryTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">{p.value != null ? `${p.value > 0 ? "+" : ""}${Number(p.value).toFixed(3)}m` : "n/a"}</span>
        </p>
      ))}
    </div>
  );
};

export function Chapter3ElNino() {
  const { data, isLoading } = useGetElNinoImpact();
  const [showAll, setShowAll] = useState(false);

  // Year-by-year global averages: 1996–2002 for the before/during/after arc
  const arcData = data
    ? [
        { year: "1996", avg: null, label: "Pre" },
        { year: "1997", avg: data.globalAvg1997, label: "Pre" },
        { year: "1998", avg: data.globalAvg1998, label: "El Niño" },
        { year: "1999", avg: data.globalAvg1999, label: "Recovery" },
      ]
    : [];

  // Nations sorted most negative 1998 first
  const displayNations = showAll ? data?.nations ?? [] : data?.nations.slice(0, 12) ?? [];

  return (
    <StorySection id="el-ninos-deception" className="bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-accent">El Niño's Deception</h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            In 1998, the Pacific appeared to be healing. Sea gauges recorded the most dramatic
            negative anomalies in the record — the ocean seemed to retreat. But this was not
            relief. It was the strongest El Niño in modern history temporarily evacuating warm
            water eastward. When the cycle broke, the water surged back — higher than before.
          </p>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[400px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <>
            {/* Stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
            >
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Nations Below Zero</div>
                <div className="text-3xl font-serif font-bold text-accent">{data.totalNegative1998} / {data.nations.length}</div>
              </div>
              <div className="bg-card/40 border border-border/50 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Regional Avg 1997</div>
                <div className="text-3xl font-serif font-bold">{data.globalAvg1997 > 0 ? "+" : ""}{data.globalAvg1997.toFixed(3)}m</div>
              </div>
              <div className="bg-card/40 border border-accent/30 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Regional Avg 1998</div>
                <div className="text-3xl font-serif font-bold text-accent">{data.globalAvg1998.toFixed(3)}m</div>
              </div>
              <div className="bg-primary/5 border border-primary/30 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Regional Avg 1999</div>
                <div className="text-3xl font-serif font-bold text-primary">+{data.globalAvg1999.toFixed(3)}m</div>
              </div>
            </motion.div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Left: Global before/during/after arc */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="lg:col-span-2 bg-card/10 border border-border/30 rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Regional Average Arc
                </h3>
                <p className="text-xs text-muted-foreground/70 mb-4">Before → During → After</p>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={arcData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => `${v.toFixed(2)}m`}
                        tickLine={false}
                      />
                      <Tooltip content={<TrajectoryTooltip />} />
                      <ReferenceLine y={0} stroke="hsl(var(--border))" />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name="Regional avg"
                        stroke="hsl(var(--accent))"
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          const color =
                            payload.label === "El Niño"
                              ? "#f97316"
                              : payload.label === "Recovery"
                              ? "hsl(var(--primary))"
                              : "hsl(var(--accent))";
                          return <circle key={payload.year} cx={cx} cy={cy} r={7} fill={color} stroke="#fff" strokeWidth={2} />;
                        }}
                        connectNulls
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-2 italic text-center">
                  1998 drop then immediate rebound above prior baseline
                </p>
              </motion.div>

              {/* Right: All nations' 1998 value bar chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-3 bg-card/10 border border-border/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Every Nation's 1998 Value
                  </h3>
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="text-xs text-primary/80 hover:text-primary underline transition-colors"
                  >
                    {showAll ? "Show Top 12" : `Show All ${data.nations.length}`}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground/70 mb-4">Sorted by magnitude of suppression (most negative first)</p>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayNations}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 105, bottom: 0 }}
                      barCategoryGap="15%"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        tickFormatter={(v) => `${v.toFixed(2)}m`}
                      />
                      <YAxis
                        dataKey="country"
                        type="category"
                        width={100}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                      />
                      <Tooltip content={<ImpactTooltip />} cursor={{ fill: "hsl(var(--muted)/0.1)" }} />
                      <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                      <ReferenceLine
                        x={data.globalAvg1998}
                        stroke="hsl(var(--accent))"
                        strokeDasharray="4 3"
                        label={{ value: "Avg", position: "insideTopRight", fill: "hsl(var(--accent))", fontSize: 10 }}
                      />
                      <Bar dataKey="v1998" name="1998 anomaly" radius={[0, 3, 3, 0]}>
                        {displayNations.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              (entry.v1998 ?? 0) < -0.05
                                ? "#f97316"
                                : (entry.v1998 ?? 0) < 0
                                ? "#eab308"
                                : "hsl(var(--primary))"
                            }
                            fillOpacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Recovery panel: top 5 most affected with before/after */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-card/10 border border-border/30 rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                The 5 Most Suppressed Nations — and Their Rebound
              </h3>
              <p className="text-xs text-muted-foreground/70 mb-5">
                1997 baseline → 1998 suppression → 1999–2000 recovery. Each nation bounced back above where it started.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {data.nations.slice(0, 5).map((n, i) => (
                  <div key={n.code} className="bg-card/30 border border-border/40 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">#{i + 1}</div>
                    <div className="font-serif font-bold text-sm mb-3">{n.country}</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1997</span>
                        <span className="font-mono">{n.v1997 != null ? `${n.v1997 > 0 ? "+" : ""}${n.v1997.toFixed(2)}m` : "—"}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-[#f97316]">1998</span>
                        <span className="font-mono text-[#f97316]">{n.v1998 != null ? `${n.v1998.toFixed(2)}m` : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary">1999</span>
                        <span className="font-mono text-primary">{n.v1999 != null ? `${n.v1999 > 0 ? "+" : ""}${n.v1999.toFixed(2)}m` : "—"}</span>
                      </div>
                      {n.recovery != null && (
                        <div className="flex justify-between border-t border-border/30 pt-1.5 mt-1.5">
                          <span className="text-green-400/80">Rebound</span>
                          <span className="font-mono font-bold text-green-400">+{n.recovery.toFixed(2)}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground/60 mt-4 italic text-center border-t border-border/20 pt-4">
                "The water returned — but it didn't return to where it left. It returned higher."
              </p>
            </motion.div>
          </>
        )}
      </div>
    </StorySection>
  );
}
