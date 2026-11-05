import { describe, expect, it } from 'vitest';
import { adicionar, alterarQuantidade, codificar, contar, decodificar, definirObservacao, listaVazia, mensagemLista, mensagemProduto, remover } from './lista';
import { obterProduto } from '../content/catalogo';
import { whatsapp } from '../content/site';

const LANTERNA = 'lanterna-traseira-scania-serie-4-5-6-s03-068';
const TENSOR = 'tensor-da-correia-do-alternador-scania-serie-4-s05-035';
const PARALAMA = 'paralama-bitrem-randon-ate-2008';

describe('lista de orçamento', () => {
  it('produto com lados exige a escolha; Par adiciona os dois', () => {
    expect(adicionar(listaVazia(), LANTERNA).itens).toEqual([]);
    const par = adicionar(listaVazia(), LANTERNA, 2, 'Par');
    expect(par.itens).toEqual([{ slug: LANTERNA, lado: 'LD', quantidade: 2 }, { slug: LANTERNA, lado: 'LE', quantidade: 2 }]);
  });
  it('mesmo produto e lado soma a quantidade, com limite 999', () => {
    let l = adicionar(listaVazia(), TENSOR, 2);
    l = adicionar(l, TENSOR, 3);
    expect(l.itens).toEqual([{ slug: TENSOR, quantidade: 5 }]);
    l = adicionar(l, TENSOR, 5000);
    expect(l.itens[0].quantidade).toBe(999);
  });
  it('quantidade fora de 1–999 é corrigida', () => {
    const l = adicionar(listaVazia(), TENSOR);
    expect(alterarQuantidade(l, TENSOR, undefined, 0).itens[0].quantidade).toBe(1);
    expect(alterarQuantidade(l, TENSOR, undefined, 1500).itens[0].quantidade).toBe(999);
  });
  it('remove e conta itens e unidades', () => {
    let l = adicionar(adicionar(listaVazia(), TENSOR, 2), LANTERNA, 1, 'LE');
    expect(contar(l)).toEqual({ itens: 2, unidades: 3 });
    l = remover(l, LANTERNA, 'LE');
    expect(contar(l)).toEqual({ itens: 1, unidades: 2 });
  });
  it('decodifica salvando só itens válidos e avisa os removidos', () => {
    const bruto = JSON.stringify({ itens: [{ slug: TENSOR, quantidade: 2 }, { slug: 'nao-existe', quantidade: 1 }, { slug: LANTERNA, quantidade: 1 }], observacao: 'ok' });
    const r = decodificar(bruto);
    expect(r.lista.itens).toEqual([{ slug: TENSOR, quantidade: 2 }]);
    expect(r.removidos).toBe(2);
    expect(r.lista.observacao).toBe('ok');
    expect(decodificar('{lixo').lista).toEqual(listaVazia());
    expect(decodificar(codificar(r.lista)).lista).toEqual(r.lista);
  });
  it('observação é limitada a 500 caracteres', () => {
    expect(definirObservacao(listaVazia(), 'x'.repeat(600)).observacao).toHaveLength(500);
  });
});

describe('mensagem do WhatsApp', () => {
  it('segue RN-05: lado, código, promoção só com preço e observação opcional', () => {
    let l = adicionar(listaVazia(), LANTERNA, 2, 'LD');
    l = adicionar(l, PARALAMA, 1, 'LE');
    const msg = mensagemLista(l);
    expect(msg).toBe(
      [
        'Olá, MK Autoparts! Gostaria de um orçamento destes itens:',
        '',
        '- 2x Lanterna traseira Scania Série 4/5/6 — LD (cód. S03-068)',
        '- 1x Paralama Bitrem Randon até 2008 — LE — promoção R$ 109,90 un.',
      ].join('\n'),
    );
    expect(msg).not.toContain('Observação');
    expect(mensagemLista(definirObservacao(l, 'Scania R440 2015'))).toContain('\n\nObservação: Scania R440 2015');
  });
  it('produto fora de promoção nunca leva preço; vendedor muda a saudação', () => {
    const msg = mensagemLista(adicionar(listaVazia(), TENSOR), 'João');
    expect(msg.startsWith('Olá, João!')).toBe(true);
    expect(msg).not.toContain('R$');
  });
  it('link codifica acentos e quebras de linha', () => {
    const url = whatsapp('5549991100096', mensagemLista(adicionar(listaVazia(), TENSOR)));
    expect(url.startsWith('https://wa.me/5549991100096?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toContain('\n- 1x Tensor');
    expect(url).not.toMatch(/\s/);
  });
  it('mensagem de um único produto', () => {
    expect(mensagemProduto(obterProduto(TENSOR)!)).toBe('Olá, MK Autoparts! Gostaria de um orçamento do produto Tensor da correia do alternador Scania Série 4 (cód. S05-035).');
  });
});
