import { StorySection } from "./StorySection";
import { useGetCountryComparison } from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
        <p className="font-serif text-lg font-bold text-foreground mb-2">{data.country}</p>
        <div className="space-y-1">
          <p className="text-primary font-medium">
            Cumulative Rise: <span className="text-foreground font-mono">{data.cumulativeRise > 0 ? "+" : ""}{(data.cumulativeRise * 100).toFixed(1)} cm</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Peak: {data.peakValue.toFixed(3)}m ({data.peakYear})
          </p>
          <p className="text-muted-foreground text-sm">
            Latest anomaly: {data.latestAnomaly > 0 ? "+" : ""}{data.latestAnomaly.toFixed(3)}m
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function Chapter4NationsSideBySide() {
  const { data: comparisonData, isLoading } = useGetCountryComparison();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const sortedData = comparisonData
    ? [...comparisonData].sort((a, b) => b.cumulativeRise - a.cumulativeRise)
    : [];

  const avgRise = sortedData.length
    ? sortedData.reduce((s, d) => s + d.cumulativeRise, 0) / sortedData.length
    : 0;

  const maxRiser = sortedData[0];
  const minRiser = sortedData[sortedData.length - 1];
  const aboveAvgCount = sortedData.filter((d) => d.cumulativeRise > avgRise).length;

  return (
    <StorySection id="chapter-4">
      <div className="mb-12 text-center">
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Nations Side by Side</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The burden is not shared equally. While the entire region is rising, specific geographies
          bear the brunt — some absorbing nearly double the regional average.
        </p>
      </div>

      {!isLoading && sortedData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-card/40 border border-border/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Highest Rise</div>
            <div className="text-2xl font-serif font-bold text-primary">{maxRiser?.country}</div>
            <div className="text-sm text-muted-foreground font-mono">+{((maxRiser?.cumulativeRise ?? 0) * 100).toFixed(1)} cm</div>
          </div>
          <div className="bg-card/40 border border-border/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Regional Average</div>
            <div className="text-2xl font-serif font-bold">{(avgRise * 100).toFixed(1)} cm</div>
            <div className="text-sm text-muted-foreground">{aboveAvgCount} / {sortedData.length} above avg</div>
          </div>
          <div className="bg-card/40 border border-border/50 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Lowest Rise</div>
            <div className="text-2xl font-serif font-bold">{minRiser?.country}</div>
            <div className="text-sm text-muted-foreground font-mono">{((minRiser?.cumulativeRise ?? 0) * 100).toFixed(1)} cm</div>
          </div>
        </motion.div>
      )}

      <div ref={ref} className="w-full h-[70vh] min-h-[500px] bg-card/10 border border-border/30 rounded-xl p-4 md:p-8">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif">
            Comparing nations...
          </div>
        ) : isInView && sortedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 20, right: 50, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)} cm`}
              />
              <YAxis
                type="category"
                dataKey="country"
                stroke="hsl(var(--muted-foreground))"
                width={115}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "hsl(var(--primary)/0.1)" }} content={<CustomBarTooltip />} />
              <ReferenceLine
                x={avgRise}
                stroke="#f97316"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: "Regional avg",
                  position: "insideTopRight",
                  fill: "#f97316",
                  fontSize: 11,
                  dx: 4,
                }}
              />
              <Bar
                dataKey="cumulativeRise"
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(var(--primary) / ${1.0 - (index / Math.max(sortedData.length - 1, 1)) * 0.55})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground/60 italic">
        Cumulative sea level rise by territory, 1993–2023 (last year minus first year, in centimetres)
        · Orange dashed line = regional average
      </div>
    </StorySection>
  );
}
