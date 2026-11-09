# MK Autoparts — Catálogo online (protótipo)

Protótipo de landing page com catálogo online para a MK Autoparts, loja de
autopeças em Lages – SC que importa, exporta e distribui peças e acessórios para
caminhões, com envio para todo o Brasil. Hoje os vendedores enviam um PDF de
produtos e imagens de promoção pelo WhatsApp; o catálogo online substitui esse
fluxo. O produto definitivo terá link por vendedor e métricas (`DEC-009`).

Fase atual: **protótipo de apresentação**, somente frontend, com produtos
pré-cadastrados em arquivo estático. Sem backend. O `/admin` existente é uma
demonstração visual: não salva nem altera o catálogo público (`DEC-015`).

Publicação temporária: <https://mkautoparts.jksoftware.com.br>. O protótipo é
público, usa `noindex` e não exige autenticação (`DEC-016`).

## Onde fica cada coisa

| Caminho | Conteúdo |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | Regras para agentes de IA |
| `SESSION.md` | Estado atual para retomar o trabalho |
| `TASKS.md` | Tarefas ativas |
| `sdd_kit/` | Especificação (SDD) e decisões |
| `docs/client-questions.md` | Dúvidas abertas para o cliente |
| `docs/planejamento-funcionalidades.md` | Ideias, prioridades e dependências ainda não aprovadas |
| `docs/deploy-vps.md` | Preparação e checklist para publicação temporária em VPS |
| `deploy/vps/` | Pacote operacional da VPS: release, Compose, Nginx, TLS e rollback |
| `docs/fontes/` | Documentos recebidos (rascunho de regras, dados da empresa), guardados como vieram |
| `docs/reuniao/` | Fontes e PDFs de apresentação e validação preparados para a reunião |
| `frontend/` | Protótipo implementado em Vite + React + TypeScript |
| `frontend/design/briefing.md` | Briefing do cliente |
| `frontend/design/referencias/` | **Imagens de referência visual** (qualquer nome/extensão) + `notas.md` |
| `docs/design/` | Sistema de marca e arquivos de identidade visual recebidos |
| `docs/produtos/` | PDF do catálogo e imagens recebidas do cliente |

## Fora do repositório

O repositório é público. O material bruto recebido do cliente fica apenas na
máquina de trabalho, em `docs/design/`, `docs/produtos/` e `docs/fontes/`, todos
ignorados pelo Git. Esses arquivos são fontes e não devem ser editados para
representar decisões do produto; as regras vigentes ficam no SDD. O site usa as
versões otimizadas em `frontend/public/img/`. As junções de `.claude/` para o
landing-pages também são locais.

## Frontend

O frontend é feito com o agente `gerador-landing` e as skills `ui-ux-pro-max`,
`design-taste-frontend` e `impeccable` de `D:\IntelliJ\Workspace\landing-pages`.
O projeto está implementado em `frontend/`. Comandos principais: `npm install`,
`npm run dev`, `npm test`, `npm run build` e `npm run preview`. Para o container:
`cp .env.example .env && docker compose up -d --build` em `frontend/`.
