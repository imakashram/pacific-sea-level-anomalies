import { useEffect } from "react";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Compass,
  Lightbulb,
  Code,
  LineChart,
  CheckCircle2,
  Calculator,
  Globe2,
} from "lucide-react";
import { useSEO } from "@/lib/useSEO";
import { motion } from "framer-motion";

const CHAPTERS = [
  { num: "01", title: "The Data Landscape", desc: "Setting the context, time horizon, and baseline" },
  { num: "02", title: "The Ocean Is Rising", desc: "Long-term trends, 5-year smoothing, and ENSO signals" },
  { num: "03", title: "Explore Any Nation", desc: "Drilling down into individual Pacific island nations" },
  { num: "04", title: "The Pace of Change", desc: "Decadal acceleration and changing velocity of rise" },
  { num: "05", title: "Pacific Regions", desc: "Melanesia, Micronesia, and Polynesia comparisons" },
  { num: "06", title: "The ENSO Effect", desc: "El Niño vs La Niña short-term sea-level sensitivity" },
  { num: "07", title: "Patterns Over Time", desc: "30-year 651-observation macro-pattern heatmap" },
  { num: "08", title: "Future Outlook", desc: "Projection trajectories and uncertainty ranges to 2033" },
  { num: "09", title: "Risk Assessment & What This Means", desc: "Multi-factor vulnerability composite score & human impact" },
];

export default function BehindTheStoryPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  useSEO({
    title: "Behind the Story: My Approach | Pacific Sea Level Anomalies",
    description:
      "Turning 30 years of Pacific climate data into an interactive visual story: the author's research journey, design choices, methodology, and creative direction.",
    canonicalPath: "/behind-the-story",
    keywords:
      "climate storytelling, data visualization design, Pacific sea level rise, research methodology, interactive data story",
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Behind the Story: My Approach to Pacific Sea Level Anomalies",
      description:
        "The creative journey, analytical thinking, and engineering approach behind turning 30 years of Pacific climate data into an interactive visual story.",
      author: {
        "@type": "Person",
        name: "Akash Ram",
      },
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute top-[1800px] right-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[180px] pointer-events-none" />
      <div className="absolute top-[3600px] left-0 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[180px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border shadow-md px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-serif text-foreground tracking-tight">
              Behind the Story
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/methodology"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-cyan-500/35 hover:bg-card/80 text-xs font-semibold text-muted-foreground hover:text-cyan-400 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Methodology & Formulas</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-all duration-300 shadow-md cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Back to Story</span>
          </a>
        </div>
      </header>

      {/* Main Content Article */}
      <main id="main-content" className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16 flex flex-col gap-12" tabIndex={-1}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden bg-gradient-to-br from-card/40 via-card/20 to-transparent border border-border/70 p-6 sm:p-10 rounded-3xl shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Behind the Story
            </span>
            <span className="text-xs text-muted-foreground">
              • A project by{" "}
              <a
                href="https://www.linkedin.com/in/imakashram/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-colors"
              >
                Akash Ram
              </a>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground tracking-tight leading-tight mb-3">
            My Approach to the Story
          </h1>
          <h2 className="text-lg sm:text-2xl font-serif text-cyan-400/90 font-medium tracking-tight mb-6">
            Pacific Sea Level Anomalies: Turning 30 years of Pacific climate data into an interactive story
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-muted-foreground/95 leading-relaxed font-sans border-t border-border/40 pt-6">
            <p>
              When I started this project, I didn't want to create just another data dashboard filled with charts and numbers. I wanted to tell a story through data — a story that could help people understand what is happening across the Pacific, how sea levels are changing, and why these changes matter to the communities living there.
            </p>
            <p>
              The subject itself is complex. It involves 21 Pacific nations, 30 years of observations, natural climate events, changing sea-level patterns, and possible future impacts.
            </p>
            <p>
              I saw an opportunity to bring all this information together in a way that was easier to understand and explore.
            </p>
            <p>
              My goal was to take something that might normally be presented in scientific reports or technical datasets and turn it into an interactive experience that people could follow at their own pace.
            </p>
            <p>
              I wanted every chart to answer a question, every chapter to add something to the story, and every interaction to give people a reason to explore further.
            </p>
            <p className="font-medium text-foreground">
              For me, this project was not just about writing code or creating visualizations. It was about understanding a problem, finding a meaningful way to explain it, and building the complete experience around that idea.
            </p>
          </div>
        </motion.div>

        {/* Section 01 */}
        <section id="starting-with-story" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">01</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Starting with the story, not the charts
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              My first question was not which chart to create. It was what I wanted people to understand.
            </p>
            <p>
              The Pacific Ocean is changing, but simply showing a rising line on a chart does not explain the complete picture. Different nations experience different patterns, natural climate events influence short-term changes, and the speed of sea-level rise is not the same everywhere.
            </p>
            <p>
              I wanted people to understand these differences rather than look at one overall number and move on.
            </p>

            <div className="p-5 my-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 shadow-inner">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                The Guiding Question
              </span>
              <p className="text-base sm:text-lg font-serif italic text-slate-100">
                "How can I turn 30 years of Pacific sea-level data into a story that people can understand, explore, and connect with?"
              </p>
            </div>

            <p>
              This question became the starting point for the entire project.
            </p>
            <p>
              I decided that the experience should take people through the subject step by step — starting with the bigger picture, moving towards individual nations, exploring climate patterns, and finally looking at what the findings could mean for the future.
            </p>
            <p>
              That decision shaped the structure of the website and the way I approached every visualization.
            </p>
          </div>
        </section>

        {/* Section 02 */}
        <section id="understanding-data" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">02</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Understanding what the data was telling me
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              Before building the visualizations, I spent time exploring the data and understanding what it could reveal.
            </p>
            <p>
              The project looks at sea-level anomalies across 21 Pacific nations between 1993 and 2023, using 651 data points.
            </p>
            <p>
              I wanted to understand more than just whether sea levels were rising. I explored several questions:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3 pt-1">
              {[
                "How much have sea levels changed over the last 30 years?",
                "Which nations are experiencing the fastest rise?",
                "Are sea levels changing at the same rate across the Pacific?",
                "How do El Niño and La Niña affect sea-level patterns?",
                "Which nations have experienced greater changes over time?",
                "How has the speed of sea-level rise changed between different periods?",
                "What might future sea-level levels look like if current trends continue?",
              ].map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-xl bg-card/40 border border-border/60 text-xs sm:text-sm text-slate-200"
                >
                  <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>

            <p>
              One thing I learned during this process was that a single average cannot explain everything.
            </p>
            <p>
              For example, the overall analysis shows a net rise of 12.4 cm over the 30-year period, while the comparison between the first and third decades shows an average increase of 8.3 cm. Individual nations also show different patterns.
            </p>
            <p>
              These differences were important because they helped me decide what the story needed to communicate.
            </p>
            <p>
              I also paid attention to the limitations of the source measurements. The official records used in the project are rounded to the nearest 10 cm. This matters when interpreting individual country values and comparing them with averages calculated across all 21 nations.
            </p>
            <p>
              I wanted the visualizations to be interesting, but I also wanted the information behind them to be presented honestly.
            </p>
          </div>
        </section>

        {/* Section 03 */}
        <section id="building-chapters" className="space-y-5 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">03</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Building a story one chapter at a time
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              Instead of putting everything on one dashboard, I divided the experience into nine chapters.
            </p>
            <p>
              I wanted each chapter to introduce a new question and help the reader understand another part of the bigger picture.
            </p>
            <p>
              The order was important. I didn't want people to jump directly into complicated comparisons without first understanding the data and the overall situation.
            </p>

            <h4 className="text-base sm:text-lg font-serif font-bold text-cyan-300 mt-4 mb-2">
              The journey through the data
            </h4>

            <div className="space-y-4">
              {CHAPTERS.map((ch) => (
                <div
                  key={ch.num}
                  className="p-4 sm:p-5 rounded-2xl bg-card/30 border border-border/70 hover:border-cyan-500/40 transition-all duration-200"
                >
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">{ch.num} —</span>
                    <h5 className="font-serif font-bold text-base sm:text-lg text-foreground">{ch.title}</h5>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {ch.num === "01" && (
                      <>I begin by introducing the dataset and giving readers an overview of what they are about to explore. This section presents the time period, number of observations, baseline, and other important information. The purpose is to establish context before showing the findings.</>
                    )}
                    {ch.num === "02" && (
                      <>This is where the main story begins. I wanted to show how sea levels have changed across the Pacific over the last 30 years. The interactive line chart presents annual observations, a five-year average, and the overall trend. I also included major El Niño and La Niña periods to help readers understand how natural climate events can cause temporary changes while the longer-term trend continues.</>
                    )}
                    {ch.num === "03" && (
                      <>After showing the overall picture, I wanted readers to explore the data at a country level. The Pacific is not one uniform region. Different nations experience different sea-level patterns. This section gives readers a way to investigate individual countries rather than relying only on regional averages.</>
                    )}
                    {ch.num === "04" && (
                      <>I wanted to go one step further than showing how much sea levels have risen. I wanted to understand whether the rate of change was increasing or decreasing. This section compares different periods and highlights nations where the pace of sea-level rise has changed. The comparison shows that 11 out of 21 nations are experiencing a faster rate of rise, while individual countries have very different results.</>
                    )}
                    {ch.num === "05" && (
                      <>I also wanted to bring a geographical perspective into the story. The Pacific is divided into three broad regions in this section: Melanesia, Micronesia, and Polynesia. Readers can compare their average rise rates, explore changes over time, and see which nations belong to each region. This helps connect individual country observations with a broader regional picture.</>
                    )}
                    {ch.num === "06" && (
                      <>Sea levels are influenced by more than long-term changes. El Niño and La Niña are natural climate events that can affect sea levels across the Pacific. I created this section to explore how different nations respond to these events and how their sea-level patterns differ between El Niño, neutral, and La Niña periods. It adds another layer to the story by showing that short-term variability and long-term sea-level rise need to be understood together.</>
                    )}
                    {ch.num === "07" && (
                      <>Looking at 21 nations across 30 years creates a large amount of information. I wanted to find a way to see all those changes together. That is why I introduced a heatmap showing annual sea-level anomalies across all the nations. Readers can also sort the countries by total rise, average sea level, or highest sea level. Instead of examining one chart at a time, people can discover patterns across the complete dataset in one view.</>
                    )}
                    {ch.num === "08" && (
                      <>After exploring historical observations, I wanted to give the story a forward-looking perspective. This section uses historical trends and selected projection scenarios to explore possible sea-level changes through 2033. It includes expected values and a shaded range to communicate uncertainty. The intention is not to present the projection as a guaranteed outcome, but to help readers understand what different future trajectories could look like.</>
                    )}
                    {ch.num === "09" && (
                      <>Finally, I wanted to bring the different findings together. The risk assessment uses a combined score based on cumulative sea-level rise, rate of change, volatility, and decadal acceleration. Readers can compare the scores of all 21 nations and explore the main contributing factors for an individual country. The final section brings the story back to its central message: sea-level changes are not just numbers in a dataset. They have wider implications for coastal communities, freshwater resources, homes, and the future of Pacific island nations. I wanted the experience to end with a better understanding of why these changes deserve attention.</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 04 */}
        <section id="showing-the-data" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">04</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Finding the right way to show the data
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              One of the most interesting parts of this project was deciding how to present each finding.
            </p>
            <p>
              I didn't want to use the same chart style everywhere. Different questions need different visual approaches.
            </p>
            <p>
              I explored different chart types and tried to understand which ones could communicate the information most clearly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3">
              {[
                {
                  type: "Line charts",
                  desc: "Used to show how sea-level anomalies changed over time. They make it easier to understand the overall direction of the data and identify important changes.",
                },
                {
                  type: "Heatmaps",
                  desc: "Used to bring 651 observations into one visual space. This makes it easier to compare countries and years without opening separate charts for every nation.",
                },
                {
                  type: "Bar charts",
                  desc: "Help compare the speed of sea-level rise across countries and make it easier to identify which nations have higher or lower values.",
                },
                {
                  type: "Slope & comparison charts",
                  desc: "Explored to compare the rate of sea-level rise across different periods. They help readers see whether a country is moving towards a faster or slower rate of change.",
                },
                {
                  type: "Radar charts",
                  desc: "For the risk assessment, used to show different components of an individual nation's risk score across multiple dimensions.",
                },
                {
                  type: "Projection charts",
                  desc: "Used projection charts with shaded ranges to show possible future changes while making uncertainty visible.",
                },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-card/30 border border-border/70 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <LineChart className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{c.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>

            <p>
              I spent time experimenting with chart layouts, colours, labels, tooltips, sorting, and annotations.
            </p>
            <p>
              Some visualizations were redesigned, while others were simplified or removed when they did not add enough value.
            </p>
            <p className="font-medium text-foreground">
              I wanted the charts to look good, but their main purpose was always to make the information easier to understand.
            </p>
          </div>
        </section>

        {/* Section 05 */}
        <section id="interactivity" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">05</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Making the experience interactive
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              I didn't want people to simply scroll through a long report and read what I had already decided to show them.
            </p>
            <p>
              I wanted them to become part of the exploration.
            </p>
            <p>
              That is why I introduced interactions throughout the experience. Readers can:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
              {[
                "Explore individual Pacific nations.",
                "Search and compare countries.",
                "Sort countries using different measurements.",
                "Move over charts to see detailed information.",
                "Switch between different chart views.",
                "Explore El Niño and La Niña periods.",
                "Compare regional patterns.",
                "Investigate historical changes across decades.",
                "Examine individual risk scores and their contributing factors.",
                "Export country-level data as a CSV file.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/25 border border-border/50 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <p>
              I wanted these interactions to feel useful rather than decorative.
            </p>
            <p>
              For example, the heatmap allows readers to change the sorting method and look at the same information from a different perspective. The risk assessment allows them to select a country and investigate the factors behind its score.
            </p>
            <p>
              This makes the website useful for two kinds of readers: those who want to follow the story and those who want to explore the data themselves.
            </p>
          </div>
        </section>

        {/* Section 06 */}
        <section id="simple-language" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">06</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Explaining the science in simple language
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              Another thing I paid attention to was how the information was written.
            </p>
            <p>
              Scientific subjects can quickly become difficult to understand when they are filled with technical terms, complicated labels, and unexplained measurements.
            </p>
            <p>
              I wanted the website to be approachable even for someone who had never studied sea-level anomalies before.
            </p>
            <p>
              I worked on making the descriptions, chart titles, labels, and explanations more direct. I also wanted readers to understand:
            </p>

            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-slate-200">
              <li>What a sea-level anomaly actually means.</li>
              <li>Why a particular measurement matters.</li>
              <li>What the chart is showing.</li>
              <li>How different values should be compared.</li>
              <li>Where the data comes from.</li>
              <li>How the calculations are made.</li>
              <li>What the results can and cannot tell us.</li>
            </ul>

            <p>
              This is why I included dedicated methodology, formulas, and API exploration sections.
            </p>
            <p>
              I believe that a good data story should not hide the process behind its results. People should have a way to understand where the information comes from and how it has been used.
            </p>
          </div>
        </section>

        {/* Section 07 */}
        <section id="technology" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">07</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Building the technology behind the story
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              Along with the research and visualization work, I also worked on the engineering needed to bring the complete experience together.
            </p>
            <p>
              The project uses React, Tailwind CSS, Framer Motion, Recharts, and D3.js, supported by an Express.js API backend.
            </p>
            <p>My work included:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
              {[
                "Structuring the application and its components.",
                "Building the individual story sections.",
                "Creating interactive data visualizations.",
                "Preparing and processing climate data.",
                "Developing API endpoints.",
                "Validating data structures.",
                "Creating API documentation and an API Explorer.",
                "Improving responsive layouts and accessibility.",
                "Working on deployment and performance improvements.",
              ].map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/25 border border-border/50 text-xs sm:text-sm text-slate-200">
                  <Code className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <p>
              I wanted the application to be more than a set of static pages. It needed to support multiple visualizations, different ways of exploring the data, and a smooth experience across devices.
            </p>
            <p>
              As the project grew, I also revisited how the data was delivered. I worked on preparing static climate data in advance to reduce unnecessary processing and improve loading performance.
            </p>
            <p className="font-medium text-foreground">
              For me, this was another important part of the project: making sure that the technical decisions supported the experience I wanted people to have.
            </p>
          </div>
        </section>

        {/* Section 08 */}
        <section id="experimentation" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">08</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Improving the work through experimentation
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              I didn't build the complete project in one attempt.
            </p>
            <p>
              The story, design, visualizations, and technical implementation changed as I worked on them.
            </p>
            <p>
              I regularly went back to earlier sections and asked myself whether they were doing their job properly:
            </p>

            <div className="p-4 rounded-xl bg-card/30 border border-border/70 space-y-1.5 text-xs sm:text-sm font-serif italic text-cyan-200">
              <p>• Could the chart be clearer?</p>
              <p>• Could the explanation be shorter?</p>
              <p>• Was the interaction useful?</p>
              <p>• Was the section in the right place?</p>
              <p>• Was I showing too much information at once?</p>
              <p>• Could I communicate the same finding in a better way?</p>
            </div>

            <p>
              I redesigned charts, changed layouts, refined calculations, improved descriptions, and removed unnecessary elements.
            </p>
            <p>
              There were also times when I had to rethink an approach completely.
            </p>
            <p>
              I see this as one of the most important parts of the process. Building something is only the beginning. Being able to review your own work, recognize what is not working, and improve it is what makes the final result stronger.
            </p>
            <p className="font-medium text-foreground">
              I treated the project as a continuous process of learning and experimentation.
            </p>
          </div>
        </section>

        {/* Section 09 */}
        <section id="bringing-together" className="space-y-4 border-l-2 border-cyan-500/30 pl-5 sm:pl-7 py-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">09</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Bringing everything together
            </h3>
          </div>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              By the end, I wanted the project to bring several things together in one place:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
              {[
                "Scientific data exploration.",
                "Meaningful analytical comparisons.",
                "Interactive data visualization.",
                "Storytelling through multiple chapters.",
                "Clear explanations of complex information.",
                "Transparent methodology.",
                "Future-oriented exploration.",
                "A complete, responsive web experience.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/25 border border-border/50 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <p>
              I wanted every part of the project to support the same goal: helping people understand the changing sea levels across the Pacific.
            </p>
            <p>
              The result is more than a collection of charts. It is an attempt to connect data, analysis, design, and technology into one meaningful experience.
            </p>
          </div>
        </section>

        {/* Big Divider */}
        <hr className="border-border/60" />

        {/* What I Wanted to Bring to the Table */}
        <section id="bring-to-table" className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-cyan-400" />
            What I Wanted to Bring to the Table
          </h2>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <p>
              For me, the real challenge was not simply learning how to visualize the data or deciding which technology to use.
            </p>
            <p>
              It was bringing different ways of thinking together to solve one problem.
            </p>
            <p>
              I approached the project with the mindset of someone who wanted to understand the data, question the findings, communicate the results, design the experience, and build the technology behind it.
            </p>
            <p>I wanted to bring:</p>

            <div className="space-y-3 my-4">
              {[
                {
                  title: "Curiosity to explore beyond the obvious.",
                  desc: "Rather than stopping at the overall sea-level rise, I wanted to investigate differences between countries, regions, time periods, and climate events.",
                },
                {
                  title: "The ability to connect data with a story.",
                  desc: "I wanted the findings to feel connected. Every chapter builds on the previous one and helps readers understand another part of the subject.",
                },
                {
                  title: "A strong focus on visual communication.",
                  desc: "I believe choosing the right chart is just as important as writing the code that creates it. The visualization should make the answer easier to see.",
                },
                {
                  title: "The freedom to experiment.",
                  desc: "I was willing to redesign, simplify, replace, or remove my own work whenever I found a better way to communicate an idea.",
                },
                {
                  title: "An engineering mindset.",
                  desc: "I didn't want the creative direction to stop at the design stage. I wanted to build the data processing, API, interactions, and complete application needed to make the experience work.",
                },
                {
                  title: "Attention to the complete experience.",
                  desc: "From the first headline to the final conclusion, I wanted the reader to feel that they were moving through one connected story.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-card/30 border border-border/70 flex flex-col gap-1">
                  <span className="font-semibold text-slate-100 text-sm sm:text-base">{item.title}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</span>
                </div>
              ))}
            </div>

            <p>
              I believe the real value of this project comes from bringing all these things together.
            </p>
            <p>
              Creating a chart is one task. Understanding the question behind it, choosing the right visual form, explaining its meaning, making it interactive, and connecting it to a larger story is a much bigger challenge.
            </p>
            <p className="font-medium text-foreground">
              That is what I wanted to explore through this project.
            </p>
          </div>
        </section>

        {/* Big Divider */}
        <hr className="border-border/60" />

        {/* From Data to Understanding */}
        <section id="from-data-to-understanding" className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-cyan-400" />
            From Data to Understanding
          </h2>
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            <div className="p-6 my-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-transparent border border-cyan-500/30">
              <p className="text-lg sm:text-xl font-serif italic text-cyan-200">
                "Data should not just be seen. It should be understood."
              </p>
            </div>

            <p>
              My approach to <em className="text-foreground">Pacific Sea Level Anomalies</em> was based on one simple belief.
            </p>
            <p>
              I wanted to take 30 years of climate observations from 21 Pacific nations and turn them into something people could explore without needing to read a scientific report or understand complicated analytical methods beforehand.
            </p>
            <p>
              I wanted them to start with the bigger picture, discover differences between nations, explore patterns, understand climate influences, compare future possibilities, and think about what the findings could mean.
            </p>
            <p>
              This project represents the kind of work I enjoy doing — bringing together data, design, development, and storytelling to make complex information easier to understand.
            </p>
            <p>
              It also reflects how I like to approach problems: explore deeply, question the obvious, experiment with different ideas, and keep improving until the experience communicates what it was meant to communicate.
            </p>
            <p className="text-base sm:text-lg font-serif font-bold text-slate-100 pt-2">
              I didn't want to simply show people what the data contained. I wanted to give them a reason to explore it and a story worth understanding.
            </p>
          </div>
        </section>

        {/* Development, Authorship & AI Assistance */}
        <section id="authorship" className="p-6 sm:p-8 rounded-3xl bg-card/25 border border-border/80 space-y-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-cyan-300">
            Development, Authorship & AI Assistance
          </h3>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
            <p>
              This project involved substantial independent work across research, data exploration, storytelling, visualization, design, and software development.
            </p>
            <p>
              I drove the main idea, research direction, narrative structure, visualization choices, interaction design, and most of the implementation. I also spent considerable time experimenting with different approaches, reviewing the results, and improving the experience throughout development.
            </p>
            <p>
              I used AI tools, including <a href="https://antigravity.google/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Antigravity</a> and <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Gemini</a>, for limited code support, technical guidance, and design suggestions in selected parts of the process.
            </p>
            <p>
              However, the overall direction and creative decisions remained mine. I reviewed, modified, and refined AI-assisted suggestions to make sure they matched the original idea and the needs of the project.
            </p>
            <p>
              The development history also reflects the continuous work and improvements made throughout the project.
            </p>
            <p className="font-medium text-foreground pt-1">
              This is primarily my own research, thinking, experimentation, and development, with AI used as a supporting tool rather than a replacement for my work.
            </p>
            <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="italic text-cyan-400">
                Concept, analysis, design, and development by{" "}
                <a
                  href="https://www.linkedin.com/in/imakashram/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300/70 transition-colors"
                >
                  Akash Ram
                </a>
                .
              </span>
              <a
                href="https://github.com/imakashram/pacific-sea-level-anomalies/commits/master/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30"
              >
                View GitHub commit history →
              </a>
            </div>
          </div>
        </section>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Interactive Climate Story</span>
          </a>

          <a
            href="/methodology"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-card/80 border border-border hover:border-cyan-500/35 text-xs font-semibold text-muted-foreground hover:text-cyan-300 transition-all shadow-sm cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>View Calculation Methodology & Formulas</span>
          </a>
        </div>
      </main>
    </div>
  );
}
