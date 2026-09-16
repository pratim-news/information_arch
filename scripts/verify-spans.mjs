import fs from 'fs';

const d = JSON.parse(fs.readFileSync('data/value-chain.json', 'utf8'));
const html = fs.readFileSync('fss-consumer-data-model-interactive.html', 'utf8');

const expect = {
  marketing: ['attract', 'leave'],
  paywall: ['attract', 'leave'],
  identity: ['attract', 'leave'],
  stripe: ['subscribe', 'leave'],
  cdp0: ['attract', 'subscribe'],
  cdp1: ['bill', 'retain'],
  shopfrontBill: ['bill', 'retain'],
  bi: ['attract', 'leave'],
};

function span(rowId, i = 0) {
  const r = d.rows.find((x) => x.id === rowId);
  const sp = (r.spans || [])[i] || (rowId === 'shopfront' ? d.shopfrontTemplate.spans[0] : null);
  return sp ? [sp.from, sp.to] : null;
}

const checks = [];
function ok(name, actual, want) {
  const pass = actual && actual[0] === want[0] && actual[1] === want[1];
  checks.push({ name, pass, actual, want });
  console.log((pass ? 'OK  ' : 'FAIL') + ' ' + name + ' ' + JSON.stringify(actual) + (pass ? '' : ' want ' + JSON.stringify(want)));
}

ok('Campaign Management', span('marketing'), expect.marketing);
ok('Marketing NBA band1', span('marketing', 1), expect.cdp0);
ok('Marketing NBA band2', span('marketing', 2), expect.cdp1);
ok('Paywall Entitlements', span('paywall'), expect.paywall);
ok('Identity Management', span('identity'), expect.identity);
ok('Stripe Payments', span('stripe'), expect.stripe);
ok('CDP band1', span('cdp', 0), expect.cdp0);
ok('CDP band2', span('cdp', 1), expect.cdp1);
ok('Shopfront Billing', span('shopfront'), expect.shopfrontBill);
ok('BI Analytics', span('bi'), expect.bi);
ok('Value Chain Attract', !!d.stages[0].valueChain, true);
ok('vc-span CSS', html.includes('.vc-cell.vc-span'), true);
ok('objHtml', html.includes('function objHtml'), true);
ok('Campaign still attract-leave', span('marketing')?.[0] === 'attract' && span('marketing')?.[1] === 'leave', true);

const failed = checks.filter((c) => !c.pass);
console.log('\n' + (checks.length - failed.length) + '/' + checks.length + ' passed');
process.exit(failed.length ? 1 : 0);
