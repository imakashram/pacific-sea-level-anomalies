import { useGetENSOSensitivity } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from "recharts";

const ELNINO_COLOR = "#f97316";
const LANINA_COLOR = "#38bdf8";
const NEUTRAL_COLOR = "hsl(var(--muted-foreground))";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-sm">
      <p className="font-bold text-foreground mb-2">{d.country} ({label})</p>
      <p className="text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: LANINA_COLOR }} />
        La Niña avg: <span className="text-foreground font-mono">{d.laNinaAvg >= 0 ? "+" : ""}{(d.laNinaAvg * 100).toFixed(1)} cm</span>
      </p>
      <p className="text-muted-foreground mt-0.5">
        <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: NEUTRAL_COLOR }} />
        Neutral avg: <span className="text-foreground font-mono">{d.neutralAvg >= 0 ? "+" : ""}{(d.neutralAvg * 100).toFixed(1)} cm</span>
      </p>
      <p className="text-muted-foreground mt-0.5">
        <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: ELNINO_COLOR }} />
        El Niño avg: <span className="text-foreground font-mono">{d.elNinoAvg >= 0 ? "+" : ""}{(d.elNinoAvg * 100).toFixed(1)} cm</span>
      </p>
      <p className="text-primary mt-2 font-semibold">
        ENSO swing: {(d.sensitivity * 100).toFixed(1)} cm
      </p>
    </div>
  );
};

export function ChapterENSOSensitivity() {
  const { data, isLoading } = useGetENSOSensitivity();

  const top8 = data?.nations.slice(0, 8) ?? [];
  const bottom3 = data?.nations.slice(-3).reverse() ?? [];

  const chartData = top8.map((n) => ({
    code: n.code,
    country: n.country,
    elNinoAvg: n.elNinoAvg,
    neutralAvg: n.neutralAvg,
    laNinaAvg: n.laNinaAvg,
    sensitivity: n.sensitivity,
  }));

  return (
    <StorySection id="chapter-enso">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">ENSO Fingerprint</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          The Pacific doesn't just rise steadily — it breathes with ENSO cycles. El Niño events 
          (1997–98, 2015–16) temporarily suppress sea levels, while La Niña events (2010–11, 2020–21) 
          amplify them. But the crucial question: which nations are most exposed to this climatic 
          seesaw — and are they also the ones rising fastest?
        </p>
        <p className="text-sm text-muted-foreground/70 mb-12 italic">
          Sorted by ENSO sensitivity (La Niña avg minus El Niño avg). Top 8 most sensitive nations shown.
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
          <div className="h-[480px] w-full bg-card/10 rounded-xl border border-border/30 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 50 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="code"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)} cm`}
                  label={{
                    value: "Avg Sea Level Anomaly",
                    angle: -90,
                    position: "insideLeft",
                    offset: -35,
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--border))", opacity: 0.15 }} />
                <Legend
                  formatter={(value) =>
                    value === "elNinoAvg" ? "El Niño (1997-98, 2015-16)"
                    : value === "laNinaAvg" ? "La Niña (2010-11, 2020-21)"
                    : "Neutral years"
                  }
                  wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                <Bar dataKey="elNinoAvg" name="elNinoAvg" fill={ELNINO_COLOR} radius={[3, 3, 0, 0]} maxBarSize={22} />
                <Bar dataKey="neutralAvg" name="neutralAvg" fill={NEUTRAL_COLOR} radius={[3, 3, 0, 0]} maxBarSize={22} opacity={0.7} />
                <Bar dataKey="laNinaAvg" name="laNinaAvg" fill={LANINA_COLOR} radius={[3, 3, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div>
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: LANINA_COLOR, display: "inline-block" }} />
                Most ENSO-Sensitive Nations
              </h3>
              <div className="flex flex-col gap-3">
                {data.nations.slice(0, 5).map((n, i) => (
                  <div key={n.code} className="flex items-center gap-3 p-3 bg-card/30 border border-border/50 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
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
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
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
        </motion.div>
      )}
    </StorySection>
  );
}
