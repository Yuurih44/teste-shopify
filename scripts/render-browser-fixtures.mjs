import { mkdir, writeFile } from 'node:fs/promises';
import { render } from '../tests/helpers/render.mjs';

const entries = Array.from({ length: 5 }, (_, i) => ({
  name: { value: i === 0 ? 'UmNomeMuitoCompridoSemEspaçosParaValidarQuebraDeLinha' : `Vendedor ${i + 1}` },
  role: { value: 'Consultor de vendas e atendimento' },
  tier: { value: ['ouro', 'prata', 'bronze'][i % 3] },
  products: { value: Array.from({ length: 7 }, (_, j) => ({ title: `Produto ${j + 1}`, url: `/products/produto-${j + 1}` })) },
}));
const sections = [];
for (const desktop of [1, 2, 3, 4]) {
  for (const mobile of ['1', '2']) {
    sections.push(await render(entries, { columns_desktop: desktop, columns_mobile: mobile, card_padding: 48, section_padding: 0 }, `matrix-${desktop}-${mobile}`));
  }
}
await mkdir('dist/validation', { recursive: true });
const head = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial,sans-serif}</style><body>';
await writeFile('dist/validation/responsive-matrix.html', head + sections.join('\n') + '</body></html>');
console.log('Generated responsive layout matrix.');
