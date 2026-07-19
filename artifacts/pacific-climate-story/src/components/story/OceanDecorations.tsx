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
      {/* ================= LEFT MARGIN (Pacific Sea Level Anomaly Hydro-Gauge) ================= */}
      <div className="fixed left-4 top-0 bottom-0 w-20 pointer-events-none select-none z-40 hidden xl:flex flex-col justify-between pt-12 pb-4 px-1 overflow-visible bg-gradient-to-r from-background/95 via-background/20 to-transparent">

        {/* Soft background blur spot (Intensifies on hover, matches ENSO phase) */}
        <div
          className={`absolute top-1/3 left-[-120px] w-64 h-64 rounded-full transition-all duration-500 blur-[80px] ${activeEnso === "el-nino"
              ? "bg-orange-600/5"
              : activeEnso === "la-nina"
                ? "bg-sky-600/5"
                : "bg-slate-600/5"
            } ${isLeftHovered ? "opacity-100" : "opacity-40"
            }`}
        />
        <div
          className={`absolute bottom-1/3 left-[-120px] w-64 h-64 rounded-full transition-all duration-500 blur-[80px] ${activeEnso === "el-nino"
              ? "bg-rose-600/5"
              : activeEnso === "la-nina"
                ? "bg-blue-600/5"
                : "bg-slate-600/5"
            } ${isLeftHovered ? "opacity-100" : "opacity-40"
            }`}
        />

        {/* Sea water liquid fill (Dynamic ocean water body matching SLA level & ENSO phase) */}
        <div
          className={`absolute inset-0 border-x transition-colors duration-500 overflow-hidden ${activeEnso === "el-nino"
              ? "bg-gradient-to-b from-rose-950/75 via-orange-950/55 to-amber-900/70 border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.25)]"
              : activeEnso === "la-nina"
                ? "bg-gradient-to-b from-sky-950/75 via-blue-950/55 to-cyan-900/70 border-sky-500/30 shadow-[inset_0_0_20px_rgba(56,189,248,0.25)]"
                : "bg-gradient-to-b from-slate-950/75 via-slate-900/55 to-slate-900/70 border-slate-500/30 shadow-[inset_0_0_20px_rgba(148,163,184,0.15)]"
            }`}
        >
          {/* Dynamic rising sea water column (Fills as scroll progresses) */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 border-t shadow-md transition-colors duration-500 ${activeEnso === "el-nino"
                ? "bg-gradient-to-t from-orange-600/40 via-amber-500/30 to-orange-400/50 border-orange-300/60 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                : activeEnso === "la-nina"
                  ? "bg-gradient-to-t from-sky-600/40 via-blue-500/30 to-cyan-400/50 border-sky-300/60 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                  : "bg-gradient-to-t from-slate-600/40 via-slate-500/30 to-slate-400/50 border-slate-300/60 shadow-[0_0_12px_rgba(148,163,184,0.3)]"
              }`}
            style={{ top: indicatorTop }}
          >
            {/* Animated SVG Ocean Wave Crest at water surface pointer */}
            <div className="absolute -top-2 left-0 right-0 h-3 overflow-hidden pointer-events-none z-10">
              <motion.svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="absolute top-0 left-0 w-[200%] h-full opacity-90"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <path
                  d="M0,30 C150,80 350,-20 500,40 C650,110 900,-20 1200,30 V120 H0 Z"
                  fill={activeEnso === "el-nino" ? "#f97316" : activeEnso === "la-nina" ? "#38bdf8" : "#94a3b8"}
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Animated bubble particles inside the water */}
          {[...Array(35)].map((_, i) => {
            const size = 1.5 + (i % 4) * 0.8;
            return (
              <motion.div
                key={i}
                className={`absolute rounded-full border border-white/25 shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-colors duration-500 ${
                  activeEnso === "el-nino" 
                    ? "bg-orange-200/40 shadow-orange-500/30" 
                    : activeEnso === "la-nina" 
                    ? "bg-sky-200/40 shadow-sky-500/30" 
                    : "bg-slate-200/30 shadow-slate-500/20"
                }`}
                style={{
                  width: size,
                  height: size,
                  left: `${15 + (i * 17) % 70}%`,
                }}
                animate={{
                  top: ["102%", "-5%"],
                  x: [0, (i % 2 === 0 ? 6 : -6), (i % 2 === 0 ? -4 : 4), 0],
                  opacity: [0, 0.85, 0.85, 0],
                }}
                transition={{
                  duration: 3.5 + (i % 5) * 1.2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.15,
                }}
              />
            );
          })}
        </div>

        {/* GRADUATED DEPTH RULER */}
        <div className="relative w-full h-full flex justify-center">
          {/* Futuristic online status label at the start */}
          <div className={`absolute -top-10 left-0 flex items-center gap-1.5 bg-slate-950/80 border rounded-full px-3 py-1 text-[8px] font-mono font-bold tracking-wider shadow-sm whitespace-nowrap animate-fadeIn transition-colors duration-500 ${activeEnso === "el-nino" ? "border-orange-500/40 text-orange-400" : activeEnso === "la-nina" ? "border-sky-500/40 text-sky-400" : "border-slate-500/40 text-slate-400"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400 shadow-[0_0_4px_#f97316]" : activeEnso === "la-nina" ? "bg-sky-400 shadow-[0_0_4px_#38bdf8]" : "bg-slate-400 shadow-[0_0_4px_#94a3b8]"
              }`} />
            PACIFIC SLA
          </div>

          {/* Main vertical axis line */}
          <div className={`absolute top-0 bottom-0 w-px transition-colors duration-500 ${activeEnso === "el-nino"
              ? "bg-gradient-to-b from-orange-500/35 via-orange-400/85 to-orange-500/35"
              : activeEnso === "la-nina"
                ? "bg-gradient-to-b from-sky-500/35 via-sky-400/85 to-sky-500/35"
                : "bg-gradient-to-b from-slate-500/35 via-slate-400/85 to-slate-500/35"
            }`} />

          {/* Scrolling HUD crosshair pointer with hover triggers */}
          <motion.div
            className="absolute -translate-y-1/2 w-8 h-8 flex items-center justify-center z-50 pointer-events-auto cursor-pointer"
            style={{ top: indicatorTop }}
            onMouseEnter={() => setIsLeftHovered(true)}
            onMouseLeave={() => setIsLeftHovered(false)}
          >
            {/* Pulsing visual core */}
            <div className={`w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400 shadow-[0_0_12px_#f97316]" : activeEnso === "la-nina" ? "bg-sky-400 shadow-[0_0_12px_#38bdf8]" : "bg-slate-400 shadow-[0_0_12px_#94a3b8]"
              }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            {/* Horizontal cursor crosshairs */}
            <div className={`absolute w-6 h-px transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"}`} />
            <div className={`absolute w-px h-6 transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"}`} />

            {/* Level label at circle - Styled as a capsule readout (Hidden on hover to avoid overlap) */}
            {!isLeftHovered && (
              <span className={`absolute left-1/2 ml-3 text-[9px] font-mono font-bold bg-slate-950/85 px-2.5 py-0.5 border rounded-full whitespace-nowrap shadow-lg shadow-black/80 backdrop-blur-sm transition-colors duration-500 ${activeEnso === "el-nino" ? "text-orange-200 border-orange-400/40" : activeEnso === "la-nina" ? "text-sky-200 border-sky-400/40" : "text-slate-200 border-slate-400/40"
                }`}>
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
                  className={`absolute left-1/2 ml-3 z-50 rounded-lg py-2.5 px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] w-48 pointer-events-none text-left backdrop-blur-md transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-[#1d0f06]/95 border-orange-400/50 text-orange-200/90" : activeEnso === "la-nina" ? "bg-[#0b1c2c]/95 border-sky-400/50 text-sky-200/90" : "bg-[#121824]/95 border-slate-400/50 text-slate-200/90"
                    } ${activeYear <= 1997 ? "top-0" : activeYear >= 2019 ? "bottom-2" : "top-1/2 -translate-y-1/2"
                    }`}
                >
                  <span className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${activeEnso === "el-nino" ? "text-orange-300" : activeEnso === "la-nina" ? "text-sky-300" : "text-slate-300"
                    }`}>
                    {activeYear} TELEMETRY
                  </span>
                  <span className="block text-[18px] font-mono font-black text-white mt-1 leading-none">
                    {activeAvg > 0 ? "+" : ""}{(activeAvg * 100).toFixed(2)} cm
                  </span>
                  <span className={`block text-[10px] font-mono mt-1.5 font-medium ${activeEnso === "el-nino" ? "text-orange-200/90" : activeEnso === "la-nina" ? "text-sky-200/90" : "text-slate-200/90"
                    }`}>
                    {activeCount} of 21 Nations Rising ({Math.round((activeCount / 21) * 100)}%)
                  </span>
                  <span className={`block text-[8px] font-mono uppercase tracking-wider mt-1 border-t pt-1 ${activeEnso === "el-nino" ? "text-orange-400/70 border-orange-500/20" : activeEnso === "la-nina" ? "text-sky-400/70 border-sky-500/20" : "text-slate-400/70 border-slate-500/20"
                    }`}>
                    PACIFIC SEA LEVEL ANOMALY
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Timeline markers aligned symmetrically to vertical axis (Graduated scale) */}
          <div className={`absolute inset-y-0 w-full flex flex-col justify-between py-0 text-[9px] font-mono font-medium transition-colors duration-500 ${activeEnso === "el-nino" ? "text-orange-400/80" : activeEnso === "la-nina" ? "text-sky-400/80" : "text-slate-400/80"
            }`}>
            {timelineTicks.map((tick) => (
              <div
                key={tick.year}
                className="relative w-full h-0.5 flex items-center"
              >
                {tick.major ? (
                  <>
                    <span className={`absolute right-1/2 pr-2 text-right whitespace-nowrap font-semibold transition-colors duration-500 ${activeEnso === "el-nino" ? "text-orange-300" : activeEnso === "la-nina" ? "text-sky-300" : "text-slate-300"
                      }`}>{tick.year}</span>
                    <span className={`absolute left-1/2 -translate-x-1/2 w-3.5 h-px transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"
                      }`} />
                  </>
                ) : (
                  <span className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-px transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400/50" : activeEnso === "la-nina" ? "bg-sky-400/50" : "bg-slate-400/50"
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RIGHT MARGIN (Pacific Ocean Climate Thermal Gauge) ================= */}
      <div className="fixed right-4 top-0 bottom-0 w-20 pointer-events-none select-none z-40 hidden xl:flex flex-col justify-between pt-12 pb-4 px-1 overflow-visible bg-gradient-to-l from-background/90 via-background/20 to-transparent">

        {/* Soft background warm blur spot (Intensifies on hover) */}
        <div
          className={`absolute top-1/3 right-[-120px] w-64 h-64 rounded-full bg-orange-600/5 blur-[80px] transition-opacity duration-300 ${isRightHovered ? "opacity-100" : "opacity-40"
            }`}
        />
        <div
          className={`absolute bottom-1/3 right-[-120px] w-64 h-64 rounded-full bg-rose-600/5 blur-[80px] transition-opacity duration-300 ${isRightHovered ? "opacity-100" : "opacity-40"
            }`}
        />

        {/* Sea water liquid fill (Dynamic climate cycle water body) */}
        <div
          className={`absolute inset-0 border-x transition-colors duration-500 overflow-hidden ${activeEnso === "el-nino"
              ? "bg-gradient-to-b from-rose-950/75 via-orange-950/55 to-amber-900/70 border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.25)]"
              : activeEnso === "la-nina"
                ? "bg-gradient-to-b from-sky-950/75 via-blue-950/55 to-cyan-900/70 border-sky-500/30 shadow-[inset_0_0_20px_rgba(56,189,248,0.25)]"
                : "bg-gradient-to-b from-slate-950/75 via-slate-900/55 to-slate-900/70 border-slate-500/30 shadow-[inset_0_0_20px_rgba(148,163,184,0.15)]"
            }`}
        >
          {/* Dynamic sea water body */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 border-t shadow-md transition-colors duration-500 ${activeEnso === "el-nino"
                ? "bg-gradient-to-t from-orange-600/40 via-amber-500/30 to-orange-400/50 border-orange-300/60 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                : activeEnso === "la-nina"
                  ? "bg-gradient-to-t from-sky-600/40 via-blue-500/30 to-cyan-400/50 border-sky-300/60 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                  : "bg-gradient-to-t from-slate-600/40 via-slate-500/30 to-slate-400/50 border-slate-300/60 shadow-[0_0_12px_rgba(148,163,184,0.3)]"
              }`}
            style={{ top: indicatorTop }}
          >
            {/* Animated SVG Ocean Wave Crest at water surface pointer */}
            <div className="absolute -top-2 left-0 right-0 h-3 overflow-hidden pointer-events-none z-10">
              <motion.svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="absolute top-0 left-0 w-[200%] h-full opacity-90"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <path
                  d="M0,30 C150,80 350,-20 500,40 C650,110 900,-20 1200,30 V120 H0 Z"
                  fill={activeEnso === "el-nino" ? "#f97316" : activeEnso === "la-nina" ? "#38bdf8" : "#94a3b8"}
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Animated bubble particles inside the water */}
          {[...Array(35)].map((_, i) => {
            const size = 1.5 + (i % 4) * 0.8;
            return (
              <motion.div
                key={i}
                className={`absolute rounded-full border border-white/25 shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-colors duration-500 ${
                  activeEnso === "el-nino" 
                    ? "bg-orange-200/40 shadow-orange-500/30" 
                    : activeEnso === "la-nina" 
                    ? "bg-sky-200/40 shadow-sky-500/30" 
                    : "bg-slate-200/30 shadow-slate-500/20"
                }`}
                style={{
                  width: size,
                  height: size,
                  left: `${15 + (i * 17) % 70}%`,
                }}
                animate={{
                  top: ["102%", "-5%"],
                  x: [0, (i % 2 === 0 ? 6 : -6), (i % 2 === 0 ? -4 : 4), 0],
                  opacity: [0, 0.85, 0.85, 0],
                }}
                transition={{
                  duration: 3.5 + (i % 5) * 1.2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.15,
                }}
              />
            );
          })}
        </div>

        {/* GRADUATED DEPTH RULER */}
        <div className="relative w-full h-full flex justify-center">
          {/* Futuristic online status label at the start */}
          <div className={`absolute -top-10 right-0 flex items-center gap-1.5 bg-slate-950/80 border rounded-full px-3 py-1 text-[8px] font-mono font-bold tracking-wider shadow-sm whitespace-nowrap animate-fadeIn ${activeEnso === "el-nino" ? "border-orange-500/40 text-orange-400" : activeEnso === "la-nina" ? "border-sky-500/40 text-sky-400" : "border-slate-500/40 text-slate-400"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeEnso === "el-nino" ? "bg-orange-400 shadow-[0_0_4px_#f97316]" : activeEnso === "la-nina" ? "bg-sky-400 shadow-[0_0_4px_#38bdf8]" : "bg-slate-400 shadow-[0_0_4px_#94a3b8]"
              }`} />
            REGIONAL IMPACT
          </div>

          {/* Main vertical axis line */}
          <div className={`absolute top-0 bottom-0 w-px transition-colors duration-500 ${activeEnso === "el-nino"
              ? "bg-gradient-to-b from-orange-500/35 via-orange-400/85 to-orange-500/35"
              : activeEnso === "la-nina"
                ? "bg-gradient-to-b from-sky-500/35 via-sky-400/85 to-sky-500/35"
                : "bg-gradient-to-b from-slate-500/35 via-slate-400/85 to-slate-500/35"
            }`} />

          {/* Scrolling HUD crosshair pointer with hover triggers */}
          <motion.div
            className="absolute -translate-y-1/2 w-8 h-8 flex items-center justify-center z-50 pointer-events-auto cursor-pointer"
            style={{ top: indicatorTop }}
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
          >
            {/* Pulsing visual core */}
            <div className={`w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center ${activeEnso === "el-nino" ? "bg-orange-400 shadow-[0_0_12px_#f97316]" : activeEnso === "la-nina" ? "bg-sky-400 shadow-[0_0_12px_#38bdf8]" : "bg-slate-400 shadow-[0_0_12px_#94a3b8]"
              }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            {/* Horizontal cursor crosshairs */}
            <div className={`absolute w-6 h-px ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"}`} />
            <div className={`absolute w-px h-6 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"}`} />

            {/* Level label at circle - Styled as a capsule readout (Hidden on hover to avoid overlap) */}
            {!isRightHovered && (
              <span className={`absolute right-1/2 mr-3 text-[9px] font-mono font-bold bg-slate-950/85 px-2.5 py-0.5 border rounded-full whitespace-nowrap shadow-lg shadow-black/80 backdrop-blur-sm ${activeEnso === "el-nino" ? "text-orange-200 border-orange-400/40" : activeEnso === "la-nina" ? "text-sky-200 border-sky-400/40" : "text-slate-200 border-slate-400/40"
                }`}>
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
                  className={`absolute right-1/2 mr-3 z-50 rounded-lg py-2.5 px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] w-48 pointer-events-none text-left backdrop-blur-md transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-[#1d0f06]/95 border-orange-400/50 text-orange-200/90" : activeEnso === "la-nina" ? "bg-[#0b1c2c]/95 border-sky-400/50 text-sky-200/90" : "bg-[#121824]/95 border-slate-400/50 text-slate-200/90"
                    } ${activeYear <= 1997 ? "top-0" : activeYear >= 2019 ? "bottom-2" : "top-1/2 -translate-y-1/2"
                    }`}
                >
                  <span className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${activeEnso === "el-nino" ? "text-orange-300" : activeEnso === "la-nina" ? "text-sky-300" : "text-slate-300"
                    }`}>
                    {activeYear} PACIFIC CYCLE
                  </span>

                  {/* ENSO Status in bold matching colors */}
                  <span className={`block text-[15px] font-mono font-black mt-1 uppercase leading-none ${ensoDetails.color}`}>
                    {ensoDetails.label}
                  </span>

                  <span className={`block text-[10px] font-mono mt-1.5 font-medium ${activeEnso === "el-nino" ? "text-orange-200/90" : activeEnso === "la-nina" ? "text-sky-200/90" : "text-slate-200/90"
                    }`}>
                    {activeCount} of 21 Nations Rising ({Math.round((activeCount / 21) * 100)}%)
                  </span>
                  <span className={`block text-[8px] font-mono uppercase tracking-wider mt-1 border-t pt-1 ${activeEnso === "el-nino" ? "text-orange-400/70 border-orange-500/20" : activeEnso === "la-nina" ? "text-sky-400/70 border-sky-500/20" : "text-slate-400/70 border-slate-500/20"
                    }`}>
                    REGIONAL CLIMATE STATUS
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Timeline markers aligned symmetrically to vertical axis (Graduated scale) */}
          <div className={`absolute inset-y-0 w-full flex flex-col justify-between py-0 text-[9px] font-mono font-medium transition-colors duration-500 ${activeEnso === "el-nino" ? "text-orange-400/80" : activeEnso === "la-nina" ? "text-sky-400/80" : "text-slate-400/80"
            }`}>
            {timelineTicks.map((tick) => (
              <div
                key={tick.year}
                className="relative w-full h-0.5 flex items-center"
              >
                {tick.major ? (
                  <>
                    <span className={`absolute left-1/2 pl-2 text-left whitespace-nowrap font-semibold transition-colors duration-500 ${activeEnso === "el-nino" ? "text-orange-300" : activeEnso === "la-nina" ? "text-sky-300" : "text-slate-300"
                      }`}>{tick.year}</span>
                    <span className={`absolute left-1/2 -translate-x-1/2 w-3.5 h-px transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"
                      }`} />
                  </>
                ) : (
                  <span className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-px transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400/50" : activeEnso === "la-nina" ? "bg-sky-400/50" : "bg-slate-400/50"
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
