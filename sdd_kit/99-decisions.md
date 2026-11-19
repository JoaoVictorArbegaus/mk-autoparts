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
  backend, banco, autenticação real ou deploy de produção. `DEC-015` acrescenta
  posteriormente um admin apenas demonstrativo, sem persistência.
- **Consequência:** API, banco, administração real e parte de `12`/`13` ficam fora
  do escopo. As especificações do produto definitivo serão decididas depois da
  apresentação, com a KiProdutos como referência de processo.

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
- **Extensão (REU-06):** biblioteca `docx` (versão fixa) para gerar o orçamento em Word no
  navegador, carregada só quando o vendedor pede o Word. O PDF não usa biblioteca: é a página
  A4 do orçamento impressa pelo navegador ("Salvar como PDF"), porque o protótipo não tem
  servidor; o guia do modelo recomenda Chrome headless no servidor para o produto definitivo.
- **Extensão (REU-18, M4):** biblioteca `uqr` (0.1.2, versão fixa, MIT, sem dependências) para
  o QR Code do link do vendedor, carregada só na área do vendedor (pedaço separado de ~10 KB).
- **Extensão (REU-20):** biblioteca `html-to-image` (1.11.11, versão fixa, MIT) para transformar a
  folha do orçamento em imagem e gerar o PDF como arquivo no navegador (o PDF em si é montado por
  código próprio, `src/vendedor/pdfArquivo.ts`), carregada só na tela do documento. Substitui a
  impressão como caminho principal do "Salvar PDF"; a impressão fica de reserva se a geração falhar.

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
- **Complemento:** vale para o catálogo público. O orçamento montado pelo vendedor
  pode ter preços e descontos definidos por ele (`DEC-018`).
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
  métricas por vendedor, produto e funil. Direção consolidada e aprovada pelo
  responsável humano nesta decisão.
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
  (finalizados e não finalizados) no `localStorage` e um painel de métricas com
  números fictícios fixos somados às ações da demonstração. O painel fica só na tela
  Métricas do admin (`/admin/metricas`); a rota pública `/painel` foi retirada e
  redireciona para lá (pedido do responsável: o painel já aparece no admin).
- **WhatsApp:** "Enviar pelo WhatsApp" abre o WhatsApp real com a mensagem pronta,
  para o número do vendedor da sessão; os vendedores fictícios usam o número da
  empresa, (49) 99110-0096, para não expor telefones inventados.
- **Painel:** rota sem link na navegação, sem login, `noindex`, com selo de
  demonstração e botão para zerar os dados locais.
- **Fora:** atribuição no servidor, carrinho no servidor,
  abandono por tempo, login, LGPD e integrações (`PEND-020` a `PEND-026`).
- **Substitui:** o item "Protótipo" de `DEC-009`. Os vendedores fictícios e o número
  único da empresa foram substituídos pelos vendedores reais de `DEC-022`.

### DEC-011 — Fluxo de atendimento por vendedor e grupo de vendedores

- **Status:** ACEITA como regra do produto definitivo (responsável humano). Não
  precisa estar no protótipo. **Parcialmente substituída por `DEC-017`:** o trecho
  sobre o visitante sem link (contato central e grupo de vendedores) passa a seguir
  o rodízio e a escolha manual de `DEC-017`. O restante continua vigente.
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
- **Decisão:** As artes de promoção recebidas do cliente (`docs/produtos/`)
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
- **Decisão:** Para o protótipo, usar o endereço Av. Corina Caon, 103 – Ponte
  Grande, Lages – SC. O PDF de abril de 2025 traz R. Josefina Amorim, 364; por isso
  rua, número, complemento, bairro, cidade, UF e CEP serão reapresentados ao
  contratante para confirmação (`PEND-028`). WhatsApp
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

### DEC-016 — Publicação pública do protótipo

- **Status:** ACEITA (responsável humano).
- **Decisão:** O protótipo em `mkautoparts.jksoftware.com.br` é acessível ao público,
  sem Cloudflare Access, senha ou lista de identidades. O proxy da Cloudflare fornece
  DNS/CDN/TLS de borda, mas não autentica visitantes.
- **Admin demonstrativo:** `/admin` também é publicamente acessível por URL direta.
  Continua valendo `DEC-015`: qualquer login é aceito, nada persiste e nenhuma ação
  altera o catálogo público.
- **Consequência:** `noindex` permanece em todas as rotas para desencorajar indexação,
  mas não é apresentado como controle de acesso. A origem pode aceitar somente as
  faixas da Cloudflare para impedir acesso direto ao IP sem restringir o público.
- **Limite:** esta decisão vale apenas para o protótipo sem backend ou dados reais; o
  produto definitivo exigirá autenticação e autorização nas áreas administrativas.

### DEC-017 — Cliente do vendedor, rodízio e escolha de vendedor

- **Status:** ACEITA (responsável humano). Regra do produto definitivo; a versão
  seguinte do protótipo a demonstra de forma simulada (`DEC-010`). Os detalhes que
  restam do rodízio estão no fim desta decisão.
- **Contexto:** na MK, cada vendedor tem clientes próprios que só ele atende. Neste
  momento o cliente não tem conta: quem define o vendedor é o link que ele abriu.
- **Decisão:**
  - **Chegou por link de vendedor:** o atendimento fica travado nesse vendedor. O
    site não oferece a escolha de outro vendedor; "Solicitar orçamento" leva ao
    WhatsApp dele. Se o cliente abrir o link de outro vendedor, vale o link aberto
    por último.
  - **Chegou sem link de vendedor:** ao finalizar a lista, "Solicitar orçamento"
    distribui o atendimento por **rodízio**: uma fila circular de vendedores, um
    cliente para cada um na ordem de chegada, e a fila avança a cada pedido.
  - **Escolha manual (só sem link):** no fim da lista, perto do botão de orçar, uma
    seção com foto e nome dos vendedores permite ao cliente escolher um. A escolha
    redireciona ao WhatsApp do vendedor escolhido e **consome a vez** do rodízio.
  - **Fila:** lista ordenada; o primeiro é o da vez. Quem atende um cliente, por
    rodízio ou por escolha, vai para o **fim** da fila. Os demais mantêm a ordem.
    Exemplo: fila A B C D E F; o cliente escolhe D, e a fila vira A B C E F D; outro
    cliente escolhe F, e a fila vira A B C E D F.
- **Substitui:** o trecho de `DEC-011` em que o visitante sem link envia a lista ao
  contato central. O contato central e a IA continuam fora do plano atual.
- **Protótipo:** a fila fica no `localStorage` do navegador, portanto só demonstra a
  sequência; o rodízio real exige servidor para ser compartilhado entre todos os
  visitantes.
- **Fila única, sem prazo e sem cobrança de resposta:** há um só rodízio, com todos os
  vendedores ativos. A atribuição pelo link `?v=` não tem prazo de validade. Vendedor que
  não responde não é responsabilidade do sistema por ora; depois que a equipe se adaptar,
  entra a confirmação de atendimento no painel (`DEC-018`).

### DEC-018 — Painel do vendedor: orçamento, preços, link e documento

- **Status:** ACEITA (responsável humano). Direção do produto definitivo; a versão
  seguinte do protótipo demonstra o painel de forma simulada, sem backend, ampliando
  `DEC-015`.
- **Decisão:** o produto terá um painel **somente para os vendedores**, em rota
  separada da administração do catálogo (`DEC-021`). Nele o vendedor:
  - monta um orçamento (carrinho) com itens específicos para um cliente;
  - define o **preço** de cada item (ou envia sem preço, a critério dele) e pode
    aplicar **desconto**, em valor ou em porcentagem, em itens específicos ou no total.
    O cliente vê o preço antigo riscado, o novo logo abaixo e, ao lado dos dois, a
    porcentagem de desconto;
  - escolhe como encaminhar o orçamento: **link**, **PDF** ou **documento editável**
    (Word), um, dois ou os três;
  - o link abre o orçamento com os itens, os preços e o desconto, atribui a sessão ao
    vendedor e trava a escolha de outro (`DEC-017`). O cliente pode alterar o
    orçamento (quantidades, remover, adicionar produtos) e falar apenas com o vendedor
    dono do link, ou só pedir o orçamento. O PDF e o documento trazem os mesmos dados
    com a identidade da MK Autoparts.
- **Relação com `DEC-008`:** o catálogo público continua sem preço fora de promoção.
  Só o orçamento do vendedor tem preço, digitado por ele.
- **Protótipo:** o link carrega o orçamento na própria URL e os arquivos são gerados
  no navegador. Nada é salvo em servidor. PDF e Word exigem bibliotecas novas, com
  registro conforme `DEC-003`. Na URL o cliente consegue alterar os valores; por isso
  o orçamento só é confiável no produto definitivo, salvo no servidor.
- **Orçamentos ativos e avisos:** o painel lista os orçamentos ativos do vendedor. Quando
  o cliente altera um deles pelo link, o painel mostra o aviso e o que mudou, até o
  vendedor marcar como visto. Por enquanto o aviso é só dentro do painel; WhatsApp, e-mail
  ou som ficam para depois. A demonstração funciona no mesmo navegador (duas abas); entre
  aparelhos o aviso exige servidor.
- **Validade e exclusão do link:** o vendedor define a validade de cada orçamento e pode
  excluir o link a qualquer momento (contratante). Link expirado ou excluído não mostra o
  orçamento.
- **Formatos:** o responsável produz o modelo do PDF e do Word e o coloca no repositório.
  Com um padrão pronto, mostra-se à contratante e pergunta-se o que ela quer que seja
  editável, além do já definido (`PEND-035`). A forma de avisar mudanças é só no painel,
  por enquanto.
- **Depois do uso:** com o sistema adotado pela equipe, um mecanismo de confirmação de
  atendimento no painel do vendedor e o retorno do vendedor sobre a venda (o que foi
  vendido, ou por que não foi concluída). Não faz parte do protótipo nem do primeiro
  produto; também é o caminho para tratar vendedor que não responde, que por ora não é
  responsabilidade do sistema.
- **Fora:** login real, histórico completo, status comerciais e métricas do vendedor
  (produto definitivo, `PEND-023`).

### DEC-019 — Nenhuma quantidade de peças em local público

- **Status:** ACEITA (responsável humano).
- **Decisão:** nenhuma página pública mostra quantidade de peças: nem por marca de
  veículo, categoria ou produto, nem o total do catálogo, nem o contador de resultados
  da busca ou dos filtros, nem números no bloco "Sobre". No lugar dos números do
  "Sobre" entram fatos já confirmados: "Desde 2021", "Envio para todo o Brasil" e
  "Loja em Lages – SC". A faixa de marcas da landing mostra só os nomes. O catálogo mostra apenas os produtos na rolagem ou depois de
  filtrar por categoria.
- **Alcance:** áreas internas (`/admin`, `/painel`, painel do vendedor) podem mostrar
  contagens. A quantidade que o cliente coloca na própria lista não é afetada.

### DEC-020 — Logo principal: selo oficial

- **Status:** ACEITA (responsável humano). Substitui `DEC-014` e a seção "Marca e
  materiais" de `08-frontend-specification.md` no que diz respeito ao logo principal.
- **Decisão:** o logo principal do site, do painel do vendedor e dos documentos é o
  selo oficial pedido pelo contratante: `docs/design/selo-oficial/mk-04-selo-oficial-*.png`
  (512, 1080 e 1600 px), em tamanho adaptado a cada uso. Rodapé, favicons, monograma e
  demais partes continuam como estão, pelo sistema de logotipos v1.1, com a grafia
  "MK Autoparts".
- **Consequência:** o selo é imagem raster circular; o cabeçalho precisa de altura ou
  de uma composição que o acomode, e o monograma (`DEC-014`) deixa de ser o logo do
  cabeçalho no celular se o selo couber. A direção visual (`direcao-visual.md`)
  é ajustada junto com a implementação.

### DEC-021 — Contas: só a equipe da MK

- **Status:** ACEITA (responsável humano).
- **Decisão:** nesta fase o cliente final não tem conta. Só a equipe da MK faz login: o
  **administrador principal** controla quais contas acessam a área do vendedor
  (`/vendedor`) e a administração.
- **Protótipo:** login simulado nas duas áreas (`DEC-015`). O login real, os perfis e as
  permissões entram no produto definitivo (`PEND-023`).

### DEC-022 — Vendedores reais da MK no protótipo

- **Status:** ACEITA (responsável humano). Substitui os vendedores fictícios de
  `DEC-010`.
- **Decisão:** o protótipo usa os oito vendedores da MK com nome e WhatsApp reais,
  autorizados pela contratante (`03-domain-model.md`). Cada vendedor tem o próprio
  link `?v=<código>`, entra no rodízio (`DEC-017`) e recebe o pedido no próprio
  WhatsApp. A foto fica em `frontend/public/img/vendedores/<codigo>.webp`; até chegar,
  aparecem as iniciais.
- **Número da empresa:** (49) 99110-0096 continua nos botões de contato geral (botão
  flutuante com a lista vazia, "Falar no WhatsApp", loja e rodapé), onde não há
  vendedor definido.
- **Consequência:** a base fictícia do painel de métricas (`demo-metricas.ts`) passa a
  usar esses vendedores. O repositório e o site são públicos, mas a contratante
  autorizou o uso dos nomes e números.
- **Nomes:** nome e sobrenome quando houver, só o nome quando for um só; Marcelo e
  Marcelos são pessoas diferentes (contratante).

### DEC-023 — Disponibilidade dos vendedores e horário comercial

- **Status:** ACEITA (contratante, resposta a `PEND-038`). **Substitui** a versão anterior,
  em que o vendedor fora do horário saía do rodízio e da escolha.
- **Decisão:** os vendedores ficam disponíveis de segunda a domingo, a qualquer hora. Não
  há horário por vendedor, ninguém é pulado no rodízio e ninguém some da escolha manual
  (`DEC-017`). O **horário comercial** é único, de segunda a sexta, das 8h às 18h
  (Brasília). Fora dele, o site mostra um aviso de que o tempo de resposta dos vendedores
  é indeterminado.
- **Consequências:** não existe caso de "todos indisponíveis"; o cliente que chegou pelo
  link de um vendedor segue com ele, com o mesmo aviso; folga e férias não são
  controladas pelo site.
- **Protótipo:** o horário comercial é uma constante de configuração, sem edição no admin.
  Feriados não foram citados e não são tratados.

### DEC-024 — Hero com mosaico de produtos

- **Status:** ACEITA (responsável humano). Altera a direção visual aprovada
  (`frontend/design/direcao-visual.md`) no hero.
- **Decisão:** a landing deixa de usar a foto do caminhão no hero. No lugar entra uma
  **imagem de fundo com um mosaico de peças para caminhão**, em toda a área do hero, por
  trás do texto, da busca e dos botões (referência: `docs/design/MosaicoSubstituicao.jpg`).
- **Imagem:** ilustrativa, gerada por IA a pedido do responsável
  (`docs/design/MosaicoProdutos.png`, 1672 × 941), reduzida a 68 % e ancorada à direita numa
  tela 2400 × 1350 com fundo desfocado e escurecido (`MosaicoProdutos-hero-2400.png`), para
  as peças não ficarem grandes demais. Mostra peças do mesmo contexto e das mesmas
  categorias do catálogo, não os produtos do estoque; por isso não é usada como foto de
  produto em nenhum outro lugar. Sem texto, preço, quantidade (`RN-14`) ou logos. A imagem
  não é clicável.
- **Composição:** no desktop, o mosaico fica ao fundo de todo o hero, com véu marinho à
  esquerda e sombra radial atrás do texto para o contraste. No celular, um recorte próprio do
  mosaico (peças inteiras) vira uma **vitrine nítida no topo** do hero, que desvanece para o
  marinho onde começa o título; o texto fica sobre fundo limpo e o hero tem a altura do
  conteúdo (revisão impeccable: em tela cheia o mosaico ficava ampliado e borrado atrás do
  texto). Versões em `frontend/public/img/hero/mosaico-{800,1280,1672,2400}.jpg` (desktop; fonte atual: `Mosaico_Neon_de_Iluminacao_Automotiva-v2.png`, reduzida a 68 % e ancorada à direita, com parallax na rolagem) e
  `vitrine-{640,960}.jpg` (celular), com preload por `media` no `index.html`.
- **Alcance:** vale só para o hero (confirmado pelo responsável). O topo do catálogo e os
  cartões de categoria seguem com a foto do caminhão.
- **Consequência:** Lighthouse no celular (`RNF-05`) conferido depois da troca.

### DEC-025 — Documento do orçamento no modelo novo da MK

- **Contexto:** a MK pediu campos novos no documento do orçamento, a partir de um orçamento de
  fornecedor que ela usa. O responsável entregou a especificação, o exemplo em PDF e Word, o
  contrato de dados e o cálculo de referência (`docs/pfd-regras/MKautoparts/`, fora do Git:
  traz um orçamento real com dados de terceiros).
- **Decisão:** o documento passa a ter código de venda, cliente PJ ou PF, entrega e pagamento,
  Nº compatível, unidade, IPI e ST por item, frete, impostos (dedução), cubagem e pesos, com o
  cálculo de `orcamento_modelo.py` (desconto no total rateado antes do IPI; total = produtos +
  IPI + ST + frete − impostos), em aritmética decimal.
- **Escolhas do responsável nesta implementação:** o **CNPJ da MK passa a sair no rodapé do
  documento** (só no documento; o rodapé do site segue sem CNPJ); o **cliente é obrigatório**
  (razão social ou nome); o **link não leva dados pessoais do cliente** (a URL fica no
  histórico do WhatsApp e nos logs do servidor), mas leva todos os valores, para os totais
  serem iguais aos do PDF.
- **Comportamento de demonstração (a confirmar com a MK, `PEND-035`):** desconto no total
  rateado antes do IPI (muda a base do IPI); ST somado depois do IPI; IPI, ST, peso e medidas
  digitados no orçamento (o catálogo não tem); código de venda digitado pelo vendedor;
  sem numeração de página; PDF pela impressão do navegador (sem servidor, `DEC-001`), com o
  rodapé nas caixas de margem da página (Chrome e Edge).

### DEC-026 — Melhorias da próxima reunião: busca por ano, compartilhar, QR e vigência

- **Status:** ACEITA (responsável humano). Escopo das melhorias M1 a M7 revisado: M1, M3, M4 e
  M5 aplicadas; M2 (lembrar o caminhão do cliente) fica para o futuro; M6 já existia
  (`/vendedor/documento`); M7 não é necessária (o vendedor já edita o orçamento).
- **M1 — Busca por veículo com ano:** o catálogo filtra por marca, modelo e **ano**
  (`?ano=`, só com a marca escolhida). Com ano, aparecem **primeiro** as peças cujo período
  cadastrado cobre o ano e, **depois**, as peças sem ano cadastrado, marcadas com um asterisco
  amarelo cuja dica diz "Ano não cadastrado no sistema" (e uma nota acima da grade). Peças cujo
  período cadastrado exclui o ano saem. A landing ganha o bloco "Buscar pelo veículo" (marca →
  modelo → ano → "Ver peças") na faixa de marcas.
- **M3 — Compartilhar com meu link:** com o vendedor logado em `/vendedor` (sessão da aba), o
  produto e o catálogo (com busca e filtros) mostram "Compartilhar com meu link", que gera a
  página com o `?v=` dele (`DEC-017`). No celular abre o compartilhamento do aparelho; no
  computador copia. O cliente comum nunca vê o botão. Os cartões de categoria da landing não
  têm o botão (são links; o catálogo filtrado pela categoria cobre o caso).
  **Simulação:** a "sessão" é a aba em que o vendedor escolheu o nome em `/vendedor`, sem
  senha. No produto definitivo, há login real só para a equipe da MK (`DEC-021`) e cada perfil
  logado vê funções próprias ao navegar pelo catálogo (o vendedor, "Compartilhar com meu
  link"); sem login, nenhuma dessas funções aparece.
- **M4 — QR Code:** a área do vendedor mostra "Meu link e QR Code": o link pessoal, compartilhar,
  copiar, o QR (marinho sobre branco), baixar a imagem (PNG com nome e "MK Autoparts") e
  imprimir. Biblioteca registrada em `DEC-003`.
- **M5 — Promoção com início e fim opcionais:** `promocao.inicio` e `promocao.fim`
  (AAAA-MM-DD, Brasília). Sem datas, vale sempre. Antes do início fica "Agendada", depois do fim
  "Encerrada" (o dia do fim ainda vale); fora do período o site mostra o produto sem preço e sem
  a arte. O admin de demonstração edita as datas e mostra a situação. Nenhuma data foi inventada
  nos dados; a regra final depende de `PEND-004`.

### DEC-027 — Pedidos da reunião de validação: enviar o PDF, exportar a foto e colar a foto

- **Status:** APROVADA pelo responsável (protótipo).
- **Contexto:** Na reunião de validação, a MK pediu: mandar o PDF do orçamento para quem quiser
  sem baixar e procurar o arquivo; exportar a foto do produto (os vendedores fazem muito isso);
  trocar a foto do produto copiando a imagem e colando (Ctrl+V).
- **Tela "Orçamento pronto":** a primeira ação é "PDF e Word"; as ações do link (enviar ao
  cliente, copiar e abrir) ficam em "Gerenciar link", fechado até o vendedor clicar.
- **PDF arrastável (REU-20):** ao abrir o documento, o PDF é gerado em segundo plano. Um selo
  amarelo diz que está preparando; pronto, fica verde e orienta usar "Enviar PDF" ou arrastar
  para uma pasta. "Enviar PDF" abre o compartilhamento do aparelho (celular e Windows, com o
  WhatsApp do computador; testado pelo responsável); sem ele, baixa o arquivo. A prévia e a ficha
  com o nome do arquivo podem ser arrastadas como arquivo só para a área de trabalho e pastas
  (Chrome e Edge): o navegador não entrega o arquivo a outros apps nem a outra aba. Por isso, no
  computador, o PDF pronto **baixa sozinho** (uma vez por versão do orçamento; o vendedor pode
  desligar em "Baixar o PDF automaticamente ao abrir", guardado no navegador) e o selo orienta a
  arrastar o arquivo do painel de downloads do navegador para a conversa: um arquivo baixado vai
  para qualquer app ou aba. No protótipo o arquivo é PDF; no PDF o texto é imagem (não
  selecionável). **Sistema definitivo:** o PDF sai do servidor e o perfil do usuário (vendedor ou
  admin) define se, ao abrir o documento, ele já baixa em PDF, em Word ou não baixa.
- **Exportar foto (REU-21):** no produto, "Exportar foto" abre uma janela com a imagem do produto
  (foto, nome, códigos, logo da MK, preço opcional e o contato: vendedor logado, senão o vendedor do
  link, senão o WhatsApp da MK). No protótipo aparece para todos; no sistema definitivo, só para
  quem estiver logado com conta da MK (admin, vendedor). Com o mesmo selo amarelo/verde, o vendedor arrasta a
  imagem para a conversa, compartilha (celular), copia (Ctrl+V no WhatsApp do computador) ou baixa.
  Gerada no navegador, sem biblioteca.
- **Atalho para o site:** a área do vendedor tem "Ver o site" no cabeçalho e "Voltar para o site"
  na escolha do vendedor, na mesma aba (a sessão do vendedor continua ao navegar pelo site).
- **Colar a foto (REU-22):** no admin de demonstração, clicar na foto do produto (na lista ou no
  cadastro) e colar (Ctrl+V) troca a foto; arrastar um arquivo para cima também. No celular segue
  "Trocar foto". Como o resto do admin, a troca vale só na sessão.
