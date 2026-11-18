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

| ID | Mudança | Decisão / regra | Estado | Depende de |
| --- | --- | --- | --- | --- |
| REU-01 | Cliente com link de vendedor não vê escolha de outro vendedor; vale o último link aberto | `DEC-017`, `RN-07`, `RF-26` | Feito | — |
| REU-02 | Sem link: "Solicitar orçamento" distribui por rodízio (pilha circular, ordem de chegada) | `DEC-017`, `RN-11`, `RF-27` | Feito | — |
| REU-03 | Sem link: seção com foto e nome dos vendedores perto do botão de orçar; a escolha leva ao WhatsApp do vendedor e consome a vez | `DEC-017`, `RN-12`, `RF-28` | Feito (Daniel e Vitor com foto) | Fotos dos outros seis (`PEND-034`) |
| REU-04 | Painel do vendedor em `/vendedor`: orçamento com preços e desconto | `DEC-018`, `RN-13`, `RF-30`, `RF-31` | Feito | — |
| REU-05 | Link do orçamento com itens, preços e desconto, atribuição travada | `DEC-018`, `RN-13`, `RF-33` | Feito | — |
| REU-06 | PDF e Word padronizados com a cara da MK | `DEC-018`, `RN-13`, `RF-32` | Feito no modelo novo (`DEC-025`) | Confirmações fiscais e textos fixos (`PEND-035`) |
| REU-07 | Remover todas as quantidades públicas, inclusive o contador de resultados | `DEC-019`, `RN-14`, `RF-34` | Feito | — |
| REU-08 | Logo principal: selo oficial | `DEC-020` | Feito (cabeçalho, admin, área do vendedor e documento) | — |
| REU-09 | Emendas em corte inclinado (corrigir documentação) | `direcao-visual.md` | Feito | — |
| REU-10 | Login simulado para `/vendedor` e `/admin`, contas controladas pelo admin principal | `DEC-021`, `RF-35` | Feito (`/vendedor`, sem senha) | — |
| REU-11 | Vendedores reais no protótipo e vínculo das fotos | `DEC-022`, `03-domain-model.md` | Feito (oito vendedores; fotos de Daniel e Vitor) | Fotos dos outros seis (`PEND-034`) |
| REU-15 | Hero com mosaico de peças no lugar da foto do caminhão | `DEC-024`, `RF-38`, `AC-13` | Feito (Lighthouse medido em PROTO-05) | — |
| REU-13 | Aviso fora do horário comercial (segunda a sexta, 8h às 18h): resposta indeterminada | `DEC-023`, `RN-15`, `RF-36` | Feito | — |
| REU-14 | Orçamentos ativos no painel do vendedor com aviso de alteração do cliente | `DEC-018`, `RN-13`, `RF-37` | Feito | — |

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

Escopo revisado pelo responsável e aplicado (`DEC-026`). Cada melhoria é demonstração
simulada; nenhuma vira requisito do produto definitivo antes da aprovação da MK.

| # | Melhoria | Decisão | Tarefa |
| --- | --- | --- | --- |
| M1 | Busca por veículo: marca → modelo → ano | Feito | REU-16 |
| M2 | Lembrar o caminhão do cliente | Fora por agora; pode entrar no futuro | — |
| M3 | "Compartilhar com meu link" para o vendedor | Feito | REU-17 |
| M4 | QR Code do vendedor | Feito | REU-18 |
| M5 | Promoção com início e fim opcionais | Feito | REU-19 |
| M6 | Prévia do documento | Já existe (`/vendedor/documento`) | — |
| M7 | Duplicar orçamento | Não precisa: o vendedor já edita o orçamento | — |

### M1 — Busca por veículo (REU-16)

- **Hoje:** o catálogo já filtra por marca do veículo e modelo (`montadora` e `modelo` na
  URL, `atendeAplicacao` em `src/content/catalogo.ts`). Falta o **ano** e uma entrada
  direta na landing.
- **Como:** um terceiro seletor "Ano", habilitado depois do modelo, e o parâmetro `ano` na
  URL (`/catalogo?montadora=scania&modelo=ntg&ano=2018`). A lista de anos vem dos dados
  (menor `anoInicio` até o ano atual). Um produto atende quando o ano está entre
  `anoInicio` e `anoFim` (sem `anoFim` = até hoje). Na landing, um bloco compacto "Buscar
  pelo veículo" (marca → modelo → ano → "Ver peças") abaixo da busca do hero ou junto da
  faixa de marcas, levando ao catálogo filtrado. Chip "Ano 2018" removível, como os demais.
- **Ponto de atenção:** só **32 das 116 aplicações** têm ano. Decisão do responsável: com
  ano, aparecem primeiro as peças com o ano e depois as sem ano, com asterisco amarelo
  ("Ano não cadastrado no sistema").
- **Testes:** regra pura de ano em `catalogo.test.ts` (dentro, fora, sem fim, sem ano).

### M3 — Compartilhar com meu link (REU-17)

- **Hoje:** o vendedor entra em `/vendedor` (sessão no `sessionStorage`,
  `mk-vendedor-sessao`) e o link pessoal dele é `?v=<codigo>`.
- **Como:** com o vendedor logado, aparece nas páginas públicas um botão discreto
  **"Compartilhar com meu link"** no produto, no catálogo (busca e filtros atuais) e nos
  cartões de categoria. Ele gera a URL da página atual com `?v=<codigo>` e:
  no celular abre o compartilhamento nativo (`navigator.share`, direto no WhatsApp); no
  computador copia o link e mostra "Link copiado". Mensagem pronta: "Olá! Separei esta
  peça para você: <nome> — <link>". Na área do vendedor, um atalho "Meu link" com copiar.
- **Regras:** o cliente que abre o link fica preso ao vendedor (`DEC-017`). O botão nunca
  aparece para o cliente comum. A visita do próprio vendedor não muda a atribuição dele
  mesmo.

### M4 — QR Code do vendedor (REU-18)

- **Como:** na área do vendedor, cartão "Meu QR Code" com o QR do link pessoal
  (`/?v=<codigo>`), o selo da MK e o nome do vendedor; botões "Baixar imagem" (PNG) e
  "Imprimir" (para balcão ou cartão de visita).
- **Custo:** uma biblioteca pequena de QR (ex.: `qrcode`), carregada só na área do
  vendedor, com registro em `DEC-003`. Se ficar complexo ou pesado, sai do escopo.

### M5 — Promoção com início e fim (REU-19)

- **Como:** `Promocao` ganha `inicio?` e `fim?` (datas). Sem datas, a promoção vale
  sempre (como hoje). Com datas, só aparece na landing, no catálogo e no produto dentro do
  período (fuso de Brasília). No admin de demonstração, os campos "Início" e "Fim"
  (opcionais) na tela de Promoções, com o estado "Agendada", "Ativa" ou "Encerrada".
- **Limite da demonstração:** o admin não altera o site (`DEC-015`); para mostrar o
  efeito no site, uma promoção dos dados recebe datas de exemplo. A regra final depende de
  `PEND-004`.
- **Testes:** regra pura de vigência (antes, durante, depois, só início, só fim).

## 5. Ordem sugerida de execução

1. Limpeza sem risco: remover quantidades públicas (REU-07) e trocar o logo principal
   pelo selo (REU-08).
2. Atribuição travada e fim da lista (REU-01 a REU-03), com a fila do rodízio no
   admin de demonstração.
3. Login simulado, painel do vendedor, preços e desconto, link, PDF e Word
   (REU-10, REU-04 a REU-06).
4. As melhorias aprovadas, nesta ordem: M1 (REU-16), M5 (REU-19), M3 (REU-17) e M4
   (REU-18).
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

- **Textos faltantes no site (PROTO-06):** o documento de apresentação das funcionalidades
  da próxima reunião deve listar, de forma clara, o que ainda é provisório e depende da
  MK: texto "Sobre nós", seção "Clientes" (`PEND-008`), CEP, horário em feriados, CNPJ no
  site e as frases das artes ("peças originais", "grande variedade", "atendimento
  especializado").

- Fotos dos vendedores (`PEND-034`).
- Modelo do PDF e do Word (produzido pelo responsável) e o que o vendedor pode editar
  (`PEND-035`, para a contratante depois do padrão pronto).
