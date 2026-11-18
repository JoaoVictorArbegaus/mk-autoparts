import { describe, expect, it } from 'vitest';
import { caminhoComVendedor, linkPessoal } from './compartilhar';

describe('link com o vendedor (M3 e M4)', () => {
  it('acrescenta o ?v= mantendo busca e filtros', () => {
    expect(caminhoComVendedor('/catalogo', '?categoria=farois&ano=2018', 'daniel')).toBe('/catalogo?categoria=farois&ano=2018&v=daniel');
  });
  it('troca um ?v= de outro vendedor', () => {
    expect(caminhoComVendedor('/produto/x', '?v=vitor', 'daniel')).toBe('/produto/x?v=daniel');
  });
  it('link pessoal aponta para a página inicial', () => {
    expect(linkPessoal('https://mk.exemplo', 'taine')).toBe('https://mk.exemplo/?v=taine');
  });
});
