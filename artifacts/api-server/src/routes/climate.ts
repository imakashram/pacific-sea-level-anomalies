import { Router } from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

interface RawRow {
  CLIMATE_CHANGE_INDICATORS: string;
  "Climate Change Indicators": string;
  GEO_PICT: string;
  "Pacific Island Countries and territories": string;
  TIME_PERIOD: string;
  OBS_VALUE: string;
}

interface DataPoint {
  indicator: string;
  code: string;
  country: string;
  year: number;
  value: number;
}

function loadData(): DataPoint[] {
  const csvPath = join(__dirname, "../data/climate_change.csv");
  const raw = readFileSync(csvPath, "utf-8");
  const result = Papa.parse<RawRow>(raw, { header: true, skipEmptyLines: true });
  return result.data
    .filter((row) => row.OBS_VALUE !== "" && row.OBS_VALUE != null)
    .map((row) => ({
      indicator: row.CLIMATE_CHANGE_INDICATORS,
      code: row.GEO_PICT,
      country: row["Pacific Island Countries and territories"],
      year: parseInt(row.TIME_PERIOD, 10),
      value: parseFloat(row.OBS_VALUE),
    }))
    .filter((d) => !isNaN(d.year) && !isNaN(d.value));
}

let cachedData: DataPoint[] | null = null;
function getData(): DataPoint[] {
  if (!cachedData) cachedData = loadData();
  return cachedData;
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function linearSlope(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const xMean = xs.reduce((s, v) => s + v, 0) / n;
  const yMean = ys.reduce((s, v) => s + v, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0);
  const den = xs.reduce((s, x) => s + Math.pow(x - xMean, 2), 0);
  return den === 0 ? 0 : num / den;
}

// ── Existing endpoints ──────────────────────────────────────────────────────

router.get("/climate/overview", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const countries = [...new Set(seaLevel.map((d) => d.country))];
  const years = [...new Set(seaLevel.map((d) => d.year))].sort();

  const countryTotals = countries.map((c) => {
    const vals = seaLevel.filter((d) => d.country === c);
    const first = vals.find((d) => d.year === Math.min(...vals.map((v) => v.year)));
    const last = vals.find((d) => d.year === Math.max(...vals.map((v) => v.year)));
    return {
      country: c,
      rise: (last?.value ?? 0) - (first?.value ?? 0),
      avg: vals.reduce((s, v) => s + v.value, 0) / vals.length,
    };
  });

  const maxCountry = countryTotals.reduce((a, b) => (a.rise > b.rise ? a : b));
  const overallAvgRise = countryTotals.reduce((s, c) => s + c.rise, 0) / countryTotals.length;
  const countriesAboveAvg = countryTotals.filter((c) => c.rise > overallAvgRise).length;

  const baseline = seaLevel.filter((d) => d.year >= 1993 && d.year <= 2002);
  const recent = seaLevel.filter((d) => d.year >= 2014 && d.year <= 2023);
  const baselineAvg = baseline.reduce((s, d) => s + d.value, 0) / (baseline.length || 1);
  const recentAvg = recent.reduce((s, d) => s + d.value, 0) / (recent.length || 1);

  res.json({
    totalCountries: countries.length,
    yearRange: { start: years[0], end: years[years.length - 1] },
    totalObservations: seaLevel.length,
    avgRiseMeters: parseFloat(overallAvgRise.toFixed(3)),
    maxRiseCountry: maxCountry.country,
    maxRiseValue: parseFloat(maxCountry.rise.toFixed(3)),
    countriesAboveAvg,
    elNinoYear: 1998,
    recentDecadeAvg: parseFloat(recentAvg.toFixed(3)),
    baselineDecadeAvg: parseFloat(baselineAvg.toFixed(3)),
  });
});

router.get("/climate/sea-level-trend", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort();

  const trend = years.map((year) => {
    const yearData = seaLevel.filter((d) => d.year === year);
    const values = yearData.map((d) => d.value);
    const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
    return {
      year,
      avgAnomaly: parseFloat(avg.toFixed(4)),
      minAnomaly: Math.min(...values),
      maxAnomaly: Math.max(...values),
      countriesRising: values.filter((v) => v > 0).length,
    };
  });

  res.json(trend);
});

router.get("/climate/sea-level-by-country", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const result = countries.map((country) => {
    const countryData = seaLevel.filter((d) => d.country === country);
    const sorted = countryData.sort((a, b) => a.year - b.year);
    const code = countryData[0]?.code ?? "";
    const values = sorted.map((d) => d.value);
    const firstVal = values[0] ?? 0;
    const lastVal = values[values.length - 1] ?? 0;
    const cumRise = lastVal - firstVal;

    const midpoint = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, midpoint).reduce((s, v) => s + v, 0) / midpoint;
    const secondHalfAvg = values.slice(midpoint).reduce((s, v) => s + v, 0) / (values.length - midpoint);
    const trend: "rising" | "stable" | "variable" =
      secondHalfAvg - firstHalfAvg > 0.03
        ? "rising"
        : Math.abs(secondHalfAvg - firstHalfAvg) < 0.01
        ? "stable"
        : "variable";

    return {
      country,
      code,
      data: sorted.map((d) => ({ year: d.year, value: d.value })),
      cumulativeRise: parseFloat(cumRise.toFixed(3)),
      trend,
    };
  });

  res.json(result);
});

router.get("/climate/heatmap", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort();
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const matrix = countries.map((country) =>
    years.map((year) => {
      const point = seaLevel.find((d) => d.country === country && d.year === year);
      return point?.value ?? 0;
    })
  );

  const allValues = matrix.flat();
  res.json({
    years,
    countries,
    matrix,
    minValue: Math.min(...allValues),
    maxValue: Math.max(...allValues),
  });
});

// ── New analytics endpoints ─────────────────────────────────────────────────

/**
 * /climate/decade-analysis
 * Per-country average anomaly broken into 3 decades:
 *   D1: 1993–2002 (baseline), D2: 2003–2012 (transition), D3: 2013–2023 (acceleration)
 * Also returns the overall aggregate per decade for trend context.
 */
router.get("/climate/decade-analysis", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const DECADES = [
    { label: "1993–2002", key: "d1", start: 1993, end: 2002 },
    { label: "2003–2012", key: "d2", start: 2003, end: 2012 },
    { label: "2013–2023", key: "d3", start: 2013, end: 2023 },
  ];

  const countryRows = countries.map((country) => {
    const countryData = seaLevel.filter((d) => d.country === country);
    const code = countryData[0]?.code ?? "";
    const decadeAvgs: Record<string, number> = {};

    for (const decade of DECADES) {
      const slice = countryData.filter((d) => d.year >= decade.start && d.year <= decade.end);
      decadeAvgs[decade.key] = slice.length
        ? parseFloat((slice.reduce((s, d) => s + d.value, 0) / slice.length).toFixed(4))
        : 0;
    }

    const acceleration = parseFloat((decadeAvgs["d3"] - decadeAvgs["d1"]).toFixed(4));

    return {
      country,
      code,
      d1: decadeAvgs["d1"],
      d2: decadeAvgs["d2"],
      d3: decadeAvgs["d3"],
      acceleration,
    };
  });

  // Global averages per decade
  const globalDecades = DECADES.map((decade) => {
    const slice = seaLevel.filter((d) => d.year >= decade.start && d.year <= decade.end);
    return {
      key: decade.key,
      label: decade.label,
      avg: slice.length
        ? parseFloat((slice.reduce((s, d) => s + d.value, 0) / slice.length).toFixed(4))
        : 0,
    };
  });

  res.json({ countries: countryRows, globalDecades });
});

/**
 * /climate/volatility
 * Per-country volatility (standard deviation of annual anomalies) and mean.
 * Enables a scatter plot: X = mean anomaly, Y = volatility.
 * Also returns global stdDev for reference line.
 */
router.get("/climate/volatility", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const countryStats = countries.map((country) => {
    const vals = seaLevel.filter((d) => d.country === country).map((d) => d.value);
    const code = seaLevel.find((d) => d.country === country)?.code ?? "";
    const mean = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
    const sd = stdDev(vals);

    // Quadrant: highMean + highVol → "Extreme", highMean + lowVol → "Steady", etc.
    return {
      country,
      code,
      mean: parseFloat(mean.toFixed(4)),
      volatility: parseFloat(sd.toFixed(4)),
      observations: vals.length,
    };
  });

  const allVals = seaLevel.map((d) => d.value);
  const globalMean = allVals.reduce((s, v) => s + v, 0) / (allVals.length || 1);
  const globalVolatility = stdDev(allVals);

  res.json({
    countries: countryStats,
    globalMean: parseFloat(globalMean.toFixed(4)),
    globalVolatility: parseFloat(globalVolatility.toFixed(4)),
  });
});

/**
 * /climate/acceleration
 * Linear slope (meters/year) of sea level anomaly for each country,
 * computed over 3 windows: full period, first half, second half.
 * Reveals where rise is speeding up most dramatically.
 */
router.get("/climate/acceleration", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const result = countries.map((country) => {
    const pts = seaLevel.filter((d) => d.country === country).sort((a, b) => a.year - b.year);
    const code = pts[0]?.code ?? "";
    const xs = pts.map((p) => p.year);
    const ys = pts.map((p) => p.value);

    const mid = Math.floor(pts.length / 2);
    const slopeFullPeriod = parseFloat(linearSlope(xs, ys).toFixed(5));
    const slopeFirstHalf = parseFloat(linearSlope(xs.slice(0, mid), ys.slice(0, mid)).toFixed(5));
    const slopeSecondHalf = parseFloat(linearSlope(xs.slice(mid), ys.slice(mid)).toFixed(5));
    const accelerating = slopeSecondHalf > slopeFirstHalf;

    return {
      country,
      code,
      slopeFullPeriod,
      slopeFirstHalf,
      slopeSecondHalf,
      accelerating,
    };
  });

  // Sort by full-period slope descending
  result.sort((a, b) => b.slopeFullPeriod - a.slopeFullPeriod);
  res.json(result);
});

/**
 * /climate/rankings
 * Full sortable summary table: all countries with all key metrics in one response.
 * Designed for a comprehensive data table with rich sorting capabilities.
 */
router.get("/climate/rankings", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const result = countries.map((country) => {
    const pts = seaLevel.filter((d) => d.country === country).sort((a, b) => a.year - b.year);
    const code = pts[0]?.code ?? "";
    const vals = pts.map((p) => p.value);
    const years = pts.map((p) => p.year);

    const mean = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
    const sd = stdDev(vals);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const cumulativeRise = (vals[vals.length - 1] ?? 0) - (vals[0] ?? 0);
    const peakYear = years[vals.indexOf(maxVal)] ?? 0;
    const troughYear = years[vals.indexOf(minVal)] ?? 0;
    const slope = linearSlope(years, vals);

    // Decade averages
    const d1 = pts.filter((p) => p.year >= 1993 && p.year <= 2002);
    const d2 = pts.filter((p) => p.year >= 2003 && p.year <= 2012);
    const d3 = pts.filter((p) => p.year >= 2013 && p.year <= 2023);
    const d1Avg = d1.length ? d1.reduce((s, p) => s + p.value, 0) / d1.length : 0;
    const d3Avg = d3.length ? d3.reduce((s, p) => s + p.value, 0) / d3.length : 0;

    return {
      country,
      code,
      mean: parseFloat(mean.toFixed(4)),
      volatility: parseFloat(sd.toFixed(4)),
      cumulativeRise: parseFloat(cumulativeRise.toFixed(3)),
      peakValue: parseFloat(maxVal.toFixed(3)),
      peakYear,
      troughValue: parseFloat(minVal.toFixed(3)),
      troughYear,
      slope: parseFloat(slope.toFixed(5)),
      d1Avg: parseFloat(d1Avg.toFixed(4)),
      d3Avg: parseFloat(d3Avg.toFixed(4)),
      decadeAcceleration: parseFloat((d3Avg - d1Avg).toFixed(4)),
      observations: vals.length,
    };
  });

  result.sort((a, b) => b.cumulativeRise - a.cumulativeRise);
  res.json(result);
});

/**
 * /climate/country-profile/:code
 * Full single-country deep-dive: time series, decade averages, stats, rank vs peers.
 */
router.get("/climate/country-profile/:code", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const { code } = req.params;

  const pts = seaLevel
    .filter((d) => d.code.toLowerCase() === code.toLowerCase())
    .sort((a, b) => a.year - b.year);

  if (pts.length === 0) {
    res.status(404).json({ error: `No data found for country code: ${code}` });
    return;
  }

  const country = pts[0]?.country ?? "";
  const vals = pts.map((p) => p.value);
  const years = pts.map((p) => p.year);

  const mean = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  const sd = stdDev(vals);
  const slope = linearSlope(years, vals);

  const DECADES = [
    { label: "1993–2002", start: 1993, end: 2002 },
    { label: "2003–2012", start: 2003, end: 2012 },
    { label: "2013–2023", start: 2013, end: 2023 },
  ];
  const decadeBreakdown = DECADES.map((d) => {
    const slice = pts.filter((p) => p.year >= d.start && p.year <= d.end);
    return {
      label: d.label,
      avg: slice.length
        ? parseFloat((slice.reduce((s, p) => s + p.value, 0) / slice.length).toFixed(4))
        : 0,
      count: slice.length,
    };
  });

  // 5-year rolling average on this country's series
  const window = 5;
  const timeSeries = pts.map((pt, i) => {
    const half = Math.floor(window / 2);
    const slice = vals.slice(Math.max(0, i - half), Math.min(vals.length, i + half + 1));
    const rolling = slice.reduce((s, v) => s + v, 0) / slice.length;
    return {
      year: pt.year,
      value: pt.value,
      rollingAvg: parseFloat(rolling.toFixed(4)),
    };
  });

  // Rank among all countries by cumulative rise
  const allCountries = [...new Set(seaLevel.map((d) => d.country))];
  const cumulativeRise = (vals[vals.length - 1] ?? 0) - (vals[0] ?? 0);
  const allRises = allCountries.map((c) => {
    const cVals = seaLevel.filter((d) => d.country === c).sort((a, b) => a.year - b.year);
    const cv = cVals.map((p) => p.value);
    return (cv[cv.length - 1] ?? 0) - (cv[0] ?? 0);
  });
  allRises.sort((a, b) => b - a);
  const rank = allRises.findIndex((r) => r <= cumulativeRise) + 1;

  res.json({
    country,
    code: pts[0]?.code ?? "",
    timeSeries,
    decadeBreakdown,
    stats: {
      mean: parseFloat(mean.toFixed(4)),
      volatility: parseFloat(sd.toFixed(4)),
      cumulativeRise: parseFloat(cumulativeRise.toFixed(3)),
      slope: parseFloat(slope.toFixed(5)),
      peakValue: Math.max(...vals),
      peakYear: years[vals.indexOf(Math.max(...vals))] ?? 0,
      troughValue: Math.min(...vals),
      troughYear: years[vals.indexOf(Math.min(...vals))] ?? 0,
      observations: vals.length,
      rankByCumulativeRise: rank,
      totalCountries: allCountries.length,
    },
  });
});

/**
 * /climate/forecast
 * Projects global average sea level anomaly through 2033 using linear regression.
 * Returns historical series (all years) + projected points with ±2σ confidence bands.
 */
router.get("/climate/forecast", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort();

  const yearlyAvgs = years.map((year) => {
    const vals = seaLevel.filter((d) => d.year === year).map((d) => d.value);
    return { year, avg: vals.reduce((s, v) => s + v, 0) / (vals.length || 1) };
  });

  // Linear regression over full historical period
  const xs = yearlyAvgs.map((p) => p.year);
  const ys = yearlyAvgs.map((p) => p.avg);
  const slope = linearSlope(xs, ys);
  const xMean = xs.reduce((s, v) => s + v, 0) / xs.length;
  const yMean = ys.reduce((s, v) => s + v, 0) / ys.length;
  const intercept = yMean - slope * xMean;

  // RMSE of residuals for confidence intervals
  const residuals = ys.map((y, i) => y - (slope * xs[i] + intercept));
  const rmse = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length);

  // R² coefficient of determination
  const ssTot = ys.reduce((s, y) => s + Math.pow(y - yMean, 2), 0);
  const ssRes = residuals.reduce((s, r) => s + r * r, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  const historical = yearlyAvgs.map((p) => ({
    year: p.year,
    avgAnomaly: parseFloat(p.avg.toFixed(4)),
  }));

  // Project 2024–2033
  const projectionYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
  const projected = projectionYears.map((year) => {
    const proj = slope * year + intercept;
    const sigma = rmse * 2;
    return {
      year,
      projected: parseFloat(proj.toFixed(4)),
      lower: parseFloat((proj - sigma).toFixed(4)),
      upper: parseFloat((proj + sigma).toFixed(4)),
    };
  });

  // Projected rise vs 2023 baseline
  const baseline2023 = slope * 2023 + intercept;
  const proj2030 = slope * 2030 + intercept;
  const proj2033 = slope * 2033 + intercept;

  res.json({
    historical,
    projected,
    slopeMmPerYear: parseFloat((slope * 1000).toFixed(3)),
    r2: parseFloat(r2.toFixed(4)),
    projectedRise2030: parseFloat((proj2030 - baseline2023).toFixed(4)),
    projectedRise2033: parseFloat((proj2033 - baseline2023).toFixed(4)),
  });
});

/**
 * /climate/risk-scores
 * Composite 0–100 risk score per country based on 4 weighted dimensions:
 *   - Cumulative rise (40%)
 *   - Slope / rate of rise (30%)
 *   - Volatility (15%)
 *   - Decade acceleration D1→D3 (15%)
 * Risk tiers: Critical ≥80, High ≥60, Medium ≥40, Low <40
 */
router.get("/climate/risk-scores", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  // Collect raw metrics per country
  const rawMetrics = countries.map((country) => {
    const pts = seaLevel.filter((d) => d.country === country).sort((a, b) => a.year - b.year);
    const code = pts[0]?.code ?? "";
    const vals = pts.map((p) => p.value);
    const years = pts.map((p) => p.year);

    const cumulativeRise = (vals[vals.length - 1] ?? 0) - (vals[0] ?? 0);
    const slope = linearSlope(years, vals);
    const volatility = stdDev(vals);

    const d1 = pts.filter((p) => p.year >= 1993 && p.year <= 2002);
    const d3 = pts.filter((p) => p.year >= 2013 && p.year <= 2023);
    const d1Avg = d1.length ? d1.reduce((s, p) => s + p.value, 0) / d1.length : 0;
    const d3Avg = d3.length ? d3.reduce((s, p) => s + p.value, 0) / d3.length : 0;
    const decadeAcceleration = d3Avg - d1Avg;

    return { country, code, cumulativeRise, slope, volatility, decadeAcceleration };
  });

  // Normalize each metric to 0–100 range
  function normalizeArr(arr: number[]): number[] {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return arr.map((v) => (max === min ? 50 : ((v - min) / (max - min)) * 100));
  }

  const rises = normalizeArr(rawMetrics.map((m) => m.cumulativeRise));
  const slopes = normalizeArr(rawMetrics.map((m) => m.slope));
  const vols = normalizeArr(rawMetrics.map((m) => m.volatility));
  const accels = normalizeArr(rawMetrics.map((m) => m.decadeAcceleration));

  const scored = rawMetrics.map((m, i) => {
    const riseScore = parseFloat(rises[i].toFixed(1));
    const slopeScore = parseFloat(slopes[i].toFixed(1));
    const volatilityScore = parseFloat(vols[i].toFixed(1));
    const accelerationScore = parseFloat(accels[i].toFixed(1));

    const riskScore = parseFloat(
      (riseScore * 0.4 + slopeScore * 0.3 + volatilityScore * 0.15 + accelerationScore * 0.15).toFixed(1)
    );
    const riskLevel: "Critical" | "High" | "Medium" | "Low" =
      riskScore >= 80 ? "Critical" : riskScore >= 60 ? "High" : riskScore >= 40 ? "Medium" : "Low";

    return {
      country: m.country,
      code: m.code,
      riskScore,
      riskLevel,
      components: { riseScore, slopeScore, volatilityScore, accelerationScore },
      cumulativeRise: parseFloat(m.cumulativeRise.toFixed(3)),
      slope: parseFloat((m.slope * 1000).toFixed(3)),
      volatility: parseFloat(m.volatility.toFixed(4)),
      decadeAcceleration: parseFloat(m.decadeAcceleration.toFixed(4)),
    };
  });

  scored.sort((a, b) => b.riskScore - a.riskScore);

  const avgRiskScore = parseFloat(
    (scored.reduce((s, c) => s + c.riskScore, 0) / (scored.length || 1)).toFixed(1)
  );

  res.json({
    countries: scored,
    avgRiskScore,
    criticalCount: scored.filter((c) => c.riskLevel === "Critical").length,
    highCount: scored.filter((c) => c.riskLevel === "High").length,
    mediumCount: scored.filter((c) => c.riskLevel === "Medium").length,
    lowCount: scored.filter((c) => c.riskLevel === "Low").length,
  });
});

// ── Geographic regional clusters ─────────────────────────────────────────────
const REGION_MAP: Record<string, string> = {
  // Micronesia
  FM: "Micronesia", GU: "Micronesia", KI: "Micronesia",
  MH: "Micronesia", NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
  // Melanesia
  FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
  // Polynesia
  AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
  WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
};

router.get("/climate/geographic-clusters", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);

  const regions = ["Polynesia", "Melanesia", "Micronesia"];

  const regionData = regions.map((region) => {
    const nations = seaLevel
      .filter((d) => REGION_MAP[d.code] === region)
      .map((d) => d.code);
    const regionCodes = [...new Set(nations)];
    const regionPts = seaLevel.filter((d) => REGION_MAP[d.code] === region);

    // Year-by-year regional averages
    const yearlyAvg = years.map((year) => {
      const pts = regionPts.filter((d) => d.year === year);
      const avg = pts.length ? pts.reduce((s, d) => s + d.value, 0) / pts.length : 0;
      return { year, avgAnomaly: parseFloat(avg.toFixed(4)) };
    });

    // Per-nation stats
    const nationStats = regionCodes.map((code) => {
      const pts = seaLevel.filter((d) => d.code === code).sort((a, b) => a.year - b.year);
      const vals = pts.map((p) => p.value);
      const country = pts[0]?.country ?? code;
      const cumulativeRise = (vals[vals.length - 1] ?? 0) - (vals[0] ?? 0);
      const slope = linearSlope(pts.map((p) => p.year), vals);
      const d1 = pts.filter((p) => p.year >= 1993 && p.year <= 2002);
      const d3 = pts.filter((p) => p.year >= 2013 && p.year <= 2023);
      const d1Avg = d1.length ? d1.reduce((s, p) => s + p.value, 0) / d1.length : 0;
      const d3Avg = d3.length ? d3.reduce((s, p) => s + p.value, 0) / d3.length : 0;
      return { code, country, cumulativeRise, slope, acceleration: d3Avg - d1Avg };
    });

    const avgCumRise = nationStats.reduce((s, n) => s + n.cumulativeRise, 0) / (nationStats.length || 1);
    const avgSlope = nationStats.reduce((s, n) => s + n.slope, 0) / (nationStats.length || 1);
    const avgAccel = nationStats.reduce((s, n) => s + n.acceleration, 0) / (nationStats.length || 1);
    const topNation = [...nationStats].sort((a, b) => b.cumulativeRise - a.cumulativeRise)[0];

    const allVals = regionPts.map((d) => d.value);
    const sd = stdDev(allVals);

    return {
      region,
      nationCount: regionCodes.length,
      nations: nationStats,
      yearlyAvg,
      stats: {
        avgCumulativeRise: parseFloat(avgCumRise.toFixed(4)),
        avgSlopeMmPerYear: parseFloat((avgSlope * 1000).toFixed(3)),
        avgDecadeAcceleration: parseFloat(avgAccel.toFixed(4)),
        avgVolatility: parseFloat(sd.toFixed(4)),
        topNation: topNation?.country ?? "",
        topNationRise: parseFloat((topNation?.cumulativeRise ?? 0).toFixed(4)),
      },
    };
  });

  // Sort by avgCumulativeRise descending
  regionData.sort((a, b) => b.stats.avgCumulativeRise - a.stats.avgCumulativeRise);

  res.json({ years, regions: regionData });
});

// ── Threshold crossings ───────────────────────────────────────────────────────
router.get("/climate/threshold-crossings", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const nations = countries.map((country) => {
    const pts = seaLevel.filter((d) => d.country === country).sort((a, b) => a.year - b.year);
    const code = pts[0]?.code ?? "";
    const vals = pts.map((p) => p.value);
    const years = pts.map((p) => p.year);

    const firstCrossing = (threshold: number): number | null => {
      for (let i = 0; i < pts.length; i++) {
        if ((pts[i]?.value ?? -Infinity) >= threshold) return pts[i]?.year ?? null;
      }
      return null;
    };

    const countAbove = (threshold: number) => vals.filter((v) => v >= threshold).length;

    const latestValue = vals[vals.length - 1] ?? 0;
    const cumulativeRise = latestValue - (vals[0] ?? 0);
    const firstPositive = firstCrossing(0.0);
    const firstTenth = firstCrossing(0.1);
    const firstFifth = firstCrossing(0.2);

    // Consecutive years above zero (from most recent going backward)
    let streakAboveZero = 0;
    for (let i = vals.length - 1; i >= 0; i--) {
      if ((vals[i] ?? 0) > 0) streakAboveZero++;
      else break;
    }

    return {
      country,
      code,
      firstPositive,
      firstTenth,
      firstFifth,
      yearsPositive: countAbove(0.0),
      yearsAboveTenth: countAbove(0.1),
      yearsAboveFifth: countAbove(0.2),
      streakAboveZero,
      latestValue: parseFloat(latestValue.toFixed(3)),
      cumulativeRise: parseFloat(cumulativeRise.toFixed(3)),
    };
  });

  // Sort by firstPositive ascending (earliest first), nulls last
  nations.sort((a, b) => {
    if (a.firstPositive == null && b.firstPositive == null) return 0;
    if (a.firstPositive == null) return 1;
    if (b.firstPositive == null) return -1;
    return a.firstPositive - b.firstPositive;
  });

  const crossedZero = nations.filter((n) => n.firstPositive != null).length;
  const crossedTenth = nations.filter((n) => n.firstTenth != null).length;
  const crossedFifth = nations.filter((n) => n.firstFifth != null).length;
  const avgFirstPositive = nations
    .filter((n) => n.firstPositive != null)
    .reduce((s, n) => s + n.firstPositive!, 0) / (crossedZero || 1);

  res.json({
    nations,
    summary: {
      crossedZero,
      crossedTenth,
      crossedFifth,
      total: nations.length,
      avgFirstPositiveYear: parseFloat(avgFirstPositive.toFixed(1)),
    },
  });
});

// ── El Niño impact by nation ──────────────────────────────────────────────────
router.get("/climate/el-nino-impact", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const nations = countries.map((country) => {
    const pts = seaLevel.filter((d) => d.country === country);
    const code = pts[0]?.code ?? "";
    const get = (yr: number) => pts.find((d) => d.year === yr)?.value ?? null;

    const v1997 = get(1997);
    const v1998 = get(1998);
    const v1999 = get(1999);
    const v2000 = get(2000);

    const preAvg = [v1997].filter((v) => v != null).reduce((s, v) => s + v!, 0) /
      ([v1997].filter((v) => v != null).length || 1);
    const postAvg = [v1999, v2000].filter((v) => v != null).reduce((s, v) => s + v!, 0) /
      ([v1999, v2000].filter((v) => v != null).length || 1);

    return {
      country,
      code,
      v1997: v1997 != null ? parseFloat(v1997.toFixed(3)) : null,
      v1998: v1998 != null ? parseFloat(v1998.toFixed(3)) : null,
      v1999: v1999 != null ? parseFloat(v1999.toFixed(3)) : null,
      v2000: v2000 != null ? parseFloat(v2000.toFixed(3)) : null,
      drop: v1998 != null ? parseFloat((v1998 - preAvg).toFixed(3)) : null,
      recovery: v1998 != null && postAvg != null ? parseFloat((postAvg - v1998).toFixed(3)) : null,
    };
  });

  // Sort by 1998 value ascending (most negative first)
  nations.sort((a, b) => (a.v1998 ?? 0) - (b.v1998 ?? 0));

  const v1997All = nations.filter((n) => n.v1997 != null).map((n) => n.v1997!);
  const v1998All = nations.filter((n) => n.v1998 != null).map((n) => n.v1998!);
  const v1999All = nations.filter((n) => n.v1999 != null).map((n) => n.v1999!);

  const avg = (arr: number[]) => arr.length ? parseFloat((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(4)) : 0;

  res.json({
    nations,
    globalAvg1997: avg(v1997All),
    globalAvg1998: avg(v1998All),
    globalAvg1999: avg(v1999All),
    totalNegative1998: nations.filter((n) => (n.v1998 ?? 0) < 0).length,
    avgDrop: avg(nations.filter((n) => n.drop != null).map((n) => n.drop!)),
  });
});

/**
 * /climate/enso-sensitivity
 * Per-country average sea level anomaly split by ENSO phase:
 *   El Niño (1997-98, 2015-16), La Niña (2010-11, 2020-21), Neutral (all other years)
 * Sensitivity = La Niña avg − El Niño avg: reveals how much each nation swings with ENSO cycles.
 */
router.get("/climate/enso-sensitivity", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const ELNINO_YEARS = new Set([1997, 1998, 2015, 2016]);
  const LANINA_YEARS = new Set([2010, 2011, 2020, 2021]);

  const avg = (vals: number[]): number =>
    vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;

  const nations = countries.map((country) => {
    const pts = seaLevel.filter((d) => d.country === country);
    const code = pts[0]?.code ?? "";

    const elNinoVals = pts.filter((d) => ELNINO_YEARS.has(d.year)).map((d) => d.value);
    const laNinaVals = pts.filter((d) => LANINA_YEARS.has(d.year)).map((d) => d.value);
    const neutralVals = pts
      .filter((d) => !ELNINO_YEARS.has(d.year) && !LANINA_YEARS.has(d.year))
      .map((d) => d.value);

    const elNinoAvg = parseFloat(avg(elNinoVals).toFixed(4));
    const laNinaAvg = parseFloat(avg(laNinaVals).toFixed(4));
    const neutralAvg = parseFloat(avg(neutralVals).toFixed(4));
    const sensitivity = parseFloat((laNinaAvg - elNinoAvg).toFixed(4));

    return { country, code, elNinoAvg, laNinaAvg, neutralAvg, sensitivity };
  });

  nations.sort((a, b) => b.sensitivity - a.sensitivity);

  const allElNino = seaLevel.filter((d) => ELNINO_YEARS.has(d.year)).map((d) => d.value);
  const allLaNina = seaLevel.filter((d) => LANINA_YEARS.has(d.year)).map((d) => d.value);
  const allNeutral = seaLevel
    .filter((d) => !ELNINO_YEARS.has(d.year) && !LANINA_YEARS.has(d.year))
    .map((d) => d.value);

  res.json({
    nations,
    global: {
      elNinoAvg: parseFloat(avg(allElNino).toFixed(4)),
      laNinaAvg: parseFloat(avg(allLaNina).toFixed(4)),
      neutralAvg: parseFloat(avg(allNeutral).toFixed(4)),
    },
    elNinoYears: [1997, 1998, 2015, 2016],
    laNinaYears: [2010, 2011, 2020, 2021],
  });
});

/**
 * /climate/annual-deviation
 * Pacific-wide annual mean vs 30-year grand mean — deviation per year — for lollipop chart.
 */
router.get("/climate/annual-deviation", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const EL_NINO = new Set([1997, 1998, 2015, 2016]);
  const LA_NINA = new Set([2010, 2011, 2020, 2021]);

  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);
  const annualAvgs = years.map((year) => {
    const vals = seaLevel.filter((d) => d.year === year).map((d) => d.value);
    return { year, avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0 };
  });

  const mean30yr = annualAvgs.reduce((s, d) => s + d.avg, 0) / (annualAvgs.length || 1);

  const deviations = annualAvgs.map((d) => ({
    year: d.year,
    avg: parseFloat(d.avg.toFixed(4)),
    deviation: parseFloat((d.avg - mean30yr).toFixed(4)),
    enso: EL_NINO.has(d.year) ? "el-nino" : LA_NINA.has(d.year) ? "la-nina" : "neutral",
  }));

  res.json({
    deviations,
    mean30yr: parseFloat(mean30yr.toFixed(4)),
    maxDeviation: parseFloat(Math.max(...deviations.map((d) => d.deviation)).toFixed(4)),
    minDeviation: parseFloat(Math.min(...deviations.map((d) => d.deviation)).toFixed(4)),
  });
});

export default router;




