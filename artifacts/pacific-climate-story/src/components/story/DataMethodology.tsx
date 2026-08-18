import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import {
  Database,
  Calculator,
  Terminal,
  ExternalLink,
  ChevronRight,
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
