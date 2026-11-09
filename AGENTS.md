# AGENTS.md — MK Autoparts

Instruções obrigatórias para agentes de IA que analisem, documentem ou alterem este
repositório. O objetivo é preservar as regras do produto sem carregar contexto que
não pertence à tarefa atual.

## Fase atual: protótipo

Este projeto está na fase de **protótipo de apresentação** (`DEC-001`): uma landing
page com catálogo online de produtos pré-cadastrados, **somente frontend**, sem
backend, banco de dados, administração real, autenticação ou deploy de produção. O
`/admin` de `DEC-015` é apenas uma demonstração visual e não persiste alterações.
O objetivo é apresentar a proposta à MK Autoparts e coletar as especificações do
produto definitivo, que serão decididas depois.

O projeto de referência é a KiProdutos (`D:\IntelliJ\Workspace\KiProdutos`). Use-a
como referência de **processo, estrutura de documentação e comportamento do
catálogo**, nunca como fonte de regras de negócio, identidade visual ou conteúdo da
MK Autoparts.

## Autoridade e fontes de verdade

- O pedido humano explícito prevalece sobre este arquivo.
- `sdd_kit/` contém os requisitos e as decisões vigentes do produto.
- `TASKS.md` contém somente o trabalho ativo e dependências; não cria requisitos.
- `SESSION.md` é um snapshot curto para continuidade; não é histórico.
- `docs/client-questions.md` reúne as dúvidas abertas para o cliente.
- `docs/fontes/` guarda documentos recebidos como vieram; são fonte de informação,
  não especificação. Não edite esses arquivos; integre o que valer ao SDD.
- `frontend/design/briefing.md` e `frontend/design/direcao-visual.md` governam
  conteúdo e identidade visual da página.
- O código representa a implementação atual, mas não altera sozinho uma regra
  documentada.
- Não invente requisito, regra de negócio, dado do cliente, integração ou
  infraestrutura.

Se código e especificação divergirem, informe a inconsistência e corrija-a somente
dentro do escopo autorizado. Se documentos vigentes se contradisserem de maneira que
mude o resultado, pare e solicite uma decisão humana.

## Contexto sob demanda

Antes de trabalhar:

1. leia este arquivo;
2. leia `SESSION.md`;
3. consulte `TASKS.md` quando a solicitação envolver planejamento ou status;
4. leia apenas os documentos do SDD que governam a tarefa;
5. inspecione o código afetado.

### Mapa do SDD

- Escopo: `sdd_kit/01-product-scope.md`.
- Regras de negócio: `sdd_kit/02-business-rules.md`.
- Domínio e dados do protótipo: `sdd_kit/03-domain-model.md`.
- Requisitos: `sdd_kit/04-functional-requirements.md` e
  `sdd_kit/05-non-functional-requirements.md`.
- Aceite: `sdd_kit/06-acceptance-criteria.md`.
- API: `sdd_kit/07-api-contract.md` (fora do protótipo).
- Frontend: `sdd_kit/08-frontend-specification.md`.
- Administração: `sdd_kit/09-admin-specification.md` (fora do protótipo).
- Arquitetura: `sdd_kit/10-architecture.md`.
- Banco: `sdd_kit/11-database.md` (fora do protótipo).
- Segurança: `sdd_kit/12-security.md`.
- Infraestrutura: `sdd_kit/13-infrastructure.md`.
- Desenvolvimento e validação: `sdd_kit/14-development-guidelines.md`.
- Decisões: `sdd_kit/99-decisions.md`.

## Frontend: agente e skills do landing-pages (`DEC-002`)

Todo o trabalho visual do frontend segue o pipeline do agente **gerador-landing** e
as skills do repositório `D:\IntelliJ\Workspace\landing-pages`, ligados a este
projeto por junções do Windows:

- `.claude/agents/` → `landing-pages\.claude\agents\` (agente `gerador-landing` e
  auxiliares do impeccable). Use o agente `gerador-landing` e siga as etapas 0 a 4.
- `.claude/skills/ui-ux-pro-max`, `design-taste-frontend` e `impeccable` → as
  skills do landing-pages, usadas nesta ordem: direção visual, código, acabamento.
- `.claude/settings.local.json` é uma cópia com o hook do detector do impeccable
  (verifica a interface após cada edição e numa passada final).

As junções apontam para os arquivos originais: **não edite** nada em
`.claude/agents/` nem `.claude/skills/` a partir deste projeto, porque a alteração
vale também para o landing-pages. Ajustes ao processo deste projeto ficam neste
arquivo.

Adaptações deste projeto ao agente:

- A "pasta do cliente" do agente é `frontend/` deste repositório (não
  `landing-pages/clientes/`). Nada é criado ou alterado dentro de `landing-pages`.
- Os scripts das skills são executados a partir da raiz deste projeto
  (`.claude/skills/...` resolve pelas junções).
- O agente foi escrito para uma página única; aqui ele também cobre o catálogo e o
  detalhe de produto, conforme `sdd_kit/08-frontend-specification.md`. A stack fixa
  do agente vale, com as extensões aprovadas em `DEC-003`.
- O checkpoint de direção visual (3 opções em `frontend/design/opcoes-direcao.md` e a
  pergunta "Qual direção sigo?") é obrigatório, salvo pedido de "modo direto".

## Unidade de trabalho e autorização

- Trabalhe por tarefa coesa, com resultado observável e validação proporcional.
- O pedido explícito para implementar já autoriza o escopo descrito pelo humano. Não
  peça nova autorização para subtarefas internas desse mesmo escopo.
- Quando o pedido for apenas análise ou revisão, não implemente sem solicitação.
- Pare somente diante de expansão material de escopo, requisito conflitante, decisão
  de produto ausente, ação externa relevante ou operação destrutiva não autorizada.

## Alterações de requisitos e documentação

- Reflita mudanças de produto nos documentos afetados antes ou junto da
  implementação.
- Registre em `sdd_kit/99-decisions.md` somente decisões duráveis ou difíceis de
  inferir das especificações.
- Integre a regra final na seção temática correta, sem adendos cronológicos.
- Decisões pendentes permanecem pendentes até aprovação humana explícita. No
  protótipo, uma pendência pode ter um **comportamento de demonstração** registrado,
  desde que fique claro que não é a decisão final.

## `SESSION.md` e `TASKS.md`

- `SESSION.md` contém apenas o estado necessário para retomar o trabalho, abaixo de
  100 linhas, sem datas, números de sessão ou relatos de tarefas encerradas.
- `TASKS.md` mantém apenas tarefas ativas ou aguardando execução.

## Conteúdo e transparência

- Nunca invente depoimentos, números, preços, endereço, horários, marcas
  representadas ou fotos da MK Autoparts.
- Os produtos pré-cadastrados do protótipo vêm do PDF/fotos fornecidos pelo cliente
  (`docs/produtos/`). A marca recebida fica em `docs/design/`. Enquanto não houver
  material suficiente, usar produtos de exemplo
  claramente sinalizados como `[EXEMPLO]` no dado e na interface.
- Placeholders seguem o padrão do agente: `[PLACEHOLDER: ...]`.
- Todo o texto em português do Brasil.

## Proibições na fase de protótipo

- Não criar backend, banco, API, autenticação real ou pagamento. O admin `/admin`
  (`DEC-015`) e as métricas são demonstrações só visuais: nada salva nem altera o site.
- Na simulação, nunca inventar telefones: vendedores fictícios usam o WhatsApp da
  empresa.
- Não adicionar dependência além da stack do agente e das extensões de `DEC-003` sem
  necessidade concreta e registro.
- Não publicar, fazer deploy, commit ou push sem pedido humano.
- Não usar logo, textos ou fotos da KiProdutos ou de outros clientes.

## Validação

- Mudança somente documental: verificar formatação, referências e consistência.
- Frontend: seguir a Etapa 4 do agente gerador-landing (build, pré-renderização,
  screenshots via helper CDP, console vazio, sem rolagem lateral no celular).
- Não repetir validações que já passaram sem mudança no que cobrem.

## Conclusão da tarefa

Ao concluir, informe resultado, arquivos relevantes, validações e resultados,
pendências reais e o próximo passo recomendado, sem iniciá-lo se estiver fora do
escopo.
