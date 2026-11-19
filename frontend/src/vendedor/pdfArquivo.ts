/*
 * PDF do orçamento como arquivo de verdade, gerado no navegador (protótipo, REU-20): a folha do
 * documento vira imagem (html-to-image, DEC-003) e cada página A4 entra num PDF montado aqui, sem
 * outra biblioteca. Com o arquivo pronto, o vendedor arrasta a prévia para a conversa ou envia pelo
 * compartilhamento do aparelho. No sistema definitivo o PDF sai do servidor (texto selecionável).
 */

/** A4 em px CSS (96 dpi) e em pontos do PDF. */
export const A4_PX = { largura: 793.7, altura: 1122.5 };
const A4_PT = { largura: 595.28, altura: 841.89 };
/** Margem do topo das páginas seguintes, igual à impressão (@page margin-top: 10mm). */
export const MARGEM_TOPO_PX = 37.8;

/** Trecho que não pode ser cortado entre páginas (linha da tabela, nota, bloco do link). */
export type Intervalo = { topo: number; base: number };

/**
 * Pontos de corte do corpo do documento em páginas. A 1ª página começa no topo; as seguintes têm a
 * margem do topo. Nunca corta dentro de um trecho inteiro; se um trecho for maior que a página, corta
 * no limite. Devolve o início de cada página (o fim é o início da seguinte ou `alturaCorpo`).
 */
export function cortesDePagina(alturaCorpo: number, alturaUtil: { primeira: number; demais: number }, inteiros: Intervalo[]): number[] {
  const inicios = [0];
  let inicio = 0;
  while (inicio + (inicios.length === 1 ? alturaUtil.primeira : alturaUtil.demais) < alturaCorpo) {
    const limite = inicio + (inicios.length === 1 ? alturaUtil.primeira : alturaUtil.demais);
    let corte = limite;
    // Recua enquanto o corte cair dentro de algum trecho inteiro (que começa depois do início da página).
    for (let mudou = true; mudou; ) {
      mudou = false;
      for (const t of inteiros) {
        if (t.topo > inicio + 1 && t.topo < corte && t.base > corte) {
          corte = t.topo;
          mudou = true;
        }
      }
    }
    if (corte <= inicio + 40) corte = limite; // trecho maior que a página: corta no limite
    inicios.push(corte);
    inicio = corte;
  }
  return inicios;
}

export type PaginaJpeg = { jpeg: Uint8Array; largura: number; altura: number };

/** Monta um PDF 1.4 com uma imagem JPEG ocupando cada página A4. */
export function montarPdf(paginas: PaginaJpeg[], titulo = 'Orçamento MK Autoparts'): Uint8Array {
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const offsets: number[] = [];
  let tamanho = 0;
  const por = (p: Uint8Array | string) => {
    const b = typeof p === 'string' ? enc.encode(p) : p;
    partes.push(b);
    tamanho += b.length;
  };
  const objeto = (n: number, corpo: () => void) => {
    offsets[n] = tamanho;
    por(`${n} 0 obj\n`);
    corpo();
    por('\nendobj\n');
  };
  // Título em hexadecimal UTF-16BE (acentos sem escape).
  const hexTitulo = 'FEFF' + Array.from(titulo).map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join('').toUpperCase();

  const n = paginas.length;
  const idPagina = (i: number) => 4 + i * 3;
  por('%PDF-1.4\n');
  objeto(1, () => por('<< /Type /Catalog /Pages 2 0 R >>'));
  objeto(2, () => por(`<< /Type /Pages /Count ${n} /Kids [${paginas.map((_, i) => `${idPagina(i)} 0 R`).join(' ')}] >>`));
  objeto(3, () => por(`<< /Title <${hexTitulo}> /Producer (JKsoftware) >>`));
  paginas.forEach((p, i) => {
    const pg = idPagina(i);
    const conteudo = `q ${A4_PT.largura} 0 0 ${A4_PT.altura} 0 0 cm /Im0 Do Q`;
    objeto(pg, () =>
      por(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_PT.largura} ${A4_PT.altura}] /Resources << /XObject << /Im0 ${pg + 2} 0 R >> >> /Contents ${pg + 1} 0 R >>`),
    );
    objeto(pg + 1, () => {
      por(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`);
    });
    objeto(pg + 2, () => {
      por(`<< /Type /XObject /Subtype /Image /Width ${p.largura} /Height ${p.altura} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
      por(p.jpeg);
      por('\nendstream');
    });
  });
  const total = 4 + n * 3;
  const inicioXref = tamanho;
  por(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) por(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  por(`trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`);

  const saida = new Uint8Array(tamanho);
  let pos = 0;
  for (const b of partes) {
    saida.set(b, pos);
    pos += b.length;
  }
  return saida;
}

async function jpegDe(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.9));
  if (!blob) throw new Error('jpeg');
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Gera o PDF a partir da folha `.doc` renderizada em tamanho real (fora da tela). O rodapé da folha
 * se repete no pé de cada página, como na impressão.
 */
export async function gerarPdfDaFolha(folha: HTMLElement, titulo: string): Promise<Blob> {
  const { toCanvas } = await import('html-to-image');
  await document.fonts.ready;
  const escala = 2;
  const tela = await toCanvas(folha, { pixelRatio: escala, backgroundColor: '#ffffff', cacheBust: false });
  const topoFolha = folha.getBoundingClientRect().top;
  const alturaFolha = folha.getBoundingClientRect().height;
  const W = Math.round(A4_PX.largura * escala);
  const H = Math.round(A4_PX.altura * escala);

  const pagina = () => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, W, H);
    return { c, g };
  };

  const paginas: PaginaJpeg[] = [];
  if (alturaFolha <= A4_PX.altura + 2) {
    const { c, g } = pagina();
    g.drawImage(tela, 0, 0);
    paginas.push({ jpeg: await jpegDe(c), largura: W, altura: H });
  } else {
    // Faixa do rodapé: do topo do .doc-rod (com folga do filete) até o fim da folha.
    const rod = folha.querySelector<HTMLElement>('.doc-rod');
    const topoRod = rod ? rod.getBoundingClientRect().top - topoFolha - 8 : alturaFolha;
    const alturaRod = alturaFolha - topoRod;
    const inteiros: Intervalo[] = [];
    folha.querySelectorAll<HTMLElement>('tr, .doc-nota, .doc-link, .doc-totais, .doc-parte, [data-inteiro]').forEach(el => {
      const r = el.getBoundingClientRect();
      inteiros.push({ topo: r.top - topoFolha, base: r.bottom - topoFolha });
    });
    const util = { primeira: A4_PX.altura - alturaRod, demais: A4_PX.altura - MARGEM_TOPO_PX - alturaRod };
    const inicios = cortesDePagina(topoRod, util, inteiros);
    for (let i = 0; i < inicios.length; i++) {
      const de = inicios[i];
      const ate = i + 1 < inicios.length ? inicios[i + 1] : topoRod;
      const destinoY = i === 0 ? 0 : MARGEM_TOPO_PX;
      const { c, g } = pagina();
      g.drawImage(tela, 0, de * escala, W, (ate - de) * escala, 0, destinoY * escala, W, (ate - de) * escala);
      g.drawImage(tela, 0, topoRod * escala, W, alturaRod * escala, 0, H - alturaRod * escala, W, alturaRod * escala);
      paginas.push({ jpeg: await jpegDe(c), largura: W, altura: H });
    }
  }
  const bytes = montarPdf(paginas, titulo);
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
