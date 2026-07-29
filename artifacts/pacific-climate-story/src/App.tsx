import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFoundPage from "@/pages/NotFoundPage";
import StoryPage from "@/pages/StoryPage";
import ApiExplorerPage from "@/pages/ApiExplorerPage";
import HowItIsCalculatedPage from "@/pages/HowItIsCalculatedPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={StoryPage} />
      <Route path="/explorer" component={ApiExplorerPage} />
      <Route path="/api-explorer" component={ApiExplorerPage} />
      <Route path="/how-it-is-calculated" component={HowItIsCalculatedPage} />
      <Route path="/calculations" component={HowItIsCalculatedPage} />
      <Route path="/methodology" component={HowItIsCalculatedPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  // Force dark mode and reset scroll position on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Disable native scroll restoration and force scroll to top
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
