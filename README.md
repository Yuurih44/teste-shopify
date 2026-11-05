# Desafio Shopify — Vendedores

Seção Liquid que renderiza automaticamente os vendedores ativos do metaobjeto `store_vendor`, integrada à loja de demonstração **Ponto**, construída sobre o Horizon. Inclui abertura de marca, cabeçalho, navegação, catálogo, páginas de produto, carrinho e rodapé. O grid mantém as referências do mock e pode ser reutilizado em outros temas e templates.

## Identidade Ponto

A apresentação comercial segue a referência da [Insider](https://www.insiderstore.com.br/): navegação direta, fotos dos produtos, preços legíveis e botões de acesso às páginas. A marca própria Ponto permanece no cabeçalho, favicon, títulos e rodapé. A abertura exibe três produtos reais da coleção, sem elementos inclinados ou sobrepostos.

| Elemento | Definição |
| --- | --- |
| Texto e botões | `#171717` |
| Amarelo das bordas | `#e4ca79` |
| Fundo da loja | `#ffffff` |
| Fundo da apresentação | `#f3f3f3` |
| Tipografia | Inter, carregada pelo sistema de fontes do tema |

O nome da marca pode ser alterado em **Configurações do tema → Identidade da loja**. A seção **Ponto · Apresentação** permite editar título, descrição, coleção e links. Os textos do rodapé permanecem editáveis no Theme Editor. A faixa de anúncios está desativada.

## Preview

[Abrir a loja de demonstração](https://ls0wk1ls7do9exys-100906303858.shopifypreview.com)

Senha de visitante: `awwhop`.

O preview usa o tema **Horizon em rascunho**, ID `195588358514`, na loja `desafio-teste.myshopify.com`. O tema publicado foi preservado. O link compartilhado foi gerado em 04/11/2026 e tem validade limitada pela Shopify; para renovar, abra o preview do Horizon e use **Copy link** na barra de pré-visualização.

O menu possui Início, Vendedores e Produtos. Cada vendedor possui uma especialidade e um produto exclusivo. Os cards exibem foto, nome, preço e acesso à página do produto. A apresentação usa branco e preto, bordas amarelas discretas e conteúdo limitado a 1.200 px.

## Adaptação visual do Figma

A entrega usa o estilo **Catálogo** na home e na página de vendedores. A adaptação visual foi intencional:

> Mantivemos a estrutura de vendedores em grid e todas as configurações solicitadas. Fizemos ajustes na apresentação dos produtos, tipografia e espaçamentos para melhorar a leitura e a navegação, preservando o carregamento dinâmico via metaobjects.

O estilo **Referência Figma** permanece disponível no Theme Editor para consultar a composição original com produtos em miniatura. A tabela e as capturas abaixo registram essa conferência; a apresentação escolhida para o preview é a de catálogo.

[Abrir a apresentação do desafio](https://ls0wk1ls7do9exys-100906303858.shopifypreview.com/pages/vendedores?view=vendors).

| Elemento | Apresentação Figma em 1.728 px |
| --- | --- |
| Grid | Três colunas, duas linhas com os seis registros ativos |
| Cards | Aproximadamente 503 × 270 px |
| Intervalo entre cards | 34 px |
| Cantos e borda | Raio de 32 px; borda de 2 px, `#ffd324` |
| Fundo da seção / cards | `#f5f5f5` / `#fffcf6`, conferidos no PDF |
| Título / nome do vendedor | 48 px / 24 px |
| Avatar / categoria circular | 60 px / 50 px |

Nomes, cargos, categorias e miniaturas continuam vindo dos dados reais. A base de teste tem um produto por vendedor; o mock usa nomes e ícones repetidos. A conferência é de semelhança do layout, não de igualdade entre esses conteúdos. Em telas menores, os cards se reorganizam conforme as colunas configuradas.

[Referência exportada do PDF](docs/evidence/figma-reference.png) · [Captura comparativa no estilo Figma](docs/evidence/figma-preview.png) · [Comparação mobile](docs/evidence/figma-mobile.png) · [Medições do layout de referência](docs/evidence/figma-comparison.json)

## Instalar apenas a seção

1. Copie `sections/ec-vendors-metaobject.liquid` para a pasta `sections` do tema.
2. Crie a definição de metaobjeto descrita abaixo.
3. No Theme Editor, adicione **Vendedores · Metaobjeto** ao template desejado.

A seção não depende do Horizon, de snippets, assets ou JavaScript. Em templates Liquid, também pode ser incluída com `{% section 'ec-vendors-metaobject' %}`.

## Metaobjeto

Crie uma definição **Vendedores**, tipo **`store_vendor`**, com os campos:

| Campo | Chave | Tipo | Obrigatório |
| --- | --- | --- | --- |
| Nome | `name` | Texto de linha única | Sim |
| Cargo | `role` | Texto de linha única | Não |
| Foto | `photo` | Arquivo restrito a imagens | Não |
| Categoria | `tier` | Texto de linha única: `ouro`, `prata` ou `bronze` | Não |
| Produtos vendidos | `products` | Lista de referências a produtos | Não |

Habilite **Estado ativo/rascunho** e o acesso de leitura pela vitrine. Cadastre os vendedores em **Conteúdo → Metaobjetos** e deixe as entradas publicadas como **Ativo**. Os produtos referenciados devem estar disponíveis no canal Loja online.

Sem foto, aparece um avatar padrão. Campos opcionais vazios não geram imagens ou links quebrados. Categorias desconhecidas não exibem selo. Com zero registros, nenhum card é renderizado; a orientação de cadastro aparece somente no Theme Editor.

| Vendedor da demonstração | Produto |
| --- | --- |
| Marina Lopes | Camiseta de algodão premium |
| Rafael Mendes | Tênis casual urbano |
| Camila Torres | Mochila executiva |
| Lucas Ferreira | Relógio clássico |
| Beatriz Nogueira | Óculos de sol |
| Gustavo Almeida | Boné aba curva |

O arquivo [data/products.csv](data/products.csv) permite cadastrar os seis produtos em uma loja de desenvolvimento. Importe-o em **Produtos → Importar**, antes de vincular os produtos às entradas do metaobjeto. Ele contém os nomes, vendedores, preços e URLs das fotos. Os produtos da demonstração foram atualizados no catálogo da Shopify, mantendo seus IDs e referências.

As fotos são ilustrativas; nomes e preços pertencem aos dados fictícios da loja de desenvolvimento. Fontes: [camiseta](https://images.unsplash.com/photo-1521572163474-6864f9cf17ab), [tênis](https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb), [mochila](https://images.unsplash.com/photo-1553062407-98eeb64c6a62), [relógio](https://images.unsplash.com/photo-1523275335684-37898b6baf30), [óculos](https://images.unsplash.com/photo-1572635196237-14b3f281503f) e [boné](https://images.unsplash.com/photo-1588850561407-ed78c282e89b). Uso conforme a [licença Unsplash](https://unsplash.com/license).

## Configurações da seção

| Configuração | Opções |
| --- | --- |
| Título e subtítulo | Texto livre; podem ficar vazios |
| Nível do título | H2 ao incorporar; H1 para a página principal |
| Estilo dos cards | Referência Figma ou Catálogo |
| Tipo do metaobjeto | `store_vendor` por padrão |
| Colunas desktop | 1 a 4 |
| Colunas mobile | 1 ou 2 |
| Detalhes dos produtos | Nome, preço e link; opcional, ativado na demonstração |
| Fotos dos vendedores | Ativadas por padrão; desativadas, mostram iniciais no catálogo ou o avatar padrão no estilo Figma |
| Cores | Borda, fundo do card e fundo da seção |
| Padding do card | 0 a 48 px |
| Espaçamento vertical | 0 a 160 px |

O breakpoint mobile é 749 px. Cards estreitos reorganizam os elementos internos. Os estilos são isolados por `section.id`, permitindo várias instâncias com configurações diferentes.

A leitura usa `shop.metaobjects[tipo].values`, sem seleção manual de vendedores no schema. Com a capacidade de publicação habilitada, a Shopify exclui os rascunhos. A seção usa paginação de 250 registros e apresenta navegação quando houver mais páginas, respeitando os limites da plataforma. O cenário acima de 250 registros não foi exercitado com dados reais nesta loja.

## Montar a loja Horizon

Requisitos: Node.js 20+, Shopify CLI autenticada e um Horizon instalado na loja. O repositório contém o código próprio e o script de integração. A fonte do Horizon é obtida da instalação da loja e permanece fora do Git.

```sh
npm ci
npm test
shopify theme pull --store sua-loja.myshopify.com --theme ID_DO_HORIZON --path dist/horizon-base
npm run integrate -- --base dist/horizon-base
npm run check
shopify theme push --store sua-loja.myshopify.com --theme ID_DO_RASCUNHO --path dist/horizon --nodelete
```

O resultado fica em `dist/horizon`. O script preserva os componentes nativos de comércio, monta a home com apresentação e vendedores, configura o cabeçalho e o rodapé e direciona as sugestões do carrinho à coleção `produtos`. Na cópia montada, adiciona os assets da marca ao layout e usa o nome configurável no logo, copyright e metadados. Os arquivos do tema original não são alterados. A montagem pode ser repetida sobre uma cópia já integrada sem duplicar o stylesheet ou os controles da marca.

Prepare os recursos no Admin:

1. Uma coleção com handle `produtos`, contendo os seis produtos do desafio.
2. Uma página visível com handle `vendedores`.
3. Um menu com handle `menu-do-desafio`, com os links Início (`/`), Vendedores (`/pages/vendedores?view=vendors`) e Produtos (`/collections/produtos`).

O parâmetro `view=vendors` permite abrir o template alternativo do rascunho sem publicar o tema. Depois de publicar um tema que contenha esse template, a página também pode receber o modelo `vendors` no Admin e usar a URL sem o parâmetro. Para outro menu, passe `--menu HANDLE` ao script de integração.

No Windows, `npm run package` gera `dist/desafio-vendedores.zip` a partir do Horizon montado, incluindo assets, blocks, snippets, templates comerciais e a licença. Em outros sistemas, execute `shopify theme package --path dist/horizon` e preserve a licença junto da entrega. O código do Horizon segue [a licença fornecida pela Shopify](LICENSE-HORIZON.md); o tema completo montado não é versionado neste repositório público.

## Validação

- 16 testes automatizados: renderização Liquid com cinco vendedores, zero registros, definição ausente, campos opcionais, escape de conteúdo, links, instâncias independentes, schema, nível do título, detalhes e preço dos produtos, controle de fotos/iniciais, apresentação sem coleção, preservação dos templates nativos, montagem repetida e caminhos do ZIP.
- Theme Check da integração: zero erros. Os sete avisos também aparecem no Horizon original, sem novos avisos da seção.
- Seis vendedores ativos conferidos na vitrine; entradas em rascunho não renderizadas.
- Título, subtítulo, colunas, cores e padding verificados no Theme Editor.
- Desktop e mobile sem overflow horizontal; menu mobile e coleção de seis produtos funcionando.
- Fluxo vendedor → produto → adicionar ao carrinho validado. Quantidade alterada para dois itens com total de R$ 179,80; remoção retorna ao carrinho vazio.
- Revisão de código concluída; proteções de destino da integração e caminhos de ZIP verificadas por regressão.

Os testes locais usam LiquidJS e adaptam os tags exclusivos da Shopify. Eles complementam a validação no Admin e na vitrine. Para inspecionar combinações de grid com nomes longos e padding máximo, execute `node scripts/render-browser-fixtures.mjs` e abra `dist/validation/responsive-matrix.html`.

## Desempenho e evidências

Medição da versão atual em 05/11/2026, com as fotos reais e Lighthouse 13.6.0. Foram feitas três execuções mobile com vendedores, três com a referência sem cards e uma desktop com vendedores. Todos os relatórios terminaram na vitrine, sem erros de execução ou avisos.

| Métrica | Mobile com vendedores — mediana | Mobile sem cards — mediana | Desktop com vendedores |
| --- | --- | --- | --- |
| Performance | 69/100 | 66/100 | 93/100 |
| FCP | 1,107 s | 1,114 s | 0,290 s |
| LCP | 1,200 s | 2,213 s | 0,547 s |
| TBT | 2.812,5 ms | 4.751 ms | 201 ms |
| CLS | 0,000056 | 0,000056 | 0,000327 |
| Transferido | 1,53 MB | 1,35 MB | 1,47 MB |

As pontuações mobile foram **69, 70 e 67** com vendedores e **65, 66 e 67** na referência. Não apareceu regressão relevante nesta amostra; a pontuação superior não deve ser interpretada como ganho causado pela seção. O TBT permanece alto nos dois cenários. Entre os custos de script identificados estão Web Pixels Manager, Shop JS e Performance Kit, presentes nas duas apresentações. A seção não adiciona JavaScript.

A referência manteve o mesmo tema, cabeçalho, rodapé, hero com fotos, CSS e título/subtítulo da seção. Apenas a consulta ao metaobjeto e o bloco dos cards foram removidos temporariamente. O original foi restaurado e os seis vendedores foram conferidos após a coleta.

Antes de cada execução, o cache HTTP, CacheStorage e service workers foram limpos. Os cookies foram preservados para manter a autenticação de visitante; nenhum valor de cookie foi exportado. As execuções mobile usam rede simulada de aproximadamente 1,6 Mbps, RTT de 150 ms e CPU 4× mais lenta. O desktop usa o preset oficial. Os cenários foram executados em sequência e têm variação de TBT; são dados de laboratório em preview, não métricas de campo de uma loja publicada. Não foi medida uma referência desktop.

[Resumo das sete execuções e configurações](docs/evidence/lighthouse-summary.json) · [Lighthouse mobile](docs/evidence/lighthouse-mobile.html) · [Referência sem cards](docs/evidence/lighthouse-baseline.html) · [Lighthouse desktop](docs/evidence/lighthouse-desktop.html)

[Desktop](docs/evidence/desktop.png) · [Mobile](docs/evidence/mobile.png) · [Zero registros](docs/evidence/zero-records.png)
