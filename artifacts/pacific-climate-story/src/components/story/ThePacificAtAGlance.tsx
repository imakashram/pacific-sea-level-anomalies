import { useState } from "react";
import { useGetRankings, useGetSeaLevelByCountry, useGetRiskScores } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";
import { Globe, Table } from "lucide-react";
import { ChapterCountryExplorer } from "./ChapterCountryExplorer";

type SortField = 'country' | 'mean' | 'volatility' | 'cumulativeRise' | 'slope' | 'peakValue' | 'decadeAcceleration';
type SortDirection = 'asc' | 'desc';

const RISK_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};


function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
  return (
    <div className="w-24 h-10 opacity-80 hover:opacity-100 transition-opacity duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function downloadCSV(rows: any[]) {
  const headers = [
    "Territory", "Code", "Mean Anomaly (m)", "Volatility (m)", "Cumulative Rise (m)",
    "Speed (mm/yr)", "Peak Value (m)", "Peak Year", "D1-D3 Shift (m)", "Accelerating"
  ];
  const lines = rows.map((r) =>
    [
      r.country, r.code,
      r.mean.toFixed(4), r.volatility.toFixed(4),
      r.cumulativeRise.toFixed(3), (r.slope * 1000).toFixed(3),
      r.peakValue.toFixed(3), r.peakYear,
      r.decadeAcceleration.toFixed(4),
      r.slope > 0 ? "Yes" : "No"
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pacific-climate-rankings.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ThePacificAtAGlance() {
  const { data, isLoading } = useGetRankings();
  const { data: timeSeriesData } = useGetSeaLevelByCountry();
  const { data: riskData } = useGetRiskScores();
  const [search, setSearch] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [sortField, setSortField] = useState<SortField>('cumulativeRise');
  const [sortDir, setSortDirection] = useState<SortDirection>('desc');
  const [activeTab, setActiveTab] = useState<'explorer' | 'table'>('table');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredData = data?.filter(d => d.country.toLowerCase().includes(search.toLowerCase())) || [];
  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const sparklineMap = new Map(
    timeSeriesData?.map((c) => [c.code, c.data.map((d) => ({ value: d.value }))]) ?? []
  );
  const riskMap = new Map(riskData?.countries.map((c) => [c.code, c]) ?? []);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <StorySection 
      id="chapter-rankings" 
      className="pb-32"
      innerClassName="max-w-[95vw] mx-auto w-full px-4 lg:px-8"
    >
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">The Pacific at a Glance</h2>
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl">
            Explore the complete Pacific record.
          </p>

          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/25 hover:text-sky-300 hover:border-sky-500/30 transition-all duration-300 cursor-pointer shadow-sm text-xs font-semibold mb-6 animate-in fade-in duration-500"
            title="Data Methodology"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it's Calculated
          </button>

          <div className="flex bg-card/20 backdrop-blur-md p-1 rounded-full border border-border/50 mb-6 max-w-md w-full mx-auto shadow-inner">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap ${
                activeTab === 'explorer'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              Explore Any Nation
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Table className="w-4 h-4 flex-shrink-0" />
              Data Table
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="h-[400px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'table' ? (
              <motion.div
                key="table-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6 w-full animate-in fade-in duration-300"
              >
                {/* Search & Export Controls Row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                  <div className="relative w-full max-w-sm group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search territories..."
                      className="w-full bg-card/30 backdrop-blur-md border border-border/50 rounded-full pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 hover:bg-card/50 transition-all duration-300"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => sortedData.length && downloadCSV(sortedData)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>

                </div>

                {/* Table View */}
                <div className="bg-card/20 rounded-xl border border-border/50 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="sticky top-0 z-20 text-xs uppercase bg-background/95 backdrop-blur-xl text-muted-foreground border-b border-border/50 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Trend</th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('country')}>
                            Territory <SortIcon field="country" />
                          </th>
                          <th className="px-4 py-3 font-semibold">Risk</th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('mean')}>
                            Avg Anomaly <SortIcon field="mean" />
                          </th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('volatility')}>
                            Volatility <SortIcon field="volatility" />
                          </th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('cumulativeRise')}>
                            Cumul. Rise <SortIcon field="cumulativeRise" />
                          </th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('slope')}>
                            Speed <SortIcon field="slope" />
                          </th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('peakValue')}>
                            Peak <SortIcon field="peakValue" />
                          </th>
                          <th className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('decadeAcceleration')}>
                            D1→D3 <SortIcon field="decadeAcceleration" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((row, i) => {
                          const sparkData = sparklineMap.get(row.code) ?? [];
                          const risk = riskMap.get(row.code);
                          const isTop = i === 0 && sortField === 'cumulativeRise' && sortDir === 'desc';
                          const riskColor = risk ? RISK_COLORS[risk.riskLevel] : "hsl(var(--primary))";
                          return (
                            <tr
                              key={row.code}
                              className={`border-b border-border/10 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-300 ${isTop ? 'bg-primary/5' : ''}`}
                            >
                              <td className="px-4 py-2">
                                {sparkData.length > 0 ? (
                                  <MiniSparkline data={sparkData} color={riskColor} />
                                ) : (
                                  <div className="w-20 h-8 bg-card/30 rounded" />
                                )}
                              </td>
                              <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                                {row.country}
                                <span className="ml-2 text-xs text-muted-foreground/50 font-mono">{row.code}</span>
                              </td>
                              <td className="px-4 py-3">
                                {risk && (
                                  <span
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm"
                                    style={{ color: riskColor, backgroundColor: `${riskColor}20`, border: `1px solid ${riskColor}40` }}
                                  >
                                    {risk.riskLevel}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground font-mono">{row.mean.toFixed(3)}m</td>
                              <td className="px-4 py-3 text-muted-foreground font-mono">±{row.volatility.toFixed(3)}m</td>
                              <td className="px-4 py-3 font-bold text-foreground font-mono">{row.cumulativeRise > 0 ? "+" : ""}{row.cumulativeRise.toFixed(3)}m</td>
                              <td className="px-4 py-3 text-muted-foreground font-mono">{(row.slope * 1000).toFixed(2)}<span className="text-xs ml-0.5">mm/yr</span></td>
                              <td className="px-4 py-3 text-muted-foreground font-mono whitespace-nowrap">
                                {row.peakValue.toFixed(3)}m
                                <span className="text-xs opacity-40 ml-1">({row.peakYear})</span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="font-mono text-sm font-semibold"
                                  style={{ color: row.decadeAcceleration > 0 ? "#f97316" : "#22c55e" }}
                                >
                                  {row.decadeAcceleration > 0 ? "+" : ""}{row.decadeAcceleration.toFixed(3)}m
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {sortedData.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground/50 italic">
                      No nations match your search.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="explorer-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ChapterCountryExplorer isNested={true} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {showInfo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" 
          onClick={() => setShowInfo(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card/95 backdrop-blur-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border/80 shadow-2xl p-6 md:p-8 custom-scrollbar flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-foreground">How it's Calculated</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Methodology, formulas, and metric definitions used in the rankings.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInfo(false)} 
                className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Grid of Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card 1: Territory */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m-4-3.5a2.5 2.5 0 014-2.828v1.25M7 16h-.01" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Territory & Nation</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  The specific Pacific island nation, state, or territory tracked. Unique ISO 3-letter codes are displayed in monospace font.
                </p>
              </div>

              {/* Card 2: Risk Level */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-amber-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Composite Risk Score</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  A weighted composite formula calculated based on the sum of four components: 
                  <strong className="text-foreground"> Cumulative Rise (40%)</strong>, 
                  <strong className="text-foreground"> Speed (30%)</strong>, 
                  <strong className="text-foreground"> Volatility (15%)</strong>, and 
                  <strong className="text-foreground"> Acceleration (15%)</strong>.
                  Categorized into Critical, High, Medium, and Low risk brackets.
                </p>
              </div>

              {/* Card 3: Trend */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-sky-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Historical Trend</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  A visual sparkline graph detailing the chronological pattern of sea level anomalies for that nation since 1993.
                </p>
              </div>

              {/* Card 4: Avg Anomaly */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-sky-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Average Anomaly</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  The mathematical average (mean) of the annual sea level anomalies, indicating the overall displacement level from base zero.
                </p>
              </div>

              {/* Card 5: Volatility */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-purple-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Volatility (Std Dev)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Calculated as the standard deviation (<code className="text-purple-300 font-mono text-[10px]">σ</code>) of annual anomalies. Measures variability of year-to-year water levels.
                </p>
              </div>

              {/* Card 6: Cumulative Rise */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-pink-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Cumulative Rise</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  The net change from the first historical recording year (1993) to the latest year (<code className="text-pink-300 font-mono text-[10px]">Value_end - Value_start</code>).
                </p>
              </div>

              {/* Card 7: Speed */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Speed (mm/yr)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  The yearly rate of sea level rise, computed using an Ordinary Least Squares (OLS) linear regression trendline slope, converted to millimeters.
                </p>
              </div>

              {/* Card 8: Peak Anomaly */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-red-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Peak Anomaly</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  The maximum positive sea level anomaly recorded for the territory, representing extreme high-water level events and historical limits.
                </p>
              </div>

              {/* Card 9: Decade Shift */}
              <div className="group flex flex-col gap-2 p-5 bg-card/25 border border-border/40 hover:bg-card/40 hover:border-orange-500/30 transition-all duration-300 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-sm text-foreground">Decadal Acceleration</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  The shift in mean anomaly from the first decade (1993–2002) to the third decade (2013–2023). Measures accelerated shift.
                </p>
              </div>
              
            </div>

            {/* Footer / Close Button */}
            <div className="flex justify-end pt-4 border-t border-border/50 mt-2">
              <button 
                onClick={() => setShowInfo(false)} 
                className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-full shadow-lg shadow-primary/20 hover:opacity-90 hover:shadow-primary/30 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </StorySection>
  );
}
