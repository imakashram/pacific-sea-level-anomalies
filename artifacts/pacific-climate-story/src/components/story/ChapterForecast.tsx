import { useGetForecast } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isProjected = label > 2023;
    return (
      <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
        <p className="font-bold text-foreground mb-2">
          {label}{" "}
          {isProjected && (
            <span className="text-xs text-primary/80 font-normal">projection</span>
          )}
        </p>
        {payload.map((p: any) => {
          if (p.value == null) return null;
          return (
            <p key={p.name} className="text-sm" style={{ color: p.color }}>
              {p.name}: <span className="font-mono">{Number(p.value).toFixed(4)}m</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ChapterForecast() {
  const { data, isLoading } = useGetForecast();

  const chartData = data
    ? [
        ...data.historical.map((h) => ({
          year: h.year,
          historical: h.avgAnomaly,
          projected: null as number | null,
          lower: null as number | null,
          upper: null as number | null,
          band: null as [number, number] | null,
        })),
        ...data.projected.map((p) => ({
          year: p.year,
          historical: null as number | null,
          projected: p.projected,
          lower: p.lower,
          upper: p.upper,
          band: [p.lower, p.upper] as [number, number],
        })),
      ]
    : [];

  return (
    <StorySection id="chapter-forecast">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Looking Forward
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            If the current trajectory holds, the model projects continued acceleration
            through 2033. The shaded band represents the ±2σ confidence interval —
            there is no scenario where the trend reverses without intervention.
          </p>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[480px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
            >
              <div className="bg-card/40 border border-border/50 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Trend Rate
                </div>
                <div className="text-3xl font-serif font-bold text-primary">
                  +{data.slopeMmPerYear.toFixed(2)}
                  <span className="text-sm font-sans text-muted-foreground ml-1">mm/yr</span>
                </div>
              </div>
              <div className="bg-card/40 border border-border/50 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Model Fit R²
                </div>
                <div className="text-3xl font-serif font-bold">
                  {(data.r2 * 100).toFixed(1)}
                  <span className="text-sm font-sans text-muted-foreground ml-1">%</span>
                </div>
              </div>
              <div className="bg-card/40 border border-border/50 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Projected by 2030
                </div>
                <div className="text-3xl font-serif font-bold text-[#f97316]">
                  +{(data.projectedRise2030 * 1000).toFixed(0)}
                  <span className="text-sm font-sans text-muted-foreground ml-1">mm</span>
                </div>
              </div>
              <div className="bg-card/40 border border-primary/30 bg-primary/5 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Projected by 2033
                </div>
                <div className="text-3xl font-serif font-bold text-primary">
                  +{(data.projectedRise2033 * 1000).toFixed(0)}
                  <span className="text-sm font-sans text-muted-foreground ml-1">mm</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Sea Level Anomaly — Historical & Projected (2024–2033)
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-primary inline-block" />
                    Historical
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 border-t border-dashed border-[#f97316] inline-block" />
                    Projection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-3 bg-[#f97316]/20 inline-block rounded-sm" />
                    ±2σ Band
                  </span>
                </div>
              </div>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `${v.toFixed(2)}m`}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={2023} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "Now", position: "top", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#confidenceGrad)"
                      connectNulls={false}
                      legendType="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="hsl(var(--background))"
                      connectNulls={false}
                      legendType="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      name="Historical avg"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      name="Projected avg"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      dot={false}
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground/60 mt-4 text-center italic"
            >
              Projection uses ordinary least-squares linear regression fitted on 1993–2023 historical data.
              Confidence bands represent ±2× RMSE of historical residuals. R² = {(data.r2 * 100).toFixed(1)}%.
            </motion.p>
          </>
        )}
      </div>
    </StorySection>
  );
}
