/*
 * Carrinhos da demonstração (RN-09). A lista de orçamento é o carrinho: nasce no primeiro item,
 * é finalizada ao enviar pelo WhatsApp; alterar depois abre um carrinho novo com os mesmos itens.
 */
import { apagar, gravar, lerJson, novoId } from './armazenamento';
import { vendedorGravado } from './vendedor';
import type { Carrinho, ItemCarrinho } from './tipos';

export const CHAVE_CARRINHOS = 'mk-carrinhos-v1';

function valido(c: unknown): c is Carrinho {
  if (!c || typeof c !== 'object') return false;
  const x = c as Carrinho;
  return typeof x.id === 'string' && ['ativo', 'finalizado', 'vazio'].includes(x.estado) && Array.isArray(x.itens) && typeof x.criadoEm === 'string';
}

export function lerCarrinhos(): Carrinho[] {
  return lerJson(CHAVE_CARRINHOS, d => (Array.isArray(d) ? d.filter(valido) : null)) ?? [];
}

const salvar = (lista: Carrinho[]) => gravar(CHAVE_CARRINHOS, JSON.stringify(lista.slice(-500)));

/** Regras puras: recebem e devolvem a lista de carrinhos. */
export function atualizarCarrinhos(lista: Carrinho[], itens: ItemCarrinho[], agora: string, vendedor: string | null, novoIdFn = novoId): { carrinhos: Carrinho[]; atual: Carrinho | null } {
  const idx = lista.findLastIndex(c => c.estado === 'ativo');
  if (!itens.length) {
    if (idx < 0) return { carrinhos: lista, atual: null };
    const copia = [...lista];
    copia[idx] = { ...copia[idx], estado: 'vazio', itens: [], ultimaAtividade: agora };
    return { carrinhos: copia, atual: null };
  }
  if (idx < 0) {
    const novo: Carrinho = { id: novoIdFn(), vendedor, estado: 'ativo', criadoEm: agora, ultimaAtividade: agora, itens };
    return { carrinhos: [...lista, novo], atual: novo };
  }
  const copia = [...lista];
  copia[idx] = { ...copia[idx], itens, ultimaAtividade: agora };
  return { carrinhos: copia, atual: copia[idx] };
}

export function finalizarCarrinhos(lista: Carrinho[], itens: ItemCarrinho[], agora: string, vendedor: string | null, novoIdFn = novoId): { carrinhos: Carrinho[]; atual: Carrinho } {
  const idx = lista.findLastIndex(c => c.estado === 'ativo');
  const base: Carrinho = idx >= 0 ? lista[idx] : { id: novoIdFn(), vendedor, estado: 'ativo', criadoEm: agora, ultimaAtividade: agora, itens };
  const final: Carrinho = { ...base, itens, estado: 'finalizado', finalizadoEm: agora, ultimaAtividade: agora };
  const copia = idx >= 0 ? lista.map((c, i) => (i === idx ? final : c)) : [...lista, final];
  return { carrinhos: copia, atual: final };
}

export function aoMudarLista(itens: ItemCarrinho[]) {
  const r = atualizarCarrinhos(lerCarrinhos(), itens, new Date().toISOString(), vendedorGravado()?.codigo ?? null);
  salvar(r.carrinhos);
  return r.atual;
}

export function aoFinalizar(itens: ItemCarrinho[]) {
  const r = finalizarCarrinhos(lerCarrinhos(), itens, new Date().toISOString(), vendedorGravado()?.codigo ?? null);
  salvar(r.carrinhos);
  return r.atual;
}

export function carrinhoAtivoId() {
  return lerCarrinhos().findLast(c => c.estado === 'ativo')?.id;
}

export function apagarCarrinhos() {
  apagar(CHAVE_CARRINHOS);
}
