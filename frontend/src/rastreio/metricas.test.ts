import { describe, expect, it } from 'vitest';
import { calcularMetricas, maisClicados } from './metricas';
import { atualizarCarrinhos, finalizarCarrinhos } from './carrinhos';
import { baseMetricas } from '../content/demo-metricas';
import type { Evento } from './tipos';
import { listarProdutos } from '../content/catalogo';

const slugs = listarProdutos().map(p => p.slug);
const ev = (tipo: Evento['tipo'], vendedor: string | null, produto?: string, sessaoId = 's1'): Evento => ({
  id: Math.random().toString(),
  em: '2026-01-01T00:00:00Z',
  visitanteId: 'v',
  sessaoId,
  vendedor,
  tipo,
  produto,
});

describe('carrinhos', () => {
  it('nasce no primeiro item, finaliza e reabre ao alterar', () => {
    let id = 0;
    const gen = () => `c${++id}`;
    let r = atualizarCarrinhos([], [{ slug: 'a', quantidade: 1 }], 't1', null, gen);
    expect(r.carrinhos).toHaveLength(1);
    const f = finalizarCarrinhos(r.carrinhos, [{ slug: 'a', quantidade: 1 }], 't2', null, gen);
    expect(f.atual.estado).toBe('finalizado');
    r = atualizarCarrinhos(f.carrinhos, [{ slug: 'a', quantidade: 2 }], 't3', null, gen);
    expect(r.carrinhos).toHaveLength(2);
    expect(r.atual?.id).toBe('c2');
    const vazio = atualizarCarrinhos(r.carrinhos, [], 't4', null, gen);
    expect(vazio.carrinhos[1].estado).toBe('vazio');
  });
});

describe('métricas', () => {
  it('sem eventos devolve a base fictícia', () => {
    const m = calcularMetricas([], [], 'todos', slugs);
    expect(m.visitas).toBe(Object.values(baseMetricas.visitas).reduce((a, b) => a + b, 0));
    expect(m.vendedores).toHaveLength(4);
  });
  it('um clique local soma um clique ao produto e ao vendedor', () => {
    const slug = slugs[0];
    const antes = calcularMetricas([], [], 'joao', slugs);
    const depois = calcularMetricas([ev('produto_clicado', 'joao', slug)], [], 'joao', slugs);
    expect(depois.produtos.find(p => p.slug === slug)!.cliques).toBe(antes.produtos.find(p => p.slug === slug)!.cliques + 1);
    expect(depois.cliques).toBe(antes.cliques + 1);
    const maria = calcularMetricas([ev('produto_clicado', 'joao', slug)], [], 'maria', slugs);
    expect(maria.cliques).toBe(calcularMetricas([], [], 'maria', slugs).cliques);
  });
  it('carrinho ativo com itens conta como não finalizado; vazio não conta', () => {
    const base = calcularMetricas([], [], 'direto', slugs);
    const m = calcularMetricas(
      [],
      [
        { id: '1', vendedor: null, estado: 'ativo', criadoEm: 't', ultimaAtividade: 't', itens: [{ slug: 'a', quantidade: 1 }] },
        { id: '2', vendedor: null, estado: 'vazio', criadoEm: 't', ultimaAtividade: 't', itens: [] },
        { id: '3', vendedor: null, estado: 'finalizado', criadoEm: 't', ultimaAtividade: 't', itens: [{ slug: 'a', quantidade: 1 }] },
      ],
      'direto',
      slugs,
    );
    expect(m.naoFinalizados).toBe(base.naoFinalizados + 1);
    expect(m.finalizados).toBe(base.finalizados + 1);
  });
  it('ranking ordena por cliques', () => {
    const top = maisClicados(calcularMetricas([], [], 'todos', slugs));
    expect(top[0].cliques).toBeGreaterThanOrEqual(top[1].cliques);
  });
});
