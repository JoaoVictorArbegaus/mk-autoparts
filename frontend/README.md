# MK Autoparts — protótipo (landing + catálogo + painel)

Protótipo de apresentação, somente frontend (`DEC-001`). Direção visual: opção A,
"Cromado na pista" (`design/direcao-visual.md`).

## Stack (fixa, `DEC-002`/`DEC-003`)

- Vite 8 + React 19 + TypeScript 7, CSS próprio em `src/styles/` (sem Tailwind).
- Motion (`motion/react`, sempre `m.*` em `LazyMotion` strict + `MotionConfig reducedMotion="user"`).
- Lenis (`lenis/react`), desligado com movimento reduzido.
- Roteamento próprio com a History API (`src/router/`), sem biblioteca.
- Pré-renderização no build sem biblioteca extra: `src/entry-server.tsx` + `scripts/prerender.mjs`
  geram `dist/index.html`, `dist/catalogo/`, `dist/produto/<slug>/` (cada produto ativo),
  `dist/painel/` e `dist/404.html`. A validação dos dados roda no prerender e falha o build.
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
| `src/components/` | Cabeçalho, rodapé, card, lista de orçamento, gráficos, botões, ícones, primitivas de animação |
| `src/components/landing/` | Seções da landing |
| `src/components/fundos/` | Fundos animados (canvas/WebGL) |
| `src/styles/` | `base.css` (tokens), `componentes.css`, `landing.css`, `paginas.css` |
| `public/img/` | Imagens WebP (`produtos/`, `promocoes/`, `loja/`, `marca/`) |
| `design/` | Briefing, opções e contrato visual, referências, originais do cliente |
| `design/recortes-pdf/` | Recortes PNG das peças extraídos do PDF (fonte das versões WebP) |

## Simulação (demonstração)

- Link de vendedor: `/?v=joao`, `/?v=maria`, `/?v=carlos` (todos com o WhatsApp da empresa).
- Painel: `/painel` (fora do menu, `noindex`), com "Zerar dados da demonstração".

## Origem dos componentes reaproveitados

- `components/fundos/Aurora.tsx`, `DotField.tsx`, `Topo.tsx`, `components/CountUp.tsx`,
  `SplitTitle.tsx`, `Motion.tsx`: copiados de `landing-pages/clientes/prime-padel-platform`
  (adaptações de React Bits e kokonutui, licença MIT, créditos no topo de cada arquivo).
- Emenda em onda (`components/Emenda.tsx` + `.emenda` em `base.css`): adaptada da `WaveSeam`
  da KiProdutos.
- Padrões da KiProdutos (query de catálogo, lista com revalidação) serviram de referência; o
  código daqui foi escrito para as regras da MK (sem preço fora de promoção, lados LD/LE,
  vendedor da sessão).
