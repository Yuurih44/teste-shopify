# Desafio Shopify — Vendedores

Seção Liquid que renderiza automaticamente os vendedores ativos do metaobjeto `store_vendor`, integrada a uma loja Horizon com cabeçalho, navegação, catálogo, páginas de produto, carrinho e rodapé. O grid segue o mock do desafio e pode ser reutilizado em outros temas e templates.

## Preview

[Abrir a loja de demonstração](https://ls0wk1ls7do9exys-100906303858.shopifypreview.com)

Senha de visitante: `awwhop`.

O preview usa o tema **Horizon em rascunho**, ID `195588358514`, na loja `desafio-teste.myshopify.com`. O tema publicado foi preservado. O link compartilhado foi gerado em 04/11/2026 e tem validade limitada pela Shopify; para renovar, abra o preview do Horizon e use **Copy link** na barra de pré-visualização.

O menu possui Início, Vendedores e Produtos. Os ícones dos cards abrem os respectivos produtos. Cada vendedor possui uma especialidade e um produto exclusivo.

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

## Configurações da seção

| Configuração | Opções |
| --- | --- |
| Título e subtítulo | Texto livre; podem ficar vazios |
| Nível do título | H2 ao incorporar; H1 para a página principal |
| Tipo do metaobjeto | `store_vendor` por padrão |
| Colunas desktop | 1 a 4 |
| Colunas mobile | 1 ou 2 |
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

O resultado fica em `dist/horizon`. O script preserva os componentes nativos de comércio, substitui a home pela seção de vendedores, configura o cabeçalho e o rodapé e direciona as sugestões do carrinho à coleção `produtos`. A largura global passa a ser ampla. Os arquivos do tema original não são alterados.

Prepare os recursos no Admin:

1. Uma coleção com handle `produtos`, contendo os seis produtos do desafio.
2. Uma página visível com handle `vendedores`.
3. Um menu com handle `menu-do-desafio`, com os links Início (`/`), Vendedores (`/pages/vendedores?view=vendors`) e Produtos (`/collections/produtos`).

O parâmetro `view=vendors` permite abrir o template alternativo do rascunho sem publicar o tema. Depois de publicar um tema que contenha esse template, a página também pode receber o modelo `vendors` no Admin e usar a URL sem o parâmetro. Para outro menu, passe `--menu HANDLE` ao script de integração.

No Windows, `npm run package` gera `dist/desafio-vendedores.zip` a partir do Horizon montado, incluindo assets, blocks, snippets, templates comerciais e a licença. Em outros sistemas, execute `shopify theme package --path dist/horizon` e preserve a licença junto da entrega. O código do Horizon segue [a licença fornecida pela Shopify](LICENSE-HORIZON.md); o tema completo montado não é versionado neste repositório público.

## Validação

- 12 testes automatizados: renderização Liquid com cinco vendedores, zero registros, definição ausente, campos opcionais, escape de conteúdo, links, instâncias independentes, schema, nível do título, preservação dos templates nativos e caminhos do ZIP.
- Theme Check da integração: zero erros. Os sete avisos também aparecem no Horizon original, sem novos avisos da seção.
- Seis vendedores ativos conferidos na vitrine; entradas em rascunho não renderizadas.
- Título, subtítulo, colunas, cores e padding verificados no Theme Editor.
- Desktop e mobile sem overflow horizontal; menu mobile e coleção de seis produtos funcionando.
- Fluxo vendedor → produto → adicionar ao carrinho validado. Quantidade alterada para dois itens com total de R$ 179,80; remoção retorna ao carrinho vazio.
- Revisão de código concluída; proteções de destino da integração e caminhos de ZIP verificadas por regressão.

Os testes locais usam LiquidJS e adaptam os tags exclusivos da Shopify. Eles complementam a validação no Admin e na vitrine. Para inspecionar combinações de grid com nomes longos e padding máximo, execute `node scripts/render-browser-fixtures.mjs` e abra `dist/validation/responsive-matrix.html`.

## Desempenho e evidências

Lighthouse 13.6.0 no preview real: três execuções mobile por cenário e uma desktop. A referência mantém o mesmo Horizon, CSS, título e subtítulo estáticos, sem consulta ao metaobjeto nem cards. A autenticação de visitante foi feita antes das auditorias, sem exportar cookies.

| Métrica — mediana de três execuções mobile | Com vendedores | Referência sem cards |
| --- | --- | --- |
| Performance | 90/100 | 83/100 |
| FCP | 1,123 s | 1,122 s |
| LCP | 1,123 s | 1,198 s |
| TBT | 415 ms | 684,5 ms |
| CLS | 0,00004 | 0,00004 |

O preset desktop oficial obteve 100/100, LCP de 285 ms e TBT de 0 ms. Não apareceu regressão relevante nesta amostra. A variação entre execuções impede atribuir a pontuação superior à seção. São medições de laboratório no preview de desenvolvimento, com os scripts da plataforma presentes, e não métricas de campo de uma loja publicada.

[Resumo das medições](docs/evidence/lighthouse-summary.json) · [Lighthouse mobile](docs/evidence/lighthouse-mobile.html) · [Referência sem cards](docs/evidence/lighthouse-baseline.html) · [Lighthouse desktop](docs/evidence/lighthouse-desktop.html)

[Desktop](docs/evidence/desktop.png) · [Mobile](docs/evidence/mobile.png) · [Zero registros](docs/evidence/zero-records.png)
