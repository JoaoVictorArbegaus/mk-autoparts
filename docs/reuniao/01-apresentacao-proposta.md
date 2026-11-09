# MK Autoparts — catálogo e sistema comercial

> Documento breve para apresentação. O sistema atual é um protótipo: demonstra a
> experiência, mas ainda não possui banco de dados ou operação real.

## Objetivo

Substituir o catálogo em PDF por uma ferramenta fácil de consultar e compartilhar,
ajudando compradores a encontrar peças e vendedores a receber solicitações mais
organizadas.

## Jornada demonstrada

```text
Encontrar a peça
→ conferir código e aplicação
→ escolher LD, LE ou par
→ montar a lista
→ enviar a solicitação
→ concluir o atendimento com a MK Autoparts
```

## O que já está no protótipo

| Funcionalidade | O que demonstra |
| --- | --- |
| Página institucional | Empresa, contatos, localização e acesso ao catálogo |
| Catálogo online | 76 produtos organizados em 7 categorias |
| Busca técnica | Nome, código MK e código original |
| Filtros | Categoria, montadora, modelo, marca e promoção |
| Página do produto | Imagem, códigos, aplicação e produtos relacionados |
| Peças LD/LE | Escolha de lado direito, esquerdo ou par |
| Promoções | Três artes recebidas, com preço promocional |
| Lista de orçamento | Produtos, quantidades e observação do comprador |
| Mensagem pronta | Solicitação organizada para o atendimento |
| Link de vendedor | Demonstração de atendimento atribuído ao vendedor |
| Painel de métricas | Demonstração de cliques, listas, funil e vendedores |
| Ambiente administrativo | Demonstração de produtos, promoções e vendedores |
| Celular e computador | Interface responsiva e páginas compartilháveis |

## Como funciona hoje

- Somente promoções mostram preço.
- Os demais produtos são adicionados à lista e orçados no atendimento.
- A lista pode conter quantidades, lados e observação.
- O painel e o admin usam dados de demonstração.
- Alterações administrativas não são salvas no catálogo público.

## Evoluções propostas para o sistema definitivo

### Orçamentos e vendedores

- Painel individual do vendedor.
- Orçamentos com status: novo, em atendimento, enviado, fechado ou perdido.
- Histórico e transferência de atendimento.
- Compartilhamento de produto ou promoção com o link do vendedor.
- QR Code individual.

### Métricas comerciais

- Produto visto → adicionado → orçamento solicitado → venda fechada.
- Conversão por produto, vendedor, equipe e origem.
- Tempo até o primeiro atendimento.
- Orçamentos sem atualização.
- Motivos de perda.

### Administração e permissões

- Administrador/proprietário com acesso completo.
- Gestor com visão da equipe.
- Vendedor com acesso aos próprios orçamentos.
- Operador responsável por produtos e promoções.
- Usuários individuais e histórico de alterações.

### Catálogo

- Busca por montadora → modelo → ano.
- Importação ou integração do estoque real.
- Revisão das aplicações dos produtos.
- PDF do catálogo gerado automaticamente.
- PDF ou link personalizado por vendedor.

### Promoções

- Promoção por arte, por produto cadastrado ou pelas duas formas.
- Data de início e fim.
- Ativação e encerramento automáticos.
- Métricas por promoção.

## Prioridade sugerida

| Prioridade | Funcionalidades |
| --- | --- |
| 1 — Operação comercial | Admin real, usuários, permissões, orçamentos, painel do vendedor e métricas |
| 2 — Catálogo | Estoque real, busca por veículo, aplicações e promoções programadas |
| 3 — Produtividade | PDF automático, QR Codes e compartilhamento rastreado |
| Depois | “Avise-me”, frete e venda online, se fizerem sentido para a MK |

## Fora do planejamento atual

- IA de atendimento ou orçamento.
- Integração com WhatsApp Business API.
- Pagamento, frete e nota fiscal sem aprovação prévia da MK.

## Limites do protótipo

- Sem backend e banco de dados.
- Sem login ou permissões reais.
- Sem estoque sincronizado.
- Sem preços fora das promoções.
- Sem métricas compartilhadas entre computadores.
- Sem pagamento no site.

## Próximo passo

Preencher o documento de validação com a MK Autoparts. As respostas definirão o
escopo, as prioridades e a proposta do sistema definitivo.
