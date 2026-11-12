import { createRoot } from "react-dom/client";
import { setBaseUrl, setStaticDataFallback } from "@workspace/api-client-react";
import staticClimateData from "./data/staticClimateData.json";
import App from "./App";
import "./index.css";

// Pre-load static data so first-time visitors get instant, zero-delay loading
setStaticDataFallback(staticClimateData as Record<string, unknown>);

const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  const absoluteUrl = apiUrl.startsWith("http://") || apiUrl.startsWith("https://")
    ? apiUrl
    : `https://${apiUrl}`;
  setBaseUrl(absoluteUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
