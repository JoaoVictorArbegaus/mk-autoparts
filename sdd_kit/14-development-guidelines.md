# 14 — Diretrizes de desenvolvimento

## Processo

O processo obrigatório está em `AGENTS.md`. O frontend segue as etapas do agente
`gerador-landing` (`.claude/agents/gerador-landing.md`, junção para o
landing-pages), com a pasta do cliente sendo `frontend/`.

## Princípios

- Correto, simples e legível; sem abstração "para o futuro" além do limite de
  `10-architecture.md`.
- Textos em `src/content/site.ts`; dados em `src/content/*.ts`; nada de texto
  espalhado nos componentes.
- TypeScript estrito.
- Normalização de busca centralizada numa função (minúsculas, sem acentos, sem
  espaços, hífens, pontos e barras).
- Sem emojis na interface.

## Testes

- Funções puras de busca, filtro, ordenação, normalização, operações da lista e mensagem
  do WhatsApp têm testes unitários (Vitest), por serem as regras de `02` e `06`.
- A validação dos dados (`03-domain-model.md`) roda no build.
- O restante é verificado pela Etapa 4 do agente (screenshots via helper CDP,
  console, rolagem lateral), sem instalar Playwright.

## Execução

- Windows: scripts Python das skills com `python`, a partir da raiz deste projeto.
- Screenshots e arquivos temporários fora do projeto.
- Sem Git por enquanto; commits só se o repositório for criado a pedido.
