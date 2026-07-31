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
} from "lucide-react";
import { useSEO } from "@/lib/useSEO";

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
      "This measures the height of the sea in a specific year and compares it to a 10-year baseline average (1993-2002). A positive number means the sea is higher than normal, and a negative number means it is lower.",
    formulaSimple:
      "Anomaly (cm) = (Ocean Height - 1993–2002 Baseline Avg) × 100",
    inputData: "Annual satellite & tidal height measurements (meters)",
    outputResult: "+12.4 cm current anomaly",
    exampleNation: "Pacific Regional Average",
    steps: [
      "Find average ocean height from 1993 to 2002 (set as 0.0 cm baseline).",
      "Subtract baseline average from current year height.",
      "Multiply meters by 100 to convert to centimeters.",
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
    formulaSimple: "Decadal Shift = (2014–2023 Average) - (1993–2002 Average)",
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
    inputData: "30 annual anomaly records (1993 to 2023)",
    outputResult: "4.84 mm/yr (13% above regional average)",
    exampleNation: "Palau & Papua New Guinea",
    steps: [
      "Plot all 30 annual water height points on a timeline.",
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
      "Calculate sample standard deviation (σ) in ±cm.",
    ],
  },
  {
    id: "acceleration",
    category: "trends",
    title: "5. Decadal Acceleration",
    question: "Is the rate of sea-level rise speeding up over time?",
    unit: "mm/yr²",
    plainEnglish:
      "This tells us if the speed of sea-level rise is accelerating (like stepping on a car's gas pedal). A positive value means the sea is rising faster today than it was in the past.",
    formulaSimple: "Acceleration = 2 × Polynomial Fit Coefficient (c₂) × 1,000",
    inputData: "Second-degree polynomial fit (SLA = c₀ + c₁t + c₂t²)",
    outputResult: "+0.24 mm/yr² (Speeding up)",
    exampleNation: "Tuvalu & Marshall Islands",
    steps: [
      "Apply 2nd-degree polynomial curve fit to time series.",
      "Extract coefficient c₂ representing curve bending.",
      "Multiply c₂ by 2,000 to express acceleration in mm/yr².",
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
    formulaSimple: "Peak Record = Max(SLA₁, SLA₂, ..., SLA₃₀) × 100",
    inputData: "30 annual anomaly records for territory",
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
    formulaSimple: "Trough Record = Min(SLA₁, SLA₂, ..., SLA₃₀) × 100",
    inputData: "30 annual anomaly records for territory",
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
    title: "8. Cumulative Rise Accumulation",
    question: "What is the total sum of all yearly water level increases?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "This sums up only the years that experienced sea-level increases. It provides a visual indicator of the total accumulated height burden placed on the island over time.",
    formulaSimple: "Cumulative Rise = Sum of all positive annual anomalies",
    inputData: "Time-series of annual positive anomalies",
    outputResult: "+20.0 cm accumulated rise",
    exampleNation: "Palau & Solomon Islands",
    steps: [
      "Select annual years where sea level anomaly > 0.",
      "Sum positive annual height gains over 30 years.",
      "Display total accumulated ocean height burden in cm.",
    ],
  },
  {
    id: "start-end-leap",
    category: "core",
    title: "9. Start-to-End Leap Delta",
    question: "How much did the sea level jump from the very first year to the last?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "A simple comparison showing the direct difference in sea level between the first year of monitoring (1993) and the latest year (2023).",
    formulaSimple: "Leap Delta = SLA(2023) - SLA(1993)",
    inputData:
      "1993 initial anomaly (-5.2 cm) vs 2023 final anomaly (+14.8 cm)",
    outputResult: "+20.0 cm total leap",
    exampleNation: "Papua New Guinea",
    steps: [
      "Record starting sea level anomaly in 1993.",
      "Record ending sea level anomaly in 2023.",
      "Subtract 1993 starting level from 2023 ending level.",
    ],
  },
  {
    id: "enso-correlation",
    category: "risk",
    title: "10. ENSO Climate Sensitivity (Pearson r)",
    question:
      "How much do major climate events (El Niño and La Niña) affect the local sea levels?",
    unit: "Correlation (-1.0 to +1.0)",
    plainEnglish:
      "This calculates a correlation score showing how closely local sea levels follow the Pacific El Niño / La Niña cycle. It shows whether local waters drop during El Niño or rise during La Niña.",
    formulaSimple: "ENSO Correlation = Pearson Correlation (SLA vs SOI)",
    inputData: "Annual SOI Index matched against territory sea level anomalies",
    outputResult: "-0.78 (Strong Inverse Sensitivity)",
    exampleNation: "Micronesia & Palau",
    steps: [
      "Record annual Southern Oscillation Index (SOI) values.",
      "Align sea level drops with major El Niño years (1997-98, 2015-16).",
      "Compute Pearson correlation coefficient r.",
    ],
  },
  {
    id: "risk-score",
    category: "risk",
    title: "11. Composite Risk Index (R)",
    question: "How threatened is this island overall compared to others?",
    unit: "Score (0–100 Risk Level)",
    plainEnglish:
      "A threat index from 0 to 100 that combines four critical factors: how fast the sea is rising, how wild the year-to-year swings are, how much it is speeding up, and how flat or low-lying the island is.",
    formulaSimple:
      "Risk Score = 35% Speed + 25% Volatility + 20% Acceleration + 20% Elevation",
    inputData: "Normalized percentile rankings across 21 Pacific nations",
    outputResult: "89.5 Score (CRITICAL RISK LEVEL)",
    exampleNation: "Tuvalu & Kiribati",
    steps: [
      "Rank all 21 nations across speed, volatility, acceleration, and elevation.",
      "Multiply rankings by safety impact weights.",
      "Classify into Critical (≥80), High (65-79), Medium (45-64), or Low (<45).",
    ],
  },
  {
    id: "threshold-breach",
    category: "risk",
    title: "12. Threshold Breach Year",
    question: "When did the island first cross critical sea-level warning lines?",
    unit: "Calendar Year (YYYY)",
    plainEnglish:
      "Identifies the first calendar year when the sea level rose beyond benchmark heights (such as 10 cm or 20 cm above the starting baseline).",
    formulaSimple: "First Year (y*) where SLA(y*) ≥ Threshold Level",
    inputData: "Annual anomaly time series per territory",
    outputResult: "Breached +10cm in Year 2012",
    exampleNation: "Marshall Islands",
    steps: [
      "Define threshold level (+0.0 cm, +10.0 cm, or +20.0 cm).",
      "Scan time series for first year exceeding benchmark.",
      "Flag calendar year of first breach for threshold funnel.",
    ],
  },
  {
    id: "yoy-budget",
    category: "risk",
    title: "13. Year-Over-Year Budget Share",
    question:
      "What portion of the total 30-year sea-level rise happened in just one single year?",
    unit: "Percentage (%)",
    plainEnglish:
      "Calculates what percentage of the total accumulated rise happened in a specific year, helping identify years with exceptionally high storm surges or climate events.",
    formulaSimple: "Budget Share (%) = (Annual Anomaly / 30-Year Sum) × 100",
    inputData: "Annual anomaly divided by sum of positive anomalies",
    outputResult: "7.8% annual rise budget share",
    exampleNation: "Fiji (2016 Peak Year)",
    steps: [
      "Sum all positive sea level anomalies over 30 years.",
      "Divide target year anomaly by 30-year total sum.",
      "Multiply by 100 to get yearly percentage share.",
    ],
  },
  {
    id: "regional-clusters",
    category: "core",
    title: "14. Sub-Regional Cluster Averages",
    question: "How do different island groups (Melanesia, Micronesia, Polynesia) compare?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "Averages the sea level data of neighboring islands into three main sub-regions. This helps climate scientists track if certain sub-regions of the Pacific are rising faster than others.",
    formulaSimple: "Cluster Average = Mean of Member Territory Anomalies",
    inputData: "Territory groupings: Melanesia, Micronesia, Polynesia",
    outputResult: "Micronesia Mean: +10.2 cm",
    exampleNation: "Micronesia Sub-Region",
    steps: [
      "Assign each territory to Melanesia, Micronesia, or Polynesia.",
      "Compute average sea level anomaly for each cluster per year.",
      "Compare sub-regional stream graphs and distributions.",
    ],
  },
  {
    id: "percentile-distributions",
    category: "spread",
    title: "15. Decadal Percentile Distributions (P10, P50, P90)",
    question: "What are the lower, middle, and upper limits of sea-level rise across the region?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "Instead of looking at one single average, this divides all monitored stations to show the lowest 10% (islands with least rise), the middle 50% (median), and the top 10% (most impacted islands) to show the full range of rise.",
    formulaSimple: "Percentile Rank (P₁₀, P₅₀, P₉₀) of Annual Anomalies",
    inputData: "Sorted annual anomaly array across 21 stations",
    outputResult: "P₅₀ (Median): +8.5 cm, P₉₀ (Upper): +15.2 cm",
    exampleNation: "Regional Distribution Boxplot",
    steps: [
      "Order all territory anomalies for a decade from lowest to highest.",
      "Extract P10 (lowest 10%), P50 (median), and P90 (highest 10%).",
      "Chart distribution bounds to display decadal spread.",
    ],
  },
  {
    id: "annual-deviation",
    category: "spread",
    title: "16. Cross-Territory Annual Dispersion",
    question:
      "How different were the sea levels from island to island in any single year?",
    unit: "Standard Deviation (σ_y)",
    plainEnglish:
      "Measures how widely scattered the sea level heights were across all 21 nations for a given year. A high score means some islands were heavily flooded while others were dry.",
    formulaSimple:
      "Annual Dispersion = Standard Deviation across 21 nations in Year y",
    inputData: "21 territory anomaly values for a single year",
    outputResult: "σ₂₀₁₆ = ±4.2 cm cross-island dispersion",
    exampleNation: "Lollipop Anomaly Chart",
    steps: [
      "Collect anomaly values for all 21 nations in calendar year y.",
      "Find average anomaly across all nations for that year.",
      "Compute standard deviation (σ_y) to measure island spread.",
    ],
  },
  {
    id: "nations-rising-count",
    category: "core",
    title: "17. Nations Rising Count per Year",
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
    title: "18. Predictive Projection Model (2024–2050)",
    question: "What is the predicted sea level height in the year 2050?",
    unit: "Centimeters (cm)",
    plainEnglish:
      "Projects future sea levels up to the year 2050 based on historical rising speeds and acceleration trends, while showing a safe range of uncertainty.",
    formulaSimple:
      "Projected SLA(t) = SLA₂₀₂₃ + Speed × (t - 2023) + ½ Acceleration × (t - 2023)² ± 1.96σ",
    inputData:
      "2023 baseline level + OLS slope (v) + acceleration (a) + volatility (σ)",
    outputResult: "+19.8 cm projected mean by 2050 (+13.7cm to +25.9cm range)",
    exampleNation: "2050 Climate Forecast",
    steps: [
      "Use 2023 ending sea level anomaly as starting benchmark.",
      "Project forward using linear speed rate and quadratic acceleration.",
      "Apply ±1.96σ confidence band based on historical volatility.",
    ],
  },
  {
    id: "rolling-average",
    category: "trends",
    title: "19. 5-Year Rolling Moving Average (SMA)",
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
      "Add the 5 annual anomaly values and divide by 5.",
      "Render smoothed moving average line overlay on charts.",
    ],
  },
  {
    id: "relative-comparison-ratio",
    category: "core",
    title: "20. Relative Regional Comparison Ratio (%)",
    question:
      "How does a single island's sea-level rise compare to the regional average?",
    unit: "Percentage (%)",
    plainEnglish:
      "Compares a single island's measurements directly to the average of all 21 Pacific nations to show if it is rising faster or slower than its neighbors.",
    formulaSimple:
      "Relative Ratio (%) = ((Nation Metric / Regional Avg Metric) - 1) × 100",
    inputData: "Nation metric value vs Regional benchmark average",
    outputResult: "+62% above regional average",
    exampleNation: "Palau Cumulative Rise Stat Card",
    steps: [
      "Find mean value of metric across all 21 Pacific territories.",
      "Divide target nation's metric by regional average metric.",
      "Subtract 1 and multiply by 100 to show % shift.",
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

  const filteredCalculations = CALCULATIONS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#070913]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calculator className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold font-serif text-slate-100 tracking-tight">
            Methodology & Formulas
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="max-w-[1300px] mx-auto p-6 lg:p-10 flex flex-col gap-8" tabIndex={-1}>
        {/* Introduction Header */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col gap-6 shadow-md">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-100">
              Calculation Methodology Guide
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step-by-step guide explaining all 20 calculated metrics, formulas,
              and statistical transformations used in the Pacific Climate Story.
            </p>
          </div>

          {/* Neutral Cheat Sheet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Scale className="w-3.5 h-3.5" /> Heights in Centimeters (cm)
              </span>
              <span className="text-xs font-semibold text-slate-200">
                1 Meter = 100 cm
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Raw meter values are multiplied by 100 (
                <strong className="text-slate-300">+12.4 cm</strong> instead of
                0.124m).
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> Rise Speed in mm/yr
              </span>
              <span className="text-xs font-semibold text-slate-200">
                1 Meter = 1,000 mm
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Annual rise rates use linear slope fitting expressed in mm/yr (
                <strong className="text-slate-300">4.84 mm/yr</strong>).
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Activity className="w-3.5 h-3.5" /> Baseline = 1993–2002
              </span>
              <span className="text-xs font-semibold text-slate-200">
                10-Year Reference Zero
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                The 10-year mean from 1993 to 2002 serves as the benchmark zero
                (<strong className="text-slate-300">0.0 cm</strong>) line.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Waves className="w-3.5 h-3.5" /> Volatility = ±cm
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Yearly Fluctuation
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Standard deviation measures how ocean levels bounce up and down
                (<strong className="text-slate-300">±8.7 cm</strong>).
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="search-calculations"
            placeholder="Search calculation metrics (e.g. speed, volatility, risk)..."
            aria-label="Search calculation metrics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 transition shadow-inner"
          />
        </div>

        {/* Calculation Cards Stack */}
        <div className="flex flex-col gap-6">
          {filteredCalculations.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/40 border border-slate-800 p-6 lg:p-7 rounded-2xl flex flex-col gap-5 transition-all duration-200 hover:border-cyan-500/30 shadow-md"
            >
              {/* Card Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400/80" />
                    <span className="italic">{item.question}</span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs font-semibold self-start sm:self-auto">
                  Unit: {item.unit}
                </span>
              </div>

              {/* Plain-English Explanation Banner */}
              <div className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                    IN PLAIN WORDS
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.plainEnglish}
                  </p>
                </div>
              </div>

              {/* 3-Step Simple Procedure */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                  CALCULATION PROCEDURE
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {item.steps.map((stepDesc, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          STEP {sIdx + 1}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400/80" />
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                        {stepDesc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple Formula & Worked Example Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Formula Box */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1.5 font-mono">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    FORMULA
                  </span>
                  <div className="text-xs md:text-sm font-bold text-cyan-400 py-0.5">
                    {item.formulaSimple}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Source: {item.inputData}
                  </span>
                </div>

                {/* Worked Example */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                    EXAMPLE ({item.exampleNation})
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 font-medium">
                      Result:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-slate-200">
                      {item.outputResult}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
