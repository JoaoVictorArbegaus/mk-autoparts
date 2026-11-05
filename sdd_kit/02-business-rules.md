# 02 — Regras de negócio

Regras válidas no protótipo. Itens marcados como **demonstração** são o
comportamento adotado para apresentar enquanto a pendência correspondente não for
resolvida com o cliente.

## RN-01 — Produto visível

- Todo produto do arquivo de dados com `ativo: true` aparece no catálogo.
- Produto com `ativo: false` não aparece no catálogo, na landing nem por URL direta
  (a URL mostra a página de "produto não encontrado").

## RN-02 — Preço só nas promoções (`DEC-008`)

- Produtos fora de promoção não exibem preço: o PDF atual não tem preços. O preço é
  informado pelo atendimento no orçamento do WhatsApp.
- O catálogo serve para o cliente encontrar e organizar as peças que quer.
- Não há total na lista, porque ela mistura itens com e sem preço.
- Textos de chamada usam "Solicitar orçamento" ou "Adicionar ao orçamento", nunca
  "Comprar" ou "Carrinho".

## RN-02A — Promoção

- Um produto em promoção tem `promocao.preco` (obrigatório, maior que zero, em
  reais com duas casas, exibido como `R$ 1.234,56`) e, se o cliente informar,
  `promocao.precoOriginal` (maior que `preco`).
- O card e o detalhe mostram o selo "Promoção" e o preço promocional em destaque. O
  preço original riscado só aparece quando existir no dado; nunca é inventado.
- Na lista e na mensagem do WhatsApp, o item em promoção leva o preço promocional
  unitário; os demais não levam preço.
- O catálogo oferece o filtro "Somente promoções", e a landing destaca as promoções.
- **Demonstração:** promoções não têm vigência por data no protótipo (`PEND-004`).
- O preço promocional é confirmado no atendimento (`PEND-003`, texto do aviso).

## RN-03 — Compatibilidade

- Um produto pode ser compatível com zero ou mais aplicações (montadora + modelo,
  opcionalmente faixa de ano).
- Produto sem aplicação cadastrada é tratado como "consultar aplicação" e não
  aparece quando há filtro por montadora ou modelo.
- O filtro de modelo só oferece modelos da montadora selecionada.

## RN-04 — Lista de orçamento

- O visitante adiciona produtos à lista com quantidade inteira entre 1 e 999.
- Produto com lados (`DEC-012`): o visitante escolhe LD, LE ou "Par (LD + LE)".
  Cada lado vira um item da lista, com o próprio código; "Par" adiciona os dois
  com a mesma quantidade. Sem escolha, o botão de adicionar fica desabilitado com
  a instrução "Escolha o lado".
- Adicionar o mesmo produto e lado que já estão na lista soma a quantidade,
  respeitando o limite.
- A lista é guardada em `localStorage` e sobrevive a recarregar a página.
- Ao carregar, itens cujo produto não existe mais ou ficou inativo são removidos e o
  visitante é avisado.
- Nome, código e imagem vêm sempre dos dados atuais, nunca do valor salvo no
  navegador.
- A lista mostra a quantidade de itens e de unidades; só itens em promoção mostram
  o preço unitário, sem total.
- O visitante pode escrever uma observação opcional (até 500 caracteres; ex.:
  placa, modelo e ano do caminhão, cidade para envio), incluída na mensagem.
- Enviar a lista abre o WhatsApp da MK Autoparts com a mensagem de `RN-05`. A lista
  não é apagada automaticamente; o visitante pode limpá-la.

## RN-05 — Mensagem do WhatsApp

- Destino: o WhatsApp do vendedor da sessão (`RN-07`); sem vendedor, o da empresa,
  `+55 49 99110-0096` (bio do Instagram), sujeito a confirmação (`PEND-005`). Na
  demonstração, os vendedores fictícios também usam o número da empresa.
- No produto definitivo, quem não tem vendedor envia a lista para o contato central
  (no futuro, possivelmente uma IA), que encaminha ao grupo dos vendedores
  (`DEC-011`); no protótipo, o número da empresa, (49) 99110-0096, faz esse papel.
- Com vendedor na sessão, a mensagem começa com "Olá, `<nome do vendedor>`!" no
  lugar de "Olá, MK Autoparts!".
- Mensagem da lista, url-encoded:

  ```text
  Olá, MK Autoparts! Gostaria de um orçamento destes itens:

  - 2x Farol principal Scania Série 5 — LD (cód. S03-035)
  - 1x Nome do produto (cód. XYZ999) — promoção R$ 89,90 un.

  Observação: Scania R440 2015, envio para Chapecó/SC
  ```

  A linha de observação só aparece se preenchida. Item sem código MK (promoções
  cujas artes não trazem código) sai sem o trecho "(cód. ...)".
- O texto exato pode ser ajustado pelo cliente (`PEND-006`).
- Botões de contato geral usam: "Olá, MK Autoparts! Vi o catálogo online e gostaria
  de atendimento."
- Botão "Solicitar orçamento" de um único produto, sem passar pela lista: "Olá, MK
  Autoparts! Gostaria de um orçamento do produto `<nome>` (cód. `<código>`)."

## RN-06 — Conteúdo

- Nenhum dado da empresa é inventado (números, clientes, endereço, horários,
  depoimentos). Ausências viram `[PLACEHOLDER: ...]`.
- Nomes de montadoras aparecem em texto. Logos de montadoras e de marcas de peças só
  com autorização (`PEND-007`).

## Simulação de vendedores e métricas (`DEC-010`)

Tudo nesta seção é **demonstração**: roda só no navegador, com dados fictícios, e não
é a regra do produto definitivo (`DEC-009`, `PEND-017` a `PEND-026`).

## RN-07 — Link de vendedor

- Os vendedores fictícios ficam em `src/content/vendedores.ts`, com nomes
  claramente de demonstração e o WhatsApp da empresa. Nenhum telefone inventado.
- Entrar por qualquer rota com `?v=<código>` de um vendedor ativo grava o vendedor
  no navegador; as visitas seguintes, mesmo sem o parâmetro, continuam atribuídas.
- **Demonstração:** vale o último link usado; a atribuição não expira (`PEND-019`).
- Código inexistente ou vendedor inativo: o site abre normalmente, sem vendedor
  (origem "direta"), e não apaga uma atribuição válida anterior.
- Com vendedor, o site mostra um aviso discreto e permanente "Atendimento: `<nome>`",
  sem cobrir conteúdo nem CTAs.

## RN-08 — Registro das ações (eventos)

- Cada ação gera um evento com `id`, data/hora, `visitanteId` (anônimo, gerado no
  navegador), `sessaoId`, `vendedor` (ou nulo), tipo e, quando houver, produto e
  carrinho.
- Tipos: `visita_iniciada` (uma por sessão, com origem vendedor ou direta),
  `produto_clicado` (abriu o detalhe), `busca_realizada` (termo ou filtro aplicado,
  no máximo um por segundo de digitação), `item_adicionado`, `item_removido`,
  `carrinho_finalizado` e `whatsapp_clicado` (botões de contato fora da lista).
- Os eventos ficam no `localStorage` (limite de 5.000; ao passar, descartam-se os
  mais antigos) e nunca saem do navegador.

## RN-09 — Carrinhos

- A lista de orçamento é o carrinho. Ele nasce no primeiro item adicionado, com
  `id`, vendedor da sessão, data de criação e de última atividade.
- **Finalizado:** o visitante clicou em "Enviar pelo WhatsApp". Guarda-se uma cópia
  dos itens nesse momento e o WhatsApp real é aberto (`RN-05`).
- Depois de finalizado, a lista continua visível; qualquer alteração nela abre um
  novo carrinho com os mesmos itens.
- **Não finalizado:** carrinho com itens que não foi enviado. Na demonstração não há
  prazo de abandono (`PEND-021`).
- Esvaziar a lista sem enviar registra o carrinho como não finalizado vazio, que não
  conta nas métricas de carrinhos.

## RN-10 — Painel de métricas

- Rota `/painel`, sem link na navegação, sem login, com selo "Demonstração —
  números fictícios" e `noindex`.
- Os números somam uma **base fictícia fixa** (`src/content/demo-metricas.ts`,
  coerente com os produtos e vendedores fictícios) aos eventos registrados no
  navegador, para o painel reagir ao vivo durante a apresentação.
- Indicadores: produtos mais e menos clicados; cliques × adicionados por produto e
  taxa (adicionados ÷ cliques); carrinhos finalizados × não finalizados e taxa de
  finalização; tabela por vendedor (visitas, cliques, itens adicionados, carrinhos
  finalizados e não finalizados) incluindo "Direto"; funil visita → clique →
  carrinho → finalizado.
- Filtro por vendedor. Sem filtro de período na demonstração.
- O painel lista os links dos vendedores fictícios para teste e tem o botão
  "Zerar dados da demonstração", que apaga eventos, carrinhos e vendedor gravados
  (a base fictícia permanece).
