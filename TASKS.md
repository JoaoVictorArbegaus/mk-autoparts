# TASKS.md — Quadro operacional atual

Este arquivo contém somente trabalho ativo ou aguardando execução. Requisitos ficam
em `sdd_kit/`, o estado de continuidade em `SESSION.md`.

## Estado

Fase de protótipo (`DEC-001`). Somente frontend, com dados estáticos.

## Protótipo

| ID | Tarefa | Estado | Para desbloquear |
| --- | --- | --- | --- |
| PROTO-00 | Estrutura do projeto e SDD do protótipo | DONE | — |
| PROTO-01 | Briefing completo e massa de produtos (`produtos.ts`) a partir do PDF | DONE | Revisão do cliente em `PEND-029` (não bloqueia) |
| PROTO-07 | Admin de demonstração (`DEC-015`) | DONE | — |
| PROTO-05 | Medição Lighthouse no celular (`RNF-05`) e roteiro de apresentação | READY | — (Etapa 4 do agente já verificada: build, screenshots, console, rolagem lateral) |
| PROTO-06 | Confirmações do cliente para trocar placeholders (Sobre nós, Clientes, CEP, feriados, domínio) e as frases das artes | BLOCKED | Respostas do cliente (`docs/client-questions.md`) |
| PROTO-08 | Publicar temporariamente o protótipo na VPS | BLOCKED | Acesso da VPS, endereço público, proxy reverso, HTTPS e proteção por senha/IP (`docs/deploy-vps.md`) |
| DOC-01 | Revisar os dois PDFs e suas fontes em `docs/reuniao/` | BLOCKED | Revisão do responsável e do sócio |

## Depois da apresentação

- Consolidar as respostas de `docs/client-questions.md` no SDD.
- Escrever o SDD do produto definitivo (vendedores, atribuição, eventos, carrinho
  no servidor, métricas, backend, painel, banco, segurança, LGPD, infraestrutura)
  a partir de `DEC-009`, `DEC-011`, `DEC-015` e das respostas do contratante,
  usando a KiProdutos como referência de processo.

## Regras de manutenção

- Remover itens concluídos depois de integrados.
- Não transformar respostas parciais do cliente em requisito por inferência.
