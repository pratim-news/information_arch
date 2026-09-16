import fs from 'fs';
const html = fs.readFileSync('fss-consumer-data-model-interactive.html', 'utf8');
const m = html.match(/id="vc-published-data">([\s\S]*?)<\/script>/);
const d = JSON.parse(m[1]);
const stages = (d.stages || []).map((s) => ({
  label: s.label,
  valueChain: s.valueChain || s.journey || '',
}));
console.log('Value Chain headers:');
stages.forEach((s) => console.log(' ', s.label, '=>', s.valueChain || '(EMPTY!)'));
const empty = stages.filter((s) => !s.valueChain);
console.log(empty.length ? 'FAIL' : 'OK all present');
console.log('normalizeStages?', html.includes('function normalizeStages'));
console.log('grid-row:2?', html.includes('grid-row:2;grid-column'));
