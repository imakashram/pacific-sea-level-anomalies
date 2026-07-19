import { useGetRiskScores } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LabelList,
  Label,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { AlertOctagon, AlertTriangle, Shield, Activity } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const RISK_BG: Record<string, string> = {
  Critical: "bg-red-500/10 border-red-500/30",
  High: "bg-orange-500/10 border-orange-500/30",
  Medium: "bg-yellow-500/10 border-yellow-500/30",
  Low: "bg-green-500/10 border-green-500/30",
};

const RISK_GLOW: Record<string, string> = {
  Critical: "rgba(239,68,68,0.15)",
  High: "rgba(249,115,22,0.15)",
  Medium: "rgba(234,179,8,0.15)",
  Low: "rgba(34,197,94,0.15)",
};

const RISK_THEMES: Record<string, { text: string; bg: string; border: string; glow: string; icon: any }> = {
  Critical: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "hover:border-red-500/40 hover:shadow-red-500/5 hover:bg-red-950/5",
    icon: AlertOctagon
  },
  High: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "hover:border-orange-500/40 hover:shadow-orange-500/5 hover:bg-orange-950/5",
    icon: AlertTriangle
  },
  Medium: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    glow: "hover:border-yellow-500/40 hover:shadow-yellow-500/5 hover:bg-yellow-950/5",
    icon: Activity
  },
  Low: {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    glow: "hover:border-green-500/40 hover:shadow-green-500/5 hover:bg-green-950/5",
    icon: Shield
  }
};

const SHORT_COUNTRY_NAMES: Record<string, string> = {
  "Palau": "Palau",
  "Vanuatu": "Vanuatu",
  "Samoa": "Samoa",
  "Cook Islands": "Cook Is.",
  "Wallis and Futuna": "Wallis & Fut.",
  "French Polynesia": "Fr. Polynesia",
  "Kiribati": "Kiribati",
  "Marshall Islands": "Marshall Is.",
  "Tonga": "Tonga",
  "Northern Mariana Islands": "N. Mariana Is.",
  "Federated States of Micronesia": "Micronesia",
  "Solomon Islands": "Solomon Is.",
  "American Samoa": "Am. Samoa",
  "Papua New Guinea": "PNG",
};


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    const theme = RISK_THEMES[d.riskLevel] || { text: "text-foreground" };
    return (
      <div className="relative overflow-hidden bg-background/95 border border-border/40 p-4 rounded-xl shadow-2xl backdrop-blur-md pl-6">
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: RISK_COLORS[d.riskLevel] }}
        />
        <p className="font-bold text-foreground text-sm mb-1">{d.country}</p>
        <p className="text-xs mb-2">
          <span
            className={`font-mono font-bold ${theme.text}`}
          >
            {d.riskLevel} Risk
          </span>{" "}
          — Score: <span className="font-bold">{d.riskScore}</span>/100
        </p>
        <div className="text-[11px] text-muted-foreground/90 space-y-1.5 font-medium">
          <div className="flex justify-between gap-4">
            <span>Rise:</span>
            <span className="font-mono text-foreground font-semibold">{d.cumulativeRise.toFixed(3)}m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Speed:</span>
            <span className="font-mono text-foreground font-semibold">{(d.slope * 1000).toFixed(2)} mm/yr</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Volatility:</span>
            <span className="font-mono text-foreground font-semibold">±{d.volatility.toFixed(3)}m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>D1→D3 Shift:</span>
            <span className="font-mono text-foreground font-semibold">+{d.decadeAcceleration.toFixed(3)}m</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RiskAssessment() {
  const { data, isLoading } = useGetRiskScores();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const selectedCountry = selectedCode
    ? data?.countries.find((c) => c.code === selectedCode)
    : null;

  const radarData = selectedCountry
    ? [
      { subject: "Rise", value: selectedCountry.components.riseScore, fullMark: 100 },
      { subject: "Speed", value: selectedCountry.components.slopeScore, fullMark: 100 },
      { subject: "Volatility", value: selectedCountry.components.volatilityScore, fullMark: 100 },
      { subject: "Accel.", value: selectedCountry.components.accelerationScore, fullMark: 100 },
    ]
    : [];

  const top5 = data?.countries.slice(0, 5) ?? [];

  return (
    <StorySection id="chapter-risk" className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-center flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-3">
            Risk Assessment
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            A composite risk score (0–100) combining cumulative rise, rate of
            change, volatility, and decade-over-decade acceleration. This is
            the full picture of existential threat by nation.
          </p>
        </motion.div>

        {isLoading || !data ? (
          <div className="h-[600px] bg-card/20 animate-pulse rounded-xl" />
        ) : (
          <>
            {/* Tier summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8"
            >
              {(["Critical", "High", "Medium", "Low"] as const).map((level) => {
                const count =
                  level === "Critical"
                    ? data.criticalCount
                    : level === "High"
                      ? data.highCount
                      : level === "Medium"
                        ? data.mediumCount
                        : data.lowCount;
                const theme = RISK_THEMES[level];
                const Icon = theme.icon;
                return (
                  <motion.div
                    key={level}
                    className={`p-6 bg-card/25 backdrop-blur-md border border-slate-800/60 rounded-2xl flex flex-col gap-2 transition-all duration-300 group shadow-sm ${theme.glow} hover:-translate-y-1`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wider font-semibold group-hover:text-foreground transition-colors duration-300">
                        {level} Risk
                      </span>
                      <Icon className={`w-4 h-4 ${theme.text} opacity-60 group-hover:opacity-100 transition-all duration-300`} />
                    </div>
                    <div className={`text-4xl font-serif font-bold tracking-tight ${theme.text}`}>
                      {count}
                    </div>
                    <div className="text-xs text-muted-foreground/60 font-mono font-medium -mt-1">
                      {level === "Critical"
                        ? "Score ≥ 80"
                        : level === "High"
                          ? "Score 60–79"
                          : level === "Medium"
                            ? "Score 40–59"
                            : "Score < 40"}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {level === "Critical"
                        ? "Existential and immediate threat levels."
                        : level === "High"
                          ? "Significant coastal vulnerability observed."
                          : level === "Medium"
                            ? "Moderate susceptibility to storm surges."
                            : "Relatively stable elevation profiles."}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Master-Detail Dashboard: Bar Chart + Radar Chart Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              {/* Left Column: Ranked Bar Chart (Master List) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-7 bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Composite Risk Score by Nation
                  </h3>
                  <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.countries}
                        layout="vertical"
                        margin={{ top: 0, right: 40, left: 15, bottom: 22 }}
                        barCategoryGap="20%"
                      >
                        <defs>
                          <linearGradient id="grad-Critical" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                          <linearGradient id="grad-High" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                          <linearGradient id="grad-Medium" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#fde047" />
                            <stop offset="100%" stopColor="#eab308" />
                          </linearGradient>
                          <linearGradient id="grad-Low" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4ade80" />
                            <stop offset="100%" stopColor="#22c55e" />
                          </linearGradient>
                          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.4" />
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        >
                          <Label
                            value="Risk Score"
                            position="insideBottom"
                            offset={-14}
                            style={{
                              textAnchor: "middle",
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 10,
                              fontWeight: 600,
                              fontFamily: "monospace",
                              letterSpacing: "0.05em",
                            }}
                          />
                        </XAxis>
                        <YAxis
                          dataKey="country"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          interval={0}
                          axisLine={false}
                          tick={(props: any) => {
                            const { x, y, payload } = props;
                            const countryData = data.countries.find(c => c.country === payload.value);
                            const isSelected = countryData && selectedCode === countryData.code;
                            const displayCode = countryData ? countryData.code : payload.value;
                            return (
                              <text
                                x={x}
                                y={y}
                                dy={4}
                                textAnchor="end"
                                fill={isSelected ? RISK_COLORS[countryData.riskLevel] : "hsl(var(--muted-foreground))"}
                                className={`text-xs font-mono transition-all duration-300 ${isSelected ? "font-bold" : "font-normal"}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => countryData && setSelectedCode(countryData.code === selectedCode ? null : countryData.code)}
                              >
                                {displayCode}
                              </text>
                            );
                          }}
                          width={55}
                          tickLine={false}
                        >
                          <Label
                            value="Nation"
                            angle={-90}
                            position="insideLeft"
                            offset={-4}
                            style={{
                              textAnchor: "middle",
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 10,
                              fontWeight: 600,
                              fontFamily: "monospace",
                              letterSpacing: "0.05em",
                            }}
                          />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.1)" }} />
                        <Bar
                          dataKey="riskScore"
                          name="Risk Score"
                          radius={[0, 4, 4, 0]}
                          onClick={(d) => setSelectedCode(d.code === selectedCode ? null : d.code)}
                          cursor="pointer"
                        >
                          <LabelList
                            dataKey="riskScore"
                            position="right"
                            fill="hsl(var(--muted-foreground))"
                            fontSize={10}
                            fontWeight={600}
                            fontFamily="monospace"
                            dx={8}
                          />
                          {data.countries.map((entry) => (
                            <Cell
                              key={entry.code}
                              fill={`url(#grad-${entry.riskLevel})`}
                              opacity={
                                selectedCode === null || selectedCode === entry.code ? 1 : 0.35
                              }
                              stroke={selectedCode === entry.code ? RISK_COLORS[entry.riskLevel] : "none"}
                              strokeWidth={selectedCode === entry.code ? 1.5 : 0}
                              style={{
                                filter: selectedCode === entry.code ? `url(#glow)` : "none",
                                transition: "all 0.3s ease"
                              }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex justify-end items-center border-t border-border/20 pt-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Regional avg:{" "}
                    <span className="text-foreground font-semibold font-mono">{data.avgRiskScore}/100</span>
                  </p>
                </div>
              </motion.div>

              {/* Right Column: Radar/Spider Chart (Detail Breakdown) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="lg:col-span-5 bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[560px]"
              >
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {selectedCountry ? `${selectedCountry.country} (${selectedCountry.code})` : "Territory Detail Breakdown"}
                  </h3>

                  {selectedCountry ? (
                    <div className="flex flex-col gap-1">
                      <div>
                        <div
                          className="text-4xl font-mono font-bold tracking-tight mb-0.5"
                          style={{ color: RISK_COLORS[selectedCountry.riskLevel] }}
                        >
                          {selectedCountry.riskScore}
                          <span className="text-base font-mono text-muted-foreground ml-2">/ 100</span>
                        </div>
                        <p
                          className="text-xs font-mono font-semibold uppercase tracking-wider"
                          style={{ color: RISK_COLORS[selectedCountry.riskLevel] }}
                        >
                          {selectedCountry.riskLevel} Risk
                        </p>
                      </div>

                      <div className="h-[360px] w-full flex items-center justify-center -mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData} outerRadius="76%" margin={{ top: 0, right: 45, bottom: 15, left: 55 }}>
                            <defs>
                              <linearGradient id={`radar-grad-${selectedCountry.riskLevel}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={RISK_COLORS[selectedCountry.riskLevel]} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={RISK_COLORS[selectedCountry.riskLevel]} stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <PolarGrid stroke="hsl(var(--border)/0.5)" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={({ x, y, cx, cy, payload, textAnchor }: any) => {
                                const angle = Math.atan2(y - cy, x - cx);
                                const offset = 12;
                                const newX = x + Math.cos(angle) * offset;
                                const newY = y + Math.sin(angle) * offset;
                                return (
                                  <text
                                    x={newX}
                                    y={newY}
                                    textAnchor={textAnchor}
                                    fill="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    fontWeight={500}
                                    fontFamily="monospace"
                                  >
                                    {payload.value}
                                  </text>
                                );
                              }}
                            />
                            <Radar
                              name={selectedCountry.country}
                              dataKey="value"
                              stroke={RISK_COLORS[selectedCountry.riskLevel]}
                              fill={`url(#radar-grad-${selectedCountry.riskLevel})`}
                              fillOpacity={1}
                              strokeWidth={2.5}
                              dot={{
                                fill: RISK_COLORS[selectedCountry.riskLevel],
                                r: 4,
                                strokeWidth: 2,
                                stroke: "hsl(var(--background))"
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/20 rounded-xl my-6 min-h-[300px]">
                      <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-muted-foreground/50 animate-pulse" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">No territory selected</p>
                      <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                        Click on a country label or anomaly bar to drill down into their specific climate vulnerability vectors.
                      </p>
                    </div>
                  )}
                </div>

                {selectedCountry && (
                  <div className="text-[11px] text-muted-foreground/80 border-t border-border/20 pt-4 mt-2 leading-relaxed flex flex-wrap gap-x-4 gap-y-1 justify-center">
                    <span>Rise: <strong className="text-foreground">{selectedCountry.cumulativeRise.toFixed(2)}m</strong></span>
                    <span>Speed: <strong className="text-foreground">{(selectedCountry.slope * 1000).toFixed(1)} mm/yr</strong></span>
                    <span>Acc: <strong className="text-foreground">+{selectedCountry.decadeAcceleration.toFixed(2)}m</strong></span>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </StorySection>
  );
}
