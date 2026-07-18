import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode for the premium cinematic feel
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
