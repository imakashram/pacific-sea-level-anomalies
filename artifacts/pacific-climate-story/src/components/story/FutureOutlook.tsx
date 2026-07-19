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
  ReferenceDot,
} from "recharts";
import { motion } from "framer-motion";
import { Gauge, Activity, Calendar, ShieldAlert } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isProjected = label > 2023;
    const histItem = payload.find((p: any) => p.dataKey === "historical");
    const projItem = payload.find((p: any) => p.dataKey === "projected");
    const bandItem = payload.find((p: any) => p.dataKey === "band");

    return (
      <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[230px] font-mono">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
          <span className="font-serif text-base font-bold text-white">{label}</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${isProjected ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"}`}>
            {isProjected ? "Projection" : "Historical"}
          </span>
        </div>
        <div className="space-y-2 text-xs">
          {histItem && histItem.value != null && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-cyan-400/90 font-medium">Historical Avg</span>
              <span className="font-bold text-cyan-400 text-sm">
                {histItem.value >= 0 ? "+" : ""}{Number(histItem.value).toFixed(2)} cm
              </span>
            </div>
          )}
          {projItem && projItem.value != null && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-orange-400/90 font-medium">Projected Avg</span>
              <span className="font-bold text-orange-400 text-sm">
                {projItem.value >= 0 ? "+" : ""}{Number(projItem.value).toFixed(2)} cm
              </span>
            </div>
          )}
          {bandItem && Array.isArray(bandItem.value) && (
            <div className="flex justify-between items-center gap-4 text-[11px] text-muted-foreground pt-1.5 border-t border-white/5">
              <span>±2σ Confidence</span>
              <span className="font-bold text-amber-400/90">
                [{bandItem.value[0].toFixed(1)} to {bandItem.value[1].toFixed(1)}] cm
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const cardThemes: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  teal: { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", glow: "hover:border-teal-500/40 hover:shadow-teal-500/5 hover:bg-teal-950/5" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "hover:border-cyan-500/40 hover:shadow-cyan-500/5 hover:bg-cyan-950/5" },
  orange: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "hover:border-orange-500/40 hover:shadow-orange-500/5 hover:bg-orange-950/5" },
  red: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "hover:border-red-500/40 hover:shadow-red-500/5 hover:bg-red-950/5" }
};

export function FutureOutlook() {
  const { data, isLoading } = useGetForecast();

  const chartData = data
    ? (() => {
        const lastHist = data.historical[data.historical.length - 1];
        const lastHistCm = lastHist ? lastHist.avgAnomaly * 100 : null;
        return [
          ...data.historical.map((h) => ({
            year: h.year,
            historical: h.avgAnomaly * 100,
            projected: null as number | null,
            lower: null as number | null,
            upper: null as number | null,
            band: null as [number, number] | null,
          })),
          ...(lastHist ? [{
            year: lastHist.year,
            historical: lastHistCm,
            projected: lastHistCm,
            lower: lastHistCm,
            upper: lastHistCm,
            band: [lastHistCm!, lastHistCm!] as [number, number],
          }] : []),
          ...data.projected.map((p) => ({
            year: p.year,
            historical: null as number | null,
            projected: p.projected * 100,
            lower: p.lower * 100,
            upper: p.upper * 100,
            band: [p.lower * 100, p.upper * 100] as [number, number],
          })),
        ];
      })()
    : [];

  return (
    <StorySection id="chapter-forecast">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Future Outlook
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Based on current trends, sea levels are projected to continue rising through 2033.
            The shaded band represents the ±2σ confidence interval, illustrating the range of expected outcomes.
          </p>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[480px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <>
            {(() => {
              const getTrendTheme = (rate: number) => {
                if (rate >= 5.0) return cardThemes.red;
                if (rate >= 3.5) return cardThemes.orange;
                if (rate >= 2.0) return cardThemes.cyan;
                return cardThemes.teal;
              };

              const getR2Theme = (r2: number) => {
                if (r2 >= 0.7) return cardThemes.teal;
                if (r2 >= 0.5) return cardThemes.cyan;
                return cardThemes.orange;
              };

              const getProjectedTheme = (valMm: number) => {
                if (valMm >= 40) return cardThemes.red;
                if (valMm >= 25) return cardThemes.orange;
                if (valMm >= 10) return cardThemes.cyan;
                return cardThemes.teal;
              };

              const trendTheme = getTrendTheme(data.slopeMmPerYear);
              const r2Theme = getR2Theme(data.r2);
              const p2030Theme = getProjectedTheme(data.projectedRise2030 * 1000);
              const p2033Theme = getProjectedTheme(data.projectedRise2033 * 1000);

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10"
                >
                  {/* Trend Rate */}
                  <div className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${trendTheme.glow} hover:-translate-y-1`}>
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        Trend Rate
                      </span>
                      <div className={`${trendTheme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                        <Gauge className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-3xl font-serif font-bold tracking-tight ${trendTheme.text}`}>
                      +{data.slopeMmPerYear.toFixed(2)}
                      <span className="text-sm font-sans text-muted-foreground ml-1">mm/yr</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Historical trend line slope
                    </div>
                  </div>

                  {/* Model Fit R² */}
                  <div className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${r2Theme.glow} hover:-translate-y-1`}>
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        Model Fit R²
                      </span>
                      <div className={`${r2Theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-3xl font-serif font-bold tracking-tight ${r2Theme.text}`}>
                      {(data.r2 * 100).toFixed(1)}
                      <span className="text-sm font-sans text-muted-foreground ml-1">%</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Goodness of fit index
                    </div>
                  </div>

                  {/* Projected by 2030 */}
                  <div className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${p2030Theme.glow} hover:-translate-y-1`}>
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        Projected by 2030
                      </span>
                      <div className={`${p2030Theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-3xl font-serif font-bold tracking-tight ${p2030Theme.text}`}>
                      +{(data.projectedRise2030 * 1000).toFixed(0)}
                      <span className="text-sm font-sans text-muted-foreground ml-1">mm</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Relative to 1993 baseline
                    </div>
                  </div>

                  {/* Projected by 2033 */}
                  <div className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${p2033Theme.glow} hover:-translate-y-1`}>
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        Projected by 2033
                      </span>
                      <div className={`${p2033Theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-3xl font-serif font-bold tracking-tight ${p2033Theme.text}`}>
                      +{(data.projectedRise2033 * 1000).toFixed(0)}
                      <span className="text-sm font-sans text-muted-foreground ml-1">mm</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      10-year outlook projection
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
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
                  <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.04} />
                      </linearGradient>
                      <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="year"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
                      tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} cm`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      x={2023}
                      stroke="rgba(255,255,255,0.3)"
                      strokeDasharray="3 3"
                      label={{
                        value: "Now (2023)",
                        position: "top",
                        fill: "rgba(255,255,255,0.6)",
                        fontSize: 10,
                        fontWeight: "bold",
                        fontFamily: "monospace"
                      }}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                    <Area
                      type="monotone"
                      dataKey="band"
                      stroke="none"
                      fill="url(#confidenceGrad)"
                      connectNulls={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      name="Historical avg"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={false}
                      connectNulls={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      name="Projected avg"
                      stroke="#f97316"
                      strokeWidth={3}
                      strokeDasharray="6 4"
                      dot={false}
                      connectNulls={true}
                    />
                    {data.projectedRise2033 != null && (
                      <ReferenceDot
                        x={2033}
                        y={data.projectedRise2033 * 100}
                        r={5}
                        fill="#f97316"
                        stroke="#ffffff"
                        strokeWidth={2}
                        label={{
                          value: `+${(data.projectedRise2033 * 100).toFixed(1)} cm`,
                          position: "top",
                          fill: "#f97316",
                          fontSize: 10,
                          fontWeight: "bold",
                          fontFamily: "monospace"
                        }}
                      />
                    )}
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
