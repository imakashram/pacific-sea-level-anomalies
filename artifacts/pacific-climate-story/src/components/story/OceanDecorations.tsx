import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useGetSeaLevelTrend, useGetAnnualDeviation } from "@workspace/api-client-react";

export function OceanDecorations() {
  const { scrollYProgress } = useScroll();
  
  // Fetch 100% project database metrics via API hooks
  const { data: trendData } = useGetSeaLevelTrend();
  const { data: deviationData } = useGetAnnualDeviation();

  // Static fallback data for smooth initial render
  const fallbackData = [
    { year: 1993, avgAnomaly: 0.018, countriesRising: 8, enso: "neutral" },
    { year: 1998, avgAnomaly: 0.089, countriesRising: 19, enso: "el-nino" },
    { year: 2008, avgAnomaly: 0.038, countriesRising: 11, enso: "la-nina" },
    { year: 2016, avgAnomaly: 0.149, countriesRising: 20, enso: "el-nino" },
    { year: 2023, avgAnomaly: 0.187, countriesRising: 21, enso: "el-nino" }
  ];

  // Selected telemetry state matching scroll progress
  const [activeYear, setActiveYear] = useState(1993);
  const [activeAvg, setActiveAvg] = useState(0.018);
  const [activeCount, setActiveCount] = useState(8);
  const [activeEnso, setActiveEnso] = useState("neutral");

  // Hover states for tooltips
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);

  // Dynamically merge and update database results as scroll progresses
  useEffect(() => {
    const trendList = trendData ?? [];
    const devList = deviationData?.deviations ?? [];

    let dataset = fallbackData;
    if (trendList.length > 0) {
      dataset = trendList.map((t) => {
        const matchingDev = devList.find((d) => d.year === t.year);
        return {
          year: t.year,
          avgAnomaly: t.avgAnomaly ?? 0,
          countriesRising: t.countriesRising ?? 0,
          enso: matchingDev ? matchingDev.enso : "neutral"
        };
      });
    }

    const handleScrollUpdate = (latest: number) => {
      const index = Math.min(
        Math.floor(latest * dataset.length),
        dataset.length - 1
      );
      const data = dataset[index];
      if (data) {
        setActiveYear(data.year);
        setActiveAvg(data.avgAnomaly);
        setActiveCount(data.countriesRising);
        setActiveEnso(data.enso);
      }
    };

    handleScrollUpdate(scrollYProgress.get());
    const unsubscribe = scrollYProgress.on("change", handleScrollUpdate);

    return () => unsubscribe();
  }, [trendData, deviationData, scrollYProgress]);

  // Color mapping matching the project's standard ENSO palette
  const ensoMapping = {
    "el-nino": { label: "EL NIÑO (WARM)", color: "text-orange-400" },
    "la-nina": { label: "LA NIÑA (COOL)", color: "text-sky-400" },
    neutral: { label: "NEUTRAL", color: "text-slate-400" }
  };

  const ensoDetails = ensoMapping[activeEnso as keyof typeof ensoMapping] ?? ensoMapping.neutral;

  // Scroll mapping for vertical ruler indicators
  const indicatorTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Graduated timeline ticks definition (Major milestones + intermediate increments for every year)
  const timelineTicks = Array.from({ length: 2023 - 1993 + 1 }, (_, i) => {
    const year = 1993 + i;
    const majorYears = [1993, 1998, 2003, 2008, 2013, 2018, 2023];
    return {
      year,
      major: majorYears.includes(year)
    };
  });

  return (
    <>
      {/* ================= LEFT MARGIN (Ultra-narrow SLA Ruler) ================= */}
      <div className="fixed left-4 top-0 bottom-0 w-16 pointer-events-none select-none z-40 hidden xl:flex flex-col justify-between pt-12 pb-4 px-1 overflow-visible bg-gradient-to-r from-background/95 via-background/20 to-transparent">
        
        {/* Soft background blue blur spot (Intensifies on hover) */}
        <div 
          className={`absolute top-1/3 left-[-120px] w-64 h-64 rounded-full bg-cyan-600/5 blur-[80px] transition-opacity duration-300 ${
            isLeftHovered ? "opacity-100" : "opacity-40"
          }`} 
        />
        <div 
          className={`absolute bottom-1/3 left-[-120px] w-64 h-64 rounded-full bg-blue-600/5 blur-[80px] transition-opacity duration-300 ${
            isLeftHovered ? "opacity-100" : "opacity-40"
          }`} 
        />

        {/* Sea water liquid fill (100% filled sea water column - touches top & bottom of screen) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-blue-950/65 via-cyan-950/45 to-blue-900/60 border-x border-cyan-500/10 shadow-[inset_0_0_20px_rgba(34,211,238,0.15)] overflow-hidden"
        >
          {/* Animated bubble particles inside the water */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-200/40 shadow-[0_0_2px_rgba(34,211,238,0.3)]"
              style={{
                left: `${10 + (i * 11) % 80}%`,
              }}
              animate={{
                top: ["105%", "-5%"],
                opacity: [0, 0.7, 0.7, 0],
              }}
              transition={{
                duration: 6 + (i * 1.5),
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.6,
              }}
            />
          ))}
        </div>

        {/* GRADUATED DEPTH RULER */}
        <div className="relative w-full h-full flex justify-center">
          {/* Futuristic online status label at the start */}
          <div className="absolute -top-10 left-0 flex items-center gap-1.5 bg-cyan-950/55 border border-cyan-500/35 rounded-full px-3 py-1 text-[8px] font-mono font-bold text-cyan-400 tracking-wider shadow-sm shadow-cyan-950/50 whitespace-nowrap animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_#22d3ee]" />
            SLA SCANS
          </div>

          {/* Main vertical axis line */}
          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/20 via-cyan-500/60 to-cyan-500/20" />

          {/* Scrolling HUD crosshair pointer with hover triggers */}
          <motion.div 
            className="absolute -translate-y-1/2 w-8 h-8 flex items-center justify-center z-50 pointer-events-auto cursor-pointer"
            style={{ top: indicatorTop }}
            onMouseEnter={() => setIsLeftHovered(true)}
            onMouseLeave={() => setIsLeftHovered(false)}
          >
            {/* Pulsing visual core */}
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white shadow-[0_0_12px_#22d3ee] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            {/* Horizontal cursor crosshairs */}
            <div className="absolute w-6 h-px bg-cyan-400" />
            <div className="absolute w-px h-6 bg-cyan-400" />

            {/* Level label at circle - Styled as a capsule readout (Hidden on hover to avoid overlap) */}
            {!isLeftHovered && (
              <span className="absolute left-8 text-[9px] font-mono font-bold text-cyan-200 bg-cyan-950/85 px-2.5 py-0.5 border border-cyan-400/40 rounded-full whitespace-nowrap shadow-lg shadow-black/80 backdrop-blur-sm">
                {activeAvg > 0 ? "+" : ""}{(activeAvg * 100).toFixed(1)} cm
              </span>
            )}

            {/* HIGH-CONTRAST MINIMALIST HOVER TOOLTIP (Positioned close to the circle) */}
            <AnimatePresence>
              {isLeftHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className={`absolute left-7 z-50 bg-[#081225] border border-cyan-400/50 rounded-md py-2 px-3 shadow-[0_10px_25px_rgba(0,0,0,0.8)] w-40 pointer-events-none text-left ${
                    activeYear <= 1997 ? "top-0" : activeYear >= 2019 ? "bottom-2" : "top-1/2 -translate-y-1/2"
                  }`}
                >
                  <span className="block text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">{activeYear} RECORD</span>
                  <span className="block text-[16px] font-mono font-black text-white mt-1">
                    {activeAvg > 0 ? "+" : ""}{(activeAvg * 100).toFixed(2)} cm
                  </span>
                  <span className="block text-[8px] font-mono text-cyan-400 uppercase tracking-wider mt-0.5">PACIFIC AVG SLA</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Timeline markers aligned symmetrically to vertical axis (Graduated scale) */}
          <div className="absolute inset-y-0 w-full flex flex-col justify-between py-0 text-[9px] font-mono font-medium text-cyan-400/50">
            {timelineTicks.map((tick) => (
              <div 
                key={tick.year} 
                className="relative w-full h-0.5 flex items-center"
              >
                {tick.major ? (
                  <>
                    <span className="absolute right-1/2 pr-3 text-right whitespace-nowrap text-cyan-400/60 font-semibold">{tick.year}</span>
                    <span className="absolute left-1/2 -translate-x-1/2 w-3.5 h-px bg-cyan-500/60" />
                  </>
                ) : (
                  <span className="absolute left-1/2 -translate-x-1/2 w-1.5 h-px bg-cyan-500/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RIGHT MARGIN (Ultra-narrow ENSO Ruler) ================= */}
      <div className="fixed right-4 top-0 bottom-0 w-16 pointer-events-none select-none z-40 hidden xl:flex flex-col justify-between pt-12 pb-4 px-1 overflow-visible bg-gradient-to-l from-background/90 via-background/20 to-transparent">
        
        {/* Soft background warm blur spot (Intensifies on hover) */}
        <div 
          className={`absolute top-1/3 right-[-120px] w-64 h-64 rounded-full bg-orange-600/5 blur-[80px] transition-opacity duration-300 ${
            isRightHovered ? "opacity-100" : "opacity-40"
          }`} 
        />
        <div 
          className={`absolute bottom-1/3 right-[-120px] w-64 h-64 rounded-full bg-rose-600/5 blur-[80px] transition-opacity duration-300 ${
            isRightHovered ? "opacity-100" : "opacity-40"
          }`} 
        />

        {/* Sea water liquid fill (100% filled sea water column - touches top & bottom of screen) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-rose-950/65 via-orange-950/45 to-rose-900/60 border-x border-orange-500/10 shadow-[inset_0_0_20px_rgba(249,115,22,0.15)] overflow-hidden"
        >
          {/* Animated bubble particles inside the water */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-200/40 shadow-[0_0_2px_rgba(249,115,22,0.3)]"
              style={{
                left: `${10 + (i * 11) % 80}%`,
              }}
              animate={{
                top: ["105%", "-5%"],
                opacity: [0, 0.7, 0.7, 0],
              }}
              transition={{
                duration: 6 + (i * 1.5),
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.6,
              }}
            />
          ))}
        </div>

        {/* GRADUATED DEPTH RULER */}
        <div className="relative w-full h-full flex justify-center">
          {/* Futuristic online status label at the start */}
          <div className="absolute -top-10 right-0 flex items-center gap-1.5 bg-orange-950/55 border border-orange-500/35 rounded-full px-3 py-1 text-[8px] font-mono font-bold text-orange-400 tracking-wider shadow-sm shadow-orange-950/50 whitespace-nowrap animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_4px_#f97316]" />
            REGIONAL RISING
          </div>

          {/* Main vertical axis line */}
          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/20 via-orange-500/60 to-orange-500/20" />

          {/* Scrolling HUD crosshair pointer with hover triggers */}
          <motion.div 
            className="absolute -translate-y-1/2 w-8 h-8 flex items-center justify-center z-50 pointer-events-auto cursor-pointer"
            style={{ top: indicatorTop }}
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
          >
            {/* Pulsing visual core */}
            <div className="w-3.5 h-3.5 rounded-full bg-orange-400 border border-white shadow-[0_0_12px_#f97316] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            {/* Horizontal cursor crosshairs */}
            <div className="absolute w-6 h-px bg-orange-400" />
            <div className="absolute w-px h-6 bg-orange-400" />

            {/* Level label at circle - Styled as a capsule readout (Hidden on hover to avoid overlap) */}
            {!isRightHovered && (
              <span className="absolute right-8 text-[9px] font-mono font-bold text-orange-200 bg-orange-950/85 px-2.5 py-0.5 border border-orange-400/40 rounded-full whitespace-nowrap shadow-lg shadow-black/80 backdrop-blur-sm">
                {activeCount} / 21
              </span>
            )}

            {/* HIGH-CONTRAST MINIMALIST HOVER TOOLTIP (Positioned close to the circle) */}
            <AnimatePresence>
              {isRightHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  className={`absolute right-7 z-50 bg-[#1d0f06] border border-orange-400/50 rounded-md py-2 px-3 shadow-[0_10px_25px_rgba(0,0,0,0.8)] w-40 pointer-events-none text-left ${
                    activeYear <= 1997 ? "top-0" : activeYear >= 2019 ? "bottom-2" : "top-1/2 -translate-y-1/2"
                  }`}
                >
                  <span className="block text-[10px] font-mono font-bold text-orange-300 uppercase tracking-wider">{activeYear} SCAN</span>
                  
                  {/* ENSO Status in bold matching colors */}
                  <span className={`block text-[12px] font-mono font-black mt-1 uppercase ${ensoDetails.color}`}>
                    {ensoDetails.label}
                  </span>
                  
                  <span className="block text-[13px] font-mono font-black text-orange-100 mt-1">
                    {activeCount} / 21 RISING
                  </span>
                  <span className="block text-[8px] font-mono text-orange-400 uppercase tracking-wider mt-0.5">REGIONAL STATUS</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Timeline markers aligned symmetrically to vertical axis (Graduated scale) */}
          <div className="absolute inset-y-0 w-full flex flex-col justify-between py-0 text-[9px] font-mono font-medium text-orange-400/50">
            {timelineTicks.map((tick) => (
              <div 
                key={tick.year} 
                className="relative w-full h-0.5 flex items-center"
              >
                {tick.major ? (
                  <>
                    <span className="absolute left-1/2 pl-3 text-left whitespace-nowrap text-orange-400/60 font-semibold">{tick.year}</span>
                    <span className="absolute left-1/2 -translate-x-1/2 w-3.5 h-px bg-orange-500/60" />
                  </>
                ) : (
                  <span className="absolute left-1/2 -translate-x-1/2 w-1.5 h-px bg-orange-500/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
