import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Calculator, 
  TrendingUp, 
  Waves, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  Terminal,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Scale,
  Activity,
  Flame,
  PieChart,
  BarChart2,
  Calendar,
  Sparkles,
  MapPin,
  TrendingDown
} from "lucide-react";

interface CalculationCard {
  id: string;
  title: string;
  question: string;
  unit: string;
  theme: "cyan" | "emerald" | "purple" | "orange" | "rose";
  plainEnglish: string;
  formulaSimple: string;
  inputData: string;
  outputResult: string;
  exampleNation: string;
  steps: { title: string; desc: string }[];
}

const CALCULATIONS: CalculationCard[] = [
  // 1. Sea Level Anomaly
  {
    id: "sea-level-anomaly",
    title: "1. Sea Level Anomaly (SLA)",
    question: "How much higher or lower is the ocean level compared to baseline?",
    unit: "Centimeters (cm)",
    theme: "cyan",
    plainEnglish: "We take the ocean's height in any given year and compare it to the average ocean height recorded during 1993–2002.",
    formulaSimple: "Anomaly (cm) = (Ocean Height - 1993-2002 Baseline Avg) × 100",
    inputData: "Annual satellite & tidal height measurements (meters)",
    outputResult: "+12.4 cm current anomaly",
    exampleNation: "Pacific Regional Average",
    steps: [
      { title: "Find Baseline Average", desc: "Calculate mean ocean height from 1993 to 2002 (set as 0.0 cm)." },
      { title: "Compare Current Height", desc: "Subtract baseline average from current year height." },
      { title: "Convert to cm", desc: "Multiply meters by 100 to convert to centimeters (+12.4 cm)." }
    ]
  },
  // 2. Decadal Shift
  {
    id: "decade-shift",
    title: "2. Decadal Baseline Shift (Δ)",
    question: "How much has the sea level risen over 30 years?",
    unit: "Centimeters (cm)",
    theme: "emerald",
    plainEnglish: "We compare the 10-year average of the first decade (1993–2002) directly against the 10-year average of the recent decade (2014–2023).",
    formulaSimple: "Decadal Shift = (Recent 10-Year Average) - (First 10-Year Average)",
    inputData: "Decade 1 Mean (0.0 cm) vs Decade 3 Mean (+8.5 cm)",
    outputResult: "+8.5 cm regional shift",
    exampleNation: "Pacific Regional Average",
    steps: [
      { title: "Average Decade 1", desc: "Calculate mean ocean anomaly from 1993 to 2002." },
      { title: "Average Decade 3", desc: "Calculate mean ocean anomaly from 2014 to 2023." },
      { title: "Calculate Difference", desc: "Decade 3 mean minus Decade 1 mean gives total decadal shift." }
    ]
  },
  // 3. Speed Rate
  {
    id: "speed-rate",
    title: "3. Speed Rate (Linear Trend)",
    question: "How fast is the water level rising every year?",
    unit: "Millimeters per year (mm/yr)",
    theme: "cyan",
    plainEnglish: "We fit a linear regression trend line through 30 years of annual water level points to calculate yearly growth rate.",
    formulaSimple: "Speed Rate = Trend Line OLS Slope × 1000 mm/m",
    inputData: "30 annual anomaly records from 1993 to 2023",
    outputResult: "4.84 mm/yr (13% above regional average)",
    exampleNation: "Palau & Papua New Guinea",
    steps: [
      { title: "Plot Annual Heights", desc: "Chart all 30 annual water height points on a timeline." },
      { title: "Fit OLS Regression Line", desc: "Calculate slope using Ordinary Least Squares regression." },
      { title: "Express in mm/year", desc: "Multiply slope by 1,000 to get mm/year (4.84 mm/yr)." }
    ]
  },
  // 4. Anomaly Volatility
  {
    id: "volatility",
    title: "4. Volatility (Fluctuation Range)",
    question: "How unstable or jumpy are the annual ocean levels?",
    unit: "± Centimeters (±cm)",
    theme: "purple",
    plainEnglish: "Volatility measures how far ocean levels bounce up and down around their mean trend line from one year to the next.",
    formulaSimple: "Volatility = Standard Deviation (σ) of Annual Anomalies × 100",
    inputData: "Yearly variance from 30-year average line",
    outputResult: "±8.7 cm (41% above regional avg of 6.1 cm)",
    exampleNation: "Palau (Most Volatile Nation)",
    steps: [
      { title: "Calculate Average", desc: "Find 30-year average sea level height for the territory." },
      { title: "Measure Yearly Gaps", desc: "Measure how far each year's height deviates from average." },
      { title: "Compute Std Dev", desc: "Take sample standard deviation (σ) to represent typical fluctuation in ±cm." }
    ]
  },
  // 5. Decadal Acceleration
  {
    id: "acceleration",
    title: "5. Decadal Acceleration",
    question: "Is the ocean rising faster today than it was 20 years ago?",
    unit: "mm/yr²",
    theme: "orange",
    plainEnglish: "Acceleration measures whether the annual rate of rise is speeding up over time rather than staying constant.",
    formulaSimple: "Acceleration = 2 × Polynomial Fit Coefficient (c₂) × 1000",
    inputData: "Second-degree polynomial fit (SLA = c₀ + c₁t + c₂t²)",
    outputResult: "+0.24 mm/yr² (Speeding up)",
    exampleNation: "Tuvalu & Marshall Islands",
    steps: [
      { title: "Fit Quadratic Curve", desc: "Apply a 2nd-degree polynomial curve fit to detect bending." },
      { title: "Extract Coefficient c₂", desc: "Extract coefficient c₂ representing 1/2 of second derivative." },
      { title: "Determine Acceleration", desc: "Multiply by 2,000 to express acceleration in mm/yr²." }
    ]
  },
  // 6. Peak Record Anomaly
  {
    id: "peak-record",
    title: "6. Peak Anomaly Record",
    question: "What is the highest ocean level recorded in history?",
    unit: "Centimeters (+cm)",
    theme: "cyan",
    plainEnglish: "The maximum positive height anomaly recorded across all 30 years of observation for a territory.",
    formulaSimple: "Peak Record = Max(SLA₁, SLA₂, ..., SLA₃₀) × 100",
    inputData: "30 annual anomaly records for territory",
    outputResult: "Peak: +20.0 cm (Year 2008)",
    exampleNation: "Palau Peak Record",
    steps: [
      { title: "Scan Annual Values", desc: "Scan all 31 annual anomaly records from 1993 to 2023." },
      { title: "Identify Highest Value", desc: "Locate the maximum positive value." },
      { title: "Record Year & Height", desc: "Express peak height in +cm along with calendar year." }
    ]
  },
  // 7. Trough Record Anomaly
  {
    id: "trough-record",
    title: "7. Trough Anomaly Record",
    question: "What is the lowest ocean level drop recorded in history?",
    unit: "Centimeters (-cm)",
    theme: "purple",
    plainEnglish: "The lowest negative height anomaly recorded during extreme drought or El Niño phases.",
    formulaSimple: "Trough Record = Min(SLA₁, SLA₂, ..., SLA₃₀) × 100",
    inputData: "30 annual anomaly records for territory",
    outputResult: "Trough: -10.0 cm (Year 1993)",
    exampleNation: "Palau Trough Record",
    steps: [
      { title: "Scan Annual Values", desc: "Scan all 31 annual anomaly records from 1993 to 2023." },
      { title: "Identify Lowest Value", desc: "Locate the minimum negative value." },
      { title: "Record Year & Height", desc: "Express trough drop in -cm along with calendar year." }
    ]
  },
  // 8. Cumulative Rise Accumulation
  {
    id: "cumulative-rise",
    title: "8. Cumulative Rise Accumulation",
    question: "What is the total accumulated water volume rise over 30 years?",
    unit: "Centimeters (cm)",
    theme: "emerald",
    plainEnglish: "We accumulate all positive annual ocean height gains over 30 years to measure total vertical burden.",
    formulaSimple: "Cumulative Rise = Sum of all positive annual anomalies",
    inputData: "Time-series of annual positive anomalies",
    outputResult: "+20.0 cm accumulated rise",
    exampleNation: "Palau & Solomon Islands",
    steps: [
      { title: "Filter Positive Years", desc: "Select annual years where sea level anomaly > 0." },
      { title: "Sum Anomaly Gains", desc: "Add positive annual height gains over 30 years." },
      { title: "Express Total Burden", desc: "Display total accumulated ocean height burden in cm." }
    ]
  },
  // 9. Start-to-End Leap Delta
  {
    id: "start-end-leap",
    title: "9. Start-to-End Leap Delta",
    question: "How much did ocean height jump between 1993 and 2023?",
    unit: "Centimeters (cm)",
    theme: "emerald",
    plainEnglish: "The direct height difference between the starting year of observations (1993) and the latest ending year (2023).",
    formulaSimple: "Leap Delta = SLA(2023) - SLA(1993)",
    inputData: "Initial anomaly in 1993 (-5.2 cm) vs Final anomaly in 2023 (+14.8 cm)",
    outputResult: "+20.0 cm total leap",
    exampleNation: "Papua New Guinea",
    steps: [
      { title: "Extract 1993 Value", desc: "Record the starting sea level anomaly in 1993." },
      { title: "Extract 2023 Value", desc: "Record the ending sea level anomaly in 2023." },
      { title: "Calculate Leap Delta", desc: "Subtract 1993 starting level from 2023 ending level." }
    ]
  },
  // 10. ENSO Climate Correlation
  {
    id: "enso-correlation",
    title: "10. ENSO Climate Sensitivity (Pearson r)",
    question: "How do major climate events (El Niño / La Niña) alter sea levels?",
    unit: "Correlation (-1.0 to +1.0)",
    theme: "orange",
    plainEnglish: "Measures statistical synchrony between sea level anomalies and Southern Oscillation Index (SOI) phases.",
    formulaSimple: "ENSO Correlation = Pearson Correlation (SLA vs SOI)",
    inputData: "Annual SOI Index matched against territory sea level anomalies",
    outputResult: "-0.78 (Strong Inverse Sensitivity)",
    exampleNation: "Micronesia & Palau",
    steps: [
      { title: "Track ENSO Index", desc: "Record annual Southern Oscillation Index (SOI) values." },
      { title: "Overlay Sea Levels", desc: "Align sea level drops with major El Niño years (1997-98, 2015-16)." },
      { title: "Compute Pearson r", desc: "Scores near -1.0 indicate strong sea level drops during El Niño." }
    ]
  },
  // 11. Composite Risk Index
  {
    id: "risk-score",
    title: "11. Composite Risk Index (R)",
    question: "Which Pacific nations face the highest overall climate threat?",
    unit: "Score (0–100 Risk Level)",
    theme: "rose",
    plainEnglish: "We combine 4 risk factors (Rise Speed + Volatility + Acceleration + Low Elevation) into a single 0–100 risk score.",
    formulaSimple: "Risk Score = 35% Rise Speed + 25% Volatility + 20% Acceleration + 20% Elevation",
    inputData: "Normalized percentile rankings across all 21 Pacific nations",
    outputResult: "89.5 Score (CRITICAL RISK LEVEL)",
    exampleNation: "Tuvalu & Kiribati",
    steps: [
      { title: "Rank Territories", desc: "Rank all 21 nations across speed, volatility, acceleration, and elevation." },
      { title: "Apply Weights", desc: "Multiply rankings by safety impact weights (35% speed, 25% volatility, etc.)." },
      { title: "Assign Category", desc: "Classify into Critical (≥80), High (65-79), Medium (45-64), or Low (<45)." }
    ]
  },
  // 12. Threshold Breach Year
  {
    id: "threshold-breach",
    title: "12. Threshold Breach Year",
    question: "When did a territory first breach critical height benchmarks?",
    unit: "Calendar Year (YYYY)",
    theme: "rose",
    plainEnglish: "Identifies the first calendar year when a territory's sea level anomaly permanently crossed threshold levels (+0cm, +10cm, +20cm).",
    formulaSimple: "First Year (y*) where SLA(y*) ≥ Threshold Level",
    inputData: "Annual anomaly time series per territory",
    outputResult: "Breached +10cm in Year 2012",
    exampleNation: "Marshall Islands",
    steps: [
      { title: "Set Benchmark Threshold", desc: "Define threshold level (+0.0 cm, +10.0 cm, or +20.0 cm)." },
      { title: "Scan Time Series", desc: "Find first year where annual anomaly exceeds benchmark." },
      { title: "Record Breach Year", desc: "Flag calendar year of first breach for threshold funnel charts." }
    ]
  },
  // 13. Year-Over-Year Budget Share
  {
    id: "yoy-budget",
    title: "13. Year-Over-Year Budget Share",
    question: "What percentage of total 30-year rise occurred in a single year?",
    unit: "Percentage (%)",
    theme: "purple",
    plainEnglish: "Calculates the fractional percentage share of a single year's anomaly relative to 30-year total accumulation.",
    formulaSimple: "Budget Share (%) = (Annual Anomaly / 30-Year Sum) × 100",
    inputData: "Annual anomaly divided by sum of all positive anomalies",
    outputResult: "7.8% annual rise budget share",
    exampleNation: "Fiji (2016 Peak Year)",
    steps: [
      { title: "Calculate Total Sum", desc: "Sum all positive sea level anomalies over 30 years." },
      { title: "Divide Annual Anomaly", desc: "Divide target year anomaly by 30-year total sum." },
      { title: "Express as Percentage", desc: "Multiply by 100 to get fractional yearly budget share." }
    ]
  },
  // 14. Sub-Regional Group Averages
  {
    id: "regional-clusters",
    title: "14. Sub-Regional Cluster Averages",
    question: "How do Melanesia, Micronesia, and Polynesia compare?",
    unit: "Centimeters (cm)",
    theme: "cyan",
    plainEnglish: "Groups 21 territories into 3 sub-regions to calculate regional mean rise trajectories.",
    formulaSimple: "Cluster Average = Mean of Member Territory Anomalies",
    inputData: "Territory groupings: Melanesia, Micronesia, Polynesia",
    outputResult: "Micronesia Mean: +10.2 cm",
    exampleNation: "Micronesia Sub-Region",
    steps: [
      { title: "Group Nations by Region", desc: "Assign each territory to Melanesia, Micronesia, or Polynesia." },
      { title: "Calculate Regional Means", desc: "Compute average sea level anomaly for each cluster per year." },
      { title: "Compare Trends", desc: "Chart sub-regional stream graphs and donut share distributions." }
    ]
  },
  // 15. Decadal Percentile Distributions
  {
    id: "percentile-distributions",
    title: "15. Decadal Percentile Distributions (P10, P50, P90)",
    question: "What are the lower, median, and upper bounds of ocean rise?",
    unit: "Centimeters (cm)",
    theme: "purple",
    plainEnglish: "Computes 10th percentile (lower bound), 50th percentile (median), and 90th percentile (upper bound) across monitoring stations.",
    formulaSimple: "Percentile Rank (P₁₀, P₅₀, P₉₀) of Annual Anomalies",
    inputData: "Sorted annual anomaly array across 21 stations",
    outputResult: "P₅₀ (Median): +8.5 cm, P₉₀ (Upper): +15.2 cm",
    exampleNation: "Regional Distribution Boxplot",
    steps: [
      { title: "Sort Anomaly Values", desc: "Order all territory anomalies for a decade from lowest to highest." },
      { title: "Extract Percentiles", desc: "Extract P10 (lowest 10%), P50 (median), and P90 (highest 10%)." },
      { title: "Chart Boxplot Range", desc: "Use distribution bounds to display decadal spread." }
    ]
  },
  // 16. Annual Cross-Territory Variance
  {
    id: "annual-deviation",
    title: "16. Cross-Territory Annual Dispersion",
    question: "How much did ocean rise vary across different islands each year?",
    unit: "Standard Deviation (σ_y)",
    theme: "purple",
    plainEnglish: "Calculates the cross-sectional standard deviation among all 21 nations for every calendar year.",
    formulaSimple: "Annual Dispersion = Standard Deviation across 21 nations in Year y",
    inputData: "21 territory anomaly values for a single year",
    outputResult: "σ₂₀₁₆ = ±4.2 cm cross-island dispersion",
    exampleNation: "Lollipop Anomaly Chart",
    steps: [
      { title: "Gather Yearly Values", desc: "Collect anomaly values for all 21 nations in calendar year y." },
      { title: "Compute Cross-Section Mean", desc: "Find average anomaly across all nations for that year." },
      { title: "Calculate Std Dev", desc: "Compute standard deviation (σ_y) to measure cross-island spread." }
    ]
  },
  // 17. Nations Rising Count per Year
  {
    id: "nations-rising-count",
    title: "17. Nations Rising Count per Year",
    question: "How many Pacific nations experienced positive ocean rise each year?",
    unit: "Count (0 to 21 Nations)",
    theme: "emerald",
    plainEnglish: "Counts how many of the 21 Pacific territories recorded positive height anomalies (>0.0cm) in any given calendar year.",
    formulaSimple: "Nations Rising = Count of Nations where SLA_y > 0",
    inputData: "Annual anomaly check (>0.0cm) for 21 nations",
    outputResult: "21 of 21 Nations Rising (100% in 2023)",
    exampleNation: "Rising Tide Chapter",
    steps: [
      { title: "Check Annual Anomalies", desc: "Evaluate anomaly level for each of the 21 nations in year y." },
      { title: "Count Positive Anomalies", desc: "Increment count if nation's anomaly > 0.0 cm." },
      { title: "Express Total Count", desc: "Display count out of 21 (e.g. 21/21 nations rising in recent years)." }
    ]
  },
  // 18. Predictive Projection Model (2024–2050)
  {
    id: "forecasting-model",
    title: "18. Predictive Projection Model (2024–2050)",
    question: "What will ocean height levels be in 2050?",
    unit: "Centimeters (cm)",
    theme: "orange",
    plainEnglish: "Extrapolates ocean rise from 2024 to 2050 using historical linear speed and acceleration parameters with confidence bounds.",
    formulaSimple: "Projected SLA(t) = SLA₂₀₂₃ + Speed × (t - 2023) + ½ Acceleration × (t - 2023)² ± 1.96σ",
    inputData: "2023 baseline level + OLS slope (v) + acceleration (a) + volatility (σ)",
    outputResult: "+19.8 cm projected mean by 2050 (+13.7cm to +25.9cm range)",
    exampleNation: "2050 Climate Forecast",
    steps: [
      { title: "Set 2023 Starting Point", desc: "Use 2023 ending sea level anomaly as starting benchmark." },
      { title: "Apply Linear & Curved Growth", desc: "Project forward using linear speed rate and quadratic acceleration." },
      { title: "Add 95% Confidence Band", desc: "Apply ±1.96σ confidence band based on historical volatility." }
    ]
  },
  // 19. 5-Year Rolling Moving Average (SMA)
  {
    id: "rolling-average",
    title: "19. 5-Year Rolling Moving Average (SMA)",
    question: "How do we smooth out short-term year-to-year noise in charts?",
    unit: "Centimeters (cm)",
    theme: "cyan",
    plainEnglish: "Calculates a 5-year centered moving average to smooth out sudden short-term spikes and reveal underlying long-term trends.",
    formulaSimple: "SMA(y) = (SLA_y-2 + SLA_y-1 + SLA_y + SLA_y+1 + SLA_y+2) / 5",
    inputData: "5-year window centered around year y",
    outputResult: "Smoothed trend curve line",
    exampleNation: "Time Series & Explorer Charts",
    steps: [
      { title: "Define 5-Year Window", desc: "Take anomaly values for 2 years prior, target year, and 2 years ahead." },
      { title: "Calculate Window Mean", desc: "Add the 5 annual anomaly values and divide by 5." },
      { title: "Plot Smooth Line", desc: "Render smoothed moving average line overlay on charts." }
    ]
  },
  // 20. Relative Regional Comparison Ratio (%)
  {
    id: "relative-comparison-ratio",
    title: "20. Relative Regional Comparison Ratio (%)",
    question: "How much higher or lower is a nation's metric compared to the regional average?",
    unit: "Percentage (%)",
    theme: "emerald",
    plainEnglish: "Compares a single territory's metric (e.g. cumulative rise or speed rate) directly against the 21-nation regional benchmark average.",
    formulaSimple: "Relative Ratio (%) = ((Nation Metric / Regional Avg Metric) - 1) × 100",
    inputData: "Nation metric value vs Regional benchmark average",
    outputResult: "+62% above regional average (12.4 cm vs 7.6 cm)",
    exampleNation: "Palau Cumulative Rise Stat Card",
    steps: [
      { title: "Calculate Regional Average", desc: "Find mean value of metric across all 21 Pacific territories." },
      { title: "Divide Nation Metric", desc: "Divide target nation's metric by regional average metric." },
      { title: "Express Percentage Shift", desc: "Subtract 1 and multiply by 100 to show % above/below average." }
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

  const themeClasses = {
    cyan: {
      badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      card: "hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.04)]",
      accent: "text-cyan-400",
      box: "bg-cyan-950/20 border-cyan-500/20"
    },
    emerald: {
      badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      card: "hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.04)]",
      accent: "text-emerald-400",
      box: "bg-emerald-950/20 border-emerald-500/20"
    },
    purple: {
      badge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      card: "hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.04)]",
      accent: "text-purple-400",
      box: "bg-purple-950/20 border-purple-500/20"
    },
    orange: {
      badge: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      card: "hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(249,115,22,0.04)]",
      accent: "text-orange-400",
      box: "bg-orange-950/20 border-orange-500/20"
    },
    rose: {
      badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      card: "hover:border-rose-500/40 hover:shadow-[0_0_25px_rgba(244,63,94,0.04)]",
      accent: "text-rose-400",
      box: "bg-rose-950/20 border-rose-500/20"
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

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
      <main className="max-w-[1400px] mx-auto p-6 lg:p-10 flex flex-col gap-10">
        
        {/* Simple Guide Introduction Header */}
        <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-3xl flex flex-col gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-100">Complete Master Calculation Index (20 Metrics)</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Comprehensive guide covering all 20 calculated data points, formulas, smoothing algorithms, baseline transformations, and statistical models used across the entire Pacific Climate Story project.
              </p>
            </div>
          </div>

          {/* Quick Cheat Sheet Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/50">
            
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Heights in Centimeters (cm)
              </span>
              <span className="text-xs font-semibold text-slate-200">1 Meter = 100 cm</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                We multiply raw meter anomalies by 100 so height numbers look like <strong className="text-slate-300">+12.4 cm</strong> instead of 0.124m.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Rise Speed in mm/yr
              </span>
              <span className="text-xs font-semibold text-slate-200">1 Meter = 1,000 mm</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Annual rise rates use linear slope fitting expressed in millimeters per year (<strong className="text-slate-300">4.84 mm/yr</strong>).
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Baseline = 1993–2002
              </span>
              <span className="text-xs font-semibold text-slate-200">10-Year Reference Zero</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                The average sea level during 1993–2002 serves as the benchmark zero (<strong className="text-slate-300">0.0 cm</strong>) line.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5" /> Volatility = ±cm
              </span>
              <span className="text-xs font-semibold text-slate-200">Yearly Fluctuation Range</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Standard deviation measures how much water heights bounce up and down each year (<strong className="text-slate-300">±8.7 cm</strong> in Palau).
              </p>
            </div>

          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search all 20 calculated metrics (e.g. peak, trough, speed, moving avg)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-foreground focus:outline-none focus:border-cyan-500/40 transition shadow-inner"
          />
        </div>

        {/* Calculation Cards Stack */}
        <div className="flex flex-col gap-8">
          {filteredCalculations.map((item) => {
            const theme = themeClasses[item.theme];
            return (
              <div 
                key={item.id}
                className={`bg-slate-900/20 border border-slate-800/80 p-6 lg:p-8 rounded-3xl flex flex-col gap-6 transition-all duration-300 shadow-xl ${theme.card}`}
              >
                {/* Card Top Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-xl font-bold font-serif text-slate-100">{item.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="italic">{item.question}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold self-start sm:self-auto ${theme.badge}`}>
                    Unit: {item.unit}
                  </span>
                </div>

                {/* Plain-English Explanation Banner */}
                <div className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-2xl flex items-start gap-3">
                  <BookOpen className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme.accent}`} />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">IN PLAIN WORDS</span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {item.plainEnglish}
                    </p>
                  </div>
                </div>

                {/* 3-Step Visual Process */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">HOW IT WORKS IN 3 STEPS</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.steps.map((step, sIdx) => (
                      <div key={sIdx} className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500">STEP {sIdx + 1}</span>
                          <CheckCircle className={`w-3.5 h-3.5 ${theme.accent}`} />
                        </div>
                        <span className="text-xs font-bold text-slate-200">{step.title}</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simple Formula & Worked Example Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Formula Box */}
                  <div className={`p-5 rounded-2xl border flex flex-col gap-2 font-mono ${theme.box}`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">MATH FORMULA</span>
                    <div className={`text-sm md:text-base font-bold py-1 ${theme.accent}`}>
                      {item.formulaSimple}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Source data: {item.inputData}</span>
                  </div>

                  {/* Worked Example */}
                  <div className="bg-slate-950/50 border border-slate-800/60 p-5 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">REAL DATA EXAMPLE ({item.exampleNation})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-semibold">Calculated Result:</span>
                      <span className={`px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs font-bold ${theme.accent}`}>
                        {item.outputResult}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
