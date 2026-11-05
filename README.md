# MK Autoparts — Catálogo online (protótipo)

Protótipo de landing page com catálogo online para a MK Autoparts, loja de
autopeças em Lages – SC que importa, exporta e distribui peças e acessórios para
caminhões, com envio para todo o Brasil. Hoje os vendedores enviam um PDF de
produtos e imagens de promoção pelo WhatsApp; o catálogo online substitui esse
fluxo. O produto definitivo terá link por vendedor e métricas (`DEC-009`).

Fase atual: **protótipo de apresentação**, somente frontend, com produtos
pré-cadastrados em arquivo estático. Sem backend.

## Onde fica cada coisa

| Caminho | Conteúdo |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | Regras para agentes de IA |
| `SESSION.md` | Estado atual para retomar o trabalho |
| `TASKS.md` | Tarefas ativas |
| `sdd_kit/` | Especificação (SDD) e decisões |
| `docs/client-questions.md` | Dúvidas abertas para o cliente |
| `docs/fontes/` | Documentos recebidos (rascunho de regras, dados da empresa), guardados como vieram |
| `frontend/` | Projeto do frontend (Vite + React + TypeScript, criado na PROTO-03) |
| `frontend/design/briefing.md` | Briefing do cliente |
| `frontend/design/referencias/` | **Imagens de referência visual** (qualquer nome/extensão) + `notas.md` |
| `frontend/design/originais/logo/` | Logo da MK Autoparts (SVG ou PNG transparente) |
| `frontend/design/originais/fotos/` | Fotos da empresa (galpão, estoque, equipe, caminhões) |
| `frontend/design/originais/produtos/` | Fotos de produtos |
| `frontend/design/originais/catalogo-pdf/` | PDF de produtos que o cliente envia hoje |

## Fora do repositório

O repositório é público. O material bruto do cliente fica só na máquina de trabalho e não é
versionado: `frontend/design/originais/` (PDF do catálogo, fotos, artes de promoção e
sistema de logotipos), `frontend/design/recortes-pdf/` e `docs/fontes/` (documentos
recebidos). O site usa as versões otimizadas em `frontend/public/img/`. As junções de
`.claude/` para o landing-pages também são locais.

## Frontend

O frontend é feito com o agente `gerador-landing` e as skills `ui-ux-pro-max`,
`design-taste-frontend` e `impeccable` de `D:\IntelliJ\Workspace\landing-pages`.
Comandos (`npm install`, `npm run dev`, `npm run build`, `npm run preview`) passam a
valer quando o projeto for criado em `frontend/`.
