# 99 — Registro de decisões

Este documento registra decisões aprovadas que orientam o projeto. Uma decisão aceita
não deve ser reaberta por preferência técnica de uma futura sessão. Mudanças exigem
autorização humana, atualização dos documentos afetados e novo registro aqui.

## Status

- `ACEITA`: decisão vigente.
- `SUBSTITUÍDA`: não vigente; aponta a sucessora.
- `PENDENTE`: requer decisão humana. As pendências do cliente ficam em
  `docs/client-questions.md` com os IDs `PEND-*`.

## Decisões aceitas

### DEC-001 — Fase de protótipo somente frontend

- **Status:** ACEITA (responsável humano).
- **Decisão:** A primeira entrega é um protótipo de apresentação para a MK
  Autoparts: landing page + catálogo online com produtos pré-cadastrados, sem
  backend, banco, painel, autenticação ou deploy de produção.
- **Consequência:** `07`, `09`, `11` e parte de `12`/`13` ficam fora do escopo. As
  especificações do produto definitivo serão decididas depois da apresentação,
  com a KiProdutos como referência de processo.

### DEC-002 — Frontend pelo agente e skills do landing-pages

- **Status:** ACEITA (responsável humano).
- **Decisão:** O frontend segue o agente `gerador-landing` e as skills
  `ui-ux-pro-max`, `design-taste-frontend` e `impeccable` de
  `D:\IntelliJ\Workspace\landing-pages`, ligados por junções em `.claude/agents` e
  `.claude/skills`, com o hook do impeccable em `.claude/settings.local.json`. A
  pasta do cliente do agente é `frontend/`.
- **Consequência:** Checkpoint de direção visual obrigatório; páginas vivas por
  padrão; verificação da Etapa 4 como critério de pronto. Agente e skills não são
  editados por este projeto, porque as junções alteram os originais.

### DEC-003 — Stack Vite + React com várias rotas pré-renderizadas

- **Status:** ACEITA (decisão delegada pelo responsável humano, que pediu landing
  fluida, com componentes React e otimizada).
- **Decisão:** Manter a stack fixa do agente (Vite + React + TypeScript, CSS
  próprio, Motion, Lenis, pré-renderização sem biblioteca extra) em vez de Next.js.
  Estender a pré-renderização para landing, catálogo e cada produto; roteamento
  próprio pela History API. Vitest como única dependência de desenvolvimento
  adicional, para as regras puras.
- **Motivo:** É a stack em que o pipeline e as skills foram calibrados; o protótipo
  não precisa de servidor; o HTML pré-renderizado por produto atende SEO e
  desempenho. Nenhum agente do landing-pages usa Next.js.
- **Consequência:** A stack do produto definitivo fica em aberto (`PEND-009`).

### DEC-004 — Preço único e promoção individual

- **Status:** SUBSTITUÍDA por `DEC-008`.
- **Decisão:** Cada produto mostra um único preço; promoção individual com preço
  original riscado. Kits, Reels e contas de clientes da KiProdutos não entram.
- **Consequência:** Varejo × atacado fica em `PEND-001`.

### DEC-005 — Dados estáticos tipados extraídos do PDF

- **Status:** ACEITA (responsável humano).
- **Decisão:** Os produtos do protótipo são os reais do PDF que a MK envia hoje,
  transcritos em arquivos TypeScript em `frontend/src/content/`, validados no build.
- **Consequência:** Sem PDF não há massa de produtos; dados fictícios só com selo
  `[EXEMPLO]` e somente se o responsável humano pedir.

### DEC-006 — Lista de orçamento enviada pelo WhatsApp

- **Status:** ACEITA para o protótipo (responsável humano).
- **Decisão:** Lista no navegador (`localStorage`), com quantidade, revalidação
  contra os dados atuais e envio de mensagem pronta pelo WhatsApp, como o carrinho
  da KiProdutos.

### DEC-007 — Busca e filtros

- **Status:** ACEITA (responsável humano).
- **Decisão:** Busca por nome, código interno, códigos originais e marca; filtros
  por categoria, montadora, modelo, marca da peça e promoção; estado na URL.

### DEC-008 — Preço só nas promoções

- **Status:** ACEITA (responsável humano).
- **Decisão:** O PDF do cliente não tem preços; só as promoções têm preço. Produtos
  comuns aparecem sem preço e servem para organizar o que o cliente quer e levar ao
  WhatsApp, onde o atendimento faz o orçamento. Produtos em promoção mostram selo e
  preço promocional (original riscado só se informado).
- **Substitui:** `DEC-004` (preço em todos os produtos).
- **Consequência:** Sem ordenação por preço nem total da lista; filtro "Somente
  promoções" mantido; `Offer` no JSON-LD só em promoção. A lista ganha uma
  observação opcional para o cliente informar o caminhão e a cidade de envio.
  Mostrar preços no futuro fica em `PEND-001`. O documento de dados da empresa
  (`docs/fontes/dados-empresa.md`) indica preços públicos; o responsável humano
  manteve esta decisão para o protótipo.

### DEC-009 — Produto definitivo orientado a vendedores e métricas

- **Status:** ACEITA como direção do produto definitivo (responsável humano); as
  regras detalhadas continuam pendentes (`PEND-017` a `PEND-026`).
- **Decisão:** O objetivo principal do produto é ser o catálogo dos vendedores,
  substituindo o PDF e as imagens de promoção enviadas pelo WhatsApp. O produto
  definitivo terá link por vendedor com atribuição da navegação, registro de
  eventos, carrinho no servidor (ativo, abandonado, finalizado) e painel de
  métricas por vendedor, produto e funil. Fonte:
  `docs/fontes/regras-de-negocio-v0.1.md` (rascunho).
- **Protótipo:** simulado conforme `DEC-010`, que substitui a decisão anterior de
  não simular nada.
- **Consequência:** O protótipo mantém o destino do WhatsApp e as ações do visitante
  (abrir produto, buscar, adicionar, remover, enviar) em pontos únicos do código,
  para que vendedor e eventos entrem depois sem reescrever componentes
  (`10-architecture.md`).

### DEC-010 — Simulação de vendedores e métricas no protótipo

- **Status:** ACEITA (responsável humano). Fonte:
  `docs/fontes/regras-prototipo-v0.2.md`.
- **Decisão:** O protótipo demonstra, sem backend, o link de vendedor com aviso
  "Atendimento: `<nome>`", o registro das ações do visitante e dos carrinhos
  (finalizados e não finalizados) no `localStorage` e um painel `/painel` com
  números fictícios fixos somados às ações da demonstração.
- **WhatsApp:** "Enviar pelo WhatsApp" abre o WhatsApp real com a mensagem pronta,
  para o número do vendedor da sessão; os vendedores fictícios usam o número da
  empresa, (49) 99110-0096, para não expor telefones inventados.
- **Painel:** rota sem link na navegação, sem login, `noindex`, com selo de
  demonstração e botão para zerar os dados locais.
- **Fora:** prazo e conflito de atribuição definitivos, carrinho no servidor,
  abandono por tempo, login, LGPD e integrações (`PEND-019` a `PEND-026`).
- **Substitui:** o item "Protótipo" de `DEC-009`.

### DEC-011 — Fluxo de atendimento por vendedor e grupo de vendedores

- **Status:** ACEITA como regra do produto definitivo (responsável humano). Não
  precisa estar no protótipo.
- **Decisão:**
  - O cliente que entra em contato com a loja pelo WhatsApp é atendido por um
    vendedor, que envia o próprio link do catálogo. A navegação e a lista ficam
    atribuídas a esse vendedor, e o envio vai para o WhatsApp dele.
  - O cliente que entra no catálogo sem link de vendedor envia a lista (ou pede
    contato) para um **contato central** de WhatsApp, por `wa.me` com a mensagem
    pronta. Esse contato encaminha o atendimento para o grupo de WhatsApp dos
    vendedores, onde um vendedor assume. O cliente não entra no grupo.
  - O contato central poderá ser, no futuro, um atendente automático com IA. A IA
    ainda não existe e não faz parte do trabalho atual (`PEND-027`).
  - O vendedor que assume no grupo fecha a venda pelo próprio WhatsApp. O carrinho
    enviado continua com origem "direta" nas métricas. O vendedor só passa a ser o
    dono se o cliente precisar voltar ao catálogo: nesse caso ele manda o próprio
    link, e a navegação e os carrinhos seguintes ficam atribuídos a ele.
- **Protótipo:** sem vendedor, o envio vai para o número da empresa,
  (49) 99110-0096, que faz o papel do contato central (`DEC-010`). O encaminhamento
  ao grupo e a IA não são demonstrados.
- **Consequência:** O site só precisa abrir `wa.me` para um número (vendedor ou
  central), com a mensagem pronta; o link de convite de grupo não é usado. A IA e o
  encaminhamento ficam fora do site, como integração do produto definitivo.
- **Substitui:** a versão anterior desta decisão, que mandava o cliente direto para
  o grupo (o link de grupo não aceita mensagem pronta).

### DEC-012 — Peças com lado direito e esquerdo como um produto

- **Status:** ACEITA (responsável humano).
- **Decisão:** No PDF, a maioria das peças vem em par LD/LE, com códigos MK e
  originais diferentes por lado. Cada peça vira um único produto com `variantes`
  por lado; o visitante escolhe LD, LE ou o par ao adicionar à lista, e cada lado
  vai com o próprio código para o WhatsApp.
- **Consequência:** O item da lista passa a ser produto + lado; busca encontra o
  produto por qualquer código de lado.

### DEC-013 — Artes de promoção na landing

- **Status:** ACEITA (responsável humano).
- **Decisão:** As artes de promoção do cliente (`originais/produtos/promo*.jpeg`)
  aparecem num carrossel na landing, cada uma levando ao produto em promoção. O
  produto tem card e detalhe próprios, com a peça recortada da arte e o preço da
  arte (`RN-02A`). O texto das artes não substitui o texto acessível: cada arte tem
  `alt` com produto e preço.
- **Consequência:** As promoções atuais são três peças que não estão no PDF:
  paralama Bitrem Randon até 2008 (LD/LE, R$ 109,90 cada), caixa de ferramentas
  50 L com suportes (R$ 439,00) e caixa de lanterna Randon original (LD/LE,
  R$ 119,90 cada lado). As artes não trazem preço "de".

### DEC-014 — Contatos, endereço e marca

- **Status:** ACEITA (responsável humano).
- **Decisão:** Endereço Av. Corina Caon, 103 – Ponte Grande, Lages – SC (o PDF de
  abril de 2025 traz R. Josefina Amorim, 364, considerado desatualizado). WhatsApp
  (49) 99110-0096 para a lista e os botões de contato; telefone (49) 3018-8278
  exibido como "Ligar" no contato e no rodapé. Identidade pelo sistema de
  logotipos v1.1, com grafia "MK Autoparts".
- **Resolve:** `PEND-005` (parte de telefones) e `PEND-018`.

### DEC-015 — Admin de demonstração no protótipo

- **Status:** ACEITA (responsável humano). Amplia `DEC-001` e `DEC-010`.
- **Decisão:** O protótipo ganha um admin de demonstração em `/admin`, com login simulado (aceita
  qualquer usuário e senha; sessão marcada só no navegador) e as telas Produtos (lista, busca,
  filtros, novo, editar, ativar/desativar), Promoções (pôr/tirar produto, preço), Vendedores
  (cadastro, link `?v=` para copiar, ativar/desativar) e Métricas (o painel de `DEC-010` dentro do
  admin).
- **Efeito:** só visual. As telas respondem durante a sessão (listas e formulários atualizam na
  memória), mas nada altera o site público e tudo volta ao original ao recarregar. Cada tela mostra
  o selo "Demonstração: nada é salvo no site".
- **Fora:** autenticação real, permissões, upload real de imagem, persistência e API (produto
  definitivo, `PEND-011`).
- **Consequência:** `/admin/*` é `noindex`, fora da navegação pública e sem eventos de rastreio;
  edição de produto usa `/admin/produtos/editar?slug=` para a rota ser pré-renderizada.
