import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('theme package uses portable forward slash paths accepted by Shopify', { skip: process.platform !== 'win32' }, () => {
  const fixture = mkdtempSync(join(tmpdir(), 'vendors-package-'));
  const theme = join(fixture, 'theme');
  const files = ['layout/theme.liquid', 'sections/ec-vendors-metaobject.liquid', 'templates/product.json', 'templates/cart.json', 'templates/collection.json', 'assets/theme.css', 'blocks/menu.liquid', 'snippets/icon.liquid', 'config/settings_data.json', 'locales/pt-BR.json', 'LICENSE.md'];
  let zip;
  try {
    for (const file of files) {
      mkdirSync(join(theme, file, '..'), { recursive: true });
      writeFileSync(join(theme, file), 'fixture');
    }
    const output = join(fixture, 'theme.zip');
    execFileSync('powershell', ['-NoProfile', '-File', 'scripts/package.ps1', '-ThemePath', theme + '/', '-OutputPath', output]);
    zip = readFileSync(output);
  } finally { rmSync(fixture, { recursive: true, force: true }); }
  const entries = [];
  for (let i = 0; i < zip.length - 46; i++) {
    if (zip.readUInt32LE(i) !== 0x02014b50) continue;
    const length = zip.readUInt16LE(i + 28);
    entries.push(zip.subarray(i + 46, i + 46 + length).toString('utf8'));
  }
  assert.ok(entries.includes('layout/theme.liquid'));
  assert.ok(entries.includes('sections/ec-vendors-metaobject.liquid'));
  for (const file of files) assert.ok(entries.includes(file), file);
  assert.ok(entries.every((path) => !path.includes('\\')));
  assert.ok(entries.every((path) => !path.startsWith('/') && !path.includes('..')));
});
