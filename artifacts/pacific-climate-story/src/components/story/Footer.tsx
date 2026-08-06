import { motion } from "framer-motion";

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
        className="pt-12 border-t border-border/30 text-center flex flex-col items-center gap-3"
        variants={footerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Bottom Bar: Credits */}
        <motion.div
          variants={childVariants}
          className="text-[10px] sm:text-xs text-slate-500"
        >
          Concept, analysis, design, and development by{" "}
          <a
            href="https://www.linkedin.com/in/imakashram/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-colors duration-200"
          >
            Akash Ram
          </a>
        </motion.div>

        {/* Quote */}
        <motion.div variants={childVariants}>
          <div className="font-serif italic text-primary text-xl md:text-2xl leading-relaxed">
            "The ocean is speaking. The question is whether we are listening."
          </div>
        </motion.div>
      </motion.footer>
    </div>
  );
}
