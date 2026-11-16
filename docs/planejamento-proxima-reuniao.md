# Planejamento da próxima reunião de apresentação

Documento interno. Reúne as mudanças pedidas pela MK na primeira apresentação, as
melhorias propostas pela equipe e o caminho até o orçamento. Requisitos aprovados
ficam no `sdd_kit/`; tarefas ativas, em `TASKS.md`.

## 1. Foco

A MK recebeu bem a proposta e pediu mudanças. A próxima versão do protótipo concentra
dois focos:

1. **Cliente sozinho no site:** achar a peça certa com pouco esforço e pedir o
   orçamento sem dúvida de a quem enviar.
2. **Vendedor da MK:** montar o orçamento de um cliente, mandar por link ou documento
   bonito e manter o cliente dele só com ele.

Regra de negócio central: cada vendedor tem clientes próprios. Quem chega pelo link do
vendedor é dele e não escolhe outro (`DEC-017`).

## 2. Mudanças pedidas

Respostas do responsável aplicadas ao SDD. Decisões: `DEC-017` a `DEC-021`.

| ID | Mudança | Decisão / regra | Estado do SDD | Depende de |
| --- | --- | --- | --- | --- |
| REU-01 | Cliente com link de vendedor não vê escolha de outro vendedor; vale o último link aberto | `DEC-017`, `RN-07`, `RF-26` | Documentado | — |
| REU-02 | Sem link: "Solicitar orçamento" distribui por rodízio (pilha circular, ordem de chegada) | `DEC-017`, `RN-11`, `RF-27` | Documentado | — |
| REU-03 | Sem link: seção com foto e nome dos vendedores perto do botão de orçar; a escolha leva ao WhatsApp do vendedor e consome a vez | `DEC-017`, `RN-12`, `RF-28` | Documentado | Fotos reais (`PEND-034`) |
| REU-04 | Painel do vendedor em `/vendedor`: orçamento com preços e desconto | `DEC-018`, `RN-13`, `RF-30`, `RF-31` | Documentado | — |
| REU-05 | Link do orçamento com itens, preços e desconto, atribuição travada | `DEC-018`, `RN-13`, `RF-33` | Documentado | REU-04 |
| REU-06 | PDF e Word padronizados com a cara da MK | `DEC-018`, `RN-13`, `RF-32` | Documentado | Bibliotecas novas (`DEC-003`), modelo em `PEND-035` |
| REU-07 | Remover todas as quantidades públicas, inclusive o contador de resultados | `DEC-019`, `RN-14`, `RF-34` | Documentado | — |
| REU-08 | Logo principal: selo oficial | `DEC-020` | Documentado | Composição do cabeçalho com um selo circular |
| REU-09 | Emendas em corte inclinado (corrigir documentação) | `direcao-visual.md` | Feito | — |
| REU-10 | Login simulado para `/vendedor` e `/admin`, contas controladas pelo admin principal | `DEC-021`, `RF-35` | Documentado | — |
| REU-11 | Vendedores reais no protótipo e vínculo das fotos | `DEC-022`, `03-domain-model.md` | Documentado | Fotos (`PEND-034`) |
| REU-15 | Hero com mosaico de produtos no lugar da foto do caminhão | `DEC-024`, `RF-38`, `AC-13` | Documentado | Lista curada de produtos e composição na implementação |
| REU-13 | Aviso fora do horário comercial (segunda a sexta, 8h às 18h): resposta indeterminada | `DEC-023`, `RN-15`, `RF-36` | Documentado | — |
| REU-14 | Orçamentos ativos no painel do vendedor com aviso de alteração do cliente | `DEC-018`, `RN-13`, `RF-37` | Documentado | REU-04, REU-05 |

Locais com quantidade a remover (`RN-14`): `Montadoras.tsx` (faixa de marcas),
`Categorias.tsx` (cartões), `Sobre.tsx` (números com `CountUp`), `Catalogo.tsx` e
`site.ts` (`pecas()`, `resultados()`, `verResultados()`).

Fotos dos vendedores: `frontend/public/img/vendedores/<codigo>.webp`, onde `codigo` é o
do link `?v=` (campo `foto` em `src/content/vendedores.ts`).

## 3. Como cada ponto funciona no protótipo e no produto real

| Ponto | Protótipo (somente frontend) | Produto definitivo |
| --- | --- | --- |
| Atribuição por link | `localStorage` do navegador | Servidor, sem prazo de validade (`DEC-017`) |
| Rodízio | Ponteiro no `localStorage`; demonstra a sequência de um navegador | Fila no servidor, igual para todos os visitantes |
| Vendedores | Os oito da MK com nome e WhatsApp reais, iniciais no lugar da foto | Cadastro real com foto, WhatsApp e permissões |
| Contas | Login simulado em `/vendedor` e `/admin` | Login real; o admin principal libera as contas |
| Orçamento do vendedor | Montado no navegador; ativos e avisos no `localStorage` (funciona entre abas do mesmo navegador) | Salvo no servidor, com histórico, status e métricas; aviso entre aparelhos |
| Aviso fora do horário comercial | Constante de configuração (segunda a sexta, 8h às 18h) | Igual; sem horário por vendedor (`DEC-023`) |
| Link do orçamento | Orçamento codificado na URL (o cliente consegue alterar os valores); validade e exclusão só no navegador do vendedor | Orçamento salvo no servidor; o link só aponta para ele; validade e exclusão valem para todos |
| PDF e Word | Gerados no navegador | Gerados no servidor com modelo versionado |

Só a coluna da direita é decisão final. A do meio é demonstração (`AGENTS.md`).

## 4. Melhorias a apresentar

O responsável quer apresentar todas na reunião. Cada uma entra como demonstração
simulada; nenhuma vira requisito antes da aprovação da MK.

| # | Melhoria | Foco | Observação |
| --- | --- | --- | --- |
| M1 | Busca por veículo no topo da landing e do catálogo: marca → modelo → ano | Cliente | Já existe filtro por marca e modelo; falta o ano e o destaque de "meu caminhão" |
| M2 | Lembrar o caminhão do cliente e filtrar o catálogo por ele | Cliente | Usa `localStorage`, sem cadastro |
| M3 | Botão "Compartilhar com meu link" em produto, categoria e busca (vendedor logado) | Vendedor | Mantém a atribuição do vendedor |
| M4 | QR Code do vendedor | Vendedor | Leva ao link dele; útil no balcão |
| M5 | Promoção com início e fim | Catálogo | Depende de `PEND-004` para a regra final |
| M6 | Prévia do documento antes de gerar | Vendedor | Mostra como o cliente verá |
| M7 | Duplicar e reusar orçamentos anteriores no painel | Vendedor | Na demonstração, histórico só da sessão do navegador |

## 5. Ordem sugerida de execução

1. Limpeza sem risco: remover quantidades públicas (REU-07) e trocar o logo principal
   pelo selo (REU-08).
2. Atribuição travada e fim da lista (REU-01 a REU-03), com a fila do rodízio no
   admin de demonstração.
3. Login simulado, painel do vendedor, preços e desconto, link, PDF e Word
   (REU-10, REU-04 a REU-06).
4. As melhorias M1 a M7.
5. Validação da Etapa 4 do agente (build, prerender, screenshots, console,
   rolagem lateral) e atualização de `SESSION.md`.

PDF e Word (REU-06) exigem duas bibliotecas novas no navegador, com registro em
`DEC-003`. É a única decisão técnica aberta e será tomada junto com a implementação,
pela menor dependência que gere um arquivo bom.

Roteiro do documento: (1) o responsável produz o modelo e o coloca no repositório;
(2) a implementação monta um padrão com a marca MK a partir dele; (3) o padrão é mostrado
à contratante, com a pergunta do que ela quer que o vendedor possa editar além do já
definido (`PEND-035`).

## 6. Do protótipo ao orçamento

Depois da reunião, o orçamento ao cliente se baseia nos módulos abaixo. Esta lista é
um esqueleto de escopo, sem prazos nem valores, que serão montados com as respostas
do cliente.

1. Base: backend, banco, autenticação, perfis e permissões, segurança e LGPD.
2. Catálogo real: cadastro, importação do estoque, imagens e aplicações por veículo.
3. Atendimento: rodízio, escolha de vendedor, atribuição e vendedores reais.
4. Painel do vendedor: orçamentos, link, documento, status e métricas pessoais.
5. Administração: produtos, promoções com vigência, usuários e métricas da equipe.
6. Publicação: domínio, hospedagem, e-mail, monitoramento e suporte.
7. Depois do uso: confirmação de atendimento e retorno do vendedor sobre a venda, no
   painel (`DEC-018`).
8. Opcionais: PDF automático do catálogo, QR Code, "Avise-me", frete e venda online.

Dependências do dimensionamento: `PEND-010` (estoque), `PEND-014` (aplicações),
`PEND-017` e `PEND-023` (equipe e permissões), `PEND-009` (stack) e `PEND-035`
(documento).

## 7. Perguntas abertas

- Fotos dos vendedores (`PEND-034`).
- Modelo do PDF e do Word (produzido pelo responsável) e o que o vendedor pode editar
  (`PEND-035`, para a contratante depois do padrão pronto).
