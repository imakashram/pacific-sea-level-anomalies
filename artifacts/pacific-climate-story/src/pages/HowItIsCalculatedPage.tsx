import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  Waves,
  BookOpen,
  Terminal,
  HelpCircle,
  CheckCircle2,
  Scale,
  Activity,
  Search
} from "lucide-react";

interface CalculationCard {
  id: string;
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
    title: "1. Sea Level Anomaly (SLA)",
    question: "How much higher or lower is the ocean level compared to normal?",
    unit: "Centimeters (cm)",
    plainEnglish: "We measure ocean height in any given year and compare it to the 10-year baseline average from 1993 to 2002.",
    formulaSimple: "Anomaly (cm) = (Ocean Height - 1993–2002 Baseline Avg) × 100",
    inputData: "Annual satellite & tidal height measurements (meters)",
    outputResult: "+12.4 cm current anomaly",
    exampleNation: "Pacific Regional Average",
    steps: [
      "Find average ocean height from 1993 to 2002 (set as 0.0 cm baseline).",
      "Subtract baseline average from current year height.",
      "Multiply meters by 100 to convert to centimeters."
    ]
  },
  {
    id: "decade-shift",
    title: "2. Decadal Baseline Shift (Δ)",
    question: "How much has sea level risen over 30 years?",
    unit: "Centimeters (cm)",
    plainEnglish: "We compare the 10-year average of the first decade (1993–2002) directly against the recent decade average (2014–2023).",
    formulaSimple: "Decadal Shift = (2014–2023 Average) - (1993–2002 Average)",
    inputData: "Decade 1 Mean (0.0 cm) vs Decade 3 Mean (+8.5 cm)",
    outputResult: "+8.5 cm regional shift",
    exampleNation: "Pacific Regional Average",
    steps: [
      "Calculate average ocean anomaly from 1993 to 2002.",
      "Calculate average ocean anomaly from 2014 to 2023.",
      "Subtract Decade 1 mean from Decade 3 mean."
    ]
  },
  {
    id: "speed-rate",
    title: "3. Speed Rate (Linear Trend)",
    question: "How fast is the water level rising every year?",
    unit: "Millimeters per year (mm/yr)",
    plainEnglish: "We fit a linear regression trend line through 30 years of annual water levels to calculate the yearly growth rate.",
    formulaSimple: "Speed Rate = OLS Trendline Slope × 1,000 mm/m",
    inputData: "30 annual anomaly records (1993 to 2023)",
    outputResult: "4.84 mm/yr (13% above regional average)",
    exampleNation: "Palau & Papua New Guinea",
    steps: [
      "Plot all 30 annual water height points on a timeline.",
      "Fit an Ordinary Least Squares (OLS) regression line.",
      "Multiply line slope by 1,000 to express speed in mm/year."
    ]
  },
  {
    id: "volatility",
    title: "4. Volatility (Fluctuation Range)",
    question: "How unstable or jumpy are annual ocean levels?",
    unit: "± Centimeters (±cm)",
    plainEnglish: "Volatility measures how far ocean levels bounce up and down around their mean trend line from year to year.",
    formulaSimple: "Volatility = Standard Deviation (σ) of Annual Anomalies × 100",
    inputData: "Yearly variance from 30-year average line",
    outputResult: "±8.7 cm (41% above regional avg)",
    exampleNation: "Palau (Most Volatile Nation)",
    steps: [
      "Calculate 30-year average sea level height for territory.",
      "Measure yearly deviations from average height.",
      "Calculate sample standard deviation (σ) in ±cm."
    ]
  },
  {
    id: "acceleration",
    title: "5. Decadal Acceleration",
    question: "Is the ocean rising faster today than it was 20 years ago?",
    unit: "mm/yr²",
    plainEnglish: "Acceleration measures whether the annual rate of rise is speeding up over time rather than remaining constant.",
    formulaSimple: "Acceleration = 2 × Polynomial Fit Coefficient (c₂) × 1,000",
    inputData: "Second-degree polynomial fit (SLA = c₀ + c₁t + c₂t²)",
    outputResult: "+0.24 mm/yr² (Speeding up)",
    exampleNation: "Tuvalu & Marshall Islands",
    steps: [
      "Apply 2nd-degree polynomial curve fit to time series.",
      "Extract coefficient c₂ representing curve bending.",
      "Multiply c₂ by 2,000 to express acceleration in mm/yr²."
    ]
  },
  {
    id: "peak-record",
    title: "6. Peak Anomaly Record",
    question: "What is the highest ocean level recorded in history?",
    unit: "Centimeters (+cm)",
    plainEnglish: "The highest single positive anomaly recorded across 30 years of observation for a territory.",
    formulaSimple: "Peak Record = Max(SLA₁, SLA₂, ..., SLA₃₀) × 100",
    inputData: "30 annual anomaly records for territory",
    outputResult: "Peak: +20.0 cm (Year 2008)",
    exampleNation: "Palau Peak Record",
    steps: [
      "Scan all 31 annual anomaly records from 1993 to 2023.",
      "Locate maximum positive anomaly value.",
      "Record peak height in +cm along with calendar year."
    ]
  },
  {
    id: "trough-record",
    title: "7. Trough Anomaly Record",
    question: "What is the lowest ocean level drop recorded in history?",
    unit: "Centimeters (-cm)",
    plainEnglish: "The lowest negative anomaly recorded during extreme drought or El Niño phases.",
    formulaSimple: "Trough Record = Min(SLA₁, SLA₂, ..., SLA₃₀) × 100",
    inputData: "30 annual anomaly records for territory",
    outputResult: "Trough: -10.0 cm (Year 1993)",
    exampleNation: "Palau Trough Record",
    steps: [
      "Scan all 31 annual anomaly records from 1993 to 2023.",
      "Locate minimum negative anomaly value.",
      "Record trough drop in -cm along with calendar year."
    ]
  },
  {
    id: "cumulative-rise",
    title: "8. Cumulative Rise Accumulation",
    question: "What is the total accumulated water volume rise over 30 years?",
    unit: "Centimeters (cm)",
    plainEnglish: "We accumulate all positive annual ocean height gains over 30 years to measure total vertical rise burden.",
    formulaSimple: "Cumulative Rise = Sum of all positive annual anomalies",
    inputData: "Time-series of annual positive anomalies",
    outputResult: "+20.0 cm accumulated rise",
    exampleNation: "Palau & Solomon Islands",
    steps: [
      "Select annual years where sea level anomaly > 0.",
      "Sum positive annual height gains over 30 years.",
      "Display total accumulated ocean height burden in cm."
    ]
  },
  {
    id: "start-end-leap",
    title: "9. Start-to-End Leap Delta",
    question: "How much did ocean height jump between 1993 and 2023?",
    unit: "Centimeters (cm)",
    plainEnglish: "The direct height difference between starting observation year (1993) and latest year (2023).",
    formulaSimple: "Leap Delta = SLA(2023) - SLA(1993)",
    inputData: "1993 initial anomaly (-5.2 cm) vs 2023 final anomaly (+14.8 cm)",
    outputResult: "+20.0 cm total leap",
    exampleNation: "Papua New Guinea",
    steps: [
      "Record starting sea level anomaly in 1993.",
      "Record ending sea level anomaly in 2023.",
      "Subtract 1993 starting level from 2023 ending level."
    ]
  },
  {
    id: "enso-correlation",
    title: "10. ENSO Climate Sensitivity (Pearson r)",
    question: "How do major climate events (El Niño / La Niña) alter sea levels?",
    unit: "Correlation (-1.0 to +1.0)",
    plainEnglish: "Measures statistical correlation between sea level anomalies and Southern Oscillation Index (SOI) phases.",
    formulaSimple: "ENSO Correlation = Pearson Correlation (SLA vs SOI)",
    inputData: "Annual SOI Index matched against territory sea level anomalies",
    outputResult: "-0.78 (Strong Inverse Sensitivity)",
    exampleNation: "Micronesia & Palau",
    steps: [
      "Record annual Southern Oscillation Index (SOI) values.",
      "Align sea level drops with major El Niño years (1997-98, 2015-16).",
      "Compute Pearson correlation coefficient r."
    ]
  },
  {
    id: "risk-score",
    title: "11. Composite Risk Index (R)",
    question: "Which Pacific nations face the highest overall climate threat?",
    unit: "Score (0–100 Risk Level)",
    plainEnglish: "We combine 4 risk factors (Rise Speed + Volatility + Acceleration + Elevation Exposure) into a 0–100 score.",
    formulaSimple: "Risk Score = 35% Speed + 25% Volatility + 20% Acceleration + 20% Elevation",
    inputData: "Normalized percentile rankings across 21 Pacific nations",
    outputResult: "89.5 Score (CRITICAL RISK LEVEL)",
    exampleNation: "Tuvalu & Kiribati",
    steps: [
      "Rank all 21 nations across speed, volatility, acceleration, and elevation.",
      "Multiply rankings by safety impact weights.",
      "Classify into Critical (≥80), High (65-79), Medium (45-64), or Low (<45)."
    ]
  },
  {
    id: "threshold-breach",
    title: "12. Threshold Breach Year",
    question: "When did a territory first breach critical height benchmarks?",
    unit: "Calendar Year (YYYY)",
    plainEnglish: "Identifies the first calendar year when a territory's sea level crossed benchmark levels (+0cm, +10cm, +20cm).",
    formulaSimple: "First Year (y*) where SLA(y*) ≥ Threshold Level",
    inputData: "Annual anomaly time series per territory",
    outputResult: "Breached +10cm in Year 2012",
    exampleNation: "Marshall Islands",
    steps: [
      "Define threshold level (+0.0 cm, +10.0 cm, or +20.0 cm).",
      "Scan time series for first year exceeding benchmark.",
      "Flag calendar year of first breach for threshold funnel."
    ]
  },
  {
    id: "yoy-budget",
    title: "13. Year-Over-Year Budget Share",
    question: "What percentage of total 30-year rise occurred in a single year?",
    unit: "Percentage (%)",
    plainEnglish: "Calculates the fractional percentage share of a single year's anomaly relative to 30-year total accumulation.",
    formulaSimple: "Budget Share (%) = (Annual Anomaly / 30-Year Sum) × 100",
    inputData: "Annual anomaly divided by sum of positive anomalies",
    outputResult: "7.8% annual rise budget share",
    exampleNation: "Fiji (2016 Peak Year)",
    steps: [
      "Sum all positive sea level anomalies over 30 years.",
      "Divide target year anomaly by 30-year total sum.",
      "Multiply by 100 to get yearly percentage share."
    ]
  },
  {
    id: "regional-clusters",
    title: "14. Sub-Regional Cluster Averages",
    question: "How do Melanesia, Micronesia, and Polynesia compare?",
    unit: "Centimeters (cm)",
    plainEnglish: "Groups 21 territories into 3 sub-regions to calculate regional mean rise trajectories.",
    formulaSimple: "Cluster Average = Mean of Member Territory Anomalies",
    inputData: "Territory groupings: Melanesia, Micronesia, Polynesia",
    outputResult: "Micronesia Mean: +10.2 cm",
    exampleNation: "Micronesia Sub-Region",
    steps: [
      "Assign each territory to Melanesia, Micronesia, or Polynesia.",
      "Compute average sea level anomaly for each cluster per year.",
      "Compare sub-regional stream graphs and distributions."
    ]
  },
  {
    id: "percentile-distributions",
    title: "15. Decadal Percentile Distributions (P10, P50, P90)",
    question: "What are the lower, median, and upper bounds of ocean rise?",
    unit: "Centimeters (cm)",
    plainEnglish: "Computes 10th percentile (lower bound), 50th percentile (median), and 90th percentile (upper bound) across monitoring stations.",
    formulaSimple: "Percentile Rank (P₁₀, P₅₀, P₉₀) of Annual Anomalies",
    inputData: "Sorted annual anomaly array across 21 stations",
    outputResult: "P₅₀ (Median): +8.5 cm, P₉₀ (Upper): +15.2 cm",
    exampleNation: "Regional Distribution Boxplot",
    steps: [
      "Order all territory anomalies for a decade from lowest to highest.",
      "Extract P10 (lowest 10%), P50 (median), and P90 (highest 10%).",
      "Chart distribution bounds to display decadal spread."
    ]
  },
  {
    id: "annual-deviation",
    title: "16. Cross-Territory Annual Dispersion",
    question: "How much did ocean rise vary across different islands each year?",
    unit: "Standard Deviation (σ_y)",
    plainEnglish: "Calculates cross-sectional standard deviation among all 21 nations for every calendar year.",
    formulaSimple: "Annual Dispersion = Standard Deviation across 21 nations in Year y",
    inputData: "21 territory anomaly values for a single year",
    outputResult: "σ₂₀₁₆ = ±4.2 cm cross-island dispersion",
    exampleNation: "Lollipop Anomaly Chart",
    steps: [
      "Collect anomaly values for all 21 nations in calendar year y.",
      "Find average anomaly across all nations for that year.",
      "Compute standard deviation (σ_y) to measure island spread."
    ]
  },
  {
    id: "nations-rising-count",
    title: "17. Nations Rising Count per Year",
    question: "How many Pacific nations experienced positive ocean rise each year?",
    unit: "Count (0 to 21 Nations)",
    plainEnglish: "Counts how many of the 21 Pacific territories recorded positive height anomalies (>0.0cm) in any calendar year.",
    formulaSimple: "Nations Rising = Count of Nations where SLA_y > 0",
    inputData: "Annual anomaly check (>0.0cm) for 21 nations",
    outputResult: "21 of 21 Nations Rising (100% in 2023)",
    exampleNation: "Rising Tide Chapter",
    steps: [
      "Evaluate anomaly level for each of 21 nations in year y.",
      "Increment count if nation's anomaly > 0.0 cm.",
      "Display total count out of 21."
    ]
  },
  {
    id: "forecasting-model",
    title: "18. Predictive Projection Model (2024–2050)",
    question: "What will ocean height levels be in 2050?",
    unit: "Centimeters (cm)",
    plainEnglish: "Extrapolates ocean rise from 2024 to 2050 using historical linear speed and acceleration parameters with confidence bounds.",
    formulaSimple: "Projected SLA(t) = SLA₂₀₂₃ + Speed × (t - 2023) + ½ Acceleration × (t - 2023)² ± 1.96σ",
    inputData: "2023 baseline level + OLS slope (v) + acceleration (a) + volatility (σ)",
    outputResult: "+19.8 cm projected mean by 2050 (+13.7cm to +25.9cm range)",
    exampleNation: "2050 Climate Forecast",
    steps: [
      "Use 2023 ending sea level anomaly as starting benchmark.",
      "Project forward using linear speed rate and quadratic acceleration.",
      "Apply ±1.96σ confidence band based on historical volatility."
    ]
  },
  {
    id: "rolling-average",
    title: "19. 5-Year Rolling Moving Average (SMA)",
    question: "How do we smooth out short-term year-to-year noise in charts?",
    unit: "Centimeters (cm)",
    plainEnglish: "Calculates a 5-year centered moving average to smooth out sudden short-term spikes and reveal long-term trends.",
    formulaSimple: "SMA(y) = (SLA_y-2 + SLA_y-1 + SLA_y + SLA_y+1 + SLA_y+2) / 5",
    inputData: "5-year window centered around year y",
    outputResult: "Smoothed trend curve line",
    exampleNation: "Time Series & Explorer Charts",
    steps: [
      "Take anomaly values for 2 years prior, target year, and 2 years ahead.",
      "Add the 5 annual anomaly values and divide by 5.",
      "Render smoothed moving average line overlay on charts."
    ]
  },
  {
    id: "relative-comparison-ratio",
    title: "20. Relative Regional Comparison Ratio (%)",
    question: "How much higher or lower is a nation's metric compared to regional average?",
    unit: "Percentage (%)",
    plainEnglish: "Compares a single territory's metric directly against the 21-nation regional benchmark average.",
    formulaSimple: "Relative Ratio (%) = ((Nation Metric / Regional Avg Metric) - 1) × 100",
    inputData: "Nation metric value vs Regional benchmark average",
    outputResult: "+62% above regional average",
    exampleNation: "Palau Cumulative Rise Stat Card",
    steps: [
      "Find mean value of metric across all 21 Pacific territories.",
      "Divide target nation's metric by regional average metric.",
      "Subtract 1 and multiply by 100 to show % shift."
    ]
  }
];

export default function HowItIsCalculatedPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCalculations = CALCULATIONS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">

      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

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
              <Calculator className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold font-serif text-slate-100 tracking-tight">
              How It's Calculated
            </h1>
          </div>
        </div>

        {/* Navigation Link to API Explorer */}
        <button
          onClick={() => setLocation("/explorer")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition shadow-sm cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>API Explorer</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-[1300px] mx-auto p-6 lg:p-10 flex flex-col gap-8">

        {/* Introduction Header */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col gap-6 shadow-md">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-100">Calculation Methodology Guide</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step-by-step guide explaining all 20 calculated metrics, formulas, and statistical transformations used in the Pacific Climate Story.
            </p>
          </div>

          {/* Neutral Cheat Sheet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60">

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Scale className="w-3.5 h-3.5" /> Heights in Centimeters (cm)
              </span>
              <span className="text-xs font-semibold text-slate-200">1 Meter = 100 cm</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Raw meter values are multiplied by 100 (<strong className="text-slate-300">+12.4 cm</strong> instead of 0.124m).
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> Rise Speed in mm/yr
              </span>
              <span className="text-xs font-semibold text-slate-200">1 Meter = 1,000 mm</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Annual rise rates use linear slope fitting expressed in mm/yr (<strong className="text-slate-300">4.84 mm/yr</strong>).
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Activity className="w-3.5 h-3.5" /> Baseline = 1993–2002
              </span>
              <span className="text-xs font-semibold text-slate-200">10-Year Reference Zero</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                The 10-year mean from 1993 to 2002 serves as the benchmark zero (<strong className="text-slate-300">0.0 cm</strong>) line.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Waves className="w-3.5 h-3.5" /> Volatility = ±cm
              </span>
              <span className="text-xs font-semibold text-slate-200">Yearly Fluctuation</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Standard deviation measures how ocean levels bounce up and down (<strong className="text-slate-300">±8.7 cm</strong>).
              </p>
            </div>

          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search calculation metrics (e.g. speed, volatility, risk)..."
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
                  <h3 className="text-lg font-bold font-serif text-slate-100">{item.title}</h3>
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
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">IN PLAIN WORDS</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.plainEnglish}
                  </p>
                </div>
              </div>

              {/* 3-Step Simple Procedure */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">CALCULATION PROCEDURE</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {item.steps.map((stepDesc, sIdx) => (
                    <div key={sIdx} className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500">STEP {sIdx + 1}</span>
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
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">FORMULA</span>
                  <div className="text-xs md:text-sm font-bold text-cyan-400 py-0.5">
                    {item.formulaSimple}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Source: {item.inputData}</span>
                </div>

                {/* Worked Example */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">EXAMPLE ({item.exampleNation})</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 font-medium">Result:</span>
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
