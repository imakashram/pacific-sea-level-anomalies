import { useGetClimateOverview, useGetRiskScores, useGetForecast } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

function TickerItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-2 shrink-0 px-6">
      <span className="text-muted-foreground/60 text-xs uppercase tracking-widest">{label}</span>
      <span className="text-foreground font-mono font-semibold text-sm">{value}</span>
    </span>
  );
}

export function LiveDataTicker() {
  const { data: overview } = useGetClimateOverview();
  const { data: riskData } = useGetRiskScores();
  const { data: forecast } = useGetForecast();

  const items = [
    ...(overview
      ? [
          { label: "30-yr avg rise", value: `+${overview.avgRiseMeters.toFixed(3)}m` },
          { label: "most affected", value: overview.maxRiseCountry },
          { label: "max rise", value: `+${overview.maxRiseValue.toFixed(3)}m` },
          { label: "nations rising", value: `${overview.countriesAboveAvg} / ${overview.totalCountries}` },
          { label: "observations", value: overview.totalObservations.toLocaleString() },
        ]
      : []),
    ...(riskData
      ? [
          { label: "critical risk", value: `${riskData.criticalCount} nations` },
          { label: "avg risk score", value: `${riskData.avgRiskScore} / 100` },
        ]
      : []),
    ...(forecast
      ? [
          { label: "trend rate", value: `+${forecast.slopeMmPerYear.toFixed(2)} mm/yr` },
          { label: "projected 2030", value: `+${(forecast.projectedRise2030 * 1000).toFixed(0)}mm` },
        ]
      : []),
  ];

  const doubled = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-8 bg-background/80 backdrop-blur-md border-b border-border/20 overflow-hidden flex items-center">
      <div className="border-r border-border/30 pr-3 pl-3 shrink-0">
        <span className="text-primary text-xs font-bold uppercase tracking-widest">LIVE</span>
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary inline-block animate-pulse" />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: items.length * 4,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {doubled.map((item, i) => (
            <TickerItem key={i} label={item.label} value={item.value} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
