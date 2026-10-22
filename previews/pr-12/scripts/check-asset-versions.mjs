#!/usr/bin/env node
/**
 * Ensures every HTML page uses the same tokens/ekara ?v= as assets/js/prototype-routes.js
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const routesPath = join(root, 'assets/js/prototype-routes.js');
const routesSrc = readFileSync(routesPath, 'utf8');
const versionMatch = routesSrc.match(/const assetVersion = '(\d+)'/);
if (!versionMatch) {
  console.error('Could not read assetVersion from prototype-routes.js');
  process.exit(1);
}
const expected = versionMatch[1];

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === '.git' || name === 'playwright-report') continue;
      walkHtml(p, acc);
    } else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const htmlFiles = walkHtml(root);
const errors = [];

for (const file of htmlFiles) {
  const src = readFileSync(file, 'utf8');
  const tokens = src.match(/tokens\.css\?v=(\d+)/);
  const ekara = src.match(/ekara\.css\?v=(\d+)/);
  const rel = file.replace(root + '/', '');
  if (!tokens || tokens[1] !== expected) {
    errors.push(`${rel}: tokens.css?v= expected ${expected}, got ${tokens?.[1] ?? 'missing'}`);
  }
  if (!ekara || ekara[1] !== expected) {
    errors.push(`${rel}: ekara.css?v= expected ${expected}, got ${ekara?.[1] ?? 'missing'}`);
  }
}

if (errors.length) {
  console.error('Asset version mismatch:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`OK: ${htmlFiles.length} HTML files use tokens/ekara v=${expected}`);
