import { useState } from "react";
import { useGetENSOSensitivity } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion, AnimatePresence } from "framer-motion";

const ELNINO_COLOR = "#f97316";
const LANINA_COLOR = "#38bdf8";
const NEUTRAL_COLOR = "#94a3b8";

export function ChapterENSOSensitivity() {
  const { data, isLoading } = useGetENSOSensitivity();
  const [displayCount, setDisplayCount] = useState<10 | 21>(10);
  const [hoveredNation, setHoveredNation] = useState<string | null>(null);

  const nationsList = data?.nations ?? [];
  const displayedNations = nationsList.slice(0, displayCount);

  // Compute scale boundaries in cm for the dumbbell plot
  let minCm = -10;
  let maxCm = 25;

  if (nationsList.length > 0) {
    const allVals = nationsList.flatMap(n => [n.elNinoAvg * 100, n.neutralAvg * 100, n.laNinaAvg * 100]);
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    minCm = Math.floor(minVal - 2);
    maxCm = Math.ceil(maxVal + 2);
  }

  const range = maxCm - minCm;
  const getPct = (valCm: number) => Math.max(0, Math.min(100, ((valCm - minCm) / range) * 100));
  const zeroPct = getPct(0);

  // X-axis ticks (e.g. every 5cm or 10cm)
  const ticks: number[] = [];
  const step = 5;
  const startTick = Math.ceil(minCm / step) * step;
  for (let t = startTick; t <= maxCm; t += step) {
    ticks.push(t);
  }

  const bottom3 = data?.nations.slice(-3).reverse() ?? [];

  return (
    <StorySection id="chapter-enso">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">ENSO Fingerprint</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              The Pacific doesn't just rise steadily — it breathes with ENSO cycles. El Niño events 
              (1997–98, 2015–16) temporarily suppress sea levels, while La Niña events (2010–11, 2020–21) 
              amplify them.
            </p>
          </div>

          {/* Toggle Display Count */}
          <div className="flex bg-card/30 p-1 rounded-full border border-border/50 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => setDisplayCount(10)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                displayCount === 10
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Top 10 Sensitive
            </button>
            <button
              onClick={() => setDisplayCount(21)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                displayCount === 21
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All 21 Nations
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-xs text-muted-foreground bg-card/20 p-3 rounded-xl border border-border/30">
          <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Legend:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <span>El Niño Phase (Warm/Dip)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400" />
            <span>Neutral Phase (Baseline)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span>La Niña Phase (Cool/Surge)</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-sky-400 font-mono">
            <span className="w-6 h-0.5 bg-gradient-to-r from-orange-500 via-slate-400 to-sky-400 inline-block" />
            <span>Horizontal Line = Total ENSO Seesaw Range</span>
          </div>
        </div>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[520px] bg-card/20 animate-pulse rounded-2xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card/20 backdrop-blur-md border border-border/40 rounded-3xl p-6 md:p-8 shadow-2xl"
        >
          {/* X-Axis Scale Header */}
          <div className="relative w-full h-8 border-b border-border/30 mb-4 text-xs font-mono text-muted-foreground">
            {ticks.map((t) => {
              const leftPct = getPct(t);
              return (
                <div
                  key={t}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `calc(180px + (100% - 280px) * ${leftPct / 100})` }}
                >
                  <span className={t === 0 ? "font-bold text-primary" : ""}>
                    {t > 0 ? `+${t}` : t}cm
                  </span>
                  <div className={`w-px h-2 mt-1 ${t === 0 ? "bg-primary" : "bg-border/60"}`} />
                </div>
              );
            })}
          </div>

          {/* Dumbbell Rows */}
          <div className="space-y-4 relative">
            {/* Zero reference vertical guide line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary/25 border-r border-dashed border-primary/40 pointer-events-none z-0"
              style={{ left: `calc(180px + (100% - 280px) * ${zeroPct / 100})` }}
            />

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
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04, duration: 0.5 }}
                  onMouseEnter={() => setHoveredNation(n.code)}
                  onMouseLeave={() => setHoveredNation(null)}
                  className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 group ${
                    isHovered ? "bg-card/60 border border-primary/30 shadow-md scale-[1.01]" : "hover:bg-card/30"
                  }`}
                >
                  {/* Country Name & Code */}
                  <div className="w-[170px] flex items-center gap-2 flex-shrink-0 pr-2">
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

                  {/* Dumbbell Plot Track Area */}
                  <div className="relative flex-1 h-full flex items-center">
                    {/* Connecting Line Track */}
                    <div
                      className="absolute h-1.5 rounded-full transition-all duration-300 shadow-sm"
                      style={{
                        left: `${minPct}%`,
                        width: `${maxPct - minPct}%`,
                        background: `linear-gradient(to right, ${ELNINO_COLOR}, ${NEUTRAL_COLOR}, ${LANINA_COLOR})`,
                        opacity: isHovered ? 1 : 0.75,
                      }}
                    />

                    {/* El Niño Dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background cursor-pointer transition-transform duration-200 group-hover:scale-125 z-10"
                      style={{
                        left: `${elPct}%`,
                        backgroundColor: ELNINO_COLOR,
                        boxShadow: `0 0 10px ${ELNINO_COLOR}`,
                      }}
                      title={`El Niño: ${elCm >= 0 ? "+" : ""}${elCm.toFixed(1)} cm`}
                    />

                    {/* Neutral Dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-background cursor-pointer transition-transform duration-200 group-hover:scale-125 z-10"
                      style={{
                        left: `${neuPct}%`,
                        backgroundColor: NEUTRAL_COLOR,
                      }}
                      title={`Neutral: ${neuCm >= 0 ? "+" : ""}${neuCm.toFixed(1)} cm`}
                    />

                    {/* La Niña Dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background cursor-pointer transition-transform duration-200 group-hover:scale-125 z-10"
                      style={{
                        left: `${laPct}%`,
                        backgroundColor: LANINA_COLOR,
                        boxShadow: `0 0 10px ${LANINA_COLOR}`,
                      }}
                      title={`La Niña: ${laCm >= 0 ? "+" : ""}${laCm.toFixed(1)} cm`}
                    />
                  </div>

                  {/* Range Swing Badge */}
                  <div className="w-[90px] text-right flex-shrink-0 pl-3">
                    <span
                      className={`inline-block text-xs font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                        isHovered
                          ? "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm"
                          : "bg-card/40 text-sky-400/90 border-border/40"
                      }`}
                    >
                      {swingCm.toFixed(1)} cm
                    </span>
                  </div>

                  {/* Floating Detailed Hover Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute right-24 top-[-60px] z-50 bg-neutral-950/95 border border-sky-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs pointer-events-none min-w-[220px]"
                      >
                        <div className="font-bold text-white mb-1.5 flex justify-between items-center border-b border-white/10 pb-1">
                          <span>{n.country} ({n.code})</span>
                          <span className="text-sky-400 font-mono">+{swingCm.toFixed(1)} cm swing</span>
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-orange-400">
                              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                              El Niño (Dip):
                            </span>
                            <span className="font-mono font-bold text-white">
                              {elCm >= 0 ? "+" : ""}{elCm.toFixed(1)} cm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                              Neutral Avg:
                            </span>
                            <span className="font-mono font-bold text-white">
                              {neuCm >= 0 ? "+" : ""}{neuCm.toFixed(1)} cm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-sky-400">
                              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                              La Niña (Surge):
                            </span>
                            <span className="font-mono font-bold text-white">
                              {laCm >= 0 ? "+" : ""}{laCm.toFixed(1)} cm
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border/20 text-xs text-muted-foreground flex justify-between items-center">
            <span>Showing ENSO range from El Niño minimum (orange) to La Niña peak (blue).</span>
            {displayCount === 10 && (
              <button
                onClick={() => setDisplayCount(21)}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Expand to view all 21 nations →
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Summary Highlights */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div>
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: LANINA_COLOR, display: "inline-block" }} />
                Most ENSO-Sensitive Nations
              </h3>
              <div className="flex flex-col gap-3">
                {data.nations.slice(0, 5).map((n, i) => (
                  <div key={n.code} className="flex items-center gap-3 p-3 bg-card/30 border border-border/50 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">{n.country}</div>
                      <div className="text-xs text-muted-foreground">{n.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm" style={{ color: LANINA_COLOR }}>
                        +{(n.sensitivity * 100).toFixed(1)} cm swing
                      </div>
                      <div className="text-xs text-muted-foreground">
                        La Niña {n.laNinaAvg >= 0 ? "+" : ""}{(n.laNinaAvg * 100).toFixed(0)} vs El Niño {n.elNinoAvg >= 0 ? "+" : ""}{(n.elNinoAvg * 100).toFixed(0)} cm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: NEUTRAL_COLOR, display: "inline-block" }} />
                Least ENSO-Sensitive Nations
              </h3>
              <div className="flex flex-col gap-3">
                {bottom3.map((n, i) => (
                  <div key={n.code} className="flex items-center gap-3 p-3 bg-card/30 border border-border/50 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">{n.country}</div>
                      <div className="text-xs text-muted-foreground">{n.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-muted-foreground">
                        {(n.sensitivity * 100).toFixed(1)} cm swing
                      </div>
                      <div className="text-xs text-muted-foreground/70">More decoupled from ENSO</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-card/20 border border-border/30 rounded-lg">
                <div className="text-sm font-semibold text-foreground mb-2">Pacific-wide ENSO effect</div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <div className="font-mono text-sm" style={{ color: ELNINO_COLOR }}>
                      {(data.global.elNinoAvg * 100).toFixed(1)} cm
                    </div>
                    <div className="text-muted-foreground">El Niño avg</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm text-muted-foreground">
                      {(data.global.neutralAvg * 100).toFixed(1)} cm
                    </div>
                    <div className="text-muted-foreground">Neutral avg</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm" style={{ color: LANINA_COLOR }}>
                      {(data.global.laNinaAvg * 100).toFixed(1)} cm
                    </div>
                    <div className="text-muted-foreground">La Niña avg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">ENSO masks but cannot reverse the trend.</span>{" "}
              Even in El Niño years — when sea levels dip — the Pacific-wide average is{" "}
              <span className="text-foreground font-mono">{(data.global.elNinoAvg * 100).toFixed(1)} cm</span>.
              By 2023, this floor has risen so far above the 1993 baseline that even the strongest
              El Niño cannot push levels back to where they started. The baseline itself has shifted.
            </p>
          </div>
        </>
      )}
    </StorySection>
  );
}
