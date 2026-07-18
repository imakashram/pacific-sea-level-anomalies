import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Play, 
  Copy, 
  Check, 
  Search, 
  Terminal, 
  Cpu, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  Layers,
  Code,
  Layout,
  Calculator
} from "lucide-react";

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  category: "core" | "trends" | "enso" | "risk" | "visuals";
  usedIn?: string[];
  params?: {
    name: string;
    placeholder: string;
    type: "text" | "dropdown";
    options?: string[];
  }[];
}

const ENDPOINTS: ApiEndpoint[] = [
  // Core
  {
    path: "/api/climate/overview",
    method: "GET",
    description: "Returns high-level statistics and metadata summaries for the complete climate anomalies dataset.",
    category: "core",
    usedIn: ["HeroSection", "TheDataLandscape", "WhatThisMeans"]
  },
  {
    path: "/api/climate/sea-level-by-country",
    method: "GET",
    description: "Returns raw time-series data of annual sea level anomalies grouped by nation code.",
    category: "core",
    usedIn: ["TheOceanIsRising", "PacificAtAGlance"]
  },
  {
    path: "/api/climate/country-profile/:code",
    method: "GET",
    description: "Returns a comprehensive data profile for a single nation, including annual anomaly records, decadal shift benchmarks, ranking statistics, and local trends.",
    category: "core",
    usedIn: ["ExploreAnyNation"],
    params: [
      { 
        name: "code", 
        placeholder: "Country Code (e.g. PW, PG, TV)", 
        type: "dropdown",
        options: ["PW", "PG", "TV", "MH", "FM", "KI", "FJ", "SB", "VU", "TO", "WS", "CK", "NU", "TK", "WF", "PF", "NC", "GU", "MP", "AS", "NR"]
      }
    ]
  },
  {
    path: "/api/climate/country-comparison",
    method: "GET",
    description: "Returns comparison summaries of multi-nation anomalies to chart and correlate side-by-side.",
    category: "core",
    usedIn: ["Chapter4NationsSideBySide"]
  },
  {
    path: "/api/climate/anomalies",
    method: "GET",
    description: "Returns raw database records of climate anomaly entries, supports query filtering.",
    category: "core",
    usedIn: ["ApiExplorerPage"]
  },

  // Trends
  {
    path: "/api/climate/decade-analysis",
    method: "GET",
    description: "Divides observations into Decade 1 (1993-2002), Decade 2 (2003-2012), and Decade 3 (2013-2023) to compute baseline shifts and regional changes.",
    category: "trends",
    usedIn: ["HeroSection", "ChapterDecadeAnalysis", "WhatThisMeans"]
  },
  {
    path: "/api/climate/rate-of-change",
    method: "GET",
    description: "Calculates the yearly linear trend rate of sea level rise (in mm/year) for all territories.",
    category: "trends",
    usedIn: []
  },
  {
    path: "/api/climate/volatility",
    method: "GET",
    description: "Computes statistical volatility (standard deviations) of anomalies for each territory.",
    category: "trends",
    usedIn: ["HeroSection", "ChapterVolatility"]
  },
  {
    path: "/api/climate/acceleration",
    method: "GET",
    description: "Analyzes anomaly curves to calculate acceleration rates of rising water levels.",
    category: "trends",
    usedIn: ["HeroSection", "ChapterAcceleration", "WhatThisMeans"]
  },
  {
    path: "/api/climate/decade-distributions",
    method: "GET",
    description: "Computes decadal statistical distributions and percentiles across all monitoring stations.",
    category: "trends",
    usedIn: ["ChapterDecadeAnalysis"]
  },
  {
    path: "/api/climate/start-end-comparison",
    method: "GET",
    description: "Performs comparison between the first year of records (1993) and the latest (2023).",
    category: "trends",
    usedIn: ["ChapterDumbbellLeap"]
  },
  {
    path: "/api/climate/annual-deviation",
    method: "GET",
    description: "Computes standard deviation variances of annual anomalies on a year-by-year scale.",
    category: "trends",
    usedIn: ["ChapterLollipop"]
  },

  // ENSO
  {
    path: "/api/climate/el-nino-impact",
    method: "GET",
    description: "Aggregates anomalies specifically during historical extreme ENSO years (1997-1998, 2015-2016) to show direct impacts.",
    category: "enso",
    usedIn: ["Chapter3ElNino"]
  },
  {
    path: "/api/climate/enso-sensitivity",
    method: "GET",
    description: "Correlates annual sea level anomalies with Southern Oscillation Index (SOI) datasets to measure ENSO susceptibility.",
    category: "enso",
    usedIn: ["ChapterENSOSensitivity"]
  },
  {
    path: "/api/climate/correlation-matrix",
    method: "GET",
    description: "Computes cross-correlation coefficients between all 21 nations to index climate synchrony.",
    category: "enso",
    usedIn: ["ChapterENSOSensitivity"]
  },

  // Risk & Forecast
  {
    path: "/api/climate/forecast",
    method: "GET",
    description: "Uses 30-year trend slopes and volatility ranges to model regional projection trajectories (2024-2050).",
    category: "risk",
    usedIn: ["ChapterForecast"]
  },
  {
    path: "/api/climate/risk-scores",
    method: "GET",
    description: "Evaluates risk categories (Critical, High, Medium, Low) for all nations based on acceleration, rise, and elevation factors.",
    category: "risk",
    usedIn: ["ChapterRiskDashboard", "PacificAtAGlance"]
  },
  {
    path: "/api/climate/geographic-clusters",
    method: "GET",
    description: "Groups territories geographically (Melanesia, Micronesia, Polynesia) to compile sub-regional summaries.",
    category: "risk",
    usedIn: ["ChapterRegionalClusters"]
  },
  {
    path: "/api/climate/threshold-crossings",
    method: "GET",
    description: "Computes indicators mapping when territories first crossed anomaly thresholds (+0.0m, +0.1m, +0.2m).",
    category: "risk",
    usedIn: ["ChapterBaselineBreach", "WhatThisMeans"]
  },

  // Visuals
  {
    path: "/api/climate/heatmap",
    method: "GET",
    description: "Prepares pivoted and ordered grids to feed the multi-nation decadal heatmap.",
    category: "visuals",
    usedIn: ["Chapter5Heatmap"]
  },
  {
    path: "/api/climate/cumulative-rise-timeseries",
    method: "GET",
    description: "Generates time-series records of cumulative sea level rise indicators.",
    category: "visuals",
    usedIn: ["ChapterCumulativeRise"]
  },
  {
    path: "/api/climate/nations-rising-by-year",
    method: "GET",
    description: "Counts how many Pacific nations recorded positive anomalies for each calendar year.",
    category: "visuals",
    usedIn: ["TheOceanIsRising"]
  },
  {
    path: "/api/climate/rankings",
    method: "GET",
    description: "Generates detailed rankings of countries by rise, volatility, and linear slope.",
    category: "visuals",
    usedIn: ["PacificAtAGlance", "ExploreAnyNation", "WhatThisMeans"]
  },
  {
    path: "/api/climate/nation-rankings",
    method: "GET",
    description: "Provides decadal and historical YoY ranking shifts.",
    category: "visuals",
    usedIn: ["ChapterRankBump"]
  },
  {
    path: "/api/climate/nation-treemap",
    method: "GET",
    description: "Formats tree-nodes with hierarchical area indicators for regional representation.",
    category: "visuals",
    usedIn: ["ChapterNationTreemap"]
  },
  {
    path: "/api/climate/yoy-budget",
    method: "GET",
    description: "Calculates yearly sea level rise budget ratios for each territory.",
    category: "visuals",
    usedIn: []
  },
  {
    path: "/api/climate/anomaly-profiles",
    method: "GET",
    description: "Compiles comparison anomaly curves.",
    category: "visuals",
    usedIn: ["Chapter4NationsSideBySide"]
  },
  {
    path: "/api/climate/regional-decade-shares",
    method: "GET",
    description: "Provides decadal share metrics grouped by sub-region.",
    category: "visuals",
    usedIn: ["ChapterRegionalDonut"]
  },
  {
    path: "/api/climate/nation-metrics",
    method: "GET",
    description: "Fetches detailed grid metrics for the Side-by-Side comparison panel.",
    category: "visuals",
    usedIn: ["Chapter4NationsSideBySide"]
  },
  {
    path: "/api/climate/threshold-funnel",
    method: "GET",
    description: "Returns stage counts for the historical threshold funnel visualization.",
    category: "visuals",
    usedIn: ["ChapterThresholdFunnel"]
  },
  {
    path: "/api/climate/regional-streams",
    method: "GET",
    description: "Compiles time-series matrices for StreamGraph area charts.",
    category: "visuals",
    usedIn: ["ChapterStreamGraph"]
  }
];

export default function ApiExplorerPage() {
  const [, setLocation] = useLocation();
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({ code: "PW" });
  const [categoryFilter, setCategoryFilter] = useState<"all" | "core" | "trends" | "enso" | "risk" | "visuals">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState("");

  const getTargetUrl = () => {
    let url = selectedApi.path;
    selectedApi.params?.forEach(p => {
      url = url.replace(`:${p.name}`, paramValues[p.name] || "");
    });
    return url;
  };

  const handleFetch = async () => {
    setIsFetching(true);
    setApiResponse(null);
    setStatusCode(null);
    setResponseTime(null);
    setResponseHeaders({});
    
    const start = performance.now();
    try {
      const response = await fetch(getTargetUrl());
      const end = performance.now();
      
      setStatusCode(response.status);
      setResponseTime(Math.round(end - start));
      
      const headersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      setResponseHeaders(headersObj);

      const text = await response.text();
      try {
        setApiResponse(JSON.parse(text));
      } catch {
        setApiResponse(text);
      }
    } catch (err: any) {
      const end = performance.now();
      setStatusCode(500);
      setResponseTime(Math.round(end - start));
      setApiResponse({ error: err.message || "Failed to fetch response." });
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run automatically when selected API changes
  useEffect(() => {
    handleFetch();
  }, [selectedApi, paramValues]);

  const filteredEndpoints = ENDPOINTS.filter(ep => {
    const matchesCategory = categoryFilter === "all" || ep.category === categoryFilter;
    const matchesSearch = ep.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ep.usedIn?.some(u => u.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter JSON response keys if a query is supplied
  const getFilteredJsonResponse = () => {
    if (!apiResponse || typeof apiResponse !== "object") return apiResponse;
    if (!jsonSearchQuery.trim()) return apiResponse;

    const query = jsonSearchQuery.toLowerCase();
    
    if (Array.isArray(apiResponse)) {
      return apiResponse.filter((item: any) => {
        if (typeof item === "string" || typeof item === "number") {
          return String(item).toLowerCase().includes(query);
        }
        return Object.keys(item).some(k => 
          String(k).toLowerCase().includes(query) || 
          String(item[k]).toLowerCase().includes(query)
        );
      });
    }

    const filtered: Record<string, any> = {};
    Object.keys(apiResponse).forEach(k => {
      if (k.toLowerCase().includes(query) || String(apiResponse[k]).toLowerCase().includes(query)) {
        filtered[k] = apiResponse[k];
      } else if (typeof apiResponse[k] === "object" && apiResponse[k] !== null) {
        filtered[k] = apiResponse[k]; // simplified fallback
      }
    });
    return filtered;
  };

  const formattedJson = JSON.stringify(getFilteredJsonResponse(), null, 2);

  const categoryIcons = {
    all: <Terminal className="w-3.5 h-3.5" />,
    core: <Database className="w-3.5 h-3.5" />,
    trends: <TrendingUp className="w-3.5 h-3.5" />,
    enso: <Layers className="w-3.5 h-3.5" />,
    risk: <AlertTriangle className="w-3.5 h-3.5" />,
    visuals: <Code className="w-3.5 h-3.5" />
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#070913]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Return to Climate Story"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Story</span>
          </button>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold font-serif text-slate-100 tracking-tight">
              Pacific Climate API Explorer
            </h1>
          </div>
        </div>

        {/* Navigation Link to Methodology Guide */}
        <button
          onClick={() => setLocation("/how-it-is-calculated")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition shadow-sm cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>How It's Calculated</span>
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Column: API Catalog List */}
        <section className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden bg-slate-900/10 border border-slate-900/80 p-4 rounded-2xl">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search endpoints or components..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 hover:bg-slate-900 transition"
            />
          </div>

          {/* Endpoint List scroll box */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
            {filteredEndpoints.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic text-xs">
                No endpoints found matching search.
              </div>
            ) : (
              filteredEndpoints.map((ep) => {
                const isSelected = selectedApi.path === ep.path;
                return (
                  <button
                    key={ep.path}
                    onClick={() => {
                      setSelectedApi(ep);
                      setJsonSearchQuery("");
                    }}
                    className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition cursor-pointer ${
                      isSelected 
                        ? "bg-slate-900 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.02)]" 
                        : "bg-slate-900/20 border-slate-800/60 hover:bg-slate-900/40 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap ${isSelected ? "text-cyan-400" : "text-slate-300"}`}>
                        {ep.path}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {ep.description}
                    </p>
                    {ep.usedIn && ep.usedIn.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-slate-800/40">
                        <span className="text-[9px] text-slate-500 font-mono self-center mr-1">Used In:</span>
                        {ep.usedIn.map((comp) => (
                          <span key={comp} className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono text-cyan-400/90 border border-slate-800">
                            {comp}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: API Console Panel */}
        <section className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          
          {/* Header Dashboard of API Panel */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-cyan-400">{getTargetUrl()}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {selectedApi.description}
                </p>

                {/* Component Usage Badge Pills */}
                {selectedApi.usedIn && selectedApi.usedIn.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/40">
                    <Layout className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Active Component Usage:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApi.usedIn.map((comp) => (
                        <span key={comp} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-medium">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleFetch}
                disabled={isFetching}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                )}
                {isFetching ? "Sending..." : "Send Request"}
              </button>
            </div>

            {/* Dynamic Params Panel */}
            {selectedApi.params && selectedApi.params.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Path Parameters</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedApi.params.map(p => (
                    <div key={p.name} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">{p.name}</label>
                      {p.type === "dropdown" && p.options ? (
                        <select
                          value={paramValues[p.name] || ""}
                          onChange={(e) => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        >
                          {p.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={p.placeholder}
                          value={paramValues[p.name] || ""}
                          onChange={(e) => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response Console */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60 border border-slate-900 rounded-2xl relative shadow-2xl">
            
            {/* Console Toolbar */}
            <div className="px-5 py-3 border-b border-slate-900 flex items-center justify-between text-xs bg-slate-950">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-400 font-mono">Response Payload</span>
                {statusCode !== null && (
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider ${
                      statusCode >= 200 && statusCode < 300 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {statusCode} {statusCode === 200 ? "OK" : ""}
                    </span>
                    {responseTime !== null && (
                      <span className="text-[10px] text-slate-400 font-mono">{responseTime}ms</span>
                    )}
                  </div>
                )}
              </div>

              {/* JSON key search and Copy actions */}
              <div className="flex items-center gap-3">
                {apiResponse && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter JSON keys..."
                      value={jsonSearchQuery}
                      onChange={(e) => setJsonSearchQuery(e.target.value)}
                      className="bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[10px] focus:outline-none focus:border-cyan-500/40 w-36 focus:w-48 transition-all"
                    />
                  </div>
                )}
                <button
                  onClick={handleCopy}
                  disabled={!apiResponse}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-50 transition cursor-pointer text-[10px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable code block */}
            <div className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-relaxed select-text bg-[#03050c]">
              {isFetching ? (
                <div className="h-full flex flex-col justify-center items-center gap-3 text-slate-500">
                  <span className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Fetching response from database...</span>
                </div>
              ) : apiResponse ? (
                <pre className="text-slate-300 whitespace-pre overflow-x-auto selection:bg-cyan-500/20 selection:text-cyan-200">
                  {formattedJson}
                </pre>
              ) : (
                <div className="h-full flex flex-col justify-center items-center gap-2 text-slate-500/65 italic">
                  <Terminal className="w-8 h-8 opacity-40 mb-1" />
                  <span>Execute a request to view live database payload.</span>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
