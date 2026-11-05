# Direção visual — MK Autoparts (contrato)

Contrato das Etapas 2 a 4 do agente `gerador-landing`. Vale para todas as rotas
(landing, catálogo, detalhe, lista de orçamento, painel e 404). Mudanças de direção
reescrevem este arquivo inteiro.

## Direção escolhida

**Opção A — "Cromado na pista"**, aprovada pelo responsável humano sem ajustes. A
landing é a prancha da marca em movimento: azul-marinho, cromado só no logo e numa
palavra do título, linhas de velocidade a 12° e aurora azul. O catálogo é a loja
clara e organizada das referências, costurada à landing pelo mesmo cabeçalho
marinho, pela mesma tipografia e pelo filete a 12°.

Duas velocidades de interface: a **landing é viva** (fundo animado em toda seção,
emendas em corte inclinado, entradas, contadores, carrosséis); **catálogo, detalhe, lista e
painel são telas de trabalho**: sem fundo animado atrás de grade, tabela ou
formulário; o movimento responde à ação (adicionar, filtrar, abrir painel).

## Paleta

| Token | Hex | Papel |
| --- | --- | --- |
| `--navy` | `#0B1A36` | fundo das seções escuras, cabeçalho, texto em claro |
| `--navy-2` | `#13254A` | degradê e superfícies elevadas no escuro |
| `--navy-3` | `#081329` | faixa de montadoras e rodapé |
| `--royal` | `#1C4FD0` | botão primário, links em fundo claro, foco em claro |
| `--vivid` | `#3D7EFF` | links e destaques no escuro; ícones, barras e filetes (não texto) no claro |
| `--silver` | `#D9DEE5` | texto secundário forte no escuro, bordas no claro |
| `--paper` | `#F3F5F8` | fundo das seções claras e do catálogo |
| `--white` | `#FFFFFF` | cards, placas das fotos, texto no escuro |
| `--ink-2` | `#5B6678` | texto secundário em claro |
| `--muted-dark` | `#9AA6B8` | texto secundário em escuro |
| `--promo-red` | `#C81E2A` | **só promoção**: faixa e selo "Promoção" |
| `--promo-yellow` | `#FFC531` | **só promoção**: preço sobre marinho |
| `--chrome` | gradiente da marca | **só tela**: logo e uma palavra do h1 |

Vermelho e amarelo vêm das artes de promoção do cliente e foram aprovados apenas
para promoções; nunca são cor de botão, link ou navegação.

Gráficos do painel (skill `dataviz`, validado com `validate_palette.js` em modo
claro): série 1 `#1C4FD0`, série 2 `#EB6834` (CVD ΔE 29,6; contraste ≥ 3:1). O
laranja existe só nos gráficos do `/painel`.

### Pares de contraste verificados (WCAG AA)

| Par | Razão | Uso |
| --- | --- | --- |
| branco / `#0B1A36` | 17,28 | texto no escuro |
| `#D9DEE5` / `#0B1A36` | 12,78 | texto no escuro |
| `#9AA6B8` / `#0B1A36` | 7,01 | texto secundário no escuro |
| `#3D7EFF` / `#0B1A36` | 4,63 | links no escuro (texto normal) |
| `#3D7EFF` / `#13254A` | 4,04 | só texto ≥ 24 px ou não texto |
| `#3D7EFF` / branco | 3,73 | **nunca texto**; só ícone, borda, barra |
| branco / `#1C4FD0` | 6,82 | botão primário |
| `#1C4FD0` / `#F3F5F8` | 6,25 | links no claro |
| `#0B1A36` / `#F3F5F8` | 15,82 | texto no claro |
| `#5B6678` / branco | 5,81 | texto secundário no claro |
| `#FFC531` / `#0B1A36` | 10,93 | preço de promoção |
| branco / `#C81E2A` | 5,71 | selo "Promoção" |

## Tipografia

- **Saira** (Google Fonts, variável: `wdth` 100–125, `wght` 500–800, com itálico)
  nos títulos, botões e números de destaque: largura ~118, itálico, peso 700–800,
  ecoando o AUTOPARTS estendido do lettering.
- **IBM Plex Sans** (400, 500, 600) no texto, filtros, tabelas e formulários;
  `font-variant-numeric: tabular-nums` em códigos (S07-096), quantidades e preços.
- Escala: h1 `clamp(2.25rem, 1.35rem + 3.4vw, 4rem)` (≤ 64 px); h2
  `clamp(1.75rem, 1.2rem + 2vw, 2.75rem)`; h3 `clamp(1.125rem, 1rem + .5vw, 1.375rem)`;
  texto 16–18 px, entrelinha 1.55; legendas 14 px. Campo de busca ≥ 16 px.
- Carregamento: `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com`,
  uma folha com as duas famílias e `display=swap`.

## Estilo

- **Superfícies.** Landing em ritmo fixo **escuro / claro** (A/B): hero marinho →
  montadoras marinho-3 (faixa) → categorias claro → promoções marinho → sobre claro
  → clientes marinho → loja claro → rodapé marinho-3. Escuro com profundidade
  (degradê `--navy` → `--navy-2`, manchas de luz `--vivid` a 8–14 %).
- **Vidro escuro** (tinta marinho 55–65 %, `blur(16px) saturate(140%)`, borda prata
  12 %) em no máximo 2 elementos por tela, sempre sobre aurora, linhas ou foto:
  cabeçalho ao rolar na landing, botão secundário do hero, controles do carrossel.
  Com `prefers-reduced-transparency`, mantém o desfoque e adensa a tinta (80 %).
  Fallback `@supports not (backdrop-filter)`: marinho 94 %.
- **Itálico de 12°** como geometria: filete `--vivid` de 2 px inclinado antes de
  cada h2, faixa "Promoção" inclinada, cortes das emendas e linhas de velocidade.
- **Cromado** só no logo e numa palavra do h1 (reflexo em CSS).
- **Sombras**: só em cards elevados no hover, no painel lateral e no menu;
  cantos de 14 px nos cards, 999 px nos botões (pílula).
- **Catálogo**: fundo `--paper`, cards brancos, cabeçalho marinho com o mesmo
  degradê estático da aurora; sem fundo animado.

## Movimento

| Onde | O quê | Como |
| --- | --- | --- |
| Hero | foto do caminhão ao fundo com leve recuo de entrada (transform), linhas de velocidade a 12° discretas (canvas 2D, ~24 qps), reflexo cromado no h1, palavras do h1 subindo | CSS e canvas próprio (sem Motion, para o LCP) |
| Montadoras | marquee lento dos nomes, pausável (botão, hover e foco) | CSS; parado e quebrado em linhas com movimento reduzido |
| Categorias | campo de pontos respirando (DotField) | canvas 2D, 12 passos/s |
| Promoções | aurora azul vinda de baixo (Aurora em WebGL2, sem mouse) | WebGL, meia resolução, fallback CSS |
| Sobre | curvas de nível (Topo) em azul claro | canvas 2D |
| Clientes | linhas de velocidade em baixa opacidade | canvas 2D |
| Loja | aurora suave de cima | WebGL |
| Emendas | corte inclinado subindo para a direita (eco do itálico de 12°), pintado com a cor da seção seguinte, filete azul vivo de 3 px na borda e um brilho que percorre o filete a cada 7 s (sem brilho com movimento reduzido). A onda foi descartada: remetia a limpeza, não à marca | CSS (`clip-path` e `background-position`) |
| Entradas | títulos palavra por palavra (`SplitTitle`), blocos em sequência (`Reveal`, 70 ms), contadores reais (`CountUp`) | Motion `m.*` |
| Cards | tilt leve nos cartões de categoria (só ponteiro fino); elevação no hover dos cards de produto | CSS |
| Lista | contador do cabeçalho pulsa ao adicionar; painel desliza da direita | CSS + Motion |
| Botões | reflexo varrendo no hover; troca de texto só em "Adicionado" | CSS |

Ritmo: entrada 420–600 ms, saída 260 ms, curva `cubic-bezier(.16, 1, .3, 1)`.
Todo fundo pausa fora da tela e com a aba oculta, DPR ≤ 1,5, sem reação ao mouse,
sem `loseContext`; sem GPU (WebGL em software) fica o fallback CSS. Com movimento
reduzido: um quadro parado, conteúdo todo visível, sem Lenis, marquee parado.

Lenis: `<ReactLenis root options={{ lerp: 0.085, anchors: { offset: -88 } }} />`,
desligado com movimento reduzido. O offset desconta o cabeçalho fixo (72 px) com
folga.

## Tratamento das fotos

| Material | Onde | Tamanho máximo |
| --- | --- | --- |
| Fotos de produto (recortes do PDF, ~405×268) | cards e detalhe, sempre sobre placa branca | `object-fit: scale-down` (nunca ampliam); 360 px no detalhe; sem zoom |
| Recortes das promoções (fundo escuro) | cards e detalhe, sobre placa marinho | idem |
| Foto do caminhão (`originais/fotos/933354b5…png`, 1672×941) | fundo do hero, véu marinho à esquerda (desktop) e por cima (celular) | JPEG 800/1280/1672 em `public/img/hero/` |
| Artes de promoção (1024×1536) | seção Promoções (grade de 3 no desktop, trilho no celular) | ~300 px de largura |
| Fachada (878×877, recortada) | "Loja e contato" | 440 px |
| Estoque (807×880 e 840×866, recortadas) | "Sobre", lado a lado em retrato 4:5, escalonadas, com legenda | ~400 px |
| `image3.png` (arte com texto) | não usada | — |

Recortes obrigatórios (originais intactos em `design/originais/`): interface do
Instagram (pontos do carrossel, seta) e placas de veículos legíveis (corte ou
desfoque). Nenhum logo de terceiros no site (montadoras e fornecedores em texto);
as artes de promoção do cliente aparecem como estão (`DEC-013`). Todas as imagens
em WebP em `public/img/`.

## Estrutura

### Landing (`/`)

1. **Hero** (marinho): h1 "Peças e acessórios para caminhões" (lema do selo),
   apoio, busca grande (leva a `/catalogo?q=`), "Ver catálogo" e "Falar no
   WhatsApp", sobre a foto do caminhão na estrada (sem as artes de promoção). No
   desktop a foto começa depois da coluna do texto (borda esmaecida no marinho e
   sombra radial atrás do texto); no celular o caminhão fica à direita, sob um véu
   mais forte. A mesma foto, mais apagada, fica no topo do catálogo.
2. **Montadoras** (faixa marinho-3): nomes das 8 marcas de veículo com o número
   real de peças, em marquee pausável; cada uma abre o catálogo filtrado.
3. **Categorias** (claro): 6 cartões marinho em 3 colunas (referência: cartões
   de "peça em destaque"). Todos usam a mesma foto de estúdio de um caminhão sem
   marca (`originais/categorias/base.png`); cada cartão aproxima a região da sua
   categoria e acende as peças em azul vivo com brilho (SVG sobre a foto; motor em
   efeito raio-X). Abaixo: número, contagem real de peças e nome em itálico
   maiúsculo com filete a 12°. Em teste: os destaques desenhados podem ser
   trocados por imagens editadas pela IA. "Implementos e
   acessórios" fica fora da vitrine (só tem foto de arte, destoava) e segue no
   catálogo. "Ver todo o catálogo" é um link discreto com seta ao lado do título.
4. **Promoções** (marinho): só as 3 artes de promoção, grandes (até 380 px), com
   brilho azul e nome e preço na legenda; a do meio em pódio. Fundo na mesma
   linguagem do hero: linhas de velocidade a 12° mais densas, aurora azul vinda de
   baixo e holofote azul atrás das artes (o Lightfall da KiProdutos foi testado e
   descartado: feixes curvos destoavam do resto). Grade
   centralizada no desktop, trilho no celular; link "Ver promoções no catálogo".
5. **Sobre e envio** (claro): texto curto (placeholder do "Sobre nós" definitivo),
   números reais (peças, marcas de veículo, categorias), fatos confirmados (envio
   para todo o Brasil, loja física em Lages – SC desde 2021, atendimento pelo
   WhatsApp), "Como comprar" em 4 passos (`<ol>`), 2 fotos do estoque grandes,
   lado a lado em largura total (3:2) no desktop, com a faixa de números sobre elas.
6. **Clientes** (marinho): faixa curta com `[PLACEHOLDER]` (`PEND-008`).
7. **Loja e contato** (claro): endereço, horário, "Como chegar", WhatsApp,
   "Ligar", Instagram, foto da fachada e mapa do Google embutido em largura total
   (iframe com carregamento preguiçoso, como na KiProdutos).
8. **Rodapé** (marinho-3): selo oficial ≤ 80 px, contatos, endereço, razão social.

### Catálogo, detalhe, lista, painel, 404

- **Catálogo** (`/catalogo`): faixa marinho com h1, busca e contador; chips de
  categoria roláveis; filtros na coluna lateral (desktop) ou painel "Filtrar" com
  contador (celular); chips ativos; ordenação; grade 4/3/2 colunas, lotes de 24.
- **Card**: placa branca 4:3 com a foto (marinho nos produtos de promoção, com faixa
  vermelha a 12° e preço amarelo), nome (2 linhas), código em Plex tabular, chip
  "LD / LE", categoria (oculta no celular), botão "Adicionar ao orçamento" (com
  lados, abre o seletor no próprio card).
- **Detalhe** (`/produto/<slug>`): breadcrumb, foto em placa ≤ 360 px, nome,
  códigos por lado, códigos originais, marca, categoria, descrição, preço só em
  promoção, seletor LD | LE | Par, quantidade, "Adicionar ao orçamento",
  "Solicitar orçamento pelo WhatsApp", aplicações (tabela; lista no celular),
  relacionados (até 4).
- **Lista de orçamento**: painel lateral (tela cheia no celular), cabeçalho marinho,
  corpo branco, itens com miniatura, lado, código, quantidade, preço unitário só em
  promoção, observação (500), aviso fixo, "Limpar lista" e "Enviar pelo WhatsApp".
- **Painel** (`/painel`): tela clara de trabalho, faixa marinho fina com o selo
  "Demonstração — números fictícios", filtro por vendedor, indicadores, gráficos
  SVG próprios (skill `dataviz`), tabela por vendedor, funil, links de teste e
  "Zerar dados da demonstração".
- **404**: faixa marinho com linhas de velocidade paradas, links para landing e
  catálogo.

## Referências

**Aproveitado:**

- Prancha da marca: fundo marinho, cromado, azul vivo, itálico estendido, filetes
  técnicos (`mk-prancha-sistema-de-marca.png`).
- Cabeçalho com busca e ícone de lista com contador (`97eb3b…`, `da7e5a…`).
- Faixa de categorias logo abaixo do cabeçalho (`97eb3b…`, `da7e5a…`).
- Grade de produtos em fundo claro com placa de foto fixa e botão de adicionar
  (`97eb3b…`, `da7e5a…`).
- Faixa de vantagens com ícones de linha (`da7e5a…`, `exemplo.jpg`), só com fatos
  confirmados.
- Blocos de categoria com a peça em destaque (`exemplo.jpg`, `da7e5a…`).
- Banner escuro de promoção com a peça e o preço (`da7e5a…`, artes do cliente).

**Deixado de fora:** estrelas de avaliação e depoimentos (não há material),
contagem regressiva (sem vigência, `PEND-004`), lista de desejos, conta/login,
moeda/idioma, newsletter, preço "de" inventado, verde e vermelho como cor de marca,
menu lateral fixo de categorias na landing (vira coluna de filtros no catálogo),
"Add to cart/Comprar" (é orçamento, `RN-02`), logos de montadoras e fornecedores.

## Fontes do conteúdo

- `design/briefing.md` (endereço, horário, contatos, Instagram, desde 2021, envio
  para todo o Brasil, importação/exportação/distribuição).
- Selo oficial: lema "Peças e acessórios para caminhões".
- `src/content/` (76 produtos, 7 categorias, 8 marcas de veículo, transcritos do PDF
  de 2025 e das artes de promoção).
- Não há site atual.

## Divergências registradas

- A skill `design-taste-frontend` proíbe vidro, degradês, brilho, palavra de
  destaque no título e cards com ícone. O contrato mantém vidro, degradê da aurora,
  cromado numa palavra do h1 e a faixa de vantagens com ícones porque vêm da marca
  (cromado e degradê da prancha), das referências e da preferência "páginas vivas"
  do responsável humano. As demais regras da skill (sem rótulos minúsculos
  espaçados, sem numeração decorativa, no máximo duas famílias, texto na tinta
  cheia) valem.

## Acabamento

Etapa 3 (skill `impeccable`), executada em contexto único (sem subagentes: o
agente não tem autorização para abri-los nesta sessão).

- **Critique:** nota **28/40** (Bom). Heurísticas: status 3, linguagem 3,
  controle 3, consistência 3, prevenção de erro 3, reconhecimento 3, eficiência 2,
  estética 3, recuperação 3, ajuda 2.
- **Detector** (`impeccable detect` no código e no HTML pré-renderizado): código
  sem achados; no HTML, `gradient-text` (cromado aprovado, ignore restrito a
  `landing.css`), `marquee` (faixa de marcas prevista no contrato, pausável),
  `low-contrast` e `cramped-padding` (falsos positivos: texto branco sobre seções
  marinho com degradê e contêineres com recuo no filho `.contido`),
  `repeating-stripes-gradient` (corrigido) e `flat-type-hierarchy` no detalhe (nomes
  de peça em 16 px nos cards relacionados; mantido, o peso separa).
- **Hook do impeccable:** `side-tab` no aviso de itens removidos (borda grossa de
  um lado) trocado por fundo tingido, contorno fino e ícone de alerta.
- **Ajustes aplicados:**
  - layout: seções da landing reduzidas para ~850–930 px a 1440×900 (padding
    vertical menor, placa das categorias 16:10, artes do trilho em 264 px);
  - polish: emenda com a onda de trás em azul vivo translúcido (sem faixa cinza) e
    onda contínua entre os ladrilhos; atalho de WhatsApp do cabeçalho escondido no
    topo da landing (o hero já tem o botão); mapa sem listras decorativas; fotos de
    produto em `scale-down`; linha separadora do PDF removida do recorte S03-068;
    botão "Adicionar" curto em cards estreitos (container query);
  - adapt: gráficos do painel com rótulos em HTML (legíveis no celular); aviso do
    vendedor dentro da barra do cabeçalho; aviso de "adicionado" curto e escondido
    com a lista aberta; descrições das vantagens só a partir de 768 px; placeholder
    de busca curto.

## Menu do celular e trilhos (ajustes de revisão)

- Menu no estilo CardNav (React Bits, via Prime Padel, `src/hooks/useMolaMenu.ts`): o painel cresce
  com mola a partir da barra, os cartões "Peças" e "Loja" e o rodapé (WhatsApp, Ligar) entram em
  sequência, e o ícone de duas linhas vira X. Fecha com Esc, toque fora ou ao navegar; movimento
  reduzido abre e fecha direto.
- Trilhos do celular (categorias e promoções) com o cartão centralizado (`scroll-snap-align: center`),
  74% da largura para a ponta do vizinho aparecer dos dois lados (indica que dá para deslizar), e
  movimento contínuo como a faixa de marcas (~28 px/s, volta sem emenda com cópias decorativas
  `trilho-copia`, `src/hooks/useAutoRolagem.ts`). O toque devolve o controle (o encaixe volta) e o
  movimento retoma após 5 s sem interação; só no celular, com o trilho na tela e sem movimento
  reduzido.
- Placeholders da busca têm versão curta em telas de até 420 px (`useTextoCurto`), para não cortar.
- Seções marinho começam em marinho puro (brilho deslocado para baixo), sem linha entre a emenda e a
  seção seguinte.

## Ajustes da revisão impeccable (crítica 28/40, aplicados a pedido)

- **Card de produto:** nome inteiro (sem corte) e, logo abaixo, a aplicação resumida
  (`resumoAplicacao`: "Scania NTG (Série 6) · 2015+") no lugar da categoria.
- **Detalhe do produto:** placa do tamanho da foto (até 460 px, nunca ampliada); no desktop,
  Aplicações na coluna da foto e a compra na outra.
- **Botão flutuante:** com itens na lista vira "Lista (n) · Enviar" e abre a lista; sem itens,
  WhatsApp. O cabeçalho não tem mais botão de WhatsApp.
- **Catálogo:** categoria só nos chips (saiu do painel de filtros); topo mais curto e chips
  compactos; respiro no fim da grade no celular.
- **Lista:** prévia da mensagem do WhatsApp (fechada por padrão).
- **Cabeçalho:** marinho quase sólido ao rolar (o vidro virava cinza sobre seções claras).
- **Cards de categoria:** sem numeração e sem caixa alta espaçada; contagem fixa ("28 peças").
- **Hero no celular:** véu mais leve à direita, cabine do caminhão visível.
- **Trilhos no celular:** param de vez no primeiro toque.
- **Admin:** sem o controle "Destaque", cabeçalho da tabela uniforme, códigos na fonte do site,
  ícones próprios de Produtos e Métricas.
