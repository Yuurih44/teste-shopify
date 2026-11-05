import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Liquid } from 'liquidjs';

async function renderIntro(products = [], settings = {}) {
  const source = await readFile(new URL('../sections/ec-brand-intro.liquid', import.meta.url), 'utf8');
  const engine = new Liquid();
  engine.registerFilter('image_url', image => image.url);
  engine.registerFilter('image_tag', url => `<img src="${url}" alt="">`);
  engine.registerFilter('money', value => `R$ ${(value / 100).toFixed(2)}`);
  return engine.parseAndRender(source.replace(/{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}/, ''), {
    section: { id: 'brand-intro', settings: { collection: 'produtos', title: 'Seu estilo tem um ponto de partida.', description: 'Escolhas para o dia a dia.', primary_label: 'Conhecer a equipe', primary_url: '/pages/vendedores?view=vendors', ...settings } },
    collections: { produtos: { products } },
  });
}

test('brand introduction remains useful without a collection or product images', async () => {
  const html = await renderIntro();
  assert.ok(html.includes('Seu estilo tem um ponto de partida.'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('href=""'));
  assert.ok(html.includes('/pages/vendedores?view=vendors'));
});

test('brand introduction links to real products and escapes merchant content', async () => {
  const html = await renderIntro([{ title: 'Boné & algodão', price: 6990, url: '/products/bone', featured_image: { url: '/hat.png' } }], { title: '<script>test</script>' });
  assert.ok(html.includes('href="/products/bone"'));
  assert.ok(html.includes('Boné &amp; algodão'));
  assert.ok(html.includes('R$ 69.90'));
  assert.ok(!html.includes('<script>'));
});
