# Orçamento MK Autoparts: como manter o padrão do PDF no site

Documento para quem implementa a geração de orçamento no site (`Projetos/mk-autoparts/frontend`).
Objetivo: o orçamento gerado pelo site sair **igual** ao `MKAutoparts-Orcamento-Exemplo.pdf` (página 1).

## 1. O que enviar junto

| Arquivo / pasta | Para quê |
| --- | --- |
| `MKAutoparts-Orcamento-Exemplo.pdf` | Referência visual. **Só a página 1 é o orçamento.** A página 2 é um guia interno e nunca vai ao cliente. |
| `MKAutoparts-Orcamento-Exemplo.docx` | Referência do Word. |
| `_fonte/gerar_orcamento.py` | Fonte de verdade: tem o HTML, o CSS e as regras de cálculo (`CSS_ORC`, `linha_item`, `pagina_orcamento`, `totais`). |
| `_fonte/padrao.py` | Tokens de cor, dados da empresa e CSS base (`:root`, `.eyebrow`, `h4`). |
| `_fonte/gerar_orcamento_word.py` + `padrao_word.py` | Mesma coisa no Word. |
| `_fonte/fonts/` | Saira (normal e itálico, variável) e IBM Plex Sans, em `woff2`. |
| `_fonte/assets/marca/mk-04-selo-oficial-1080.png` | Selo oficial do topo. |

Não enviar `node_modules/` nem `build/`.

## 2. Os 3 formatos de saída

| Formato | Quem usa | Como gerar | Editável? |
| --- | --- | --- | --- |
| **Link** (`/orcamento`) | Cliente, a partir do carrinho | Página do site. Mesmo conteúdo do PDF, em tela. | O cliente ajusta a lista; o vendedor não. |
| **PDF** | Vendedor envia ao cliente | HTML do orçamento convertido em PDF (A4) | **Sim, antes de gerar**: o vendedor monta e edita o orçamento numa tela e só então gera. O arquivo PDF em si não é editado. |
| **Word (.docx)** | Vendedor que quer ajustar à mão depois | Biblioteca de `.docx` (no exemplo: `python-docx`; no site, `docx` do npm serve) | Sim, o arquivo todo. |

Regra de ouro: **uma só estrutura de dados** (seção 4) alimenta os três. Nunca montar o PDF e o Word com
lógicas de cálculo diferentes.

## 3. Fluxo do vendedor (o ponto que falta no site hoje)

O vendedor não gera o orçamento do carrinho do cliente automaticamente. Ele **monta** o orçamento:

1. Abre "Novo orçamento" (painel de vendedor, junto de `src/admin/`).
2. Escolhe os produtos do catálogo, o lado (LD/LE) e a quantidade. Nome, código e foto vêm do catálogo.
3. Define o preço de cada item, ou marca "sob consulta".
4. Aplica desconto por item (R$ **ou** %) e, se quiser, desconto no total (%).
5. Preenche cliente (opcional), observação e validade (opcional).
6. Vê a **prévia** (o mesmo HTML do PDF) e escolhe: **Gerar PDF**, **Baixar Word** ou **Copiar link**.

Pode vir do carrinho do cliente (o link leva a lista pronta para o vendedor ajustar) ou ser montado do zero.

Campos editáveis pelo vendedor: cliente (nome + contato), itens, quantidades, preços, descontos, validade,
observação. Tudo o mais é fixo (seção 7).

## 4. Dados do orçamento

```ts
type ItemOrcamento = {
  nome: string;              // do catálogo
  detalhe: string;           // "Lado direito (LD) · cód. S03-068"
  foto: string;              // do catálogo
  qtd: number;
  preco: number | null;      // null = "Sob consulta"
  descontoPct?: number;      // OU descontoValor, nunca os dois
  descontoValor?: number;    // R$ por unidade
  promocao?: boolean;        // mostra o selo vermelho "Promoção"
};

type Orcamento = {
  numero: string;            // "ORC-0001", sequencial
  emissao: string;           // dd/mm/aaaa
  validade?: string;         // dd/mm/aaaa, opcional
  vendedor: { nome: string; whatsapp: string };
  cliente?: { nome: string; contato?: string };
  observacao?: string;
  descontoTotalPct?: number;
  itens: ItemOrcamento[];
};
```

## 5. Regras de cálculo (copiar exatamente)

Usar **aritmética decimal** (centavos inteiros ou biblioteca decimal). Nunca `float` direto. Arredondar
sempre com `ROUND_HALF_UP` a 2 casas.

```
precoNovo   = descontoPct ? preco × (1 − pct/100)
            : descontoValor ? preco − valor
            : preco
pctExibido  = (preco − precoNovo) / preco × 100        // só se precoNovo ≠ preco
totalItem   = precoNovo × qtd                          // arredondado

subtotalSemDesconto = Σ (preco × qtd)                  // só itens com preço
subtotalComItens    = Σ totalItem
descontoTotal       = subtotalComItens × descontoTotalPct / 100
TOTAL               = subtotalComItens − descontoTotal
economia            = (subtotalSemDesconto − TOTAL) / subtotalSemDesconto × 100
```

- Item `preco = null`: mostra "Sob consulta" no preço e "—" no total; **fica fora de todas as somas**.
- Formato de moeda: `R$ 4.798,83`.
- Porcentagem: sem decimal se inteira (`10%`), uma casa com vírgula se não (`7,4%`).

**Teste de conferência.** Com os 7 itens do exemplo (`ITENS` em `gerar_orcamento.py`) e desconto total de 3%,
o resultado deve ser:

| Linha | Valor |
| --- | --- |
| Subtotal sem desconto | R$ 5.304,80 |
| Com desconto nos itens | R$ 4.947,25 |
| Desconto no total (3%) | − R$ 148,42 |
| **Total** | **R$ 4.798,83** |
| Economia | 9,5% |

Se o site não bater esses números, o cálculo está diferente do PDF. Vale virar teste automatizado.

## 6. Padrão visual

Fonte da identidade: `docs/design/` e `frontend/design/direcao-visual.md` do projeto.

**Cores**

| Token | Hex | Uso |
| --- | --- | --- |
| navy | `#0B1A36` | Faixa de topo, cabeçalho da tabela, caixa do total, texto |
| navy2 | `#13254A` | Fim do degradê do topo |
| royal | `#1C4FD0` | Destaques, selo de % de desconto, botão |
| vivid | `#3D7EFF` | Filete antes de títulos, linhas diagonais do topo |
| silver | `#D9DEE5` | Bordas |
| paper | `#F3F5F8` | Fundo dos blocos Vendedor/Cliente e do link |
| tint | `#E4ECFF` | Faixa de aviso e linha de economia |
| ink2 | `#5B6678` | Texto secundário, preço antigo |
| promo_red | `#C81E2A` | **Só** o selo "Promoção" |

Amarelo `#FFC531` e vermelho só aparecem em promoção. Nada de outras cores.

**Tipografia**

- Títulos e números de destaque: **Saira itálico**, `font-stretch` 112–120%, peso 600–800. O "Orçamento" do topo
  é 28 pt / 800 / stretch 120%. O total é 17 pt / 800 / stretch 118%.
- Texto e tabela: **IBM Plex Sans**, 8,2–9,4 pt.
- Rótulos pequenos (cabeçalho da tabela, "Observação", "Validade"): Saira 600, 6,6–7 pt, caixa alta,
  `letter-spacing: .12em`.
- Números: `font-variant-numeric: tabular-nums` (colunas alinhadas).
- No Word, usar **Arial** (fonte de sistema).

**Geometria**

- A4 (210 × 297 mm), margem lateral 15 mm, fundo **branco**.
- Topo: faixa azul-marinho de 50 mm com degradê, linhas diagonais a 78° e brilho radial no canto inferior direito.
  Selo de 28 mm à esquerda; título à direita do selo; Número / Emissão / Válido até em grade de 2 colunas à direita.
- Logo abaixo: faixa `tint` com "Documento de exemplo" (remover no orçamento real).
- Cantos arredondados de 3,2 mm nos blocos e na tabela. Cabeçalho da tabela em navy.
- Itálico de 12° nos filetes (`transform: skewX(-12deg)`).

**Ordem dos blocos (página 1)**

1. Topo (selo, "Orçamento", número, emissão, validade)
2. Vendedor | Cliente (dois blocos lado a lado)
3. Tabela de itens: foto 15 mm · Produto · Qtd. 11 mm · Preço unitário 36 mm · Total 27 mm
4. Embaixo, duas colunas: notas (Observação, Validade, Condições) à esquerda; caixa de totais (66 mm) à direita
5. Faixa do link: "Abrir este orçamento online" + botão "Falar com {primeiro nome do vendedor}"
6. Rodapé: razão social, CNPJ, endereço, Instagram

**Exibição de preço**

- Com desconto: preço antigo riscado em cima, preço novo embaixo, selo azul arredondado `−10%` ao lado.
- Sem desconto: só o preço.
- Selo "Promoção": vermelho, caixa alta, ao lado do nome do produto.
- Subtotal sem desconto aparece riscado na caixa de totais, acima do valor final.
- Linha final de economia: "Desconto total de X% sobre os itens com preço".

## 7. Regras de conteúdo (não negociáveis)

- **Nunca mostrar estoque** no orçamento, em nenhum formato.
- Item sem preço = "Sob consulta", fora do total.
- Logo é o selo oficial circular, sem redesenhar. Nunca usar a versão cromada em material gráfico.
- Remover a faixa "Documento de exemplo" e o texto "Valores fictícios" no orçamento real.
- Texto fixo da MK (hoje é de exemplo, **a MK ainda precisa aprovar**): condições, texto de validade, texto de
  "sob consulta", dados do rodapé. Guardar em um único lugar de configuração, não espalhado no código.
- Dados da empresa (de `padrao.py`):
  - Mk Auto Parts LTDA · CNPJ 41.577.754/0001-96
  - Av. Corina Caon, 103 – Ponte Grande, Lages – SC
  - Instagram @mk.autoparts__
  - WhatsApp do vendedor vem do cadastro do vendedor, não é fixo.

## 8. Como gerar o PDF

Caminho recomendado, o mesmo que produziu o exemplo: **renderizar o HTML/CSS do orçamento e imprimir em PDF
com Chrome headless** (`page.pdf` com `format: 'A4'`, `printBackground: true`, margens 0, `preferCSSPageSize: true`).

- O CSS do exemplo (`CSS_ORC` + base de `padrao.py`) já está pronto para impressão. Reaproveitar como está.
- Esperar `document.fonts.ready` antes de imprimir, senão a Saira não carrega e o PDF sai com fonte errada.
- Em `@media print` manter `-webkit-print-color-adjust: exact`, senão o fundo azul some.
- Se a tabela passar de uma página: repetir o cabeçalho (`thead { display: table-header-group }`) e não quebrar
  linha no meio (`tr { break-inside: avoid }`). O exemplo tem 7 itens e cabe em uma página; orçamentos reais
  vão passar disso. Rodapé e caixa de totais vão na última página.
- O `pdf.mjs` da pasta `_fonte` mostra o uso do puppeteer e o aviso de conteúdo que estoura a página.

Alternativa: gerar o PDF no navegador do vendedor com `window.print()`. Funciona, mas o resultado depende do
navegador. Para padrão fixo, preferir o servidor.

## 9. Como gerar o Word

- Mesma estrutura: topo azul, blocos Vendedor/Cliente, tabela com cabeçalho navy, totais, rodapé.
- Arial no lugar da Saira/IBM Plex.
- Fotos dos produtos convertidas para PNG (Word não lê `webp`).
- Veja `gerar_orcamento_word.py` e `padrao_word.py` para tamanhos em cm, sombreamento de célula e bordas.
- Conferir abrindo no Word de verdade. Visualizadores diferentes paginam diferente.

## 10. Checklist antes de dar como pronto

- [ ] Teste de cálculo da seção 5 passa (R$ 4.798,83).
- [ ] PDF de um orçamento com os 7 itens do exemplo é visualmente igual à página 1 do PDF de referência.
- [ ] Fonte Saira aparece nos títulos e no total do PDF gerado.
- [ ] Fundo azul do topo aparece no PDF (impressão de fundo ligada).
- [ ] Item "sob consulta" mostra "Sob consulta" e "—", e não entra no total.
- [ ] Nenhuma quantidade de estoque em lugar nenhum.
- [ ] Faixa "Documento de exemplo" removida.
- [ ] Orçamento com mais de 7 itens quebra de página sem cortar linha.
- [ ] Word abre sem aviso e mantém cores e colunas.
- [ ] Link do orçamento mostra o mesmo conteúdo e totais que o PDF.

## 11. Decisões que ainda dependem da MK

Estão na página 2 do PDF de exemplo. O sócio pode implementar com padrão provisório e deixar configurável:

1. O vendedor edita as condições por orçamento, ou são sempre iguais?
2. Quais dados da empresa vão no rodapé (telefone, e-mail, site)?
3. Mostrar prazo de entrega ou frete?
4. Assinatura, numeração por vendedor ou mais de uma via?
5. Fundo claro (como o exemplo, bom para imprimir) ou escuro?
