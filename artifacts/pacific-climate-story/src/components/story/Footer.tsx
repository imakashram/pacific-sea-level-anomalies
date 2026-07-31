import { motion } from "framer-motion";
import { ArrowUp, Terminal, Calculator } from "lucide-react";

const childVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const footerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

export function Footer() {
  return (
    <div className="max-w-5xl mx-auto w-full px-6 md:px-12 pb-16">
      <motion.footer
        className="pt-12 border-t border-border/30 text-center flex flex-col items-center gap-8"
        variants={footerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.nav
          variants={childVariants}
          className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-400 select-none"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer focus:outline-none"
            aria-label="Scroll back to top of the page"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Top</span>
          </button>
          <span className="text-slate-800" aria-hidden="true">|</span>
          <a
            href="/api-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer focus:outline-none"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Explorer</span>
          </a>
          <span className="text-slate-800" aria-hidden="true">|</span>
          <a
            href="/methodology"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer focus:outline-none"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Methodology & Formulas</span>
          </a>
        </motion.nav>

        <motion.div variants={childVariants} className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Data sourced from the Pacific Community (SPC) Climate Change
            Indicators Database. Indicator: SEA_LVL (Sea Level Anomaly).
          </p>
          <div className="font-serif italic text-primary text-2xl">
            "The ocean is speaking. The question is whether we are listening."
          </div>
        </motion.div>

        {/* Bottom Bar: Credits */}
        <motion.div
          variants={childVariants}
          className="w-full pt-8 mt-4 border-t border-border/20 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs select-none"
        >
          <span className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
            Concept, analysis, design, and development by
          </span>
          <a
            href="https://www.linkedin.com/in/imakashram/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 text-xs sm:text-sm transition-colors duration-200"
          >
            Akash Ram
          </a>
        </motion.div>
      </motion.footer>
    </div>
  );
}
