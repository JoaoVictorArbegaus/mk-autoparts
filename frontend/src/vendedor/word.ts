/*
 * Word (.docx) do orçamento, gerado no navegador com a biblioteca docx (DEC-003), a partir da mesma
 * estrutura do PDF (montarDocumento). Segue o modelo (docs/pfd-regras: gerar_orcamento_word.py e
 * padrao_word.py): Arial, mesmas informações e mesma ordem em tabelas editáveis, topo e cabeçalho da
 * tabela em azul-marinho, código de venda em amarelo, rodapé da empresa em todas as páginas. As fotos
 * .webp viram PNG (o Word não lê webp). Carregado só quando o vendedor pede o Word.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlignTable as VerticalAlign,
  WidthType,
  type ITableCellBorders,
} from 'docx';
import { documento as d, primeiroNome } from '../content/documento';
import type { DadosDocumento } from './Documento';

const COR = { navy: '0B1A36', royal: '1C4FD0', vivid: '3D7EFF', silver: 'D9DEE5', paper: 'F3F5F8', ink2: '5B6678', branco: 'FFFFFF', promo: 'C81E2A', amarelo: 'FFC531' };
const cm = (n: number) => Math.round(n * 567);
const LARG = 17; // cm úteis (A4 com margens de 2 cm), como no modelo
const DIR = AlignmentType.RIGHT;

const nada = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const semBorda: ITableCellBorders = { top: nada, bottom: nada, left: nada, right: nada };
const linha = (cor: string, size: number) => ({ style: BorderStyle.SINGLE, size, color: cor });
const bordaBaixo = (cor = COR.silver): ITableCellBorders => ({ ...semBorda, bottom: linha(cor, 4) });
const bordaToda = (cor = COR.silver): ITableCellBorders => ({ top: linha(cor, 6), bottom: linha(cor, 6), left: linha(cor, 6), right: linha(cor, 6) });

type Txt = { t: string; tam?: number; cor?: string; negrito?: boolean; italico?: boolean; riscado?: boolean; caixaAlta?: boolean };
const run = (x: Txt) =>
  new TextRun({ text: x.caixaAlta ? x.t.toUpperCase() : x.t, font: 'Arial', size: Math.round((x.tam ?? 8.5) * 2), color: x.cor ?? COR.navy, bold: x.negrito, italics: x.italico, strike: x.riscado });
const par = (linhas: Txt | Txt[], alinhar?: (typeof AlignmentType)[keyof typeof AlignmentType], depois = 20) =>
  new Paragraph({ alignment: alinhar, spacing: { before: 0, after: depois, line: 252 }, children: (Array.isArray(linhas) ? linhas : [linhas]).map(run) });
const rotulo = (t: string, depois = 0) => par({ t, tam: 6.5, cor: COR.royal, negrito: true, caixaAlta: true }, undefined, depois);

type OpCelula = { larg: number; fundo?: string; bordas?: ITableCellBorders; margem?: [number, number]; alinharV?: (typeof VerticalAlign)[keyof typeof VerticalAlign]; colunas?: number };
function celula(filhos: (Paragraph | Table)[], o: OpCelula) {
  return new TableCell({
    children: filhos,
    width: { size: cm(o.larg), type: WidthType.DXA },
    shading: o.fundo ? { type: ShadingType.CLEAR, fill: o.fundo, color: 'auto' } : undefined,
    borders: o.bordas ?? semBorda,
    margins: { top: cm(o.margem?.[0] ?? 0.1), bottom: cm(o.margem?.[0] ?? 0.1), left: cm(o.margem?.[1] ?? 0.2), right: cm(o.margem?.[1] ?? 0.2) },
    verticalAlign: o.alinharV ?? VerticalAlign.CENTER,
    columnSpan: o.colunas,
  });
}
const tabela = (linhas: TableRow[], larguras: number[]) =>
  new Table({ rows: linhas, width: { size: cm(larguras.reduce((a, b) => a + b, 0)), type: WidthType.DXA }, columnWidths: larguras.map(cm), alignment: AlignmentType.CENTER });
const espaco = (pt: number) => new Paragraph({ spacing: { before: 0, after: Math.round(pt * 20) }, children: [] });

/** .webp/.jpg → PNG pelo canvas do navegador (o Word não lê webp). */
async function png(src: string, larguraCm: number): Promise<ImageRun | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    // Reduz para 2× o tamanho impresso: nítido no papel e o .docx fica leve.
    const alvo = Math.round(larguraCm * 37.8 * 2);
    const fator = Math.min(1, alvo / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * fator));
    c.height = Math.max(1, Math.round(img.naturalHeight * fator));
    const g = c.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/png'));
    if (!blob) return null;
    const largura = Math.round(larguraCm * 37.8);
    return new ImageRun({ type: 'png', data: new Uint8Array(await blob.arrayBuffer()), transformation: { width: largura, height: Math.round((largura * img.naturalHeight) / img.naturalWidth) } });
  } catch {
    return null;
  }
}

export async function gerarWord(dados: DadosDocumento): Promise<Blob> {
  const r = d.rotulos;
  const t = dados.totais;
  const nomeCurto = primeiroNome(dados.vendedor.nome);
  const selo = await png('/img/marca/selo-320.webp', 2.0);
  const fotos = await Promise.all(dados.linhas.map(l => png(l.foto, 0.8)));

  // 1. Topo azul: selo, título; à direita nº, código de venda (amarelo), emissão e validade.
  const branco = { cor: COR.branco, negrito: true, tam: 8 };
  const meta = [
    par({ t: `${r.numero}   ${dados.numero}`, ...branco }),
    par({ t: `${r.codigoVenda}   ${dados.codigoVenda}`, ...branco, cor: COR.amarelo }),
    par({ t: `${r.emissao}   ${dados.emissao}`, ...branco }),
    ...(dados.validade ? [par({ t: `${r.validoAte}   ${dados.validade}`, ...branco })] : []),
  ];
  const topo = tabela(
    [
      new TableRow({
        children: [
          celula([new Paragraph({ children: selo ? [selo] : [] })], { larg: 2.6, fundo: COR.navy, margem: [0.3, 0.4] }),
          celula([par({ t: d.eyebrow, tam: 6.5, cor: COR.vivid, negrito: true, caixaAlta: true }), par({ t: d.titulo, tam: 24, cor: COR.branco, negrito: true, italico: true })], { larg: LARG - 2.6 - 6.4, fundo: COR.navy, margem: [0.3, 0.4] }),
          celula(meta, { larg: 6.4, fundo: COR.navy, margem: [0.3, 0.4] }),
        ],
      }),
    ],
    [2.6, LARG - 2.6 - 6.4, 6.4],
  );

  // 2. Vendedor (estreito) | Cliente (largo), com um vão entre os quadros.
  const kv = new Map(dados.cliente.campos);
  const juntar = (...chaves: string[]) =>
    chaves
      .filter(k => kv.get(k))
      .map(k => `${k}: ${kv.get(k)}`)
      .join('   ·   ');
  const linhasCliente = [juntar(r.comprador), juntar(r.cnpj, r.inscricaoEstadual, r.cpf), juntar(r.email, r.fone)].filter(Boolean);
  const quadro = { fundo: COR.paper, bordas: bordaToda(), margem: [0.2, 0.3] as [number, number], alinharV: VerticalAlign.TOP };
  const lVend = LARG * 0.34;
  const lVao = 0.3;
  const partes = tabela(
    [
      new TableRow({
        children: [
          celula(
            [rotulo(r.vendedor), par({ t: dados.vendedor.nome, tam: 10, negrito: true }), ...(dados.vendedor.whatsappRotulo ? [par({ t: `${r.whatsapp}  ${dados.vendedor.whatsappRotulo}`, tam: 8, cor: COR.ink2 })] : [])],
            { larg: lVend, ...quadro },
          ),
          celula([new Paragraph({ children: [] })], { larg: lVao }),
          celula([rotulo(r.cliente), par({ t: dados.cliente.destaque, tam: 10, negrito: true }), ...linhasCliente.map(x => par({ t: x, tam: 8, cor: COR.ink2 }, undefined, 10))], { larg: LARG - lVend - lVao, ...quadro }),
        ],
      }),
    ],
    [lVend, lVao, LARG - lVend - lVao],
  );

  // 3. Entrega | Cobrança | Transportadora/frete + prazo de pagamento.
  const blocoEntrega = dados.entrega
    ? tabela(
        [
          new TableRow({
            children: [
              [rotulo(r.entrega), par({ t: dados.entrega.entrega, tam: 8 })],
              [rotulo(r.cobranca), par({ t: dados.entrega.cobranca, tam: 8 })],
              [rotulo(r.transportadora), par({ t: dados.entrega.transportadora, tam: 8 }, undefined, 60), rotulo(r.prazoPagamento), par({ t: dados.entrega.prazo, tam: 8 })],
            ].map((filhos, i) => celula(filhos, { larg: LARG * (i < 2 ? 0.34 : 0.32), bordas: bordaToda(), margem: [0.2, 0.3], alinharV: VerticalAlign.TOP })),
          }),
        ],
        [LARG * 0.34, LARG * 0.34, LARG * 0.32],
      )
    : null;

  // 4. Itens: cabeçalho navy repetido em cada página; linha nunca quebra no meio.
  const larg = [1.0, 4.9, 0.8, 0.8, 2.6, 1.1, 1.2, 2.1, 2.5];
  const cab = new TableRow({
    tableHeader: true,
    children: ['', r.produto, r.unidade, r.quantidade, r.liquido, r.ipi, r.st, r.unitario, r.total].map((c, i) =>
      celula([par({ t: c, tam: 6, cor: COR.branco, negrito: true, caixaAlta: true }, i >= 3 ? DIR : undefined, 0)], { larg: larg[i], fundo: COR.navy, margem: [0.14, 0.16] }),
    ),
  });
  const op = { bordas: bordaBaixo(), margem: [0.1, 0.16] as [number, number] };
  const linhasItens = dados.linhas.map((l, k) => {
    const nome: Txt[] = [{ t: l.descricao, tam: 7.8, negrito: true }];
    if (l.promocao) nome.push({ t: `   ${r.promocao.toUpperCase()}`, tam: 6, cor: COR.promo, negrito: true });
    const produto = [par(nome, undefined, 0), ...(l.codigo ? [par({ t: l.codigo, tam: 6.8, cor: COR.ink2 }, undefined, 0)] : []), ...(l.compativel ? [par({ t: r.compativel(l.compativel), tam: 6.8, cor: COR.ink2 }, undefined, 0)] : [])];
    const inicio = [
      celula([new Paragraph({ children: fotos[k] ? [fotos[k]!] : [] })], { larg: larg[0], ...op }),
      celula(produto, { larg: larg[1], ...op }),
      celula([par({ t: l.unidade, tam: 7.6 })], { larg: larg[2], ...op }),
      celula([par({ t: String(l.qtd), tam: 7.6 }, DIR)], { larg: larg[3], ...op }),
    ];
    const valores = l.sobConsulta
      ? [celula([par({ t: r.sobConsulta, tam: 7.2, cor: COR.ink2, italico: true }, DIR)], { larg: larg.slice(4).reduce((a, b) => a + b, 0), ...op, colunas: 5 })]
      : [
          celula(
            l.pct
              ? [par({ t: l.preco!, tam: 6.6, cor: COR.ink2, riscado: true }, DIR, 0), par({ t: `${l.liquido}  (−${l.pct})`, tam: 7.6, negrito: true }, DIR, 0)]
              : [par({ t: l.liquido!, tam: 7.6, negrito: true }, DIR, 0)],
            { larg: larg[4], ...op },
          ),
          celula([par({ t: l.ipi!, tam: 7.6 }, DIR)], { larg: larg[5], ...op }),
          celula([par({ t: l.st!, tam: 7.6 }, DIR)], { larg: larg[6], ...op }),
          celula([par({ t: l.unitario!, tam: 7.6 }, DIR)], { larg: larg[7], ...op }),
          celula([par({ t: l.total!, tam: 7.8, negrito: true }, DIR)], { larg: larg[8], ...op }),
        ];
    return new TableRow({ cantSplit: true, children: [...inicio, ...valores] });
  });
  const itens = tabela([cab, ...linhasItens], larg);

  // 5. Observação, validade, condições e logística | caixa de totais.
  const notas: Paragraph[] = [];
  if (dados.observacao) notas.push(rotulo(r.observacao), par({ t: dados.observacao, tam: 8 }, undefined, 80));
  notas.push(
    rotulo(r.validade),
    par(dados.validade ? [{ t: d.validade.antes, tam: 8 }, { t: dados.validade, tam: 8, negrito: true }, { t: d.validade.depois, tam: 8 }] : { t: d.semValidade, tam: 8 }, undefined, 80),
    par([{ t: r.condicoes, tam: 6.5, cor: COR.royal, negrito: true, caixaAlta: true }, { t: ` ${r.condicoesNota}`, tam: 6.5, cor: COR.ink2 }], undefined, 0),
    par({ t: d.condicoes, tam: 8 }, undefined, 80),
  );
  if (dados.logistica) {
    const lg = dados.logistica;
    notas.push(
      rotulo(`${r.cubagem} · ${r.volumes} · ${r.pesoLiquido} · ${r.pesoBruto}`),
      par({ t: `${r.cubagem} ${lg.cubagem}   ·   ${r.volumes} ${lg.volumes}`, tam: 8 }, undefined, 0),
      par({ t: `${r.pesoLiquido} ${lg.pesoLiquido}   ·   ${r.pesoBruto} ${lg.pesoBruto}`, tam: 8 }),
    );
  }
  const linhasTot: TableRow[] = [];
  const lTot = [3.6, 3.2];
  const linhaTot = (a: string, b: string, riscado = false) =>
    linhasTot.push(
      new TableRow({
        children: [
          celula([par({ t: a, tam: 7.8 }, undefined, 0)], { larg: lTot[0], bordas: bordaBaixo(), margem: [0.1, 0.22] }),
          celula([par({ t: b, tam: 7.8, riscado, cor: riscado ? COR.ink2 : COR.navy }, DIR, 0)], { larg: lTot[1], bordas: bordaBaixo(), margem: [0.1, 0.22] }),
        ],
      }),
    );
  if (t) {
    if (t.desconto) {
      linhaTot(r.semDesconto, t.semDesconto, true);
      linhaTot(r.desconto(t.desconto.pct), `− ${t.desconto.valor}`);
    }
    linhaTot(r.valorProdutos, t.valorProdutos);
    linhaTot(r.ipiTotal, t.ipi);
    linhaTot(r.stTotal, t.st);
    linhaTot(r.frete, t.frete);
    linhaTot(r.impostos, t.impostos);
    linhasTot.push(
      new TableRow({
        children: [
          celula([par({ t: r.valorTotal.toUpperCase(), tam: 7.5, cor: COR.silver, negrito: true }, undefined, 0)], { larg: lTot[0], fundo: COR.navy, margem: [0.22, 0.22] }),
          celula([par({ t: t.total, tam: 12.5, cor: COR.branco, negrito: true, italico: true }, DIR, 0)], { larg: lTot[1], fundo: COR.navy, margem: [0.22, 0.22] }),
        ],
      }),
    );
  }
  const lTotais = lTot[0] + lTot[1];
  const baixo = tabela(
    [
      new TableRow({
        cantSplit: true,
        children: [
          celula(notas, { larg: LARG - lTotais, margem: [0, 0.2], alinharV: VerticalAlign.TOP }),
          celula(linhasTot.length ? [tabela(linhasTot, lTot), new Paragraph({ children: [] })] : [new Paragraph({ children: [] })], { larg: lTotais, margem: [0, 0], alinharV: VerticalAlign.TOP }),
        ],
      }),
    ],
    [LARG - lTotais, lTotais],
  );

  // 6. Link do orçamento online.
  const link = tabela(
    [
      new TableRow({
        children: [
          celula([par({ t: r.linkTitulo, tam: 9, negrito: true }), par({ t: `${dados.linkCurto} · ${r.linkApoio(nomeCurto)}`, tam: 7.6, cor: COR.ink2 })], {
            larg: LARG,
            fundo: COR.paper,
            bordas: bordaToda(),
            margem: [0.2, 0.36],
          }),
        ],
      }),
    ],
    [LARG],
  );

  // 7. Rodapé da empresa, no pé de todas as páginas.
  const rodape = new Footer({
    children: [
      par({ t: `${d.empresa.razaoSocial}${d.empresa.mostrarCnpj ? ` · CNPJ ${d.empresa.cnpj}` : ''}`, tam: 7, negrito: true }, undefined, 0),
      par({ t: `${d.empresa.endereco} · Instagram ${d.empresa.instagram} · ${r.geradoPor}`, tam: 7, cor: COR.ink2 }, undefined, 0),
    ],
  });

  const doc = new Document({
    creator: 'MK Autoparts',
    title: `${d.titulo} ${dados.numero}`,
    styles: { default: { document: { run: { font: 'Arial', size: 17 } } } },
    sections: [
      {
        properties: { page: { size: { width: cm(21), height: cm(29.7) }, margin: { top: cm(1.0), bottom: cm(1.5), left: cm(2), right: cm(2), footer: cm(0.6) } } },
        footers: { default: rodape },
        children: [topo, espaco(8), partes, espaco(6), ...(blocoEntrega ? [blocoEntrega, espaco(6)] : []), itens, espaco(8), baixo, espaco(8), link],
      },
    ],
  });
  return Packer.toBlob(doc);
}
