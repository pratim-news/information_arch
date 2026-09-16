import fs from 'node:fs';

const p = new URL('../fss-consumer-ia-data-2-steerco-pack.html', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

const dupStart = s.indexOf('<!-- 11 DATA MASTERING -->');
const dupEnd = s.indexOf('<!-- 12 DATA IN MOTION -->');
if (dupStart < 0 || dupEnd < 0) throw new Error('duplicate mastering block not found');

let mastering = s.slice(dupStart, dupEnd);
mastering = mastering
  .replace('<!-- 11 DATA MASTERING -->', '<!-- IA DATA MASTERING -->')
  .replace('<span class="n">04</span>Data Architecture', '<span class="n">03</span>Information Architecture')
  .replace('Data at rest - mastering', 'One master per domain')
  .replace(
    '<h2>One master per data domain</h2>',
    '<h2>Data Model 2.0 - one master per data domain</h2>\n      <p class="sub" style="margin-bottom:8px">Outcome 2: re-imagined IA - each entity has a single system of record; governed copies only.</p>'
  )
  .replace('04 | Data Architecture', '03 | Information Architecture');

const brokenStart = s.indexOf('<!-- IA DATA MASTERING (Outcome 2) -->');
const subjectStart = s.indexOf('<!-- 10 IA SUBJECT AREAS -->');
if (brokenStart < 0 || subjectStart < 0) throw new Error('broken or subject block not found');

const brokenBlock = s.slice(brokenStart, subjectStart);
const vcSvgMatch = brokenBlock.match(/<svg viewBox="0 0 1000 402"[\s\S]*?<\/svg>/);
if (!vcSvgMatch) throw new Error('value chain svg not found in broken block');

const valueChain = `  <!-- IA VALUE CHAIN -->
  <section class="slide" data-title="Value chain">
    <div class="slide-hdr"><span class="sec-pill"><span class="n">03</span>Information Architecture</span><span class="hdr-right">Future-state value chain</span></div>
    <div class="slide-body">
      <h2>Consumer value chain to target capability and data</h2>
      <div class="diagram">
        ${vcSvgMatch[0]}
      </div>
    </div>
    <div class="slide-ftr"><span>03 | Information Architecture</span><span>Future Subs Stack | Consumer Data 2.0</span></div>
  </section>

`;

s = s.slice(0, brokenStart) + mastering + '\n' + valueChain + s.slice(subjectStart);

const dup2Start = s.indexOf('<!-- 11 DATA MASTERING -->');
if (dup2Start >= 0) {
  const dup2End = s.indexOf('<!-- 12 DATA IN MOTION -->', dup2Start);
  s = s.slice(0, dup2Start) + s.slice(dup2End);
}

fs.writeFileSync(p, s, 'utf8');
console.log('fixed IA section order');
