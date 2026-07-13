import { useGetNationTreemap } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  RadialBarChart, RadialBar, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const REGION: Record<string, string> = {
  AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
  WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
  FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
  FM: "Micronesia", GU: "Micronesia", KI: "Micronesia", MH: "Micronesia",
  NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
};

const REGION_COLORS: Record<string, string> = {
  Polynesia: "#f97316",
  Melanesia: "#22c55e",
  Micronesia: "#38bdf8",
};

function ringColor(code: string, idx: number): string {
  const region = REGION[code] ?? "Unknown";
  const base = REGION_COLORS[region] ?? "#a78bfa";
  const shift = (idx % 3) * 15;
  return base;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl text-sm">
      <p className="font-bold text-foreground mb-1.5">{d.country} ({d.code})</p>
      <div className="flex flex-col gap-1 text-muted-foreground">
        <div className="flex justify-between gap-8">
          <span>2023 anomaly</span>
          <span className="font-mono text-foreground">+{(d.totalRise * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between gap-8">
          <span>Acceleration</span>
          <span className="font-mono text-foreground">+{(d.acceleration * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between gap-8">
          <span>Volatility (σ)</span>
          <span className="font-mono text-foreground">{(d.volatility * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between gap-8">
          <span>Region</span>
          <span style={{ color: REGION_COLORS[REGION[d.code] ?? ""] ?? "#a78bfa" }}>
            {REGION[d.code] ?? "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

export function ChapterRadialImpact() {
  const { data, isLoading } = useGetNationTreemap();
  const [sortBy, setSortBy] = useState<"totalRise" | "acceleration" | "volatility">("totalRise");

  const radialData = useMemo(() => {
    if (!data) return [];
    return [...data.nations]
      .sort((a, b) => a[sortBy] - b[sortBy])
      .map((n, i) => ({
        ...n,
        fill: REGION_COLORS[REGION[n.code] ?? ""] ?? "#a78bfa",
        ringLabel: n.code,
        idx: i,
      }));
  }, [data, sortBy]);

  const top5 = useMemo(
    () => [...(data?.nations ?? [])].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, 5),
    [data, sortBy]
  );

  return (
    <StorySection id="chapter-radial-impact">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
          The Wheel of Impact
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Each ring is a nation. The further a ring extends from the center, the greater
          its burden. Color encodes geographic region — revealing whether entire regions
          share the same fate or whether within-region variation is significant.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 italic">
          Ring length = selected metric. Color:{" "}
          <span style={{ color: REGION_COLORS.Micronesia }}>■ Micronesia</span>{" "}
          <span style={{ color: REGION_COLORS.Polynesia }}>■ Polynesia</span>{" "}
          <span style={{ color: REGION_COLORS.Melanesia }}>■ Melanesia</span>
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[500px] bg-card/20 animate-pulse rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex gap-2 mb-6 flex-wrap">
            {(["totalRise", "acceleration", "volatility"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortBy(mode)}
                className={`px-4 py-1.5 text-xs rounded-full border transition-all ${
                  sortBy === mode
                    ? "bg-primary/20 border-primary/60 text-primary font-bold"
                    : "bg-card/30 border-border/40 text-muted-foreground hover:border-border"
                }`}
              >
                Ring length:{" "}
                {mode === "totalRise" ? "Total Rise" : mode === "acceleration" ? "Acceleration" : "Volatility"}
              </button>
            ))}
          </div>

          <div className="h-[500px] w-full bg-card/10 rounded-xl border border-border/30">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="8%"
                outerRadius="95%"
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey={sortBy}
                  background={{ fill: "rgba(255,255,255,0.03)" }}
                  cornerRadius={2}
                  label={false}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Top 5 by {sortBy === "totalRise" ? "Total Rise" : sortBy === "acceleration" ? "Acceleration" : "Volatility"}
            </h3>
            <div className="flex flex-col gap-3">
              {top5.map((n, i) => {
                const region = REGION[n.code] ?? "Unknown";
                const color = REGION_COLORS[region] ?? "#a78bfa";
                const pct = (n[sortBy] / (top5[0]?.[sortBy] ?? 1)) * 100;
                return (
                  <div key={n.code} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-xs font-bold w-8" style={{ color }}>{n.code}</span>
                    <div className="flex-1 bg-card/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="font-mono text-sm text-foreground w-20 text-right">
                      {sortBy === "totalRise"
                        ? `+${(n.totalRise * 100).toFixed(1)} cm`
                        : sortBy === "acceleration"
                        ? `+${(n.acceleration * 100).toFixed(1)} cm`
                        : `${(n.volatility * 100).toFixed(1)} cm σ`}
                    </span>
                    <span className="text-xs text-muted-foreground w-24">{n.country}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mt-8">
            {(["Micronesia", "Polynesia", "Melanesia"] as const).map((region) => {
              const rNations = (data.nations ?? []).filter((n) => REGION[n.code] === region);
              const avg = rNations.reduce((s, n) => s + n[sortBy], 0) / (rNations.length || 1);
              const color = REGION_COLORS[region];
              return (
                <div key={region} className="p-4 rounded-xl border" style={{ background: color + "10", borderColor: color + "40" }}>
                  <div className="text-xs font-bold mb-2" style={{ color }}>{region}</div>
                  <div className="text-2xl font-mono font-bold text-foreground">
                    {sortBy === "totalRise"
                      ? `+${(avg * 100).toFixed(1)} cm`
                      : sortBy === "acceleration"
                      ? `+${(avg * 100).toFixed(1)} cm`
                      : `${(avg * 100).toFixed(1)} cm`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    avg {sortBy === "totalRise" ? "total rise" : sortBy === "acceleration" ? "acceleration" : "volatility"} · {rNations.length} nations
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Micronesia bears a disproportionate burden.</span>{" "}
              Switching between metrics reveals a consistent pattern: Micronesian nations cluster near
              the outer rings regardless of whether you're measuring total rise, acceleration, or
              volatility. These are small, low-lying atolls with no natural elevation — and the ocean
              is closing the gap between sea level and land surface faster than anywhere else in the Pacific.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
