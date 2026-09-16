const fs = require('fs');
const path = require('path');
const root = 'c:/Users/easyb/OneDrive/projects/NCA/FSS/LLM-Wiki-FSS/outcome/InformationArch';
const html = fs.readFileSync(path.join(root, 'fss-consumer-data-model-interactive.html'), 'utf8');
const m = html.match(/id="vc-published-data">([\s\S]*?)<\/script>/);
const data = JSON.parse(m[1]);

function block(b) {
  return { cap: b.cap, obj: b.obj, e: b.entity || null };
}
function stageRange(stages, from, to) {
  const ids = stages.map((s) => s.id);
  const a = ids.indexOf(from);
  const b = ids.indexOf(to);
  return ids.slice(Math.min(a, b), Math.max(a, b) + 1);
}

const tpl = {};
Object.keys(data.shopfrontTemplate).forEach((k) => (tpl[k] = block(data.shopfrontTemplate[k])));

console.log('HTML uses vc-data.js?', html.includes('src="vc-data.js"'));
console.log('FSS_VC guard?', html.includes('typeof FSS_VC'));
console.log('embedded rows', data.rows.length);

data.rows.forEach((row) => {
  console.log('\n## ' + row.label);
  if (row.useShopfrontTemplate) {
    Object.keys(tpl).forEach((s) => console.log('  ' + s + ': ' + tpl[s].cap + ' | ' + tpl[s].obj));
    return;
  }
  if (row.span) {
    console.log('  SPAN ' + row.span.from + '->' + row.span.to + ': ' + row.span.blocks[0].cap + ' | ' + row.span.blocks[0].obj);
    console.log('  stages covered:', stageRange(data.stages, row.span.from, row.span.to).join(','));
    return;
  }
  Object.keys(row.cells || {}).forEach((s) => {
    console.log('  ' + s + ': ' + row.cells[s].map((b) => b.cap + ' | ' + b.obj).join(' // '));
  });
});
