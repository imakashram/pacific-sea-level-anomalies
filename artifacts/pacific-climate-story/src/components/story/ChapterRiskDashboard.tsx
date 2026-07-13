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
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    return (
      <div className="bg-background/95 border border-border/50 p-4 rounded-lg shadow-xl backdrop-blur-md">
        <p className="font-bold text-foreground mb-1">{d.country}</p>
        <p className="text-sm mb-2">
          <span
            className="font-mono font-bold"
            style={{ color: RISK_COLORS[d.riskLevel] }}
          >
            {d.riskLevel}
          </span>{" "}
          — Score: <span className="font-bold">{d.riskScore}</span>/100
        </p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>Rise: {d.cumulativeRise.toFixed(3)}m</p>
          <p>Speed: {d.slope.toFixed(2)} mm/yr</p>
          <p>Volatility: ±{d.volatility.toFixed(3)}m</p>
          <p>D1→D3 shift: +{d.decadeAcceleration.toFixed(3)}m</p>
        </div>
      </div>
    );
  }
  return null;
};

export function ChapterRiskDashboard() {
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
        { subject: "Acceleration", value: selectedCountry.components.accelerationScore, fullMark: 100 },
      ]
    : [];

  const top5 = data?.countries.slice(0, 5) ?? [];

  return (
    <StorySection id="chapter-risk">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Risk Assessment
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
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
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
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
                return (
                  <div
                    key={level}
                    className={`rounded-xl border p-5 ${RISK_BG[level]}`}
                  >
                    <div
                      className="text-4xl font-serif font-bold mb-1"
                      style={{ color: RISK_COLORS[level] }}
                    >
                      {count}
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {level} Risk
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {level === "Critical"
                        ? "Score ≥ 80"
                        : level === "High"
                        ? "Score 60–79"
                        : level === "Medium"
                        ? "Score 40–59"
                        : "Score < 40"}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Ranked bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="bg-card/10 border border-border/30 rounded-2xl p-6 shadow-xl mb-8"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
                Composite Risk Score by Nation — click a bar to drill down
              </h3>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.countries}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 120, bottom: 0 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="country"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 11 }}
                      width={115}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.1)" }} />
                    <Bar
                      dataKey="riskScore"
                      name="Risk Score"
                      radius={[0, 4, 4, 0]}
                      onClick={(d) => setSelectedCode(d.code === selectedCode ? null : d.code)}
                      cursor="pointer"
                    >
                      {data.countries.map((entry) => (
                        <Cell
                          key={entry.code}
                          fill={RISK_COLORS[entry.riskLevel]}
                          opacity={
                            selectedCode === null || selectedCode === entry.code ? 1 : 0.35
                          }
                          stroke={selectedCode === entry.code ? "#fff" : "none"}
                          strokeWidth={selectedCode === entry.code ? 1.5 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Avg score reference */}
              <p className="text-xs text-muted-foreground text-right mt-2">
                Regional avg risk score:{" "}
                <span className="text-foreground font-semibold">{data.avgRiskScore}/100</span>
              </p>
            </motion.div>

            {/* Drill-down radar + critical nations */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Top 5 critical */}
              <div className="bg-card/10 border border-border/30 rounded-2xl p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Highest Risk Nations
                </h3>
                <div className="flex flex-col gap-3">
                  {top5.map((c, i) => (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCode(c.code === selectedCode ? null : c.code)}
                      className={`w-full text-left rounded-lg p-3 border transition-all ${
                        selectedCode === c.code
                          ? `${RISK_BG[c.riskLevel]} border-opacity-60`
                          : "bg-card/30 border-border/30 hover:bg-card/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                          <span className="font-medium text-foreground text-sm">{c.country}</span>
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: RISK_COLORS[c.riskLevel],
                            backgroundColor: `${RISK_COLORS[c.riskLevel]}20`,
                          }}
                        >
                          {c.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${c.riskScore}%`,
                              backgroundColor: RISK_COLORS[c.riskLevel],
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: RISK_COLORS[c.riskLevel] }}>
                          {c.riskScore}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Radar chart drill-down */}
              <div className="bg-card/10 border border-border/30 rounded-2xl p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {selectedCountry ? `${selectedCountry.country} — Risk Breakdown` : "Select a nation to see breakdown"}
                </h3>
                {selectedCountry ? (
                  <>
                    <div
                      className="text-4xl font-serif font-bold mb-4"
                      style={{ color: RISK_COLORS[selectedCountry.riskLevel] }}
                    >
                      {selectedCountry.riskScore}
                      <span className="text-base font-sans text-muted-foreground ml-2">/ 100</span>
                    </div>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          />
                          <Radar
                            name={selectedCountry.country}
                            dataKey="value"
                            stroke={RISK_COLORS[selectedCountry.riskLevel]}
                            fill={RISK_COLORS[selectedCountry.riskLevel]}
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground/40 text-sm italic">
                    Click any bar or nation to view the risk component breakdown
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </StorySection>
  );
}
