import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { HeroSection } from "@/components/story/HeroSection";
import { TheDataLandscape } from "@/components/story/TheDataLandscape";
import { TheOceanIsRising } from "@/components/story/TheOceanIsRising";
import { PacificSubRegions } from "@/components/story/PacificSubRegions";
import { ENSOEffect } from "@/components/story/ENSOEffect";
import { PaceOfChange } from "@/components/story/PaceOfChange";
import { PatternsOverTime } from "@/components/story/PatternsOverTime";
import { FutureOutlook } from "@/components/story/FutureOutlook";
import { RiskAssessment } from "@/components/story/RiskAssessment";

import { PacificAtAGlance } from "@/components/story/PacificAtAGlance";
import { WhatThisMeans } from "@/components/story/WhatThisMeans";
import { DataMethodology } from "@/components/story/DataMethodology";
import { Footer } from "@/components/story/Footer";
import { OceanDecorations } from "@/components/story/OceanDecorations";
import { useSEO } from "@/lib/useSEO";

export default function StoryPage() {
  const [activeTab, setActiveTab] = useState<"explorer" | "table">("explorer");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionInView = useInView(sectionRef, { amount: 0.1 });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useSEO({
    title: "Pacific Sea Level Anomalies | Interactive Climate Data Story",
    description:
      "Explore and analyze sea level anomalies across the Pacific Ocean. Visualize historic data, climate trend patterns, El Niño impacts, and sea-level rise metrics.",
    canonicalPath: "/",
    keywords:
      "climate change, sea level rise, Pacific Ocean, El Nino, climate anomalies, global warming, environment data, interactive climate visualization",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Pacific Sea Level Anomalies | Interactive Climate Data Story",
      "description": "Explore and analyze sea level anomalies across the Pacific Ocean. Visualize historic data, climate trend patterns, El Niño impacts, and sea-level rise metrics.",
      "publisher": {
        "@type": "Person",
        "name": "Akash Ram"
      },
      "about": {
        "@type": "Thing",
        "name": "Climate Change & Sea Level Rise"
      }
    }
  });

  const hideDecorations = activeTab === "table" && isSectionInView;

  return (
    <div className="bg-background min-h-screen text-foreground font-sans relative">
      {!hideDecorations && <OceanDecorations />}
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <TheDataLandscape />
        <TheOceanIsRising />
        <PaceOfChange />
        <PacificSubRegions />
        <ENSOEffect />
        <PatternsOverTime />
        <FutureOutlook />
        <RiskAssessment />

        <div ref={sectionRef}>
          <PacificAtAGlance activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <WhatThisMeans />
        <DataMethodology />
        <Footer />
      </main>
    </div>
  );
}
