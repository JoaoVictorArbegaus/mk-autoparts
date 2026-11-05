/*
 * Vendedor da sessão (RN-07, demonstração). O código de `?v=` só vale se existir na lista de
 * vendedores fictícios; vale o último link usado e a atribuição não expira (PEND-019).
 */
import { obterVendedor, type Vendedor } from '../content/vendedores';
import { apagar, gravar, lerJson } from './armazenamento';

export const CHAVE_VENDEDOR = 'mk-vendedor-v1';

type Gravado = { codigo: string; desde: string };

function valida(d: unknown): Gravado | null {
  if (!d || typeof d !== 'object') return null;
  const { codigo, desde } = d as Gravado;
  return typeof codigo === 'string' && typeof desde === 'string' && obterVendedor(codigo) ? { codigo, desde } : null;
}

export function vendedorGravado(): Vendedor | undefined {
  return obterVendedor(lerJson(CHAVE_VENDEDOR, valida)?.codigo);
}

/** Aplica `?v=` da URL. Código inválido não apaga uma atribuição válida anterior. */
export function aplicarParametroVendedor(search: string): Vendedor | undefined {
  const codigo = new URLSearchParams(search).get('v')?.trim().toLowerCase();
  const novo = obterVendedor(codigo);
  if (novo) {
    const atual = lerJson(CHAVE_VENDEDOR, valida);
    if (atual?.codigo !== novo.codigo) gravar(CHAVE_VENDEDOR, JSON.stringify({ codigo: novo.codigo, desde: new Date().toISOString() }));
    return novo;
  }
  return vendedorGravado();
}

export function esquecerVendedor() {
  apagar(CHAVE_VENDEDOR);
}
