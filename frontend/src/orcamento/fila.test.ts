import { describe, expect, it } from 'vitest';
import { atender, normalizarFila } from './fila';

const ABC = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('fila do rodízio (DEC-017, AC-10)', () => {
  it('rodízio: o primeiro atende e vai para o fim', () => {
    expect(atender(ABC, ABC[0])).toEqual(['b', 'c', 'd', 'e', 'f', 'a']);
  });

  it('escolha consome a vez: D e depois F', () => {
    const depoisD = atender(ABC, 'd');
    expect(depoisD).toEqual(['a', 'b', 'c', 'e', 'f', 'd']);
    expect(atender(depoisD, 'f')).toEqual(['a', 'b', 'c', 'e', 'd', 'f']);
  });

  it('sem fila gravada usa a ordem do cadastro', () => {
    expect(normalizarFila(null, ABC)).toEqual(ABC);
  });

  it('vendedor desativado sai e vendedor novo entra no fim', () => {
    expect(normalizarFila(['c', 'a', 'b'], ['a', 'c', 'x'])).toEqual(['c', 'a', 'x']);
  });

  it('ignora códigos repetidos e vendedor fora da fila', () => {
    expect(normalizarFila(['a', 'a', 'b'], ['a', 'b'])).toEqual(['a', 'b']);
    expect(atender(['a', 'b'], 'z')).toEqual(['a', 'b']);
  });
});
