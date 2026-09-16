#!/usr/bin/env node
/**
 * Regenerate STAGES, SHOPFRONT_STAGES, and VC_ROWS in the interactive HTML
 * from CSV files under outcome/InformationArch/data/.
 *
 * Edit value-chain-stages.csv, value-chain-rows.csv, value-chain-cells.csv
 * in Excel (or any editor), then run:
 *   node outcome/InformationArch/scripts/build-value-chain.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const htmlPath = path.join(root, 'fss-consumer-data-model-interactive.html');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (ch === '\r') {
      i++;
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c !== '')) rows.push(row);
  }
  const headers = rows.shift();
  return rows.map((cells) =>
    Object.fromEntries(headers.map((h, idx) => [h, cells[idx] ?? '']))
  );
}

function readCsv(name) {
  return parseCsv(fs.readFileSync(path.join(dataDir, name), 'utf8'));
}

function stageRange(stages, from, to) {
  const a = stages.findIndex((s) => s.stage_id === from);
  const b = stages.findIndex((s) => s.stage_id === to);
  if (a < 0 || b < 0) throw new Error(`Unknown stage range ${from} -> ${to}`);
  return stages.slice(Math.min(a, b), Math.max(a, b) + 1).map((s) => s.stage_id);
}

function cellObj(cap, obj, entityId) {
  const c = { cap, obj };
  if (entityId) c.e = entityId;
  else c.e = null;
  return c;
}

function buildShopfrontStages(cells, rowId) {
  const byStage = cells.filter((c) => c.row_id === rowId && c.cell_type === 'single');
  const stages = {};
  for (const c of byStage) {
    stages[c.stage_from] = cellObj(c.capability, c.objects, c.entity_id || null);
  }
  return stages;
}

function buildVcRows(stageRows, rowMeta, cells) {
  const stageIds = stageRows.map((s) => s.stage_id);
  const byRow = new Map();
  for (const c of cells) {
    if (!byRow.has(c.row_id)) byRow.set(c.row_id, []);
    byRow.get(c.row_id).push(c);
  }

  const shopfrontStages = buildShopfrontStages(cells, 'shopfront');
  const out = [];

  for (const meta of rowMeta) {
    const { row_id, label, sub } = meta;
    const rowCells = byRow.get(row_id) || [];
    const base = { id: row_id, label, sub };

    if (row_id === 'shopfront' || row_id === 'selfcare' || row_id === 'assisted') {
      if (row_id === 'shopfront') {
        out.push({ ...base, stages: 'SHOPFRONT_STAGES' });
      } else {
        out.push({ ...base, stages: 'SHOPFRONT_STAGES' });
      }
      continue;
    }

    const spans = rowCells.filter((c) => c.cell_type === 'span');
    if (spans.length === 1) {
      const s = spans[0];
      out.push({
        ...base,
        spanStages: stageRange(stageRows, s.stage_from, s.stage_to),
        cell: cellObj(s.capability, s.objects, s.entity_id || null),
      });
      continue;
    }
    if (spans.length > 1) throw new Error(`Row ${row_id}: multiple span cells not supported`);

    const singles = rowCells.filter((c) => c.cell_type === 'single');
    const stages = {};
    for (const stageId of stageIds) {
      const blocks = singles
        .filter((c) => c.stage_from === stageId)
        .sort((a, b) => Number(a.block_order) - Number(b.block_order));
      if (!blocks.length) continue;
      if (blocks.length === 1) {
        const b = blocks[0];
        stages[stageId] = cellObj(b.capability, b.objects, b.entity_id || null);
      } else {
        stages[stageId] = {
          multi: blocks.map((b) => cellObj(b.capability, b.objects, b.entity_id || null)),
        };
      }
    }
    out.push({ ...base, stages });
  }

  if (JSON.stringify(buildShopfrontStages(cells, 'shopfront')) !== JSON.stringify(shopfrontStages)) {
    throw new Error('shopfront stage build mismatch');
  }

  return { shopfrontStages, vcRows: out };
}

function jsString(s) {
  return JSON.stringify(s);
}

function emitStages(stageRows) {
  const lines = stageRows.map(
    (s) =>
      `    { id: ${jsString(s.stage_id)}, label: ${jsString(s.label)}, journey: ${jsString(s.journey)} }`
  );
  return `  const STAGES = [\n${lines.join(',\n')}\n  ];`;
}

function emitShopfrontStages(stages) {
  const lines = Object.entries(stages).map(([k, v]) => {
    const e = v.e == null ? 'null' : jsString(v.e);
    return `    ${k}: { cap: ${jsString(v.cap)}, obj: ${jsString(v.obj)}, e: ${e} }`;
  });
  return `  const SHOPFRONT_STAGES = {\n${lines.join(',\n')}\n  };`;
}

function emitCell(c, indent) {
  const e = c.e == null ? 'null' : jsString(c.e);
  return `${indent}{ cap: ${jsString(c.cap)}, obj: ${jsString(c.obj)}, e: ${e} }`;
}

function emitVcRows(vcRows) {
  const lines = vcRows.map((row) => {
    let body;
    if (row.stages === 'SHOPFRONT_STAGES') {
      body = 'stages: SHOPFRONT_STAGES';
    } else if (row.spanStages) {
      const span = row.spanStages.map((s) => jsString(s)).join(',');
      body = `spanStages: [${span}],\n      cell: ${emitCell(row.cell, '      ')}`;
    } else {
      const stageLines = Object.entries(row.stages).map(([stageId, val]) => {
        if (val.multi) {
          const blocks = val.multi.map((b) => emitCell(b, '        ')).join(',\n');
          return `      ${stageId}: { multi: [\n${blocks}\n      ]}`;
        }
        return `      ${stageId}: ${emitCell(val, '      ')}`;
      });
      body = `stages: {\n${stageLines.join(',\n')}\n    }`;
    }
    return `    { id: ${jsString(row.id)}, label: ${jsString(row.label)}, sub: ${jsString(row.sub)}, ${body} }`;
  });
  return `  const VC_ROWS = [\n${lines.join(',\n')}\n  ];`;
}

function main() {
  const stageRows = readCsv('value-chain-stages.csv');
  const rowMeta = readCsv('value-chain-rows.csv');
  const cells = readCsv('value-chain-cells.csv');

  const { shopfrontStages, vcRows } = buildVcRows(stageRows, rowMeta, cells);

  const generated = [
    '  /* BEGIN GENERATED VALUE CHAIN - edit CSV in data/ and run scripts/build-value-chain.mjs */',
    emitStages(stageRows),
    '',
    emitShopfrontStages(shopfrontStages),
    '',
    emitVcRows(vcRows),
    '  /* END GENERATED VALUE CHAIN */',
  ].join('\n');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const re = /  \/\* BEGIN GENERATED VALUE CHAIN[\s\S]*?  \/\* END GENERATED VALUE CHAIN \*\//;
  if (!re.test(html)) {
    throw new Error('Generated markers not found in HTML. Insert BEGIN/END GENERATED VALUE CHAIN block first.');
  }
  const next = html.replace(re, generated);
  fs.writeFileSync(htmlPath, next, 'utf8');
  console.log('Updated:', htmlPath);
  console.log('  stages:', stageRows.length);
  console.log('  rows:', rowMeta.length);
  console.log('  cells:', cells.length);
}

main();
