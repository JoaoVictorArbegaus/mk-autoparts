# 08 — Especificação do frontend

## Stack e pipeline (`DEC-002`, `DEC-003`)

- Pipeline do agente `gerador-landing` de `D:\IntelliJ\Workspace\landing-pages`:
  entrada → direção visual com checkpoint → código (`design-taste-frontend`) →
  acabamento (`impeccable`) → verificação.
- Stack fixa do agente: Vite + React + TypeScript, CSS próprio em `src/styles/`
  (sem Tailwind), Motion (`m.*` dentro de `LazyMotion` strict e `MotionConfig
  reducedMotion="user"`), Lenis, pré-renderização no build sem biblioteca extra.
- Extensões deste projeto (`DEC-003`):
  - **várias rotas pré-renderizadas**: `scripts/prerender.mjs` gera
    `dist/index.html`, `dist/catalogo/index.html` e
    `dist/produto/<slug>/index.html` para cada produto ativo,
    `dist/painel/index.html`, as rotas de `/admin/*` e `dist/404.html`;
  - **roteamento próprio** com a History API (componente `Link` e hook de rota em
    `src/router/`), sem biblioteca de rotas; a navegação interna não recarrega a
    página e respeita o Lenis;
  - componentes de terceiros (React Bits, kokonutui) adaptados conforme o agente.
- Versões exatas no `package.json`, conferidas com `npm view` na criação.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Landing |
| `/catalogo` | Catálogo com busca e filtros na query string |
| `/produto/<slug>` | Detalhe do produto |
| `/painel` | Painel de métricas simulado (`RN-10`), `noindex`, fora da navegação |
| `/admin` | Login simulado do admin (`DEC-015`), `noindex`, fora da navegação pública |
| `/admin/produtos` | Lista e edição visual de produtos |
| `/admin/produtos/novo` | Cadastro visual de produto |
| `/admin/produtos/editar?slug=` | Edição visual de produto |
| `/admin/promocoes` | Gestão visual de promoções |
| `/admin/vendedores` | Gestão visual de vendedores e links |
| `/admin/metricas` | Painel simulado dentro do admin |
| `/vendedor` | Painel do vendedor simulado (`RN-13`, `DEC-018`, `DEC-021`): login simulado, orçamentos ativos com aviso de alteração, montar orçamento, preços e desconto, gerar link, PDF e Word. `noindex`, fora da navegação pública |
| `/orcamento` | Orçamento aberto pelo link do vendedor (`RN-13`): itens, preço antigo riscado, novo preço e porcentagem, total; o cliente altera, adiciona produtos e usa "Solicitar orçamento" ou "Falar com `<nome>`" (rota provisória) |
| qualquer outra | 404 com link para landing e catálogo |

A lista de orçamento é um painel lateral (tela cheia no celular) acessível pelo
ícone no cabeçalho, em todas as rotas.

## Landing — seções

Ordem inicial; a ordem final e o tratamento visual ficam em
`frontend/design/direcao-visual.md`.

1. **Hero:** proposta de valor (peças e acessórios para caminhões, envio para todo o
   Brasil), busca rápida que leva a `/catalogo?q=`, CTAs "Ver catálogo" e "Falar no
   WhatsApp", sobre uma imagem de fundo com mosaico de peças para caminhão (`DEC-024`,
   ilustrativa, sem preço nem quantidade).
2. **Montadoras atendidas:** faixa com os nomes das montadoras que existem nos dados,
   cada uma levando ao catálogo filtrado. Sem logos de terceiros (`PEND-007`) e sem
   quantidade de peças (`RN-14`).
3. **Categorias:** atalhos para o catálogo por categoria (exceto Implementos e
   acessórios, sem foto de peça), com link para o catálogo completo. Sem quantidade
   de peças (`RN-14`).
4. **Promoções:** só as artes de promoção do cliente (`DEC-013`), cada uma
   levando ao produto. Produtos com `destaque: true` não aparecem na landing.
5. **Sobre e envio para todo o Brasil (sem números de peças, `RN-14`; no lugar, "Desde 2021", "Envio para todo o Brasil" e "Loja em Lages – SC"):** loja de autopeças em Lages – SC desde 2021;
   importação, exportação e distribuição; como comprar (escolher no catálogo →
   montar a lista → enviar pelo WhatsApp → fechar com o atendimento). Texto
   "Sobre nós" definitivo depende do cliente.
6. **Clientes:** conteúdo do destaque "Clientes" do Instagram somente com
   autorização e material fornecido; sem material, a seção fica como
   `[PLACEHOLDER]` (`PEND-008`).
7. **Loja e contato:** endereço (Av. Corina Caon, 103 – Ponte Grande, Lages – SC),
   horário de segunda a sexta (08:00–12:00 e 13:00–18:00), link "Como chegar" para
   o Google Maps, WhatsApp (49) 99110-0096, telefone (49) 3018-8278 (`tel:`) e
   Instagram. Mapa incorporado só se não
   prejudicar o desempenho (carregar ao clicar ou ao entrar na tela).
8. **Rodapé:** logo, contatos, endereço e razão social; CNPJ somente se o cliente
   autorizar.

## Catálogo

- Em qualquer ordenação, os produtos em promoção vêm primeiro; com busca, a
  promoção só desempata a relevância.

- Cabeçalho com campo de busca e ordenação, sem contador de resultados (`RN-14`).
- Desktop: filtros em coluna lateral. Celular: botão "Filtrar" com ícone de
  abrir/fechar e painel sobreposto, com contador de filtros ativos.
- Chips dos filtros ativos com remoção individual e "Limpar filtros".
- Grade de cards com carregamento incremental (lotes de 24).
- **Hidratação:** o HTML pré-renderizado de `/catalogo` mostra a lista sem filtros;
  os parâmetros da URL são aplicados depois da montagem (`useEffect`), com estado de
  carregamento curto que reserva a altura, para não haver erro de hidratação.

## Card de produto

Imagem (ou imagem padrão da marca), nome, código, marca, categoria, selo
`[EXEMPLO]` se `exemplo`, botão "Adicionar ao orçamento" com feedback. Em promoção:
selo "Promoção", preço promocional e, se houver, preço original riscado. Fora de
promoção, sem preço (`RN-02`, `RN-02A`).

## Detalhe de produto

Conforme `RF-13` a `RF-15`. Tabela de aplicações (montadora, modelo, anos); em
celular, lista empilhada. Breadcrumb Catálogo › Categoria › Produto.

## Lista de orçamento

Conforme `RN-04`, `RN-05`, `RF-16` a `RF-18`. Aviso fixo no painel: "Envie a lista
pelo WhatsApp e receba o orçamento com preços e disponibilidade" (texto final em
`PEND-003`).

Fim da lista, perto do botão de orçar (`RN-11`, `RN-12`, `DEC-017`):

- **Com vendedor atribuído:** só o botão "Solicitar orçamento", ligado ao vendedor, com
  o aviso "Atendimento: `<nome>`". Nenhuma escolha de outro vendedor.
- **Sem vendedor:** botão principal "Solicitar orçamento" (rodízio) e, abaixo, a seção
  "Escolher um vendedor" com cartões de foto e nome. Sem foto real, avatar com iniciais.
  Fora do horário comercial, um aviso discreto perto do botão diz que o tempo de resposta
  dos vendedores é indeterminado (`RN-15`, vale também com vendedor atribuído e no
  `/orcamento`).
  A seção é compacta para não afastar o botão principal, e o painel lateral continua
  utilizável no celular em tela cheia.

## Organização do código

| Caminho | Conteúdo |
| --- | --- |
| `src/content/site.ts` | Textos da landing, contatos, helper `whatsapp(mensagem)` |
| `src/content/produtos.ts`, `categorias.ts`, `montadoras.ts` | Dados (`03-domain-model.md`) |
| `src/content/catalogo.ts` | Funções de acesso e busca/filtro puras |
| `src/router/` | Roteamento próprio |
| `src/orcamento/` | Contexto React e persistência da lista |
| `src/pages/` | Landing, Catálogo, Produto, 404 |
| `src/admin/` | Admin de demonstração (`DEC-015`), sem persistência |
| `src/components/` | Seções, cards, botões, primitivas de animação |
| `src/styles/` | CSS |
| `design/` | Briefing, referências, opções e contrato visual, originais |

## Identidade visual

Definida na Etapa 1 do agente, a partir do logo, das referências em
`frontend/design/referencias/` e do briefing. Até lá, nenhuma paleta ou fonte está
decidida. Não reutilizar a identidade da KiProdutos.

## Simulação de vendedores e métricas (`DEC-010`)

- **Aviso do vendedor:** selo discreto "Atendimento: `<nome>`" no cabeçalho (ou logo
  abaixo dele no celular), aplicado depois da montagem, sem mudar a altura do
  cabeçalho (sem salto de layout).
- **Registro:** um módulo `src/rastreio/` expõe `registrar(evento)`; páginas e o
  contexto da lista chamam essa função. Componentes não acessam o `localStorage`
  diretamente.
- **Painel `/painel`:** tela de trabalho, não de marketing: superfícies claras e
  legíveis, sem fundos animados pesados; segue a paleta e a tipografia da direção
  visual. Cartões de indicadores, ranking de mais e menos clicados, gráfico de
  cliques × adicionados, carrinhos finalizados × não finalizados, tabela por
  vendedor e funil. Gráficos feitos com SVG próprio seguindo a skill `dataviz`,
  sem biblioteca de gráficos. No celular, tabelas viram listas.
- Rodapé do painel com os links de teste de cada vendedor e o botão "Zerar
  dados da demonstração".

## Marca e materiais (`DEC-014`)

- Identidade: sistema de logotipos v1.1 em `docs/design/`
  (`LEIA-ME.txt`, `site/brand-tokens.css`). Paleta da marca: prata `#D9DEE5`,
  azul royal `#1C4FD0`, azul vivo `#3D7EFF`, azul-marinho `#0B1A36`, branco. O
  gradiente cromado é só para tela. A direção visual parte desses tokens.
- **Logo principal (`DEC-020`):** o selo oficial `docs/design/selo-oficial/mk-04-selo-oficial-*.png`,
  circular, no cabeçalho, no painel do vendedor e nos documentos, em tamanho adaptado
  (512, 1080 e 1600 px de origem; em tela, versões WebP derivadas).
- Rodapé, favicons, monograma e as demais partes seguem o sistema de logotipos v1.1;
  fundo escuro usa "principal-fundo-escuro" e fundo claro "positiva-fundo-claro". Favicons
  em `docs/design/favicon/`.
- Grafia na interface: "MK Autoparts".
- Peça com lados: card mostra "LD / LE"; detalhe tem seletor de lado (LD, LE, Par)
  e lista os códigos de cada lado.
