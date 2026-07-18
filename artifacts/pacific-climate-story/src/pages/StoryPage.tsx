import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { HeroSection } from "@/components/story/HeroSection";
import { Chapter1DataLandscape } from "@/components/story/Chapter1DataLandscape";
import { Chapter2RisingTide } from "@/components/story/Chapter2RisingTide";
import { ChapterDecadeAnalysis } from "@/components/story/ChapterDecadeAnalysis";
import { ChapterRateOfChange } from "@/components/story/ChapterRateOfChange";
import { Chapter3ElNino } from "@/components/story/Chapter3ElNino";
import { ChapterENSOSensitivity } from "@/components/story/ChapterENSOSensitivity";
import { ChapterVolatility } from "@/components/story/ChapterVolatility";
import { ChapterAcceleration } from "@/components/story/ChapterAcceleration";
import { Chapter4NationsSideBySide } from "@/components/story/Chapter4NationsSideBySide";
import { Chapter5Heatmap } from "@/components/story/Chapter5Heatmap";
import { ChapterCumulativeRise } from "@/components/story/ChapterCumulativeRise";
import { ChapterForecast } from "@/components/story/ChapterForecast";
import { ChapterRiskDashboard } from "@/components/story/ChapterRiskDashboard";

import { ThePacificAtAGlance } from "@/components/story/ThePacificAtAGlance";
import { ChapterWhatThisMeans } from "@/components/story/ChapterWhatThisMeans";
import { ChapterRegionalClusters } from "@/components/story/ChapterRegionalClusters";
import { ChapterBaselineBreach } from "@/components/story/ChapterBaselineBreach";
import { ChapterRankBump } from "@/components/story/ChapterRankBump";
import { ChapterNationTreemap } from "@/components/story/ChapterNationTreemap";
import { ChapterYoYBudget } from "@/components/story/ChapterYoYBudget";
import { ChapterRadialImpact } from "@/components/story/ChapterRadialImpact";
import { ChapterDumbbellLeap } from "@/components/story/ChapterDumbbellLeap";
import { ChapterRegionalDonut } from "@/components/story/ChapterRegionalDonut";
import { ChapterParallelCoords } from "@/components/story/ChapterParallelCoords";
import { ChapterThresholdFunnel } from "@/components/story/ChapterThresholdFunnel";
import { ChapterStreamGraph } from "@/components/story/ChapterStreamGraph";
import { ChapterLollipop } from "@/components/story/ChapterLollipop";
import { OceanDecorations } from "@/components/story/OceanDecorations";

export default function StoryPage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'table'>('explorer');
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionInView = useInView(sectionRef, { amount: 0.1 });

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.title = "Pacific Sea Level Anomalies | Interactive Climate Data Story";
  }, []);

  const hideDecorations = activeTab === 'table' && isSectionInView;

  return (
    <div className="bg-background min-h-screen text-foreground font-sans relative">
      {!hideDecorations && <OceanDecorations />}
      <main className="pt-8">
        <HeroSection />
        <Chapter1DataLandscape />
        <Chapter2RisingTide />
        <ChapterDecadeAnalysis />
        <ChapterRateOfChange />
        <Chapter3ElNino />
        <ChapterENSOSensitivity />
        <ChapterVolatility />
        <ChapterAcceleration />
        <ChapterYoYBudget />
        <ChapterDumbbellLeap />
        <Chapter4NationsSideBySide />
        <Chapter5Heatmap />
        <ChapterCumulativeRise />
        <ChapterRegionalClusters />
        <ChapterRegionalDonut />
        <ChapterRankBump />
        <ChapterParallelCoords />
        <ChapterThresholdFunnel />
        <ChapterStreamGraph />
        <ChapterLollipop />
        <ChapterForecast />
        <ChapterRiskDashboard />
        <ChapterNationTreemap />
        <ChapterRadialImpact />
        <ChapterBaselineBreach />

        <div ref={sectionRef}>
          <ThePacificAtAGlance activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <ChapterWhatThisMeans />
      </main>
    </div>
  );
}
