import { describe, expect, it } from 'vitest';
import { cortesDePagina, montarPdf } from './pdfArquivo';

const util = { primeira: 1000, demais: 960 };

describe('cortesDePagina', () => {
  it('uma página quando o corpo cabe', () => {
    expect(cortesDePagina(900, util, [])).toEqual([0]);
  });

  it('corta no limite quando não há trechos inteiros', () => {
    expect(cortesDePagina(2500, util, [])).toEqual([0, 1000, 1960]);
  });

  it('não corta dentro de uma linha: recua para o topo dela', () => {
    expect(cortesDePagina(1500, util, [{ topo: 980, base: 1030 }])).toEqual([0, 980]);
  });

  it('recua em cadeia quando o novo corte cai em outro trecho', () => {
    const inteiros = [
      { topo: 950, base: 990 },
      { topo: 985, base: 1040 },
    ];
    expect(cortesDePagina(1500, util, inteiros)).toEqual([0, 950]);
  });

  it('trecho maior que a página: corta no limite', () => {
    expect(cortesDePagina(2500, util, [{ topo: 10, base: 2400 }])).toEqual([0, 1000, 1960]);
  });
});

describe('montarPdf', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const pdf = montarPdf([
    { jpeg, largura: 10, altura: 14 },
    { jpeg, largura: 10, altura: 14 },
  ]);
  const texto = new TextDecoder('latin1').decode(pdf);

  it('cabeçalho, duas páginas e fim de arquivo', () => {
    expect(texto.startsWith('%PDF-1.4')).toBe(true);
    expect(texto).toContain('/Count 2');
    expect(texto.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('startxref aponta para a tabela xref e cada offset para o objeto certo', () => {
    const inicio = Number(/startxref\n(\d+)/.exec(texto)![1]);
    expect(texto.slice(inicio, inicio + 4)).toBe('xref');
    const linhas = texto.slice(inicio).split('\n').slice(3, 10);
    linhas.forEach((l, i) => {
      const off = Number(l.slice(0, 10));
      expect(texto.slice(off).startsWith(`${i + 1} 0 obj`)).toBe(true);
    });
  });
});
