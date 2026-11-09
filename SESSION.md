# SESSION.md — Estado atual para continuidade

Este arquivo é um snapshot mutável, não um histórico. Requisitos e decisões
pertencem ao `sdd_kit/`.

## Baseline

- Fase de protótipo de apresentação (`DEC-001`): somente frontend, dados estáticos.
- Direção visual aprovada: opção A, "Cromado na pista" (`frontend/design/direcao-visual.md`,
  contrato completo, com a seção Acabamento preenchida).
- Protótipo construído em `frontend/` (Vite + React + TS, CSS próprio, Motion, Lenis,
  roteador próprio, pré-renderização): landing, `/catalogo`, `/produto/<slug>` (76),
  lista de orçamento, `/painel`, sete rotas de `/admin/*` e 404. Ver `frontend/README.md`.
- Na última validação completa, `npm run build` passou (typecheck, build, SSR,
  pré-renderização de 86 rotas + 404 e validação dos dados) e `npm test` passou
  (28 testes das regras puras).
- Rodada de ajustes da landing aplicada: hero com a foto do caminhão
  (`public/img/hero/`), emendas em corte inclinado com filete azul (no lugar da onda),
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
- Imagens de uso no site em `frontend/public/img/` (hero e categorias em JPEG). Os
  materiais recebidos ficam em `docs/produtos/` e `docs/design/`. Fotos da loja foram
  recortadas sem a interface do Instagram, com placas de veículos e logos de
  fornecedores desfocados.
- Repositório Git público: https://github.com/JoaoVictorArbegaus/mk-autoparts (branch
  `main`). Material bruto do cliente, referências e `.claude/` ficam fora (`.gitignore`).

## Trabalho ativo

- PROTO-05: Lighthouse no celular (`RNF-05`) e roteiro de apresentação.
- PROTO-06: placeholders e frases das artes aguardando o cliente.
- DOC-01: fontes Markdown e PDFs de apresentação/validação em `docs/reuniao/`
  aguardam revisão do responsável e do sócio. Planejamento consolidado em
  `docs/planejamento-funcionalidades.md`.

## Continuidade

- Vendedores fictícios: `?v=joao`, `?v=maria`, `?v=carlos` (WhatsApp da empresa).
- Paleta dos gráficos do painel: `#1C4FD0` e `#EB6834` (validada pela skill `dataviz`).
- Ignore do detector do impeccable: `gradient-text` só em `landing.css` (cromado
  aprovado), em `.impeccable/config.json` (glob `**/styles/landing.css`).
- Destaques das categorias são desenhados em SVG; se o cliente quiser mais realismo,
  trocar por 6 edições da IA sobre `base.png` (prompts na conversa de ajustes) mantendo
  o mesmo cartão e zoom.
- JS principal: ~151 KB gzip (React, Motion, Lenis, dados e painel no mesmo bundle);
  dividir o painel em outro chunk é a primeira otimização se o Lighthouse pedir.
- Frases das artes ("peças originais", "grande variedade", "atendimento
  especializado") não entram no texto do site até confirmação.
- Planejamento atual prioriza funil comercial, métricas reais, painel do vendedor,
  administração e permissões, busca por veículo, promoções programadas e PDF
  automático. IA e WhatsApp Business API estão fora do plano atual.
- Agente `gerador-landing`, skills e hook do impeccable ligados por junções em `.claude/`
  (ver `AGENTS.md`); não editar os arquivos por elas.
