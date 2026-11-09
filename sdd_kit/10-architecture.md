# 10 — Arquitetura

## Protótipo

Aplicação estática: Vite + React + TypeScript, pré-renderizada no build, sem
servidor de aplicação. Saída em `frontend/dist/`, servível por qualquer hospedagem
estática.

```text
src/content/*.ts  ──►  src/content/catalogo.ts (acesso, busca, filtro — funções puras)
                                │
                                ▼
            src/pages/*  ◄──  src/router/ (History API)
                                │
                                ▼
                 src/orcamento/ (contexto + localStorage)
```

## Limites

- Componentes nunca importam os arrays de dados diretamente: usam as funções de
  `catalogo.ts`. É o ponto de troca pela API no produto definitivo.
- Busca, filtros e ordenação são funções puras, testáveis sem DOM.
- A lista de orçamento conhece só `{ slug, quantidade }` e consulta o catálogo para
  nome, código e imagem.
- O número de destino do WhatsApp vem de uma única função em `site.ts`; as ações do
  visitante (abrir produto, buscar, adicionar, remover, enviar a lista) passam por
  funções do contexto de orçamento e do catálogo. São os pontos onde o produto
  definitivo vai ligar o vendedor da sessão e o registro de eventos (`DEC-009`).
- No protótipo, `src/rastreio/` (vendedor da sessão, eventos, carrinhos) grava no
  `localStorage` (`DEC-010`). No produto definitivo, a mesma interface passa a
  enviar para a API; o painel lê por funções de `src/rastreio/metricas.ts`, que
  somam a base fictícia aos eventos locais e depois serão trocadas pela API.
- O admin de demonstração em `src/admin/` mantém cópias dos produtos e vendedores
  somente na memória do React. O login usa `sessionStorage` apenas para sustentar a
  navegação da demonstração; nenhuma edição chega ao catálogo público (`DEC-015`).
- Nada de `window`, `document` ou `localStorage` durante o render (pré-renderização).

## Produto definitivo

A arquitetura do produto definitivo (backend, banco, mídia, painel) será decidida
depois da apresentação. Referência: monólito modular da KiProdutos
(`D:\IntelliJ\Workspace\KiProdutos\sdd_kit\10-architecture.md`). A escolha do
frontend definitivo (manter Vite com pré-renderização ou migrar para Next.js) fica
em `PEND-009`.
