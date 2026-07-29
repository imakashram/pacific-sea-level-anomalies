import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  Search,
  Terminal,
  Layout,
  Calculator,
} from "lucide-react";
import { useSEO } from "@/lib/useSEO";

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  category: "core" | "story";
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
    path: "/api/core/overview",
    method: "GET",
    description: "Returns high-level statistics and metadata summaries for the complete climate anomalies dataset.",
    category: "core",
    usedIn: ["HeroSection", "TheDataLandscape", "WhatThisMeans"],
  },
  {
    path: "/api/core/sea-level-by-country",
    method: "GET",
    description: "Returns raw time-series data of annual sea level anomalies grouped by nation code.",
    category: "core",
    usedIn: ["PacificAtAGlance"],
  },
  {
    path: "/api/core/country-profile/:code",
    method: "GET",
    description: "Returns a comprehensive data profile for a single nation, including annual anomaly records, decadal shift benchmarks, ranking statistics, and local trends.",
    category: "core",
    usedIn: ["ExploreAnyNation"],
    params: [
      {
        name: "code",
        placeholder: "Country Code (e.g. PW, PG, TV)",
        type: "dropdown",
        options: [
          "PW", "PG", "TV", "MH", "FM", "KI", "FJ", "SB", "VU", "TO", "WS", "CK", "NU", "TK", "WF", "PF", "NC", "GU", "MP", "AS", "NR"
        ]
      }
    ]
  },
  {
    path: "/api/core/sea-level-trend",
    method: "GET",
    description: "Returns annual global sea level trend values across the Pacific.",
    category: "core",
    usedIn: ["TheOceanIsRising", "OceanDecorations"],
  },

  // Story
  {
    path: "/api/story/hero-section",
    method: "GET",
    description: "Returns combined telemetry, decade averages, acceleration rates, and volatility stats for the landing narrative.",
    category: "story",
    usedIn: ["HeroSection"],
  },
  {
    path: "/api/story/data-landscape",
    method: "GET",
    description: "Returns baseline summaries and observation counts for the general climate metrics introduction.",
    category: "story",
    usedIn: ["TheDataLandscape"],
  },
  {
    path: "/api/story/ocean-rising",
    method: "GET",
    description: "Returns aggregated annual sea level trend values mapping the rising Pacific waters.",
    category: "story",
    usedIn: ["TheOceanIsRising"],
  },
  {
    path: "/api/story/pace-of-change",
    method: "GET",
    description: "Returns linear rise slopes computed over different time windows to highlight speed variations.",
    category: "story",
    usedIn: ["PaceOfChange"],
  },
  {
    path: "/api/story/enso-effect",
    method: "GET",
    description: "Returns phase-by-phase averages correlating anomalies with Southern Oscillation Index datasets.",
    category: "story",
    usedIn: ["ENSOEffect"],
  },
  {
    path: "/api/story/patterns-over-time",
    method: "GET",
    description: "Returns country-by-year heatmap anomaly grids for decadal patterns visualization.",
    category: "story",
    usedIn: ["PatternsOverTime"],
  },
  {
    path: "/api/story/future-outlook",
    method: "GET",
    description: "Returns extrapolated 10-year forward sea level trajectories with OLS confidence intervals.",
    category: "story",
    usedIn: ["FutureOutlook"],
  },
  {
    path: "/api/story/risk-assessment",
    method: "GET",
    description: "Returns normalized composite risk scores across multi-weighted vulnerability indicators.",
    category: "story",
    usedIn: ["RiskAssessment"],
  },
  {
    path: "/api/story/pacific-at-a-glance",
    method: "GET",
    description: "Returns a complete sortable analytics metrics list for peer comparison table.",
    category: "story",
    usedIn: ["PacificAtAGlance"],
  },
  {
    path: "/api/story/explore-any-nation/:code",
    method: "GET",
    description: "Returns detailed country profiles tailored for individual territory deep-dives.",
    category: "story",
    usedIn: ["ExploreAnyNation"],
    params: [
      {
        name: "code",
        placeholder: "Country Code (e.g. PW, PG, TV)",
        type: "dropdown",
        options: [
          "PW", "PG", "TV", "MH", "FM", "KI", "FJ", "SB", "VU", "TO", "WS", "CK", "NU", "TK", "WF", "PF", "NC", "GU", "MP", "AS", "NR"
        ]
      }
    ]
  },
  {
    path: "/api/story/what-this-means",
    method: "GET",
    description: "Returns historic crossing milestones mapping when nations first crossed sea level benchmarks.",
    category: "story",
    usedIn: ["WhatThisMeans"],
  }
];

export default function ApiExplorerPage() {
  useSEO({
    title: "API Explorer | Pacific Sea Level Anomalies",
    description: "Explore the Pacific Sea Level Anomalies API. Access core datasets, overview statistics, country-specific profiles, decadal shift records, and narrative endpoints.",
    canonicalPath: "/api-explorer",
    keywords: "API explorer, climate change API, sea level data API, Pacific climate JSON, developer resources",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Pacific Climate API Explorer",
      "description": "Interactive developer utility to test and explore the Pacific Sea Level Anomalies API endpoints, retrieving JSON telemetry data.",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All"
    }
  });

  const [selectedApi, setSelectedApi] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    code: "PW",
  });
  const [categoryFilter, setCategoryFilter] = useState<"all" | "core" | "story">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState("");

  const getTargetUrl = () => {
    let url = selectedApi.path;
    selectedApi.params?.forEach((p) => {
      url = url.replace(`:${p.name}`, paramValues[p.name] || "");
    });
    return url;
  };

  const handleFetch = async () => {
    setIsFetching(true);
    setApiResponse(null);
    setStatusCode(null);
    setResponseTime(null);

    const start = performance.now();
    try {
      const response = await fetch(getTargetUrl());
      const end = performance.now();

      setStatusCode(response.status);
      setResponseTime(Math.round(end - start));

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

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchesCategory =
      categoryFilter === "all" || ep.category === categoryFilter;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.usedIn?.some((u) =>
        u.toLowerCase().includes(searchQuery.toLowerCase()),
      );
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
        return Object.keys(item).some(
          (k) =>
            String(k).toLowerCase().includes(query) ||
            String(item[k]).toLowerCase().includes(query),
        );
      });
    }

    const filtered: Record<string, any> = {};
    Object.keys(apiResponse).forEach((k) => {
      if (
        k.toLowerCase().includes(query) ||
        String(apiResponse[k]).toLowerCase().includes(query)
      ) {
        filtered[k] = apiResponse[k];
      } else if (
        typeof apiResponse[k] === "object" &&
        apiResponse[k] !== null
      ) {
        filtered[k] = apiResponse[k]; // simplified fallback
      }
    });
    return filtered;
  };

  const formattedJson = JSON.stringify(getFilteredJsonResponse(), null, 2);

  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const categories: ("all" | "core" | "story")[] = ["all", "core", "story"];
      const currentIndex = categories.indexOf(categoryFilter);
      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") {
        nextIndex = currentIndex === categories.length - 1 ? 0 : currentIndex + 1;
      } else {
        nextIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
      }
      const nextCat = categories[nextIndex];
      setCategoryFilter(nextCat);
      setTimeout(() => {
        document.getElementById(`tab-category-${nextCat}`)?.focus();
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#070913]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Return to Climate Story"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Story</span>
          </Link>
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
        <Link
          href="/how-it-is-calculated"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition shadow-sm cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>How It's Calculated</span>
        </Link>
      </header>

      <main id="main-content" className="max-w-[1600px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)] overflow-hidden" tabIndex={-1}>
        {/* Left Column: API Catalog List */}
        <section className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden bg-slate-900/10 border border-slate-900/80 p-4 rounded-2xl">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search endpoints or components..."
              aria-label="Search endpoints or components"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 hover:bg-slate-900 transition"
            />
          </div>

          {/* Category Filter Tabs */}
          <div
            className="flex gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-900/80"
            role="tablist"
            aria-label="Endpoint categories"
            onKeyDown={handleTablistKeyDown}
          >
            {(["all", "core", "story"] as const).map((cat) => (
              <button
                key={cat}
                id={`tab-category-${cat}`}
                role="tab"
                aria-selected={categoryFilter === cat}
                aria-controls="endpoint-list"
                onClick={() => setCategoryFilter(cat)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-cyan-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat === "all" ? "All" : cat === "core" ? "Core" : "Story"}
              </button>
            ))}
          </div>

          {/* Endpoint List scroll box */}
          <div id="endpoint-list" role="tabpanel" className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
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
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap flex-1 ${isSelected ? "text-cyan-400" : "text-slate-300"}`}
                      >
                        {ep.path}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${
                        ep.category === "core"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      }`}>
                        {ep.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {ep.description}
                    </p>
                    {ep.usedIn && ep.usedIn.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-slate-800/40">
                        <span className="text-[9px] text-slate-500 font-mono self-center mr-1">
                          Used In:
                        </span>
                        {ep.usedIn.map((comp) => (
                          <span
                            key={comp}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono text-cyan-400/90 border border-slate-800"
                          >
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
                  <span className="font-mono text-base font-bold text-cyan-400">
                    {getTargetUrl()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {selectedApi.description}
                </p>

                {/* Component Usage Badge Pills */}
                {selectedApi.usedIn && selectedApi.usedIn.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/40">
                    <Layout className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">
                      Active Component Usage:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApi.usedIn.map((comp) => (
                        <span
                          key={comp}
                          className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-medium"
                        >
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Path Parameters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedApi.params.map((p) => (
                    <div key={p.name} className="flex flex-col gap-1.5">
                      <label htmlFor={`param-${p.name}`} className="text-[10px] font-semibold text-slate-400">
                        {p.name}
                      </label>
                      {p.type === "dropdown" && p.options ? (
                        <select
                          id={`param-${p.name}`}
                          value={paramValues[p.name] || ""}
                          onChange={(e) =>
                            setParamValues((prev) => ({
                              ...prev,
                              [p.name]: e.target.value,
                            }))
                          }
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        >
                          {p.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id={`param-${p.name}`}
                          placeholder={p.placeholder}
                          value={paramValues[p.name] || ""}
                          onChange={(e) =>
                            setParamValues((prev) => ({
                              ...prev,
                              [p.name]: e.target.value,
                            }))
                          }
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
                <span className="font-semibold text-slate-400 font-mono">
                  Response Payload
                </span>
                {statusCode !== null && (
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider ${
                        statusCode >= 200 && statusCode < 300
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {statusCode} {statusCode === 200 ? "OK" : ""}
                    </span>
                    {responseTime !== null && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {responseTime}ms
                      </span>
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
                      aria-label="Filter JSON keys"
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
                  <span className="text-xs">
                    Fetching response from database...
                  </span>
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
