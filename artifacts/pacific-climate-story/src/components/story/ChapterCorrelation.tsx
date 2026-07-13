import { useGetCorrelationMatrix } from "@workspace/api-client-react";
import { StorySection } from "./StorySection";
import { motion } from "framer-motion";
import { useState } from "react";

function corrColor(r: number): string {
  if (r >= 1) return "#0ea5e9";
  if (r <= -1) return "#ef4444";
  if (r > 0) {
    const t = r;
    const R = Math.round(14 + t * (14 - 14));
    const G = Math.round(165 + t * (200 - 165));
    const B = Math.round(233 + t * (255 - 233));
    return `rgba(${14 + Math.round(t * 60)}, ${Math.round(100 + t * 120)}, ${Math.round(180 + t * 60)}, ${0.15 + t * 0.85})`;
  } else {
    const t = -r;
    return `rgba(${Math.round(200 + t * 55)}, ${Math.round(50 - t * 30)}, ${Math.round(50 - t * 30)}, ${0.15 + t * 0.7})`;
  }
}

interface HoveredCell {
  i: number;
  j: number;
  r: number;
  countryA: string;
  countryB: string;
}

export function ChapterCorrelation() {
  const { data, isLoading } = useGetCorrelationMatrix();
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const CELL = 28;
  const LABEL_W = 36;
  const LABEL_H = 36;

  return (
    <StorySection id="chapter-correlation">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">Pacific Synchrony</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl">
          Do all 21 Pacific nations rise and fall together? Or do some chart their own path?
          Every cell below is the Pearson correlation between two nations' 31-year sea level
          records — from −1 (perfectly opposed) to +1 (perfectly in sync).
        </p>
        <p className="text-sm text-muted-foreground/70 mb-12 italic">
          Hover any cell to see the pair. Diagonal = self-correlation (always 1.0).
        </p>
      </motion.div>

      {isLoading || !data ? (
        <div className="h-[640px] bg-card/20 animate-pulse rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <svg
                width={LABEL_W + data.codes.length * CELL}
                height={LABEL_H + data.codes.length * CELL + 20}
                style={{ fontFamily: "inherit" }}
              >
                {data.codes.map((code, j) => (
                  <text
                    key={`col-${j}`}
                    x={LABEL_W + j * CELL + CELL / 2}
                    y={LABEL_H - 8}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={8.5}
                    fontWeight={600}
                  >
                    {code}
                  </text>
                ))}
                {data.codes.map((code, i) => (
                  <text
                    key={`row-${i}`}
                    x={LABEL_W - 6}
                    y={LABEL_H + i * CELL + CELL / 2 + 4}
                    textAnchor="end"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={8.5}
                    fontWeight={600}
                  >
                    {code}
                  </text>
                ))}

                {data.matrix.map((row, i) =>
                  row.map((r, j) => {
                    const x = LABEL_W + j * CELL;
                    const y = LABEL_H + i * CELL;
                    const isHovered = hovered?.i === i && hovered?.j === j;
                    const isDiag = i === j;
                    return (
                      <g key={`${i}-${j}`}>
                        <rect
                          x={x + 1}
                          y={y + 1}
                          width={CELL - 2}
                          height={CELL - 2}
                          fill={isDiag ? "hsl(var(--primary))" : corrColor(r)}
                          rx={1}
                          opacity={isDiag ? 0.9 : 1}
                          stroke={isHovered ? "hsl(var(--foreground))" : "transparent"}
                          strokeWidth={isHovered ? 1.5 : 0}
                          style={{ cursor: "pointer", transition: "opacity 0.1s" }}
                          onMouseEnter={() =>
                            !isDiag &&
                            setHovered({
                              i,
                              j,
                              r,
                              countryA: data.countries[i] ?? "",
                              countryB: data.countries[j] ?? "",
                            })
                          }
                          onMouseLeave={() => setHovered(null)}
                        />
                        {(CELL >= 28 && !isDiag) && (
                          <text
                            x={x + CELL / 2}
                            y={y + CELL / 2 + 3.5}
                            textAnchor="middle"
                            fill={Math.abs(r) > 0.5 ? "rgba(255,255,255,0.85)" : "hsl(var(--muted-foreground))"}
                            fontSize={6.5}
                            style={{ pointerEvents: "none" }}
                          >
                            {r.toFixed(2)}
                          </text>
                        )}
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          </div>

          {hovered && (
            <div className="mt-2 p-3 bg-card/40 border border-border/50 rounded-lg text-sm flex items-center gap-3">
              <span
                className="w-4 h-4 rounded"
                style={{ background: corrColor(hovered.r), display: "inline-block", border: "1px solid hsl(var(--border))" }}
              />
              <span className="font-semibold text-foreground">
                {hovered.countryA} × {hovered.countryB}
              </span>
              <span className="text-muted-foreground">Pearson r =</span>
              <span className={`font-mono font-bold ${hovered.r >= 0.7 ? "text-sky-400" : hovered.r < 0 ? "text-red-400" : "text-foreground"}`}>
                {hovered.r >= 0 ? "+" : ""}{hovered.r.toFixed(3)}
              </span>
              <span className="text-muted-foreground text-xs">
                {hovered.r >= 0.8 ? "Strong sync" : hovered.r >= 0.5 ? "Moderate sync" : hovered.r >= 0 ? "Weak sync" : "Counter-phase"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-5">
            <span className="text-xs text-muted-foreground">r = −1</span>
            <div
              className="h-3 rounded flex-1"
              style={{
                background: "linear-gradient(to right, rgba(220,30,30,0.8), rgba(100,100,100,0.3), rgba(14,165,233,0.9))",
              }}
            />
            <span className="text-xs text-muted-foreground">r = +1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-5 bg-card/30 border border-sky-500/20 rounded-xl">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Most Correlated Pair</div>
              <div className="font-bold text-foreground mb-0.5">
                {data.mostCorrelated.codeA} × {data.mostCorrelated.codeB}
              </div>
              <div className="text-xs text-muted-foreground mb-2">{data.mostCorrelated.countryA} × {data.mostCorrelated.countryB}</div>
              <div className="text-2xl font-mono font-bold text-sky-400">r = +{data.mostCorrelated.r.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground/70 mt-1">Near-perfect synchrony — these nations share the same ocean fate</div>
            </div>

            <div className="p-5 bg-card/30 border border-red-500/20 rounded-xl">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Least Correlated Pair</div>
              <div className="font-bold text-foreground mb-0.5">
                {data.leastCorrelated.codeA} × {data.leastCorrelated.codeB}
              </div>
              <div className="text-xs text-muted-foreground mb-2">{data.leastCorrelated.countryA} × {data.leastCorrelated.countryB}</div>
              <div className="text-2xl font-mono font-bold text-red-400">r = {data.leastCorrelated.r.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground/70 mt-1">Divergent behavior — these nations respond to different ocean dynamics</div>
            </div>

            <div className="p-5 bg-card/30 border border-border/50 rounded-xl">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Most In-Sync With Pacific</div>
              <div className="flex flex-col gap-2">
                {data.avgCorrelation.slice(0, 4).map((entry, i) => (
                  <div key={entry.code} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{entry.code}</span>
                    <span className="font-mono text-sm text-sky-400">{entry.avgCorrelation.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">The Pacific moves largely as one.</span>{" "}
              Most nation pairs show positive correlation, reflecting the shared influence of ENSO,
              trade winds, and Pacific Decadal Oscillation. But pockets of divergence — particularly
              between nations separated by the equatorial divide — reveal that local oceanographic
              conditions still shape individual trajectories within the broader Pacific signal.
            </p>
          </div>
        </motion.div>
      )}
    </StorySection>
  );
}
