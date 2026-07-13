import { useGetNationsRisingByYear } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Label,
} from "recharts";

const KEY_EVENTS: { year: number; label: string; offset?: number }[] = [
  { year: 1998, label: "El Niño dip", offset: -30 },
  { year: 2011, label: "La Niña peak", offset: 10 },
  { year: 2015, label: "All 21 nations", offset: 10 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md">
      <p className="font-bold text-foreground mb-1">{label}</p>
      <p className="text-sm text-muted-foreground">
        Nations above baseline:{" "}
        <span className="text-primary font-bold">{d.count} / {d.total}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Share: <span className="text-foreground">{d.pct}%</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Avg anomaly: <span className="text-foreground">{(d.avgAnomaly * 100).toFixed(1)} cm</span>
      </p>
    </div>
  );
};

export function ChapterBaselineBreach() {
  const { data, isLoading } = useGetNationsRisingByYear();

  const peakYear = data?.find((d) => d.count === d.total)?.year;
  const firstAll = data?.filter((d) => d.count === d.total)[0];
  const elNinoDip = data?.find((d) => d.year === 1998);

  return (
    <StorySection id="chapter-baseline">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          When Did The Pacific Tip?
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl">
          Each year, more nations crossed above their 1993 baseline. What began as a handful
          became all 21 — a point of no return. This is the story of when the Pacific tipped
          from recovery to permanent rise.
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[420px] bg-card/20 animate-pulse rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="h-[420px] w-full bg-card/10 rounded-xl border border-border/30 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 30, right: 40, bottom: 20, left: 40 }}>
                <defs>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="year"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 21]}
                  ticks={[0, 7, 14, 21]}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  label={{
                    value: "Nations above baseline",
                    angle: -90,
                    position: "insideLeft",
                    offset: -25,
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 2" }} />

                <ReferenceLine y={21} stroke="hsl(var(--primary))" strokeDasharray="4 2" strokeOpacity={0.6}>
                  <Label value="All 21 nations" position="insideRight" fill="hsl(var(--primary))" fontSize={10} offset={6} />
                </ReferenceLine>

                {KEY_EVENTS.map((evt) => (
                  <ReferenceLine
                    key={evt.year}
                    x={evt.year}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    label={{
                      value: evt.label,
                      position: evt.offset && evt.offset < 0 ? "insideTopLeft" : "insideTopRight",
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 9,
                    }}
                  />
                ))}

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#baselineGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            <div className="p-5 bg-card/30 border border-border/50 rounded-xl">
              <div className="text-3xl font-serif font-bold text-primary mb-1">
                {elNinoDip?.count ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">Nations above baseline in 1998</div>
              <div className="text-xs text-muted-foreground/70 mt-1">El Niño suppressed sea levels across the Pacific</div>
            </div>
            <div className="p-5 bg-card/30 border border-border/50 rounded-xl">
              <div className="text-3xl font-serif font-bold text-primary mb-1">
                {firstAll?.year ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">First year all 21 above baseline</div>
              <div className="text-xs text-muted-foreground/70 mt-1">The tipping point — no nation has recovered to baseline since</div>
            </div>
            <div className="p-5 bg-card/30 border border-border/50 rounded-xl">
              <div className="text-3xl font-serif font-bold text-primary mb-1">
                {data[data.length - 1]?.pct ?? "—"}%
              </div>
              <div className="text-sm text-muted-foreground">Nations above baseline in 2023</div>
              <div className="text-xs text-muted-foreground/70 mt-1">Every Pacific nation is now living above its 1993 sea level</div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">The tipping point was {firstAll?.year ?? "—"}.</span>{" "}
              Before that, El Niño events still pushed nations back below their 1993 baseline —
              a temporary relief. From {firstAll?.year ?? "—"} onward, all 21 nations have
              stayed above baseline every single year. The Pacific has not recovered, and the
              data shows no sign it will.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
