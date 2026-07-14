import { useEffect } from "react";
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
import { ChapterThresholdCrossings } from "@/components/story/ChapterThresholdCrossings";
import { ChapterBaselineBreach } from "@/components/story/ChapterBaselineBreach";
import { ChapterCorrelation } from "@/components/story/ChapterCorrelation";
import { ChapterRankBump } from "@/components/story/ChapterRankBump";
import { ChapterDecadeBoxplot } from "@/components/story/ChapterDecadeBoxplot";
import { ChapterNationTreemap } from "@/components/story/ChapterNationTreemap";
import { ChapterYoYBudget } from "@/components/story/ChapterYoYBudget";
import { ChapterRidgePlot } from "@/components/story/ChapterRidgePlot";
import { ChapterRadialImpact } from "@/components/story/ChapterRadialImpact";
import { ChapterDumbbellLeap } from "@/components/story/ChapterDumbbellLeap";
import { ChapterRegionalDonut } from "@/components/story/ChapterRegionalDonut";
import { ChapterParallelCoords } from "@/components/story/ChapterParallelCoords";
import { ChapterThresholdFunnel } from "@/components/story/ChapterThresholdFunnel";
import { ChapterStreamGraph } from "@/components/story/ChapterStreamGraph";
import { ChapterLollipop } from "@/components/story/ChapterLollipop";

export default function StoryPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground font-sans overflow-x-hidden">
      <main className="pt-8">
        <HeroSection />
        <Chapter1DataLandscape />
        <Chapter2RisingTide />
        <ChapterDecadeAnalysis />
        <ChapterRateOfChange />
        <ChapterDecadeBoxplot />
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
        <ChapterRidgePlot />
        <ChapterRankBump />
        <ChapterParallelCoords />
        <ChapterThresholdFunnel />
        <ChapterStreamGraph />
        <ChapterLollipop />
        <ChapterCorrelation />
        <ChapterForecast />
        <ChapterRiskDashboard />
        <ChapterNationTreemap />
        <ChapterRadialImpact />
        <ChapterThresholdCrossings />
        <ChapterBaselineBreach />

        <ThePacificAtAGlance />
        <ChapterWhatThisMeans />
      </main>
    </div>
  );
}
