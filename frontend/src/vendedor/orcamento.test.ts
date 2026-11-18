import { describe, expect, it } from 'vitest';
import { Dec, brl, lerDecimal, num, pctFiscal, pctTexto } from './decimal';
import { cnpjValido, cpfValido, formatarDocumento } from './documentos';
import { aplicarDescontoItem, calcularOrcamento, codificarLink, decodificarLink, expirado, lerOrcamento, validarOrcamento, type ItemOrcamento, type Orcamento } from './orcamento';

/** Itens de docs/pfd-regras/.../orcamento-exemplo.json (dados fictícios), no formato do site. */
const itensExemplo: ItemOrcamento[] = [
  { slug: 'lanterna', lado: 'LD', quantidade: 2, preco: '489.00', desconto: { tipo: 'percentual', valor: '10' }, ipiPct: '3.25', st: '0.00' },
  { slug: 'lanterna', lado: 'LE', quantidade: 2, preco: '489.00', desconto: { tipo: 'percentual', valor: '10' }, ipiPct: '3.25', st: '0.00' },
  { slug: 'farol', lado: 'LD', quantidade: 1, preco: '1890.00', desconto: { tipo: 'valor', valor: '140.00' }, ipiPct: '3.25', st: '0.00' },
  { slug: 'espelho', lado: 'LE', quantidade: 1, preco: '780.00', ipiPct: '1.95', st: '12.50' },
  { slug: 'caixa-lanterna', lado: 'LD', quantidade: 2, preco: '119.90', ipiPct: '0', st: '0.00' },
  { slug: 'caixa-ferramentas', quantidade: 1, preco: '439.00', desconto: { tipo: 'percentual', valor: '5' }, ipiPct: '0', st: '0.00' },
  { slug: 'tensor', quantidade: 2, ipiPct: '0', st: '0.00' },
];

const base: Orcamento = {
  id: 'abc',
  numero: 'ORC-0001',
  codigoVenda: 'CV-2026-004812',
  vendedor: 'taine',
  cliente: { tipo: 'PJ', razaoSocial: 'Transportes São João', nome: 'Carlos', documento: '11.222.333/0001-81', email: 'compras@exemplo.com.br' },
  entrega: { enderecoEntrega: 'Rua Exemplo, 100', transportadora: 'FOB - Expresso Exemplo', prazoPagamento: '15 dias' },
  itens: itensExemplo,
  descontoTotal: { tipo: 'percentual', valor: '3' },
  frete: '0.00',
  impostosDeducao: '0.00',
  observacao: 'Entrega em Lages',
  criadoEm: '2026-11-16T12:00:00.000Z',
  validade: '2026-11-30',
  estado: 'ativo',
  alteracoes: [],
};

describe('decimal (como o Decimal do Python)', () => {
  it('arredonda metade para cima e formata em pt-BR', () => {
    expect(Dec.de('2.345').arredondar().texto()).toBe('2.35');
    expect(Dec.de('2.344').arredondar().texto()).toBe('2.34');
    expect(num(Dec.de('4936.74'))).toBe('4.936,74');
    expect(brl(Dec.de('1234567.5'))).toBe('R$ 1.234.567,50');
    expect(num(Dec.de('0.381348'), 6)).toBe('0,381348');
    expect(num(Dec.de('23.236'), 4)).toBe('23,2360');
    expect(pctFiscal(Dec.de('0'))).toBe('0,00%');
    expect(pctTexto(Dec.de('10'))).toBe('10%');
    expect(pctTexto(Dec.de('12.6993865'))).toBe('12,7%');
    expect(pctTexto(Dec.de('13.0434'))).toBe('13%');
  });

  it('divisão com 28 dígitos, como no Python', () => {
    expect(Dec.UM.dividido(3).texto()).toBe('0.3333333333333333333333333333');
    expect(Dec.de('2').dividido(3).texto()).toBe('0.6666666666666666666666666667');
    expect(Dec.de('10').dividido(100).texto()).toBe('0.1');
  });

  it('lê o que o vendedor digita', () => {
    expect(lerDecimal('1.234,56')).toBe('1234.56');
    expect(lerDecimal('R$ 12,5')).toBe('12.5');
    expect(lerDecimal('3.25')).toBe('3.25');
    expect(lerDecimal('')).toBeUndefined();
    expect(lerDecimal('1,234')).toBeNull();
    expect(lerDecimal('0,381348', 6)).toBe('0.381348');
    expect(lerDecimal('-5')).toBeNull();
  });
});

describe('cálculo do orçamento (orcamento_modelo.py)', () => {
  it('confere com o exemplo: R$ 4.936,74 e todos os itens', () => {
    const c = calcularOrcamento(base);
    const linhas = c.itens.map(i => (i.comPreco ? [i.liquido!.texto(), i.unitario!.texto(), i.total!.texto()] : null));
    expect(linhas).toEqual([
      ['426.90', '440.77', '881.54'],
      ['426.90', '440.77', '881.54'],
      ['1697.50', '1752.67', '1752.67'],
      ['756.60', '771.35', '771.35'],
      ['116.30', '116.30', '232.60'],
      ['404.54', '404.54', '404.54'],
      null,
    ]);
    expect(num(c.semDesconto)).toBe('5.304,80');
    expect(num(c.desconto)).toBe('505,96');
    expect(pctTexto(c.pctDesconto)).toBe('9,5%');
    expect(num(c.valorProdutos)).toBe('4.798,84');
    expect(num(c.ipi)).toBe('125,40');
    expect(num(c.st)).toBe('12,50');
    expect(brl(c.total)).toBe('R$ 4.936,74');
    expect(c.semPreco).toBe(1);
    expect(c.itens.slice(0, 6).map(i => pctTexto(i.pctDesconto!))).toEqual(['12,7%', '12,7%', '10,2%', '3%', '3%', '7,8%']);
  });

  it('desconto do item nunca abaixo de zero', () => {
    expect(aplicarDescontoItem(Dec.de('100'), { tipo: 'valor', valor: '150' }).texto(2)).toBe('0.00');
    expect(aplicarDescontoItem(Dec.de('100'), { tipo: 'valor', valor: '15.5' }).texto()).toBe('84.50');
    expect(aplicarDescontoItem(Dec.de('100'), { tipo: 'percentual', valor: '100' }).texto(2)).toBe('0.00');
  });

  it('desconto no total em R$ é rateado; frete soma e impostos deduzem', () => {
    const c = calcularOrcamento({
      itens: [
        { slug: 'a', quantidade: 2, preco: '100.00' },
        { slug: 'b', quantidade: 1, preco: '50.00', ipiPct: '10' },
        { slug: 'c', quantidade: 1 },
      ],
      descontoTotal: { tipo: 'valor', valor: '25' },
      frete: '30.00',
      impostosDeducao: '5.00',
    });
    // fator = 1 − 25/250 = 0,9 → líquidos 90,00 e 45,00; IPI 4,50.
    expect(c.itens[0].liquido!.texto()).toBe('90.00');
    expect(c.itens[1].unitario!.texto()).toBe('49.50');
    expect(c.valorProdutos.texto()).toBe('225.00');
    expect(c.ipi.texto()).toBe('4.50');
    expect(c.total.texto()).toBe('254.50');
  });

  it('sem nenhum preço: totais zerados e itens sob consulta', () => {
    const c = calcularOrcamento({ itens: [{ slug: 'x', quantidade: 3 }], descontoTotal: { tipo: 'valor', valor: '10' } });
    expect(c.comPreco).toBe(0);
    expect(c.total.zero).toBe(true);
  });
});

describe('cliente e validação', () => {
  it('CPF e CNPJ com dígitos verificadores', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11.222.333/0001-80')).toBe(false);
    expect(cnpjValido('00.000.000/0000-00')).toBe(false);
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('529.982.247-24')).toBe(false);
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(formatarDocumento('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('PJ exige razão social; PF exige nome; documento inválido e % acima de 100 barram', () => {
    expect(validarOrcamento(base, '2026-11-17')).toEqual([]);
    expect(validarOrcamento({ ...base, cliente: { tipo: 'PJ', nome: 'Carlos' } }, '2026-11-17')).toContain('clienteNome');
    expect(validarOrcamento({ ...base, cliente: { tipo: 'PF', nome: 'Ana', documento: '529.982.247-24' } }, '2026-11-17')).toEqual(['documento']);
    expect(validarOrcamento({ ...base, descontoTotal: { tipo: 'percentual', valor: '120' } }, '2026-11-17')).toEqual(['descontoPct']);
    expect(validarOrcamento({ ...base, codigoVenda: 'X'.repeat(21) }, '2026-11-17')).toEqual(['codigoVenda']);
  });

  it('validade no passado e peça com lado sem lado barram', () => {
    expect(validarOrcamento(base, '2026-12-01')).toEqual(['validade']);
    const semLado = { ...base, itens: [{ slug: 'lanterna-traseira-scania-serie-4-5-6-s03-068', quantidade: 1 }] };
    expect(validarOrcamento(semLado, '2026-11-17')).toEqual(['lado']);
    expect(validarOrcamento({ ...semLado, itens: [{ ...semLado.itens[0], lado: 'LE' as const }] }, '2026-11-17')).toEqual([]);
  });

  it('lê orçamentos gravados no formato anterior (cliente em texto, valores em número)', () => {
    const antigo = { id: 'z', vendedor: 'taine', cliente: 'Transportes X', clienteContato: 'João', itens: [{ slug: 'a', quantidade: 2, preco: 119.9, desconto: { tipo: 'percentual', valor: 10 } }], observacao: '', criadoEm: '2026-11-16', estado: 'ativo', alteracoes: [] };
    const o = lerOrcamento(antigo)!;
    expect(o.cliente).toMatchObject({ tipo: 'PJ', razaoSocial: 'Transportes X', nome: 'João' });
    expect(o.itens[0]).toMatchObject({ preco: '119.9', desconto: { tipo: 'percentual', valor: '10' } });
  });
});

describe('link e validade', () => {
  it('link leva os valores (totais iguais) e só o nome do cliente', () => {
    const volta = decodificarLink(codificarLink(base))!;
    expect(volta).toMatchObject({ id: 'abc', numero: 'ORC-0001', codigoVenda: 'CV-2026-004812', vendedor: 'taine', observacao: 'Entrega em Lages', validade: '2026-11-30' });
    expect(volta.cliente).toEqual({ tipo: 'PJ', razaoSocial: 'Transportes São João' });
    expect(volta.entrega.enderecoEntrega).toBeUndefined();
    expect(brl(calcularOrcamento(volta).total)).toBe('R$ 4.936,74');
    expect(decodificarLink('lixo%%')).toBeNull();
  });

  it('validade vale até o fim do dia', () => {
    expect(expirado(base, new Date('2026-11-30T20:00:00'))).toBe(false);
    expect(expirado(base, new Date('2026-12-01T08:00:00'))).toBe(true);
    expect(expirado({ validade: undefined })).toBe(false);
  });
});
