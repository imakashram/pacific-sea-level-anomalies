import { useState, useEffect } from "react";
import {
  Play,
  Copy,
  Check,
  Search,
  Terminal,
  Code,
  FileJson,
  RefreshCw,
  Database,
  Cpu,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useSEO } from "@/lib/useSEO";
import { motion, AnimatePresence } from "framer-motion";

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
    path: "/api/core/raw-data",
    method: "GET",
    description:
      "Returns the complete raw observation records parsed directly from the sea_level_anomalies.csv file with all original columns.",
    category: "core",
    usedIn: [],
  },
  {
    path: "/api/core/sea-level-by-country",
    method: "GET",
    description:
      "Returns raw time-series data of annual sea level anomalies grouped by nation code.",
    category: "core",
    usedIn: ["PacificAtAGlance"],
  },

  // Story
  {
    path: "/api/story/hero-section",
    method: "GET",
    description:
      "Returns combined telemetry, decade averages, acceleration rates, and volatility stats for the landing narrative.",
    category: "story",
    usedIn: ["HeroSection"],
  },
  {
    path: "/api/story/data-landscape",
    method: "GET",
    description:
      "Returns baseline summaries and observation counts for the general climate metrics introduction.",
    category: "story",
    usedIn: ["TheDataLandscape"],
  },
  {
    path: "/api/story/ocean-rising",
    method: "GET",
    description:
      "Returns aggregated annual sea level trend values mapping the rising Pacific waters.",
    category: "story",
    usedIn: ["TheOceanIsRising"],
  },
  {
    path: "/api/story/pace-of-change",
    method: "GET",
    description:
      "Returns linear rise slopes computed over different time windows to highlight speed variations.",
    category: "story",
    usedIn: ["PaceOfChange"],
  },
  {
    path: "/api/story/sub-regions",
    method: "GET",
    description:
      "Returns sub-regional climate risk data groups comparing Melanesia, Micronesia, and Polynesia realms.",
    category: "story",
    usedIn: ["PacificSubRegions"],
  },
  {
    path: "/api/story/enso-effect",
    method: "GET",
    description:
      "Returns phase-by-phase averages correlating anomalies with Southern Oscillation Index datasets.",
    category: "story",
    usedIn: ["ENSOEffect"],
  },
  {
    path: "/api/story/patterns-over-time",
    method: "GET",
    description:
      "Returns country-by-year heatmap anomaly grids for decadal patterns visualization.",
    category: "story",
    usedIn: ["PatternsOverTime"],
  },
  {
    path: "/api/story/future-outlook",
    method: "GET",
    description:
      "Returns extrapolated 10-year forward sea level trajectories with OLS confidence intervals.",
    category: "story",
    usedIn: ["FutureOutlook"],
  },
  {
    path: "/api/story/risk-assessment",
    method: "GET",
    description:
      "Returns normalized composite risk scores across multi-weighted vulnerability indicators.",
    category: "story",
    usedIn: ["RiskAssessment"],
  },
  {
    path: "/api/story/pacific-at-a-glance",
    method: "GET",
    description:
      "Returns a complete sortable analytics metrics list for peer comparison table.",
    category: "story",
    usedIn: ["PacificAtAGlance"],
  },
  {
    path: "/api/story/explore-any-nation/:code",
    method: "GET",
    description:
      "Returns detailed country profiles tailored for individual territory deep-dives.",
    category: "story",
    usedIn: ["ExploreAnyNation"],
    params: [
      {
        name: "code",
        placeholder: "Country Code (e.g. PW, PG, TV)",
        type: "dropdown",
        options: [
          "PW",
          "PG",
          "TV",
          "MH",
          "FM",
          "KI",
          "FJ",
          "SB",
          "VU",
          "TO",
          "WS",
          "CK",
          "NU",
          "TK",
          "WF",
          "PF",
          "NC",
          "GU",
          "MP",
          "AS",
          "NR",
        ],
      },
    ],
  },
  {
    path: "/api/story/what-this-means",
    method: "GET",
    description:
      "Returns historic crossing milestones mapping when nations first crossed sea level benchmarks.",
    category: "story",
    usedIn: ["WhatThisMeans"],
  },
];

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }
  return typeof window !== "undefined" ? window.location.origin : "";
};

export default function ApiExplorerPage() {
  useSEO({
    title: "API Explorer | Pacific Sea Level Anomalies",
    description:
      "Explore the Pacific Sea Level Anomalies API. Access core datasets, overview statistics, country-specific profiles, decadal shift records, and narrative endpoints.",
    canonicalPath: "/api-explorer",
    keywords:
      "API explorer, climate change API, sea level data API, Pacific climate JSON, developer resources",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Pacific Sea Level API Explorer",
      description:
        "Interactive developer utility to test and explore the Pacific Sea Level Anomalies API endpoints, retrieving JSON telemetry data.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
    },
  });

  const [selectedApi, setSelectedApi] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    code: "PW",
  });
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "core" | "story"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState("");
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "js" | "python">(
    "curl",
  );

  const getTargetUrl = () => {
    let url = selectedApi.path;
    selectedApi.params?.forEach((p) => {
      url = url.replace(`:${p.name}`, paramValues[p.name] || "");
    });
    const base = getApiBaseUrl().replace(/\/$/, "");
    return `${base}${url}`;
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

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Run automatically when selected API or parameter changes
  useEffect(() => {
    handleFetch();
  }, [selectedApi, paramValues]);

  // Auto-select first endpoint of the category when filter changes and current selection is not in the filtered list
  useEffect(() => {
    const matchesCategory =
      categoryFilter === "all" ||
      (selectedApi.category as string) === categoryFilter;
    if (!matchesCategory) {
      const firstOfCategory = ENDPOINTS.find(
        (ep) =>
          (categoryFilter as string) === "all" ||
          (ep.category as string) === categoryFilter,
      );
      if (firstOfCategory) {
        setSelectedApi(firstOfCategory);
      }
    }
  }, [categoryFilter, selectedApi]);

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchesCategory =
      categoryFilter === "all" || (ep.category as string) === categoryFilter;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.usedIn?.some((u) =>
        u.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

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
        filtered[k] = apiResponse[k];
      }
    });
    return filtered;
  };

  const formattedJson = JSON.stringify(getFilteredJsonResponse(), null, 2);

  const getCodeSnippet = (lang: "curl" | "js" | "python", url: string) => {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const absoluteUrl = `${base}${url}`;
    switch (lang) {
      case "curl":
        return `curl -X GET "${absoluteUrl}" \\\n  -H "Accept: application/json"`;
      case "js":
        return `// JavaScript Fetch API\nfetch("${absoluteUrl}")\n  .then(res => {\n    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n    return res.json();\n  })\n  .then(data => console.log(data))\n  .catch(err => console.error("API Error:", err));`;
      case "python":
        return `# Python requests library\nimport requests\n\nurl = "${absoluteUrl}"\nheaders = {"Accept": "application/json"}\n\ntry:\n    response = requests.get(url, headers=headers)\n    response.raise_for_status()\n    data = response.json()\n    print(data)\nexcept requests.exceptions.RequestException as e:\n    print(f"Fetch failed: {e}")`;
    }
  };

  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const categories: ("all" | "core" | "story")[] = ["all", "core", "story"];
      const currentIndex = categories.indexOf(categoryFilter);
      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") {
        nextIndex =
          currentIndex === categories.length - 1 ? 0 : currentIndex + 1;
      } else {
        nextIndex =
          currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
      }
      const nextCat = categories[nextIndex];
      setCategoryFilter(nextCat);
      setTimeout(() => {
        document.getElementById(`tab-category-${nextCat}`)?.focus();
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060812] via-[#080d1e] to-[#04060f] text-[#f1f5f9] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200 overflow-x-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[20%] right-[10%] w-[700px] h-[700px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none animate-pulse duration-[12000ms]" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#060812]/80 backdrop-blur-xl border-b border-slate-800/60 shadow-lg px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-md flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent truncate">
            Pacific Sea Level API Explorer
          </h1>
        </div>

        <a
          href="/"
          id="btn-back-to-story"
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-all duration-300 shadow-md cursor-pointer group flex-shrink-0"
          aria-label="Back to Story"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="hidden sm:inline">Back to Story</span>
        </a>
      </header>

      {/* Desktop Main Grid */}
      <main
        id="main-content"
        className="max-w-[1720px] mx-auto p-3 xs:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-80px)] lg:overflow-hidden overflow-y-auto"
        tabIndex={-1}
      >
        {/* LEFT COLUMN: Endpoint Navigator */}
        <section className="lg:col-span-3 flex flex-col gap-3.5 lg:h-full min-h-[400px] lg:min-h-0 overflow-hidden bg-slate-900/15 backdrop-blur-md border border-slate-900/80 p-4 rounded-2xl shadow-xl">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                API Catalogue
              </h2>
              <span className="text-[10px] text-slate-500 font-mono font-medium bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                {filteredEndpoints.length} Routes
              </span>
            </div>

            {/* Search Endpoint */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                id="search-endpoints"
                placeholder="Search endpoints or components..."
                aria-label="Search endpoints or components"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 hover:bg-slate-950 transition"
              />
            </div>

            {/* Group Switcher Tabs */}
            <div
              className="flex gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80 relative"
              role="tablist"
              aria-label="Endpoint categories"
              onKeyDown={handleTablistKeyDown}
            >
              {(["all", "core", "story"] as const).map((cat) => {
                const isActive = categoryFilter === cat;
                const count =
                  cat === "all"
                    ? ENDPOINTS.length
                    : ENDPOINTS.filter((e) => e.category === cat).length;

                // Icon mapping
                const getIcon = () => {
                  switch (cat) {
                    case "all":
                      return <Layers className="w-3.5 h-3.5" />;
                    case "core":
                      return <Database className="w-3.5 h-3.5" />;
                    case "story":
                      return <Sparkles className="w-3.5 h-3.5" />;
                  }
                };

                const getTabColorClass = () => {
                  if (!isActive) return "text-slate-400 hover:text-slate-200";
                  switch (cat) {
                    case "all":
                      return "text-cyan-400";
                    case "core":
                      return "text-blue-400";
                    case "story":
                      return "text-purple-400";
                  }
                };

                return (
                  <button
                    key={cat}
                    id={`tab-category-${cat}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="endpoint-list"
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex-1 py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 relative z-10 ${getTabColorClass()}`}
                  >
                    {getIcon()}
                    <span>
                      {cat === "all"
                        ? "All"
                        : cat === "core"
                          ? "Core"
                          : "Story"}
                    </span>
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-mono ${
                        isActive
                          ? "bg-slate-950/50 text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      ({count})
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-lg -z-10 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Endpoint List scroll */}
          <div
            id="endpoint-list"
            role="tabpanel"
            className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800"
          >
            <AnimatePresence mode="popLayout">
              {filteredEndpoints.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-slate-500 italic text-xs flex flex-col items-center gap-2"
                >
                  <Search className="w-8 h-8 opacity-30 text-slate-400" />
                  <span>No matching endpoints</span>
                </motion.div>
              ) : (
                filteredEndpoints.map((ep) => {
                  const isSelected = selectedApi.path === ep.path;

                  // Helper function to render path with highlighted params
                  const renderPath = (path: string) => {
                    const parts = path.split("/");
                    return (
                      <span className="flex flex-wrap items-center gap-0.5 font-mono text-[10px] tracking-tight leading-none">
                        {parts.map((part, idx) => {
                          if (part === "" && idx === 0) return null;
                          if (part === "") return null;
                          const isParam = part.startsWith(":");
                          return (
                            <span key={idx} className="flex items-center">
                              <span className="text-slate-500 px-0.5 select-none">
                                /
                              </span>
                              {isParam ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[9px] animate-pulse">
                                  {part}
                                </span>
                              ) : (
                                <span
                                  className={
                                    isSelected
                                      ? "text-cyan-300 font-medium"
                                      : "text-slate-400 group-hover:text-slate-100 transition-colors"
                                  }
                                >
                                  {part}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </span>
                    );
                  };

                  return (
                    <motion.button
                      layout="position"
                      key={ep.path}
                      id={`btn-endpoint-${ep.path.replace(/[:/]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase()}`}
                      onClick={() => {
                        setSelectedApi(ep);
                        setJsonSearchQuery("");
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left flex flex-col gap-2.5 text-slate-300 transition-all duration-300 cursor-pointer group relative overflow-hidden pr-8 hover:-translate-y-0.5 flex-shrink-0 ${
                        isSelected
                          ? ep.category === "core"
                            ? "bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/20 border-blue-500/40 shadow-md shadow-blue-500/5"
                            : "bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/20 border-purple-500/40 shadow-md shadow-purple-500/5"
                          : "bg-slate-900/25 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700/60 hover:shadow-lg"
                      }`}
                    >
                      {/* Selection/Hover Color Indicator on left */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                          ep.category === "core"
                            ? isSelected
                              ? "bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                              : "bg-blue-500/30 group-hover:bg-blue-500 group-hover:h-full"
                            : isSelected
                              ? "bg-gradient-to-b from-purple-500 to-pink-600 shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                              : "bg-purple-500/30 group-hover:bg-purple-500 group-hover:h-full"
                        }`}
                      />

                      {/* Header row with HTTP Method and Category */}
                      <div className="flex items-center justify-between w-full flex-shrink-0">
                        <span className="flex-shrink-0 text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {ep.method}
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {ep.category === "core" ? (
                            <>
                              <Database className="w-3 h-3 text-blue-400" />
                              <span className="text-[8px] font-extrabold uppercase tracking-widest text-blue-400">
                                Core
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span className="text-[8px] font-extrabold uppercase tracking-widest text-purple-400">
                                Story
                              </span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Path render */}
                      <div className="flex-shrink-0 w-full overflow-x-auto scrollbar-none">
                        {renderPath(ep.path)}
                      </div>

                      {/* Description */}
                      <p className="text-[10px] text-slate-400 leading-relaxed break-words pr-2 flex-shrink-0">
                        {ep.description}
                      </p>

                      {/* Component Usage badges */}
                      {ep.usedIn && ep.usedIn.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-slate-800/40 w-full flex-shrink-0">
                          <span className="text-[8px] text-slate-500 font-mono self-center mr-1 flex-shrink-0">
                            Components:
                          </span>
                          {ep.usedIn.map((comp) => (
                            <span
                              key={comp}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-mono border transition-colors flex-shrink-0 ${
                                isSelected
                                  ? "bg-slate-950/90 text-cyan-400 border-cyan-500/20"
                                  : "bg-slate-950/60 text-slate-400 border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300"
                              }`}
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Chevron indicator sliding in on hover */}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            ep.category === "core"
                              ? "text-blue-400"
                              : "text-purple-400"
                          }`}
                        />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* MIDDLE COLUMN: Interactive Sandbox Console */}
        <section className="lg:col-span-4 flex flex-col gap-4 lg:h-full min-h-[450px] lg:min-h-0 overflow-hidden bg-[#0b0f19]/45 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-2xl relative">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-350">
              Request Sandbox
            </h2>
          </div>

          {/* Browser Address Bar UI representation with macOS window style decoration */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2.5 shadow-xl relative overflow-hidden group">
            {/* Window Controls Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-900/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                sandbox.terminal
              </span>
            </div>

            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider mt-1">
              Execution URL
            </span>
            <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-2.5 rounded-lg border border-slate-850 overflow-hidden hover:border-slate-800 transition-colors">
              <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded select-none animate-pulse">
                {selectedApi.method}
              </span>
              <span className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-nowrap flex-1 scrollbar-none">
                {getTargetUrl()}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${getTargetUrl()}`,
                  );
                  setCopiedSnippet(true);
                  setTimeout(() => setCopiedSnippet(false), 2000);
                }}
                className="text-slate-500 hover:text-slate-350 p-1 transition cursor-pointer"
                title="Copy full endpoint path"
              >
                {copiedSnippet ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Path Parameter Controls */}
          {selectedApi.params && selectedApi.params.length > 0 && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 border-l-2 border-l-amber-500/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Configure Path Parameters
              </span>
              <div className="flex flex-col gap-3">
                {selectedApi.params.map((p) => (
                  <div key={p.name} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`param-${p.name}`}
                      className="text-[9px] font-bold text-slate-500 uppercase tracking-wider"
                    >
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
                        className="bg-[#060812] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/40 hover:bg-slate-950/90 transition cursor-pointer"
                      >
                        {p.options.map((opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="bg-[#070913]"
                          >
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
                        className="bg-[#060812] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/40 hover:bg-slate-950/90 transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Generator Panel (IDE layout) */}
          <div className="flex-1 flex flex-col bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#060812] px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                Code Generator
              </span>
              <div className="flex gap-1">
                {(["curl", "js", "python"] as const).map((lang) => {
                  const isActive = activeCodeTab === lang;
                  // Color dot mapping
                  const getLangDotColor = () => {
                    switch (lang) {
                      case "curl":
                        return "bg-slate-400";
                      case "js":
                        return "bg-amber-400";
                      case "python":
                        return "bg-blue-400";
                    }
                  };

                  return (
                    <button
                      key={lang}
                      onClick={() => setActiveCodeTab(lang)}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-mono uppercase font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
                        isActive
                          ? "bg-slate-900 text-cyan-400 border border-slate-800"
                          : "text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getLangDotColor()}`}
                      />
                      {lang === "js" ? "Fetch" : lang}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto font-mono text-[10px] leading-relaxed text-slate-300 bg-[#03050c] select-all relative group scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
              <pre className="whitespace-pre scrollbar-none">
                {getCodeSnippet(activeCodeTab, getTargetUrl())}
              </pre>
              <button
                onClick={() =>
                  handleCopySnippet(
                    getCodeSnippet(activeCodeTab, getTargetUrl()) || "",
                  )
                }
                className="absolute right-3 top-3 bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer shadow-md"
                title="Copy code snippet"
              >
                {copiedSnippet ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Trigger execution button */}
          <button
            id="btn-fetch-api"
            onClick={handleFetch}
            disabled={isFetching}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-450 text-[#04060f] font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.15)] transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] group"
          >
            {isFetching ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-[#04060f] text-[#04060f] group-hover:scale-110 transition duration-200" />
            )}
            <span>
              {isFetching ? "Triggering Request..." : "Send Sandbox Request"}
            </span>
          </button>
        </section>

        {/* RIGHT COLUMN: Raw JSON Response */}
        <section className="lg:col-span-5 flex flex-col gap-4 lg:h-full min-h-[450px] lg:min-h-0 overflow-hidden bg-[#0b0f19]/45 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-2xl relative">
          {/* Diagnostic Metrics header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Response Pane
              </span>
              {statusCode !== null && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <span
                    className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[9px] uppercase tracking-wider border flex items-center gap-1.5 ${
                      statusCode >= 200 && statusCode < 300
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusCode === 200 ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}
                    />
                    {statusCode} {statusCode === 200 ? "OK" : "ERR"}
                  </span>
                  {responseTime !== null && (
                    <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {responseTime}ms
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-cyan-500" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                JSON Response
              </span>
            </div>
          </div>

          {/* MAIN OUTPUT AREA */}
          <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-slate-950/70 border border-slate-800">
            {isFetching ? (
              <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-500">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full border-2 border-cyan-500/20 animate-ping" />
                  <RefreshCw className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin text-cyan-400" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-400">
                  Retrieving live telemetry data...
                </span>
              </div>
            ) : apiResponse ? (
              /* JSON Payload Inspector Container */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* IDE Tab Header & Controls */}
                <div className="px-4 py-2.5 sm:py-2 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs bg-[#060812] gap-2.5 sm:gap-0">
                  <div className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-2 sm:pb-0 pr-0 sm:pr-4">
                    <FileJson className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[10px] font-mono text-slate-300 font-medium">
                      response.json
                    </span>
                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-500 px-1 py-0.2 rounded font-mono">
                      UTF-8
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 pl-0 sm:pl-4 justify-between">
                    <div className="relative flex-1 max-w-[160px]">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-650" />
                      <input
                        type="text"
                        id="input-filter-json"
                        placeholder="Filter JSON keys..."
                        aria-label="Filter JSON keys"
                        value={jsonSearchQuery}
                        onChange={(e) => setJsonSearchQuery(e.target.value)}
                        className="w-full bg-[#03050c] border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[10px] focus:outline-none focus:border-cyan-500/30 text-slate-350 placeholder:text-slate-650"
                      />
                    </div>
                    <button
                      id="btn-copy-response"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer text-[10px] font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">
                            Copied Payload
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Raw JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {/* Code viewport with custom scrollbar styling */}
                <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-text bg-[#020409] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
                  <pre className="text-slate-350 whitespace-pre overflow-x-auto select-all">
                    {formattedJson}
                  </pre>
                </div>
              </div>
            ) : (
              /* Idle Empty State with high-end telemetry graphics representation */
              <div className="flex-1 flex flex-col justify-center items-center gap-4 text-slate-500 p-8 border-2 border-dashed border-slate-850 bg-slate-950/10 m-4 rounded-xl">
                <div className="p-4 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.05)] animate-pulse">
                  <Terminal className="w-7 h-7" />
                </div>
                <div className="text-center flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-350 tracking-wide uppercase font-mono">
                    Console Idle
                  </span>
                  <p className="text-[10px] text-slate-500 max-w-[220px] leading-relaxed">
                    Select an API endpoint and click 'Send Sandbox Request' to
                    inspect telemetry response.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
