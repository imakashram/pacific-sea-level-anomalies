import { useGetAcceleration } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { TrendingUp, ArrowUpRight, Shield, Activity } from "lucide-react";

function SlopeChart({ data }: { data: { country: string; code: string; slopeFirstHalf: number; slopeSecondHalf: number; accelerating: boolean }[] }) {
  const top14 = data.slice(0, 14);
  const allSlopes = top14.flatMap((d) => [d.slopeFirstHalf * 1000, d.slopeSecondHalf * 1000]);
  const minSlope = Math.min(...allSlopes);
  const maxSlope = Math.max(...allSlopes);
  const range = maxSlope - minSlope || 1;

  const W = 540;
  const H = 420;
  const leftX = 120;
  const rightX = W - 80;
  const topPad = 40;
  const botPad = 20;
  const plotH = H - topPad - botPad;

  const slopeToY = (s: number) => topPad + plotH - ((s - minSlope) / range) * plotH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 440 }}>
      {/* Column headers */}
      <text x={leftX} y={22} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontWeight="600">1993–2007</text>
      <text x={rightX} y={22} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontWeight="600">2008–2023</text>
      {/* Y grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = topPad + (pct / 100) * plotH;
        const val = maxSlope - (pct / 100) * range;
        return (
          <g key={pct}>
            <line x1={leftX - 20} y1={y} x2={rightX + 20} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={leftX - 24} y={y + 4} textAnchor="end" fontSize={9} fill="hsl(var(--muted-foreground))">{val.toFixed(1)}</text>
          </g>
        );
      })}
      <text x={leftX - 60} y={topPad + plotH / 2} fontSize={10} fill="hsl(var(--muted-foreground))" transform={`rotate(-90 ${leftX - 60} ${topPad + plotH / 2})`} textAnchor="middle">mm/yr</text>

      {top14.map((d, i) => {
        const y1 = slopeToY(d.slopeFirstHalf * 1000);
        const y2 = slopeToY(d.slopeSecondHalf * 1000);
        const accel = d.slopeSecondHalf > d.slopeFirstHalf;
        const lineColor = accel ? "hsl(var(--primary))" : "hsl(var(--destructive))";
        const alpha = 0.35 + (i / top14.length) * 0.65;
        return (
          <g key={d.code}>
            {/* Connecting line */}
            <line x1={leftX} y1={y1} x2={rightX} y2={y2} stroke={lineColor} strokeWidth={1.5} strokeOpacity={0.7} />
            {/* Left dot */}
            <circle cx={leftX} cy={y1} r={5} fill="hsl(var(--muted-foreground))" strokeWidth={0} opacity={0.8} />
            {/* Right dot */}
            <circle cx={rightX} cy={y2} r={5} fill={lineColor} strokeWidth={0} opacity={0.9} />
            {/* Country label on left */}
            <text x={leftX - 8} y={y1 + 4} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))" opacity={0.9}>{d.code}</text>
            {/* Arrow direction indicator on right */}
            <text x={rightX + 8} y={y2 + 4} textAnchor="start" fontSize={9} fill={lineColor} opacity={0.85}>
              {accel ? "↑" : "↓"}{Math.abs((d.slopeSecondHalf - d.slopeFirstHalf) * 1000).toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PaceOfChange() {
  const { data, isLoading } = useGetAcceleration();

  const sortedByFull = data?.slice().sort((a, b) => b.slopeFullPeriod - a.slopeFullPeriod) || [];
  const sortedByAccel = data?.slice().sort((a, b) => (b.slopeSecondHalf - b.slopeFirstHalf) - (a.slopeSecondHalf - a.slopeFirstHalf)) || [];

  const acceleratingCount = data?.filter((d) => d.accelerating).length ?? 0;
  const avgDelta = data ? data.reduce((s, d) => s + (d.slopeSecondHalf - d.slopeFirstHalf), 0) / data.length * 1000 : 0;

  const mostAccel = sortedByAccel[0];
  const mostStable = sortedByAccel[sortedByAccel.length - 1];

  return (
    <StorySection id="pace-of-change">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center flex flex-col items-center justify-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">The Pace of Change</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
            Sea levels are not only rising - they're rising faster. By comparing the first 15 years with the most recent 15 years, this analysis reveals how the rate of change has accelerated across Pacific nations.
          </p>
        </motion.div>

        {/* Metric Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 w-full text-left"
        >
          {/* Card 1: Nations accelerating */}
          <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-red-500/40 hover:shadow-red-500/5 hover:bg-red-950/5 hover:-translate-y-1">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Nations accelerating
              </span>
              <div className="text-red-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-red-400">
              {isLoading || !data ? "—" : `${acceleratingCount} / ${data.length}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Territories where sea level rise is speeding up
            </div>
          </div>

          {/* Card 2: Average speed increase */}
          <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-orange-500/40 hover:shadow-orange-500/5 hover:bg-orange-950/5 hover:-translate-y-1">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Avg Speed Increase
              </span>
              <div className="text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-orange-400">
              {isLoading || !data ? "—" : `${avgDelta >= 0 ? "+" : ""}${avgDelta.toFixed(2)}`}
              <span className="text-sm font-sans text-muted-foreground ml-1">mm/yr</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Comparison between first and second 15 years
            </div>
          </div>

          {/* Card 3: Most Accelerating */}
          <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-cyan-500/40 hover:shadow-cyan-500/5 hover:bg-cyan-950/5 hover:-translate-y-1">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Most Accelerating
              </span>
              <div className="text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-serif font-bold tracking-tight text-cyan-400">
              {isLoading || !mostAccel ? "—" : mostAccel.country}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isLoading || !mostAccel
                ? "Checking territories..."
                : `Pace jumped from ${(mostAccel.slopeFirstHalf * 1000).toFixed(2)} to ${(mostAccel.slopeSecondHalf * 1000).toFixed(2)} mm/yr - a ${((mostAccel.slopeSecondHalf - mostAccel.slopeFirstHalf) * 1000).toFixed(2)} mm/yr increase.`}
            </div>
          </div>

          {/* Card 4: Most Stable Pace */}
          <div className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm hover:border-teal-500/40 hover:shadow-teal-500/5 hover:bg-teal-950/5 hover:-translate-y-1">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                Most Stable Pace
              </span>
              <div className="text-teal-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-serif font-bold tracking-tight text-teal-400">
              {isLoading || !mostStable ? "—" : mostStable.country}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isLoading || !mostStable
                ? "Checking territories..."
                : `Pace shifted from ${(mostStable.slopeFirstHalf * 1000).toFixed(2)} to ${(mostStable.slopeSecondHalf * 1000).toFixed(2)} mm/yr.`}
            </div>
          </div>
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
            {/* Main: full period slope bar chart */}
            <div className="h-[560px] w-full bg-card/10 p-4 rounded-xl border border-border/30 mb-10">
              <h3 className="text-center font-serif text-sm text-muted-foreground mb-3 uppercase tracking-wide">Full 30-Year Pace (mm/yr) — All Nations</h3>
              <ResponsiveContainer width="100%" height="92%">
                <BarChart data={sortedByFull} layout="vertical" margin={{ top: 5, right: 50, left: 110, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v * 1000).toFixed(1)}`} />
                  <YAxis dataKey="country" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={110} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    contentStyle={{ backgroundColor: "hsl(var(--background)/0.95)", borderColor: "hsl(var(--border)/0.5)", borderRadius: "0.5rem" }}
                    formatter={(value: number, name: string, props: any) => [
                      `${(value * 1000).toFixed(2)} mm/yr`,
                      props.payload.accelerating ? "Accelerating ↑" : "Stable / Slowing"
                    ]}
                  />
                  <Bar dataKey="slopeFullPeriod" radius={[0, 4, 4, 0]}>
                    {sortedByFull.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.accelerating ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} opacity={entry.accelerating ? 1 : 0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Slope chart: first half vs second half */}
            <div className="bg-card/20 p-6 rounded-xl border border-border/30">
              <h3 className="text-lg font-serif font-bold text-foreground mb-1">Slope Chart: Before vs. After 2008</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Each line connects a nation's 1993–2007 rise rate (left) to its 2008–2023 rise rate (right).
                <span className="text-primary ml-2">Cyan = accelerating.</span>
                <span className="text-destructive ml-2">Red = slowing.</span>
              </p>
              <SlopeChart data={sortedByAccel} />
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
