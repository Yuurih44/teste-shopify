import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const folders = ['assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const readJson = async (file) => JSON.parse((await readFile(file, 'utf8')).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const writeJson = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n');

export async function assembleHorizon({ basePath, outputPath, sourcePath = process.cwd(), menu = 'menu-do-desafio' }) {
  const base = resolve(basePath);
  const output = resolve(outputPath);
  const contains = (parent, child) => {
    const path = relative(parent, child);
    return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith('..' + sep));
  };
  if (contains(base, output) || contains(output, base)) throw new Error('Use pastas diferentes para o tema original e a integração.');
  if (contains(output, resolve(sourcePath))) throw new Error('O destino não pode sobrescrever a pasta do projeto.');
  const schema = await readJson(join(base, 'config/settings_schema.json'));
  if (!schema.some((group) => group.name === 'theme_info' && group.theme_name === 'Horizon')) throw new Error('O tema original precisa ser o Horizon.');
  for (const file of ['layout/theme.liquid', 'templates/product.json', 'templates/cart.json', 'templates/collection.json']) await access(join(base, file));
  await mkdir(output, { recursive: true });
  for (const folder of folders) await cp(join(base, folder), join(output, folder), { recursive: true });
  for (const file of ['sections/ec-vendors-metaobject.liquid', 'templates/index.json', 'templates/page.vendors.json']) await cp(join(sourcePath, file), join(output, file));
  await cp(join(sourcePath, 'LICENSE-HORIZON.md'), join(output, 'LICENSE.md'));

  const header = await readJson(join(output, 'sections/header-group.json'));
  for (const section of Object.values(header.sections)) {
    if (section.type === 'header') {
      section.settings = { ...section.settings, show_country: false, show_language: false };
      for (const block of Object.values(section.blocks || {})) if (block.type === '_header-menu') block.settings.menu = menu;
    }
    if (section.type === 'header-announcements') for (const block of Object.values(section.blocks || {})) if (block.type === '_announcement') block.settings.text = 'Uma equipe, seis especialidades.';
  }
  await writeJson(join(output, 'sections/header-group.json'), header);

  const footer = await readJson(join(output, 'sections/footer-group.json'));
  for (const section of Object.values(footer.sections)) {
    for (const [id, block] of Object.entries(section.blocks || {})) {
      if (block.type === 'email-signup') section.blocks[id] = { type: 'menu', settings: { menu, heading: 'Navegação' }, blocks: {} };
      if (block.type === 'social-links') {
        delete section.blocks[id];
        section.block_order = (section.block_order || []).filter((key) => key !== id);
      }
      for (const child of Object.values(block.blocks || {})) {
        if (child.type === 'text' && child.settings.text?.includes('Join our email list')) child.settings.text = '<h2>Uma equipe, seis especialidades.</h2>';
        if (child.type === 'text' && child.settings.text?.includes('Get exclusive deals')) child.settings.text = '<p>Camisetas, calçados, mochilas, relógios, óculos e bonés em um só lugar.</p>';
      }
    }
  }
  await writeJson(join(output, 'sections/footer-group.json'), footer);
  const cart = await readJson(join(output, 'templates/cart.json'));
  for (const section of Object.values(cart.sections || {})) {
    if (section.type === 'product-list' && section.settings?.collection === 'all') section.settings.collection = 'produtos';
  }
  await writeJson(join(output, 'templates/cart.json'), cart);
  const settings = await readJson(join(output, 'config/settings_data.json'));
  settings.current.page_width = 'wide';
  await writeJson(join(output, 'config/settings_data.json'), settings);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { base: { type: 'string' }, output: { type: 'string', default: 'dist/horizon' }, menu: { type: 'string', default: 'menu-do-desafio' } } });
  if (!values.base) throw new Error('Informe --base com a pasta do Horizon obtida pela Shopify CLI.');
  console.log(await assembleHorizon({ basePath: values.base, outputPath: values.output, menu: values.menu }));
}
