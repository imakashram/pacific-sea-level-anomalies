import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import {
  Database,
  Calculator,
  Terminal,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export function DataMethodology() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <StorySection id="data-methodology" className="bg-[#0b0f19]/30">
      {/* Header */}
      <motion.div
        className="text-center flex flex-col items-center justify-center mb-16 border-b border-border/10 pb-8 mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" as const },
          },
        }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
          Data & Methodology
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto">
          Learn how we collected, analyzed, and used 30 years of sea level data from across the Pacific Ocean.
        </p>
      </motion.div>

      {/* Grid Content */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Left Column: Data Source */}
        <motion.div
          variants={itemVariants}
          className="p-8 bg-card/10 border border-slate-800/50 rounded-3xl backdrop-blur-md flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-100">
              Observational Dataset
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The climate story is built upon a multi-decadal time-series dataset measuring Sea Level Anomalies across the Pacific. This data is collected and managed by the <strong>Pacific Community (SPC)</strong> and made public via the <strong>Pacific Data Hub</strong>.
          </p>

          <ul className="space-y-3.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                <strong>30-Year Coverage:</strong> Consistent annual telemetry spanning from 1993 through 2023.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                <strong>21 Territories:</strong> Spatial observations representing Melanesia, Micronesia, and Polynesia.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                <strong>Baseline Reference:</strong> The first ten years of data (1993–2002) form the zero-level average baseline to evaluate changes.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Right Column: Analytical Framework */}
        <motion.div
          variants={itemVariants}
          className="p-8 bg-card/10 border border-slate-800/50 rounded-3xl backdrop-blur-md flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-100">
              Methodology & Trends
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We apply established statistical methods to transform raw telemetry data into clear, actionable climate insights. Calculations are processed on both national and regional levels.
          </p>

          <ul className="space-y-3.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                <strong>Speed Rate:</strong> Computed using Ordinary Least Squares (OLS) linear trendlines to find annual average rise in mm/year.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                <strong>Volatility:</strong> Calculated using the standard deviation (σ) of anomalies to capture annual fluctuation intensity.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                <strong>IPCC SSP Scenarios:</strong> Future projections (2024–2033) apply quadratic acceleration offsets matching low, mid, and high emission paths.
              </span>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Directory Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Card 1: Methodology */}
        <motion.a
          href="/methodology"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -6, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-4 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <Calculator className="w-6 h-6" />
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200" />
          </div>
          <div>
            <h4 className="text-lg font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
              Methodology & Formulas
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Examine detailed step-by-step math, formulas, and worked examples for all 16 calculated climate indicators.
            </p>
          </div>
        </motion.a>

        {/* Card 2: API Explorer */}
        <motion.a
          href="/api-explorer"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -6, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-4 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <Terminal className="w-6 h-6" />
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200" />
          </div>
          <div>
            <h4 className="text-lg font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
              API Explorer
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Query and extract raw, decadal, and trend analysis datasets. Fully documented endpoints with live JSON responses.
            </p>
          </div>
        </motion.a>

        {/* Card 3: Pacific Data Hub */}
        <motion.a
          href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -6, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-4 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <Database className="w-6 h-6" />
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
              Pacific Data Hub
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Visit the authoritative repository managed by the Pacific Community (SPC) to view the source telemetry.
            </p>
          </div>
        </motion.a>
      </motion.div>
    </StorySection>
  );
}
