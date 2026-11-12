import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = process.env.API_BASE_URL || "http://localhost:5001";

const countryCodes = [
  "FM", "PW", "PG", "SB", "VU", "AS", "CK", "FJ", "PF", "GU",
  "KI", "MH", "NR", "NC", "NU", "MP", "WS", "TK", "TO", "TV", "WF"
];

const endpoints = [
  "/api/healthz",
  "/api/story/hero-section",
  "/api/story/data-landscape",
  "/api/story/ocean-rising",
  "/api/story/pace-of-change",
  "/api/story/enso-effect",
  "/api/story/patterns-over-time",
  "/api/story/future-outlook",
  "/api/story/risk-assessment",
  "/api/story/pacific-at-a-glance",
  "/api/story/what-this-means",
  "/api/story/decade-analysis",
  "/api/story/annual-deviation",
  "/api/story/sub-regions",
  "/api/core/raw-data",
  "/api/core/sea-level-by-country",
];

for (const code of countryCodes) {
  endpoints.push(`/api/story/explore-any-nation/${code}`);
  endpoints.push(`/api/story/explore-any-nation/${code.toLowerCase()}`);
}

async function main() {
  console.log(`Fetching ${endpoints.length} endpoints from ${baseUrl}...`);
  const staticData = {};

  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed ${endpoint}: ${res.status}`);
        continue;
      }
      const data = await res.json();
      staticData[endpoint] = data;
      console.log(`✓ Fetched ${endpoint}`);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err.message);
    }
  }

  const outputDir = path.resolve(__dirname, "../src/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.resolve(outputDir, "staticClimateData.json");
  fs.writeFileSync(outputPath, JSON.stringify(staticData, null, 2), "utf-8");
  console.log(`Saved static data to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);

  // Also write individual public files for direct CDN serving if desired
  const publicApiDir = path.resolve(__dirname, "../public/api");
  for (const [endpoint, data] of Object.entries(staticData)) {
    const relativePath = endpoint.replace(/^\/api\//, "");
    const filePath = path.resolve(publicApiDir, `${relativePath}.json`);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
  }
  console.log(`Saved individual JSON files to ${publicApiDir}`);
}

main().catch(console.error);

