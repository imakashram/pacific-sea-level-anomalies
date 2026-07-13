import { useGetRegionalDecadeShares } from "@workspace/api-client-react";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const REGION_COLORS: Record<string, string> = {
  Micronesia: "#38bdf8",
  Polynesia: "#a78bfa",
  Melanesia: "#34d399",
};

const DECADE_LABELS = ["1993–2002", "2003–2012", "2013–2023"];

interface SlicePayload {
  region: string;
  share: number;
  mean: number;
  count: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SlicePayload }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-black/90 border border-white/20 rounded-lg px-4 py-3 text-sm">
      <p className="font-mono font-bold text-white mb-1">{d.region}</p>
      <p className="text-white/60">Share of rise: <span className="text-white font-mono">{(d.share * 100).toFixed(1)}%</span></p>
      <p className="text-white/60">Mean anomaly: <span className="text-white font-mono">{(d.mean * 100).toFixed(2)}cm</span></p>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, share }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; share: number;
}) => {
  if (share < 0.1) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontFamily="monospace" fontWeight="bold">
      {(share * 100).toFixed(0)}%
    </text>
  );
};

export function ChapterRegionalDonut() {
  const { data } = useGetRegionalDecadeShares();
  const [activeDecade, setActiveDecade] = useState(2);

  const decades = data?.decades ?? [];
  const currentDecade = decades[activeDecade];

  const pieData = (currentDecade?.slices ?? []).map((sl) => ({
    name: sl.region,
    value: sl.share,
    region: sl.region,
    share: sl.share,
    mean: sl.mean,
    count: sl.count,
  }));

  const shift = (() => {
    if (decades.length < 2) return null;
    const first = decades[0]?.slices ?? [];
    const current = currentDecade?.slices ?? [];
    return current.map((sl) => {
      const prev = first.find((f) => f.region === sl.region);
      const diff = prev ? sl.share - prev.share : 0;
      return { region: sl.region, diff };
    });
  })();

  return (
    <section
      id="chapter-regional-donut"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-black"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono tracking-[0.25em] text-violet-400 mb-3 uppercase">Analytics · Donut Chart</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Who Owns the Rise
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Proportional share of total accumulated sea level rise by geographic region — across three 
            decades. Has the balance of burden shifted?
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {DECADE_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveDecade(i)}
              className={`px-5 py-2 rounded-full text-sm font-mono transition-all ${
                activeDecade === i
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                  : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={130}
                  dataKey="value"
                  labelLine={false}
                  label={renderLabel}
                  animationBegin={0}
                  animationDuration={600}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={REGION_COLORS[entry.region] ?? "#888"}
                      stroke="#000"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: REGION_COLORS[value] ?? "#fff", fontFamily: "monospace", fontSize: 12 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {(currentDecade?.slices ?? []).map((sl) => {
              const shiftEntry = shift?.find((s) => s.region === sl.region);
              const color = REGION_COLORS[sl.region] ?? "#888";
              return (
                <div key={sl.region} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono font-bold text-sm" style={{ color }}>{sl.region}</span>
                    <div className="flex items-center gap-3">
                      {shiftEntry && activeDecade > 0 && (
                        <span className={`text-xs font-mono ${shiftEntry.diff >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {shiftEntry.diff >= 0 ? "▲" : "▼"} {Math.abs(shiftEntry.diff * 100).toFixed(1)}pp vs 1993–2002
                        </span>
                      )}
                      <span className="text-white font-mono font-bold text-lg">{(sl.share * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${sl.share * 100}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-1 font-mono">
                    avg {(sl.mean * 100).toFixed(2)}cm anomaly · {sl.count} observations
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {decades.map((dec, i) => {
            const top = [...(dec.slices ?? [])].sort((a, b) => b.share - a.share)[0];
            return (
              <div
                key={dec.decade}
                className={`bg-white/5 border rounded-xl p-4 text-center transition-all cursor-pointer ${
                  activeDecade === i ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => setActiveDecade(i)}
              >
                <p className="text-white/40 text-xs font-mono mb-1">{dec.decade}</p>
                <p className="text-white font-bold font-mono" style={{ color: REGION_COLORS[top?.region ?? ""] }}>
                  {top?.region}
                </p>
                <p className="text-white/50 text-xs mt-1">dominant region</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
