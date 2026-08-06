import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, TrendingUp, Activity, Globe } from "lucide-react";
import { useGetSubRegions } from "@workspace/api-client-react";

const REGION_THEMES: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    glow: string;
    hex: string;
    hoverClass: string;
    icon: React.ComponentType<any>;
  }
> = {
  Melanesia: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.15)]",
    hex: "#34d399",
    hoverClass: "hover:border-emerald-500/40 hover:shadow-emerald-500/5 hover:bg-emerald-950/5 hover:-translate-y-1",
    icon: TrendingUp,
  },
  Micronesia: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.15)]",
    hex: "#38bdf8",
    hoverClass: "hover:border-cyan-500/40 hover:shadow-cyan-500/5 hover:bg-cyan-950/5 hover:-translate-y-1",
    icon: Activity,
  },
  Polynesia: {
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_25px_rgba(167,139,250,0.15)]",
    hex: "#a78bfa",
    hoverClass: "hover:border-purple-500/40 hover:shadow-purple-500/5 hover:bg-purple-950/5 hover:-translate-y-1",
    icon: Globe,
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const listContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

/**
 * PacificSubRegions Component
 *
 * Uses a Bespoke Custom SVG "Sub-Regional Escalation Stepper Chart" specifically tailored for
 * comparing decadal climate shifts (D1 → D2 → D3) across Melanesia, Micronesia, and Polynesia.
 */
export function PacificSubRegions() {
  const { data: CLUSTER_DATA, isLoading, isError } = useGetSubRegions();
  const [selectedRegion, setSelectedRegion] = useState<
    "Melanesia" | "Micronesia" | "Polynesia"
  >("Melanesia");

  if (isLoading) {
    return (
      <StorySection id="pacific-sub-regions">
        <div className="max-w-5xl mx-auto h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground font-mono animate-pulse">
            Loading Sub-Regional Climate Data...
          </div>
        </div>
      </StorySection>
    );
  }

  if (isError || !CLUSTER_DATA) {
    return null;
  }

  const selectedCluster =
    CLUSTER_DATA.find((c) => c.region === selectedRegion) || CLUSTER_DATA[0];

  // SVG Dimension Constants
  const SVG_WIDTH = 680;
  const SVG_HEIGHT = 360;
  const COLUMN_X = {
    Melanesia: 145,
    Micronesia: 365,
    Polynesia: 585,
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
    <StorySection id="pacific-sub-regions">
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
            Pacific Regions
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Compare how sea levels are rising and the climate risks across Melanesia, Micronesia, and Polynesia.
          </p>
        </motion.div>

        {/* 3 Sub-Regional Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {CLUSTER_DATA.map((cluster) => {
            const theme = REGION_THEMES[cluster.region];
            const Icon = theme.icon;

            return (
              <motion.div
                key={cluster.region}
                variants={cardVariants}
                className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-sm group ${theme.hoverClass}`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        {cluster.region}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground font-semibold">
                        {cluster.nationsCount} Nations
                      </span>
                    </div>
                    <div className={`${theme.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className={`text-3xl font-serif font-bold tracking-tight ${theme.text}`}>
                    +{cluster.avgSlopeMmYr.toFixed(2)}
                    <span className="text-sm font-sans text-muted-foreground ml-1">
                      mm/yr
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {cluster.description}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">30-Year Rise:</span>
                  <span className={`font-bold ${theme.text}`}>
                    +{cluster.shiftCm.toFixed(1)} cm
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Custom Bespoke SVG Escalation Stepper & Territory Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Decadal Shift Stepper Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
              <div className="px-1 text-left mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-mono font-bold text-slate-100">
                  Sea Level Rise Over Time
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Compare how sea levels changed over the last 30 years in Melanesia, Micronesia, and Polynesia.
                </p>
              </div>
              <div className="relative w-full h-[220px] flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="w-full h-full overflow-visible"
                  role="img"
                  aria-label="Interactive stepper chart comparing 30-year sea level rise across the Melanesia, Micronesia, and Polynesia regions."
                >
                  <defs>
                    {/* SVG Gradients for each region */}
                    {CLUSTER_DATA.map((c) => {
                      const theme = REGION_THEMES[c.region];
                      return (
                        <g key={`gradients-${c.region}`}>
                          <linearGradient
                            id={`beam-grad-${c.region}`}
                            x1="0"
                            y1="1"
                            x2="0"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor={theme.hex}
                              stopOpacity="0"
                            />
                            <stop
                              offset="50%"
                              stopColor={theme.hex}
                              stopOpacity="0.04"
                            />
                            <stop
                              offset="100%"
                              stopColor={theme.hex}
                              stopOpacity="0.08"
                            />
                          </linearGradient>
                        </g>
                      );
                    })}
                  </defs>

                  {/* Y-Axis Title */}
                  <text
                    x="12"
                    y={SVG_HEIGHT / 2 - 10}
                    fill="rgba(255, 255, 255, 0.6)"
                    fontSize="16"
                    fontWeight="600"
                    fontFamily="sans-serif"
                    transform={`rotate(-90, 12, ${SVG_HEIGHT / 2 - 10})`}
                    textAnchor="middle"
                  >
                    Sea Level Change (cm)
                  </text>

                  {/* Horizontal Gridlines & Y-Axis Baseline References */}
                  {[-2, 0, 4, 8, 10].map((val) => {
                    const y = valToY(val);
                    return (
                      <g key={`ygrid-${val}`}>
                        {val !== 0 && (
                          <line
                            x1="70"
                            y1={y}
                            x2={SVG_WIDTH - 20}
                            y2={y}
                            stroke="rgba(148, 163, 184, 0.08)"
                            strokeDasharray="3 3"
                          />
                        )}
                        <text
                          x="60"
                          y={y + 4}
                          fill="rgba(148, 163, 184, 0.7)"
                          fontSize="16"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {val > 0 ? `+${val}` : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Decadal Trend Guide Paths (Connecting D1, D2, D3 across regions) */}
                  {CLUSTER_DATA.length >= 3 && (() => {
                    const mel = CLUSTER_DATA.find(c => c.region === "Melanesia");
                    const mic = CLUSTER_DATA.find(c => c.region === "Micronesia");
                    const pol = CLUSTER_DATA.find(c => c.region === "Polynesia");

                    if (!mel || !mic || !pol) return null;

                    const xMel = COLUMN_X["Melanesia"];
                    const xMic = COLUMN_X["Micronesia"];
                    const xPol = COLUMN_X["Polynesia"];

                    return (
                      <g opacity="0.12" pointerEvents="none">
                        {/* D1 Connection */}
                        <path
                          d={`M ${xMel} ${valToY(mel.d1AvgCm)} L ${xMic} ${valToY(mic.d1AvgCm)} L ${xPol} ${valToY(pol.d1AvgCm)}`}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          fill="none"
                        />
                        {/* D2 Connection */}
                        <path
                          d={`M ${xMel} ${valToY(mel.d2AvgCm)} L ${xMic} ${valToY(mic.d2AvgCm)} L ${xPol} ${valToY(pol.d2AvgCm)}`}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          fill="none"
                        />
                        {/* D3 Connection */}
                        <path
                          d={`M ${xMel} ${valToY(mel.d3AvgCm)} L ${xMic} ${valToY(mic.d3AvgCm)} L ${xPol} ${valToY(pol.d3AvgCm)}`}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          fill="none"
                        />
                      </g>
                    );
                  })()}

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
                        className={`cursor-pointer transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-900 ${isSelected ? "opacity-100" : "opacity-35 hover:opacity-75"
                          }`}
                      >
                        {/* Background Pillar Glow */}
                        <rect
                          x={cx - 35}
                          y={PADDING_TOP}
                          width="70"
                          height={CHART_HEIGHT}
                          fill={`url(#beam-grad-${cluster.region})`}
                          stroke={theme.hex}
                          strokeWidth="1"
                          strokeOpacity={isSelected ? 0.15 : 0}
                          rx="12"
                          className="transition-all duration-300"
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
                        {/* Decade bracket on left */}
                        <text
                          x={cx - 16}
                          y={yD1 + 5}
                          fill={isSelected ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"}
                          fontSize="15"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          [D1]
                        </text>
                        {/* Value on right */}
                        <text
                          x={cx + 16}
                          y={yD1 + 5}
                          fill={isSelected ? "#ffffff" : "rgba(255,255,255,0.7)"}
                          fontSize="15"
                          fontFamily="monospace"
                          textAnchor="start"
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
                        {/* Decade bracket on left */}
                        <text
                          x={cx - 16}
                          y={yD2 + 5}
                          fill={isSelected ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"}
                          fontSize="15"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          [D2]
                        </text>
                        {/* Value on right */}
                        <text
                          x={cx + 16}
                          y={yD2 + 5}
                          fill={isSelected ? "#ffffff" : "rgba(255,255,255,0.7)"}
                          fontSize="15"
                          fontFamily="monospace"
                          textAnchor="start"
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
                        {/* Decade bracket on left */}
                        <text
                          x={cx - 16}
                          y={yD3 + 5}
                          fill={isSelected ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"}
                          fontSize="15"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          [D3]
                        </text>
                        {/* Endpoint Milestone Badge */}
                        <rect
                          x={cx + 14}
                          y={yD3 - 14}
                          width="78"
                          height="26"
                          rx="6"
                          fill="#0b1528"
                          stroke={theme.hex}
                          strokeWidth="1"
                        />
                        <text
                          x={cx + 53}
                          y={yD3 + 5}
                          fill={theme.hex}
                          fontSize="16"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          +{cluster.d3AvgCm}cm
                        </text>

                        {/* Realm Column Title Label */}
                        <text
                          x={cx}
                          y={SVG_HEIGHT - 25}
                          fill={
                            isSelected ? theme.hex : "rgba(255,255,255,0.6)"
                          }
                          fontSize="18"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {cluster.region}
                        </text>
                        <text
                          x={cx}
                          y={SVG_HEIGHT - 6}
                          fill="rgba(148, 163, 184, 0.7)"
                          fontSize="15"
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
            </div>
          </motion.div>

          {/* Right Column: Territory List in Selected Realm */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="lg:col-span-5"
          >
            <div className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
              <div className="px-1 text-left mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                  <MapPin className={`w-3.5 h-3.5 ${REGION_THEMES[selectedCluster.region].text}`} />
                  {selectedCluster.region} ({selectedCluster.nationsCount} Nations)
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Average sea level change in 2023: <span className={`font-semibold ${REGION_THEMES[selectedCluster.region].text}`}>+{selectedCluster.latest2023AvgCm.toFixed(1)} cm</span>
                </p>
              </div>

              <motion.div
                key={selectedRegion}
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1"
              >
                {selectedCluster.nations.map((n) => (
                  <motion.div
                    key={n.code}
                    variants={listItemVariants}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-card/30 border border-border/20 text-xs font-mono"
                  >
                    <span className="font-semibold text-foreground">
                      {n.name} ({n.code})
                    </span>
                    <span className={`font-semibold ${REGION_THEMES[selectedCluster.region].text}`}>
                      {n.value >= 0 ? "+" : ""}{n.value.toFixed(1)} cm
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Interaction Helper Text */}
        <p className="text-center text-xs text-muted-foreground mt-8 font-sans leading-relaxed max-w-3xl mx-auto">
          Click on a region (Melanesia, Micronesia, or Polynesia) to see how sea levels changed over time. The panel on the right shows the countries in that region and their sea level values.
        </p>
      </div>
    </StorySection>
  );
}
