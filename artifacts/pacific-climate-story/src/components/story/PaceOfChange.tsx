import { useGetAcceleration } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { TrendingUp, ArrowUpRight, Shield, Activity } from "lucide-react";

function solveLabelOverlap(
  yPositions: { id: string; y: number }[],
  labelHeight: number,
  minBound: number,
  maxBound: number
) {
  const items = yPositions.map((p) => ({ ...p, targetY: p.y })).sort((a, b) => a.y - b.y);
  const n = items.length;
  if (n === 0) return {};

  for (let iter = 0; iter < 12; iter++) {
    for (let i = 0; i < n - 1; i++) {
      const cur = items[i];
      const next = items[i + 1];
      const diff = next.y - cur.y;
      if (diff < labelHeight) {
        const overlap = labelHeight - diff;
        cur.y -= overlap / 2;
        next.y += overlap / 2;
      }
    }
  }

  for (let iter = 0; iter < 5; iter++) {
    if (items[0].y < minBound) {
      items[0].y = minBound;
    }
    for (let i = 0; i < n - 1; i++) {
      if (items[i + 1].y < items[i].y + labelHeight) {
        items[i + 1].y = items[i].y + labelHeight;
      }
    }

    if (items[n - 1].y > maxBound) {
      items[n - 1].y = maxBound;
    }
    for (let i = n - 1; i > 0; i--) {
      if (items[i - 1].y > items[i].y - labelHeight) {
        items[i - 1].y = items[i].y - labelHeight;
      }
    }
  }

  const result: Record<string, number> = {};
  for (const item of items) {
    result[item.id] = item.y;
  }
  return result;
}

function SlopeChart({ data }: { data: { country: string; code: string; slopeFirstHalf: number; slopeSecondHalf: number; accelerating: boolean }[] }) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    country: string;
    code: string;
    slopeFirstHalf: number;
    slopeSecondHalf: number;
    x: number;
    y: number;
  } | null>(null);

  const countries = data;

  // Set standard y scale boundaries covering the entire dataset range [-1.76, 10.0]
  const minSlope = -2.0;
  const maxSlope = 10.0;
  const range = maxSlope - minSlope; // 12.0

  const W = 540;
  const H = 420;
  const leftX = 120;
  const rightX = W - 80;
  const topPad = 40;
  const botPad = 25;
  const plotH = H - topPad - botPad;

  const slopeToY = (s: number) => topPad + plotH - ((s - minSlope) / range) * plotH;

  // Equal ticks spanning -2.0 to 10.0
  const ticks = [10.0, 7.0, 4.0, 1.0, -2.0];

  // Resolve overlap for labels on left and right sides
  const leftLabelsY = useMemo(() => {
    const raw = countries.map((d) => ({ id: d.code, y: slopeToY(d.slopeFirstHalf * 1000) }));
    return solveLabelOverlap(raw, 13, topPad, topPad + plotH);
  }, [countries, minSlope, maxSlope, plotH, topPad]);

  const rightLabelsY = useMemo(() => {
    const raw = countries.map((d) => ({ id: d.code, y: slopeToY(d.slopeSecondHalf * 1000) }));
    return solveLabelOverlap(raw, 13, topPad, topPad + plotH);
  }, [countries, minSlope, maxSlope, plotH, topPad]);

  // Dynamic Z-indexing using useMemo so hovered/highlighted lines sit on top
  const sortedLines = useMemo(() => {
    return [...countries].sort((a, b) => {
      if (hoveredCode === a.code) return 1;
      if (hoveredCode === b.code) return -1;
      const aKey = a.code === "PF" || a.code === "VU" || a.code === "NC";
      const bKey = b.code === "PF" || b.code === "VU" || b.code === "NC";
      if (aKey && !bKey) return 1;
      if (!aKey && bKey) return -1;
      return countries.findIndex((x) => x.code === b.code) - countries.findIndex((x) => x.code === a.code);
    });
  }, [countries, hoveredCode]);

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, countryData: typeof countries[0]) => {
    const svg = e.currentTarget.closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setHoveredData({
      ...countryData,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredCode(countryData.code);
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    setHoveredCode(null);
  };

  return (
    <div className="relative w-full">
      <svg 
        viewBox={`0 0 ${W} ${H}`} 
        className="w-full h-auto select-none" 
        style={{ maxHeight: 440 }}
        onMouseLeave={handleMouseLeave}
      >
        {/* Vertical axis track lines */}
        <line x1={leftX} y1={topPad - 15} x2={leftX} y2={topPad + plotH + 15} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
        <line x1={rightX} y1={topPad - 15} x2={rightX} y2={topPad + plotH + 15} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />

        {/* Column headers */}
        <text x={leftX} y={22} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontWeight="600" className="font-mono">1993–2007</text>
        <text x={rightX} y={22} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontWeight="600" className="font-mono">2008–2023</text>

        {/* Y grid lines and labels */}
        {ticks.map((val) => {
          const y = slopeToY(val);
          return (
            <g key={val} className="transition-opacity duration-300">
              <line x1={leftX - 20} y1={y} x2={rightX + 20} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.6} />
              <text x={leftX - 45} y={y + 3.5} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))" className="font-mono" fontWeight="500">{val.toFixed(1)}</text>
            </g>
          );
        })}

        {/* Y Axis unit label */}
        <text x={leftX - 75} y={topPad + plotH / 2} fontSize={10} fill="hsl(var(--muted-foreground))" transform={`rotate(-90 ${leftX - 75} ${topPad + plotH / 2})`} textAnchor="middle" className="font-mono" letterSpacing="0.05em">mm/yr</text>

        {sortedLines.map((d) => {
          const y1 = slopeToY(d.slopeFirstHalf * 1000);
          const y2 = slopeToY(d.slopeSecondHalf * 1000);

          const resolvedY1 = leftLabelsY[d.code] ?? y1;
          const resolvedY2 = rightLabelsY[d.code] ?? y2;

          const isKeyCountry = d.code === "PF" || d.code === "VU" || d.code === "NC";
          const isHovered = hoveredCode === d.code;
          const isAnyHovered = hoveredCode !== null;
          const shouldHighlight = isHovered || (!isAnyHovered && isKeyCountry);

          // Styling properties
          const accel = d.slopeSecondHalf > d.slopeFirstHalf;
          const lineColor = accel ? "hsl(var(--primary))" : "hsl(var(--destructive))";
          const strokeWidth = shouldHighlight ? 2.5 : 1.0;
          const strokeOpacity = isHovered ? 1.0 : (isAnyHovered ? 0.08 : (isKeyCountry ? 0.85 : 0.15));
          const dotRadius = shouldHighlight ? 5.5 : 3.5;
          const textOpacity = shouldHighlight ? 1.0 : (isAnyHovered ? 0.1 : 0.4);

          return (
            <g
              key={d.code}
              className="cursor-pointer"
              onMouseMove={(e) => handleMouseMove(e, d)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Hover buffer line (invisible but thick to make hovering easy) */}
              <line x1={leftX} y1={y1} x2={rightX} y2={y2} stroke="transparent" strokeWidth={15} />

              {/* Connecting line */}
              <line
                x1={leftX}
                y1={y1}
                x2={rightX}
                y2={y2}
                stroke={lineColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                className="transition-all duration-300"
              />

              {/* Left dot */}
              <circle
                cx={leftX}
                cy={y1}
                r={dotRadius}
                fill={shouldHighlight ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                fillOpacity={strokeOpacity}
                className="transition-all duration-300"
              />

              {/* Left dot outer ring on highlight */}
              {shouldHighlight && (
                <circle
                  cx={leftX}
                  cy={y1}
                  r={dotRadius + 3}
                  fill="none"
                  stroke={shouldHighlight ? "hsl(var(--foreground))" : lineColor}
                  strokeWidth={0.8}
                  strokeDasharray="2 2"
                  opacity={strokeOpacity * 0.6}
                  className="transition-all duration-300 animate-pulse"
                />
              )}

              {/* Right dot */}
              <circle
                cx={rightX}
                cy={y2}
                r={dotRadius}
                fill={lineColor}
                fillOpacity={strokeOpacity}
                className="transition-all duration-300"
              />

              {/* Right dot outer ring on highlight */}
              {shouldHighlight && (
                <circle
                  cx={rightX}
                  cy={y2}
                  r={dotRadius + 3}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={0.8}
                  strokeDasharray="2 2"
                  opacity={strokeOpacity * 0.6}
                  className="transition-all duration-300 animate-pulse"
                />
              )}

              {/* Left connector to text if resolved Y is different */}
              {shouldHighlight && Math.abs(resolvedY1 - y1) > 2 && (
                <path
                  d={`M ${leftX - 6} ${y1} L ${leftX - 12} ${y1} L ${leftX - 18} ${resolvedY1}`}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  fill="none"
                  strokeDasharray="2 2"
                  className="transition-all duration-300"
                />
              )}

              {/* Right connector to text if resolved Y is different */}
              {shouldHighlight && Math.abs(resolvedY2 - y2) > 2 && (
                <path
                  d={`M ${rightX + 6} ${y2} L ${rightX + 12} ${y2} L ${rightX + 18} ${resolvedY2}`}
                  stroke={lineColor}
                  strokeWidth={0.5}
                  fill="none"
                  strokeDasharray="2 2"
                  opacity={strokeOpacity}
                  className="transition-all duration-300"
                />
              )}

              {/* Country label on left */}
              <text
                x={shouldHighlight && Math.abs(resolvedY1 - y1) > 2 ? leftX - 22 : leftX - 8}
                y={resolvedY1 + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="hsl(var(--muted-foreground))"
                fontWeight={shouldHighlight ? "700" : "400"}
                opacity={textOpacity}
                className="transition-all duration-300 font-mono"
              >
                {d.code}
              </text>

              {/* Arrow direction indicator on right */}
              <text
                x={shouldHighlight && Math.abs(resolvedY2 - y2) > 2 ? rightX + 22 : rightX + 8}
                y={resolvedY2 + 3.5}
                textAnchor="start"
                fontSize={10}
                fill={lineColor}
                fontWeight={shouldHighlight ? "700" : "500"}
                opacity={textOpacity}
                className="transition-all duration-300 font-mono"
              >
                {d.code} {accel ? "↑" : "↓"}{Math.abs((d.slopeSecondHalf - d.slopeFirstHalf) * 1000).toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* High-Fidelity Custom Tooltip styled like FutureOutlook */}
      {hoveredData && (
        <div
          className="absolute bg-[#0b1528]/95 border p-4 rounded-xl shadow-xl pointer-events-none text-left z-50 min-w-[245px] font-mono transition-all duration-75"
          style={{
            left: hoveredData.x + 15,
            top: hoveredData.y - 45,
            borderColor: hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf ? "rgba(34,211,238,0.3)" : "rgba(239,68,68,0.3)",
            boxShadow: hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
              ? "0 10px 30px rgba(34,211,238,0.2)"
              : "0 10px 30px rgba(239,68,68,0.2)"
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <span className="font-serif text-sm font-bold text-white truncate max-w-[130px]">{hoveredData.country}</span>
            <span
              className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border ${hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
            >
              {hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf ? "Accelerating" : "Slowing"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400/90 font-medium">1993–2007 (Before)</span>
              <span className="font-bold text-slate-300 text-sm">
                {(hoveredData.slopeFirstHalf * 1000).toFixed(2)} mm/yr
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400/90 font-medium">2008–2023 (After)</span>
              <span className="font-bold text-slate-300 text-sm">
                {(hoveredData.slopeSecondHalf * 1000).toFixed(2)} mm/yr
              </span>
            </div>

            <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-white/5 mt-1">
              <span className={hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf ? "text-cyan-300/90 font-medium" : "text-red-300/90 font-medium"}>
                Pace Acceleration
              </span>
              <span className={`font-bold text-sm ${hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf ? "text-cyan-300" : "text-red-300"}`}>
                {hoveredData.slopeSecondHalf > hoveredData.slopeFirstHalf ? "+" : ""}
                {((hoveredData.slopeSecondHalf - hoveredData.slopeFirstHalf) * 1000).toFixed(2)} mm/yr
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BarChartTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const val = payload[0].value * 1000;

  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[220px] font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
        <span className="font-serif text-sm font-bold text-white truncate max-w-[120px]">{d.country}</span>
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border ${d.accelerating
            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }`}
        >
          {d.accelerating ? "Accelerating" : "Stable"}
        </span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-400/90 font-medium">30-Year Trend</span>
          <span className="font-bold text-slate-300 text-sm">
            {val >= 0 ? "+" : ""}
            {val.toFixed(2)} mm/yr
          </span>
        </div>
      </div>
    </div>
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
            <div className="bg-card/10 border border-border/30 rounded-2xl p-6 mb-10 shadow-2xl">
              <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-white/5 select-none px-1 text-left">
                <div className="max-w-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                    Full 30-Year Pace — All Nations
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Linear regression slope (mm/yr) calculated over the entire 30-year observation period (1993–2023).
                  </p>
                </div>
              </div>
              <div className="h-[520px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedByFull} layout="vertical" margin={{ top: 5, right: 40, left: 160, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v * 1000).toFixed(1)}`} />
                    <YAxis dataKey="country" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={160} />
                    <Tooltip content={<BarChartTooltip />} cursor={{ fill: "hsl(var(--muted)/0.15)" }} />
                    <Bar dataKey="slopeFullPeriod" radius={[0, 4, 4, 0]}>
                      {sortedByFull.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.accelerating ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} opacity={entry.accelerating ? 1 : 0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slope chart: first half vs second half */}
            <div className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-white/5 select-none px-1 text-left">
                <div className="max-w-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                    Rate Transition: Before vs. After 2008
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Each line connects a nation's 1993–2007 rise rate (left) to its 2008–2023 rise rate (right).
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-1 self-end">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    Accelerating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                    Slowing
                  </span>
                </div>
              </div>
              <SlopeChart data={sortedByAccel} />
            </div>

            {/* Interaction Helper Text */}
            <p className="text-center text-xs text-muted-foreground mt-4 font-sans select-none">
              Hover over any line or label to isolate its trajectory and trace how that nation's rate of rise accelerated or slowed between epochs.
            </p>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
