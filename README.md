# Desafio Shopify

Seção de vendedores com layout responsivo e configurações pelo Theme Editor.

Decidi mudar um pouco o visual em relação ao Figma porque achei que ficaria mais bonito. Mantive também uma versão próxima do modelo original.

## Preview

- [Catálogo](https://ls0wk1ls7do9exys-100906303858.shopifypreview.com/pages/vendedores?view=vendors)
- [Modelo Figma](https://ls0wk1ls7do9exys-100906303858.shopifypreview.com/pages/vendedores?view=vendors-figma)

Senha: `awwhop`. Os links de preview têm validade limitada pela Shopify.

## Instalação

Copie `sections/ec-vendors-metaobject.liquid` para o tema e adicione a seção no Theme Editor. Os vendedores precisam estar cadastrados no Admin.

Para montar o tema completo, com Node.js 20+ e Shopify CLI autenticada:

```sh
npm ci
shopify theme pull --store SUA_LOJA --theme ID_HORIZON --path dist/horizon-base
npm run integrate -- --base dist/horizon-base
```

## Validação

`npm test` executa os testes. `npm run check` verifica o tema montado.

Testado com seis vendedores e sem registros. Relatórios e capturas estão em [docs/evidence](docs/evidence). O Horizon segue a [licença da Shopify](LICENSE-HORIZON.md).
