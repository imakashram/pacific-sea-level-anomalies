import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, Gauge } from "lucide-react";
import { useGetSubRegions } from "@workspace/api-client-react";

const REGION_THEMES: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    glow: string;
    gradientFrom: string;
    gradientTo: string;
    hex: string;
  }
> = {
  Melanesia: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.15)]",
    gradientFrom: "#34d399",
    gradientTo: "#059669",
    hex: "#34d399",
  },
  Micronesia: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.15)]",
    gradientFrom: "#38bdf8",
    gradientTo: "#0284c7",
    hex: "#38bdf8",
  },
  Polynesia: {
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_25px_rgba(167,139,250,0.15)]",
    gradientFrom: "#a78bfa",
    gradientTo: "#7c3aed",
    hex: "#a78bfa",
  },
};

/**
 * PacificSubRegions Component
 *
 * Uses a Bespoke Custom SVG "Sub-Regional Escalation Stepper Chart" specifically tailored for
 * comparing decadal climate shifts (D1 → D2 → D3) across Melanesia, Micronesia, and Polynesia.
 */
export function PacificSubRegions() {
  const { data: CLUSTER_DATA, isLoading } = useGetSubRegions();
  const [selectedRegion, setSelectedRegion] = useState<
    "Melanesia" | "Micronesia" | "Polynesia"
  >("Melanesia");

  if (isLoading || !CLUSTER_DATA) {
    return (
      <StorySection id="pacific-sub-regions" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground font-mono animate-pulse">
            Loading Sub-Regional Climate Data...
          </div>
        </div>
      </StorySection>
    );
  }

  const selectedCluster =
    CLUSTER_DATA.find((c) => c.region === selectedRegion) || CLUSTER_DATA[0];

  // SVG Dimension Constants
  const SVG_WIDTH = 680;
  const SVG_HEIGHT = 360;
  const COLUMN_X = {
    Melanesia: 120,
    Micronesia: 340,
    Polynesia: 560,
  };

  // Convert sea level anomaly (cm) to SVG Y coordinate (domain: -2 cm to +10 cm)
  const MIN_VAL = -2;
  const MAX_VAL = 10.5;
  const PADDING_TOP = 40;
  const PADDING_BOTTOM = 60;
  const CHART_HEIGHT = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const valToY = (val: number): number => {
    const norm = (val - MIN_VAL) / (MAX_VAL - MIN_VAL);
    return SVG_HEIGHT - PADDING_BOTTOM - norm * CHART_HEIGHT;
  };

  return (
    <StorySection id="pacific-sub-regions" className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Pacific Sub-Regions
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Compare sea level patterns and climate risk across Melanesia, Micronesia, and Polynesia.
          </p>
        </motion.div>

        {/* 3 Sub-Regional Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {CLUSTER_DATA.map((cluster) => {
            const theme = REGION_THEMES[cluster.region];
            const isSelected = selectedRegion === cluster.region;

            return (
              <div
                key={cluster.region}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Select ${cluster.region} Realm`}
                onClick={() => setSelectedRegion(cluster.region)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedRegion(cluster.region);
                  }
                }}
                className={`p-6 bg-card/25 backdrop-blur-md border rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm focus:outline-none ${
                  isSelected
                    ? `${theme.border} bg-card/40 ring-1 ring-white/10 ${theme.glow} scale-[1.02]`
                    : "border-slate-800/60 hover:border-slate-700/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs uppercase tracking-wider font-semibold ${theme.text}`}
                    >
                      {cluster.region} Realm
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground font-semibold">
                      {cluster.nationsCount} Nations
                    </span>
                  </div>

                  <div
                    className={`text-4xl font-serif font-bold tracking-tight mb-2 ${theme.text}`}
                  >
                    +{cluster.avgSlopeMmYr.toFixed(2)}
                    <span className="text-sm font-sans text-muted-foreground ml-1">
                      mm/yr
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {cluster.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Decadal Shift:</span>
                  <span className={`font-bold ${theme.text}`}>
                    +{cluster.shiftCm.toFixed(1)} cm
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Custom Bespoke SVG Escalation Stepper & Territory Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Bespoke Custom SVG Escalation Stepper Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7 bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  Bespoke Escalation Stepper (D1 → D2 → D3 cm)
                </h3>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Custom SVG Matrix
                </span>
              </div>

              <div className="relative w-full h-[320px] flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="w-full h-full overflow-visible"
                  role="img"
                  aria-label="Interactive stepper chart comparing decadal average sea level shifts across the Melanesia, Micronesia, and Polynesia sub-regions."
                >
                  <defs>
                    {/* SVG Gradients for each region */}
                    {CLUSTER_DATA.map((c) => {
                      const theme = REGION_THEMES[c.region];
                      return (
                        <linearGradient
                          key={`grad-${c.region}`}
                          id={`grad-${c.region}`}
                          x1="0"
                          y1="1"
                          x2="0"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor={theme.gradientFrom}
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor={theme.gradientFrom}
                            stopOpacity="0.9"
                          />
                        </linearGradient>
                      );
                    })}
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Baseline References */}
                  {[-2, 0, 4, 8, 10].map((val) => {
                    const y = valToY(val);
                    return (
                      <g key={`ygrid-${val}`}>
                        <line
                          x1="50"
                          y1={y}
                          x2={SVG_WIDTH - 20}
                          y2={y}
                          stroke={
                            val === 0
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(255,255,255,0.05)"
                          }
                          strokeDasharray={val === 0 ? "4 4" : "2 2"}
                        />
                        <text
                          x="40"
                          y={y + 4}
                          fill="rgba(255,255,255,0.4)"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {val > 0 ? `+${val}` : val} cm
                        </text>
                      </g>
                    );
                  })}

                  {/* 3 Parallel Realm Escalation Stepper Beams */}
                  {CLUSTER_DATA.map((cluster) => {
                    const theme = REGION_THEMES[cluster.region];
                    const cx = COLUMN_X[cluster.region];
                    const isSelected = selectedRegion === cluster.region;

                    const yD1 = valToY(cluster.d1AvgCm);
                    const yD2 = valToY(cluster.d2AvgCm);
                    const yD3 = valToY(cluster.d3AvgCm);

                    return (
                      <g
                        key={`column-${cluster.region}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Select ${cluster.region} Realm Column`}
                        onClick={() => setSelectedRegion(cluster.region)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedRegion(cluster.region);
                          }
                        }}
                        className="cursor-pointer transition-opacity duration-300 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-900"
                        opacity={isSelected ? 1 : 0.35}
                      >
                        {/* Background Pillar Glow */}
                        <rect
                          x={cx - 35}
                          y={PADDING_TOP}
                          width="70"
                          height={CHART_HEIGHT}
                          fill={theme.hex}
                          opacity={isSelected ? 0.04 : 0}
                          rx="12"
                        />

                        {/* Vertical Stepper Connector Beam (D1 -> D2 -> D3) */}
                        <path
                          d={`M ${cx} ${yD1} L ${cx} ${yD2} L ${cx} ${yD3}`}
                          stroke={theme.hex}
                          strokeWidth={isSelected ? 4 : 2}
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Node 1: D1 (1993-2002) */}
                        <circle
                          cx={cx}
                          cy={yD1}
                          r={isSelected ? 6 : 4}
                          fill="#0f172a"
                          stroke={theme.hex}
                          strokeWidth="2.5"
                        />
                        <text
                          x={cx - 12}
                          y={yD1 + 4}
                          fill="rgba(255,255,255,0.7)"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {cluster.d1AvgCm >= 0
                            ? `+${cluster.d1AvgCm}`
                            : cluster.d1AvgCm}
                        </text>

                        {/* Node 2: D2 (2003-2012) */}
                        <circle
                          cx={cx}
                          cy={yD2}
                          r={isSelected ? 6 : 4}
                          fill="#0f172a"
                          stroke={theme.hex}
                          strokeWidth="2.5"
                        />
                        <text
                          x={cx - 12}
                          y={yD2 + 4}
                          fill="rgba(255,255,255,0.7)"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          +{cluster.d2AvgCm}
                        </text>

                        {/* Node 3: D3 (2013-2023) - Endpoint Milestone */}
                        <circle
                          cx={cx}
                          cy={yD3}
                          r={isSelected ? 8 : 5}
                          fill={theme.hex}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {/* Endpoint Milestone Badge */}
                        <rect
                          x={cx + 10}
                          y={yD3 - 11}
                          width="54"
                          height="20"
                          rx="6"
                          fill="#0b1528"
                          stroke={theme.hex}
                          strokeWidth="1"
                        />
                        <text
                          x={cx + 37}
                          y={yD3 + 3}
                          fill={theme.hex}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          +{cluster.d3AvgCm}cm
                        </text>

                        {/* Realm Column Title Label */}
                        <text
                          x={cx}
                          y={SVG_HEIGHT - 20}
                          fill={
                            isSelected ? theme.hex : "rgba(255,255,255,0.6)"
                          }
                          fontSize="13"
                          fontFamily="serif"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {cluster.region}
                        </text>
                        <text
                          x={cx}
                          y={SVG_HEIGHT - 6}
                          fill="rgba(255,255,255,0.4)"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          +{cluster.avgSlopeMmYr.toFixed(2)} mm/yr
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Stepper Era Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs font-mono text-muted-foreground border-t border-white/5 pt-3">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-white/60 bg-[#0f172a]" />
                  D1 (1993–2002) Baseline
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-white/60 bg-[#0f172a]" />
                  D2 (2003–2012) Mid-Shift
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white" />
                  D3 (2013–2023) Anomaly
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Territory List in Selected Realm */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="lg:col-span-5 bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin
                    className={`w-4 h-4 ${REGION_THEMES[selectedCluster.region].text}`}
                  />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                    {selectedCluster.region} Nations (
                    {selectedCluster.nationsCount})
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono font-bold ${REGION_THEMES[selectedCluster.region].text}`}
                >
                  +{selectedCluster.latest2023AvgCm.toFixed(1)} cm (2023 Avg)
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                {selectedCluster.nations.map((n) => (
                  <div
                    key={n.code}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-card/30 border border-border/20 text-xs font-mono"
                  >
                    <span className="font-semibold text-foreground">
                      {n.name}
                    </span>
                    <span className="text-muted-foreground/60">({n.code})</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StorySection>
  );
}
