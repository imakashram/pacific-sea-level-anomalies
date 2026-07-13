import { StorySection } from "./StorySection";
import { motion, useInView } from "framer-motion";
import { useGetDecadeAnalysis, useGetAcceleration, useGetClimateOverview, useGetThresholdCrossings, useGetRankings } from "@workspace/api-client-react";
import { useEffect, useRef, useState } from "react";

function AnimatedCount({ target, decimals = 0, prefix = "", suffix = "" }: { target: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    const duration = 1800;
    const steps = 72;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (step >= steps) { setValue(target); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}

const KEY_EVENTS = [
  { year: 1993, label: "Measurement begins", detail: "SPC begins systematic sea level monitoring across 21 Pacific territories." },
  { year: 1998, label: "El Niño suppression", detail: "A major El Niño event suppresses Pacific sea levels — a temporary respite that ends quickly." },
  { year: 2003, label: "Decade 2 begins rising", detail: "The second decade opens with clearly elevated baseline sea levels vs the 1993 period." },
  { year: 2011, label: "La Niña spike", detail: "La Niña drives sea levels sharply upward, previewing the new normal for later decades." },
  { year: 2013, label: "Acceleration confirmed", detail: "Decade 3 opens with levels already significantly above D1 baselines. The trend is undeniable." },
  { year: 2019, label: "New records set", detail: "Multiple nations record their highest-ever sea level anomalies in the 2019–2022 window." },
  { year: 2023, label: "The present reality", detail: "Five nations above 0.1m. All 21 trending upward. The 30-year story is an escalation." },
];

export function Chapter6Takeaways() {
  const { data: accelData } = useGetAcceleration();
  const { data: decadeData } = useGetDecadeAnalysis();
  const { data: overview } = useGetClimateOverview();
  const { data: thresholdData } = useGetThresholdCrossings();
  const { data: rankings } = useGetRankings();

  const acceleratingCount = accelData?.filter(a => a.accelerating).length || 0;
  const totalCount = accelData?.length || 0;

  const d1Avg = decadeData?.globalDecades.find(d => d.key === 'd1')?.avg || 0;
  const d3Avg = decadeData?.globalDecades.find(d => d.key === 'd3')?.avg || 0;
  const shift = d3Avg - d1Avg;

  const crossedZero = thresholdData?.summary.crossedZero || 0;
  const crossedTenth = thresholdData?.summary.crossedTenth || 0;

  const totalObs = overview?.totalObservations || 0;
  const avgRise = overview?.avgRiseMeters || 0;
  const maxRiseVal = overview?.maxRiseValue || 0;

  const highestSlope = rankings?.slice().sort((a, b) => b.slope - a.slope)[0];

  return (
    <StorySection id="chapter-6" className="pb-32">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">What This Means</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Thirty years of satellite-era data. Twenty-one nations. One unavoidable conclusion: the Pacific is rising, accelerating, and there is no safe harbor.
          </p>
        </motion.div>

        {/* Animated counter grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-16">
          {[
            { value: acceleratingCount, of: totalCount, label: "Nations Accelerating", color: "text-primary", desc: "are not just rising but rising faster", decimals: 0, prefix: "", suffix: "" },
            { value: shift * 100, of: null, label: "cm Baseline Shift", color: "text-foreground", desc: "average rise from Decade 1 to Decade 3", decimals: 1, prefix: "+", suffix: "cm" },
            { value: crossedZero, of: null, label: "Nations Above Zero", color: "text-[#34d399]", desc: "have crossed into persistent positive anomaly", decimals: 0, prefix: "", suffix: "" },
            { value: crossedTenth, of: null, label: "Nations at +0.1m", color: "text-[#f97316]", desc: "have breached the 10cm threshold", decimals: 0, prefix: "", suffix: "" },
            { value: maxRiseVal * 100, of: null, label: "cm Peak Nation Rise", color: "text-[#ef4444]", desc: `highest single-nation cumulative rise (${overview?.maxRiseCountry || "…"})`, decimals: 0, prefix: "+", suffix: "cm" },
            { value: (highestSlope?.slope ?? 0) * 1000, of: null, label: "mm/yr Fastest Rise", color: "text-[#a78bfa]", desc: `${highestSlope?.country ?? "…"} — fastest upward trend`, decimals: 2, prefix: "+", suffix: "mm/yr" },
          ].map(({ value, of, label, color, desc, decimals, prefix, suffix }, i) => (
            <motion.div
              key={label}
              className="p-6 bg-card/40 border border-border/50 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className={`text-4xl font-serif font-bold mb-1 ${color}`}>
                <AnimatedCount target={value} decimals={decimals} prefix={prefix} suffix={suffix} />
                {of != null && <span className="text-xl text-muted-foreground font-normal"> /{of}</span>}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Key events timeline */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-2xl font-serif font-bold mb-8 text-center">Thirty Years in Seven Moments</h3>
          <div className="relative">
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-border/40" />
            <div className="space-y-6">
              {KEY_EVENTS.map((event, i) => (
                <motion.div
                  key={event.year}
                  className="flex items-start gap-6 relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-[72px] shrink-0 text-right">
                    <span className="text-sm font-mono font-bold text-primary">{event.year}</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary mt-0.5 shrink-0 relative z-10 ring-4 ring-background" />
                  <div className="flex-1 pb-2">
                    <div className="text-sm font-bold text-foreground mb-0.5">{event.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{event.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Data integrity callout */}
        <motion.div
          className="p-6 bg-card/30 border border-border/40 rounded-2xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <div className="text-2xl font-serif font-bold text-foreground mb-1">
              <AnimatedCount target={totalObs} decimals={0} />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Observations</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-foreground mb-1">21</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Pacific Territories</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-foreground mb-1">1993 – 2023</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">30-Year Record</div>
          </div>
        </motion.div>

        <motion.div
          className="pt-12 border-t border-border/30 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-muted-foreground text-sm mb-6">
            Data sourced from the Pacific Community (SPC) Climate Change Indicators Database. Indicator: SEA_LVL (Sea Level Anomaly).
          </p>
          <div className="font-serif italic text-primary text-2xl">
            "The ocean is speaking. The question is whether we are listening."
          </div>
        </motion.div>
      </div>
    </StorySection>
  );
}
