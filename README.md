# Desafio Shopify — Vendedores

Seção Liquid que exibe automaticamente os vendedores ativos do metaobjeto `store_vendor`. O layout segue o Figma do desafio, com grid responsivo, avatar, cargo, categoria e produtos vinculados.

## Preview

[Abrir demonstração](https://qqzw3m7vlyalcvor-100906303858.shopifypreview.com)

Senha de visitante da loja de desenvolvimento: `awwhop`.

O tema está em rascunho. O link foi gerado em 04/11/2026; links compartilhados da Shopify expiram após dois dias. Para renovar, abra o tema `desafio-vendedores` em **Loja virtual → Temas → Pré-visualizar** e copie o link da barra de preview. [Documentação](https://help.shopify.com/en/manual/online-store/themes/adding-themes).

## Instalação em um tema existente

1. Copie `sections/ec-vendors-metaobject.liquid` para a pasta `sections` do tema.
2. Configure a definição de metaobjeto descrita abaixo.
3. No editor do tema, abra o template desejado e adicione **Vendedores · Metaobjeto**.

A seção é independente do tema de demonstração. Não precisa de snippets, assets, bibliotecas ou JavaScript. Em templates JSON, pode ser adicionada pelo editor; em templates Liquid, use `{% section 'ec-vendors-metaobject' %}`.

## Metaobjeto

Em **Configurações → Metacampos e metaobjetos**, crie uma definição com nome **Vendedores** e tipo **`store_vendor`**.

| Campo | Chave | Tipo | Obrigatório |
| --- | --- | --- | --- |
| Nome | `name` | Texto de linha única | Sim |
| Cargo | `role` | Texto de linha única | Não |
| Foto | `photo` | Arquivo, restrito a imagens | Não |
| Categoria | `tier` | Texto de linha única: `ouro`, `prata` ou `bronze` | Não |
| Produtos vendidos | `products` | Lista de referências a produtos | Não |

Habilite **Estado ativo/rascunho** e **Acesso à API de frentes de loja online**. Cadastre as entradas em **Conteúdo → Metaobjetos → Vendedores** e deixe os vendedores publicados como **Ativo**.

Sem foto, aparece o avatar padrão. Cargo, categoria e produtos são opcionais. Categorias desconhecidas não exibem selo. Produtos devem estar disponíveis no canal Loja online para suas referências aparecerem na vitrine.

A demonstração contém seis vendedores com avatares próprios. Cada um vende um único produto, de uma categoria exclusiva:

| Vendedor | Produto |
| --- | --- |
| Marina Lopes | Camiseta de algodão premium |
| Rafael Mendes | Tênis casual urbano |
| Camila Torres | Mochila executiva |
| Lucas Ferreira | Relógio clássico |
| Beatriz Nogueira | Óculos de sol |
| Gustavo Almeida | Boné aba curva |

## Editor do tema

| Configuração | Opções |
| --- | --- |
| Título e subtítulo | Texto livre; podem ficar vazios |
| Tipo do metaobjeto | `store_vendor` por padrão |
| Colunas desktop | 1 a 4 |
| Colunas mobile | 1 ou 2 |
| Cores | Borda, fundo do card e fundo da seção |
| Padding do card | 0 a 48 px |
| Espaçamento vertical | 0 a 160 px |

O breakpoint mobile é 749 px. O padding é reduzido em telas pequenas, e os elementos internos se reorganizam em cards estreitos. As instâncias possuem estilos isolados por `section.id`.

## Dados e paginação

A leitura usa `shop.metaobjects[tipo].values`. Não há seleção manual de vendedores no schema. Com a capacidade de publicação habilitada, o próprio Shopify exclui os rascunhos.

A seção usa `paginate ... by 250`, evitando o limite de 50 entradas de um loop simples. Acima de 250, apresenta navegação para os demais registros, respeitando os limites da plataforma. [Referência Liquid](https://shopify.dev/docs/api/liquid/objects/metaobject_definition).

Com zero registros ou uma definição inexistente, não são exibidos cards. A orientação de cadastro aparece somente no Theme Editor.

## Desenvolvimento e validação

Requisitos: Node.js 20+ e Shopify CLI. O tema incluso é uma demonstração da seção, não um tema completo de comércio eletrônico.

```sh
npm install
npm test
npm run check
shopify theme dev --store sua-loja.myshopify.com
```

`npm test` executa os testes Liquid e, no Windows, também verifica os caminhos do ZIP. O renderer local adapta os tags exclusivos da Shopify e simula os filtros de imagem; os testes de integração complementam essa verificação na loja.

No Windows, `npm run package` gera `dist/desafio-vendedores.zip`, instalável em **Loja virtual → Temas → Importar**. Em outros sistemas, use `shopify theme package`.

Validação feita em 04/11/2026:

- 9 testes automatizados passaram; Theme Check sem erros ou avisos.
- Vitrine testada com zero registros e com seis vendedores ativos.
- Um sétimo vendedor em rascunho não apareceu na vitrine.
- Foto enviada ao metaobjeto e imagens dos produtos carregadas sem erros.
- Título, subtítulo, colunas, cores e padding alterados no editor e conferidos na vitrine.
- Testes de grid com nomes longos, padding máximo e várias instâncias da seção.
- Revisão de código concluída sem problemas bloqueantes.
- Preview acessado em uma sessão sem login administrativo, usando a senha de visitante.

Para inspecionar a matriz de layouts, execute `node scripts/render-browser-fixtures.mjs` e abra `dist/validation/responsive-matrix.html` no navegador. Ela combina as opções de colunas com nomes longos e padding de 48 px.

O Lighthouse 13.6.0 foi executado no preview real, com três medições mobile para cada cenário. A referência usa o mesmo tema, com o título e o subtítulo estáticos, sem consulta ao metaobjeto nem cards. O teste usa rede simulada de 1,6 Mbps, RTT de 150 ms e CPU 4× mais lenta; a senha de visitante foi autenticada antes da auditoria.

Os relatórios registram a rodada anterior de dados, com seis vendedores e 17 referências de produtos. Depois dessa medição, o catálogo foi organizado em seis produtos exclusivos, um por vendedor; o código da seção permaneceu igual.

| Métrica — mediana de 3 execuções | Com vendedores | Referência sem cards |
| --- | --- | --- |
| Performance | 75/100 | 76/100 |
| FCP | 1,563 s | 1,559 s |
| LCP | 1,563 s | 1,559 s |
| TBT | 1.239,5 ms | 1.165,5 ms |
| CLS | 0,00004 | 0,00004 |

Nesta amostra não apareceu regressão relevante na pontuação ou no LCP. O tempo de bloqueio permanece alto nos dois cenários; as tarefas mais longas foram atribuídas aos scripts da Shopify, como Web Pixels Manager, Shop JS e Performance Kit. Os testes foram feitos no preview, com seus scripts de desenvolvimento, e não representam métricas de campo de uma loja publicada.

Uma execução complementar com o preset desktop oficial obteve **96/100**, FCP/LCP de **467 ms**, TBT de **176 ms** e CLS **0**. Todas as sete execuções terminaram na vitrine, sem erros de auditoria ou avisos.

[Resumo das execuções](docs/evidence/lighthouse-summary.json) · [Relatório mobile com vendedores](docs/evidence/lighthouse-mobile.html) · [Relatório de referência](docs/evidence/lighthouse-baseline.html) · [Relatório desktop](docs/evidence/lighthouse-desktop.html)

As imagens usam dimensões reservadas, `srcset`, tamanhos reduzidos e lazy loading. A seção não adiciona scripts nem fontes externas. A navegação acima de 250 entradas não foi exercitada com dados reais nesta loja.

## Evidências

- [Desktop](docs/evidence/desktop.png)
- [Mobile](docs/evidence/mobile.png)
- [Zero registros](docs/evidence/zero-records.png)

O repositório contém o tema de demonstração, a seção independente, os testes e o script de empacotamento.
