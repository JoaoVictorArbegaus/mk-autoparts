/*
 * Métricas do painel (RN-10): base fictícia fixa + eventos e carrinhos deste navegador.
 * Função pura; no produto definitivo é trocada pela leitura da API (10-architecture.md).
 */
import { baseMetricas, ORIGENS, type Origem } from '../content/demo-metricas';
import type { Carrinho, Evento } from './tipos';

export type Filtro = Origem | 'todos';

export type LinhaProduto = { slug: string; cliques: number; adicionados: number; removidos: number; taxa: number };
export type LinhaVendedor = { origem: Origem; visitas: number; cliques: number; adicionados: number; finalizados: number; naoFinalizados: number };

export type Metricas = {
  visitas: number;
  cliques: number;
  adicionados: number;
  finalizados: number;
  naoFinalizados: number;
  taxaFinalizacao: number;
  produtos: LinhaProduto[];
  vendedores: LinhaVendedor[];
  funil: [number, number, number, number];
};

const origemDe = (vendedor: string | null): Origem => (vendedor && (ORIGENS as string[]).includes(vendedor) ? (vendedor as Origem) : 'direto');

export function calcularMetricas(eventos: Evento[], carrinhos: Carrinho[], filtro: Filtro, slugsAtivos: string[]): Metricas {
  const origens = filtro === 'todos' ? ORIGENS : [filtro];
  const porVendedor = new Map<Origem, LinhaVendedor>(ORIGENS.map(o => [o, { origem: o, visitas: baseMetricas.visitas[o], cliques: 0, adicionados: 0, finalizados: baseMetricas.carrinhos[o].finalizados, naoFinalizados: baseMetricas.carrinhos[o].naoFinalizados }]));
  const sessoesClique = new Map<Origem, number>(ORIGENS.map(o => [o, baseMetricas.sessoesComClique[o]]));
  const produtos = new Map<string, LinhaProduto>(slugsAtivos.map(s => [s, { slug: s, cliques: 0, adicionados: 0, removidos: 0, taxa: 0 }]));

  for (const slug of slugsAtivos) {
    const base = baseMetricas.produtos[slug];
    if (!base) continue;
    for (const o of ORIGENS) {
      const [c, a, r] = base[o];
      const v = porVendedor.get(o)!;
      v.cliques += c;
      v.adicionados += a;
      if (origens.includes(o)) {
        const p = produtos.get(slug)!;
        p.cliques += c;
        p.adicionados += a;
        p.removidos += r;
      }
    }
  }

  const sessoesComCliqueLocal = new Map<Origem, Set<string>>(ORIGENS.map(o => [o, new Set()]));
  for (const e of eventos) {
    const o = origemDe(e.vendedor);
    const v = porVendedor.get(o)!;
    if (e.tipo === 'visita_iniciada') v.visitas += 1;
    if (e.tipo === 'produto_clicado') {
      v.cliques += 1;
      sessoesComCliqueLocal.get(o)!.add(e.sessaoId);
    }
    if (e.tipo === 'item_adicionado') v.adicionados += 1;
    if (!origens.includes(o) || !e.produto) continue;
    const p = produtos.get(e.produto);
    if (!p) continue;
    if (e.tipo === 'produto_clicado') p.cliques += 1;
    if (e.tipo === 'item_adicionado') p.adicionados += 1;
    if (e.tipo === 'item_removido') p.removidos += 1;
  }
  for (const o of ORIGENS) sessoesClique.set(o, sessoesClique.get(o)! + sessoesComCliqueLocal.get(o)!.size);

  for (const c of carrinhos) {
    if (!c.itens.length && c.estado !== 'finalizado') continue; // carrinho vazio não conta (RN-09)
    const v = porVendedor.get(origemDe(c.vendedor))!;
    if (c.estado === 'finalizado') v.finalizados += 1;
    else if (c.estado === 'ativo') v.naoFinalizados += 1;
  }

  const sel = origens.map(o => porVendedor.get(o)!);
  const soma = (k: keyof Omit<LinhaVendedor, 'origem'>) => sel.reduce((s, v) => s + v[k], 0);
  const finalizados = soma('finalizados');
  const naoFinalizados = soma('naoFinalizados');
  const lista = [...produtos.values()].map(p => ({ ...p, taxa: p.cliques ? p.adicionados / p.cliques : 0 }));

  return {
    visitas: soma('visitas'),
    cliques: soma('cliques'),
    adicionados: soma('adicionados'),
    finalizados,
    naoFinalizados,
    taxaFinalizacao: finalizados + naoFinalizados ? finalizados / (finalizados + naoFinalizados) : 0,
    produtos: lista,
    vendedores: [...porVendedor.values()],
    funil: [soma('visitas'), origens.reduce((s, o) => s + sessoesClique.get(o)!, 0), finalizados + naoFinalizados, finalizados],
  };
}

export function maisClicados(m: Metricas, n = 8) {
  return [...m.produtos].sort((a, b) => b.cliques - a.cliques || a.slug.localeCompare(b.slug)).slice(0, n);
}

export function menosClicados(m: Metricas, n = 5) {
  return [...m.produtos].sort((a, b) => a.cliques - b.cliques || a.slug.localeCompare(b.slug)).slice(0, n);
}
