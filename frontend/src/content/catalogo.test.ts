import { describe, expect, it } from 'vitest';
import { consultaVazia, consultar, resumoAplicacao, escreverConsulta, filtrosAtivos, lerConsulta, listarMarcas, normalizar, obterProduto, trocarMontadora } from './catalogo';
import { validarDados } from './validar';

describe('normalizar', () => {
  it('ignora maiúsculas, acentos, espaços, hífens, pontos e barras', () => {
    expect(normalizar('AB-12.3')).toBe(normalizar('ab123'));
    expect(normalizar('Maçaneta Série 4/5')).toBe('macanetaserie45');
  });
});

describe('busca', () => {
  const q = (texto: string) => consultar({ ...consultaVazia, q: texto, ordem: 'relevancia' }).map(p => p.slug);
  it('encontra pelo código com ou sem hífen', () => {
    expect(q('S03-068')[0]).toBe('lanterna-traseira-scania-serie-4-5-6-s03-068');
    expect(q('s03068')[0]).toBe('lanterna-traseira-scania-serie-4-5-6-s03-068');
    expect(q('S03 068')[0]).toBe('lanterna-traseira-scania-serie-4-5-6-s03-068');
  });
  it('encontra pelo código do outro lado e pelo código original', () => {
    expect(q('S03-069')).toContain('lanterna-traseira-scania-serie-4-5-6-s03-068');
    expect(q('1756754')).toContain('lanterna-traseira-scania-serie-4-5-6-s03-068');
  });
  it('encontra pelo nome sem acento e exige todos os termos', () => {
    expect(q('macaneta')).toContain('macaneta-scania-serie-4-5-com-cilindro-e-chave-s02-058-1');
    expect(q('farol volvo').every(s => s.includes('farol') && s.includes('volvo'))).toBe(true);
    expect(q('zzzzz')).toEqual([]);
  });
});

describe('filtros', () => {
  it('combina categoria, montadora e modelo', () => {
    const r = consultar({ ...consultaVazia, categorias: ['farois'], montadora: 'scania', modelo: 'ntg' });
    expect(r.length).toBeGreaterThan(0);
    for (const p of r) {
      expect(p.categoria).toBe('farois');
      expect(p.aplicacoes.some(a => a.montadora === 'scania' && a.modelo === 'ntg')).toBe(true);
    }
  });
  it('somente promoções lista só produtos com promoção', () => {
    const r = consultar({ ...consultaVazia, promocao: true });
    expect(r).toHaveLength(3);
    expect(r.every(p => p.promocao)).toBe(true);
  });
  it('produto sem aplicação não aparece com filtro de veículo', () => {
    const caixa = 'caixa-de-ferramentas-para-caminhao-e-carreta-50-litros-com-suportes';
    expect(obterProduto(caixa)?.aplicacoes).toEqual([]);
    expect(consultar({ ...consultaVazia, montadora: 'randon' }).map(p => p.slug)).not.toContain(caixa);
  });
  it('trocar a montadora limpa o modelo', () => {
    expect(trocarMontadora({ ...consultaVazia, montadora: 'scania', modelo: 'ntg' }, 'volvo').modelo).toBe('');
  });
  it('marca da peça tem menos de duas marcas nos dados (filtro oculto)', () => {
    expect(listarMarcas().length).toBeLessThan(2);
  });
});

describe('URL', () => {
  it('ida e volta preserva a consulta e descarta valores inválidos', () => {
    const c = lerConsulta(new URLSearchParams('q=farol&categoria=farois&categoria=xxx&montadora=scania&modelo=fh&promocao=1'));
    expect(c.categorias).toEqual(['farois']);
    expect(c.modelo).toBe(''); // FH não é modelo Scania
    expect(c.ordem).toBe('relevancia');
    expect(lerConsulta(new URLSearchParams(escreverConsulta(c)))).toEqual(c);
  });
  it('chips removem um filtro por vez', () => {
    const c = lerConsulta(new URLSearchParams('categoria=farois&montadora=scania&modelo=ntg'));
    const chips = filtrosAtivos(c);
    expect(chips.map(x => x.chave)).toEqual(['cat:farois', 'montadora', 'modelo']);
    expect(chips[1].proxima.modelo).toBe('');
  });
});

describe('dados', () => {
  it('passam na validação', () => {
    expect(validarDados()).toEqual([]);
  });
});

describe('ordenação', () => {
  it('promoções vêm primeiro na ordem padrão e por código', () => {
    for (const ordem of ['nome', 'codigo'] as const) {
      const r = consultar({ ...consultaVazia, ordem });
      const n = r.filter(p => p.promocao).length;
      expect(n).toBeGreaterThan(0);
      expect(r.slice(0, n).every(p => p.promocao)).toBe(true);
    }
  });
});

describe('resumoAplicacao', () => {
  it('junta marca, modelos e anos', () => {
    expect(resumoAplicacao(obterProduto('farol-principal-scania-ntg-serie-6-apos-2015-regulagem-manual-s07-096')!)).toBe('Scania NTG (Série 6) · 2015+');
    expect(resumoAplicacao(obterProduto('fechadura-da-porta-scania-serie-4-s02-050')!)).toBe('Scania Série 4');
  });
  it('sem aplicação vira universal', () => {
    expect(resumoAplicacao(obterProduto('caixa-de-ferramentas-para-caminhao-e-carreta-50-litros-com-suportes')!)).toMatch(/universal/);
  });
});
