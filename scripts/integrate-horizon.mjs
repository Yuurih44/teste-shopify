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
  for (const file of ['sections/ec-vendors-metaobject.liquid', 'sections/ec-brand-intro.liquid', 'templates/index.json', 'templates/page.vendors.json', 'assets/ec-storefront.css', 'assets/ec-ponto-mark.svg']) await cp(join(sourcePath, file), join(output, file));
  await cp(join(sourcePath, 'LICENSE-HORIZON.md'), join(output, 'LICENSE.md'));
  const layoutFile = join(output, 'layout/theme.liquid');
  const layout = await readFile(layoutFile, 'utf8');
  if (!layout.includes('</head>')) throw new Error('O layout do Horizon precisa conter </head>.');
  const headAdditions = [];
  if (!layout.includes("'ec-storefront.css' | asset_url")) headAdditions.push("{{ 'ec-storefront.css' | asset_url | stylesheet_tag }}");
  if (!layout.includes("'ec-ponto-mark.svg' | asset_url")) headAdditions.push("{% if settings.favicon == blank %}<link rel=\"icon\" type=\"image/svg+xml\" href=\"{{ 'ec-ponto-mark.svg' | asset_url }}\">{% endif %}");
  await writeFile(layoutFile, headAdditions.length ? layout.replace('</head>', '  ' + headAdditions.join('\n    ') + '\n  </head>') : layout);
  const logoFile = join(output, 'blocks/_header-logo.liquid');
  const logo = await readFile(logoFile, 'utf8');
  const brandAssignment = "{% assign ec_brand_name = settings.ec_brand_name | default: shop.name %}\n";
  if (!logo.includes('assign ec_brand_name =')) await writeFile(logoFile, brandAssignment + "{% assign ec_brand_name_escaped = ec_brand_name | escape %}\n" + logo.replaceAll('text_fallback: shop.name', 'text_fallback: ec_brand_name_escaped').replaceAll('store_name: shop.name', 'store_name: ec_brand_name'));
  for (const file of ['blocks/footer-copyright.liquid', 'snippets/meta-tags.liquid']) {
    const source = await readFile(join(output, file), 'utf8');
    if (!source.includes('assign ec_brand_name =')) {
      let brandedSource = source.replaceAll('shop.name', 'ec_brand_name').replaceAll('{{ ec_brand_name }}', '{{ ec_brand_name | escape }}').replaceAll('{{ ec_brand_name | link_to:', '{{ ec_brand_name | escape | link_to:');
      if (file === 'snippets/meta-tags.liquid') brandedSource = "{% liquid\n  assign ec_page_title = page_title\n  if request.page_type == 'index'\n    assign ec_page_title = ec_brand_name\n  endif\n%}\n" + brandedSource.replaceAll('page_title', 'ec_page_title').replaceAll('{{ ec_page_title }}', '{{ ec_page_title | escape }}');
      await writeFile(join(output, file), brandAssignment + brandedSource);
    }
  }
  if (!schema.some(group => group.settings?.some(setting => setting.id === 'ec_brand_name'))) schema.push({ name: 'Identidade da loja', settings: [{ type: 'text', id: 'ec_brand_name', label: 'Nome da marca', default: 'Ponto' }] });
  await writeJson(join(output, 'config/settings_schema.json'), schema);

  const header = await readJson(join(output, 'sections/header-group.json'));
  for (const section of Object.values(header.sections)) {
    if (section.type === 'header') {
      section.settings = { ...section.settings, show_country: false, show_language: false };
      for (const block of Object.values(section.blocks || {})) if (block.type === '_header-menu') block.settings.menu = menu;
    }
    if (section.type === 'header-announcements') {
      section.disabled = true;
    }
  }
  await writeJson(join(output, 'sections/header-group.json'), header);

  const footer = await readJson(join(output, 'sections/footer-group.json'));
  for (const section of Object.values(footer.sections)) {
    section.settings = { ...section.settings, background_color: '#fafafa' };
    for (const [id, block] of Object.entries(section.blocks || {})) {
      if (block.type === 'footer-copyright') block.settings = { ...block.settings, show_powered_by: false };
      if (block.type === 'email-signup') section.blocks[id] = { type: 'menu', settings: { menu, heading: 'Navegação' }, blocks: {} };
      if (block.type === 'social-links') {
        delete section.blocks[id];
        section.block_order = (section.block_order || []).filter((key) => key !== id);
      }
      for (const child of Object.values(block.blocks || {})) {
        if (child.type === 'text' && ['Join our email list', 'Seu próximo achado', 'Uma boa escolha faz a diferença'].some(text => child.settings.text?.includes(text))) child.settings.text = '<h2>PONTO</h2>';
        if (child.type === 'text' && ['Get exclusive deals', 'Produtos para o dia a dia, escolhidos', 'Conheça nossos vendedores e descubra'].some(text => child.settings.text?.includes(text))) child.settings.text = '<p>Roupas, calçados e acessórios. Conheça os vendedores e os produtos disponíveis na loja.</p>';
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
  settings.current.ec_brand_name = 'Ponto';
  settings.current.color_palette = { ...settings.current.color_palette, background: '#ffffff', foreground: '#171717', color1: '#555555', color2: '#e4e4e4' };
  settings.current.type_body_font = 'inter_n4';
  settings.current.type_subheading_font = 'inter_n5';
  settings.current.type_heading_font = 'inter_n7';
  settings.current.type_accent_font = 'inter_n7';
  await writeJson(join(output, 'config/settings_data.json'), settings);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { base: { type: 'string' }, output: { type: 'string', default: 'dist/horizon' }, menu: { type: 'string', default: 'menu-do-desafio' } } });
  if (!values.base) throw new Error('Informe --base com a pasta do Horizon obtida pela Shopify CLI.');
  console.log(await assembleHorizon({ basePath: values.base, outputPath: values.output, menu: values.menu }));
}
