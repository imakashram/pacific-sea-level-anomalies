import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, type MotionValue } from "framer-motion";
import { useGetSeaLevelTrend, useGetAnnualDeviation } from "@workspace/api-client-react";

/**
 * Static 31-year fallback dataset (1993–2023) used when API server data is loading or unavailable.
 */
const FALLBACK_DATA = [
  { year: 1993, avgAnomaly: -0.019, countriesRising: 0, enso: "neutral" },
  { year: 1994, avgAnomaly: -0.005, countriesRising: 0, enso: "neutral" },
  { year: 1995, avgAnomaly: 0, countriesRising: 1, enso: "neutral" },
  { year: 1996, avgAnomaly: 0.019, countriesRising: 4, enso: "neutral" },
  { year: 1997, avgAnomaly: -0.019, countriesRising: 0, enso: "el-nino" },
  { year: 1998, avgAnomaly: -0.062, countriesRising: 1, enso: "el-nino" },
  { year: 1999, avgAnomaly: 0.014, countriesRising: 3, enso: "neutral" },
  { year: 2000, avgAnomaly: 0.033, countriesRising: 7, enso: "neutral" },
  { year: 2001, avgAnomaly: 0.024, countriesRising: 5, enso: "neutral" },
  { year: 2002, avgAnomaly: 0.014, countriesRising: 4, enso: "neutral" },
  { year: 2003, avgAnomaly: 0.01, countriesRising: 2, enso: "neutral" },
  { year: 2004, avgAnomaly: 0.029, countriesRising: 6, enso: "neutral" },
  { year: 2005, avgAnomaly: 0.029, countriesRising: 6, enso: "neutral" },
  { year: 2006, avgAnomaly: 0.043, countriesRising: 9, enso: "neutral" },
  { year: 2007, avgAnomaly: 0.062, countriesRising: 13, enso: "neutral" },
  { year: 2008, avgAnomaly: 0.081, countriesRising: 15, enso: "neutral" },
  { year: 2009, avgAnomaly: 0.057, countriesRising: 12, enso: "neutral" },
  { year: 2010, avgAnomaly: 0.024, countriesRising: 5, enso: "la-nina" },
  { year: 2011, avgAnomaly: 0.076, countriesRising: 16, enso: "la-nina" },
  { year: 2012, avgAnomaly: 0.067, countriesRising: 14, enso: "neutral" },
  { year: 2013, avgAnomaly: 0.067, countriesRising: 14, enso: "neutral" },
  { year: 2014, avgAnomaly: 0.052, countriesRising: 11, enso: "neutral" },
  { year: 2015, avgAnomaly: 0.029, countriesRising: 9, enso: "el-nino" },
  { year: 2016, avgAnomaly: 0.033, countriesRising: 7, enso: "el-nino" },
  { year: 2017, avgAnomaly: 0.1, countriesRising: 21, enso: "neutral" },
  { year: 2018, avgAnomaly: 0.086, countriesRising: 18, enso: "neutral" },
  { year: 2019, avgAnomaly: 0.09, countriesRising: 19, enso: "neutral" },
  { year: 2020, avgAnomaly: 0.1, countriesRising: 21, enso: "la-nina" },
  { year: 2021, avgAnomaly: 0.124, countriesRising: 21, enso: "la-nina" },
  { year: 2022, avgAnomaly: 0.133, countriesRising: 21, enso: "neutral" },
  { year: 2023, avgAnomaly: 0.105, countriesRising: 21, enso: "neutral" }
];

/**
 * ENSO phase configuration mapping for colors and human-readable badges.
 */
const ENSO_MAPPING = {
  "el-nino": { label: "EL NIÑO (WARM)", color: "text-orange-400" },
  "la-nina": { label: "LA NIÑA (COOL)", color: "text-sky-400" },
  neutral: { label: "NEUTRAL", color: "text-slate-400" }
} as const;

/**
 * Pre-computed graduated timeline ticks (1993 to 2023) with major 5-year milestones.
 */
const TIMELINE_TICKS = Array.from({ length: 2023 - 1993 + 1 }, (_, i) => {
  const year = 1993 + i;
  const majorYears = [1993, 1998, 2003, 2008, 2013, 2018, 2023];
  return {
    year,
    major: majorYears.includes(year)
  };
});

/**
 * Pre-calculated particle parameters for floating marine snow.
 */
const SNOW_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 1 + (i % 2),
  left: 20 + (i * 23) % 60,
  xOffset: i % 2 === 0 ? 5 : -5,
  duration: 8 + (i % 3) * 3,
  delay: i * 0.4
}));

/**
 * Pre-calculated particle parameters for rising ocean bubbles.
 */
const BUBBLE_PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  size: 1.5 + (i % 4) * 0.8,
  left: 15 + (i * 17) % 70,
  xOffset1: i % 2 === 0 ? 6 : -6,
  xOffset2: i % 2 === 0 ? -4 : 4,
  duration: 3.5 + (i % 5) * 1.2,
  delay: i * 0.15
}));

/**
 * Props definition for the reusable ocean gauge column.
 */
interface GaugeColumnProps {
  position: "left" | "right";
  title: string;
  activeEnso: string;
  activeAvg: number;
  activeCount: number;
  activeYear: number;
  indicatorTop: MotionValue<string>;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}

/**
 * Reusable Ocean Gauge Column component rendering either the Left (Hydro-Gauge) or Right (Thermal Gauge) margin telemetry.
 */
function GaugeColumn({
  position,
  title,
  activeEnso,
  activeAvg,
  activeCount,
  activeYear,
  indicatorTop,
  isHovered,
  onHoverChange
}: GaugeColumnProps) {
  const isLeft = position === "left";
  const ensoDetails = ENSO_MAPPING[activeEnso as keyof typeof ENSO_MAPPING] ?? ENSO_MAPPING.neutral;

  // Wave path fill color based on ENSO phase
  const waveFillColor =
    activeEnso === "el-nino" ? "#f97316" : activeEnso === "la-nina" ? "#38bdf8" : "#94a3b8";

  return (
    <div
      className={`fixed ${isLeft ? "left-4 bg-gradient-to-r" : "right-4 bg-gradient-to-l"
        } top-0 bottom-0 w-20 pointer-events-none select-none z-40 hidden xl:flex flex-col justify-between pt-12 pb-4 px-1 overflow-visible from-background/95 via-background/20 to-transparent`}
    >
      {/* Soft background ambient blur spots */}
      <div
        className={`absolute top-1/3 ${isLeft ? "left-[-120px]" : "right-[-120px]"
          } w-64 h-64 rounded-full transition-all duration-500 blur-[80px] ${activeEnso === "el-nino"
            ? "bg-orange-600/5"
            : activeEnso === "la-nina"
              ? "bg-sky-600/5"
              : "bg-slate-600/5"
          } ${isHovered ? "opacity-100" : "opacity-40"}`}
      />
      <div
        className={`absolute bottom-1/3 ${isLeft ? "left-[-120px]" : "right-[-120px]"
          } w-64 h-64 rounded-full transition-all duration-500 blur-[80px] ${activeEnso === "el-nino"
            ? "bg-rose-600/5"
            : activeEnso === "la-nina"
              ? "bg-blue-600/5"
              : "bg-slate-600/5"
          } ${isHovered ? "opacity-100" : "opacity-40"}`}
      />

      {/* Sea water liquid fill body */}
      <div
        className={`absolute inset-0 border-x transition-colors duration-500 overflow-hidden ${activeEnso === "el-nino"
            ? "bg-gradient-to-b from-rose-950/75 via-orange-950/55 to-amber-900/70 border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.25)]"
            : activeEnso === "la-nina"
              ? "bg-gradient-to-b from-sky-950/75 via-blue-950/55 to-cyan-900/70 border-sky-500/30 shadow-[inset_0_0_20px_rgba(56,189,248,0.25)]"
              : "bg-gradient-to-b from-slate-950/75 via-slate-900/55 to-slate-900/70 border-slate-500/30 shadow-[inset_0_0_20px_rgba(148,163,184,0.15)]"
          }`}
      >
        {/* Dynamic rising water level indicator */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 border-t shadow-md transition-colors duration-500 ${activeEnso === "el-nino"
              ? "bg-gradient-to-t from-orange-600/40 via-amber-500/30 to-orange-400/50 border-orange-300/60 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
              : activeEnso === "la-nina"
                ? "bg-gradient-to-t from-sky-600/40 via-blue-500/30 to-cyan-400/50 border-sky-300/60 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                : "bg-gradient-to-t from-slate-600/40 via-slate-500/30 to-slate-400/50 border-slate-300/60 shadow-[0_0_12px_rgba(148,163,184,0.3)]"
            }`}
          style={{ top: indicatorTop }}
        >
          {/* Wave crest at water surface */}
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
                fill={waveFillColor}
              />
            </motion.svg>
          </div>

          {/* Shimmering volumetric light rays */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen"
            style={{
              background:
                "repeating-linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 8%, rgba(255,255,255,0.06) 12%, rgba(255,255,255,0) 16%)",
              backgroundSize: "200% 200%"
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 50%"]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Ocean surface light bloom */}
          <div
            className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-b to-transparent pointer-events-none mix-blend-screen transition-colors duration-500 ${activeEnso === "el-nino"
                ? "from-orange-400/30"
                : activeEnso === "la-nina"
                  ? "from-sky-300/35"
                  : "from-slate-300/25"
              }`}
          />

          {/* 3D cylindrical glass vignette & depth shadows */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_15%,rgba(255,255,255,0)_85%,rgba(255,255,255,0.03)_100%)] pointer-events-none z-10" />

          {/* Floating marine snow particles */}
          {SNOW_PARTICLES.map((snow) => (
            <motion.div
              key={`snow-${position}-${snow.id}`}
              className="absolute rounded-full bg-white/25 blur-[0.5px]"
              style={{
                width: snow.size,
                height: snow.size,
                left: `${snow.left}%`
              }}
              animate={{
                top: ["100%", "0%"],
                x: [0, snow.xOffset, 0],
                opacity: [0, 0.45, 0.45, 0]
              }}
              transition={{
                duration: snow.duration,
                repeat: Infinity,
                ease: "linear",
                delay: snow.delay
              }}
            />
          ))}
        </motion.div>

        {/* Animated bubble particles */}
        {BUBBLE_PARTICLES.map((b) => (
          <motion.div
            key={`bubble-${position}-${b.id}`}
            className={`absolute rounded-full border border-white/25 shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-colors duration-500 ${activeEnso === "el-nino"
                ? "bg-orange-200/40 shadow-orange-500/30"
                : activeEnso === "la-nina"
                  ? "bg-sky-200/40 shadow-sky-500/30"
                  : "bg-slate-200/30 shadow-slate-500/20"
              }`}
            style={{
              width: b.size,
              height: b.size,
              left: `${b.left}%`
            }}
            animate={{
              top: ["102%", "-5%"],
              x: [0, b.xOffset1, b.xOffset2, 0],
              opacity: [0, 0.85, 0.85, 0]
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              ease: "linear",
              delay: b.delay
            }}
          />
        ))}
      </div>

      {/* Graduated Depth Ruler */}
      <div className="relative w-full h-full flex justify-center">
        {/* Status indicator capsule badge */}
        <div
          className={`absolute -top-10 ${isLeft ? "left-0" : "right-0"
            } flex items-center gap-1.5 bg-slate-950/80 border rounded-full px-3 py-1 text-[8px] font-mono font-bold tracking-wider shadow-sm whitespace-nowrap animate-fadeIn transition-colors duration-500 ${activeEnso === "el-nino"
              ? "border-orange-500/40 text-orange-400"
              : activeEnso === "la-nina"
                ? "border-sky-500/40 text-sky-400"
                : "border-slate-500/40 text-slate-400"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500 ${activeEnso === "el-nino"
                ? "bg-orange-400 shadow-[0_0_4px_#f97316]"
                : activeEnso === "la-nina"
                  ? "bg-sky-400 shadow-[0_0_4px_#38bdf8]"
                  : "bg-slate-400 shadow-[0_0_4px_#94a3b8]"
              }`}
          />
          {title}
        </div>

        {/* Vertical ruler center axis */}
        <div
          className={`absolute top-0 bottom-0 w-px transition-colors duration-500 ${activeEnso === "el-nino"
              ? "bg-gradient-to-b from-orange-500/35 via-orange-400/85 to-orange-500/35"
              : activeEnso === "la-nina"
                ? "bg-gradient-to-b from-sky-500/35 via-sky-400/85 to-sky-500/35"
                : "bg-gradient-to-b from-slate-500/35 via-slate-400/85 to-slate-500/35"
            }`}
        />

        {/* Interactive HUD pointer cursor with hover tooltips */}
        <motion.div
          className="absolute -translate-y-1/2 w-8 h-8 flex items-center justify-center z-50 pointer-events-auto cursor-pointer"
          style={{ top: indicatorTop }}
          onMouseEnter={() => onHoverChange(true)}
          onMouseLeave={() => onHoverChange(false)}
        >
          {/* Pulsing core dot */}
          <div
            className={`w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center transition-colors duration-500 ${activeEnso === "el-nino"
                ? "bg-orange-400 shadow-[0_0_12px_#f97316]"
                : activeEnso === "la-nina"
                  ? "bg-sky-400 shadow-[0_0_12px_#38bdf8]"
                  : "bg-slate-400 shadow-[0_0_12px_#94a3b8]"
              }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>

          {/* Crosshair target lines */}
          <div
            className={`absolute w-6 h-px transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"
              }`}
          />
          <div
            className={`absolute w-px h-6 transition-colors duration-500 ${activeEnso === "el-nino" ? "bg-orange-400" : activeEnso === "la-nina" ? "bg-sky-400" : "bg-slate-400"
              }`}
          />

          {/* Compact value label (hidden when hovered to prevent tooltip overlap) */}
          {!isHovered && (
            <span
              className={`absolute ${isLeft ? "left-1/2 ml-3" : "right-1/2 mr-3"
                } text-[9px] font-mono font-bold bg-slate-950/85 px-2.5 py-0.5 border rounded-full whitespace-nowrap shadow-lg shadow-black/80 backdrop-blur-sm transition-colors duration-500 ${activeEnso === "el-nino"
                  ? "text-orange-200 border-orange-400/40"
                  : activeEnso === "la-nina"
                    ? "text-sky-200 border-sky-400/40"
                    : "text-slate-200 border-slate-400/40"
                }`}
            >
              {isLeft
                ? `${activeAvg > 0 ? "+" : ""}${(activeAvg * 100).toFixed(1)} cm`
                : `${activeCount} / 21`}
            </span>
          )}

          {/* Detailed hover tooltip card */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -10 : 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isLeft ? -10 : 10, scale: 0.95 }}
                className={`absolute ${isLeft ? "left-1/2 ml-3" : "right-1/2 mr-3"
                  } z-50 rounded-lg py-2.5 px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] w-48 pointer-events-none text-left backdrop-blur-md transition-colors duration-500 ${activeEnso === "el-nino"
                    ? "bg-[#1d0f06]/95 border-orange-400/50 text-orange-200/90"
                    : activeEnso === "la-nina"
                      ? "bg-[#0b1c2c]/95 border-sky-400/50 text-sky-200/90"
                      : "bg-[#121824]/95 border-slate-400/50 text-slate-200/90"
                  } ${activeYear <= 1997 ? "top-0" : activeYear >= 2019 ? "bottom-2" : "top-1/2 -translate-y-1/2"}`}
              >
                <span
                  className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${activeEnso === "el-nino"
                      ? "text-orange-300"
                      : activeEnso === "la-nina"
                        ? "text-sky-300"
                        : "text-slate-300"
                    }`}
                >
                  {activeYear} {isLeft ? "TELEMETRY" : "PACIFIC CYCLE"}
                </span>

                {isLeft ? (
                  <span className="block text-[18px] font-mono font-black text-white mt-1 leading-none">
                    {activeAvg > 0 ? "+" : ""}{(activeAvg * 100).toFixed(2)} cm
                  </span>
                ) : (
                  <span
                    className={`block text-[15px] font-mono font-black mt-1 uppercase leading-none ${ensoDetails.color}`}
                  >
                    {ensoDetails.label}
                  </span>
                )}

                <span
                  className={`block text-[10px] font-mono mt-1.5 font-medium ${activeEnso === "el-nino"
                      ? "text-orange-200/90"
                      : activeEnso === "la-nina"
                        ? "text-sky-200/90"
                        : "text-slate-200/90"
                    }`}
                >
                  {activeCount} of 21 Nations Rising ({Math.round((activeCount / 21) * 100)}%)
                </span>

                <span
                  className={`block text-[8px] font-mono uppercase tracking-wider mt-1 border-t pt-1 ${activeEnso === "el-nino"
                      ? "text-orange-400/70 border-orange-500/20"
                      : activeEnso === "la-nina"
                        ? "text-sky-400/70 border-sky-500/20"
                        : "text-slate-400/70 border-slate-500/20"
                    }`}
                >
                  {isLeft ? "PACIFIC SEA LEVEL ANOMALY" : "REGIONAL CLIMATE STATUS"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Graduated timeline ticks */}
        <div
          className={`absolute inset-y-0 w-full flex flex-col justify-between py-0 text-[9px] font-mono font-medium transition-colors duration-500 ${activeEnso === "el-nino"
              ? "text-orange-400/80"
              : activeEnso === "la-nina"
                ? "text-sky-400/80"
                : "text-slate-400/80"
            }`}
        >
          {TIMELINE_TICKS.map((tick) => (
            <div key={tick.year} className="relative w-full h-0.5 flex items-center">
              {tick.major ? (
                <>
                  <span
                    className={`absolute ${isLeft ? "right-1/2 pr-2 text-right" : "left-1/2 pl-2 text-left"
                      } whitespace-nowrap font-semibold transition-colors duration-500 ${activeEnso === "el-nino"
                        ? "text-orange-300"
                        : activeEnso === "la-nina"
                          ? "text-sky-300"
                          : "text-slate-300"
                      }`}
                  >
                    {tick.year}
                  </span>
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 w-3.5 h-px transition-colors duration-500 ${activeEnso === "el-nino"
                        ? "bg-orange-400"
                        : activeEnso === "la-nina"
                          ? "bg-sky-400"
                          : "bg-slate-400"
                      }`}
                  />
                </>
              ) : (
                <span
                  className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-px transition-colors duration-500 ${activeEnso === "el-nino"
                      ? "bg-orange-400/50"
                      : activeEnso === "la-nina"
                        ? "bg-sky-400/50"
                        : "bg-slate-400/50"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * OceanDecorations Component
 *
 * Renders interactive ambient margin hydro-gauges synced to document scroll progress and ENSO phase telemetry.
 */
export function OceanDecorations() {
  const { scrollYProgress } = useScroll();

  // Fetch telemetry datasets via workspace API hooks
  const { data: trendData } = useGetSeaLevelTrend();
  const { data: deviationData } = useGetAnnualDeviation();

  // Telemetry state synced with scroll position
  const [activeYear, setActiveYear] = useState(1993);
  const [activeAvg, setActiveAvg] = useState(0.018);
  const [activeCount, setActiveCount] = useState(8);
  const [activeEnso, setActiveEnso] = useState("neutral");

  // Hover states for tooltips
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);

  // Scroll mapping for vertical indicator positioning
  const indicatorTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Dynamically map API telemetry or fallback data to current scroll progress
  useEffect(() => {
    const trendList = trendData ?? [];
    const devList = deviationData?.deviations ?? [];

    let dataset = FALLBACK_DATA;
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

  return (
    <>
      {/* Left Margin Hydro-Gauge (Sea Level Anomaly Readout) */}
      <GaugeColumn
        position="left"
        title="PACIFIC SLA"
        activeEnso={activeEnso}
        activeAvg={activeAvg}
        activeCount={activeCount}
        activeYear={activeYear}
        indicatorTop={indicatorTop}
        isHovered={isLeftHovered}
        onHoverChange={setIsLeftHovered}
      />

      {/* Right Margin Thermal Gauge (Regional Impact & ENSO Status) */}
      <GaugeColumn
        position="right"
        title="REGIONAL IMPACT"
        activeEnso={activeEnso}
        activeAvg={activeAvg}
        activeCount={activeCount}
        activeYear={activeYear}
        indicatorTop={indicatorTop}
        isHovered={isRightHovered}
        onHoverChange={setIsRightHovered}
      />
    </>
  );
}
