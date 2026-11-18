/*
 * Demonstração (RN-13): orçamentos do vendedor no localStorage deste navegador e a sessão simulada
 * do vendedor no sessionStorage. O aviso "Alterado pelo cliente" só aparece quando o link é aberto e
 * alterado no mesmo navegador (outra aba, por exemplo); entre aparelhos, só com servidor.
 */
import { gravar, lerJson, novoId } from '../rastreio/armazenamento';
import { obterVendedor } from '../content/vendedores';
import { codificarLink, lerOrcamento, nomeCliente, type Alteracao, type Orcamento } from './orcamento';

export const CHAVE_ORCAMENTOS = 'mk-orcamentos-v1';
export const CHAVE_SESSAO_VENDEDOR = 'mk-vendedor-sessao';

// Lê também os orçamentos gravados no formato anterior (cliente em texto, valores em número).
const valida = (d: unknown) => (Array.isArray(d) ? d.map(lerOrcamento).filter((o): o is Orcamento => !!o) : null);

export function lerOrcamentos(): Orcamento[] {
  return lerJson(CHAVE_ORCAMENTOS, valida) ?? [];
}

function gravarTodos(lista: Orcamento[]) {
  gravar(CHAVE_ORCAMENTOS, JSON.stringify(lista));
}

export const obterOrcamento = (id: string) => lerOrcamentos().find(o => o.id === id);

export function salvarOrcamento(orc: Orcamento) {
  const lista = lerOrcamentos().filter(o => o.id !== orc.id);
  gravarTodos([orc, ...lista]);
}

export function atualizarOrcamento(id: string, mudar: (o: Orcamento) => Orcamento) {
  gravarTodos(lerOrcamentos().map(o => (o.id === id ? mudar(o) : o)));
}

/** Alteração feita pelo cliente no link: entra no aviso do orçamento (se existir neste navegador). */
export function registrarAlteracao(id: string, texto: string) {
  const a: Alteracao = { em: new Date().toISOString(), texto };
  atualizarOrcamento(id, o => ({ ...o, alteracoes: [...o.alteracoes, a].slice(-20) }));
}

/** Link do orçamento para o cliente (o orçamento vai codificado na URL, RN-13). */
export const linkDoOrcamento = (orc: Orcamento) => `${typeof window === 'undefined' ? '' : window.location.origin}/orcamento?o=${codificarLink(orc)}`;

/**
 * Envia o link ao cliente (RN-13): no celular, o compartilhamento do próprio aparelho (WhatsApp e
 * outros apps); sem ele, copia o link. Devolve o que aconteceu, para o aviso não mentir.
 */
export async function enviarLink(orc: Orcamento): Promise<'compartilhado' | 'copiado' | 'cancelado' | 'falhou'> {
  const url = linkDoOrcamento(orc);
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  if (nav?.share) {
    try {
      await nav.share({ title: 'Orçamento MK Autoparts', text: nomeCliente(orc.cliente) ? `Orçamento para ${nomeCliente(orc.cliente)}` : 'Seu orçamento da MK Autoparts', url });
      return 'compartilhado';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelado';
    }
  }
  return copiarLink(orc);
}

export async function copiarLink(orc: Orcamento): Promise<'copiado' | 'falhou'> {
  try {
    await navigator.clipboard.writeText(linkDoOrcamento(orc));
    return 'copiado';
  } catch {
    return 'falhou';
  }
}

/** Próximo número de documento (ORC-0001, ORC-0002…), sequencial neste navegador (demonstração). */
export function proximoNumero(): string {
  const chave = 'mk-orcamento-seq';
  let n = 0;
  try {
    n = Number(localStorage.getItem(chave)) || 0;
  } catch {
    /* indisponível */
  }
  n += 1;
  gravar(chave, String(n));
  return `ORC-${String(n).padStart(4, '0')}`;
}

export const novoIdOrcamento = () => novoId().replace(/-/g, '').slice(0, 10);

// ---------- Sessão simulada do vendedor (DEC-021) ----------

export function vendedorDaSessao() {
  try {
    return obterVendedor(sessionStorage.getItem(CHAVE_SESSAO_VENDEDOR));
  } catch {
    return undefined;
  }
}

export function entrarComo(codigo: string) {
  gravar(CHAVE_SESSAO_VENDEDOR, codigo, true);
}

export function sairDaSessao() {
  try {
    sessionStorage.removeItem(CHAVE_SESSAO_VENDEDOR);
  } catch {
    /* indisponível */
  }
}
