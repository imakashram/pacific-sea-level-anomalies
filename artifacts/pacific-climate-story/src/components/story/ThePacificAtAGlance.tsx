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
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
            Explore the complete Pacific record.
          </p>

          <div className="flex bg-card/20 backdrop-blur-md p-1 rounded-full border border-border/50 mb-6 max-w-[340px] mx-auto shadow-inner">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4" />
              Explore Any Nation
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Table className="w-4 h-4" />
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
                  <button
                    onClick={() => setShowInfo(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card hover:border-border transition-all duration-300 cursor-pointer"
                    title="Data Methodology"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-border shadow-2xl p-6 md:p-8 custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground">Data Methodology</h3>
              <button onClick={() => setShowInfo(false)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Trend:</strong> A visual sparkline showing the time series of sea level anomalies for the territory.</p>
              <p><strong className="text-foreground">Territory:</strong> The nation or region.</p>
              <p><strong className="text-foreground">Risk:</strong> Categorical risk level (Critical, High, Medium, Low) based on a weighted composite score: cumulative rise (40%), speed (30%), volatility (15%), and acceleration (15%).</p>
              <p><strong className="text-foreground">Avg Anomaly:</strong> Calculated by summing all observed sea level anomalies for the territory and dividing by the total number of observations.</p>
              <p><strong className="text-foreground">Volatility:</strong> Calculated as the standard deviation of all annual anomalies, measuring the average distance of each year's anomaly from the overall mean.</p>
              <p><strong className="text-foreground">Cumul. Rise:</strong> Calculated by subtracting the anomaly value of the very first recorded year from the anomaly value of the most recent year.</p>
              <p><strong className="text-foreground">Speed:</strong> Calculated using an ordinary least squares linear regression across all data points to find the trendline slope, which is then converted into millimeters per year.</p>
              <p><strong className="text-foreground">Peak:</strong> Determined by finding the single highest sea level anomaly value recorded for the territory across all available years.</p>
              <p><strong className="text-foreground">D1→D3:</strong> Calculated by taking the average anomaly of the most recent decade (2013-2023) and subtracting the average anomaly of the first recorded decade (1993-2002). A positive value indicates an acceleration in sea level rise.</p>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowInfo(false)} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </StorySection>
  );
}
