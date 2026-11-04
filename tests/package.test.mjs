import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('theme package uses portable forward slash paths accepted by Shopify', { skip: process.platform !== 'win32' }, () => {
  execFileSync('powershell', ['-NoProfile', '-File', 'scripts/package.ps1']);
  const zip = readFileSync('dist/desafio-vendedores.zip');
  const entries = [];
  for (let i = 0; i < zip.length - 46; i++) {
    if (zip.readUInt32LE(i) !== 0x02014b50) continue;
    const length = zip.readUInt16LE(i + 28);
    entries.push(zip.subarray(i + 46, i + 46 + length).toString('utf8'));
  }
  assert.ok(entries.includes('layout/theme.liquid'));
  assert.ok(entries.includes('sections/ec-vendors-metaobject.liquid'));
  assert.ok(entries.every((path) => !path.includes('\\')));
  assert.ok(entries.every((path) => !path.startsWith('/') && !path.includes('..')));
});
