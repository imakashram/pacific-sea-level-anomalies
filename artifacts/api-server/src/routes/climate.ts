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

router.get("/climate/country-comparison", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const countries = [...new Set(seaLevel.map((d) => d.country))].sort();

  const result = countries.map((country) => {
    const countryData = seaLevel.filter((d) => d.country === country);
    const sorted = countryData.sort((a, b) => a.year - b.year);
    const code = countryData[0]?.code ?? "";
    const values = sorted.map((d) => d.value);
    const years = sorted.map((d) => d.year);
    const firstVal = values[0] ?? 0;
    const lastVal = values[values.length - 1] ?? 0;
    const maxVal = Math.max(...values);
    const maxIdx = values.indexOf(maxVal);

    return {
      country,
      code,
      latestAnomaly: lastVal,
      cumulativeRise: parseFloat((lastVal - firstVal).toFixed(3)),
      averageAnomaly: parseFloat(
        (values.reduce((s, v) => s + v, 0) / (values.length || 1)).toFixed(3)
      ),
      peakYear: years[maxIdx] ?? 0,
      peakValue: maxVal,
    };
  });

  result.sort((a, b) => b.cumulativeRise - a.cumulativeRise);
  res.json(result);
});

router.get("/climate/anomalies", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const anomalies: {
    year: number;
    country: string;
    code: string;
    value: number;
    type: "peak" | "trough" | "shift";
    description: string;
  }[] = [];

  seaLevel
    .filter((d) => d.year === 1998 && d.value <= -0.1)
    .forEach((d) => {
      anomalies.push({
        year: 1998,
        country: d.country,
        code: d.code,
        value: d.value,
        type: "trough",
        description: `${d.country} recorded a ${d.value}m anomaly in 1998 — the strongest El Nino event in modern records temporarily suppressed sea levels across the Pacific.`,
      });
    });

  seaLevel
    .filter((d) => d.year === 2021 && d.value >= 0.2)
    .forEach((d) => {
      anomalies.push({
        year: 2021,
        country: d.country,
        code: d.code,
        value: d.value,
        type: "peak",
        description: `${d.country} hit a record +${d.value}m anomaly in 2021, the highest in the dataset — reflecting accelerating sea level rise in the post-2010 period.`,
      });
    });

  const countries = [...new Set(seaLevel.map((d) => d.country))];
  countries.forEach((country) => {
    const countryData = seaLevel.filter((d) => d.country === country).sort((a, b) => a.year - b.year);
    const pre2006 = countryData.filter((d) => d.year <= 2006);
    const post2006 = countryData.filter((d) => d.year > 2006);
    const preAvg = pre2006.reduce((s, d) => s + d.value, 0) / (pre2006.length || 1);
    const postAvg = post2006.reduce((s, d) => s + d.value, 0) / (post2006.length || 1);

    if (postAvg - preAvg > 0.08) {
      anomalies.push({
        year: 2007,
        country,
        code: countryData[0]?.code ?? "",
        value: parseFloat((postAvg - preAvg).toFixed(3)),
        type: "shift",
        description: `${country} shows a clear structural shift after 2006: average anomaly rose from ${preAvg.toFixed(2)}m to ${postAvg.toFixed(2)}m — a sustained +${(postAvg - preAvg).toFixed(2)}m change that has not reversed.`,
      });
    }
  });

  anomalies.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  res.json(anomalies.slice(0, 15));
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
 * /climate/rate-of-change
 * Year-over-year delta in the global average sea level anomaly.
 * Positive = acceleration, Negative = deceleration/El Niño effects.
 * Also includes a 5-year centered rolling average of the global trend.
 */
router.get("/climate/rate-of-change", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort();

  const yearlyAvgs = years.map((year) => {
    const vals = seaLevel.filter((d) => d.year === year).map((d) => d.value);
    return { year, avg: vals.reduce((s, v) => s + v, 0) / (vals.length || 1) };
  });

  const window = 5;
  const result = yearlyAvgs.map((pt, i) => {
    const prev = yearlyAvgs[i - 1];
    const delta = prev ? parseFloat((pt.avg - prev.avg).toFixed(4)) : null;

    // 5-year centered rolling average
    const half = Math.floor(window / 2);
    const slice = yearlyAvgs.slice(Math.max(0, i - half), Math.min(yearlyAvgs.length, i + half + 1));
    const rollingAvg = parseFloat(
      (slice.reduce((s, p) => s + p.avg, 0) / slice.length).toFixed(4)
    );

    return {
      year: pt.year,
      avgAnomaly: parseFloat(pt.avg.toFixed(4)),
      yoyDelta: delta,
      rollingAvg,
    };
  });

  res.json(result);
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

// ── Cumulative rise timeseries ────────────────────────────────────────────────
router.get("/climate/cumulative-rise-timeseries", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);

  const countryGroups = new Map<string, { country: string; code: string; pts: { year: number; value: number }[] }>();
  for (const d of seaLevel) {
    if (!countryGroups.has(d.country)) {
      countryGroups.set(d.country, { country: d.country, code: d.code, pts: [] });
    }
    countryGroups.get(d.country)!.pts.push({ year: d.year, value: d.value });
  }

  const countries = Array.from(countryGroups.values()).map(({ country, code, pts }) => {
    pts.sort((a, b) => a.year - b.year);
    const baseline = pts[0]?.value ?? 0;

    const dataPoints = years.map((y) => {
      const pt = pts.find((p) => p.year === y);
      const raw = pt?.value ?? null;
      return {
        year: y,
        cumulative: raw != null ? parseFloat((raw - baseline).toFixed(4)) : null,
        raw: raw != null ? parseFloat(raw.toFixed(4)) : null,
      };
    }).filter((p) => p.raw != null) as { year: number; cumulative: number; raw: number }[];

    const totalRise = parseFloat(((pts[pts.length - 1]?.value ?? 0) - baseline).toFixed(4));
    return { country, code, totalRise, data: dataPoints };
  });

  // Sort by totalRise descending so top risers come first
  countries.sort((a, b) => b.totalRise - a.totalRise);

  res.json({ years, countries });
});

// ── Nations rising by year ────────────────────────────────────────────────────
router.get("/climate/nations-rising-by-year", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);

  const result = years.map((year) => {
    const pts = seaLevel.filter((d) => d.year === year);
    const total = pts.length;
    const rising = pts.filter((d) => d.value > 0).length;
    const avgAnomaly = total > 0 ? pts.reduce((s, d) => s + d.value, 0) / total : 0;
    return {
      year,
      count: rising,
      total,
      pct: parseFloat(((rising / total) * 100).toFixed(1)),
      avgAnomaly: parseFloat(avgAnomaly.toFixed(4)),
    };
  });

  res.json(result);
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
 * /climate/correlation-matrix
 * Pearson correlation coefficient between every pair of Pacific nations'
 * annual sea level anomaly time series (1993–2023).
 * Reveals which nations share oceanographic fate and which diverge.
 */
router.get("/climate/correlation-matrix", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const countryMap = new Map<string, string>();
  for (const d of seaLevel) {
    if (!countryMap.has(d.country)) countryMap.set(d.country, d.code);
  }
  const countryList = [...countryMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);

  const series = countryList.map(([country]) =>
    years.map((yr) => seaLevel.find((d) => d.country === country && d.year === yr)?.value ?? 0)
  );

  function pearson(a: number[], b: number[]): number {
    const n = a.length;
    if (n === 0) return 0;
    const aMean = a.reduce((s, v) => s + v, 0) / n;
    const bMean = b.reduce((s, v) => s + v, 0) / n;
    const num = a.reduce((s, v, i) => s + (v - aMean) * ((b[i] ?? 0) - bMean), 0);
    const denA = Math.sqrt(a.reduce((s, v) => s + (v - aMean) ** 2, 0));
    const denB = Math.sqrt(b.reduce((s, v) => s + (v - bMean) ** 2, 0));
    return denA === 0 || denB === 0 ? 0 : num / (denA * denB);
  }

  const n = countryList.length;
  const matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      parseFloat(pearson(series[i] ?? [], series[j] ?? []).toFixed(3))
    )
  );

  let maxCorr = { i: 0, j: 1, r: -Infinity };
  let minCorr = { i: 0, j: 1, r: Infinity };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const r = matrix[i]?.[j] ?? 0;
      if (r > maxCorr.r) maxCorr = { i, j, r };
      if (r < minCorr.r) minCorr = { i, j, r };
    }
  }

  const avgCorrelation = countryList.map(([country, code], i) => {
    const others = (matrix[i] ?? []).filter((_, j) => j !== i);
    const mean = others.reduce((s, v) => s + v, 0) / (others.length || 1);
    return { country, code, avgCorrelation: parseFloat(mean.toFixed(3)) };
  }).sort((a, b) => b.avgCorrelation - a.avgCorrelation);

  res.json({
    countries: countryList.map(([c]) => c),
    codes: countryList.map(([, code]) => code),
    matrix,
    mostCorrelated: {
      countryA: countryList[maxCorr.i]?.[0] ?? "",
      codeA: countryList[maxCorr.i]?.[1] ?? "",
      countryB: countryList[maxCorr.j]?.[0] ?? "",
      codeB: countryList[maxCorr.j]?.[1] ?? "",
      r: parseFloat(maxCorr.r.toFixed(3)),
    },
    leastCorrelated: {
      countryA: countryList[minCorr.i]?.[0] ?? "",
      codeA: countryList[minCorr.i]?.[1] ?? "",
      countryB: countryList[minCorr.j]?.[0] ?? "",
      codeB: countryList[minCorr.j]?.[1] ?? "",
      r: parseFloat(minCorr.r.toFixed(3)),
    },
    avgCorrelation,
  });
});

/**
 * /climate/nation-rankings
 * For each year 1993-2023, rank all 21 nations by their sea level anomaly.
 * Rank 1 = lowest anomaly, rank 21 = highest.
 * Powers the bump chart showing how each nation's relative position changes over time.
 */
router.get("/climate/nation-rankings", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const countryMap = new Map<string, string>();
  for (const d of seaLevel) {
    if (!countryMap.has(d.code)) countryMap.set(d.code, d.country);
  }

  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);
  const codes = [...countryMap.keys()].sort();

  const byYear = new Map<number, Map<string, number>>();
  for (const yr of years) {
    const yearMap = new Map<string, number>();
    for (const d of seaLevel) {
      if (d.year === yr) yearMap.set(d.code, d.value);
    }
    byYear.set(yr, yearMap);
  }

  const ranksPerYear: { year: number; ranked: { code: string; value: number; rank: number }[] }[] = [];
  for (const yr of years) {
    const yearMap = byYear.get(yr)!;
    const sorted = codes
      .filter((c) => yearMap.has(c))
      .map((c) => ({ code: c, value: yearMap.get(c)! }))
      .sort((a, b) => a.value - b.value);
    ranksPerYear.push({
      year: yr,
      ranked: sorted.map((d, i) => ({ code: d.code, value: parseFloat(d.value.toFixed(4)), rank: i + 1 })),
    });
  }

  const nations = codes.map((code) => ({
    code,
    country: countryMap.get(code) ?? code,
    ranks: years.map((yr) => {
      const entry = ranksPerYear.find((r) => r.year === yr)?.ranked.find((d) => d.code === code);
      return entry?.rank ?? null;
    }),
    anomalies: years.map((yr) => {
      const entry = ranksPerYear.find((r) => r.year === yr)?.ranked.find((d) => d.code === code);
      return entry?.value ?? null;
    }),
    finalRank: ranksPerYear[ranksPerYear.length - 1]?.ranked.find((d) => d.code === code)?.rank ?? null,
    rankVolatility: (() => {
      const r = years.map((yr) =>
        ranksPerYear.find((e) => e.year === yr)?.ranked.find((d) => d.code === code)?.rank ?? null
      ).filter((v): v is number => v !== null);
      if (r.length < 2) return 0;
      const mean = r.reduce((s, v) => s + v, 0) / r.length;
      return parseFloat(Math.sqrt(r.reduce((s, v) => s + (v - mean) ** 2, 0) / r.length).toFixed(2));
    })(),
  }));

  res.json({ years, nations });
});

/**
 * /climate/decade-distributions
 * Box-and-whisker statistics per decade (1993-2002, 2003-2012, 2013-2023)
 * for both the Pacific-wide distribution and each individual nation.
 */
router.get("/climate/decade-distributions", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const DECADES = [
    { label: "1993–2002", start: 1993, end: 2002 },
    { label: "2003–2012", start: 2003, end: 2012 },
    { label: "2013–2023", start: 2013, end: 2023 },
  ];

  function quartiles(values: number[]): { min: number; q1: number; median: number; q3: number; max: number; mean: number } {
    if (values.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const q = (p: number): number => {
      const idx = p * (n - 1);
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      return lo === hi ? (sorted[lo] ?? 0) : (sorted[lo] ?? 0) + ((sorted[hi] ?? 0) - (sorted[lo] ?? 0)) * (idx - lo);
    };
    const mean = values.reduce((s, v) => s + v, 0) / n;
    return {
      min: parseFloat((sorted[0] ?? 0).toFixed(4)),
      q1: parseFloat(q(0.25).toFixed(4)),
      median: parseFloat(q(0.5).toFixed(4)),
      q3: parseFloat(q(0.75).toFixed(4)),
      max: parseFloat((sorted[n - 1] ?? 0).toFixed(4)),
      mean: parseFloat(mean.toFixed(4)),
    };
  }

  const global = DECADES.map((dec) => {
    const vals = seaLevel
      .filter((d) => d.year >= dec.start && d.year <= dec.end)
      .map((d) => d.value);
    return { decade: dec.label, ...quartiles(vals), count: vals.length };
  });

  const codeMap = new Map<string, string>();
  for (const d of seaLevel) {
    if (!codeMap.has(d.code)) codeMap.set(d.code, d.country);
  }
  const codes = [...codeMap.keys()].sort();

  const nations = codes.map((code) => ({
    code,
    country: codeMap.get(code) ?? code,
    decades: DECADES.map((dec) => {
      const vals = seaLevel
        .filter((d) => d.code === code && d.year >= dec.start && d.year <= dec.end)
        .map((d) => d.value);
      return { decade: dec.label, ...quartiles(vals) };
    }),
  }));

  res.json({ decades: DECADES.map((d) => d.label), global, nations });
});

/**
 * /climate/nation-treemap
 * Per-nation summary for treemap: total rise (2023 anomaly), acceleration
 * (avg of last 5 years / avg of first 5 years), and volatility (std dev).
 * Nations sized by total rise, colored by acceleration.
 */
router.get("/climate/nation-treemap", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const codeMap = new Map<string, string>();
  for (const d of seaLevel) {
    if (!codeMap.has(d.code)) codeMap.set(d.code, d.country);
  }
  const codes = [...codeMap.keys()].sort();

  const nations = codes.map((code) => {
    const series = seaLevel.filter((d) => d.code === code).sort((a, b) => a.year - b.year);

    const firstFive = series.filter((d) => d.year >= 1993 && d.year <= 1997).map((d) => d.value);
    const lastFive = series.filter((d) => d.year >= 2019 && d.year <= 2023).map((d) => d.value);
    const firstAvg = firstFive.length ? firstFive.reduce((s, v) => s + v, 0) / firstFive.length : 0;
    const lastAvg = lastFive.length ? lastFive.reduce((s, v) => s + v, 0) / lastFive.length : 0;
    const totalRise = series[series.length - 1]?.value ?? 0;
    const allVals = series.map((d) => d.value);
    const mean = allVals.reduce((s, v) => s + v, 0) / (allVals.length || 1);
    const volatility = allVals.length
      ? Math.sqrt(allVals.reduce((s, v) => s + (v - mean) ** 2, 0) / allVals.length)
      : 0;

    const yoyChanges: number[] = [];
    for (let i = 1; i < series.length; i++) {
      yoyChanges.push((series[i]?.value ?? 0) - (series[i - 1]?.value ?? 0));
    }
    const avgYoY = yoyChanges.length ? yoyChanges.reduce((s, v) => s + v, 0) / yoyChanges.length : 0;

    return {
      code,
      country: codeMap.get(code) ?? code,
      totalRise: parseFloat(totalRise.toFixed(4)),
      firstQuintAvg: parseFloat(firstAvg.toFixed(4)),
      lastQuintAvg: parseFloat(lastAvg.toFixed(4)),
      acceleration: parseFloat((lastAvg - firstAvg).toFixed(4)),
      volatility: parseFloat(volatility.toFixed(4)),
      avgYoYChange: parseFloat(avgYoY.toFixed(5)),
    };
  });

  res.json({ nations });
});

/**
 * /climate/yoy-budget
 * Year-over-year change in Pacific-wide average sea level anomaly.
 * Each entry includes the spacer value (previous total) and the signed change,
 * enabling a floating waterfall chart where bars show annual gain or loss.
 */
router.get("/climate/yoy-budget", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");
  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);

  const avgByYear = years.map((yr) => {
    const vals = seaLevel.filter((d) => d.year === yr).map((d) => d.value);
    const avg = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
    return { year: yr, avg: parseFloat(avg.toFixed(5)) };
  });

  let runningTotal = 0;
  const entries = avgByYear.map((d, i) => {
    const prev = avgByYear[i - 1];
    const yoyChange = prev !== undefined ? parseFloat((d.avg - prev.avg).toFixed(5)) : d.avg;
    const spacer = i === 0 ? 0 : parseFloat(runningTotal.toFixed(5));
    runningTotal = parseFloat((runningTotal + yoyChange).toFixed(5));
    return {
      year: d.year,
      avgAnomaly: d.avg,
      yoyChange,
      spacer: yoyChange >= 0 ? spacer : parseFloat((spacer + yoyChange).toFixed(5)),
      absChange: parseFloat(Math.abs(yoyChange).toFixed(5)),
      positive: yoyChange >= 0,
      runningTotal: parseFloat(runningTotal.toFixed(5)),
    };
  });

  const totalRise = parseFloat((avgByYear[avgByYear.length - 1]!.avg - (avgByYear[0]?.avg ?? 0)).toFixed(5));
  const positiveYears = entries.filter((e) => e.positive).length;
  const negativeYears = entries.length - positiveYears;
  const biggestGain = [...entries].sort((a, b) => b.yoyChange - a.yoyChange)[0]!;
  const biggestLoss = [...entries].sort((a, b) => a.yoyChange - b.yoyChange)[0]!;

  res.json({ entries, totalRise, positiveYears, negativeYears, biggestGain, biggestLoss });
});

/**
 * /climate/anomaly-profiles
 * Per-nation array of all 31 annual sea level anomaly values, with summary stats.
 * Used to build a ridge/density plot showing each nation's distribution shape.
 */
router.get("/climate/anomaly-profiles", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const codeMap = new Map<string, string>();
  for (const d of seaLevel) {
    if (!codeMap.has(d.code)) codeMap.set(d.code, d.country);
  }

  const REGION: Record<string, string> = {
    AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
    WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
    FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
    FM: "Micronesia", GU: "Micronesia", KI: "Micronesia", MH: "Micronesia",
    NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
  };

  const codes = [...codeMap.keys()].sort();
  const nations = codes.map((code) => {
    const vals = seaLevel
      .filter((d) => d.code === code)
      .sort((a, b) => a.year - b.year)
      .map((d) => parseFloat(d.value.toFixed(4)));

    const n = vals.length || 1;
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted[Math.floor(n / 2)] ?? 0;

    return {
      code,
      country: codeMap.get(code) ?? code,
      region: REGION[code] ?? "Unknown",
      values: vals,
      mean: parseFloat(mean.toFixed(4)),
      std: parseFloat(std.toFixed(4)),
      min: parseFloat((sorted[0] ?? 0).toFixed(4)),
      max: parseFloat((sorted[n - 1] ?? 0).toFixed(4)),
      median: parseFloat(median.toFixed(4)),
    };
  });

  const sortedByMean = [...nations].sort((a, b) => b.mean - a.mean);
  res.json({ nations: sortedByMean });
});

/**
 * /climate/start-end-comparison
 * Per-nation exact 1993 vs 2023 sea level anomaly, sorted by total change.
 * Powers the dumbbell chart showing each nation's 30-year leap.
 */
router.get("/climate/start-end-comparison", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const REGION: Record<string, string> = {
    AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
    WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
    FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
    FM: "Micronesia", GU: "Micronesia", KI: "Micronesia", MH: "Micronesia",
    NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
  };

  const codeMap = new Map<string, string>();
  for (const d of seaLevel) if (!codeMap.has(d.code)) codeMap.set(d.code, d.country);

  const nations = [...codeMap.keys()].sort().map((code) => {
    const series = seaLevel.filter((d) => d.code === code).sort((a, b) => a.year - b.year);
    const val1993 = series.find((d) => d.year === 1993)?.value ?? series[0]?.value ?? 0;
    const val2023 = series.find((d) => d.year === 2023)?.value ?? series[series.length - 1]?.value ?? 0;
    const change = val2023 - val1993;
    const pctChange = val1993 !== 0 ? change / Math.abs(val1993) : 0;
    return {
      code,
      country: codeMap.get(code) ?? code,
      region: REGION[code] ?? "Unknown",
      val1993: parseFloat(val1993.toFixed(4)),
      val2023: parseFloat(val2023.toFixed(4)),
      change: parseFloat(change.toFixed(4)),
      pctChange: parseFloat(pctChange.toFixed(3)),
    };
  }).sort((a, b) => b.change - a.change);

  const totalChange = nations.reduce((s, n) => s + n.change, 0) / (nations.length || 1);
  res.json({ nations, avgChange: parseFloat(totalChange.toFixed(4)) });
});

/**
 * /climate/regional-decade-shares
 * Per-decade (3 decades) × per-region (3 regions): mean anomaly and proportional share.
 * Drives 3 donut charts showing how regional shares of total rise evolved over time.
 */
router.get("/climate/regional-decade-shares", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const REGION: Record<string, string> = {
    AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
    WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
    FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
    FM: "Micronesia", GU: "Micronesia", KI: "Micronesia", MH: "Micronesia",
    NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
  };

  const DECADES = [
    { label: "1993–2002", start: 1993, end: 2002 },
    { label: "2003–2012", start: 2003, end: 2012 },
    { label: "2013–2023", start: 2013, end: 2023 },
  ];
  const REGIONS = ["Micronesia", "Polynesia", "Melanesia"];

  const decades = DECADES.map((dec) => {
    const rows = seaLevel.filter((d) => d.year >= dec.start && d.year <= dec.end);
    const slices = REGIONS.map((region) => {
      const regionRows = rows.filter((d) => REGION[d.code] === region);
      const mean = regionRows.length
        ? regionRows.reduce((s, d) => s + d.value, 0) / regionRows.length
        : 0;
      const total = regionRows.reduce((s, d) => s + Math.max(d.value, 0), 0);
      return { region, mean: parseFloat(mean.toFixed(4)), total: parseFloat(total.toFixed(3)), count: regionRows.length };
    });
    const grandTotal = slices.reduce((s, sl) => s + sl.total, 0) || 1;
    return {
      decade: dec.label,
      slices: slices.map((sl) => ({
        ...sl,
        share: parseFloat((sl.total / grandTotal).toFixed(4)),
      })),
    };
  });

  res.json({ decades });
});

/**
 * /climate/nation-metrics
 * Per-nation normalized multi-metric data for parallel coordinates chart.
 * Includes: totalRise, ensoSensitivity, volatility, acceleration, finalRank.
 */
router.get("/climate/nation-metrics", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const REGION: Record<string, string> = {
    AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
    WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
    FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
    FM: "Micronesia", GU: "Micronesia", KI: "Micronesia", MH: "Micronesia",
    NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
  };

  const EL_NINO = new Set([1997, 1998, 2015, 2016]);
  const LA_NINA = new Set([2010, 2011, 2020, 2021]);

  const codeMap = new Map<string, string>();
  for (const d of seaLevel) if (!codeMap.has(d.code)) codeMap.set(d.code, d.country);

  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);

  const avgByYear = years.map((yr) => {
    const vals = seaLevel.filter((d) => d.year === yr).map((d) => d.value);
    return vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  });

  const nations = [...codeMap.keys()].sort().map((code) => {
    const series = seaLevel.filter((d) => d.code === code).sort((a, b) => a.year - b.year);
    const vals = series.map((d) => d.value);
    const n = vals.length || 1;
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const volatility = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n);

    const elNinoVals = series.filter((d) => EL_NINO.has(d.year)).map((d) => d.value);
    const laNinaVals = series.filter((d) => LA_NINA.has(d.year)).map((d) => d.value);
    const elNinoAvg = elNinoVals.length ? elNinoVals.reduce((s, v) => s + v, 0) / elNinoVals.length : 0;
    const laNinaAvg = laNinaVals.length ? laNinaVals.reduce((s, v) => s + v, 0) / laNinaVals.length : 0;
    const ensoSensitivity = laNinaAvg - elNinoAvg;

    const firstFive = series.filter((d) => d.year >= 1993 && d.year <= 1997).map((d) => d.value);
    const lastFive = series.filter((d) => d.year >= 2019 && d.year <= 2023).map((d) => d.value);
    const firstAvg = firstFive.length ? firstFive.reduce((s, v) => s + v, 0) / firstFive.length : 0;
    const lastAvg = lastFive.length ? lastFive.reduce((s, v) => s + v, 0) / lastFive.length : 0;
    const acceleration = lastAvg - firstAvg;
    const totalRise = series[series.length - 1]?.value ?? 0;

    return {
      code,
      country: codeMap.get(code) ?? code,
      region: REGION[code] ?? "Unknown",
      totalRise: parseFloat(totalRise.toFixed(4)),
      ensoSensitivity: parseFloat(ensoSensitivity.toFixed(4)),
      volatility: parseFloat(volatility.toFixed(4)),
      acceleration: parseFloat(acceleration.toFixed(4)),
    };
  });

  const rankedByYear = years.map((yr) => {
    const sorted = nations
      .map((n) => {
        const obs = seaLevel.find((d) => d.code === n.code && d.year === yr);
        return { code: n.code, val: obs?.value ?? 0 };
      })
      .sort((a, b) => a.val - b.val);
    return Object.fromEntries(sorted.map((d, i) => [d.code, i + 1]));
  });
  const finalRanks: Record<string, number> = rankedByYear[rankedByYear.length - 1] ?? {};

  const metrics = ["totalRise", "ensoSensitivity", "volatility", "acceleration"] as const;
  type Metric = typeof metrics[number];
  const minMax: Record<Metric, { min: number; max: number }> = {} as any;
  for (const m of metrics) {
    const vals = nations.map((n) => n[m]);
    minMax[m] = { min: Math.min(...vals), max: Math.max(...vals) };
  }
  const rankMin = 1, rankMax = nations.length;

  const normalize = (val: number, min: number, max: number) =>
    max === min ? 0.5 : parseFloat(((val - min) / (max - min)).toFixed(4));

  const result = nations.map((n) => ({
    ...n,
    finalRank: finalRanks[n.code] ?? 0,
    normalized: {
      totalRise: normalize(n.totalRise, minMax.totalRise.min, minMax.totalRise.max),
      ensoSensitivity: normalize(n.ensoSensitivity, minMax.ensoSensitivity.min, minMax.ensoSensitivity.max),
      volatility: normalize(n.volatility, minMax.volatility.min, minMax.volatility.max),
      acceleration: normalize(n.acceleration, minMax.acceleration.min, minMax.acceleration.max),
      finalRank: normalize(finalRanks[n.code] ?? 0, rankMin, rankMax),
    },
  }));

  res.json({
    nations: result,
    axes: [
      { key: "totalRise", label: "Total Rise", ...minMax.totalRise },
      { key: "ensoSensitivity", label: "ENSO Sensitivity", ...minMax.ensoSensitivity },
      { key: "volatility", label: "Volatility (σ)", ...minMax.volatility },
      { key: "acceleration", label: "Acceleration", ...minMax.acceleration },
      { key: "finalRank", label: "2023 Rank", min: rankMin, max: rankMax },
    ],
  });
});

/**
 * /climate/threshold-funnel
 * Cascading count of nations above successive sea level anomaly thresholds.
 * Includes historical 2003/2013/2023 comparison for each level.
 */
router.get("/climate/threshold-funnel", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const THRESHOLDS = [
    { label: "All Nations", value: -Infinity, desc: "Actively monitored" },
    { label: "Rising  >0cm", value: 0, desc: "Positive anomaly" },
    { label: "Alert   >5cm", value: 0.05, desc: "Above 5 cm" },
    { label: "Warning >10cm", value: 0.10, desc: "Above 10 cm" },
    { label: "Critical >15cm", value: 0.15, desc: "Above 15 cm" },
    { label: "Extreme >20cm", value: 0.20, desc: "Above 20 cm" },
  ];

  const codes = [...new Set(seaLevel.map((d) => d.code))];
  const COMPARE_YEARS = [2003, 2013, 2023];

  const latest = codes.map((code) => {
    const sorted = seaLevel.filter((d) => d.code === code).sort((a, b) => b.year - a.year);
    return { code, country: sorted[0]?.country ?? code, value: sorted[0]?.value ?? 0 };
  });

  const funnel = THRESHOLDS.map((t) => {
    const above2023 = latest.filter((n) => n.value > t.value);
    const historical = COMPARE_YEARS.map((yr) => {
      const vals = codes.map((code) => {
        const obs = seaLevel.find((d) => d.code === code && d.year === yr);
        return obs?.value ?? 0;
      });
      return { year: yr, count: vals.filter((v) => v > t.value).length };
    });
    return {
      threshold: isFinite(t.value) ? t.value : -1,
      label: t.label,
      desc: t.desc,
      count: above2023.length,
      total: codes.length,
      pct: parseFloat((above2023.length / codes.length).toFixed(3)),
      nations: above2023.map((n) => n.code),
      historical,
    };
  });

  res.json({ funnel, totalNations: codes.length });
});

/**
 * /climate/regional-streams
 * Per-year, per-region mean anomaly for silhouette streamgraph.
 */
router.get("/climate/regional-streams", (req, res): void => {
  const data = getData();
  const seaLevel = data.filter((d) => d.indicator === "SEA_LVL");

  const REGION: Record<string, string> = {
    AS: "Polynesia", CK: "Polynesia", PF: "Polynesia", NU: "Polynesia",
    WS: "Polynesia", TK: "Polynesia", TO: "Polynesia", TV: "Polynesia", WF: "Polynesia",
    FJ: "Melanesia", NC: "Melanesia", PG: "Melanesia", SB: "Melanesia", VU: "Melanesia",
    FM: "Micronesia", GU: "Micronesia", KI: "Micronesia", MH: "Micronesia",
    NR: "Micronesia", MP: "Micronesia", PW: "Micronesia",
  };

  const years = [...new Set(seaLevel.map((d) => d.year))].sort((a, b) => a - b);
  const REGIONS = ["Micronesia", "Polynesia", "Melanesia"] as const;

  const streams = years.map((year) => {
    const yd = seaLevel.filter((d) => d.year === year);
    const entry: Record<string, number> = { year };
    for (const region of REGIONS) {
      const vals = yd.filter((d) => REGION[d.code] === region).map((d) => d.value);
      entry[region] = vals.length
        ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(4))
        : 0;
    }
    entry.total = parseFloat(
      (REGIONS.reduce((s, r) => s + (entry[r] ?? 0), 0) / REGIONS.length).toFixed(4)
    );
    return entry;
  });

  res.json({ streams, years });
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




