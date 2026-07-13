import { useGetVolatility } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { motion } from "framer-motion";

const CustomDot = (props: any) => {
  const { cx, cy, payload, globalMean, globalVolatility } = props;
  if (!cx || !cy) return null;
  const isHighRise = payload.mean > globalMean;
  const isHighVol = payload.volatility > globalVolatility;
  const isOutlier = (isHighRise && isHighVol) || (!isHighRise && isHighVol) || (isHighRise && !isHighVol && payload.mean > globalMean * 1.3);
  const color = isHighVol ? "#f97316" : "hsl(var(--primary))";
  return (
    <g>
      <circle cx={cx} cy={cy} r={isOutlier ? 7 : 5} fill={color} opacity={0.85} stroke={isOutlier ? "hsl(var(--background))" : "none"} strokeWidth={1.5} />
      {isOutlier && (
        <text
          x={cx + (isHighRise ? 10 : -10)}
          y={cy - 8}
          textAnchor={isHighRise ? "start" : "end"}
          fill="hsl(var(--foreground))"
          fontSize={10}
          fontWeight="600"
        >
          {payload.code}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
      <p className="font-bold text-foreground mb-2">{d.country} ({d.code})</p>
      <p className="text-sm text-muted-foreground">Mean Rise: <span className="text-foreground">{d.mean.toFixed(3)}m</span></p>
      <p className="text-sm text-muted-foreground">Volatility: <span className="text-foreground">±{d.volatility.toFixed(3)}m</span></p>
    </div>
  );
};

export function ChapterVolatility() {
  const { data, isLoading } = useGetVolatility();

  const sortedByVolatility = data?.countries?.slice().sort((a, b) => a.volatility - b.volatility) || [];
  const mostStable = sortedByVolatility.slice(0, 3);
  const mostVolatile = sortedByVolatility.slice(-3).reverse();

  const quadrantW = data ? (data.globalMean - (data.countries.reduce((mn, c) => Math.min(mn, c.mean), Infinity))) : 0;

  return (
    <StorySection id="chapter-volatility">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Chaos vs. Certainty</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12">
            Not all nations face the same kind of threat. Some experience a steady, relentless rise, while others must survive wild, chaotic swings year over year. Each dot is a nation — its position reveals both how high the ocean has risen and how unpredictable it has been.
          </p>
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
            {/* Legend */}
            <div className="flex items-center gap-6 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: "hsl(var(--primary))" }} />
                Low volatility (stable)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f97316" }} />
                High volatility (chaotic)
              </span>
              <span className="flex items-center gap-2">
                <span className="text-foreground font-bold">XX</span>
                Labelled outliers
              </span>
            </div>

            <div className="relative h-[500px] w-full bg-card/10 rounded-xl border border-border/30">
              {/* Quadrant labels */}
              <div className="absolute top-8 left-[8%] text-xs text-blue-400/60 font-serif italic pointer-events-none z-10">Low Rise / High Chaos</div>
              <div className="absolute top-8 right-[6%] text-xs text-orange-400/60 font-serif italic pointer-events-none z-10">High Rise / High Chaos</div>
              <div className="absolute bottom-14 left-[8%] text-xs text-muted-foreground/50 font-serif italic pointer-events-none z-10">Low Rise / Stable</div>
              <div className="absolute bottom-14 right-[6%] text-xs text-primary/60 font-serif italic pointer-events-none z-10">High Rise / Stable</div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 50, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number" dataKey="mean" name="Mean Anomaly"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => `${v.toFixed(2)}m`}
                    domain={["auto", "auto"]}
                    label={{ value: "Mean Sea Level Anomaly", position: "insideBottom", offset: -15, fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    type="number" dataKey="volatility" name="Volatility"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => `±${v.toFixed(3)}m`}
                    domain={["auto", "auto"]}
                    label={{ value: "Volatility (Std Dev)", angle: -90, position: "insideLeft", offset: 15, fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                  <ReferenceLine x={data.globalMean} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: `avg ${data.globalMean.toFixed(3)}m`, position: "top", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <ReferenceLine y={data.globalVolatility} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: `avg ±${data.globalVolatility.toFixed(3)}m`, position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Scatter
                    name="Countries"
                    data={data.countries}
                    shape={(props: any) => (
                      <CustomDot {...props} globalMean={data.globalMean} globalVolatility={data.globalVolatility} />
                    )}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: "hsl(var(--primary))" }} />
                  Most Stable (Low Volatility)
                </h3>
                <div className="flex flex-col gap-3">
                  {mostStable.map((c, i) => (
                    <div key={c.code} className="flex items-center gap-3 p-3 bg-card/30 border border-border/50 rounded-lg">
                      <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}</span>
                      <span className="font-medium text-foreground flex-1">{c.country}</span>
                      <div className="text-right">
                        <div className="text-primary font-mono text-sm">±{c.volatility.toFixed(3)}m</div>
                        <div className="text-muted-foreground text-xs">mean {c.mean.toFixed(3)}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f97316" }} />
                  Most Volatile (High Chaos)
                </h3>
                <div className="flex flex-col gap-3">
                  {mostVolatile.map((c, i) => (
                    <div key={c.code} className="flex items-center gap-3 p-3 bg-card/30 border border-[#f97316]/20 rounded-lg">
                      <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}</span>
                      <span className="font-medium text-foreground flex-1">{c.country}</span>
                      <div className="text-right">
                        <div className="text-[#f97316] font-mono text-sm">±{c.volatility.toFixed(3)}m</div>
                        <div className="text-muted-foreground text-xs">mean {c.mean.toFixed(3)}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
