import { useState, useEffect, useRef } from "react";
import { useGetEnsoEffect } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion, AnimatePresence, Variants, useMotionValue, animate } from "framer-motion";
import { TrendingUp, Globe, Activity, TrendingDown } from "lucide-react";

const ELNINO_COLOR = "#f97316";
const LANINA_COLOR = "#38bdf8";
const NEUTRAL_COLOR = "#94a3b8";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  useLocale?: boolean;
}

function AnimatedCounter({
  value,
  decimals = 1,
  prefix = "",
  suffix = "",
  useLocale = false,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      onUpdate: (latest) => {
        if (ref.current) {
          if (useLocale) {
            ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
          } else {
            ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
          }
        }
      },
    });
    return () => controls.stop();
  }, [value, decimals, prefix, suffix, useLocale, motionValue]);

  return (
    <span ref={ref}>
      {prefix}
      {useLocale ? Math.floor(value).toLocaleString() : value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Framer Motion Animation Variants
const cardContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 14,
    },
  },
};

const trendingUpIconVariants: Variants = {
  hover: {
    y: -4,
    scale: 1.15,
    transition: { type: "spring" as const, stiffness: 300, damping: 10 },
  },
};

const activityIconVariants: Variants = {
  hover: {
    scale: 1.25,
    strokeWidth: 2.5,
    transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 0.6 },
  },
};

const trendingDownIconVariants: Variants = {
  hover: {
    y: 4,
    scale: 1.15,
    transition: { type: "spring" as const, stiffness: 300, damping: 10 },
  },
};

const globeIconVariants: Variants = {
  hover: {
    rotate: 360,
    transition: { ease: "linear" as const, duration: 8, repeat: Infinity },
  },
};

const listContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function ENSOEffect() {
  // Hook: ENSO Sensitivity
  const { data: ensoData, isLoading, isError } = useGetEnsoEffect();
  const [displayCount, setDisplayCount] = useState<10 | 21>(10);
  const [hoveredNation, setHoveredNation] = useState<string | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // ENSO tab processing
  const nationsList = ensoData?.nations ?? [];
  const displayedNations = nationsList.slice(0, displayCount);

  let minCm = -10;
  let maxCm = 25;
  if (nationsList.length > 0) {
    const allVals = nationsList.flatMap((n) => [
      n.elNinoAvg * 100,
      n.neutralAvg * 100,
      n.laNinaAvg * 100,
    ]);
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    minCm = Math.floor(minVal - 2);
    maxCm = Math.ceil(maxVal + 2);
  }
  const range = maxCm - minCm;
  const getPct = (valCm: number) =>
    Math.max(0, Math.min(100, ((valCm - minCm) / range) * 100));
  const zeroPct = getPct(0);

  const ticks: number[] = [];
  const step = 5;
  const startTick = Math.ceil(minCm / step) * step;
  for (let t = startTick; t <= maxCm; t += step) {
    ticks.push(t);
  }

  return (
    <StorySection id="chapter-enso" className="relative">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center flex flex-col items-center"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">
              The ENSO Effect
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              El Niño and La Niña are natural climate events that cause sea levels in the Pacific to rise and fall for a short time. This section shows how these events affect sea levels alongside the long-term rise.
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="h-[520px] bg-card/20 animate-pulse rounded-2xl" />
        ) : isError ? null : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Summary Highlights */}
            {ensoData && (
              <motion.div
                variants={cardContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 text-left"
              >
                {/* Card 1: Most Affected by El Niño & La Niña */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{
                    y: -6,
                    borderColor: "rgba(6, 182, 212, 0.5)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                    boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.08)",
                  }}
                  className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
                >
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                      Most Affected by El Niño & La Niña
                    </span>
                    <motion.div
                      variants={trendingUpIconVariants}
                      className="text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-serif font-bold tracking-tight text-cyan-400">
                    +<AnimatedCounter value={ensoData.nations[0]?.sensitivity * 100} decimals={1} />
                    <span className="text-sm font-sans text-muted-foreground ml-1">
                      cm change
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Guam and Palau show the biggest sea level changes during El Niño and La Niña.
                  </div>
                </motion.div>

                {/* Card 2: Least Affected by El Niño & La Niña */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{
                    y: -6,
                    borderColor: "rgba(20, 184, 166, 0.5)",
                    backgroundColor: "rgba(20, 184, 166, 0.05)",
                    boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.08)",
                  }}
                  className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
                >
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                      Least Affected by El Niño & La Niña
                    </span>
                    <motion.div
                      variants={activityIconVariants}
                      className="text-teal-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Activity className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-serif font-bold tracking-tight text-teal-400">
                    <AnimatedCounter value={ensoData.nations[ensoData.nations.length - 1]?.sensitivity * 100} decimals={1} />
                    <span className="text-sm font-sans text-muted-foreground ml-1">
                      cm change
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    New Caledonia and French Polynesia show little or no change during these events.
                  </div>
                </motion.div>

                {/* Card 3: During El Niño */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{
                    y: -6,
                    borderColor: "rgba(249, 115, 22, 0.5)",
                    backgroundColor: "rgba(249, 115, 22, 0.05)",
                    boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.08)",
                  }}
                  className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
                >
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                      During El Niño
                    </span>
                    <motion.div
                      variants={trendingDownIconVariants}
                      className="text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <TrendingDown className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-serif font-bold tracking-tight text-orange-400 flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-sm font-sans font-semibold text-muted-foreground">Average drop:</span>
                    <span>
                      <AnimatedCounter value={ensoData.global.elNinoAvg * 100} decimals={1} />
                      <span className="text-sm font-sans text-muted-foreground ml-1">cm</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Sea levels fall for a short time, but the long-term rise continues.
                  </div>
                </motion.div>

                {/* Card 4: During La Niña */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{
                    y: -6,
                    borderColor: "rgba(56, 189, 248, 0.5)",
                    backgroundColor: "rgba(56, 189, 248, 0.05)",
                    boxShadow: "0 10px 25px -5px rgba(56, 189, 248, 0.08)",
                  }}
                  className="p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 group shadow-sm cursor-default"
                >
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                      During La Niña
                    </span>
                    <motion.div
                      variants={globeIconVariants}
                      className="text-sky-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Globe className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-serif font-bold tracking-tight text-sky-400 flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-sm font-sans font-semibold text-muted-foreground">Average rise:</span>
                    <span>
                      +<AnimatedCounter value={ensoData.global.laNinaAvg * 100} decimals={1} />
                      <span className="text-sm font-sans text-muted-foreground ml-1">cm</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Higher sea levels increase the risk of coastal flooding.
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Controls for ENSO Fingerprint */}
            <div className="flex justify-end mb-6">
              <div className="flex bg-card/30 p-1 rounded-lg border border-border/50 flex-shrink-0 relative overflow-hidden">
                <button
                  onClick={() => setDisplayCount(10)}
                  aria-pressed={displayCount === 10}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer relative z-10 ${displayCount === 10
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {displayCount === 10 && (
                    <motion.div
                      layoutId="activeEnsoTab"
                      className="absolute inset-0 bg-primary rounded-md -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  Top 10 Sensitive
                </button>
                <button
                  onClick={() => setDisplayCount(21)}
                  aria-pressed={displayCount === 21}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer relative z-10 ${displayCount === 21
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {displayCount === 21 && (
                    <motion.div
                      layoutId="activeEnsoTab"
                      className="absolute inset-0 bg-primary rounded-md -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  All 21 Nations
                </button>
              </div>
            </div>

            {/* Dumbbell Chart Panel */}
            <div className="w-full border border-border/30 rounded-xl p-6 bg-card/30 backdrop-blur-md relative z-10 dumbbell-panel">
              {/* Chart Header */}
              <div className="mb-6 pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="text-left flex-1">
                  <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
                    Sea Level Changes During El Niño & La Niña (1993–2023)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                    Shows the average sea level during El Niño, Neutral, and La Niña years, and the total difference between the highest and lowest levels.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sky-400 font-mono text-[10px] sm:mb-1 flex-shrink-0 self-end sm:self-auto">
                  <span className="w-6 h-0.5 bg-gradient-to-r from-orange-500 via-slate-400 to-sky-400 inline-block" />
                  <span>Connecting line = Total sea level change during El Niño & La Niña</span>
                </div>
              </div>

              {/* X-Axis Scale Header */}
              <div className="flex items-center w-full h-8 border-b border-border/30 mb-4 text-xs font-mono text-muted-foreground px-3 gap-0">
                {/* Left spacer matching row label width */}
                <div className="w-full sm:w-[170px] sm:flex-shrink-0 pr-2 hidden sm:block" />

                {/* Ticks container matching track area */}
                <div className="relative flex-1 h-full">
                  {ticks.map((t) => {
                    const leftPct = getPct(t);
                    return (
                      <div
                        key={t}
                        className="absolute transform -translate-x-1/2 flex flex-col items-center top-0"
                        style={{ left: `${leftPct}%` }}
                      >
                        <span
                          className={t === 0 ? "font-bold text-primary" : ""}
                        >
                          {t > 0 ? `+${t}` : t}cm
                        </span>
                        <div
                          className={`w-px h-2 mt-1 ${t === 0 ? "bg-primary" : "bg-border/60"}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right spacer matching badge width */}
                <div className="w-[80px] sm:w-[90px] flex-shrink-0" />
              </div>

              {/* Dumbbell Rows */}
              <motion.div
                variants={listContainerVariants}
                className="space-y-4 relative"
              >
                {/* Zero reference vertical guide line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary/25 border-r border-dashed border-primary/40 pointer-events-none z-0"
                  style={{
                    left: `calc(var(--left-offset) + (100% - var(--total-subtraction)) * ${zeroPct / 100})`,
                  }}
                />

                <AnimatePresence mode="popLayout">
                  {displayedNations.map((n, idx) => {
                    const elCm = n.elNinoAvg * 100;
                    const neuCm = n.neutralAvg * 100;
                    const laCm = n.laNinaAvg * 100;
                    const swingCm = n.sensitivity * 100;

                    const elPct = getPct(elCm);
                    const neuPct = getPct(neuCm);
                    const laPct = getPct(laCm);

                    const minPct = Math.min(elPct, laPct);
                    const maxPct = Math.max(elPct, laPct);

                    const isHovered = hoveredNation === n.code;

                    return (
                      <motion.div
                        key={n.code}
                        variants={rowVariants}
                        layout="position"
                        initial="hidden"
                        animate={{
                          opacity: hoveredNation && hoveredNation !== n.code ? 0.35 : 1,
                          y: 0,
                          scale: isHovered ? 1.015 : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.95, y: -15, transition: { duration: 0.15 } }}
                        transition={{
                          opacity: { duration: 0.2 },
                          scale: { type: "spring", stiffness: 400, damping: 20 },
                          y: { type: "spring", stiffness: 100, damping: 15, delay: idx * 0.015 },
                          layout: { type: "spring", stiffness: 300, damping: 25 },
                        }}
                        onMouseEnter={() => setHoveredNation(n.code)}
                        onMouseMove={(e) => {
                          const rect =
                            e.currentTarget.parentElement?.getBoundingClientRect();
                          if (rect) {
                            setHoverCoords({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredNation(null);
                          setHoverCoords(null);
                        }}
                        className={`relative flex flex-col sm:flex-row items-stretch sm:items-center py-2.5 sm:py-0 h-auto sm:h-10 px-3 rounded-xl border gap-2 sm:gap-0 transition-[background-color,border-color,box-shadow] duration-200 group z-10 ${isHovered
                            ? "bg-card/60 border-primary/30 shadow-md"
                            : "border-transparent hover:bg-card/25"
                          }`}
                      >
                        {/* Country Name & Code */}
                        <div className="w-full sm:w-[170px] flex items-center gap-2 flex-shrink-0 pr-2">
                          <span className="text-xs font-mono font-semibold text-muted-foreground/60 w-5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {n.country}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/60">
                            ({n.code})
                          </span>
                        </div>

                        {/* Dumbbell Plot Track Area and Badge (grouped together for responsive layout alignment) */}
                        <div className="flex items-center w-full sm:flex-1 h-6 sm:h-full gap-3">
                          <div className="relative flex-1 h-full flex items-center">
                            {/* Connecting Line Track */}
                            <motion.div
                              className="absolute h-1.5 rounded-full shadow-sm"
                              animate={{
                                height: isHovered ? 6 : 4,
                                opacity: isHovered ? 1 : 0.75,
                              }}
                              transition={{ duration: 0.2 }}
                              style={{
                                left: `${minPct}%`,
                                width: `${maxPct - minPct}%`,
                                background: `linear-gradient(to right, ${ELNINO_COLOR}, ${NEUTRAL_COLOR}, ${LANINA_COLOR})`,
                              }}
                            />

                            {/* El Niño Dot */}
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background cursor-pointer z-10"
                              animate={{
                                scale: isHovered ? 1.35 : 1,
                                boxShadow: isHovered
                                  ? `0 0 14px ${ELNINO_COLOR}`
                                  : `0 0 6px ${ELNINO_COLOR}`,
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 18 }}
                              style={{
                                left: `${elPct}%`,
                                backgroundColor: ELNINO_COLOR,
                              }}
                              title={`El Niño: ${elCm >= 0 ? "+" : ""}${elCm.toFixed(1)} cm`}
                            />

                            {/* Neutral Dot */}
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-background cursor-pointer z-10"
                              animate={{
                                scale: isHovered ? 1.35 : 1,
                                boxShadow: isHovered
                                  ? `0 0 10px ${NEUTRAL_COLOR}`
                                  : `0 0 0px ${NEUTRAL_COLOR}`,
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 18 }}
                              style={{
                                left: `${neuPct}%`,
                                backgroundColor: NEUTRAL_COLOR,
                              }}
                              title={`Neutral: ${neuCm >= 0 ? "+" : ""}${neuCm.toFixed(1)} cm`}
                            />

                            {/* La Niña Dot */}
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background cursor-pointer z-10"
                              animate={{
                                scale: isHovered ? 1.35 : 1,
                                boxShadow: isHovered
                                  ? `0 0 14px ${LANINA_COLOR}`
                                  : `0 0 6px ${LANINA_COLOR}`,
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 18 }}
                              style={{
                                left: `${laPct}%`,
                                backgroundColor: LANINA_COLOR,
                              }}
                              title={`La Niña: ${laCm >= 0 ? "+" : ""}${laCm.toFixed(1)} cm`}
                            />
                          </div>

                          {/* Range Swing Badge */}
                          <div className="w-[80px] sm:w-[90px] text-right flex-shrink-0 pl-3">
                            <span
                              className={`inline-block text-xs font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${isHovered
                                  ? "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm"
                                  : "bg-card/40 text-sky-400/90 border-border/40"
                                }`}
                            >
                              {swingCm.toFixed(1)} cm
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>


                {/* Floating Detailed Hover Tooltip (rendered outside rows loop) */}
                <AnimatePresence>
                  {hoveredNation &&
                    hoverCoords &&
                    (() => {
                      const n = nationsList.find(
                        (nat) => nat.code === hoveredNation,
                      );
                      if (!n) return null;

                      const elCm = n.elNinoAvg * 100;
                      const neuCm = n.neutralAvg * 100;
                      const laCm = n.laNinaAvg * 100;
                      const swingCm = n.sensitivity * 100;

                      const tooltipWidth = 250;
                      const tooltipHeight = 150;

                      let tooltipX = hoverCoords.x + 15;
                      let tooltipY = hoverCoords.y - tooltipHeight - 10;

                      // Flip vertically if it would clip above the top boundary of the container
                      if (hoverCoords.y < tooltipHeight + 10) {
                        tooltipY = hoverCoords.y + 20;
                      }

                      // Adjust horizontally to prevent clipping on the right edge
                      if (hoverCoords.x > 350) {
                        tooltipX = hoverCoords.x - tooltipWidth - 15;
                      }

                      // Clamp X so it doesn't bleed off the left side
                      if (tooltipX < 10) {
                        tooltipX = 10;
                      }

                      return (
                        <motion.div
                          key="enso-tooltip"
                          initial={{ opacity: 0, scale: 0.95, x: tooltipX, y: tooltipY }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            x: tooltipX,
                            y: tooltipY,
                          }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            opacity: { duration: 0.15 },
                            scale: { duration: 0.15 },
                            x: { type: "spring", damping: 28, stiffness: 220 },
                            y: { type: "spring", damping: 28, stiffness: 220 },
                          }}
                          className="absolute z-50 bg-[#0b1528]/95 border border-sky-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(56,189,248,0.15)] backdrop-blur-md min-w-[250px] w-max font-mono pointer-events-none text-left left-0 top-0"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5 gap-4">
                            <span
                              className="font-serif text-sm font-bold text-white truncate max-w-[140px]"
                              title={`${n.country} (${n.code})`}
                            >
                              {n.country}
                            </span>
                            <span className="text-[10px] text-sky-400 font-semibold tracking-wider flex-shrink-0">
                              {swingCm.toFixed(1)} CM SWING
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center gap-6">
                              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                                El Niño (Dip)
                              </span>
                              <span className="font-bold text-white text-sm">
                                {elCm >= 0 ? "+" : ""}
                                {elCm.toFixed(1)} cm
                              </span>
                            </div>
                            <div className="flex justify-between items-center gap-6">
                              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                                Neutral Average
                              </span>
                              <span className="font-bold text-white text-sm">
                                {neuCm >= 0 ? "+" : ""}
                                {neuCm.toFixed(1)} cm
                              </span>
                            </div>
                            <div className="flex justify-between items-center gap-6">
                              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                                La Niña (Surge)
                              </span>
                              <span className="font-bold text-white text-sm">
                                {laCm >= 0 ? "+" : ""}
                                {laCm.toFixed(1)} cm
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                </AnimatePresence>
              </motion.div>

              {/* Expand view button */}
              <div className="mt-6 pt-4 border-t border-border/20 text-xs text-muted-foreground flex justify-end items-center">
                {displayCount === 10 && (
                  <button
                    onClick={() => setDisplayCount(21)}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Expand to view all 21 nations →
                  </button>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                  <span>El Niño Phase (Warm/Dip)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Neutral Phase (Baseline)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                  <span>La Niña Phase (Cool/Surge)</span>
                </div>
              </div>

              {/* Interaction Helper Text */}
              <p className="text-center text-xs text-muted-foreground mt-4 font-sans">
                Move your mouse over a nation to see its sea level change. The length of the colored bar shows the total change between El Niño and La Niña. Longer bars mean bigger changes in sea level.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </StorySection>
  );
}
