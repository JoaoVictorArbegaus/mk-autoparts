# 03 — Modelo de domínio e dados do protótipo

No protótipo não há banco. Os dados ficam em arquivos TypeScript tipados em
`frontend/src/content/` (`DEC-005`), extraídos do PDF de produtos do cliente.

## Entidades

### Categoria

| Campo | Tipo | Regra |
| --- | --- | --- |
| `slug` | string | único, minúsculas e hífens |
| `nome` | string | obrigatório |
| `ordem` | number | ordem de exibição |

### Montadora

| Campo | Tipo | Regra |
| --- | --- | --- |
| `slug` | string | único |
| `nome` | string | ex.: Scania, Volvo, Mercedes-Benz |
| `modelos` | `Modelo[]` | `{ slug, nome }`, slug único dentro da montadora |

### Produto

| Campo | Tipo | Regra |
| --- | --- | --- |
| `slug` | string | único, usado na URL `/produto/<slug>` |
| `codigo` | string | código MK de peça sem lado, único; ausente em peça com `variantes` ou quando a fonte não informa (promoções) |
| `codigosOriginais` | string[] | códigos OEM/referência sem lado; opcional |
| `variantes` | `Variante[]` | opcional; `{ lado: 'LD' \| 'LE', codigo?, codigosOriginais? }` (`DEC-012`) |
| `artePromocao` | string | arte do cliente para o carrossel de promoções (`DEC-013`); opcional |
| `nome` | string | obrigatório |
| `descricao` | string | opcional |
| `categoria` | slug de `Categoria` | obrigatório, deve existir |
| `marca` | string | marca/fabricante da peça; opcional |
| `aplicacoes` | `Aplicacao[]` | `{ montadora, modelo?, anoInicio?, anoFim? }`; slugs devem existir |
| `promocao` | `{ preco, precoOriginal? }` | opcional; `RN-02A` |
| `imagem` | string | caminho em `/img/produtos/`; opcional, com imagem padrão |
| `destaque` | boolean | aparece em "Destaques" na landing |
| `ativo` | boolean | `RN-01` |
| `exemplo` | boolean | `true` só para dado fictício; exibe selo `[EXEMPLO]` |

Campos adicionais encontrados no PDF (ex.: unidade, NCM, peso, posição) só entram
depois de confirmados com o responsável humano.

`aplicacoes[].montadora` aceita também fabricantes de implemento (ex.: Randon); o
filtro na interface se chama "Marca do veículo".

Peça com lados tem `variantes` e cada lado tem o próprio código MK e os próprios
códigos originais, como no PDF. Peça sem lados não tem `variantes`.

### Item da lista de orçamento (navegador)

`{ slug, lado?, quantidade }` (lado obrigatório quando o produto tem variantes),
guardado em `localStorage` sob a chave
`mk-orcamento-v1`, junto com a observação opcional (`RN-04`). Nome, código e
imagem nunca são salvos; vêm dos dados atuais.

### Vendedor (fictício, `DEC-010`)

| Campo | Tipo | Regra |
| --- | --- | --- |
| `codigo` | string | único, minúsculas, usado em `?v=` |
| `nome` | string | nome de demonstração |
| `whatsapp` | string | na demonstração, sempre o número da empresa |
| `ativo` | boolean | inativo não atribui (`RN-07`) |

### Dados da simulação (navegador)

| Chave `localStorage` | Conteúdo |
| --- | --- |
| `mk-orcamento-v1` | itens `{ slug, quantidade }` e observação |
| `mk-vendedor-v1` | `{ codigo, desde }` do vendedor atribuído |
| `mk-visitante-v1` | `visitanteId` anônimo |
| `mk-eventos-v1` | lista de eventos (`RN-08`) |
| `mk-carrinhos-v1` | carrinhos `{ id, vendedor, estado, criadoEm, ultimaAtividade, finalizadoEm?, itens }` |

`sessaoId` fica em `sessionStorage`. Tudo é validado ao ler e descartado se inválido.

### Base fictícia do painel

`src/content/demo-metricas.ts` guarda contagens fixas por produto e vendedor
(visitas, cliques, adições, remoções, carrinhos finalizados e não finalizados),
geradas para os produtos reais do catálogo e os vendedores fictícios. É gerada uma
vez, versionada no código e marcada como fictícia.

## Validação dos dados

Uma verificação executada no build (ou teste unitário chamado pelo build) falha se:

- houver `slug` ou `codigo` duplicado, inclusive entre códigos de variantes;
- um produto tiver variantes repetidas para o mesmo lado;
- uma categoria, montadora ou modelo referenciado não existir;
- houver código de vendedor duplicado, ou a base do painel citar produto ou vendedor
  inexistente;
- `promocao.preco` não for maior que zero, ou `promocao.precoOriginal` existir e
  não for maior que `promocao.preco`;
- um arquivo de imagem referenciado não existir em `public/`.

## Dados atuais

Transcritos em `frontend/src/content/` a partir do PDF de 2025 e das artes de
promoção: 76 produtos, 7 categorias e 8 marcas de veículo. Correções, dúvidas e a
classificação adotada estão em `frontend/design/catalogo-revisao.md`
(`PEND-029`).

## Extração do PDF

- Fonte: `docs/produtos/CATALOGO MK AUTOPARTS 2025.pdf`. Os preços de promoção vêm
  das imagens recebidas em `docs/produtos/` (`PEND-016`).
- Fotos de produto extraídas ou fornecidas são otimizadas para WebP em
  `frontend/public/img/produtos/`; os materiais recebidos ficam em `docs/produtos/`.
- Dados ilegíveis ou ambíguos no PDF não são completados por inferência: viram
  pergunta ao responsável humano.
