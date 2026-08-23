import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  const absoluteUrl = apiUrl.startsWith("http://") || apiUrl.startsWith("https://")
    ? apiUrl
    : `https://${apiUrl}`;
  setBaseUrl(absoluteUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
