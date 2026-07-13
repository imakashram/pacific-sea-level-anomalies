import { motion, useScroll, useSpring } from "framer-motion";
import { useGetClimateOverview, useGetDecadeAnalysis, useGetAcceleration, useGetVolatility } from "@workspace/api-client-react";

function WaveBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Animated wave layers using CSS translateX — no SVG path morphing */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "45%" }}>
        {/* Wave 1 — slow, large */}
        <motion.div
          className="absolute bottom-0 left-0"
          style={{ width: "200%", height: "100%" }}
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 C1680,140 1920,20 2160,80 C2400,140 2640,20 2880,80 L2880,200 L0,200 Z"
              fill="hsl(var(--primary))"
              opacity={0.06}
            />
          </svg>
        </motion.div>
        {/* Wave 2 — medium speed, mid opacity */}
        <motion.div
          className="absolute bottom-0 left-0"
          style={{ width: "200%", height: "100%" }}
          animate={{ x: ["-50%", 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,110 C360,60 720,160 1080,110 C1440,60 1800,160 2160,110 C2520,60 2700,140 2880,110 L2880,200 L0,200 Z"
              fill="hsl(var(--primary))"
              opacity={0.08}
            />
          </svg>
        </motion.div>
        {/* Wave 3 — fast, highest opacity — foreground wave */}
        <motion.div
          className="absolute bottom-0 left-0"
          style={{ width: "200%", height: "100%" }}
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,140 C480,100 960,180 1440,140 C1920,100 2400,180 2880,140 L2880,200 L0,200 Z"
              fill="hsl(var(--primary))"
              opacity={0.12}
            />
          </svg>
        </motion.div>
      </div>
      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <div className="w-[80vw] h-[80vw] rounded-full bg-primary/30 blur-[140px]" />
      </div>
    </div>
  );
}

export function HeroSection() {
  const { data: overview, isLoading: overviewLoading } = useGetClimateOverview();
  const { data: decadeData } = useGetDecadeAnalysis();
  const { data: accelData } = useGetAcceleration();
  const { data: volData } = useGetVolatility();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const d1Avg = decadeData?.globalDecades.find(d => d.key === 'd1')?.avg || 0;
  const d3Avg = decadeData?.globalDecades.find(d => d.key === 'd3')?.avg || 0;
  const shift = d3Avg - d1Avg;

  const fastest = accelData?.slice().sort((a, b) => b.slopeFullPeriod - a.slopeFullPeriod)[0];
  const mostVolatile = volData?.countries.slice().sort((a, b) => b.volatility - a.volatility)[0];

  return (
    <section id="hero" className="min-h-screen w-full flex flex-col justify-center relative overflow-hidden px-6 md:px-12">
      <WaveBackground />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-primary tracking-widest uppercase text-sm md:text-base font-semibold mb-6">
            A Climate Story · 21 Pacific Nations · 30 Years of Data
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8">
            The Ocean Is <br/>
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Swallowing The Pacific
            </motion.span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mb-12">
            Thirty years of data reveal an undeniable acceleration. 
            For the island nations of the Pacific, sea level rise is no longer a future threat—it is the present reality.
          </p>
        </motion.div>

        {!overviewLoading && overview && (
          <motion.div 
            className="flex flex-col gap-12 mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-l-2 border-primary pl-6 py-2">
                <div className="text-5xl font-serif text-foreground mb-2">+{overview.avgRiseMeters.toFixed(2)}m</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Average Rise ({overview.yearRange.start}–{overview.yearRange.end})</div>
              </div>
              <div className="border-l-2 border-primary pl-6 py-2">
                <div className="text-5xl font-serif text-foreground mb-2">{overview.maxRiseCountry}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Most Affected Nation (+{overview.maxRiseValue.toFixed(2)}m)</div>
              </div>
              <div className="border-l-2 border-primary pl-6 py-2">
                <div className="text-5xl font-serif text-foreground mb-2">{overview.totalObservations}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Data Observations Analyzed</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/30">
              <div className="border-l-2 border-primary/50 pl-6 py-2">
                <div className="text-3xl font-serif text-foreground mb-1">+{shift.toFixed(3)}m <span className="text-base text-muted-foreground">avg shift</span></div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Decade Acceleration (D1 to D3)</div>
              </div>
              {fastest && (
                <div className="border-l-2 border-primary/50 pl-6 py-2">
                  <div className="text-3xl font-serif text-foreground mb-1">{fastest.country} <span className="text-primary text-base">+{(fastest.slopeFullPeriod * 1000).toFixed(2)}mm/yr</span></div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Fastest Rising</div>
                </div>
              )}
              {mostVolatile && (
                <div className="border-l-2 border-primary/50 pl-6 py-2">
                  <div className="text-3xl font-serif text-foreground mb-1">{mostVolatile.country} <span className="text-[#f97316] text-base">±{mostVolatile.volatility.toFixed(3)}m</span></div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Most Volatile</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div 
          className="mt-16 flex flex-col items-center gap-2 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-card">
        <motion.div 
          className="h-full bg-primary" 
          style={{ scaleX, transformOrigin: "0%" }} 
        />
      </div>
    </section>
  );
}
