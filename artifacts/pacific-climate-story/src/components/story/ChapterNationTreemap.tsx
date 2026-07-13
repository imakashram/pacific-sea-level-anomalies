import { useGetNationTreemap } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

function accelColor(acceleration: number, maxAccel: number, minAccel: number): string {
  const norm = Math.max(0, Math.min(1, (acceleration - minAccel) / Math.max(maxAccel - minAccel, 0.001)));
  if (norm >= 0.75) return "#ef4444";
  if (norm >= 0.55) return "#f97316";
  if (norm >= 0.38) return "#fbbf24";
  if (norm >= 0.22) return "#84cc16";
  return "#38bdf8";
}

function accelLabel(acceleration: number): string {
  if (acceleration >= 0.15) return "Critical";
  if (acceleration >= 0.10) return "High";
  if (acceleration >= 0.06) return "Moderate";
  if (acceleration >= 0.02) return "Low";
  return "Minimal";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d?.code) return null;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-sm min-w-[220px]">
      <p className="font-bold text-foreground mb-2">{d.country} ({d.code})</p>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">2023 anomaly</span>
          <span className="font-mono text-foreground">+{(d.totalRise * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">1993–97 avg</span>
          <span className="font-mono text-foreground">{(d.firstQuintAvg * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">2019–23 avg</span>
          <span className="font-mono text-foreground">+{(d.lastQuintAvg * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Acceleration</span>
          <span className="font-mono font-bold" style={{ color: accelColor(d.acceleration, 0.25, -0.05) }}>
            +{(d.acceleration * 100).toFixed(1)} cm
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Volatility (σ)</span>
          <span className="font-mono text-foreground">{(d.volatility * 100).toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg yr-over-yr</span>
          <span className="font-mono text-foreground">+{(d.avgYoYChange * 1000).toFixed(2)} mm/yr</span>
        </div>
      </div>
    </div>
  );
};

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  code?: string;
  country?: string;
  totalRise?: number;
  acceleration?: number;
  volatility?: number;
  firstQuintAvg?: number;
  lastQuintAvg?: number;
  avgYoYChange?: number;
  maxAccel?: number;
  minAccel?: number;
}

function CustomContent(props: CustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, code, totalRise = 0, acceleration = 0, maxAccel = 0.25, minAccel = -0.05 } = props;
  if (!code || width < 18 || height < 18) return null;

  const fill = accelColor(acceleration, maxAccel, minAccel);
  const showCountry = width > 80 && height > 48;
  const showRise = width > 50 && height > 36;
  const showCode = width > 24 && height > 24;

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        fill={fill}
        fillOpacity={0.22}
        stroke={fill}
        strokeWidth={1.5}
        rx={3}
      />
      {showCode && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showRise ? 8 : 0)}
          textAnchor="middle"
          fill="white"
          fontSize={Math.min(14, Math.max(8, width / 4.5))}
          fontWeight={700}
          style={{ pointerEvents: "none" }}
        >
          {code}
        </text>
      )}
      {showRise && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (showCode ? 10 : 0)}
          textAnchor="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize={Math.min(10, Math.max(7, width / 6.5))}
          style={{ pointerEvents: "none" }}
        >
          +{(totalRise * 100).toFixed(0)}cm
        </text>
      )}
      {showCountry && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 22}
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize={Math.min(8, width / 9)}
          style={{ pointerEvents: "none" }}
        >
          {props.country}
        </text>
      )}
    </g>
  );
}

export function ChapterNationTreemap() {
  const { data, isLoading } = useGetNationTreemap();
  const [sortMode, setSortMode] = useState<"totalRise" | "acceleration" | "volatility">("totalRise");

  const { treemapData, maxAccel, minAccel, sortedNations } = useMemo(() => {
    if (!data) return { treemapData: [], maxAccel: 0.25, minAccel: 0, sortedNations: [] };

    const accels = data.nations.map((n) => n.acceleration);
    const maxAccel = Math.max(...accels, 0.001);
    const minAccel = Math.min(...accels, 0);

    const sorted = [...data.nations].sort((a, b) => b[sortMode] - a[sortMode]);

    const treemapData = sorted.map((n) => ({
      name: n.code,
      size: Math.max(n.totalRise + 0.1, 0.01),
      ...n,
      maxAccel,
      minAccel,
    }));

    return { treemapData, maxAccel, minAccel, sortedNations: sorted };
  }, [data, sortMode]);

  const topAccel = sortedNations.slice().sort((a, b) => b.acceleration - a.acceleration).slice(0, 3);

  return (
    <StorySection id="chapter-nation-treemap">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Nation Portrait</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Every rectangle is a nation. Size shows the 2023 sea level anomaly — how far above
          the 1993 baseline they stand today. Color shows acceleration — the gap between
          their first-quinquennial average (1993–97) and their last (2019–23). Red = accelerating
          fastest. Blue = slowest.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 italic">
          Largest = most total rise. Reddest = greatest acceleration in last 5 years vs. first 5.
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[480px] bg-card/20 animate-pulse rounded-xl" />
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
                onClick={() => setSortMode(mode)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  sortMode === mode
                    ? "bg-primary/20 border-primary/60 text-primary font-bold"
                    : "bg-card/30 border-border/40 text-muted-foreground hover:border-border"
                }`}
              >
                Size by:{" "}
                {mode === "totalRise" ? "Total Rise" : mode === "acceleration" ? "Acceleration" : "Volatility"}
              </button>
            ))}
          </div>

          <div className="h-[480px] w-full bg-card/10 rounded-xl border border-border/30 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                content={<CustomContent maxAccel={maxAccel} minAccel={minAccel} />}
              >
                <Tooltip content={<CustomTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-muted-foreground">Low acceleration</span>
            <div
              className="h-3 rounded flex-1"
              style={{
                background: "linear-gradient(to right, #38bdf8, #84cc16, #fbbf24, #f97316, #ef4444)",
              }}
            />
            <span className="text-xs text-muted-foreground">Critical acceleration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {topAccel.map((n, i) => (
              <div
                key={n.code}
                className="p-5 rounded-xl border"
                style={{
                  background: accelColor(n.acceleration, maxAccel, minAccel) + "18",
                  borderColor: accelColor(n.acceleration, maxAccel, minAccel) + "50",
                }}
              >
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: accelColor(n.acceleration, maxAccel, minAccel) }}
                >
                  #{i + 1} Most Accelerating · {accelLabel(n.acceleration)}
                </div>
                <div className="font-bold text-foreground mb-1">{n.country}</div>
                <div className="text-xs text-muted-foreground">{n.code}</div>
                <div className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1993–97 avg</span>
                    <span className="font-mono">{(n.firstQuintAvg * 100).toFixed(1)} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2019–23 avg</span>
                    <span className="font-mono">+{(n.lastQuintAvg * 100).toFixed(1)} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acceleration</span>
                    <span
                      className="font-mono font-bold"
                      style={{ color: accelColor(n.acceleration, maxAccel, minAccel) }}
                    >
                      +{(n.acceleration * 100).toFixed(1)} cm
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Size and color don't always agree.</span>{" "}
              Some nations have a large total rise but moderate acceleration — they started rising
              early and consistently. Others are smaller rectangles but blazing red — their sea
              levels were low in the 1990s but are now surging rapidly. These late-accelerators
              may be the most vulnerable, lacking the decades of warning that earlier-rising nations
              have had to adapt.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
