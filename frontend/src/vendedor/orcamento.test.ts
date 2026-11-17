import { describe, expect, it } from 'vitest';
import { aplicarDesconto, calcularItem, calcularTotais, codificarLink, decodificarLink, expirado, formatarPorcentagem, type Orcamento } from './orcamento';

const base: Orcamento = {
  id: 'abc',
  vendedor: 'taine',
  cliente: 'Transportes São João',
  itens: [
    { slug: 'polia-scania-serie-4-s05-297', quantidade: 2, preco: 100, desconto: { tipo: 'percentual', valor: 10 } },
    { slug: 'fechadura-da-porta-scania-serie-4-s02-050', lado: 'LD', quantidade: 1, preco: 50 },
    { slug: 'valvula-solenoide-scania-serie-4-s05-014', quantidade: 1 },
  ],
  descontoTotal: { tipo: 'valor', valor: 30 },
  observacao: 'Entrega em Lages',
  criadoEm: '2026-11-16T12:00:00.000Z',
  validade: '2026-11-30',
  estado: 'ativo',
  alteracoes: [],
};

describe('orçamento do vendedor (RN-13)', () => {
  it('desconto por item em % e em R$, nunca negativo', () => {
    expect(aplicarDesconto(100, { tipo: 'percentual', valor: 10 })).toBe(90);
    expect(aplicarDesconto(100, { tipo: 'valor', valor: 15.5 })).toBe(84.5);
    expect(aplicarDesconto(100, { tipo: 'valor', valor: 150 })).toBe(0);
    expect(aplicarDesconto(100, { tipo: 'percentual', valor: 130 })).toBe(0);
  });

  it('item sem preço fica sob consulta e fora do total', () => {
    const t = calcularTotais(base);
    expect(calcularItem(base.itens[0])).toMatchObject({ unitarioFinal: 90, total: 180, pct: 10 });
    expect(t.subtotal).toBe(230);
    expect(t.total).toBe(200);
    expect(t.semPreco).toBe(1);
  });

  it('confere com o modelo do documento: 7 itens e 3% no total dão R$ 4.798,83 (PADRAO-ORCAMENTO)', () => {
    const itens = [
      { slug: 'a', lado: 'LD' as const, quantidade: 2, preco: 489, desconto: { tipo: 'percentual' as const, valor: 10 } },
      { slug: 'a', lado: 'LE' as const, quantidade: 2, preco: 489, desconto: { tipo: 'percentual' as const, valor: 10 } },
      { slug: 'b', lado: 'LD' as const, quantidade: 1, preco: 1890, desconto: { tipo: 'valor' as const, valor: 140 } },
      { slug: 'c', lado: 'LE' as const, quantidade: 1, preco: 780 },
      { slug: 'd', lado: 'LD' as const, quantidade: 2, preco: 119.9 },
      { slug: 'e', quantidade: 1, preco: 439, desconto: { tipo: 'percentual' as const, valor: 5 } },
      { slug: 'f', quantidade: 2 },
    ];
    const t = calcularTotais({ itens, descontoTotal: { tipo: 'percentual', valor: 3 } });
    expect(t.subtotalSemDesconto).toBe(5304.8);
    expect(t.subtotal).toBe(4947.25);
    expect(t.descontoTotal).toBe(148.42);
    expect(t.total).toBe(4798.83);
    expect(formatarPorcentagem(t.economia)).toBe('9,5%');
    expect(formatarPorcentagem(calcularItem(itens[2]).pct)).toBe('7,4%');
    expect(t.semPreco).toBe(1);
  });

  it('porcentagem com uma casa só quando não é inteira', () => {
    expect(formatarPorcentagem(10)).toBe('10%');
    expect(formatarPorcentagem(13.0434)).toBe('13%');
    expect(formatarPorcentagem(12.5)).toBe('12,5%');
  });

  it('link: codifica e decodifica o mesmo orçamento (com acentos)', () => {
    const volta = decodificarLink(codificarLink(base));
    expect(volta).toMatchObject({ id: 'abc', vendedor: 'taine', cliente: 'Transportes São João', observacao: 'Entrega em Lages', validade: '2026-11-30' });
    expect(volta?.itens).toEqual(base.itens.map(i => ({ ...i, lado: i.lado, preco: i.preco, desconto: i.desconto })));
    expect(decodificarLink('lixo%%')).toBeNull();
  });

  it('validade vale até o fim do dia', () => {
    expect(expirado(base, new Date('2026-11-30T20:00:00'))).toBe(false);
    expect(expirado(base, new Date('2026-12-01T08:00:00'))).toBe(true);
    expect(expirado({ validade: undefined })).toBe(false);
  });
});
