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
| DOC-01 | Revisar os dois PDFs e suas fontes em `docs/reuniao/` | BLOCKED | Revisão do responsável e do sócio |

## Próxima reunião (`docs/planejamento-proxima-reuniao.md`)

Mudanças pedidas pela MK na primeira apresentação. Regras em `DEC-017` a `DEC-021`.
Tudo continua só frontend e simulado (`DEC-001`). As melhorias M1 a M7 também serão
apresentadas.

| ID | Tarefa | Estado | Para desbloquear |
| --- | --- | --- | --- |
| REU-07 | Remover todas as quantidades públicas (faixa, categorias, Sobre, contador de resultados) | READY | — |
| REU-08 | Selo oficial como logo principal (cabeçalho, painel do vendedor, documentos) | READY | — |
| REU-01 | Atendimento travado por link; vale o último link aberto | READY | — |
| REU-02 | "Solicitar orçamento" com rodízio simulado (fila A B C…, quem atende vai para o fim); fila no admin de demonstração | READY | REU-11 |
| REU-03 | Seção "Escolher um vendedor" (iniciais no lugar da foto); a escolha move o vendedor para o fim da fila | READY | REU-11 |
| REU-10 | Login simulado para `/vendedor` e `/admin` | READY | — |
| REU-04 | Painel do vendedor: orçamento, preços e desconto | READY | REU-10 |
| REU-05 | Página `/orcamento` aberta pelo link: preço antigo riscado, novo preço e %, cliente altera e usa "Solicitar orçamento" ou "Falar com <nome>" | READY | REU-04 |
| REU-06 | PDF e Word padronizados com a marca MK | READY | REU-04; registrar as bibliotecas em `DEC-003` |
| REU-11 | Vendedores reais da MK no protótipo (nomes e WhatsApps de `03-domain-model.md`); base do painel com eles; fotos quando chegarem | READY | Fotos em `PEND-034` |
| REU-13 | Horário por vendedor (admin de demonstração); fora do horário sai do rodízio e da escolha | READY | REU-02; horários reais em `PEND-038` |
| REU-14 | Painel do vendedor: orçamentos ativos, aviso "Alterado pelo cliente", marcar como visto e encerrar | READY | REU-04, REU-05 |
| REU-15 | Hero com mosaico de produtos no lugar da foto do caminhão (`DEC-024`); tirar o preload da arte do hero se sair da dobra; conferir Lighthouse | READY | Lista curada de produtos |
| REU-12 | Melhorias M1 a M7 do planejamento | READY | Revisão de escopo com o responsável |

## Depois da apresentação

- Consolidar as respostas de `docs/client-questions.md` no SDD.
- Escrever o SDD do produto definitivo (vendedores, atribuição, eventos, carrinho
  no servidor, métricas, backend, painel, banco, segurança, LGPD, infraestrutura)
  a partir de `DEC-009`, `DEC-011`, `DEC-015` e das respostas do contratante,
  usando a KiProdutos como referência de processo.

## Regras de manutenção

- Remover itens concluídos depois de integrados.
- Não transformar respostas parciais do cliente em requisito por inferência.
