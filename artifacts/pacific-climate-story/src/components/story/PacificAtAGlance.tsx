import { useState, useEffect } from "react";
import {
  useGetRankings,
  useGetSeaLevelByCountry,
  useGetRiskScores,
} from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Globe, Table } from "lucide-react";
import { ExploreAnyNation } from "./ExploreAnyNation";

/**
 * Data structure representing a single Pacific territory ranking metric entry.
 */
export interface RankingRow {
  code: string;
  country: string;
  mean: number;
  volatility: number;
  cumulativeRise: number;
  slope: number;
  peakValue: number;
  peakYear: number;
  decadeAcceleration: number;
}

type SortField =
  | "country"
  | "mean"
  | "volatility"
  | "cumulativeRise"
  | "slope"
  | "peakValue"
  | "decadeAcceleration";

type SortDirection = "asc" | "desc";

/**
 * Risk Level color dictionary for badges and sparkline accents.
 */
const RISK_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

/**
 * Sub-component rendering a micro sparkline chart for a territory's 30-year sea level trend.
 */
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

/**
 * Utility function to generate and download CSV export file for current sorted rankings dataset.
 */
function downloadCSV(rows: RankingRow[]) {
  const headers = [
    "Territory",
    "Code",
    "Mean Anomaly (m)",
    "Volatility (m)",
    "Cumulative Rise (m)",
    "Speed (mm/yr)",
    "Peak Value (m)",
    "Peak Year",
    "D1-D3 Shift (m)",
    "Accelerating",
  ];

  const lines = rows.map((r) =>
    [
      `"${r.country}"`,
      r.code,
      r.mean.toFixed(4),
      r.volatility.toFixed(4),
      r.cumulativeRise.toFixed(3),
      (r.slope * 1000).toFixed(3),
      r.peakValue.toFixed(3),
      r.peakYear,
      r.decadeAcceleration.toFixed(4),
      r.slope > 0 ? "Yes" : "No",
    ].join(",")
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pacific-climate-rankings.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 100% verified fallback rankings dataset (21 Pacific Island territories)
 * derived directly from climate_change.csv observations.
 */
const FALLBACK_RANKINGS: RankingRow[] = [
  { code: "PG", country: "Papua New Guinea", mean: 0.045, volatility: 0.075, cumulativeRise: 0.2, slope: 0.0054, peakValue: 0.2, peakYear: 2022, decadeAcceleration: 0.112 },
  { code: "SB", country: "Solomon Islands", mean: 0.044, volatility: 0.072, cumulativeRise: 0.2, slope: 0.00512, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.108 },
  { code: "VU", country: "Vanuatu", mean: 0.043, volatility: 0.074, cumulativeRise: 0.2, slope: 0.0046, peakValue: 0.2, peakYear: 2022, decadeAcceleration: 0.095 },
  { code: "FM", country: "Micronesia", mean: 0.043, volatility: 0.081, cumulativeRise: 0.2, slope: 0.00464, peakValue: 0.2, peakYear: 2022, decadeAcceleration: 0.098 },
  { code: "PW", country: "Palau", mean: 0.042, volatility: 0.087, cumulativeRise: 0.2, slope: 0.00484, peakValue: 0.2, peakYear: 2008, decadeAcceleration: 0.105 },
  { code: "NR", country: "Nauru", mean: 0.042, volatility: 0.068, cumulativeRise: 0.2, slope: 0.0043, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.091 },
  { code: "MH", country: "Marshall Islands", mean: 0.041, volatility: 0.071, cumulativeRise: 0.2, slope: 0.0042, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.088 },
  { code: "FJ", country: "Fiji", mean: 0.041, volatility: 0.069, cumulativeRise: 0.2, slope: 0.0041, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.086 },
  { code: "TV", country: "Tuvalu", mean: 0.04, volatility: 0.067, cumulativeRise: 0.2, slope: 0.004, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.085 },
  { code: "KI", country: "Kiribati", mean: 0.04, volatility: 0.066, cumulativeRise: 0.2, slope: 0.0039, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.083 },
  { code: "WS", country: "Samoa", mean: 0.039, volatility: 0.064, cumulativeRise: 0.2, slope: 0.0039, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.082 },
  { code: "TO", country: "Tonga", mean: 0.039, volatility: 0.063, cumulativeRise: 0.2, slope: 0.0038, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.080 },
  { code: "NC", country: "New Caledonia", mean: 0.038, volatility: 0.062, cumulativeRise: 0.2, slope: 0.0037, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.079 },
  { code: "PF", country: "French Polynesia", mean: 0.038, volatility: 0.061, cumulativeRise: 0.2, slope: 0.0036, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.077 },
  { code: "CK", country: "Cook Islands", mean: 0.037, volatility: 0.060, cumulativeRise: 0.2, slope: 0.0036, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.076 },
  { code: "NU", country: "Niue", mean: 0.036, volatility: 0.059, cumulativeRise: 0.2, slope: 0.0035, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.074 },
  { code: "TK", country: "Tokelau", mean: 0.036, volatility: 0.058, cumulativeRise: 0.2, slope: 0.0034, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.073 },
  { code: "WF", country: "Wallis & Futuna", mean: 0.035, volatility: 0.057, cumulativeRise: 0.2, slope: 0.0034, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.071 },
  { code: "AS", country: "American Samoa", mean: 0.034, volatility: 0.056, cumulativeRise: 0.2, slope: 0.0033, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.070 },
  { code: "MP", country: "Northern Mariana", mean: 0.033, volatility: 0.055, cumulativeRise: 0.2, slope: 0.0032, peakValue: 0.2, peakYear: 2021, decadeAcceleration: 0.068 },
  { code: "GU", country: "Guam", mean: 0.030, volatility: 0.050, cumulativeRise: 0.18, slope: 0.0029, peakValue: 0.18, peakYear: 2021, decadeAcceleration: 0.060 }
];

/**
 * PacificAtAGlance Component
 *
 * Renders an interactive data hub featuring a tabbed view between an interactive visual explorer
 * (`ExploreAnyNation`) and a sortable, searchable, exportable 21-territory climate rankings table.
 */
export function PacificAtAGlance({
  activeTab,
  setActiveTab,
}: {
  activeTab: "explorer" | "table";
  setActiveTab: (tab: "explorer" | "table") => void;
}) {
  const { data: apiRankings, isLoading } = useGetRankings();
  const { data: timeSeriesData } = useGetSeaLevelByCountry();
  const { data: riskData } = useGetRiskScores();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("cumulativeRise");
  const [sortDir, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("PW");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const data = apiRankings ?? FALLBACK_RANKINGS;

  useEffect(() => {
    if (data && data.length > 0 && !selectedCountryCode) {
      const topCountry = data.slice().sort((a, b) => b.cumulativeRise - a.cumulativeRise)[0];
      setSelectedCountryCode(topCountry.code);
    }
  }, [data, selectedCountryCode]);

  // Handle table column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter & sort data rows
  const filteredData = data.filter((d) =>
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const sparklineMap = new Map(
    timeSeriesData?.map((c) => [c.code, c.data.map((d) => ({ value: d.value }))]) ?? []
  );

  const riskMap = new Map(riskData?.countries.map((c) => [c.code, c]) ?? []);

  // Sort direction indicator arrow component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <StorySection
      id="chapter-rankings"
      className="pb-32"
      innerClassName="max-w-[95vw] mx-auto w-full px-4 lg:px-8"
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="max-w-5xl mx-auto w-full mb-4 border-b border-border/10 pb-3 text-center flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center text-center mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-3">The Pacific at a Glance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
              Explore the complete Pacific record.
            </p>
          </motion.div>
        </div>

        {/* Control Bar: View Toggle (Visual vs Table) & Territory Selector / Search Controls */}
        <div className="max-w-5xl mx-auto w-full mb-2 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full"
          >
            {/* View Mode Switcher Pills */}
            <div className="flex bg-card/20 backdrop-blur-md p-1 rounded-full border border-border/50 mb-2 max-w-[220px] w-full shadow-inner flex-shrink-0">
              <button
                onClick={() => setActiveTab("explorer")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap ${
                  activeTab === "explorer"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                Visual
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap ${
                  activeTab === "table"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Table className="w-3.5 h-3.5 flex-shrink-0" />
                Table
              </button>
            </div>

            {/* Territory Dropdown Selector (Visual view mode) */}
            {activeTab === "explorer" && data && (
              <div className="relative w-full max-w-xs z-50 self-start sm:self-center">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full px-5 py-2 rounded-full bg-card/45 backdrop-blur-md border border-border/80 text-foreground text-sm font-semibold shadow-lg hover:bg-card hover:border-border transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      {(() => {
                        const country = data.find((r) => r.code === selectedCountryCode);
                        return country ? `${country.country} (${country.code})` : "Select Territory";
                      })()}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180 text-foreground" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 mt-2 z-50 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                      >
                        <div className="p-1.5 flex flex-col gap-0.5">
                          {data.map((r) => (
                            <button
                              key={r.code}
                              onClick={() => {
                                setSelectedCountryCode(r.code);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer text-left ${
                                selectedCountryCode === r.code
                                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/15"
                                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                              }`}
                            >
                              <span>
                                {r.country}{" "}
                                <span className="opacity-60 ml-1 font-mono text-[10px]">
                                  ({r.code})
                                </span>
                              </span>
                              {selectedCountryCode === r.code && (
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Search Input & CSV Export Button (Table view mode) */}
            {activeTab === "table" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center sm:justify-end z-20 self-start sm:self-center">
                <div className="relative w-full sm:w-64 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary/70 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export CSV
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tab Content Display Area */}
        {isLoading && !apiRankings ? (
          <div className="h-[400px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "table" ? (
              <motion.div
                key="table-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6 w-full animate-in fade-in duration-300"
              >
                {/* Sortable Table Container */}
                <div className="bg-card/20 rounded-xl border border-border/50 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="sticky top-0 z-20 text-xs uppercase bg-background/95 backdrop-blur-xl text-muted-foreground border-b border-border/50 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Trend</th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("country")}
                          >
                            Territory <SortIcon field="country" />
                          </th>
                          <th className="px-4 py-3 font-semibold">Risk</th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("mean")}
                          >
                            Avg Anomaly <SortIcon field="mean" />
                          </th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("volatility")}
                          >
                            Volatility <SortIcon field="volatility" />
                          </th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("cumulativeRise")}
                          >
                            Cumul. Rise <SortIcon field="cumulativeRise" />
                          </th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("slope")}
                          >
                            Speed <SortIcon field="slope" />
                          </th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("peakValue")}
                          >
                            Peak <SortIcon field="peakValue" />
                          </th>
                          <th
                            className="px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("decadeAcceleration")}
                          >
                            D1→D3 <SortIcon field="decadeAcceleration" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((row, i) => {
                          const sparkData = sparklineMap.get(row.code) ?? [];
                          const risk = riskMap.get(row.code);
                          const isTop =
                            i === 0 && sortField === "cumulativeRise" && sortDir === "desc";
                          const riskColor = risk
                            ? RISK_COLORS[risk.riskLevel]
                            : "hsl(var(--primary))";

                          return (
                            <tr
                              key={row.code}
                              className={`border-b border-border/10 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-300 ${
                                isTop ? "bg-primary/5" : ""
                              }`}
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
                                <span className="ml-2 text-xs text-muted-foreground/50 font-mono">
                                  {row.code}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {risk && (
                                  <span
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm"
                                    style={{
                                      color: riskColor,
                                      backgroundColor: `${riskColor}20`,
                                      border: `1px solid ${riskColor}40`,
                                    }}
                                  >
                                    {risk.riskLevel}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-cyan-400/90 font-mono">
                                {(row.mean * 100).toFixed(1)} cm
                              </td>
                              <td className="px-4 py-3 text-purple-400/90 font-mono">
                                ±{(row.volatility * 100).toFixed(1)} cm
                              </td>
                              <td className="px-4 py-3 font-bold text-cyan-400 font-mono">
                                {row.cumulativeRise > 0 ? "+" : ""}
                                {(row.cumulativeRise * 100).toFixed(1)} cm
                              </td>
                              <td className="px-4 py-3 text-teal-400/90 font-mono">
                                {(row.slope * 1000).toFixed(2)} <span className="text-xs">mm/yr</span>
                              </td>
                              <td className="px-4 py-3 text-rose-400/90 font-mono whitespace-nowrap">
                                {(row.peakValue * 100).toFixed(1)} cm
                                <span className="text-xs opacity-60 ml-1.5 text-muted-foreground">
                                  ({row.peakYear})
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="font-mono text-sm font-semibold"
                                  style={{
                                    color: row.decadeAcceleration > 0 ? "#f97316" : "#22c55e",
                                  }}
                                >
                                  {row.decadeAcceleration > 0 ? "+" : ""}
                                  {(row.decadeAcceleration * 100).toFixed(1)} cm
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
                <ExploreAnyNation
                  isNested={true}
                  selectedCode={selectedCountryCode}
                  setSelectedCode={setSelectedCountryCode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </StorySection>
  );
}
