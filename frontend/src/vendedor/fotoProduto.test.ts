import { describe, expect, it } from 'vitest';
import { codigosDaPeca, lerPreco, quebrarLinhas } from './fotoProduto';
import type { Produto } from '../content/tipos';

describe('lerPreco', () => {
  it('aceita vírgula, milhar e R$', () => {
    expect(lerPreco('489,9')).toBe(489.9);
    expect(lerPreco('1.890,00')).toBe(1890);
    expect(lerPreco('R$ 75')).toBe(75);
    expect(lerPreco('12.5')).toBe(12.5);
  });
  it('vazio, zero ou texto vira sem preço', () => {
    expect(lerPreco('')).toBeUndefined();
    expect(lerPreco('0')).toBeUndefined();
    expect(lerPreco('abc')).toBeUndefined();
  });
});

describe('codigosDaPeca', () => {
  const base = { slug: 'x', nome: 'X', categoria: 'c', aplicacoes: [], ativo: true } as Produto;
  it('peça com lados lista os dois códigos', () => {
    expect(codigosDaPeca({ ...base, variantes: [{ lado: 'LD', codigo: 'S03-068' }, { lado: 'LE', codigo: 'S03-069' }] } as Produto)).toBe('S03-068 (LD) · S03-069 (LE)');
  });
  it('peça sem lado usa o código único', () => {
    expect(codigosDaPeca({ ...base, codigo: 'S05-035' })).toBe('S05-035');
  });
});

describe('quebrarLinhas', () => {
  const medir = (s: string) => s.length * 10;
  it('quebra por palavras dentro da largura', () => {
    expect(quebrarLinhas(medir, 'farol principal scania ntg', 160, 3)).toEqual(['farol principal', 'scania ntg']);
  });
  it('limita as linhas e põe reticências na última', () => {
    const l = quebrarLinhas(medir, 'aa bb cc dd ee ff gg hh', 50, 2);
    expect(l).toHaveLength(2);
    expect(l[1].endsWith('…')).toBe(true);
  });
});
