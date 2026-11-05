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
    await writeFile(join(base, 'layout/theme.liquid'), '<html><head>{{ content_for_header }}</head><body>{{ content_for_layout }}</body></html>');
    await writeFile(join(base, 'blocks/_header-logo.liquid'), 'text_fallback: shop.name');
    await writeFile(join(base, 'blocks/footer-copyright.liquid'), '{{ shop.name | link_to: routes.root_url }}');
    await writeFile(join(base, 'snippets/meta-tags.liquid'), '<title>{{ page_title }} {{ shop.name }}</title>');
    await writeFile(join(base, 'config/settings_schema.json'), JSON.stringify([{ name: 'theme_info', theme_name: 'Horizon' }]));
    await writeFile(join(base, 'config/settings_data.json'), JSON.stringify({ current: { page_width: 'narrow', preserved: true } }));
    await writeFile(join(base, 'sections/header-group.json'), JSON.stringify({ sections: { header: { type: 'header', settings: {}, blocks: { menu: { type: '_header-menu', settings: { menu: 'main-menu' } } } }, announce: { type: 'header-announcements', blocks: { a: { type: '_announcement', settings: { text: 'Welcome' } } } } }, order: ['announce', 'header'] }));
    await writeFile(join(base, 'sections/footer-group.json'), JSON.stringify({ sections: { footer: { type: 'footer', blocks: { social: { type: 'social-links', settings: { instagram_url: 'https://instagram.com/' } } } } }, order: ['footer'] }));
    await assembleHorizon({ basePath: base, outputPath: output, sourcePath: process.cwd() });
    for (const name of ['product', 'cart', 'collection']) assert.deepEqual(JSON.parse(await readFile(join(output, 'templates', name + '.json'))), { native: name });
    const layout = await readFile(join(output, 'layout/theme.liquid'), 'utf8');
    assert.match(layout, /ec-storefront.css/);
    assert.ok(layout.includes('{{ content_for_header }}'));
    assert.ok(layout.includes('{{ content_for_layout }}'));
    assert.match(await readFile(join(output, 'assets/ec-storefront.css'), 'utf8'), /header-logo/);
    const home = JSON.parse(await readFile(join(output, 'templates/index.json')));
    assert.equal(home.sections.vendors.type, 'ec-vendors-metaobject');
    assert.equal(home.sections.vendors.settings.heading_tag, 'h2');
    assert.equal(home.sections.vendors.settings.card_style, 'catalog');
    const vendorPage = JSON.parse(await readFile(join(output, 'templates/page.vendors.json')));
    assert.equal(vendorPage.sections.vendors.settings.card_style, 'catalog');
    assert.equal(vendorPage.sections.vendors.settings.show_product_details, true);
    const figmaPage = JSON.parse(await readFile(join(output, 'templates/page.vendors-figma.json')));
    assert.equal(figmaPage.sections.vendors.type, vendorPage.sections.vendors.type);
    assert.equal(figmaPage.sections.vendors.settings.card_style, 'figma');
    assert.equal(figmaPage.sections.vendors.settings.show_product_details, false);
    assert.equal(home.sections.intro.type, 'ec-brand-intro');
    assert.deepEqual(home.order, ['intro', 'vendors']);
    const header = JSON.parse(await readFile(join(output, 'sections/header-group.json')));
    assert.equal(header.sections.header.blocks.menu.settings.menu, 'menu-do-desafio');
    const settings = JSON.parse(await readFile(join(output, 'config/settings_data.json')));
    assert.equal(settings.current.preserved, true);
    assert.equal(settings.current.page_width, 'wide');
    assert.equal(settings.current.ec_brand_name, 'Ponto');
    const globalSchema = JSON.parse(await readFile(join(output, 'config/settings_schema.json')));
    assert.ok(globalSchema.some(group => group.settings?.some(setting => setting.id === 'ec_brand_name')));
    for (const file of ['blocks/_header-logo.liquid', 'blocks/footer-copyright.liquid', 'snippets/meta-tags.liquid']) assert.match(await readFile(join(output, file), 'utf8'), /ec_brand_name/);
    assert.match(await readFile(join(output, 'sections/ec-vendors-metaobject.liquid'), 'utf8'), /data-vendor-card/);
    const roundtrip = join(root, 'roundtrip');
    await assembleHorizon({ basePath: output, outputPath: roundtrip, sourcePath: process.cwd() });
    assert.equal(await readFile(join(roundtrip, 'layout/theme.liquid'), 'utf8'), layout);
    const roundtripSchema = JSON.parse(await readFile(join(roundtrip, 'config/settings_schema.json')));
    assert.equal(roundtripSchema.flatMap(group => group.settings || []).filter(setting => setting.id === 'ec_brand_name').length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});
