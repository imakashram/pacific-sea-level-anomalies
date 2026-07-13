import { useGetThresholdFunnel } from "@workspace/api-client-react";
import { useState } from "react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STEP_COLORS = [
  "#38bdf8",
  "#22d3ee",
  "#fbbf24",
  "#f97316",
  "#ef4444",
  "#991b1b",
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; count: number; pct: number; desc: string; historical: Array<{year: number; count: number}> } }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-black/90 border border-white/20 rounded-xl px-4 py-3 text-sm min-w-[200px]">
      <p className="font-mono font-bold text-white mb-1">{d.label}</p>
      <p className="text-white/50 text-xs mb-2">{d.desc}</p>
      <p className="text-white font-mono text-lg font-bold">{d.count} nations</p>
      <p className="text-white/40 text-xs">{(d.pct * 100).toFixed(0)}% of Pacific</p>
      {d.historical?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-white/40 text-xs mb-1">Historical trend</p>
          {d.historical.map((h) => (
            <p key={h.year} className="text-white/60 text-xs font-mono">
              {h.year}: {h.count} nations
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export function ChapterThresholdFunnel() {
  const { data } = useGetThresholdFunnel();
  const [selected, setSelected] = useState<number | null>(null);

  const funnel = data?.funnel ?? [];
  const total = data?.totalNations ?? 21;

  const funnelData = funnel.map((step, i) => ({
    ...step,
    value: step.count,
    fill: STEP_COLORS[i] ?? "#888",
    name: step.label,
  }));

  const selectedStep = selected !== null ? funnel[selected] : null;

  return (
    <section
      id="chapter-threshold-funnel"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-black"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-amber-400 mb-3 uppercase">
            Analytics · Funnel Chart
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            The Threshold Cascade
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Every Pacific nation is being tracked. But how many have already
            crossed the critical sea level milestones? Each tier narrows the
            count — the funnel shows who remains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-[440px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                  animationDuration={800}
                  onClick={(entry: { label?: string }) => {
                    const idx = funnel.findIndex((f) => f.label === entry.label);
                    setSelected(selected === idx ? null : idx);
                  }}
                >
                  <LabelList
                    position="right"
                    fill="#ffffff99"
                    stroke="none"
                    dataKey="name"
                    style={{ fontSize: 11, fontFamily: "monospace" }}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {funnel.map((step, i) => {
              const color = STEP_COLORS[i] ?? "#888";
              const pct = step.pct * 100;
              const isSelected = selected === i;
              return (
                <div
                  key={step.label}
                  className={`rounded-xl p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => setSelected(isSelected ? null : i)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color }}
                    >
                      {step.label}
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {step.count} / {total}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-white/40 text-xs">{step.desc}</p>
                    <p className="text-white/50 text-xs font-mono">
                      {pct.toFixed(0)}%
                    </p>
                  </div>

                  {isSelected && step.historical.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
                      {step.historical.map((h) => (
                        <div key={h.year} className="text-center">
                          <p className="text-white/40 text-xs">{h.year}</p>
                          <p
                            className="font-mono font-bold text-lg"
                            style={{ color }}
                          >
                            {h.count}
                          </p>
                          <p className="text-white/30 text-xs">nations</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedStep && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="font-mono text-white/60 text-xs uppercase tracking-wider mb-3">
              Nations above this threshold in 2023
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedStep.nations.map((code) => (
                <span
                  key={code}
                  className="px-3 py-1 rounded-full font-mono text-xs font-bold"
                  style={{
                    backgroundColor:
                      (STEP_COLORS[
                        funnel.indexOf(selectedStep)
                      ] ?? "#888") + "30",
                    color:
                      STEP_COLORS[funnel.indexOf(selectedStep)] ?? "#888",
                    border: `1px solid ${STEP_COLORS[funnel.indexOf(selectedStep)] ?? "#888"}50`,
                  }}
                >
                  {code}
                </span>
              ))}
              {selectedStep.nations.length === 0 && (
                <p className="text-white/30 text-sm italic">No nations at this level yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
