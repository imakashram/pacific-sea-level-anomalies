import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "hero", title: "Intro" },
  { id: "chapter-1", title: "01 The Data" },
  { id: "chapter-2", title: "02 Rising Tide" },
  { id: "chapter-decade", title: "03 Decades" },
  { id: "chapter-decade-boxplot", title: "04 Distributions" },
  { id: "chapter-roc", title: "05 Rate of Change" },
  { id: "chapter-3", title: "06 El Niño" },
  { id: "chapter-enso", title: "07 ENSO" },
  { id: "chapter-volatility", title: "08 Volatility" },
  { id: "chapter-acceleration", title: "09 Acceleration" },
  { id: "chapter-yoy-budget", title: "10 Budget" },
  { id: "chapter-dumbbell-leap", title: "11 30-yr Leap" },
  { id: "chapter-4", title: "12 Nations" },
  { id: "chapter-5", title: "13 Heatmap" },
  { id: "chapter-cumulative", title: "14 Trajectories" },
  { id: "chapter-clusters", title: "15 Regions" },
  { id: "chapter-regional-donut", title: "16 Shares" },
  { id: "chapter-ridge-plot", title: "17 Profiles" },
  { id: "chapter-rank-bump", title: "18 Rankings Race" },
  { id: "chapter-parallel-coords", title: "19 5-Axis" },
  { id: "chapter-threshold-funnel", title: "20 Funnel" },
  { id: "chapter-stream-graph", title: "21 Streams" },
  { id: "chapter-lollipop", title: "22 Deviation" },
  { id: "chapter-correlation", title: "23 Synchrony" },
  { id: "chapter-forecast", title: "24 Forecast" },
  { id: "chapter-risk", title: "25 Risk" },
  { id: "chapter-nation-treemap", title: "26 Portrait" },
  { id: "chapter-radial-impact", title: "27 Wheel" },
  { id: "chapter-thresholds", title: "28 Thresholds" },
  { id: "chapter-baseline", title: "29 Tipping Point" },
  { id: "chapter-explorer", title: "30 Explore" },
  { id: "chapter-rankings", title: "31 Rankings" },
  { id: "chapter-6", title: "32 Takeaways" },
];

export function ChapterNav() {
  const [activeChapter, setActiveChapter] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      let current = "hero";
      for (const chapter of CHAPTERS) {
        const element = document.getElementById(chapter.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = chapter.id;
          }
        }
      }
      setActiveChapter(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-8 left-0 w-full z-40">
      <nav className="hidden md:flex justify-between items-center px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="text-sm font-serif italic text-muted-foreground whitespace-nowrap mr-8">
          Pacific Climate Story
        </div>
        <div className="flex gap-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                document.getElementById(chapter.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-xs uppercase tracking-wider whitespace-nowrap transition-colors hover:text-primary ${
                activeChapter === chapter.id ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {chapter.title}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
