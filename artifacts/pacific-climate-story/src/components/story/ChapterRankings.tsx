import { useState } from "react";
import { useGetRankings, useGetSeaLevelByCountry, useGetRiskScores } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
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

export function ChapterRankings() {
  const { data, isLoading } = useGetRankings();
  const { data: timeSeriesData } = useGetSeaLevelByCountry();
  const { data: riskData } = useGetRiskScores();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>('cumulativeRise');
  const [sortDir, setSortDirection] = useState<SortDirection>('desc');

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
    <StorySection id="chapter-rankings" className="pb-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">The Full Picture</h2>
          <p className="text-xl text-muted-foreground mb-6">
            Every territory. Every metric. The complete analytical record.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              type="text"
              placeholder="Search nations..."
              className="flex-1 max-w-sm bg-card/50 border border-border/50 rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => sortedData.length && downloadCSV(sortedData)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-card/60 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export CSV
            </button>
            {data && (
              <span className="text-xs text-muted-foreground">
                {sortedData.length} / {data.length} nations
              </span>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="h-[400px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/20 rounded-xl border border-border/50 overflow-hidden shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-card/80 text-muted-foreground border-b border-border/50">
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
                        className={`border-b border-border/20 hover:bg-card/50 transition-colors ${isTop ? 'bg-primary/5' : ''}`}
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
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
                              style={{ color: riskColor, backgroundColor: `${riskColor}18` }}
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
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
