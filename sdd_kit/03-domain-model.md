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

### Vendedor (`DEC-022`)

| Campo | Tipo | Regra |
| --- | --- | --- |
| `codigo` | string | único, minúsculas, usado em `?v=` |
| `nome` | string | como enviado pela MK |
| `whatsapp` | string | número com DDI e DDD, só dígitos |
| `foto` | string opcional | `/img/vendedores/<codigo>.webp`; sem ela, a interface usa as iniciais |
| `ativo` | boolean | inativo não atribui (`RN-07`) e sai da fila (`RN-11`) |

Vendedores recebidos da MK, na ordem inicial da fila (Daniel é o primeiro, a pedido do
responsável). Sete números foram enviados com 8 dígitos depois do DDD 49; o responsável mandou
acrescentar o `9` logo depois do `49`. O número de Daniel já veio completo e é o mesmo
WhatsApp da empresa.

| `codigo` | `nome` | `whatsapp` |
| --- | --- | --- |
| `daniel` | Daniel Avila | `5549991100096` |
| `luiz` | Luiz Guide | `5549999234046` |
| `marcelo` | Marcelo | `5549985040318` |
| `marcelos` | Marcelos | `5549999468221` |
| `mauricio` | Mauricio | `5549984282320` |
| `silvio` | Silvio | `5549999019555` |
| `taine` | Taine Ribeiro | `5549991063669` |
| `vitor` | Vitor Mota | `5549999065664` |

`Marcelo` e `Marcelos` são duas pessoas. Regra dos nomes: nome e sobrenome quando houver, só o nome quando for um só (confirmado pela contratante). O nome de Luiz fica só "Luiz Guide", a pedido do responsável. Não se cria foto: o vínculo é pelo `codigo`.

### Orçamento do vendedor (`RN-13`)

| Campo | Tipo | Regra |
| --- | --- | --- |
| `vendedor` | código | Vendedor que gerou o orçamento |
| `cliente` | texto opcional | Nome para o documento |
| `itens` | lista | `{ slug, lado?, quantidade, preco?, desconto? }`; `desconto` é `{ tipo: 'valor' \| 'percentual', valor }` |
| `descontoTotal` | `{ tipo, valor }` opcional | Aplicado ao subtotal dos itens com preço |
| `observacao` | texto até 500 | Igual à lista (`RN-04`) |
| `id` | string | Identifica o orçamento no link e no painel |
| `validade` | data opcional | Prazo definido pelo vendedor em cada orçamento; passado o prazo, o link mostra que o orçamento expirou |
| `estado` | `ativo` \| `encerrado` \| `excluido` | Só orçamentos ativos aparecem na lista de trabalho do vendedor. Link de orçamento `excluido` (o vendedor pode excluir a qualquer momento) deixa de abrir o orçamento |
| `alteracoes` | lista | O que o cliente mudou pelo link: item, ação e data; some do aviso quando o vendedor marca como visto |

Preço, desconto, porcentagem exibida e total são calculados e validados por funções
puras testáveis. Item sem `preco` fica "sob consulta" e fora do total. O desconto
nunca deixa o preço negativo.

### Fila do rodízio (`RN-11`)

Lista ordenada de códigos de vendedores ativos, guardada em `localStorage` na
demonstração (`mk-fila-v1`). Quem atende vai para o fim.

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
geradas para os produtos reais do catálogo e os vendedores de `DEC-022`. É gerada uma
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
