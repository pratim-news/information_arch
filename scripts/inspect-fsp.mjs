import fs from 'node:fs';
const html = fs.readFileSync(new URL('../fss-consumer-data-model-interactive.html', import.meta.url), 'utf8');
const m = html.match(/<script[^>]*id=["']vc-published-data["'][^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.log('no embedded block'); process.exit(0); }
const doc = JSON.parse(m[1]);
const fsp = doc.rows.find((r) => r.id === 'fsp');
const crm = doc.rows.find((r) => r.id === 'crm');
console.log('FSP:', JSON.stringify(fsp, null, 1));
console.log('CRM subscribe:', JSON.stringify(crm.cells && crm.cells.subscribe));
