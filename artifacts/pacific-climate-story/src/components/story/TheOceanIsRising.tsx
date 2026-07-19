import { StorySection } from "./StorySection";
import { useGetSeaLevelTrend } from "@workspace/api-client-react";
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Line, ComposedChart
} from "recharts";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Waves } from "lucide-react";

const TrendTooltip = ({ active, payload, label, showRegression, showMovingAvg }: any) => {
  if (!active || !payload?.length) return null;
  const avgEntry = payload.find((p: any) => p.dataKey === "avgAnomaly");
  const movingEntry = payload.find((p: any) => p.dataKey === "movingAvg");
  const regressionEntry = payload.find((p: any) => p.dataKey === "linearTrend");
  const dataPoint = payload[0]?.payload;
  if (!avgEntry || !dataPoint) return null;
  return (
    <div className="bg-[#0b1528]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-md min-w-[240px]">
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-2">
        <span className="font-serif text-lg font-bold text-white">{label}</span>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 rounded-full uppercase">SLA Record</span>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center gap-6">
          <span className="text-cyan-400/90 font-medium">Annual</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {Number(avgEntry.value) > 0 ? "+" : ""}{(Number(avgEntry.value) * 100).toFixed(1)} cm
          </span>
        </div>
        
        {showMovingAvg && movingEntry && movingEntry.value != null && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-amber-400/90 font-medium">5-yr Avg</span>
            <span className="font-mono font-bold text-amber-400">
              {Number(movingEntry.value) > 0 ? "+" : ""}{(Number(movingEntry.value) * 100).toFixed(1)} cm
            </span>
          </div>
        )}

        {showRegression && regressionEntry && regressionEntry.value != null && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-teal-400/90 font-medium">Linear Trend</span>
            <span className="font-mono font-bold text-teal-400">
              {Number(regressionEntry.value) > 0 ? "+" : ""}{(Number(regressionEntry.value) * 100).toFixed(1)} cm
            </span>
          </div>
        )}

        <div className="flex justify-between items-center gap-6 pt-1 border-t border-cyan-500/10">
          <span className="text-muted-foreground font-medium">Min – Max Range</span>
          <span className="font-mono text-slate-300">
            {(Number(dataPoint.minAnomaly) * 100).toFixed(1)} cm → {(Number(dataPoint.maxAnomaly) * 100).toFixed(1)} cm
          </span>
        </div>
        
        <div className="pt-1 flex justify-between items-center gap-6">
          <span className="text-muted-foreground flex items-center gap-1 font-medium">
            <Waves className="w-3.5 h-3.5 text-cyan-400/80" />
            Nations Rising
          </span>
          <span className="font-mono text-cyan-200 font-bold bg-cyan-900/30 px-1.5 py-0.5 rounded">
            {dataPoint.countriesRising} / 21
          </span>
        </div>
      </div>
    </div>
  );
};



export function TheOceanIsRising() {
  const { data: trendData, isLoading: trendLoading } = useGetSeaLevelTrend();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [showRegression, setShowRegression] = useState(true);
  const [showMovingAvg, setShowMovingAvg] = useState(true);

  // Compute Linear Regression
  const reg = trendData ? (() => {
    const n = trendData.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += trendData[i].year;
      sumY += trendData[i].avgAnomaly;
      sumXY += trendData[i].year * trendData[i].avgAnomaly;
      sumXX += trendData[i].year * trendData[i].year;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  })() : { slope: 0, intercept: 0 };

  // Compute total rise and decadal averages
  const startVal = trendData && trendData.length > 0 ? trendData[0].avgAnomaly : 0;
  const endVal = trendData && trendData.length > 0 ? trendData[trendData.length - 1].avgAnomaly : 0;
  const totalRiseCm = (endVal - startVal) * 100;

  const firstDecadeAvg = trendData && trendData.length >= 10 ? trendData.slice(0, 10).reduce((acc, cur) => acc + cur.avgAnomaly, 0) / 10 : 0;
  const recentDecadeAvg = trendData && trendData.length >= 10 ? trendData.slice(-10).reduce((acc, cur) => acc + cur.avgAnomaly, 0) / 10 : 0;
  const shiftCm = (recentDecadeAvg - firstDecadeAvg) * 100;

  let formattedData = trendData?.map((d) => ({ ...d, range: [d.minAnomaly, d.maxAnomaly] })) ?? [];

  if (trendData && trendData.length > 0) {
    const { slope, intercept } = reg;
    // 1. Add linear regression line data
    formattedData = formattedData.map(d => ({
      ...d,
      linearTrend: parseFloat((slope * d.year + intercept).toFixed(4))
    }));

    // 2. Add 5-year moving average data
    const windowSize = 5;
    formattedData = formattedData.map((d, i) => {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(formattedData.length - 1, i + Math.floor(windowSize / 2));
      let sum = 0;
      let count = 0;
      for (let j = start; j <= end; j++) {
        if (formattedData[j].avgAnomaly != null) {
          sum += formattedData[j].avgAnomaly;
          count++;
        }
      }
      return {
        ...d,
        movingAvg: count > 0 ? parseFloat((sum / count).toFixed(4)) : null
      };
    });
  }

  return (
    <StorySection id="the-ocean-is-rising" className="relative overflow-visible">
      {/* Decorative ambient background spots */}
      <div className="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Header Block */}
      <div className="mb-12 text-center flex flex-col items-center justify-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-center">
          The Ocean Is Rising
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed text-center mx-auto">
          Across 21 Pacific nations, sea levels have risen steadily over the past 30 years. Short-term climate cycles create temporary ups and downs, but the overall trend is still upward.
        </p>
      </div>

      {/* Main Chart (Full Width) */}
      <div 
        ref={ref} 
        className="w-full h-[60vh] min-h-[460px] relative mb-12"
      >
               {/* Analytics Summary Bar Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-cyan-500/10 pb-6 mb-6 relative z-10">
          
          <div className="flex items-center gap-4 text-xs font-mono select-none">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3.5 h-0.5 bg-cyan-400 inline-block rounded" />
              <span className="font-semibold">Annual</span>
            </span>
            <button
              onClick={() => setShowMovingAvg(!showMovingAvg)}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-amber-400 ${showMovingAvg ? "opacity-100" : "opacity-40"}`}
            >
              <span className="w-3.5 h-0.5 bg-amber-400 inline-block rounded" />
              <span className="font-semibold">5-yr Avg</span>
            </button>
            <button
              onClick={() => setShowRegression(!showRegression)}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer text-teal-400 ${showRegression ? "opacity-100" : "opacity-40"}`}
            >
              <span className="w-4 h-0 border-t-2 border-dotted border-teal-400 inline-block shrink-0" />
              <span className="font-semibold">Linear Trend</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2">
            <div className="flex flex-col">
              <span className="text-[9px] text-teal-400/80 font-mono uppercase">Linear Trend Rate</span>
              <span className="text-sm font-mono font-bold text-teal-400">
                +{(reg.slope * 1000).toFixed(2)} mm/yr
              </span>
            </div>
            <div className="w-px h-7 bg-slate-700/50 self-stretch" />
            <div className="flex flex-col">
              <span className="text-[9px] text-cyan-400/80 font-mono uppercase">30y Net Rise</span>
              <span className="text-sm font-mono font-bold text-cyan-400">
                +{(totalRiseCm).toFixed(1)} cm
              </span>
            </div>
            <div className="w-px h-7 bg-slate-700/50 self-stretch" />
            <div className="flex flex-col">
              <span className="text-[9px] text-orange-400/80 font-mono uppercase">Decadal Shift</span>
              <span className="text-sm font-mono font-bold text-orange-400">
                +{(shiftCm).toFixed(1)} cm
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-[76%] relative z-10">
          {trendLoading ? (
            <div className="w-full h-full flex items-center justify-center text-cyan-400/60 font-serif gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
              <span>Loading oceanic dataset...</span>
            </div>
          ) : isInView && formattedData ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={formattedData} 
                margin={{ top: 20, right: 30, left: 25, bottom: 35 }}
              >
                <defs>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="movingAvgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="rgba(148, 163, 184, 0.3)" 
                  tick={{ fill: "rgba(148, 163, 184, 0.7)", fontSize: 11, fontFamily: "monospace" }} 
                  tickLine={false}
                  tickMargin={6} 
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -12,
                    fill: "rgba(148, 163, 184, 0.5)",
                    fontSize: 11,
                    fontFamily: "monospace",
                    style: { textAnchor: "middle" }
                  }}
                />
                <YAxis 
                  stroke="rgba(148, 163, 184, 0.3)" 
                  tick={{ fill: "rgba(148, 163, 184, 0.7)", fontSize: 11, fontFamily: "monospace" }} 
                  tickFormatter={(v) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}`}
                  tickLine={false}
                  width={60} 
                  label={{
                    value: "Sea Level Anomaly (cm)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    fill: "rgba(148, 163, 184, 0.5)",
                    fontSize: 11,
                    fontFamily: "monospace",
                    style: { textAnchor: "middle" }
                  }}
                />
                <Tooltip content={<TrendTooltip showRegression={showRegression} showMovingAvg={showMovingAvg} />} cursor={{ stroke: "rgba(34, 211, 238, 0.25)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.4)" strokeDasharray="3 3" />
                
                {/* Styled Milestones Reference Lines */}
                <ReferenceLine 
                  x={1998} 
                  stroke="#f97316" 
                  strokeWidth={1.2}
                  strokeDasharray="4 4" 
                  label={{ 
                    position: "top", 
                    value: "1998 El Niño", 
                    fill: "#f97316", 
                    fontSize: 10,
                    fontFamily: "monospace",
                    fontWeight: "bold"
                  }} 
                />
                <ReferenceLine 
                  x={2011} 
                  stroke="#38bdf8" 
                  strokeWidth={1.2}
                  strokeDasharray="4 4" 
                  label={{ 
                    position: "top", 
                    value: "2011 La Niña", 
                    fill: "#38bdf8", 
                    fontSize: 10,
                    fontFamily: "monospace",
                    fontWeight: "bold"
                  }} 
                />
                <ReferenceLine 
                  x={2016} 
                  stroke="#f43f5e" 
                  strokeWidth={1.2}
                  strokeDasharray="4 4" 
                  label={{ 
                    position: "top", 
                    value: "2016 El Niño", 
                    fill: "#f43f5e", 
                    fontSize: 10,
                    fontFamily: "monospace",
                    fontWeight: "bold"
                  }} 
                />
                
                {/* Range Spread (Min-Max fill) */}
                <Area type="monotone" dataKey="range" stroke="none" fill="url(#rangeGrad)" isAnimationActive />

                {/* Annual Regional Average Line */}
                <Line 
                  type="monotone" 
                  dataKey="avgAnomaly" 
                  name="Annual"
                  stroke="#38bdf8" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 5, fill: "#38bdf8", stroke: "#ffffff", strokeWidth: 1.5 }} 
                  isAnimationActive 
                  animationDuration={1500} 
                />
                
                {/* 5-Year Moving Average Line */}
                {showMovingAvg && (
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    name="5-yr Avg"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive
                    animationDuration={1500}
                  />
                )}

                {/* Linear Regression Trendline */}
                {showRegression && (
                  <Line
                    type="monotone"
                    dataKey="linearTrend"
                    name="Linear Trend"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive
                    animationDuration={1500}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Milestone Explainer Captions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground border-t border-cyan-500/10 pt-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#f97316]" />
              <span className="font-mono font-bold text-white uppercase tracking-wider">1998 El Niño</span>
            </div>
            <p className="leading-relaxed">
              A major warm event that temporarily lowered sea levels in the Western Pacific, briefly hiding the long-term rising trend.
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#38bdf8]" />
              <span className="font-mono font-bold text-white uppercase tracking-wider">2011 La Niña</span>
            </div>
            <p className="leading-relaxed">
              A strong cool event that temporarily raised sea levels and pushed more water onto local shorelines.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#f43f5e]" />
              <span className="font-mono font-bold text-white uppercase tracking-wider">2016 El Niño</span>
            </div>
            <p className="leading-relaxed">
              One of the strongest warm ocean events ever recorded, causing very high ocean temperatures across the region.
            </p>
          </div>
        </div>
      </div>
    </StorySection>
  );
}
