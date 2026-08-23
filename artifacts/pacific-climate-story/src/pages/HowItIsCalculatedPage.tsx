import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Waves,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Scale,
  Activity,
  Search,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useSEO } from "@/lib/useSEO";
import { motion, AnimatePresence } from "framer-motion";

interface CalculationCard {
  id: string;
  category: "core" | "trends" | "risk" | "spread";
  title: string;
  question: string;
  unit: string;
  plainEnglish: string;
  formulaSimple: string;
  inputData: string;
  outputResult: string;
  exampleNation: string;
  steps: string[];
}

const CALCULATIONS: CalculationCard[] = [
  {
    id: "sea-level-anomaly",
    category: "core",
    title: "1. Sea Level Anomaly (SLA)",
    question: "Is the ocean level currently higher or lower than normal?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "This measures the height of the sea in a specific year and compares it to a baseline average. A positive number means the sea is higher than normal, and a negative number means it is lower.",
    formulaSimple:
      "Anomaly (cm) = Anomaly (m) × 100",
    inputData: "Annual satellite & tidal anomaly measurements (meters)",
    outputResult: "+10.5 cm current anomaly (Year 2023)",
    exampleNation: "Pacific Regional Average",
    steps: [
      "Retrieve the raw annual anomaly value (in meters) for the target year.",
      "Multiply the value by 100 to convert from meters to centimeters.",
      "Plot positive anomalies above the zero baseline and negative anomalies below.",
    ],
  },
  {
    id: "decade-shift",
    category: "core",
    title: "2. Decadal Baseline Shift (Δ)",
    question: "How much has the baseline sea level shifted over the past 30 years?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "This compares the average sea level from the first decade of monitoring (1993–2002) directly to the average of the most recent decade (2014–2023). It tells us how much the baseline has risen over a generation.",
    formulaSimple: "Decadal Shift = (2014–2023 Average - 1993–2002 Average) × 100",
    inputData: "Decade 1 Mean (0.0 cm) vs Decade 3 Mean (+8.5 cm)",
    outputResult: "+8.5 cm regional shift",
    exampleNation: "Pacific Regional Average",
    steps: [
      "Calculate average ocean anomaly from 1993 to 2002.",
      "Calculate average ocean anomaly from 2014 to 2023.",
      "Subtract Decade 1 mean from Decade 3 mean.",
    ],
  },
  {
    id: "speed-rate",
    category: "trends",
    title: "3. Speed Rate (Linear Trend)",
    question: "How fast is the water level rising every year?",
    unit: "Millimeters per year (mm/yr)",
    plainEnglish:
      "This calculates the average speed of sea-level rise by drawing a straight trend line through 30 years of annual measurements. For example, a rate of 4.8 mm/yr means the water rises about half a centimeter each year.",
    formulaSimple: "Speed Rate = OLS Trendline Slope × 1,000 mm/m",
    inputData: "31 annual anomaly records (1993 to 2023)",
    outputResult: "4.84 mm/yr (Palau) & 5.40 mm/yr (Papua New Guinea)",
    exampleNation: "Palau & Papua New Guinea",
    steps: [
      "Plot all 31 annual water height points on a timeline.",
      "Fit an Ordinary Least Squares (OLS) regression line.",
      "Multiply line slope by 1,000 to express speed in mm/year.",
    ],
  },
  {
    id: "volatility",
    category: "risk",
    title: "4. Volatility (Fluctuation Range)",
    question: "How unstable or jumpy are the ocean levels from year to year?",
    unit: "± Centimeters (±cm)",
    plainEnglish:
      "This measures how much sea levels bounce up and down around their long-term average. High volatility means the island experiences extreme highs and lows due to seasonal changes and storms.",
    formulaSimple:
      "Volatility = Standard Deviation (σ) of Annual Anomalies × 100",
    inputData: "Yearly variance from 30-year average line",
    outputResult: "±8.7 cm (41% above regional avg)",
    exampleNation: "Palau (Most Volatile Nation)",
    steps: [
      "Calculate 30-year average sea level height for territory.",
      "Measure yearly deviations from average height.",
      "Calculate population standard deviation (σ) in ±cm.",
    ],
  },
  {
    id: "acceleration",
    category: "trends",
    title: "5. Rate Acceleration (Split-Period Comparison)",
    question: "Is the speed of sea-level rise faster in recent years compared to the past?",
    unit: "Comparison (Accelerating vs Decelerating)",
    plainEnglish:
      "This compares the rising speed (slope) of the first half of the 31-year period directly with the second half. If the slope of the second half is steeper, the rate of sea-level rise is accelerating.",
    formulaSimple: "Acceleration Check = (Second-Half Slope) > (First-Half Slope)",
    inputData: "First-half years (1993–2007) vs second-half years (2008–2023)",
    outputResult: "Accelerating (Second-half speed is higher than first-half)",
    exampleNation: "Kiribati & Solomon Islands",
    steps: [
      "Divide the 31-year sea-level anomaly dataset into two periods (1993–2007 and 2008–2023).",
      "Fit a linear regression line to the first half (1993–2007) to calculate its slope.",
      "Fit a linear regression line to the second half (2008–2023) to calculate its slope.",
      "Compare the two slopes: if the second-half slope is greater, classify the territory as accelerating.",
    ],
  },
  {
    id: "peak-record",
    category: "risk",
    title: "6. Peak Anomaly Record",
    question: "What is the highest sea level ever recorded on the island?",
    unit: "Centimeters (+cm)",
    plainEnglish:
      "The single highest yearly sea level recorded during the 30 years of observation. It highlights the maximum high-water mark for that territory.",
    formulaSimple: "Peak Record = Max(SLA₁, SLA₂, ..., SLA₃₁) × 100",
    inputData: "31 annual anomaly records for territory",
    outputResult: "Peak: +20.0 cm (Year 2008)",
    exampleNation: "Palau Peak Record",
    steps: [
      "Scan all 31 annual anomaly records from 1993 to 2023.",
      "Locate maximum positive anomaly value.",
      "Record peak height in +cm along with calendar year.",
    ],
  },
  {
    id: "trough-record",
    category: "risk",
    title: "7. Trough Anomaly Record",
    question: "What is the lowest sea level drop recorded in history?",
    unit: "Centimeters (-cm)",
    plainEnglish:
      "The lowest yearly sea level drop recorded during extreme drought periods or dry climate phases (like El Niño).",
    formulaSimple: "Trough Record = Min(SLA₁, SLA₂, ..., SLA₃₁) × 100",
    inputData: "31 annual anomaly records for territory",
    outputResult: "Trough: -10.0 cm (Year 1993)",
    exampleNation: "Palau Trough Record",
    steps: [
      "Scan all 31 annual anomaly records from 1993 to 2023.",
      "Locate minimum negative anomaly value.",
      "Record trough drop in -cm along with calendar year.",
    ],
  },
  {
    id: "cumulative-rise",
    category: "core",
    title: "8. Net Cumulative Rise",
    question: "What is the overall increase in water level over the monitoring period?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "This calculates the net change in sea level from the very first year of monitoring (1993) to the most recent year (2023). It represents the total accumulated height gain over the 30-year span.",
    formulaSimple: "Cumulative Rise = (2023 Anomaly - 1993 Anomaly) × 100",
    inputData: "Earliest (1993) and latest (2023) sea level anomaly records",
    outputResult: "+20.0 cm net rise (+12.4 cm regional average)",
    exampleNation: "Palau & Solomon Islands",
    steps: [
      "Identify the sea level anomaly value for the starting year (1993).",
      "Identify the sea level anomaly value for the ending year (2023).",
      "Subtract the starting year anomaly from the ending year anomaly to find the net cumulative rise in cm.",
    ],
  },
  {
    id: "enso-correlation",
    category: "risk",
    title: "9. ENSO Climate Sensitivity (La Niña vs El Niño Delta)",
    question:
      "How much do major climate events (El Niño and La Niña) swing the local sea levels?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "This measures the difference in average sea level anomalies between La Niña years and El Niño years. A larger value means the territory experiences dramatic sea level swings during different phases of the El Niño Southern Oscillation (ENSO) cycle.",
    formulaSimple: "ENSO Sensitivity = (La Niña Years Avg) - (El Niño Years Avg)",
    inputData: "Historical anomalies for classified El Niño (1997, 1998, 2015, 2016) and La Niña (2010, 2011, 2020, 2021) years",
    outputResult: "+17.5 cm avg swing (representing extreme high/low variation)",
    exampleNation: "Guam & Palau (Most Sensitive)",
    steps: [
      "Filter historical data into designated El Niño years and La Niña years.",
      "Calculate the average sea level anomaly for El Niño years.",
      "Calculate the average sea level anomaly for La Niña years.",
      "Subtract the El Niño average from the La Niña average to find the net sensitivity delta in cm.",
    ],
  },
  {
    id: "risk-score",
    category: "risk",
    title: "10. Composite Risk Index (R)",
    question: "How threatened is this island overall compared to others?",
    unit: "Score (0–100 Risk Level)",
    plainEnglish:
      "A threat index from 0 to 100 that combines four critical factors: total cumulative rise, speed rate of the rise, year-to-year volatility, and decade-over-decade acceleration.",
    formulaSimple:
      "Risk Score = 40% Cumulative Rise + 30% Speed Rate + 15% Volatility + 15% Acceleration",
    inputData: "Normalized values based on min/max across all 21 nations (Min-Max normalization)",
    outputResult: "92.0 Score (CRITICAL RISK LEVEL)",
    exampleNation: "Papua New Guinea & Solomon Islands",
    steps: [
      "Rank all 21 nations across cumulative rise, speed, volatility, and acceleration.",
      "Multiply rankings by safety impact weights.",
      "Classify into Critical (≥80), High (60-79), Medium (40-59), or Low (<40).",
    ],
  },
  {
    id: "threshold-breach",
    category: "risk",
    title: "11. Threshold Breach Year",
    question: "When did the island first cross critical sea-level warning lines?",
    unit: "Calendar Year (YYYY)",
    plainEnglish:
      "Identifies the first calendar year when the sea level rose beyond benchmark heights (such as 10 cm or 20 cm above the starting baseline).",
    formulaSimple: "First Year (y*) where SLA(y*) ≥ Threshold Level",
    inputData: "Annual anomaly time series per territory",
    outputResult: "Breached +10cm in Year 2005",
    exampleNation: "Marshall Islands",
    steps: [
      "Define threshold level (+0.0 cm, +10.0 cm, or +20.0 cm).",
      "Scan time series for first year exceeding benchmark.",
      "Flag calendar year of first breach for threshold funnel.",
    ],
  },
  {
    id: "regional-clusters",
    category: "core",
    title: "12. Sub-Regional Cluster Averages",
    question: "How do different island groups (Melanesia, Micronesia, Polynesia) compare?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "Averages the sea level data of neighboring islands into three main sub-regions. This helps climate scientists track if certain sub-regions of the Pacific are rising faster than others.",
    formulaSimple: "Cluster Average = Mean of Member Territory Anomalies",
    inputData: "Territory groupings: Melanesia, Micronesia, Polynesia",
    outputResult: "Micronesia Mean: +10.0 cm",
    exampleNation: "Micronesia Sub-Region",
    steps: [
      "Assign each territory to Melanesia, Micronesia, or Polynesia.",
      "Compute average sea level anomaly for each cluster per year.",
      "Compare sub-regional stream graphs and distributions.",
    ],
  },
  {
    id: "annual-deviation",
    category: "spread",
    title: "13. Pacific-Wide Annual Mean Deviation",
    question:
      "How much did the overall Pacific sea level in a given year deviate from the long-term 30-year average?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "This measures how much the average sea level across the entire Pacific in a specific year differed from the grand 30-year average. It shows the net annual fluctuations, highlighting the extreme peaks of climate events.",
    formulaSimple: "Annual Deviation = (Annual Pacific Avg) - (30-Year Grand Avg)",
    inputData: "Yearly averages and the overall 30-year average across all territories",
    outputResult: "+6.0 cm deviation (Year 2023)",
    exampleNation: "Annual Telemetry & Hydro-Gauge",
    steps: [
      "Calculate the average sea level anomaly across all 21 nations for each calendar year.",
      "Compute the grand average of these annual means over the full 30-year period (1993–2023).",
      "Subtract the 30-year grand average from each year's annual average to find the net annual deviation in cm.",
    ],
  },
  {
    id: "nations-rising-count",
    category: "core",
    title: "14. Nations Rising Count per Year",
    question:
      "How many of the 21 Pacific territories recorded high water levels in a year?",
    unit: "Count (0 to 21 Nations)",
    plainEnglish:
      "Counts how many of the 21 monitoring stations recorded sea levels above the baseline. In recent years, this has consistently reached 21 out of 21 (100% of islands).",
    formulaSimple: "Nations Rising = Count of Nations where SLA_y > 0",
    inputData: "Annual anomaly check (>0.0cm) for 21 nations",
    outputResult: "21 of 21 Nations Rising (100% in 2023)",
    exampleNation: "Rising Tide Chapter",
    steps: [
      "Evaluate anomaly level for each of 21 nations in year y.",
      "Increment count if nation's anomaly > 0.0 cm.",
      "Display total count out of 21.",
    ],
  },
  {
    id: "forecasting-model",
    category: "trends",
    title: "15. Predictive Projection Model & IPCC Scenarios (2024–2033)",
    question: "What is the predicted sea level height in the year 2033 under different emissions scenarios?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "Projects future sea levels 10 years forward (up to the year 2033). Users can toggle between the OLS linear baseline or IPCC SSP quadratic acceleration scenarios (SSP1-2.6, SSP2-4.5, SSP5-8.5), which add acceleration coefficients derived from climate projection models.",
    formulaSimple:
      "Projected Anomaly SLA(t) = OLS_Linear(t) + 0.05 × a_mm × (t - 2023)² ± 2σ",
    inputData:
      "Historical averages (1993–2023) & IPCC acceleration parameter (a_mm: Linear = 0, SSP1-2.6 = 0.05, SSP2-4.5 = 0.10, SSP5-8.5 = 0.20 mm/yr²)",
    outputResult: "OLS Linear: +15.2 cm by 2033 | SSP5-8.5 (Extreme): +16.2 cm by 2033",
    exampleNation: "10-Year Climate Forecast (with IPCC Accel)",
    steps: [
      "Fit an Ordinary Least Squares (OLS) linear regression model over the historical period (1993–2023).",
      "Select an IPCC scenario acceleration rate: Linear (OLS) (a = 0 mm/yr²), SSP1-2.6 (a = 0.05 mm/yr²), SSP2-4.5 (a = 0.10 mm/yr²), or SSP5-8.5 (a = 0.20 mm/yr²).",
      "Calculate the future baseline offset using the quadratic formula: ΔS_cm(t) = 0.05 × a_mm × (t - 2023)².",
      "Add the quadratic offset to the OLS linear projection line.",
      "Apply ±2σ standard deviation of the historical residuals as the confidence interval to represent statistical uncertainty.",
    ],
  },
  {
    id: "rolling-average",
    category: "trends",
    title: "16. 5-Year Rolling Moving Average (SMA)",
    question: "How do we filter out temporary yearly bounces in charts to see the real trend?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "Smooths out sharp, temporary swings (like a single stormy year) by averaging each year with the two years before and after it, revealing the clear long-term direction of rise.",
    formulaSimple:
      "SMA(y) = (SLA_y-2 + SLA_y-1 + SLA_y + SLA_y+1 + SLA_y+2) / 5",
    inputData: "5-year window centered around year y",
    outputResult: "Smoothed trend curve line",
    exampleNation: "Time Series & Explorer Charts",
    steps: [
      "Take anomaly values for 2 years prior, target year, and 2 years ahead.",
      "Add the 5 annual anomaly values and divide by 5 (dynamically truncating the window at the boundaries where years are missing).",
      "Render smoothed moving average line overlay on charts.",
    ],
  },
];

export default function HowItIsCalculatedPage() {
  useSEO({
    title: "Methodology & Formulas | Pacific Sea Level Anomalies",
    description: "Learn about the methodology and calculations behind the Pacific Sea Level Anomalies data story. Examine formulas for Sea Level Anomaly, Decadal Shift, Speed Rate, and Volatility.",
    canonicalPath: "/methodology",
    keywords: "climate calculations, sea level anomaly formulas, climate change statistics, climate methodology",
    schema: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "Calculation Methodology for Pacific Sea Level Anomalies",
      "description": "Step-by-step mathematical guide detailing formulas, statistics, and calculations used to measure climate indicators and decadal shifts.",
      "author": {
        "@type": "Person",
        "name": "Akash Ram"
      },
      "about": {
        "@type": "Thing",
        "name": "Mathematical calculations of ocean height anomalies"
      }
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "core" | "trends" | "risk" | "spread">("all");

  const filteredCalculations = CALCULATIONS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: CALCULATIONS.length,
    core: CALCULATIONS.filter((c) => c.category === "core").length,
    trends: CALCULATIONS.filter((c) => c.category === "trends").length,
    risk: CALCULATIONS.filter((c) => c.category === "risk").length,
    spread: CALCULATIONS.filter((c) => c.category === "spread").length,
  };

  const tabs = [
    { id: "all", name: "All Metrics", count: counts.all, icon: Layers },
    { id: "core", name: "Core Indicators", count: counts.core, icon: Scale },
    { id: "trends", name: "Trends & Forecasts", count: counts.trends, icon: TrendingUp },
    { id: "risk", name: "Risk & Climate Impact", count: counts.risk, icon: Waves },
    { id: "spread", name: "Statistical Spread", count: counts.spread, icon: Activity },
  ] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 110, damping: 14 },
    },
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#070913]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calculator className="w-4 h-4" />
          </div>
          <h1 className="text-base sm:text-xl font-bold font-serif text-slate-100 tracking-tight">
            Methodology & Formulas
          </h1>
        </div>

        <a
          href="/"
          id="btn-back-to-story"
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-all duration-300 shadow-md cursor-pointer group"
          aria-label="Back to Story"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="hidden sm:inline">Back to Story</span>
        </a>
      </header>

      {/* Main Container */}
      <main id="main-content" className="max-w-[1300px] mx-auto p-4 sm:p-6 lg:p-10 flex flex-col gap-8" tabIndex={-1}>
        {/* Introduction Header */}
        <div className="relative overflow-hidden bg-slate-900/20 border border-slate-800/80 p-8 rounded-3xl flex flex-col gap-6 shadow-xl backdrop-blur-sm">
          {/* Subtle decoration inside header */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Reference Documentation
            </div>
            <h2 className="text-3xl font-bold font-serif text-slate-100 leading-tight">
              Calculation Methodology Guide
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-none leading-relaxed">
              Below is a step-by-step guide explaining all calculated metrics, formulas, and statistical transformations used in the Pacific Climate Story.
            </p>
          </div>

          {/* Neutral Cheat Sheet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6 border-t border-slate-800/60">
            <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col gap-1.5 hover:border-slate-800/80 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Scale className="w-3.5 h-3.5" /> Heights in Centimeters
              </span>
              <span className="text-xs font-semibold text-slate-200">
                1 Meter = 100 cm
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Raw height values are converted to centimeters so small shifts are easy to see (e.g. <strong className="text-slate-300">+10.5 cm</strong> instead of 0.105m).
              </p>
            </div>

            <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col gap-1.5 hover:border-slate-800/80 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> Speed in Millimeters
              </span>
              <span className="text-xs font-semibold text-slate-200">
                1 Meter = 1,000 mm
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Yearly rise speeds use linear trend-fitting and are written in millimeters (e.g. <strong className="text-slate-300">4.8 mm/yr</strong>).
              </p>
            </div>

            <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col gap-1.5 hover:border-slate-800/80 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Activity className="w-3.5 h-3.5" /> Baseline = 1993–2002
              </span>
              <span className="text-xs font-semibold text-slate-200">
                10-Year Reference Average
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The average sea level from 1993 to 2002 acts as the zero-line benchmark (<strong className="text-slate-300">0.0 cm</strong>) for measuring anomalies.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col gap-1.5 hover:border-slate-800/80 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Waves className="w-3.5 h-3.5" /> Volatility = ±cm deviation
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Year-Over-Year Swings
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Standard deviation measures how jumpy ocean levels are as they swing above and below the baseline (e.g. <strong className="text-slate-300">±8.7 cm</strong>).
              </p>
            </div>

            <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col gap-1.5 hover:border-slate-800/80 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                Data Precision Limits
              </span>
              <span className="text-xs font-semibold text-slate-200">
                10-cm Rounded Data
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Raw data is rounded to the nearest 10 cm (about 4 in). While single island charts show stepped rises, combining all countries allows us to see smooth decimal trends.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="flex flex-col gap-5 bg-slate-900/10 border border-slate-800/60 p-6 rounded-3xl backdrop-blur-sm">
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              id="search-calculations"
              placeholder="Search calculation metrics (e.g. speed, volatility, risk)..."
              aria-label="Search calculation metrics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 transition shadow-inner placeholder:text-slate-500"
            />
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-t border-slate-850/60 pt-4">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-category-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${isActive
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-md"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-950 text-slate-500"
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculation Cards Grid / Stack */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {filteredCalculations.length > 0 ? (
              <motion.div
                key={activeTab + "_" + searchQuery}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-1 gap-6"
              >
                {filteredCalculations.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="bg-slate-900/25 border border-slate-800/80 p-6 lg:p-8 rounded-3xl flex flex-col gap-6 transition-all duration-300 hover:border-cyan-500/25 hover:bg-slate-900/35 shadow-lg group relative overflow-hidden"
                  >
                    {/* Visual Tab Category Tag Badge inside Card */}
                    <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-cyan-500/[0.01] blur-2xl pointer-events-none group-hover:bg-cyan-500/[0.02]" />

                    {/* Card Title Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/40 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${item.category === "core"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : item.category === "trends"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : item.category === "risk"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}>
                            {item.category === "core"
                              ? "Core Indicator"
                              : item.category === "trends"
                                ? "Trend & Forecast"
                                : item.category === "risk"
                                  ? "Risk & Climate Impact"
                                  : "Statistical Distribution"}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400/80 flex-shrink-0" />
                          <span className="italic leading-normal">{item.question}</span>
                        </p>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-900 text-cyan-400 font-mono text-xs font-semibold self-start sm:self-auto shadow-inner">
                        Unit: {item.unit}
                      </span>
                    </div>

                    {/* Plain-English Explanation Banner */}
                    <div className="bg-slate-950/60 border border-slate-800/60 p-5 rounded-2xl flex items-start gap-3.5 border-l-2 border-l-cyan-500/60 shadow-md">
                      <BookOpen className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                          IN PLAIN ENGLISH
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          {item.plainEnglish}
                        </p>
                      </div>
                    </div>

                    {/* 3-Step Simple Procedure */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                        HOW WE CALCULATE IT
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {item.steps.map((stepDesc, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-950/20 border border-slate-900/60 p-4 rounded-xl flex flex-col gap-1.5 hover:bg-slate-950/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold text-slate-500">
                                STEP {sIdx + 1}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400/70" />
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                              {stepDesc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simple Formula & Worked Example Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      {/* Formula Box */}
                      <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4.5 flex flex-col gap-2.5 font-mono shadow-inner group">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/30">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                            FORMULA
                          </span>
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500/40" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-bold text-cyan-400 py-1 tracking-tight select-all leading-normal break-words whitespace-pre-wrap overflow-x-auto">
                          {item.formulaSimple}
                        </div>
                        <div className="text-[10px] text-slate-400/80 mt-1 flex items-center gap-1.5 font-sans">
                          <span className="font-semibold text-slate-500">Data Source:</span>
                          <span>{item.inputData}</span>
                        </div>
                      </div>

                      {/* Worked Example */}
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4.5 rounded-2xl flex flex-col gap-2.5 justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono block mb-1">
                            WORKED EXAMPLE
                          </span>
                          <span className="text-[11px] text-slate-400 leading-relaxed">
                            Application to <strong className="text-slate-300">{item.exampleNation}</strong>:
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-medium">Result:</span>
                          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-mono text-xs font-bold text-cyan-300 shadow-md">
                            {item.outputResult}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center p-16 text-center bg-slate-900/10 border border-slate-800/60 rounded-3xl gap-4 backdrop-blur-sm"
              >
                <div className="p-4 bg-cyan-500/10 rounded-full text-cyan-400 border border-cyan-500/20 shadow-md">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200">No calculation metrics found</h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                    No metrics match your search query "{searchQuery}" in this category. Try adjusting your query or switching tabs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                  className="mt-2 px-5 py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 transition-all cursor-pointer shadow-md"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
