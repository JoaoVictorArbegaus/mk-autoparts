# MK Autoparts — protótipo (landing + catálogo + painel + admin demonstrativo)

Protótipo de apresentação, somente frontend (`DEC-001`). Direção visual: opção A,
"Cromado na pista" (`design/direcao-visual.md`).

## Stack (fixa, `DEC-002`/`DEC-003`)

- Vite 8 + React 19 + TypeScript 7, CSS próprio em `src/styles/` (sem Tailwind).
- Motion (`motion/react`, sempre `m.*` em `LazyMotion` strict + `MotionConfig reducedMotion="user"`).
- Lenis (`lenis/react`), desligado com movimento reduzido.
- Roteamento próprio com a History API (`src/router/`), sem biblioteca.
- Pré-renderização no build sem biblioteca extra: `src/entry-server.tsx` + `scripts/prerender.mjs`
  geram `dist/index.html`, `dist/catalogo/`, `dist/produto/<slug>/` (cada produto ativo),
  `dist/painel/`, as sete rotas de `/admin/*` e `dist/404.html`. Com os 76 produtos
  atuais, são 86 rotas mais a página 404. A validação dos dados roda no prerender e
  falha o build.
- Vitest só para as regras puras (busca, filtros, lista, mensagem do WhatsApp, carrinhos, métricas).
- Versões exatas no `package.json`.

## Comandos

```bash
npm install
npm run dev       # http://127.0.0.1:5173
npm test          # testes das regras puras
npm run build     # typecheck + build + SSR + pré-renderização (+ validação dos dados)
npm run preview   # serve o dist/ (http://127.0.0.1:4173)
```

## Docker e VPS temporária

```bash
cp .env.example .env
docker compose config
docker compose up -d --build
docker compose ps
```

O padrão expõe o site apenas em `127.0.0.1:8084`, para uso atrás de proxy reverso
com HTTPS e proteção por senha/IP. `SITE_URL` em `.env` define canonical, Open Graph
e JSON-LD no build. O roteiro completo está em `../docs/deploy-vps.md`.

## Onde fica cada coisa

| Caminho | Conteúdo |
| --- | --- |
| `index.html` | `<head>` base (fontes, favicons, preload da arte do hero); `<!--app-head-->` recebe título, descrição, OG, canonical e JSON-LD de cada rota |
| `src/seo.ts` | Metadados por rota (usados no prerender e na navegação) |
| `src/content/site.ts` | Todos os textos, contatos, horário e o helper `whatsapp(numero, mensagem)` |
| `src/content/produtos.ts`, `categorias.ts`, `montadoras.ts`, `tipos.ts` | Dados transcritos do PDF (não editar a estrutura) |
| `src/content/catalogo.ts` | Acesso, busca normalizada, filtros na URL, ordenação (funções puras) |
| `src/content/imagens.ts` | Dimensões reais das fotos WebP (gerado) |
| `src/content/vendedores.ts`, `demo-metricas.ts` | Vendedores e base do painel FICTÍCIOS (`DEC-010`) |
| `src/content/validar.ts` | Validação dos dados (`03-domain-model.md`) |
| `src/orcamento/` | Regras da lista (`lista.ts`) e contexto React com persistência |
| `src/rastreio/` | Vendedor da sessão, eventos, carrinhos e métricas no `localStorage` |
| `src/router/` | Roteador (rotas, `Link`, rolagem e foco) |
| `src/pages/` | Landing, Catálogo, Produto, Painel, 404 |
| `src/admin/` | Admin de demonstração: login, produtos, promoções, vendedores e métricas |
| `src/components/` | Cabeçalho, rodapé, card, lista de orçamento, gráficos, botões, ícones, primitivas de animação |
| `src/components/landing/` | Seções da landing |
| `src/components/fundos/` | Fundos animados (canvas/WebGL) |
| `src/styles/` | `base.css` (tokens), `componentes.css`, `landing.css`, `paginas.css` |
| `public/img/` | Imagens WebP (`produtos/`, `promocoes/`, `loja/`, `marca/`) |
| `design/` | Briefing, opções e contrato visual, referências, originais do cliente |
| `../docs/produtos/` | PDF e imagens recebidas do cliente (fontes; não editar) |
| `../docs/design/` | Sistema de marca recebido (fonte; não editar) |

## Simulação (demonstração)

- Link de vendedor: `/?v=joao`, `/?v=maria`, `/?v=carlos` (todos com o WhatsApp da empresa).
- Painel: `/painel` (fora do menu, `noindex`), com "Zerar dados da demonstração".
- Admin: `/admin` (fora do menu, `noindex`); aceita qualquer usuário e senha. As
  edições existem só na memória da página e desaparecem ao recarregar.

## Origem dos componentes reaproveitados

- `components/fundos/Aurora.tsx`, `DotField.tsx`, `Topo.tsx`, `components/CountUp.tsx`,
  `SplitTitle.tsx`, `Motion.tsx`: copiados de `landing-pages/clientes/prime-padel-platform`
  (adaptações de React Bits e kokonutui, licença MIT, créditos no topo de cada arquivo).
- Emenda em onda (`components/Emenda.tsx` + `.emenda` em `base.css`): adaptada da `WaveSeam`
  da KiProdutos.
- Padrões da KiProdutos (query de catálogo, lista com revalidação) serviram de referência; o
  código daqui foi escrito para as regras da MK (sem preço fora de promoção, lados LD/LE,
  vendedor da sessão).
