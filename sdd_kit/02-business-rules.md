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
- **Exceção:** o orçamento montado pelo vendedor tem preço e desconto definidos por ele
  (`RN-13`). Isso não muda o catálogo público.
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
- **Vigência (M5, `DEC-026`):** início e fim são opcionais. Sem datas, a promoção vale sempre;
  antes do início ou depois do fim (o dia do fim ainda vale), o site mostra o produto sem preço
  e sem a arte. Datas no horário de Brasília. A regra final depende de `PEND-004`.
- O preço promocional é confirmado no atendimento (`PEND-003`, texto do aviso).

## RN-03 — Compatibilidade

- Um produto pode ser compatível com zero ou mais aplicações (montadora + modelo,
  opcionalmente faixa de ano).
- Produto sem aplicação cadastrada é tratado como "consultar aplicação" e não
  aparece quando há filtro por montadora ou modelo.
- O filtro de modelo só oferece modelos da montadora selecionada.
- **Ano (M1, `DEC-026`):** com ano escolhido, aparecem primeiro as peças cujo período cobre o
  ano e depois as peças sem ano cadastrado, marcadas com asterisco amarelo ("Ano não
  cadastrado no sistema"). Peça cujo período exclui o ano não aparece.

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
  `+55 49 99110-0096` (bio do Instagram), sujeito a confirmação (`PEND-005`).
- Quem não tem vendedor é atendido pelo vendedor da vez no rodízio (`RN-11`) ou pelo
  que escolher (`RN-12`), conforme `DEC-017`. O contato central e a IA de `DEC-011`
  ficam fora do plano atual. Os botões de contato geral, sem vendedor definido,
  continuam no número da empresa.
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

- Os vendedores (`DEC-022`) ficam em `src/content/vendedores.ts`, com os nomes e
  WhatsApps recebidos da MK. Nenhum telefone é inventado.
- Entrar por qualquer rota com `?v=<código>` de um vendedor ativo grava o vendedor
  no navegador; as visitas seguintes, mesmo sem o parâmetro, continuam atribuídas.
- Vale o último link aberto (`DEC-017`). A atribuição não tem prazo de validade
  (`DEC-017`). **Demonstração:** fica no `localStorage` do navegador.
- Código inexistente ou vendedor inativo: o site abre normalmente, sem vendedor
  (origem "direta"), e não apaga uma atribuição válida anterior.
- Com vendedor, o site mostra um aviso discreto e permanente "Atendimento: `<nome>`",
  sem cobrir conteúdo nem CTAs.
- **Atendimento travado (`DEC-017`):** com vendedor na sessão, o site não oferece a
  escolha de outro vendedor em nenhum ponto (lista, produto, contato). "Solicitar
  orçamento" e os botões de contato vão sempre ao WhatsApp dele. Os clientes são
  de cada vendedor.

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

- Fica na tela Métricas do admin de demonstração (`/admin/metricas`, atrás do login
  simulado de `DEC-015`), com selo "Demonstração — números fictícios" e `noindex`. Não
  há rota pública própria: `/painel` redireciona para `/admin/metricas`.
- Os números somam uma **base fictícia fixa** (`src/content/demo-metricas.ts`,
  coerente com os produtos e os vendedores de `DEC-022`) aos eventos registrados no
  navegador, para o painel reagir ao vivo durante a apresentação.
- Indicadores: produtos mais e menos clicados; cliques × adicionados por produto e
  taxa (adicionados ÷ cliques); carrinhos finalizados × não finalizados e taxa de
  finalização; tabela por vendedor (visitas, cliques, itens adicionados, carrinhos
  finalizados e não finalizados) incluindo "Direto"; funil visita → clique →
  carrinho → finalizado.
- Filtro por vendedor. Sem filtro de período na demonstração.
- O painel lista os links dos vendedores para teste e tem o botão
  "Zerar dados da demonstração", que apaga eventos, carrinhos e vendedor gravados
  (a base fictícia permanece).

## Atendimento, painel do vendedor e privacidade de números

Regras da versão seguinte do protótipo, no que for simulado, e do produto definitivo.
Decisões: `DEC-017`, `DEC-018`, `DEC-019`.

## RN-11 — Rodízio de vendedores (visitante sem link)

- Vale só quando a sessão **não** tem vendedor atribuído (`RN-07`).
- A **fila** é uma lista ordenada de vendedores ativos; o primeiro é o da vez. A ordem
  inicial é a de `03-domain-model.md`.
- Ao clicar em "Solicitar orçamento" na lista, o pedido vai para o primeiro da fila, que
  passa para o **fim**; os demais avançam uma posição. Um cliente para cada vendedor,
  na ordem de chegada.
- O visitante é redirecionado ao WhatsApp desse vendedor, com a mensagem de `RN-05`
  iniciada por "Olá, `<nome>`!".
- Vendedor desativado sai da fila; vendedor novo entra no fim. Todo vendedor ativo recebe
  pedidos a qualquer hora (`RN-15`). Vendedor que não responde não é responsabilidade do sistema por ora (`DEC-017`).
- **Demonstração:** a fila fica no `localStorage` do navegador e só demonstra a
  sequência. O rodízio real é do servidor e vale para todos os visitantes. A fila e o
  próximo da vez aparecem no admin de demonstração.

## RN-12 — Escolha manual de vendedor (visitante sem link)

- No fim da lista, logo acima do botão "Solicitar orçamento", uma seção "Escolha um
  vendedor (opcional)" mostra foto (ou iniciais) e nome de cada vendedor ativo
  (pedido do responsável).
- O cliente marca um vendedor (pode desmarcar ou voltar ao vendedor da vez); o botão
  "Solicitar orçamento" abre o WhatsApp do marcado com a mensagem de `RN-05` e
  **consome a vez**: o vendedor escolhido vai para o fim da fila e os demais mantêm a ordem
  (`DEC-017`). Exemplo: fila A B C D E F; escolher D leva a A B C E F D; escolher F em
  seguida leva a A B C E D F.
- **Não aparece** quando há vendedor atribuído por link (`RN-07`).
- Sem foto do vendedor, a interface usa avatar com as iniciais; nunca se inventa foto.
- Todo vendedor ativo aparece na escolha, a qualquer hora (`RN-15`).

## RN-13 — Painel do vendedor e orçamento do vendedor (`DEC-018`, `DEC-021`)

- Área exclusiva dos vendedores, em rota própria (`/vendedor`), fora da navegação
  pública e `noindex`. O acesso é controlado pelo administrador principal (`DEC-021`).
  Na demonstração o login é simulado.
- O vendedor monta um **orçamento** escolhendo produtos, lado, quantidade e observação,
  com as mesmas regras de `RN-04`. Em peça com lado, "Par" divide a linha em duas (LD e LE),
  cada uma com o próprio código, quantidade e preço.
- **Cliente (obrigatório):** empresa (PJ) ou pessoa física (PF). PJ exige a razão social e
  tem comprador (pessoa de contato), CNPJ e inscrição estadual, opcionais; PF exige o nome e
  tem CPF, opcional. E-mail e telefone, opcionais, nos dois. CPF e CNPJ têm os dígitos
  verificadores validados. Não existe código do cliente: o cliente não tem conta e os dados
  são digitados no orçamento (`DEC-025`).
- **Entrega e pagamento (opcionais, texto livre):** endereço de entrega, endereço de
  cobrança (com "igual ao de entrega"), transportadora com o tipo de frete (ex.: "FOB -
  nome"; lista de transportadoras fica para depois) e prazo de pagamento.
- **Bloqueios ao salvar:** validade antes de hoje (o link nasceria vencido), peça com lado
  sem o lado escolhido e desconto em peça sem preço (o campo fica desabilitado). Ao salvar com
  erro, a tela vai até o primeiro campo errado e mostra a mensagem embaixo dele.
- **Código de venda (opcional):** gerado pela MK fora do sistema; o vendedor digita, até 20
  caracteres. Sem valor, o documento mostra "—".
- **Itens:** descrição, Nº compatível (códigos originais do catálogo do lado escolhido,
  separados por "/") e unidade (padrão "PC") vêm do catálogo e podem ser editados no
  orçamento sem alterar o catálogo. IPI (%) e valor da substituição tributária (R$, do item
  inteiro) começam em zero e são editáveis (o catálogo do protótipo não tem tributação).
- **Frete (+), impostos (−, dedução), cubagem, volumes, peso líquido e peso bruto:** digitados
  pelo vendedor (o catálogo não tem peso e medidas); sem nenhum dado de logística, a faixa
  não aparece no documento.
- **Preço:** o vendedor digita o preço unitário de cada item, ou deixa sem preço e o item
  aparece como "sob consulta". Item em promoção parte do preço promocional (`RN-02A`),
  que ele pode alterar. Sem preço, o item fica fora do total.
- **Desconto:** em valor (R$, por unidade) ou em porcentagem (0 a 100), em itens específicos
  ou no total. O desconto nunca deixa o preço negativo. O desconto no total é **rateado** em
  todos os itens com preço, antes do IPI (`DEC-025`).
- **Cálculo (aritmética decimal, metade para cima a 2 casas, cada unitário antes de
  multiplicar pela quantidade; referência executável `orcamento_modelo.py`):** líquido =
  preço após o desconto do item × fator do desconto no total; unitário = líquido × (1 + IPI%);
  total do item = unitário × quantidade; valor dos produtos = Σ líquido × quantidade;
  IPI = Σ (total do item − líquido × quantidade); **total = valor dos produtos + IPI + ST +
  frete − impostos**. Desconto exibido = valor sem desconto − valor dos produtos.
- **Exibição do desconto:** o preço antigo aparece riscado, o novo logo abaixo e, ao lado
  dos dois, a porcentagem de desconto (calculada sobre o preço antigo; uma casa decimal
  só quando não for inteira). No documento, a caixa de totais mostra o valor dos produtos
  sem desconto riscado e o desconto com a porcentagem; nas barras de total da tela, só o
  total e a porcentagem (o valor sem desconto não tem IPI nem ST).
- **Formas de envio:** o vendedor escolhe uma ou mais: **link**, **PDF** ou **documento
  editável** (Word). Todas trazem os mesmos dados. O link sai por "Enviar ao cliente", que
  usa o compartilhamento do celular (WhatsApp e outros apps) ou copia o link no computador.
- **Validade e exclusão do link:** o vendedor define a validade de cada orçamento (data
  limite, opcional) e pode excluir o link a qualquer momento. Link expirado ou excluído
  não mostra o orçamento: avisa o cliente e oferece "Falar com `<nome>`" (o vendedor
  dono). Na demonstração, a exclusão vale no navegador do vendedor (`localStorage`); entre
  aparelhos, só com servidor.
- **Link:** abre a página do orçamento (`/orcamento`) com os itens, os mesmos valores e
  totais do PDF (Nº compatível, IPI, ST, descontos, frete, impostos e um resumo igual à caixa
  de totais), atribui a sessão ao vendedor que o gerou (`RN-07`) e trava a escolha de outro
  vendedor. O item que deixou de existir é removido com aviso, como em `RN-04`. Na
  demonstração, o orçamento vai codificado na URL, **sem os dados pessoais do cliente**: só o
  nome em destaque; CPF/CNPJ, inscrição, e-mail, telefone, endereços, transportadora e prazo
  ficam só no PDF e no Word (`DEC-025`).
- **O cliente no link:** pode alterar quantidades, remover itens e adicionar produtos do
  catálogo. O preço e o desconto do vendedor continuam nos itens dele; o item adicionado
  pelo cliente entra "sob consulta" e o total é recalculado. Ao adicionar peça com lado, o
  cliente escolhe LD, LE ou Par (os dois), como no catálogo, e pode trocar o lado das peças
  sem preço do vendedor. Ele tem duas ações, ambas
  só para o vendedor dono do link: "Responder a `<primeiro nome>`" (envia a lista atual
  pelo WhatsApp; curto para caber numa linha da barra no celular, escolha do responsável na
  revisão impeccable) e "Falar com `<nome>`" (abre a conversa, sem a lista). No celular, o
  total e o envio ficam numa barra fixa embaixo. O cliente também pode **baixar o orçamento
  em PDF** (o mesmo documento, pela impressão do navegador), sem os dados pessoais que não vão
  no link.
- **Documento (PDF e Word):** igual à página 1 do modelo pedido pela MK
  (`docs/pfd-regras/MKautoparts/`, fora do Git: especificação, exemplo em PDF e Word e
  guia), na ordem: faixa de topo (selo `DEC-020`, nº do orçamento ORC-0001, código de venda
  em amarelo, emissão no fuso de Brasília, validade); Vendedor (nome e WhatsApp) | Cliente
  (destaque e campos do tipo; campo vazio não aparece); Entrega | Cobrança |
  Transportadora/frete e prazo; tabela de itens (foto, produto com "Cód. MK · lado" e
  "Nº compatível", un., qtd., Vl. líquido, IPI, Vl. ST, Vl. unit., Vl. total; item sob
  consulta numa linha com "Sob consulta" e fora de todas as somas); observação, validade,
  condições e logística (2 × 2) | caixa de totais (sem desconto, desconto, valor dos produtos,
  IPI, ST, frete, impostos, valor total); link online; rodapé com razão social, **CNPJ**,
  endereço e Instagram em todas as páginas. Orçamento longo continua na página seguinte sem
  repetir o cabeçalho do documento; a linha de títulos da tabela se repete e a linha do item
  não se parte. **O documento não tem:** controle do representante, ordem de compra, data de
  embarque prevista, código do cliente, redespacho, "Descontos" no cabeçalho, aviso de
  conferência da mercadoria nem cabeçalho repetido. Os textos fixos e os dados da empresa
  ficam num só arquivo (`src/content/documento.ts`); condições, validade e "sob consulta"
  ainda são textos de exemplo (`PEND-035`).
- **Orçamentos ativos:** o painel lista os orçamentos ativos do vendedor (cliente, data,
  itens, total). Quando o cliente altera um pelo link, o orçamento ganha o aviso "Alterado
  pelo cliente" com o que mudou (item, ação, data), até o vendedor marcar como visto. O
  vendedor pode encerrar o orçamento.
- **Demonstração:** o orçamento e o aviso ficam no `localStorage`; o aviso aparece quando
  o link é aberto e alterado no mesmo navegador (por exemplo, em outra aba). Entre
  aparelhos, só com servidor.
- O orçamento e o documento nunca mostram quantidade em estoque (`RN-14`).

## RN-14 — Sem quantidades de peças em área pública (`DEC-019`)

- As páginas públicas não mostram quantidade de peças: por marca de veículo, por
  categoria, por produto, no catálogo todo ou como contador de resultados da busca e
  dos filtros. O bloco "Sobre" não traz números de peças, categorias ou montadoras.
- A faixa de marcas da landing mostra apenas os nomes, e os cartões de categoria apenas
  nome e imagem. O catálogo mostra os produtos na rolagem ou depois do filtro, sem total.
- No celular, o botão do painel de filtros diz "Ver resultados", sem número.
- No bloco "Sobre", os números dão lugar a "Desde 2021", "Envio para todo o Brasil" e
  "Loja em Lages – SC".
- A quantidade que o cliente coloca na própria lista (`RN-04`) não é afetada. Áreas
  internas (`/admin`, `/painel`, painel do vendedor) podem mostrar contagens.

## RN-15 — Disponibilidade e horário comercial (`DEC-023`)

- Os vendedores ativos ficam disponíveis de segunda a domingo. Não há horário por
  vendedor: nenhum é pulado no rodízio e nenhum some de "Escolher um vendedor".
- O horário comercial é único: segunda a sexta, das 8h às 18h, no horário de Brasília.
  Feriados não são tratados.
- Fora do horário comercial, o site mostra o aviso: "Fora do horário comercial (segunda a sexta, das 8h às 18h), o tempo de resposta dos vendedores é indeterminado. Você pode enviar agora mesmo." O pedido segue o
  fluxo normal (vendedor do link, rodízio ou escolha manual).
- O aviso aparece onde o cliente decide pedir: fim da lista de orçamento, seção
  "Escolher um vendedor" e página do orçamento (`/orcamento`).
