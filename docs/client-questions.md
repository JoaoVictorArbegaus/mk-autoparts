# Dúvidas para validação com o cliente

Reúne somente decisões ainda abertas. Respostas confirmadas são incorporadas ao SDD
e resumidas abaixo. No protótipo, cada pendência tem um **comportamento de
demonstração**, que não é a decisão final. Fontes recebidas ficam em `docs/fontes/`.

## Definições já confirmadas (responsável humano)

- Protótipo somente frontend, para apresentação (`DEC-001`).
- Preço só nas promoções; demais produtos sem preço, orçados pelo WhatsApp
  (`DEC-008`).
- Lista de orçamento enviada pelo WhatsApp (49) 99110-0096 (`DEC-006`); telefone
  (49) 3018-8278 exibido para ligação. O protótipo usa o endereço Av. Corina Caon,
  103 (`DEC-014`), que será reapresentado ao contratante para correção ou confirmação.
- Peças com lado (LD/LE) são um produto com escolha de lado (`DEC-012`).
- Promoções: as três artes enviadas, em carrossel na landing (`DEC-013`).
- Marca: sistema de logotipos v1.1, grafia "MK Autoparts" (`DEC-014`).
- Busca por nome/código e filtros por categoria, montadora, modelo e marca
  (`DEC-007`).
- Landing com montadoras, categorias, promoções e destaques, sobre/envio para o
  Brasil, clientes, contato e loja física (`08-frontend-specification.md`).
- O produto definitivo é um catálogo para os vendedores, com link por vendedor e
  métricas (`DEC-009`); o protótipo simula isso com vendedores fictícios, registro
  no navegador e painel `/painel` com números fictícios (`DEC-010`).

## Dados já levantados (a confirmar com o cliente)

- Razão social Mk Auto Parts LTDA, CNPJ 41.577.754/0001-96, aberta em 14/04/2021.
- Loja física: Av. Corina Caon, 103 – Ponte Grande, Lages – SC
  (coordenadas -27.799256, -50.295784; Google Maps
  `https://maps.app.goo.gl/Jy46cHxL9fPuc28v6`).
- Horário (Google): segunda a sexta, 08:00–12:00 e 13:00–18:00; sábado e domingo
  fechado.
- Bio do Instagram: "Importação, exportação e distribuição de peças e acessórios
  para caminhões, enviamos pra td o Brasil."
- Telefone: (49) 3018-8278 (também no PDF, nas artes de promoção e na fachada).
- A fachada tem uma placa "Fornecedores parceiros" com logos de marcas (ex.:
  Rodoplast); não usar logos sem autorização (`PEND-007`).
- Hoje o catálogo vai em PDF e as promoções em imagens pelo WhatsApp.

## Pendências — necessárias para o protótipo

- **Materiais:** recebidos o PDF de 2025, o sistema de logotipos, três artes de
  promoção e fotos da fachada e do estoque. Faltam, se existirem: fotos da equipe
  e fotos de produto melhores que as do PDF.
- **PEND-028 — Endereço e cadastro:** o PDF de 2025 traz R. Josefina Amorim, 364,
  enquanto o protótipo usa Av. Corina Caon, 103. O contratante deve revisar rua,
  número, complemento, bairro, cidade, UF e CEP no documento da reunião. Até essa
  resposta, Av. Corina Caon, 103 permanece como comportamento de demonstração.
- **PEND-029 — Revisão do catálogo:** conferir as 13 dúvidas da transcrição do
  PDF em `frontend/design/catalogo-revisao.md` (códigos repetidos, lados, códigos
  das promoções, nomes iguais) e a classificação em categorias e modelos.
  *Demonstração:* dados como estão no PDF, com as correções listadas.
- **PEND-016 — Promoções:** definir se possuem início e fim e como serão criadas:
  arte promocional, marcação de promoção diretamente no produto cadastrado ou as
  duas opções. *Demonstração:* três artes recebidas e promoção como produto com preço.
- **PEND-005 — Contato:** e-mail de contato? (WhatsApp e telefone resolvidos em
  `DEC-014`.)
- **PEND-008 — Clientes:** podemos mostrar os clientes do destaque "Clientes" do
  Instagram (nomes, fotos, logos)? Há depoimentos autorizados? *Demonstração:*
  seção com placeholder.
- **PEND-007 — Montadoras e marcas:** com quais montadoras trabalham? Quais marcas
  de peças revendem (o PDF não informa o fabricante das peças)? Podemos usar os
  logos das marcas (exige autorização)?
  *Demonstração:* só nomes em texto, a partir do PDF.
- **Institucional:** texto "Sobre nós", descrição curta, slogan, diferenciais reais
  (importação direta, pronta entrega, garantia, prazo de envio), formas de
  pagamento, política de troca e garantia, CEP, feriados. CNPJ pode ir no rodapé?
- **Identidade:** cores e logo resolvidos pelo sistema de logotipos v1.1
  (`DEC-014`). Falta: o cliente aprova a nova versão vetorial da marca? Há algo
  que não gostam?

## Pendências — produto definitivo

### Vendedores e métricas (`DEC-009`, `DEC-011`)

- **PEND-017 — Contatos e vendedores:** quantos são, nomes, funções e WhatsApp de
  proprietário, atendentes e vendedores. Haverá setores (ex.: balcão, vendas
  externas)? Quais contatos aparecem publicamente e quais podem receber clientes?
- **PEND-030 — Escolha e distribuição do atendimento:** permitir que o cliente
  escolha um vendedor ao enviar a lista, preservando compradores parceiros. Definir
  a prioridade entre vendedor do link, vendedor escolhido, último vendedor do
  cliente e regra padrão. Sem preferência, decidir entre contato central, sorteio,
  rodízio, fila de oportunidades ou distribuição por menor carga.
- **PEND-019 — Atribuição:** prazo de validade do link do vendedor (sugestão:
  30 dias) e regra de conflito entre dois links (sugestão: vale o último).
  *Demonstração:* vale o último, sem prazo.
- **PEND-020 — Finalizar o carrinho:** confirmar que é o envio pelo WhatsApp para
  o vendedor da sessão. Sem vendedor, vai para o contato central, que encaminha ao
  grupo dos vendedores (`DEC-011`). *Demonstração:* envio pelo WhatsApp; sem vendedor, número da
  empresa.
- **PEND-027 — Contato central (futuro):** qual número será o contato central no
  produto definitivo? A IA de atendimento ainda não existe e não é para agora;
  quando for, definir a ferramenta (plataforma de atendimento, WhatsApp Business
  API) e quem a desenvolve. *Demonstração:* (49) 99110-0096. Já definido: o vendedor
  que assume fecha a venda pelo WhatsApp e só vira dono dos carrinhos se mandar o
  próprio link para o cliente voltar ao catálogo (`DEC-011`).
- **PEND-021 — Carrinho abandonado:** tempo de inatividade para considerar
  abandonado (sugestão: 30 min a 24 h). *Demonstração:* "não finalizado", sem
  prazo.
- **PEND-022 — Identificação do cliente:** pedir nome/WhatsApp antes de enviar o
  carrinho, para permitir follow-up dos abandonados?
- **PEND-023 — Painel, status e permissões:** definir os status reais do orçamento,
  quem atualiza cada etapa e os motivos de perda. Cada vendedor vê somente os
  próprios orçamentos e métricas? Haverá gestor com visão da equipe? Quem administra
  produtos, promoções, usuários e permissões?
- **PEND-024 — Métricas:** confirmar o funil visualizado → adicionado → orçamento
  solicitado → orçamento enviado → fechado/perdido; indicadores por vendedor e
  produto; tempo até atendimento; motivos de perda; filtros de período, equipe,
  categoria, montadora, origem e status. Não calcular faturamento, margem ou comissão
  sem fonte real.
- **PEND-025 — LGPD:** aviso de cookies/consentimento, política de privacidade e
  termos; quem fornece os textos?
- **PEND-026 — Analytics:** já usam Pixel, Google Analytics ou Google Meu Negócio?

### Catálogo e venda

- **PEND-001 — Preço público:** mostrar preço em todos os produtos (indicado em
  `docs/fontes/dados-empresa.md`)? De onde virão os preços? Muda por volume ou tipo
  de cliente (oficina, frota, revenda)?
- **PEND-003 — Aviso de preço:** texto exato sobre confirmação de preço e
  disponibilidade.
- **PEND-004 — Promoções:** têm data de início/fim? O período é obrigatório ou
  opcional? Ao terminar, o produto permanece publicado sem promoção? Há estoque
  promocional limitado e preço "de" para mostrar riscado?
- **PEND-006 — Mensagem do WhatsApp:** formato desejado da mensagem de orçamento.
- **PEND-010 — Catálogo e estoque real:** quantos produtos existem hoje, com que
  frequência mudam e como trazer todo o estoque real para o sistema. Como o PDF é
  gerado (planilha, sistema/ERP)? Há exportação por planilha ou integração possível?
- **PEND-011 — Operação:** quem cadastra os produtos? Um ou mais administradores?
- **PEND-012 — Venda online:** no futuro querem checkout, pagamento, frete e nota
  fiscal no site, ou o fechamento continua no WhatsApp?
- **PEND-013 — Estoque:** mostrar disponibilidade? Ela bloqueia o botão de
  adicionar?
- **PEND-014 — Compatibilidade e busca por veículo:** os dados de aplicação
  (montadora, modelo, ano) existem organizados ou só no nome do produto? Quem revisa
  a base? O seletor montadora → modelo → ano entra na landing, no catálogo ou nos dois?
- **PEND-015 — Domínio:** já têm domínio? E-mail profissional?
- **PEND-031 — PDF automático:** gerar catálogo completo ou filtrado por categoria
  e montadora? Manter o visual atual ou criar outro? Personalizar com o vendedor?
  Aplicar a mesma regra de preços do site?

### Técnica (interna)

- **PEND-009 — Stack definitiva:** manter Vite pré-renderizado ou migrar para
  Next.js junto com o backend.
