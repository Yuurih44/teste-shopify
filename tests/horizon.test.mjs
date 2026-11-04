import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('Horizon integration rejects overlapping source and output folders', async () => {
  const { assembleHorizon } = await import('../scripts/integrate-horizon.mjs');
  const base = join(tmpdir(), 'vendors-overlap');
  await assert.rejects(assembleHorizon({ basePath: base, outputPath: join(base, 'output') }), /pastas diferentes/);
  await assert.rejects(assembleHorizon({ basePath: join(base, 'source'), outputPath: base }), /pastas diferentes/);
  await assert.rejects(assembleHorizon({ basePath: base, outputPath: process.cwd(), sourcePath: process.cwd() }), /pasta do projeto/);
  await assert.rejects(assembleHorizon({ basePath: base, outputPath: join(process.cwd(), '..'), sourcePath: process.cwd() }), /pasta do projeto/);
});

test('Horizon integration preserves native commerce templates and uses the vendor section on the home page', async () => {
  const { assembleHorizon } = await import('../scripts/integrate-horizon.mjs');
  const root = await mkdtemp(join(tmpdir(), 'vendors-horizon-test-'));
  const base = join(root, 'base');
  const output = join(root, 'output');
  try {
    for (const dir of ['layout', 'templates', 'sections', 'config', 'assets', 'blocks', 'snippets', 'locales']) await mkdir(join(base, dir), { recursive: true });
    for (const name of ['product', 'cart', 'collection']) await writeFile(join(base, 'templates', name + '.json'), JSON.stringify({ native: name }));
    await writeFile(join(base, 'layout/theme.liquid'), 'native Horizon layout');
    await writeFile(join(base, 'config/settings_schema.json'), JSON.stringify([{ name: 'theme_info', theme_name: 'Horizon' }]));
    await writeFile(join(base, 'config/settings_data.json'), JSON.stringify({ current: { page_width: 'narrow', preserved: true } }));
    await writeFile(join(base, 'sections/header-group.json'), JSON.stringify({ sections: { header: { type: 'header', settings: {}, blocks: { menu: { type: '_header-menu', settings: { menu: 'main-menu' } } } }, announce: { type: 'header-announcements', blocks: { a: { type: '_announcement', settings: { text: 'Welcome' } } } } }, order: ['announce', 'header'] }));
    await writeFile(join(base, 'sections/footer-group.json'), JSON.stringify({ sections: { footer: { type: 'footer', blocks: { social: { type: 'social-links', settings: { instagram_url: 'https://instagram.com/' } } } } }, order: ['footer'] }));
    await assembleHorizon({ basePath: base, outputPath: output, sourcePath: process.cwd() });
    for (const name of ['product', 'cart', 'collection']) assert.deepEqual(JSON.parse(await readFile(join(output, 'templates', name + '.json'))), { native: name });
    assert.equal(await readFile(join(output, 'layout/theme.liquid'), 'utf8'), 'native Horizon layout');
    const home = JSON.parse(await readFile(join(output, 'templates/index.json')));
    assert.equal(home.sections.vendors.type, 'ec-vendors-metaobject');
    assert.equal(home.sections.vendors.settings.heading_tag, 'h1');
    const header = JSON.parse(await readFile(join(output, 'sections/header-group.json')));
    assert.equal(header.sections.header.blocks.menu.settings.menu, 'menu-do-desafio');
    const settings = JSON.parse(await readFile(join(output, 'config/settings_data.json')));
    assert.equal(settings.current.preserved, true);
    assert.equal(settings.current.page_width, 'wide');
    assert.match(await readFile(join(output, 'sections/ec-vendors-metaobject.liquid'), 'utf8'), /data-vendor-card/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
