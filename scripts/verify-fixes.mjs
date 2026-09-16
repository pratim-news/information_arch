import fs from 'fs';
const data = JSON.parse(fs.readFileSync('data/value-chain.json', 'utf8'));
const html = fs.readFileSync('fss-consumer-data-model-interactive.html', 'utf8');
const m = html.match(/id="vc-published-data">([\s\S]*?)<\/script>/);
const ed = JSON.parse(m[1]);
const spans = (o) => (Array.isArray(o && o.spans) ? o.spans : []);

function row(id, src) {
  return src.rows.find((r) => r.id === id);
}

const checks = [];
function ok(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  console.log((pass ? 'OK  ' : 'FAIL') + ' ' + name + (detail ? ' -- ' + detail : ''));
}

ok('paywall acquire->leave', spans(row('paywall', data))[0].from === 'acquire' && spans(row('paywall', data))[0].to === 'leave');
ok('emb paywall matches', spans(row('paywall', ed))[0].from === 'acquire');
ok('loyalty Clock Rewards', row('loyalty', data).sub === 'Clock Rewards');
ok('emb loyalty', row('loyalty', ed).sub === 'Clock Rewards');
ok('no Crowdtwist', !html.includes('Crowdtwist'));
ok('BI retain cell', !!(row('bi', data).cells || {}).retain);
ok('BI no leave span', spans(row('bi', data)).length === 0);
ok('identity attract->retain', spans(row('identity', data))[0].from === 'attract');
ok('stripe bill->retain', spans(row('stripe', data))[0].from === 'bill' && spans(row('stripe', data))[0].to === 'retain');
ok('CDP two bands', spans(row('cdp', data)).length === 2);
ok('shopfront bill->retain', spans(data.shopfrontTemplate)[0].from === 'bill');
ok('relatedIds present', html.includes('function relatedIds'));
ok('asset jump button', html.includes('data-goto="asset"'));
ok('bridge by layer', html.includes('BRIDGE_BY_LAYER'));
ok('platform Zuora rev = revenue only', /zuora-rev[\s\S]*?entities: \['revenue'\]/.test(html));

const failed = checks.filter((c) => !c.pass);
console.log('\n' + (checks.length - failed.length) + '/' + checks.length + ' passed');
process.exit(failed.length ? 1 : 0);
