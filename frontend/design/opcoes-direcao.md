# Opções de direção visual — MK Autoparts (landing + catálogo + painel)

Etapa 1 do agente `gerador-landing`. Este arquivo propõe **3 direções**; nenhuma
está aprovada. A escolhida (com ajustes) vira `direcao-visual.md`, o contrato das
etapas seguintes.

## Base comum às três opções

### O que é fixo (não varia entre as opções)

- **Paleta da marca** (sistema de logotipos v1.1, `DEC-014`): azul-marinho
  `#0B1A36`, azul royal `#1C4FD0`, azul vivo `#3D7EFF`, prata `#D9DEE5`, branco;
  gradiente cromado (`--mk-chrome`) **só em tela** e só em pontos de marca (logo,
  um título de destaque). As sugestões automáticas da skill (verde `#059669` /
  `#15803D` com laranja) foram **descartadas**: contrariam a marca e a ordem de
  prioridade (marca e referências > skill).
- **Acento de promoção:** vermelho de faixa e amarelo de preço, tirados das artes
  do cliente, usados **somente** no que é promoção (selo, faixa, preço). Não viram
  cor de botão nem de navegação. Valores de trabalho: vermelho `#C81E2A`, amarelo
  `#FFC531` (a confirmar no contrato).
- **Logo:** horizontal (03) com 40 px no cabeçalho desktop e monograma (01) com
  32 px no celular; "principal-fundo-escuro" sobre escuro, "positiva-fundo-claro"
  sobre claro; selo oficial (PNG) só como imagem (rodapé, compartilhamento). Os
  SVGs são vetores puros (2–3 KB), podem ir inline.
- **Itálico de 12°** do lettering como assinatura geométrica: cortes, faixas,
  filetes e linhas de movimento inclinados a 12°, nunca letras deformadas.
- **Ícones:** SVG próprio, traço único (1,75 px), sem emoji.
- **Produto:** a lista é "orçamento", nunca "carrinho" ou "comprar" (`RN-02`);
  preço só nas 3 promoções (`DEC-008`); card mostra "LD / LE" e o detalhe tem
  seletor LD | LE | Par (`DEC-012`).
- **Duas velocidades de interface** (vale para todas as opções): a landing é
  **viva** (fundos animados em toda seção, emendas, entradas, contadores,
  carrossel); catálogo, detalhe, lista de orçamento e painel são **telas de
  trabalho**: sem fundo animado atrás de grade, tabela ou formulário, movimento
  só como resposta à ação (adicionar, filtrar, abrir painel). Isso não é "página
  parada": o movimento muda de função, não some.

### Contraste já medido (WCAG, texto normal exige 4,5:1)

| Par | Razão | Uso permitido |
| --- | --- | --- |
| branco sobre `#0B1A36` | 17,28 | qualquer texto |
| prata `#D9DEE5` sobre `#0B1A36` | 12,78 | qualquer texto |
| azul vivo `#3D7EFF` sobre `#0B1A36` | 4,63 | texto e links em fundo escuro |
| azul vivo `#3D7EFF` sobre `#13254A` | 4,04 | **só texto grande (≥ 24 px) ou não texto** |
| azul vivo `#3D7EFF` sobre branco | 3,73 | **só ícone, borda, barra de gráfico; nunca texto** |
| azul royal `#1C4FD0` sobre branco / branco sobre royal | 6,82 | links e botões em fundo claro |
| `#0B1A36` sobre `#F3F5F8` | 15,82 | texto em superfície clara |
| `#5B6678` sobre branco | 5,81 | texto secundário em claro |
| `#8A96A8` sobre `#0B1A36` | 5,77 | texto secundário em escuro |
| amarelo `#FFC531` sobre `#0B1A36` | 10,93 | preço de promoção |
| branco sobre vermelho `#C81E2A` | 5,71 | selo "Promoção" |

### O que as referências têm em comum (e o que fica de fora)

Sem `notas.md` preenchido; leitura das 4 imagens:

- **Prancha da marca** (`mk-prancha-sistema-de-marca.png`): fundo azul-marinho,
  cromado, azul vivo, itálico estendido, grade técnica de construção do lettering,
  cartões escuros com legenda pequena. É a fonte da identidade.
- **Traços recorrentes nas 3 lojas de peças** (`97eb3b…`, `da7e5a…`,
  `exemplo.jpg`):
  1. cabeçalho com **busca em destaque** e **ícone de lista com contador**;
  2. **faixa de categorias** horizontal logo abaixo do cabeçalho;
  3. **grade de produtos em fundo claro**, foto da peça em placa clara de
     tamanho fixo, nome curto, preço e botão de adicionar;
  4. **faixa de vantagens** com ícones de linha (frete, atendimento etc.);
  5. **blocos de categoria com foto grande de peça** recortada, em cartões
     arredondados (mais forte em `exemplo.jpg`);
  6. **banners de promoção** escuros com a peça e o preço em destaque.
- **Traços isolados, deixados de fora em todas as opções:** estrelas de
  avaliação, contagem regressiva de oferta, lista de desejos, conta/login,
  moeda/idioma, newsletter, depoimentos em vídeo (não há material, `PEND-008`),
  preço "de" inventado, verde (`97eb3b…`) e vermelho (`da7e5a…`) como cor de
  marca, menu lateral de categorias fixo na landing (no catálogo ele vira a
  coluna de filtros), linguagem "Add to cart / Shop now".

### Materiais e limites de resolução (valem para todas)

| Material | Real | Uso máximo |
| --- | --- | --- |
| Fotos de produto (`public/img/produtos/`) | ~405×268 px, fundo branco, recorte do PDF com compressão visível | **≤ 260 px de largura** no card e ≤ 360 px no detalhe; sempre sobre placa branca; sem zoom/lightbox ampliado |
| Recortes das promoções | fundo escuro (vem da arte) | placa azul-marinho, nunca placa branca |
| Artes de promoção (`promo*.jpeg`) | 1024×1536 | carrossel/pilha até ~380 px de largura (nítido em 2x) |
| Fachada (`image.png`) | 878×877 | moldura até ~440 px; não serve de fundo em tela cheia |
| Estoque (`image1/2.png`) | 807×880 / 840×866 | molduras até ~420 px, ou fundo escurecido pequeno (painel de seção, não hero inteiro) |
| `image3.png` (arte "Reposição de estoque") | 492×746 | não usar (é arte com texto) |

---

## Opção A — "Cromado na pista" (recomendada)

**Descrição:** a landing é a prancha da marca em movimento: azul-marinho profundo,
cromado só no logo e no título, linhas de velocidade a 12° e auroras azuis. O
catálogo é a "loja" clara e organizada das referências, com o mesmo cabeçalho
marinho costurando as duas metades.

**Segue fielmente:** a prancha da marca e os 6 traços recorrentes das lojas de
peças, e o "Estilo desejado" (fluida, animada, componentes React).

### Traços de estilo

- **Superfícies:** landing em ritmo **escuro / claro** (A/B) — marinho `#0B1A36`
  com profundidade (degradê para `#13254A`, manchas de luz azul vivo a 8–14 %)
  alternando com prata-claro `#F3F5F8`. Vidro escuro (tinta marinho 55–65 %,
  borda prata 12 %) em no máximo 2 elementos por tela: cabeçalho ao rolar e
  controles do carrossel/faixa de vantagens, sempre sobre aurora ou foto.
- **Tipografia:** **Saira** (variável, eixo de largura 50–125, itálico) nos
  títulos, em largura ~118 e itálico, ecoando o AUTOPARTS estendido; **IBM Plex
  Sans** no texto, com algarismos tabulares para códigos (S07-096) e preços. h1 em
  `clamp(2.25rem, 1.4rem + 3.2vw, 4rem)` (≤ 64 px). Duas famílias, `display=swap`.
- **Composição:** hero em duas colunas (texto + busca à esquerda; pilha
  inclinada das 3 artes de promoção à direita); faixas e cortes a 12°; blocos de
  categoria em grade assimétrica com a peça recortada saindo do cartão (traço 5).
- **Acentos:** filete azul vivo de 2 px a 12° antes de cada título de seção;
  cromado só no logo e numa palavra do h1 (reflexo que passa em CSS); promoção em
  vermelho/amarelo das artes.

### Landing (seções do `08-frontend-specification.md`)

1. **Hero** (marinho): h1, subtítulo, campo de busca grande (leva a
   `/catalogo?q=`), CTAs "Ver catálogo" (royal) e "Falar no WhatsApp" (vidro).
   À direita, as 3 artes de promoção em leque, cada uma levando ao produto.
2. **Montadoras** (faixa marinho mais escura): nomes em texto (Saira estendida)
   rolando em marquee lento, pausável, cada um filtrando o catálogo; sem logos.
3. **Categorias** (claro): 7 cartões com a melhor foto da categoria em placa
   branca, ícone de linha, número **real** de peças por categoria (contagem dos
   dados) que conta ao entrar.
4. **Promoções e destaques** (marinho): carrossel das artes (deslize no celular,
   setas e pausa) + grade dos 10 destaques em cards de catálogo.
5. **Sobre e envio** (claro): texto curto, 3 fotos (fachada e 2 do estoque) em
   moldura escalonada com legenda, "Como comprar" em 4 passos numerados ligados por
   uma linha que se desenha, faixa de vantagens (traço 4) só com fatos
   confirmados.
6. **Clientes** (marinho): `[PLACEHOLDER]` enxuto, uma linha, até haver material.
7. **Loja e contato** (claro): endereço, horário, "Como chegar", WhatsApp,
   "Ligar", Instagram; mapa carregado ao clicar.
8. **Rodapé** (marinho): selo oficial ≤ 80 px, contatos, razão social.

### Movimento

- **Hero (CSS, para não atrasar o LCP):** reflexo cromado atravessando a palavra
  em cromado a cada ~6 s; leque das artes entrando com `transform`; linhas de
  velocidade a 12° em canvas leve, começando depois do primeiro quadro.
- **Fundos vivos por seção, alternando:** linhas de velocidade a 12° (hero),
  aurora azul (promoções; reescrita em WebGL puro a partir do Aurora do React
  Bits, meia resolução), campo de pontos em deriva (categorias), curvas de nível
  claras (sobre), feixes de luz lentos (contato). Todos a 15–30 qps, só na tela,
  DPR ≤ 1,5, sem reação ao mouse.
- **Emendas:** onda baixa inclinada (a curva acompanha os 12°), pintada com a cor
  da seção seguinte, ondulando devagar; o fundo animado entra em fade logo abaixo.
- **Entradas (Motion):** títulos sobem palavra por palavra; cards em sequência
  (40 ms); contadores com números reais (peças, categorias, montadoras); tilt
  leve nos cartões de categoria (só ponteiro fino).
- **Ritmo:** rápido e seco (entrada 420 ms, saída 260 ms, curva de desaceleração
  forte), como algo que passa em velocidade e para no lugar.

### Catálogo, card, detalhe, lista e painel

- **Catálogo:** fundo `#F3F5F8`, cabeçalho marinho com busca grande e ícone da
  lista com contador (traço 1); faixa de categorias em chips roláveis (traço 2);
  filtros na coluna lateral (desktop) ou painel "Filtrar" com contador (celular);
  chips de filtros ativos. Sem fundo animado; o cabeçalho tem só um degradê
  estático da aurora. Grade: 4 colunas (1440), 3 (1024), **2 no celular**.
- **Card de produto:** placa **branca** 4:3 com a foto centrada e limitada ao
  tamanho natural (o branco da foto some no branco da placa, escondendo a borda do
  recorte); abaixo, nome (2 linhas), código em Plex tabular, chip "LD / LE",
  categoria (oculta no celular), botão "Adicionar ao orçamento" que vira "Escolha
  o lado" quando há lados e abre o seletor. Card **de promoção:** placa marinho
  (casa com o recorte de fundo escuro), faixa vermelha a 12° "Promoção" e preço
  em amarelo. Hover: elevação e a placa clareia; sem tilt no catálogo.
- **Detalhe:** foto em placa branca (≤ 360 px), seletor segmentado LD | LE | Par
  com o código de cada lado, tabela de aplicações (lista empilhada no celular),
  breadcrumb, "Adicionar ao orçamento" e "Solicitar orçamento" (WhatsApp direto).
- **Lista de orçamento:** painel lateral com cabeçalho marinho e corpo branco
  (tela cheia no celular), itens com miniatura, lado e quantidade, observação,
  aviso fixo e "Enviar pelo WhatsApp" em royal. Ao adicionar, o contador do
  cabeçalho pulsa e a miniatura "voa" até o ícone (só sem movimento reduzido).
- **Painel `/painel`:** superfície clara, cartões brancos, uma faixa marinho fina
  no topo com o selo "Demonstração — números fictícios"; séries em royal e azul
  vivo (barras), prata escuro para "não finalizado"; números em Saira estendida.

### Fotos

Fachada e estoque em molduras de até ~440 px com legenda, nunca em tela cheia.
Produtos sempre na placa branca ≤ 260 px. Artes de promoção no hero e no
carrossel até ~380 px.

### Principal risco

Duas "temperaturas" (landing escura, catálogo claro) podem parecer dois sites. A
costura é o cabeçalho marinho idêntico, a mesma tipografia, o filete a 12° e o
card de promoção marinho dentro do catálogo. Segundo risco: excesso de cromado
deixar a página com cara de "arte de rede social"; o contrato limita o cromado a
logo + uma palavra.

---

## Opção B — "Vitrine técnica clara"

**Descrição:** tudo claro e preciso, como uma prancha de engenharia: branco e
prata, texto marinho, grade técnica do lettering desenhando-se ao fundo e
cartões arredondados com a peça em destaque, na linha do `exemplo.jpg`.

### Traços de estilo

- **Superfícies:** ritmo **branco / prata / marinho** (A/B/C): branco `#FFFFFF`,
  prata-claro `#EEF1F5` e uma seção marinho a cada três (promoções, rodapé).
  Sombras longas e suaves, cantos de 20 px, vidro claro (branco 60 %) só no
  cabeçalho sobre a grade técnica.
- **Tipografia:** **Archivo** como família única (variável, largura 62–125):
  títulos em largura 125, peso 800, itálico; texto em largura 100, peso 400.
- **Composição:** mosaico de categorias em cartões arredondados de tamanhos
  diferentes (traço 5) com a peça "saindo" do cartão; muito respiro; o hero tem a
  busca como peça central, quase um buscador.
- **Acentos:** linhas de cota e marcas de medida (como na seção "Construção" da
  prancha) em azul vivo como **não texto**; royal para links e botões.

### Landing

Mesma ordem de seções. Hero claro com a busca centralizada, chips das montadoras
logo abaixo e, ao lado, a foto do estoque numa moldura arredondada (≤ 420 px).
Categorias em mosaico. Promoções na única seção marinho, com o carrossel das
artes. Sobre com as fotos em grade e "Como comprar" desenhado como diagrama de
cotas.

### Movimento

- Grade técnica e linhas de cota **desenhando-se** devagar ao fundo (canvas 2D),
  curvas de nível em cinza-azulado, campo de pontos com deriva suave; tudo em
  baixa opacidade sobre claro.
- Emendas por **fade** e por uma linha de cota que atravessa a borda, em vez de
  onda.
- Entradas mais lentas e macias (560 ms, mola suave); tilt leve nos cartões do
  mosaico; contadores reais.

### Catálogo, card, detalhe, lista e painel

- **Catálogo:** continuação natural da landing (mesmo fundo branco), filtros na
  coluna lateral em cartões arredondados, chips de categoria no topo.
- **Card:** cartão arredondado prata-claro com a foto em círculo branco ou placa
  branca interna; tipografia larga; promoção com faixa vermelha e preço amarelo
  sobre placa marinho (o único escuro do catálogo).
- **Detalhe:** página clara com linhas de cota em volta da foto (decorativas),
  seletor LD | LE | Par em pílulas.
- **Lista:** painel lateral branco com cabeçalho prata.
- **Painel:** idêntico ao resto do site (claro), o que dá a maior coerência entre
  telas.

### Fotos

Foto do estoque no hero em moldura arredondada; fachada em "Loja e contato".
Produtos em placas brancas ≤ 260 px, mas o mosaico de categorias pede peças
grandes, o que expõe a baixa resolução.

### Principal risco

Afasta-se da linguagem que o cliente já usa (marinho, cromado, azul vivo, artes
escuras): a marca fica restrita ao logo e a uma seção. O mosaico de categorias
"com foto grande de peça" do `exemplo.jpg` não tem fotos à altura (recortes de
~400 px com compressão). Azul vivo não pode ser texto sobre branco (3,73:1).

---

## Opção C — "Galpão em movimento"

**Descrição:** a landing conta a operação real: o estoque, o galpão e o envio
para todo o Brasil, com fotos do cliente em duotom marinho, tipografia condensada
e faixas vermelhas a 12° herdadas das artes. Catálogo escuro com cards em placas
brancas, como prateleiras iluminadas.

### Traços de estilo

- **Superfícies:** ritmo **marinho / foto duotom / claro** (A/B/C); fotos do
  estoque tratadas em duotom marinho + azul vivo com granulação, escurecidas a
  70 %. Vidro escuro sobre as fotos (cabeçalho, cartão de busca do hero).
- **Tipografia:** **Barlow Condensed** itálico 700 nos títulos (impacto, como as
  artes) e **Barlow** no texto (sugestão da skill para "esportivo/energético").
- **Composição:** hero com a foto do estoque como fundo de um painel recortado a
  12° (não tela cheia); mapa do Brasil em linha simples com rotas saindo de Lages;
  números reais grandes.
- **Acentos:** faixas vermelhas a 12° como divisores (não só em promoção),
  amarelo nos preços.

### Landing

Mesma ordem. Hero com painel de foto duotom e cartão de vidro com a busca. "Sobre
e envio" vira a seção principal: mapa com rotas animadas (envio para todo o
Brasil, sem prometer prazo) e as 3 fotos. Promoções em carrossel sobre fundo
escuro.

### Movimento

- Fotos com deslocamento lento em rolagem (parallax sutil) e partículas de luz
  como poeira iluminada no galpão; rotas desenhando-se de Lages para o país;
  marquee de montadoras em faixa vermelha inclinada.
- Emendas em faixa diagonal com textura listrada animada (como a fita das
  artes).
- Ritmo enérgico, com mola marcada.

### Catálogo, card, detalhe, lista e painel

- **Catálogo:** fundo marinho `#0B1A36`, filtros em vidro escuro, cards com
  **placa branca** para a foto e texto prata no corpo escuro; promoção com placa
  marinho, faixa vermelha e preço amarelo.
- **Detalhe e lista:** escuros, coerentes com o catálogo.
- **Painel:** claro (exigência do `08-frontend-specification.md`), portanto a
  única tela clara do site.

### Fotos

São o centro da proposta, mas têm 807–878 px: num painel de hero de ~720 px de
largura ficam no limite; em tela cheia ficariam borradas (por isso o painel
recortado e o duotom, que escondem a falta de nitidez). Exigem recorte das marcas
da interface do Instagram e desfoque de placas de veículos.

### Principal risco

Catálogo escuro é pior para leitura diária no celular sob sol (oficina, pátio,
cabine) e cansa em listas longas; o painel claro fica destoando. Fotos de baixa
resolução no papel principal. Vermelho fora das promoções dilui o sinal de
"promoção" e aproxima a página das lojas genéricas de referência.

---

## Recomendação: Opção A — "Cromado na pista"

- É a única que usa **toda** a identidade que o cliente já tem (prancha v1.1 e a
  linguagem das artes) **e** os 6 traços recorrentes das lojas de referência, sem
  forçar a marca num formato que não é o dela.
- Separa bem as duas velocidades pedidas: landing escura, viva e de impacto para
  a apresentação; catálogo claro, rápido e legível no celular para o uso diário
  dos vendedores e clientes.
- Resolve as fotos de produto: placa branca para os recortes do PDF (o fundo
  branco some) e placa marinho para os recortes das promoções (o fundo escuro
  casa), o que ainda faz a promoção saltar na grade sem precisar de vermelho fora
  dela.
- O painel claro nasce da mesma família visual do catálogo, sem parecer outra
  aplicação.

Resumo:

- **A — Cromado na pista:** landing marinho viva (linhas a 12°, aurora, cromado
  no título) + catálogo claro de loja com placas brancas; promoção em placa
  marinho com vermelho/amarelo. **Recomendada.**
- **B — Vitrine técnica clara:** tudo claro como prancha de engenharia (grade e
  cotas se desenhando), Archivo estendida, mosaico de categorias; marca mais
  discreta.
- **C — Galpão em movimento:** fotos do estoque em duotom, condensada itálica,
  rotas pelo Brasil, faixas vermelhas; catálogo escuro com placas brancas.

**Qual direção sigo?**
