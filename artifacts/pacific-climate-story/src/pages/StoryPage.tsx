import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "wouter";
import { Terminal } from "lucide-react";
import { HeroSection } from "@/components/story/HeroSection";
import { TheDataLandscape } from "@/components/story/TheDataLandscape";
import { TheOceanIsRising } from "@/components/story/TheOceanIsRising";
import { ChapterDecadeAnalysis } from "@/components/story/ChapterDecadeAnalysis";
import { Chapter3ElNino } from "@/components/story/Chapter3ElNino";
import { ChapterENSOSensitivity } from "@/components/story/ChapterENSOSensitivity";
import { ChapterVolatility } from "@/components/story/ChapterVolatility";
import { ChapterAcceleration } from "@/components/story/ChapterAcceleration";
import { Chapter5Heatmap } from "@/components/story/Chapter5Heatmap";
import { ChapterCumulativeRise } from "@/components/story/ChapterCumulativeRise";
import { FutureOutlook } from "@/components/story/FutureOutlook";
import { RiskAssessment } from "@/components/story/RiskAssessment";

import { PacificAtAGlance } from "@/components/story/PacificAtAGlance";
import { WhatThisMeans } from "@/components/story/WhatThisMeans";
import { ChapterRankBump } from "@/components/story/ChapterRankBump";
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
        <TheDataLandscape />
        <TheOceanIsRising />
        <ChapterDecadeAnalysis />
        <Chapter3ElNino />
        <ChapterENSOSensitivity />
        <ChapterVolatility />
        <ChapterAcceleration />
        <Chapter5Heatmap />
        <ChapterCumulativeRise />
        <ChapterRankBump />
        <FutureOutlook />
        <RiskAssessment />

        <div ref={sectionRef}>
          <PacificAtAGlance activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <WhatThisMeans />
      </main>
    </div>
  );
}
