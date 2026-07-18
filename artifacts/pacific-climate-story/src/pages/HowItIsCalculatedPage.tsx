import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Calculator, 
  TrendingUp, 
  Waves, 
  AlertTriangle, 
  Layers, 
  Sliders, 
  BookOpen, 
  CheckCircle2, 
  Database,
  FunctionSquare,
  Sparkles,
  Info,
  Terminal
} from "lucide-react";

interface CalculationFormula {
  id: string;
  title: string;
  category: "baseline" | "trends" | "volatility" | "enso" | "risk" | "forecasting";
  unit: string;
  summary: string;
  formulaTex: string;
  parameters: { symbol: string; description: string }[];
  steps: string[];
  workedExample: {
    entity: string;
    inputs: string;
    result: string;
    explanation: string;
  };
}

const FORMULAS: CalculationFormula[] = [
  // Baseline & Units
  {
    id: "sea-level-anomaly",
    title: "1. Sea Level Anomaly (SLA)",
    category: "baseline",
    unit: "Centimeters (cm)",
    summary: "Measures how much the sea surface height deviates from the 10-year historical baseline (1993–2002).",
    formulaTex: "SLA_y = h_y - \\bar{h}_{1993-2002}",
    parameters: [
      { symbol: "SLA_y", description: "Sea level anomaly value for calendar year y" },
      { symbol: "h_y", description: "Observed mean annual sea surface height in year y" },
      { symbol: "\\bar{h}_{1993-2002}", description: "Mean sea surface height during baseline decade (1993–2002)" }
    ],
    steps: [
      "Compute baseline average height across all Pacific stations from 1993 to 2002.",
      "Subtract baseline average from each annual observed height.",
      "Convert raw meter values to centimeters: SLA_cm = SLA_m × 100."
    ],
    workedExample: {
      entity: "Palau (2023)",
      inputs: "Observed height anomaly in raw meters = +0.200m",
      result: "+20.0 cm",
      explanation: "0.200m × 100 = +20.0cm above historical baseline average."
    }
  },
  {
    id: "decadal-shift",
    title: "2. Decadal Baseline Shift (Δ)",
    category: "trends",
    unit: "Centimeters (cm)",
    summary: "Calculates the net mean sea level increase between Decade 1 (1993–2002) and Decade 3 (2014–2023).",
    formulaTex: "\\Delta_{1 \\rightarrow 3} = \\bar{SLA}_{Decade 3} - \\bar{SLA}_{Decade 1}",
    parameters: [
      { symbol: "\\Delta_{1 \\rightarrow 3}", description: "Net decadal shift between baseline and recent decade" },
      { symbol: "\\bar{SLA}_{Decade 3}", description: "Average anomaly across 2014–2023 (+8.5cm regional avg)" },
      { symbol: "\\bar{SLA}_{Decade 1}", description: "Average anomaly across 1993–2002 (0.0cm baseline avg)" }
    ],
    steps: [
      "Calculate 10-year arithmetic mean of annual anomalies for Decade 1 (1993–2002).",
      "Calculate 10-year arithmetic mean of annual anomalies for Decade 3 (2014–2023).",
      "Subtract Decade 1 mean from Decade 3 mean."
    ],
    workedExample: {
      entity: "Regional Pacific Average",
      inputs: "Decade 3 Mean = +8.5cm, Decade 1 Mean = 0.0cm",
      result: "+8.5 cm",
      explanation: "The regional average ocean height in 2014–2023 was +8.5cm higher than in 1993–2002."
    }
  },
  {
    id: "linear-speed-rate",
    title: "3. Rate of Rise / Speed Rate (Linear Slope)",
    category: "trends",
    unit: "Millimeters per year (mm/yr)",
    summary: "Determines the constant rate of annual ocean rise using Ordinary Least Squares (OLS) linear regression.",
    formulaTex: "v = \\frac{\\sum_{i=1}^N (t_i - \\bar{t})(SLA_i - \\overline{SLA})}{\\sum_{i=1}^N (t_i - \\bar{t})^2} \\times 1000",
    parameters: [
      { symbol: "v", description: "Linear trend velocity rate in mm/year" },
      { symbol: "t_i", description: "Time variable in years (t = 1993, 1994, ..., 2023)" },
      { symbol: "SLA_i", description: "Observed sea level anomaly in year i (meters)" },
      { symbol: "1000", description: "Scale multiplier converting meters/year to mm/year" }
    ],
    steps: [
      "Compute mean year (t̄ = 2008) and mean anomaly (SLĀ).",
      "Calculate covariance of time and anomaly divided by time variance.",
      "Multiply resultant slope coefficient by 1,000 to convert to mm/year."
    ],
    workedExample: {
      entity: "Papua New Guinea",
      inputs: "OLS Slope = +0.00540 m/year",
      result: "+5.40 mm/yr",
      explanation: "Water levels have risen at an average rate of 5.40 mm every year over 30 years (+26% above regional average of 4.28 mm/yr)."
    }
  },
  {
    id: "volatility-sd",
    title: "4. Anomaly Volatility (Standard Deviation σ)",
    category: "volatility",
    unit: "Centimeters (±cm)",
    summary: "Quantifies year-to-year water level instability and wave oscillation range around the mean trend.",
    formulaTex: "\\sigma = \\sqrt{\\frac{1}{N-1} \\sum_{i=1}^N (SLA_i - \\overline{SLA})^2} \\times 100",
    parameters: [
      { symbol: "\\sigma", description: "Sample standard deviation of annual anomalies (cm)" },
      { symbol: "N", description: "Total number of observation years (N = 31)" },
      { symbol: "SLA_i", description: "Annual anomaly in year i" },
      { symbol: "\\overline{SLA}", description: "30-year mean anomaly for the territory" }
    ],
    steps: [
      "Find 30-year average anomaly for the nation.",
      "Calculate squared difference of each annual anomaly from the mean.",
      "Sum squared differences, divide by N - 1 (30), take square root, and scale by 100."
    ],
    workedExample: {
      entity: "Palau",
      inputs: "Sample variance = 0.00753 m²",
      result: "±8.7 cm",
      explanation: "Palau experiences extreme annual fluctuations of ±8.7cm (+41% above regional avg of 6.1cm), driven by ENSO trade wind shifts."
    }
  },
  {
    id: "acceleration-rate",
    title: "5. Acceleration Coefficient",
    category: "volatility",
    unit: "Millimeters per year squared (mm/yr²)",
    summary: "Measures whether the rate of sea level rise is accelerating or decelerating by fitting a second-degree polynomial.",
    formulaTex: "SLA(t) = c + v \\cdot t + \\frac{1}{2} a \\cdot t^2 \\implies a = 2 \\times c_2 \\times 1000",
    parameters: [
      { symbol: "a", description: "Acceleration coefficient in mm/yr²" },
      { symbol: "c_2", description: "Second-order polynomial fit coefficient" },
      { symbol: "t", description: "Time relative to baseline (t = year - 1993)" }
    ],
    steps: [
      "Perform quadratic regression SLA = c0 + c1·t + c2·t².",
      "Extract c2 coefficient representing half of second-derivative d²SLA/dt².",
      "Multiply c2 by 2,000 to express acceleration rate in mm/yr²."
    ],
    workedExample: {
      entity: "Tuvalu",
      inputs: "Quadratic coefficient c2 = 0.00012 m/yr²",
      result: "+0.24 mm/yr²",
      explanation: "Positive acceleration indicates the speed of rising seas is gaining momentum each decade."
    }
  },
  {
    id: "enso-correlation",
    title: "6. ENSO Climate Correlation (Pearson r)",
    category: "enso",
    unit: "Correlation Coefficient (-1.0 to +1.0)",
    summary: "Measures the statistical synchrony between sea level anomalies and Southern Oscillation Index (SOI) phases.",
    formulaTex: "r = \\frac{\\sum_{i=1}^N (SLA_i - \\overline{SLA})(SOI_i - \\overline{SOI})}{\\sqrt{\\sum_{i=1}^N (SLA_i - \\overline{SLA})^2} \\sqrt{\\sum_{i=1}^N (SOI_i - \\overline{SOI})^2}}",
    parameters: [
      { symbol: "r", description: "Pearson product-moment correlation coefficient" },
      { symbol: "SOI_i", description: "Annual Southern Oscillation Index value" },
      { symbol: "SLA_i", description: "Annual sea level anomaly" }
    ],
    steps: [
      "Calculate cross-covariance between annual SOI indices and territory anomalies.",
      "Normalize by the product of individual standard deviations.",
      "Result ranges from -1.0 (strong inverse relation) to +1.0 (strong direct relation)."
    ],
    workedExample: {
      entity: "Micronesia (ENSO Sensitivity)",
      inputs: "Covariance = -0.042, SOI StdDev = 1.12, SLA StdDev = 0.052",
      result: "-0.78",
      explanation: "Strong negative correlation indicates ocean levels drop significantly during El Niño phases and surge during La Niña."
    }
  },
  {
    id: "cumulative-rise",
    title: "7. Cumulative Rise Accumulation",
    category: "trends",
    unit: "Centimeters (cm)",
    summary: "Calculates total net accumulated water volume rise over the 30-year observation span.",
    formulaTex: "H_{cum} = \\sum_{y=1993}^{2023} \\max(0, SLA_y)",
    parameters: [
      { symbol: "H_{cum}", description: "Total accumulated sea level rise (cm)" },
      { symbol: "SLA_y", description: "Positive anomaly recorded in year y" }
    ],
    steps: [
      "Sum positive annual anomalies from 1993 to 2023.",
      "Converts annual shifts into total vertical accumulated burden."
    ],
    workedExample: {
      entity: "Palau Peak Record",
      inputs: "Sum of positive anomaly accumulation over 30 years",
      result: "+20.0 cm",
      explanation: "Palau recorded a cumulative peak anomaly breach of +20.0cm above baseline."
    }
  },
  {
    id: "risk-scoring-index",
    title: "8. Composite Climate Risk Index (R)",
    category: "risk",
    unit: "Risk Score (0–100)",
    summary: "Evaluates multi-criteria vulnerability index combining rate of rise, volatility, decadal acceleration, and low-elevation exposure.",
    formulaTex: "R = 0.35 \\cdot V_{rate} + 0.25 \\cdot V_{vol} + 0.20 \\cdot V_{accel} + 0.20 \\cdot V_{elev}",
    parameters: [
      { symbol: "R", description: "Composite Risk Score (0 = Lowest Risk, 100 = Critical Risk)" },
      { symbol: "V_{rate}", description: "Normalized score of linear rise speed (0–100)" },
      { symbol: "V_{vol}", description: "Normalized score of anomaly volatility (0–100)" },
      { symbol: "V_{accel}", description: "Normalized score of decadal acceleration (0–100)" },
      { symbol: "V_{elev}", description: "Normalized score of territorial elevation vulnerability (0–100)" }
    ],
    steps: [
      "Normalize each sub-metric to a 0–100 percentile rank across all 21 Pacific territories.",
      "Apply weighted sum formula with risk factor weights.",
      "Categorize: Critical (R ≥ 80), High (65 ≤ R < 80), Medium (45 ≤ R < 65), Low (R < 45)."
    ],
    workedExample: {
      entity: "Tuvalu Risk Classification",
      inputs: "V_rate = 85, V_vol = 90, V_accel = 88, V_elev = 95",
      result: "89.5 (CRITICAL RISK)",
      explanation: "Extreme low elevation combined with accelerated rise places Tuvalu at top Critical Risk."
    }
  },
  {
    id: "forecasting-model",
    title: "9. Predictive Projection Model (2024–2050)",
    category: "forecasting",
    unit: "Centimeters (cm)",
    summary: "Extrapolates ocean rise trajectories from 2024 to 2050 using historical linear speed and acceleration parameters with confidence bounds.",
    formulaTex: "SLA(t) = SLA_{2023} + v \\cdot (t - 2023) + \\frac{1}{2} a \\cdot (t - 2023)^2 \\pm 1.96 \\sigma",
    parameters: [
      { symbol: "SLA(t)", description: "Projected anomaly in target year t (2024 to 2050)" },
      { symbol: "SLA_{2023}", description: "Baseline anomaly level at end of dataset (2023)" },
      { symbol: "v", description: "Linear trend velocity (mm/yr)" },
      { symbol: "a", description: "Acceleration coefficient (mm/yr²)" },
      { symbol: "1.96 \\sigma", description: "95% statistical confidence interval band based on historical volatility" }
    ],
    steps: [
      "Take 2023 ending anomaly level as starting point.",
      "Project forward using linear speed rate v.",
      "Add quadratic acceleration term 1/2 a t².",
      "Compute upper (+1.96σ) and lower (-1.96σ) risk envelopes."
    ],
    workedExample: {
      entity: "2050 Regional Projection",
      inputs: "Target year t = 2050 (27 years ahead), v = 4.28 mm/yr, a = 0.15 mm/yr²",
      result: "+19.8 cm (Range: +13.7cm to +25.9cm)",
      explanation: "By 2050, regional average sea level anomalies are projected to reach ~20cm above 1993 baseline."
    }
  }
];

export default function HowItIsCalculatedPage() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<"all" | "baseline" | "trends" | "volatility" | "enso" | "risk" | "forecasting">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFormulas = FORMULAS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.formulaTex.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryIcons = {
    all: <FunctionSquare className="w-3.5 h-3.5" />,
    baseline: <Database className="w-3.5 h-3.5" />,
    trends: <TrendingUp className="w-3.5 h-3.5" />,
    volatility: <Waves className="w-3.5 h-3.5" />,
    enso: <Layers className="w-3.5 h-3.5" />,
    risk: <AlertTriangle className="w-3.5 h-3.5" />,
    forecasting: <Sparkles className="w-3.5 h-3.5" />
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Ambient background glows */}
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

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto p-6 lg:p-10 flex flex-col gap-8">
        
        {/* Intro Hero Box */}
        <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-100">Mathematical Formulas & Data Transformations</h2>
              <p className="text-xs text-slate-400 mt-1">
                Complete guide detailing how every sea level anomaly metric, trend slope, volatility range, and risk index in this project is calculated from raw station observations.
              </p>
            </div>
          </div>

          {/* Key Standard Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 pt-4 border-t border-slate-800/40 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Height Standard (cm)</span>
                <span className="text-[11px] text-slate-400">All anomalies & decadal cumulative rises are expressed in centimeters (cm).</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Velocity Standard (mm/yr)</span>
                <span className="text-[11px] text-slate-400">Rate of rise speeds are calculated using OLS linear regression in mm/year.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Baseline Period (1993–2002)</span>
                <span className="text-[11px] text-slate-400">First decade mean serves as reference benchmark 0.0cm across 21 territories.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", "baseline", "trends", "volatility", "enso", "risk", "forecasting"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeCategory === cat 
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold" 
                    : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                {categoryIcons[cat]}
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500/40 transition"
            />
          </div>
        </div>

        {/* Formula Cards List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredFormulas.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900/20 border border-slate-800/80 hover:border-slate-700/80 p-6 rounded-2xl flex flex-col gap-5 transition shadow-lg group"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">{item.category.toUpperCase()}</span>
                  <h3 className="text-xl font-bold font-serif text-slate-100">{item.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono self-start sm:self-auto">
                  Unit: <span className="text-cyan-400 font-bold">{item.unit}</span>
                </span>
              </div>

              {/* Summary */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.summary}
              </p>

              {/* Mathematical Formula Box */}
              <div className="bg-[#03050c] border border-cyan-500/20 p-5 rounded-xl flex flex-col gap-2 font-mono shadow-inner relative overflow-x-auto">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400/80">FORMULA</span>
                <div className="text-lg md:text-xl font-bold text-cyan-300 py-1 tracking-wide selection:bg-cyan-500/20 selection:text-cyan-200">
                  {item.formulaTex}
                </div>
              </div>

              {/* Parameters Breakdown Grid */}
              <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Parameter Variables</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {item.parameters.map((param, idx) => (
                    <div key={idx} className="flex flex-col bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="font-mono text-xs font-bold text-cyan-400">{param.symbol}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Procedure & Worked Example */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Steps */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Calculation Steps
                  </span>
                  <ul className="flex flex-col gap-2 text-xs text-slate-300">
                    {item.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/40">
                        <span className="font-mono text-cyan-400 font-bold text-[11px] mt-0.5">{sIdx + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Worked Example Card */}
                <div className="flex flex-col gap-2.5 bg-cyan-950/10 border border-cyan-500/20 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" /> Worked Example
                  </span>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <span className="font-semibold text-slate-200">{item.workedExample.entity}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.workedExample.inputs}</span>
                    <div className="my-1 py-1 px-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 font-mono font-bold text-sm inline-block self-start">
                      Result: {item.workedExample.result}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "{item.workedExample.explanation}"
                    </p>
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
