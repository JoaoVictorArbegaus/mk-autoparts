# SESSION.md — Estado atual para continuidade

Este arquivo é um snapshot mutável, não um histórico. Requisitos e decisões
pertencem ao `sdd_kit/`.

## Baseline

- Fase de protótipo de apresentação (`DEC-001`): somente frontend, dados estáticos.
- Direção visual aprovada: opção A, "Cromado na pista" (`frontend/design/direcao-visual.md`,
  contrato completo, com a seção Acabamento preenchida).
- Protótipo construído em `frontend/` (Vite + React + TS, CSS próprio, Motion, Lenis,
  roteador próprio, pré-renderização): landing, `/catalogo`, `/produto/<slug>` (76),
  lista de orçamento, `/painel` (simulação `DEC-010`) e 404. Ver `frontend/README.md`.
- `npm run build` passa (typecheck, build, SSR, pré-renderização de 79 rotas + 404 e
  validação dos dados); `npm test` passa (28 testes das regras puras).
- Rodada de ajustes da landing aplicada: hero com a foto do caminhão
  (`public/img/hero/`), emendas em corte inclinado com filete azul (no lugar da onda),
  categorias em cartões marinho com a foto base do caminhão e peças destacadas em SVG
  com zoom por categoria (`originais/categorias/base.png`), Promoções só com as artes,
  fotos do estoque em largura total, promoções primeiro no catálogo e chips de
  categoria sem corte. Promoções com linhas de velocidade + aurora (Lightfall testado e
  descartado), mapa do Google embutido na seção Loja e foto do caminhão
  também no topo do catálogo.
- Admin de demonstração (`DEC-015`) em `/admin` (login simulado; Produtos, Promoções,
  Vendedores, Métricas), código em `frontend/src/admin/` e `styles/admin.css`. Só visual: edições
  ficam na memória da sessão do admin e não alteram o site.
- Docker: `frontend/docker-compose.yml` (nginx, porta 8084): `docker compose up -d --build`
  em `frontend/`.
- Imagens em WebP em `frontend/public/img/` (hero e categorias em JPEG); recortes PNG do PDF movidos para
  `frontend/design/recortes-pdf/` (fonte para regerar). Fotos da loja recortadas (sem a
  interface do Instagram) e com placas de veículos e logos de fornecedores desfocados.
- Não há repositório Git.

## Trabalho ativo

- PROTO-05: Lighthouse no celular (`RNF-05`) e roteiro de apresentação.
- PROTO-06: placeholders e frases das artes aguardando o cliente.

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
- Agente `gerador-landing`, skills e hook do impeccable ligados por junções em `.claude/`
  (ver `AGENTS.md`); não editar os arquivos por elas.
