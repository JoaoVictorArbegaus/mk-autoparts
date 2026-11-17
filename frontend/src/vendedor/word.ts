/*
 * Word (.docx) do orçamento (REU-06), gerado no navegador com a biblioteca docx (DEC-003), a partir da
 * mesma estrutura do PDF (montarDocumento). Segue o modelo (gerar_orcamento_word.py): Arial, topo e
 * cabeçalho da tabela em azul-marinho, blocos Vendedor/Cliente, totais e rodapé. As fotos .webp viram
 * PNG (o Word não lê webp). Carregado só quando o vendedor pede o Word.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
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
import { formatarPreco } from '../content/catalogo';
import { documento as d, primeiroNome } from '../content/documento';
import { formatarPorcentagem } from './orcamento';
import type { DadosDocumento } from './Documento';

const COR = { navy: '0B1A36', royal: '1C4FD0', vivid: '3D7EFF', silver: 'D9DEE5', paper: 'F3F5F8', tint: 'E4ECFF', ink2: '5B6678', branco: 'FFFFFF', promo: 'C81E2A' };
const cm = (n: number) => Math.round(n * 567);
const LARG = 17; // cm úteis (A4 com margens de 2 cm), como no modelo

const semBorda: ITableCellBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};
const bordaBaixo = (cor = COR.silver): ITableCellBorders => ({ ...semBorda, bottom: { style: BorderStyle.SINGLE, size: 4, color: cor } });
const bordaToda = (cor = COR.silver): ITableCellBorders => ({
  top: { style: BorderStyle.SINGLE, size: 6, color: cor },
  bottom: { style: BorderStyle.SINGLE, size: 6, color: cor },
  left: { style: BorderStyle.SINGLE, size: 6, color: cor },
  right: { style: BorderStyle.SINGLE, size: 6, color: cor },
});

type Txt = { t: string; tam?: number; cor?: string; negrito?: boolean; italico?: boolean; riscado?: boolean; depois?: number; caixaAlta?: boolean };
const run = (x: Txt) =>
  new TextRun({ text: x.caixaAlta ? x.t.toUpperCase() : x.t, font: 'Arial', size: Math.round((x.tam ?? 8.5) * 2), color: x.cor ?? COR.navy, bold: x.negrito, italics: x.italico, strike: x.riscado });
const par = (linhas: Txt | Txt[], alinhar?: (typeof AlignmentType)[keyof typeof AlignmentType], depois = 20) =>
  new Paragraph({ alignment: alinhar, spacing: { before: 0, after: depois, line: 264 }, children: (Array.isArray(linhas) ? linhas : [linhas]).map(run) });

function celula(filhos: (Paragraph | Table)[], o: { larg: number; fundo?: string; bordas?: ITableCellBorders; margem?: [number, number]; alinharV?: (typeof VerticalAlign)[keyof typeof VerticalAlign]; colunas?: number } ) {
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
  const selo = await png('/img/marca/selo-320.webp', 2.1);
  const fotos = await Promise.all(dados.linhas.map(l => (l.foto ? png(l.foto, 1.0) : Promise.resolve(null))));

  // Topo azul: selo, título e número/emissão/validade.
  const meta: Txt[][] = [[{ t: `${r.numero}   ${dados.numero}`, cor: COR.branco, negrito: true }], [{ t: `${r.emissao}   ${dados.emissao}`, cor: COR.branco, negrito: true }]];
  if (dados.validade) meta.push([{ t: `${r.validoAte}   ${dados.validade}`, cor: COR.branco, negrito: true }]);
  const topo = tabela(
    [
      new TableRow({
        children: [
          celula([new Paragraph({ children: selo ? [selo] : [] })], { larg: 3.2, fundo: COR.navy, margem: [0.3, 0.4] }),
          celula([par({ t: d.eyebrow, tam: 7, cor: COR.vivid, negrito: true, caixaAlta: true }), par({ t: d.titulo, tam: 26, cor: COR.branco, negrito: true, italico: true })], { larg: LARG - 3.2 - 4.6, fundo: COR.navy, margem: [0.3, 0.4] }),
          celula(meta.map(m => par(m)), { larg: 4.6, fundo: COR.navy, margem: [0.3, 0.4] }),
        ],
      }),
    ],
    [3.2, LARG - 3.2 - 4.6, 4.6],
  );

  // Vendedor | Cliente
  const parte = (rot: string, nome: string, det?: string) =>
    celula([par({ t: rot, tam: 7, cor: COR.royal, negrito: true, caixaAlta: true }), par({ t: nome, tam: 10.5, negrito: true }), ...(det ? [par({ t: det, tam: 8, cor: COR.ink2 })] : [])], { larg: LARG / 2, fundo: COR.paper, bordas: bordaToda(), margem: [0.24, 0.32], alinharV: VerticalAlign.TOP });
  const partes = tabela(
    [
      new TableRow({
        children: [
          parte(r.vendedor, dados.vendedor.nome, `MK Autoparts${dados.vendedor.whatsappRotulo ? ` · WhatsApp ${dados.vendedor.whatsappRotulo}` : ''}`),
          parte(r.cliente, dados.cliente?.nome ?? r.clienteVazio, dados.cliente?.contato),
        ],
      }),
    ],
    [LARG / 2, LARG / 2],
  );

  // Itens: cabeçalho navy repetido em cada página; linha nunca quebra no meio.
  const larg = [1.7, 7.0, 1.3, 3.8, 3.2];
  const cab = new TableRow({
    tableHeader: true,
    children: ['', r.produto, r.quantidade, r.precoUnitario, r.total].map((c, i) =>
      celula([par({ t: c, tam: 6.5, cor: COR.branco, negrito: true, caixaAlta: true }, i >= 2 ? AlignmentType.RIGHT : undefined, 0)], { larg: larg[i], fundo: COR.navy, margem: [0.12, 0.2] }),
    ),
  });
  const linhas = dados.linhas.map((l, k) => {
    const op = { bordas: bordaBaixo(), margem: [0.1, 0.22] as [number, number] };
    const preco =
      l.precoFinal === null
        ? [par({ t: r.sobConsulta, tam: 8, cor: COR.ink2, italico: true }, AlignmentType.RIGHT)]
        : l.pct > 0
          ? [par({ t: formatarPreco(l.preco!), tam: 7.5, cor: COR.ink2, riscado: true }, AlignmentType.RIGHT), par({ t: `${formatarPreco(l.precoFinal)}  (−${formatarPorcentagem(l.pct)})`, negrito: true }, AlignmentType.RIGHT)]
          : [par({ t: formatarPreco(l.precoFinal), negrito: true }, AlignmentType.RIGHT)];
    const nome: Txt[] = [{ t: l.nome, negrito: true }];
    if (l.promocao) nome.push({ t: `   ${r.promocao.toUpperCase()}`, tam: 6.5, cor: COR.promo, negrito: true });
    return new TableRow({
      cantSplit: true,
      children: [
        celula([new Paragraph({ children: fotos[k] ? [fotos[k]!] : [] })], { larg: larg[0], ...op }),
        celula([par(nome), par({ t: l.detalhe, tam: 7.5, cor: COR.ink2 })], { larg: larg[1], ...op }),
        celula([par({ t: String(l.qtd) }, AlignmentType.RIGHT)], { larg: larg[2], ...op }),
        celula(preco, { larg: larg[3], ...op }),
        celula([par(l.total === null ? { t: '—', cor: COR.ink2 } : { t: formatarPreco(l.total), negrito: true }, AlignmentType.RIGHT)], { larg: larg[4], ...op }),
      ],
    });
  });
  const itens = tabela([cab, ...linhas], larg);

  // Notas (observação, validade, condições) | caixa de totais
  const notas: Paragraph[] = [];
  if (dados.observacao) notas.push(par({ t: r.observacao, tam: 7, cor: COR.royal, negrito: true, caixaAlta: true }), par({ t: dados.observacao }, undefined, 100));
  notas.push(
    par({ t: r.validade, tam: 7, cor: COR.royal, negrito: true, caixaAlta: true }),
    par({ t: dados.validade ? d.validade(dados.validade) : d.semValidade }, undefined, 100),
    par([{ t: r.condicoes, tam: 7, cor: COR.royal, negrito: true, caixaAlta: true }, { t: ` ${r.condicoesNota}`, tam: 7, cor: COR.ink2 }]),
    par({ t: d.condicoes }),
  );
  const linhasTot: TableRow[] = [];
  const linhaTot = (a: string, b: string, riscado = false) =>
    linhasTot.push(new TableRow({ children: [celula([par({ t: a })], { larg: 3.0, bordas: bordaBaixo(), margem: [0.14, 0.24] }), celula([par({ t: b, riscado, cor: riscado ? COR.ink2 : COR.navy }, AlignmentType.RIGHT)], { larg: 3.6, bordas: bordaBaixo(), margem: [0.14, 0.24] })] }));
  if (t.subtotal > 0) {
    if (t.economia > 0) linhaTot(r.subtotalSemDesconto, formatarPreco(t.subtotalSemDesconto), true);
    if (t.subtotal !== t.subtotalSemDesconto) linhaTot(r.comDescontoItens, formatarPreco(t.subtotal));
    if (dados.descontoTotalRotulo && t.descontoTotal > 0) linhaTot(dados.descontoTotalRotulo, `− ${formatarPreco(t.descontoTotal)}`);
    linhasTot.push(
      new TableRow({
        children: [
          celula([par({ t: r.total.toUpperCase(), tam: 8, cor: COR.silver, negrito: true })], { larg: 3.0, fundo: COR.navy, margem: [0.24, 0.24] }),
          celula([par({ t: formatarPreco(t.total), tam: 13, cor: COR.branco, negrito: true, italico: true }, AlignmentType.RIGHT)], { larg: 3.6, fundo: COR.navy, margem: [0.24, 0.24] }),
        ],
      }),
    );
    if (t.economia > 0) linhasTot.push(new TableRow({ children: [celula([par({ t: r.economia(formatarPorcentagem(t.economia)), tam: 8, cor: COR.royal, negrito: true }, AlignmentType.CENTER)], { larg: 6.6, fundo: COR.tint, margem: [0.16, 0.24], colunas: 2 })] }));
  }
  const baixo = tabela(
    [
      new TableRow({
        children: [
          celula(notas, { larg: LARG - 6.6, margem: [0, 0.2], alinharV: VerticalAlign.TOP }),
          celula(linhasTot.length ? [tabela(linhasTot, [3.0, 3.6]), new Paragraph({ children: [] })] : [new Paragraph({ children: [] })], { larg: 6.6, margem: [0, 0], alinharV: VerticalAlign.TOP }),
        ],
      }),
    ],
    [LARG - 6.6, 6.6],
  );

  // Link do orçamento online
  const link = tabela(
    [
      new TableRow({
        children: [celula([par({ t: r.linkTitulo, tam: 9.5, negrito: true }), par({ t: `${dados.linkCurto} · ${r.linkApoio(nomeCurto)}`, tam: 8, cor: COR.ink2 })], { larg: LARG, fundo: COR.paper, bordas: bordaToda(), margem: [0.26, 0.36] })],
      }),
    ],
    [LARG],
  );

  const doc = new Document({
    creator: 'MK Autoparts',
    title: `${d.titulo} ${dados.numero}`,
    styles: { default: { document: { run: { font: 'Arial', size: 17 } } } },
    sections: [
      {
        properties: { page: { size: { width: cm(21), height: cm(29.7) }, margin: { top: cm(1.2), bottom: cm(1.2), left: cm(2), right: cm(2) } } },
        children: [
          topo,
          espaco(8),
          partes,
          espaco(6),
          itens,
          espaco(4),
          baixo,
          espaco(4),
          link,
          espaco(3),
          par({ t: `${d.empresa.razaoSocial}${d.empresa.mostrarCnpj ? ` · CNPJ ${d.empresa.cnpj}` : ''}`, tam: 7.5, negrito: true }, undefined, 0),
          par({ t: `${d.empresa.endereco} · Instagram ${d.empresa.instagram} · ${r.geradoPor}`, tam: 7.5, cor: COR.ink2 }, undefined, 0),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}
