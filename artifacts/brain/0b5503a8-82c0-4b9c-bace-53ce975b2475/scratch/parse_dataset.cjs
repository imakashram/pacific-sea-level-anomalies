const fs = require('fs');
const path = require('path');

const csvPath = path.join(process.cwd(), 'artifacts/api-server/data/climate_change.csv');
const raw = fs.readFileSync(csvPath, 'utf-8');
const lines = raw.split(/\r?\n/).filter(Boolean);

const data = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const matches = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
  if (matches.length < 6) continue;
  const indicator = matches[0].replace(/^"|"$/g, '').trim();
  const year = parseInt(matches[4].replace(/^"|"$/g, '').trim(), 10);
  const val = parseFloat(matches[5].replace(/^"|"$/g, '').trim());
  if (indicator === 'SEA_LVL' && !isNaN(year) && !isNaN(val)) {
    data.push({ year, val });
  }
}

const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
const EL = new Set([1997, 1998, 2015, 2016]);
const LA = new Set([2010, 2011, 2020, 2021]);

const dataset = years.map(y => {
  const matching = data.filter(d => d.year === y);
  const vals = matching.map(d => d.val);
  const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  const rising = vals.filter(v => v > 0).length;
  const enso = EL.has(y) ? 'el-nino' : LA.has(y) ? 'la-nina' : 'neutral';
  return {
    year: y,
    avgAnomaly: parseFloat(avg.toFixed(4)),
    countriesRising: rising,
    enso
  };
});

console.log(JSON.stringify(dataset, null, 2));
