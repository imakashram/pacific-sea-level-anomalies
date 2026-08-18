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
        className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto"
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
          whileHover={{ y: -3, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="px-4 py-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl inline-flex items-center gap-3 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-sm font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
            Methodology & Formulas
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
        </motion.a>

        {/* Card 2: API Explorer */}
        <motion.a
          href="/api-explorer"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -3, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="px-4 py-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl inline-flex items-center gap-3 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-sm font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
            API Explorer
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
        </motion.a>

        {/* Card 3: Pacific Data Hub */}
        <motion.a
          href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -3, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="px-4 py-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl inline-flex items-center gap-3 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Database className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-sm font-bold font-serif text-slate-100 group-hover:text-cyan-300 transition-colors">
            Pacific Data Hub
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </motion.a>
      </motion.div>
    </StorySection>
  );
}
