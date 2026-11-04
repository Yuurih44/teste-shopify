import { readFile } from 'node:fs/promises';
import { Liquid } from 'liquidjs';

const defaults = {
  metaobject_type: 'store_vendor', title: 'Desafio Shopify',
  subtitle: 'Seção para mostrar vendedores disponíveis de uma loja',
  columns_desktop: 3, columns_mobile: '1', border_color: '#ffcf00',
  card_background: '#fffcf7', section_background: '#f5f5f5',
  card_padding: 30, section_padding: 128,
};

export async function render(entries = [], settings = {}, id = 'vendors-test', defined = true, designMode = false) {
  const source = await readFile(new URL('../../sections/ec-vendors-metaobject.liquid', import.meta.url), 'utf8');
  const engine = new Liquid();
  engine.registerFilter('image_url', (image) => image?.url || '');
  engine.registerFilter('image_tag', (url) => `<img src="${url}" width="60" height="60" alt="">`);
  const template = source
    .replace(/{%[-]?\s*schema\s*[-]?%}[\s\S]*?{%[-]?\s*endschema\s*[-]?%}/g, '')
    .replace(/{%[-]?\s*paginate\s+[^%]+%}/g, '')
    .replace(/{%[-]?\s*endpaginate\s*[-]?%}/g, '');
  return engine.parseAndRender(template, {
    section: { id, settings: { ...defaults, ...settings } },
    shop: { metaobjects: defined ? { store_vendor: { values: entries, values_count: entries.length } } : {} },
    request: { design_mode: designMode }, paginate: { pages: 1 },
  });
}
