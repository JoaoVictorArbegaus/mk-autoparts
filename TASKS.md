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
| PROTO-05 | Roteiro de apresentação. Lighthouse no celular medido (build local no Docker): landing desempenho ~60, LCP 5,3 s; catálogo ~80, LCP 4,8 s; acessibilidade 100, boas práticas 100, CLS 0 nas duas; SEO 66 por causa do `noindex` proposital. Meta de desempenho do `RNF-05` não atingida, aceita no protótipo (o peso restante é React + Motion e as animações da landing) | READY | — |
| PROTO-06 | Confirmações do cliente para trocar placeholders (Sobre nós, Clientes, CEP, feriados, domínio) e as frases das artes | BLOCKED | Respostas do cliente (`docs/client-questions.md`) |
| DOC-01 | Revisar os dois PDFs e suas fontes em `docs/reuniao/` | BLOCKED | Revisão do responsável e do sócio |

## Próxima reunião (`docs/planejamento-proxima-reuniao.md`)

Mudanças pedidas pela MK na primeira apresentação. Regras em `DEC-017` a `DEC-021`.
Tudo continua só frontend e simulado (`DEC-001`). As melhorias M1 a M7 também serão
apresentadas.

| ID | Tarefa | Estado | Para desbloquear |
| --- | --- | --- | --- |
| REU-08 | Selo oficial em todos os pontos: cabeçalho, admin, área do vendedor e documento do orçamento | DONE | — |
| REU-01 | Atendimento travado por link; vale o último link aberto | DONE | — |
| REU-02 | "Solicitar orçamento" com rodízio simulado (fila A B C…, quem atende vai para o fim, `src/orcamento/fila.ts`); fila no admin de demonstração | DONE | — |
| REU-03 | Seção "Escolher um vendedor" na lista (iniciais no lugar da foto); a escolha move o vendedor para o fim da fila. Falta só ligar as fotos | DONE | Fotos em `PEND-034` |
| REU-10 | Login simulado para `/vendedor` (escolher o vendedor, sem senha) | DONE | — |
| REU-04 | Painel do vendedor (`/vendedor`, `src/vendedor/`): orçamento com cliente, itens, lado, quantidade, preço (vazio = sob consulta) e desconto em R$ ou % por item e no total | DONE | — |
| REU-05 | Página `/orcamento` aberta pelo link (orçamento codificado na URL): preço antigo riscado, novo preço e %, total; cliente altera, remove e adiciona; "Solicitar orçamento" e "Falar com <nome>"; link expirado ou excluído avisa | DONE | — |
| REU-06 | Documento do orçamento no modelo novo da MK (`DEC-025`, `docs/pfd-regras/`, fora do Git): campos novos, cálculo decimal igual a `orcamento_modelo.py`, PDF, Word e link. Falta a MK confirmar as decisões fiscais e os textos fixos (`PEND-035`) | BLOCKED | Respostas da MK em `PEND-035` |
| REU-11 | Vendedores reais da MK no protótipo (nomes e WhatsApps de `03-domain-model.md`), base do painel regerada com eles e iniciais no lugar da foto: feito. Falta só ligar as fotos quando chegarem | BLOCKED | Fotos em `PEND-034` |
| REU-13 | Aviso fora do horário comercial (segunda a sexta, 8h às 18h, Brasília): feito na lista e na escolha de vendedor (`src/orcamento/horario.ts`, `AvisoHorario`); também no `/orcamento` | DONE | — |
| REU-14 | Painel do vendedor: orçamentos ativos, aviso "Alterado pelo cliente" (mesmo navegador), marcar como visto, encerrar e excluir link | DONE | — |
| REU-15 | Hero com mosaico (`DEC-024`): aplicado e medido no Lighthouse (ver PROTO-05) | DONE | — |
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
