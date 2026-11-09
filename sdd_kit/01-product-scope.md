# 01 — Escopo do produto

## Visão

A MK Autoparts (Mk Auto Parts LTDA, desde 2021) é uma loja de autopeças em Lages –
SC que importa, exporta e distribui peças e acessórios para caminhões, com envio
para todo o Brasil. Hoje os vendedores enviam aos clientes um PDF de produtos e as
promoções em imagens pelo WhatsApp.

O objetivo principal do produto é ser o **catálogo dos vendedores**, substituindo o
PDF e as imagens; a landing institucional é secundária e deve apresentar a empresa
de forma rápida. No produto definitivo, cada vendedor terá link próprio e a empresa
terá métricas por vendedor, produto e carrinho (`DEC-009`); o protótipo simula
isso sem backend (`DEC-010`) e também demonstra a futura operação administrativa
em `/admin`, sem persistência (`DEC-015`).

No protótipo, o catálogo online com landing page institucional funciona assim: o cliente
descobre as peças, filtra por montadora, modelo, categoria e marca, monta uma lista
de orçamento e a envia pelo WhatsApp. Só os produtos em promoção mostram preço
(`DEC-008`); os demais recebem o preço no atendimento.

## Fase atual: protótipo de apresentação (`DEC-001`)

O objetivo do protótipo é **apresentar a proposta à MK Autoparts** e coletar as
especificações do produto definitivo. Ele precisa parecer e se comportar como o
produto real para o visitante, mas não tem backend.

### Objetivos do protótipo

- Landing institucional fluida, animada e responsiva.
- Catálogo navegável, pesquisável e filtrável, com os produtos reais do PDF atual.
- Página de detalhe de produto com código, marca, compatibilidade e, se em
  promoção, o preço promocional.
- Lista de orçamento no navegador, enviada pelo WhatsApp com mensagem pronta.
- Demonstrar o link de vendedor e o painel de métricas, simulados (`DEC-010`).
- Demonstrar o futuro admin de produtos, promoções e vendedores, sem salvar
  alterações (`DEC-015`).
- Servir de base visual e de comportamento para o SDD do produto definitivo.

### Atores

- **Visitante:** consulta landing, catálogo e produtos; monta a lista de orçamento;
  segue para o WhatsApp. Pode chegar por link de vendedor ou direto.
- **Vendedor (fictício):** tem link próprio de demonstração; recebe a lista no
  WhatsApp.
- **Cliente MK na apresentação:** abre `/painel` para ver as métricas simuladas.
- **Apresentador (equipe de desenvolvimento):** demonstra o site, o painel e o
  admin visual ao cliente.

### Incluído no protótipo

- Landing com as seções definidas em `08-frontend-specification.md`.
- Catálogo com busca por nome/código, filtros por categoria, montadora, modelo e
  marca da peça, refletidos na URL.
- Detalhe de produto.
- Preço só nas promoções (`DEC-008`); os demais itens são organizados na lista e
  orçados pelo WhatsApp.
- Lista de orçamento persistida em `localStorage`, com envio pelo WhatsApp.
- Produtos pré-cadastrados em arquivo estático (`03-domain-model.md`).
- Simulação (`DEC-010`): vendedores fictícios com link `?v=<código>` e aviso
  "Atendimento: <nome>"; registro das ações do visitante e dos carrinhos no
  `localStorage`; painel `/painel` com números fictícios fixos somados às ações da
  demonstração.
- Admin de demonstração em `/admin`: login simulado e telas de produtos,
  promoções, vendedores e métricas. As alterações ficam só na memória da página,
  não alteram o site público e somem ao recarregar (`DEC-015`).

### Fora do escopo do protótipo

- Backend, API, banco de dados, autenticação.
- Painel administrativo **real**, cadastro persistente e gestão de usuários. O
  `/admin` do protótipo é apenas uma demonstração visual (`DEC-015`).
- Kits, Reels do Instagram e contas de clientes (recursos da KiProdutos não
  escolhidos para o protótipo).
- Vendedores reais, cadastro de vendedores, regras de prazo e conflito de
  atribuição, carrinho no servidor, login no painel, LGPD e integrações
  (`DEC-010`).
- Números de WhatsApp de vendedores: todos os vendedores fictícios usam o número
  da empresa.
- Preço de produtos fora de promoção e total da lista (`DEC-008`); preço público
  no futuro em `PEND-001`.
- Checkout, pagamento, frete, estoque, nota fiscal.
- Integração com a API do WhatsApp; o sistema apenas abre o canal com mensagem
  preparada.
- Domínio, hospedagem de produção e deploy (o protótipo pode ser exibido localmente
  ou num endereço temporário, mediante pedido).

## Produto definitivo (depois da apresentação)

As especificações do produto definitivo serão decididas depois da apresentação,
a partir de `docs/client-questions.md`. A KiProdutos é a referência de processo e
arquitetura (backend, painel, mídia, segurança, infraestrutura), sem herdar
automaticamente suas regras.

Direção já conhecida e consolidada em `DEC-009` e `DEC-011`; os detalhes ainda
dependem das respostas de `docs/client-questions.md`:

- **Atores:** visitante/cliente, vendedor (com link próprio, recebe os carrinhos) e
  administrador (catálogo, promoções, vendedores, métricas).
- **Fluxo de atendimento (`DEC-011`):** quem fala primeiro com a loja pelo WhatsApp
  é atendido por um vendedor, que manda o próprio link do catálogo; a lista vai
  para esse vendedor. Quem entra no catálogo sem link envia a lista para um contato
  central, que encaminha ao grupo de WhatsApp dos vendedores, onde um vendedor
  assume e fecha a venda pelo WhatsApp. Se o cliente precisar voltar ao catálogo,
  o vendedor manda o próprio link e passa a ser o dono dos carrinhos seguintes. O
  contato central poderá ser uma IA no futuro; ela ainda não existe.
- **Link de vendedor:** atribui a navegação do visitante ao vendedor, com
  persistência no navegador, validade e regra de conflito a definir
  (`PEND-019`); sem link ou com código inválido, origem "direta".
- **Funil por produto:** visualizado, adicionado, removido e enviado, sempre
  associado ao vendedor da sessão.
- **Carrinho no servidor:** estados ativo, abandonado e finalizado, para mostrar
  carrinhos não finalizados (`PEND-020` a `PEND-022`).
- **Eventos e métricas:** visita, clique em produto, busca, mudanças no carrinho,
  finalização e clique no WhatsApp; painel por vendedor, por produto e funil geral
  (`PEND-023`, `PEND-024`).
- **Privacidade:** identificador anônimo, consentimento e política de privacidade
  (`PEND-025`).
- **Preço público** em todos os produtos é intenção registrada pelo cliente, ainda
  sem fonte de preços (`PEND-001`).

## Limites do produto

- A confirmação de preço, disponibilidade e conclusão da venda ocorre no atendimento
  pelo WhatsApp.
- O protótipo não promete prazo de entrega, frete, garantia ou estoque.
