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
    <StorySection id="data-methodology" className="bg-[#0b0f19]/30 min-h-fit pb-6 md:pb-8">
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
          A transparent look at the calculations, data structures, and methodology behind our sea-level rise analysis.
        </p>
      </motion.div>

      {/* About the Project */}
      <motion.div
        className="max-w-2xl mx-auto mb-8 text-center flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-xs font-semibold text-cyan-500/80 uppercase tracking-wider">
          About the Project
        </span>
        <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xl">
          This project is an interactive climate data visualization exploring sea level anomalies across the Pacific Island Countries and Territories (PICTs). It is built using <span className="font-semibold text-slate-200">React</span>, <span className="font-semibold text-slate-200">Tailwind CSS</span>, <span className="font-semibold text-slate-200">Framer Motion</span>, <span className="font-semibold text-slate-200">Recharts</span>, and <span className="font-semibold text-slate-200">D3.js</span> for the interactive visualizations and storytelling, supported by an <span className="font-semibold text-slate-200">Express.js</span> API backend. Built for the{" "}
          <a
            href="https://pacificdatavizchallenge.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-colors duration-200"
          >
            Pacific Dataviz Challenge 2026
          </a>
          , this project uses Pacific climate data to create an interactive visual story. The source code is available on{" "}
          <a
            href="https://github.com/imakashram/pacific-sea-level-anomalies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-colors duration-200"
          >
            GitHub
          </a>
          .
        </p>
      </motion.div>

      {/* AI Disclosure */}
      <motion.div
        className="max-w-2xl mx-auto mb-6 text-center flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-xs font-semibold text-cyan-500/80 uppercase tracking-wider">
          AI Disclosure
        </span>
        <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xl">
          This project was developed with assistance from{" "}
          <a
            href="https://antigravity.google"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-colors duration-200"
          >
            Antigravity
          </a>{" "}
          with{" "}
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-colors duration-200"
          >
            Google Gemini
          </a>{" "}
          for code support, technical exploration, and design assistance. The concept, visual storytelling, data visualization, interaction design, and creative direction were independently developed by the author. All AI-assisted outputs were reviewed and refined by the author.
        </p>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="max-w-2xl mx-auto mb-10 text-center flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
          Disclaimer
        </span>
        <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xl">
          This project is for educational and informational purposes only. The visualizations and analysis use publicly available data from the{" "}
          <a
            href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500/80 hover:text-amber-400 underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400/60 transition-colors duration-200"
          >
            Pacific Data Hub [Sea level anomalies]
          </a>{" "}
          to help understand Pacific climate trends. While care has been taken to ensure accuracy, there may be errors or limitations. This project is not an official scientific, policy, or forecasting source.
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
        {/* Card 1: Pacific Data Hub */}
        <motion.a
          href="https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -2, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="px-3 py-1.5 bg-slate-900/40 border border-slate-800/80 rounded-lg inline-flex items-center gap-2 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
            Pacific Data Hub
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </motion.a>

        {/* Card 2: API Explorer */}
        <motion.a
          href="/api-explorer"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -2, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="px-3 py-1.5 bg-slate-900/40 border border-slate-800/80 rounded-lg inline-flex items-center gap-2 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
            API Explorer
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
        </motion.a>

        {/* Card 3: Methodology */}
        <motion.a
          href="/methodology"
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -2, borderColor: "rgba(6, 182, 212, 0.4)" }}
          className="px-3 py-1.5 bg-slate-900/40 border border-slate-800/80 rounded-lg inline-flex items-center gap-2 group transition-all duration-300 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
            Methodology & Formulas
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
        </motion.a>
      </motion.div>
    </StorySection>
  );
}
