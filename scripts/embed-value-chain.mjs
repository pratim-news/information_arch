#!/usr/bin/env node
/** Embed data/value-chain.json into HTML fallback script tag. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'data', 'value-chain.json');
const htmlPath = path.join(root, 'fss-consumer-data-model-interactive.html');

const json = fs.readFileSync(jsonPath, 'utf8');
JSON.parse(json);

let html = fs.readFileSync(htmlPath, 'utf8');
const re = /(<script type="application\/json" id="vc-published-data">)([\s\S]*?)(<\/script>)/;
if (!re.test(html)) throw new Error('vc-published-data script tag not found');
html = html.replace(re, `$1\n${json}$3`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Embedded value-chain.json into HTML fallback');
