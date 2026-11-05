# 04 — Requisitos funcionais

## Landing

- **RF-01** A landing apresenta a MK Autoparts e leva ao catálogo e ao WhatsApp,
  com as seções de `08-frontend-specification.md`.
- **RF-02** A seção de categorias leva ao catálogo já filtrado pela categoria.
- **RF-03** A seção de montadoras leva ao catálogo filtrado pela montadora.
- **RF-04** A seção de promoções mostra as artes de promoção, cada uma levando ao
  detalhe do produto.

## Catálogo

- **RF-05** Lista os produtos ativos em grade de cards (imagem, nome inteiro, código,
  aplicação resumida, marca e botão "Adicionar ao orçamento"); só produtos em promoção mostram
  selo e preço (`RN-02`, `RN-02A`).
- **RF-06** Busca por texto em nome, código interno, códigos originais e marca,
  sem diferenciar maiúsculas, acentos, espaços, hífens e pontos (ex.: `ab-12.3`
  encontra `AB123`).
- **RF-07** Filtros combináveis: categoria (várias), montadora (uma), modelo (um,
  dependente da montadora), marca (várias) e "Somente promoções". Na interface,
  "montadora" se chama "Marca do veículo" (inclui Randon). O filtro de marca da
  peça só aparece com ao menos duas marcas nos dados.
- **RF-08** Ordenação: relevância (com busca) ou nome (padrão), e código. Produtos
  em promoção vêm primeiro; com busca, a promoção só desempata a relevância.
- **RF-09** Busca, filtros e ordenação ficam na URL (query string) e podem ser
  compartilhados; voltar no navegador restaura o estado anterior.
- **RF-10** Contador de resultados, botão "Limpar filtros" e estado vazio com
  sugestão de falar no WhatsApp.
- **RF-11** Com muitos produtos, carregamento incremental ao rolar (lotes de 24),
  sem paginação numérica.
- **RF-12** No celular, os filtros ficam num painel que abre e fecha por um botão
  com ícone explícito.

## Detalhe de produto

- **RF-13** Página `/produto/<slug>` com imagem, nome, código, códigos originais,
  marca, categoria, descrição, preço promocional (se houver), tabela de aplicações, seletor de quantidade,
  "Adicionar ao orçamento" e "Solicitar orçamento pelo WhatsApp".
- **RF-14** Produtos relacionados da mesma categoria (até 4).
- **RF-15** Slug inexistente ou inativo mostra página de "produto não encontrado"
  com link para o catálogo.

## Lista de orçamento

- **RF-16** Ícone da lista no cabeçalho com a quantidade de itens.
- **RF-17** Painel ou página da lista com itens, alteração de quantidade, remoção,
  contagem de itens, observação opcional, "Limpar lista" e "Enviar pelo WhatsApp"
  (`RN-04`, `RN-05`).
- **RF-18** Feedback visível ao adicionar um item, sem tirar o visitante da página.

## Contato

- **RF-19** Botão flutuante em todas as páginas públicas: WhatsApp quando a lista está
  vazia; "Lista (n) · Enviar" (abre a lista) quando tem itens. A lista mostra a prévia da
  mensagem antes do envio.
- **RF-20** Link para o Instagram `@mk.autoparts__`.
- **RF-21** Seção da loja física com endereço, horário e link "Como chegar" para o
  Google Maps.

## Simulação de vendedores e métricas (`DEC-010`)

- **RF-22** Link de vendedor `?v=<código>` em qualquer rota, com atribuição e aviso
  "Atendimento: `<nome>`" (`RN-07`).
- **RF-23** Registro dos eventos de `RN-08` em todas as rotas públicas (o painel não
  gera eventos).
- **RF-24** Registro dos carrinhos finalizados e não finalizados (`RN-09`).
- **RF-25** Painel `/painel` com os indicadores, filtro por vendedor, links de teste
  e "Zerar dados da demonstração" (`RN-10`).
