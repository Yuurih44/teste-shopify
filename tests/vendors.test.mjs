import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import { render } from './helpers/render.mjs';

const vendor = (name, extras = {}) => ({
  name: { value: name }, role: { value: 'Consultor de vendas' },
  tier: { value: 'ouro' }, products: { value: [] }, ...extras,
});

test('renders five distinct vendors from the definition', async () => {
  const names = ['Ana Lima', 'Bruno Costa', 'Carla Souza', 'Diego Alves', 'Elisa Rocha'];
  const html = await render(names.map((name) => vendor(name)));
  assert.equal((html.match(/data-vendor-card/g) || []).length, 5);
  for (const name of names) assert.ok(html.includes(name));
});

test('zero entries render no cards, no broken images and no customer-facing setup instructions', async () => {
  const html = await render();
  assert.ok(!html.includes('data-vendor-card'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('Cadastre'));
  assert.ok(!html.includes('Liquid error'));
});

test('missing definition is safe', async () => {
  const html = await render([], {}, 'missing', false);
  assert.ok(!html.includes('data-vendor-card'));
  assert.ok(!html.includes('Liquid error'));
});

test('escapes merchant content in heading, subtitle, vendor name and role', async () => {
  const html = await render([vendor('<script>alert(1)</script>', { role: { value: '<b>cargo</b>' } })], {
    title: '<img src=x onerror=alert(1)>', subtitle: '<script>subtitle</script>',
  });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&lt;b&gt;cargo&lt;/b&gt;'));
});

test('missing optional fields preserve a usable card without broken image or product links', async () => {
  const html = await render([{ name: { value: 'Vendedor sem foto' } }]);
  assert.equal((html.match(/data-vendor-card/g) || []).length, 1);
  assert.ok(html.includes('Vendedor sem foto'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('href=""'));
});

test('renders product references as accessible links, including products without images', async () => {
  const html = await render([vendor('Ana', { products: { value: [
    { title: 'Camiseta & algodão', url: '/products/camiseta', featured_image: null },
  ] } })]);
  assert.ok(html.includes('href="/products/camiseta"'));
  assert.ok(html.includes('Camiseta &amp; algodão'));
});

test('independent settings and section identifiers produce independent styles', async () => {
  const first = await render([vendor('Ana')], { columns_desktop: 4, columns_mobile: '2', card_padding: 24 }, 'first');
  const second = await render([vendor('Bruno')], {}, 'second');
  assert.ok(first.includes('#ec-vendors-first'));
  assert.ok(!first.includes('#ec-vendors-second'));
  assert.match(first, /--ec-columns-desktop:\s*4/);
  assert.match(first, /--ec-columns-mobile:\s*2/);
  assert.match(first, /--ec-card-padding:\s*24px/);
  assert.match(second, /--ec-columns-desktop:\s*3/);
});

test('schema exposes required editor controls with a preset', async () => {
  const source = await readFile(new URL('../sections/ec-vendors-metaobject.liquid', import.meta.url), 'utf8');
  const schema = JSON.parse(source.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/)[1]);
  for (const id of ['title', 'subtitle', 'columns_desktop', 'columns_mobile', 'border_color', 'card_background', 'card_padding']) {
    assert.ok(schema.settings.some((setting) => setting.id === id), `missing ${id}`);
  }
  assert.ok(schema.presets.length > 0);
});

test('uses h2 when embedded and allows h1 for a standalone page', async () => {
  const embedded = await render();
  const standalone = await render([], { heading_tag: 'h1' });
  assert.match(embedded, /<h2 class="ec-vendors__title"/);
  assert.match(standalone, /<h1 class="ec-vendors__title"/);
});

test('optional product details show the title and formatted price without changing the product link', async () => {
  const entries = [vendor('Ana', { products: { value: [{ title: 'Camiseta & algodão', price: 8990, url: '/products/camiseta' }] } })];
  const html = await render(entries, { show_product_details: true });
  assert.match(html, /ec-vendors__products--detailed/);
  assert.match(html, /Camiseta &amp; algodão/);
  assert.match(html, /89,90/);
  assert.match(html, /Ver produto/);
  assert.match(html, /href="\/products\/camiseta"/);
  const compact = await render(entries, { show_product_details: false });
  assert.ok(!compact.includes('Ver produto'));
});
