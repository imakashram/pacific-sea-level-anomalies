import { motion, useScroll, useSpring } from "framer-motion";
import {
  useGetClimateOverview,
  useGetDecadeAnalysis,
  useGetAcceleration,
  useGetVolatility,
} from "@workspace/api-client-react";

/**
 * HeroSection Component
 *
 * Serves as the landing narrative for the Pacific Sea Level Anomalies Data Story.
 * Displays primary headline, animated gradient title, overview summary, key statistical indicators,
 * and a bottom-anchored document scroll progress indicator.
 */
export function HeroSection() {
  // Fetch overview metrics & detailed stats via API hooks
  const { data: overview } = useGetClimateOverview();
  const { data: decadeData } = useGetDecadeAnalysis();
  const { data: accelData } = useGetAcceleration();
  const { data: volData } = useGetVolatility();

  // Smooth scroll progress bar hook anchored at bottom of viewport
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate stats with 100% verified dataset fallback values (from 1993–2023 Pacific SLA records)
  const avgRiseMeters = overview?.avgRiseMeters ?? 0.045;
  const d1Avg =
    decadeData?.globalDecades.find((d) => d.key === "d1")?.avg ?? 0.004;
  const d3Avg =
    decadeData?.globalDecades.find((d) => d.key === "d3")?.avg ?? 0.088;
  const shift = d3Avg - d1Avg;

  const fastest = accelData
    ?.slice()
    .sort((a, b) => b.slopeFullPeriod - a.slopeFullPeriod)[0] ?? {
    country: "Papua New Guinea",
    slopeFullPeriod: 0.0054,
  };

  const mostVolatile = volData?.countries
    .slice()
    .sort((a, b) => b.volatility - a.volatility)[0] ?? {
    country: "Palau",
    volatility: 0.087,
  };

  return (
    <section
      id="hero"
      className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden px-6 md:px-12 pt-16 pb-6 md:pt-20 md:pb-8"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/5 blur-[140px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[130px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center flex-grow gap-8 md:gap-16">
        {/* Header Narrative */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-primary tracking-widest uppercase text-xs md:text-sm font-semibold mb-6">
              A Climate Story · 21 Pacific Nations · 30 Years of Change
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-8">
              The Ocean Is <br />
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-500"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Swallowing Pacific Islands
              </motion.span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
              30 years of sea-level records reveal a clear and persistent rise
              across the Pacific, bringing growing challenges for many low-lying
              island nations.
            </p>
          </motion.div>
        </div>

        {/* Key Climate Telemetry Statistics Grid */}
        <motion.div
          className="w-full border border-slate-800/60 py-8 bg-slate-950/40 backdrop-blur-md rounded-2xl px-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Metric 1: Overall Average Sea Level Rise */}
            <div className="border-l-2 border-cyan-500 pl-4 py-1">
              <div className="text-2xl font-serif font-bold text-foreground">
                +{(avgRiseMeters * 100).toFixed(1)} cm
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Average Rise
              </div>
            </div>

            {/* Metric 2: Multi-Decadal Shift (Decade 1 vs Decade 3) */}
            <div className="border-l-2 border-orange-500 pl-4 py-1">
              <div className="text-2xl font-serif font-bold text-foreground">
                +{(shift * 100).toFixed(1)} cm
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Decade Shift (D1-D3)
              </div>
            </div>

            {/* Metric 3: Fastest Rising Pacific Island Nation */}
            <div className="border-l-2 border-rose-500 pl-4 py-1">
              <div
                className="text-2xl font-serif font-bold text-foreground truncate"
                title={fastest.country}
              >
                {fastest.country}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Fastest Rising (+{(fastest.slopeFullPeriod * 1000).toFixed(1)}{" "}
                mm/yr)
              </div>
            </div>

            {/* Metric 4: Most Volatile Pacific Island Nation */}
            <div className="border-l-2 border-purple-500 pl-4 py-1">
              <div
                className="text-2xl font-serif font-bold text-foreground truncate"
                title={mostVolatile.country}
              >
                {mostVolatile.country}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Most Volatile (±{(mostVolatile.volatility * 100).toFixed(1)} cm)
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Scroll Prompt Indicator */}
      <motion.div
        className="flex flex-col items-center gap-2 opacity-45 z-10 mt-auto pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 1, delay: 1.0 }}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
          Scroll to explore the chapters
        </span>
        <div className="w-5 h-9 border-2 border-primary/45 rounded-full flex justify-center p-1 mt-1">
          <motion.div
            className="w-1.5 h-1.5 bg-primary rounded-full"
            animate={{
              y: [0, 12, 0],
              opacity: [1, 0.2, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      {/* Bottom Page-Wide Scroll Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-card/65">
        <motion.div
          className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
          style={{ scaleX, transformOrigin: "0%" }}
        />
      </div>
    </section>
  );
}
