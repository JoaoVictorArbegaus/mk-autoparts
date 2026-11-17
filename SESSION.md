# SESSION.md — Estado atual para continuidade

Este arquivo é um snapshot mutável, não um histórico. Requisitos e decisões
pertencem ao `sdd_kit/`.

## Baseline

- Fase de protótipo de apresentação (`DEC-001`): somente frontend, dados estáticos.
- Direção visual aprovada: opção A, "Cromado na pista" (`frontend/design/direcao-visual.md`,
  contrato completo, com a seção Acabamento preenchida).
- Protótipo construído em `frontend/` (Vite + React + TS, CSS próprio, Motion, Lenis,
  roteador próprio, pré-renderização): landing, `/catalogo`, `/produto/<slug>` (76),
  lista de orçamento, sete rotas de `/admin/*` (métricas em `/admin/metricas`; `/painel` redireciona) e 404. Ver `frontend/README.md`.
- Na última validação completa, `npm run build` passou (typecheck, build, SSR,
  pré-renderização de 85 rotas + 404 e validação dos dados) e `npm test` passou
  (30 testes das regras puras).
- Rodada de ajustes da landing aplicada: hero com mosaico de peças ao fundo
  (`public/img/hero/mosaico-*.jpg`, `DEC-024`), emendas em corte inclinado com filete azul (no lugar da onda, definitivo),
  categorias em cartões marinho com a foto base do caminhão e peças destacadas em SVG
  com zoom por categoria (`public/img/categorias/`), Promoções só com as artes,
  fotos do estoque em largura total, promoções primeiro no catálogo e chips de
  categoria sem corte. Promoções com linhas de velocidade + aurora (Lightfall testado e
  descartado), mapa do Google embutido na seção Loja e foto do caminhão
  também no topo do catálogo.
- Admin de demonstração (`DEC-015`) em `/admin` (login simulado; Produtos, Promoções,
  Vendedores, Métricas), código em `frontend/src/admin/` e `styles/admin.css`. Só visual: edições
  ficam na memória da sessão do admin e não alteram o site.
- Docker: `frontend/docker-compose.yml` (nginx, porta 8084): `docker compose up -d --build`
  em `frontend/`.
- Publicação ativa em `https://mkautoparts.jksoftware.com.br`, pública e sem
  Cloudflare Access (`DEC-016`). Release `65e611cc3dd0` em Compose/rede isolados,
  atrás do Nginx central e proxy Cloudflare; TLS `Strict`, renovação simulada e origem
  restrita às faixas oficiais da Cloudflare. Smoke público aprovado nas rotas
  principais e 404; Chrome desktop/celular sem mensagens de console ou rolagem
  horizontal. Runbook e rollback em `deploy/vps/`.
- Imagens de uso no site em `frontend/public/img/` (hero e categorias em JPEG). Os
  materiais recebidos ficam em `docs/produtos/` e `docs/design/`. Fotos da loja foram
  recortadas sem a interface do Instagram, com placas de veículos e logos de
  fornecedores desfocados.
- Repositório público `github.com/JoaoVictorArbegaus/mk-autoparts` (`main`); material bruto do cliente e `.claude/` ficam fora.

## Trabalho ativo

- Próxima reunião: aplicar as mudanças pedidas pela MK (hero com mosaico de produtos no
  lugar do caminhão, atendimento travado por link,
  rodízio, escolha de vendedor, painel `/vendedor` com preço, desconto, link, PDF e Word,
  sem quantidades públicas, selo como logo principal, melhorias M1 a M7). Regras em
  `DEC-017` a `DEC-021`; plano em `docs/planejamento-proxima-reuniao.md`; tarefas `REU-*`
  em `TASKS.md`.
- **Aviso ao sócio: a `feat/proxima-reuniao` foi mesclada em `main`** (a pedido do
  responsável) e o trabalho segue direto em `main`. A **próxima publicação na VPS a partir
  de `main` já leva as mudanças da próxima reunião**; se a VPS precisar ficar na versão
  anterior até a reunião, publique a partir do commit `977be13` ou combine antes. A branch
  `feat/proxima-reuniao` ficou no GitHub, apontando para um commit já contido em `main`, e
  pode ser apagada.
- Feito: REU-07 (sem quantidades públicas; `CountUp` removido), REU-08 no cabeçalho e no
  admin (`selo-64/128.webp`), REU-15 (mosaico no hero; no celular, vitrine nítida no topo
  com recorte próprio `vitrine-{640,960}.jpg`, que encolhe com a altura da tela para o
  hero caber inteiro). Também em `main`: faixa de marcas sem botão de pausa, trilhos de
  categorias e promoções sem cartões repetidos (vão até o fim e voltam), botão flutuante
  do WhatsApp escondido enquanto o hero está na tela. Para retomar: em `frontend/`,
  `npm ci` e `npm run dev` (http://127.0.0.1:5173/) ou `docker compose up -d --build`
  (http://127.0.0.1:8084/). Próximo sugerido: REU-01 a REU-03 (REU-11 feita, menos as fotos).
- No Windows, rode os testes com o caminho em `D:\` maiúsculo: com `d:\` o Vitest falha
  com "Cannot read properties of undefined (reading 'config')" sem relação com o código.
- Vendedores reais (`DEC-022`): oito, com nomes e WhatsApps em `sdd_kit/03-domain-model.md`
  (autorizados pela contratante; nono dígito já incluído). Fotos em
  `frontend/public/img/vendedores/<codigo>.webp`. Disponibilidade: todos, de segunda a domingo; aviso
  fora do horário comercial (`DEC-023`). Nomes confirmados (nome e sobrenome quando houver).
  Documento do orçamento: o responsável produz o modelo e o coloca no repositório
  (`PEND-035`); validade definida pelo vendedor, que também exclui o link.
- PROTO-05: Lighthouse no celular (`RNF-05`) e roteiro de apresentação.
- PROTO-06: placeholders e frases das artes aguardando o cliente.
- DOC-01: fontes Markdown, PDFs e roteiro TXT para o Notas do iPhone em
  `docs/reuniao/` aguardam revisão. Planejamento consolidado em
  `docs/planejamento-funcionalidades.md`.

## Continuidade

- Fontes do mosaico (`docs/design/MosaicoProdutos.png`, composição
  `MosaicoProdutos-hero-2400.png` com escala 68 % e folha `docs/design/referencias-mosaico/`)
  ficam só na máquina do responsável (`docs/design/` é ignorado); o site usa os JPGs.
- Vendedores reais no código (REU-11): `?v=daniel`, `luiz`, `marcelo`, `marcelos`, `mauricio`, `silvio`, `taine`, `vitor`; base do painel regerada para eles; fotos ainda não chegaram (iniciais).
- Paleta dos gráficos do painel: `#1C4FD0` e `#EB6834` (validada pela skill `dataviz`).
- Ignore do detector do impeccable: `gradient-text` só em `landing.css` (cromado
  aprovado), em `.impeccable/config.json` (glob `**/styles/landing.css`).
- Destaques das categorias são desenhados em SVG; se o cliente quiser mais realismo,
  trocar por 6 edições da IA sobre `base.png` (prompts na conversa de ajustes) mantendo
  o mesmo cartão e zoom.
- JS principal: ~139 KB gzip (React, Motion, Lenis, dados). Catálogo, produto, painel e
  admin em arquivos separados (lazy; pré-render com `prerender` do React), CSS embutido no
  HTML e fontes locais. Lighthouse no celular registrado na PROTO-05.
- Frases das artes ("peças originais", "grande variedade", "atendimento
  especializado") não entram no texto do site até confirmação.
- Planejamento atual prioriza funil comercial, métricas reais, painel do vendedor,
  administração e permissões, busca por veículo, promoções programadas e PDF
  automático. IA e WhatsApp Business API estão fora do plano atual.
- Agente `gerador-landing`, skills e hook do impeccable ligados por junções em `.claude/`
  (ver `AGENTS.md`); não editar os arquivos por elas.
