# Planejamento interno de funcionalidades

Documento interno. Não representa requisito aprovado pelo contratante.

## 1. Direção do produto

O produto definitivo deve priorizar:

1. catálogo técnico de peças;
2. geração e acompanhamento de orçamentos;
3. relacionamento entre comprador e vendedor;
4. administração real do catálogo;
5. métricas úteis para a operação comercial.

O fechamento continua pelo atendimento enquanto a MK não decidir por venda online.

## 2. O que já existe no protótipo

- Landing institucional e catálogo com 76 produtos.
- Busca por nome, código MK e código original.
- Filtros por categoria, montadora, modelo, marca e promoção.
- Produto com aplicações e escolha LD, LE ou par.
- Lista de orçamento e mensagem pronta para WhatsApp.
- Link demonstrativo por vendedor.
- Registro local de eventos e carrinhos.
- Painel demonstrativo de métricas.
- Admin visual de produtos, promoções, vendedores e métricas.

Tudo continua somente frontend e sem persistência central (`DEC-001`, `DEC-010`,
`DEC-015`).

## 3. Funcionalidades propostas

| Funcionalidade | Direção | Prioridade | Dependência principal |
| --- | --- | --- | --- |
| Funil até venda fechada/perdida | Manter | Alta | Vendedor atualizar o resultado |
| Painel do vendedor | Manter | Alta | Login, permissões e banco |
| Administração real | Manter | Alta | Backend, banco e autenticação |
| Perfis e permissões | Manter | Alta | Estrutura da equipe da MK |
| Busca montadora → modelo → ano | Manter | Alta | Revisão das aplicações |
| Compartilhar com link do vendedor | Manter | Alta | Regra final de atribuição |
| Promoção com início e fim | Manter | Alta | Regra de encerramento |
| Métricas por produto e vendedor | Manter | Alta | Eventos e orçamentos no servidor |
| PDF automático do catálogo | Manter ajustado | Média | Modelo, filtros e regra de preço |
| QR Code do vendedor | Manter | Média | Links reais de vendedor |
| “Avise-me” | Avaliar depois | Baixa | Estoque real e consentimento |
| Estimativa de frete | Adiar | Baixa | Peso, dimensões e transportadora |
| Pagamento no site | Adiar | Baixa | Decisão comercial da MK |
| IA de atendimento/orçamento | Fora do plano atual | — | Não planejar agora |
| WhatsApp Business API | Fora do plano atual | — | Não planejar agora |

## 4. Funil comercial proposto

```text
Visualizado
→ adicionado à lista
→ orçamento solicitado
→ em atendimento
→ orçamento enviado
→ fechado ou perdido
```

Status recomendados:

- Novo.
- Em atendimento.
- Orçamento enviado.
- Fechado.
- Perdido.
- Expirado.

O sistema cria os primeiros registros automaticamente. Vendedor ou gestor atualiza
as etapas comerciais. Alterações ficam no histórico.

## 5. Métricas propostas

### Gerais

- Visitas, visualizações e adições.
- Orçamentos solicitados e enviados.
- Vendas fechadas e perdidas.
- Conversão entre etapas.
- Tempo até o primeiro atendimento.

### Por produto

- Visualizações, adições, orçamentos e vendas.
- Conversão por produto.
- Motivos de perda.
- Buscas sem resultado.

### Por vendedor

- Oportunidades recebidas e assumidas.
- Orçamentos enviados.
- Fechados, perdidos e conversão.
- Tempo até assumir e responder.
- Oportunidades sem atualização.

### Filtros

- Período, vendedor, equipe, categoria, montadora, produto, origem e status.

Não mostrar faturamento, margem, comissão ou ticket médio sem fonte real.

## 6. Perfis e permissões propostos

| Perfil | Acesso principal |
| --- | --- |
| Administrador/proprietário | Acesso completo, usuários, configurações e métricas |
| Gestor comercial | Equipe, orçamentos, transferências e métricas da equipe |
| Vendedor | Próprios orçamentos, status, compartilhamento e métricas pessoais |
| Operador de catálogo | Produtos, aplicações, imagens, promoções e PDF |

Princípios:

- Usuário individual, sem senha compartilhada.
- Menor acesso necessário para cada função.
- Histórico de alterações importantes.
- Usuário desativado não recebe novos atendimentos.
- Administrador pode transferir um atendimento sem apagar o histórico.

## 7. Busca por veículo

- Atalho na landing e filtro completo no catálogo.
- Montadora, modelo e ano.
- Busca por nome e código continua disponível.
- Produção depende de revisão da base de aplicações.
- Dado incompleto deve aparecer como “confirmar aplicação”.

## 8. Recursos do vendedor

- Painel com orçamentos e status.
- Compartilhar produto, promoção, categoria ou busca com o próprio link.
- QR Code individual.
- PDF do catálogo personalizado, se aprovado.
- Visão somente dos próprios resultados, salvo regra diferente da MK.

## 9. Promoções

- Arte promocional, promoção no produto ou ambos.
- Início e fim opcionais.
- Ativação e encerramento automáticos.
- Produto permanece publicado sem promoção ao encerrar, salvo decisão diferente.
- Métricas da campanha somente com eventos reais.

## 10. Prioridade sugerida

### Fase 1 — operação comercial

1. Banco, autenticação e administração real.
2. Perfis e permissões.
3. Orçamentos com status e histórico.
4. Painel do vendedor.
5. Funil e métricas reais.
6. Links reais de vendedor.

### Fase 2 — catálogo e produtividade

1. Importação ou integração do estoque real.
2. Busca por veículo e revisão das aplicações.
3. Promoções programadas.
4. Compartilhamento rastreado.
5. PDF automático e QR Codes.

### Fase 3 — dependências externas

1. “Avise-me”, se houver estoque confiável e consentimento.
2. Frete, se houver pesos, dimensões e integração.
3. Venda online, somente se aprovada pela MK.

## 11. Demonstrações visuais candidatas

Não implementar antes da seleção interna e da aprovação do contratante:

- painel fictício do vendedor;
- funil ampliado até fechado/perdido;
- matriz visual de permissões;
- busca por veículo com os dados atuais;
- botão “Compartilhar com meu link”;
- promoção com início e fim;
- prévia de PDF automático.

## 12. Decisões ainda necessárias

- Estrutura real da equipe e permissões.
- Status usados no processo de orçamento.
- Responsável por atualizar cada status.
- Motivos de perda acompanhados.
- Indicadores e filtros prioritários.
- Fonte e qualidade das aplicações por veículo.
- Formato do PDF automático.
- Comportamento ao terminar uma promoção.
- Fonte de produtos, preços e estoque.

As respostas do contratante devem ser integradas ao SDD antes da implementação.
