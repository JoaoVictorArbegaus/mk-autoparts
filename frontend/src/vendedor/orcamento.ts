/*
 * Orçamento do vendedor (DEC-018, RN-13), em funções puras: preço por item (ou "sob consulta"),
 * desconto em valor ou porcentagem por item e no total, sem nunca deixar preço negativo, e o
 * orçamento codificado na URL do link (demonstração, sem servidor).
 */
import type { Lado } from '../content/catalogo';

export type Desconto = { tipo: 'valor' | 'percentual'; valor: number };

export type ItemOrcamento = { slug: string; lado?: Lado; quantidade: number; preco?: number; desconto?: Desconto };

export type Alteracao = { em: string; texto: string };

export type Orcamento = {
  id: string;
  /** Número sequencial do documento (ORC-0001), dado ao salvar. */
  numero?: string;
  vendedor: string;
  cliente?: string;
  /** Contato do cliente (opcional), como no modelo do documento. */
  clienteContato?: string;
  itens: ItemOrcamento[];
  descontoTotal?: Desconto;
  observacao: string;
  criadoEm: string;
  /** Data limite (AAAA-MM-DD), opcional. */
  validade?: string;
  estado: 'ativo' | 'encerrado' | 'excluido';
  alteracoes: Alteracao[];
};

/** Arredonda a 2 casas, meio para cima (como ROUND_HALF_UP do modelo), sem o erro de ponto flutuante. */
export const centavos = (n: number) => Math.sign(n) * Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100;

/** Valor depois do desconto, nunca negativo. */
export function aplicarDesconto(valor: number, desconto?: Desconto): number {
  if (!desconto || !(desconto.valor > 0)) return centavos(valor);
  const menos = desconto.tipo === 'percentual' ? (valor * Math.min(desconto.valor, 100)) / 100 : desconto.valor;
  return centavos(Math.max(0, valor - menos));
}

/** Porcentagem de desconto sobre o valor antigo (0 quando não há desconto ou valor). */
export function porcentagem(antigo: number, novo: number): number {
  if (!(antigo > 0) || novo >= antigo) return 0;
  return ((antigo - novo) / antigo) * 100;
}

/** "10%" ou "12,5%": uma casa decimal só quando não for inteira (RN-13). */
export function formatarPorcentagem(p: number): string {
  const arredondado = Math.round(p * 10) / 10;
  return `${Number.isInteger(arredondado) ? arredondado : arredondado.toFixed(1).replace('.', ',')}%`;
}

export type LinhaCalculada = { comPreco: boolean; unitario: number; unitarioFinal: number; pct: number; total: number };

export function calcularItem(item: ItemOrcamento): LinhaCalculada {
  if (item.preco === undefined || !(item.preco >= 0)) return { comPreco: false, unitario: 0, unitarioFinal: 0, pct: 0, total: 0 };
  const unitarioFinal = aplicarDesconto(item.preco, item.desconto);
  return { comPreco: true, unitario: item.preco, unitarioFinal, pct: porcentagem(item.preco, unitarioFinal), total: centavos(unitarioFinal * item.quantidade) };
}

export type Totais = {
  /** Σ preço × qtd dos itens com preço, sem nenhum desconto. */
  subtotalSemDesconto: number;
  /** Σ total dos itens (já com o desconto de cada item). */
  subtotal: number;
  /** Valor do desconto no total. */
  descontoTotal: number;
  total: number;
  /** % do desconto no total, sobre o subtotal com desconto nos itens. */
  pct: number;
  /** % de economia final, sobre o subtotal sem desconto (linha do documento). */
  economia: number;
  semPreco: number;
};

/** Regras do modelo do documento (docs/Para-Socio-Orcamento): itens sem preço ficam fora de todas as somas. */
export function calcularTotais(orc: Pick<Orcamento, 'itens' | 'descontoTotal'>): Totais {
  let subtotalSemDesconto = 0;
  let subtotal = 0;
  let semPreco = 0;
  for (const i of orc.itens) {
    const l = calcularItem(i);
    if (!l.comPreco) {
      semPreco++;
      continue;
    }
    subtotalSemDesconto += centavos(l.unitario * i.quantidade);
    subtotal += l.total;
  }
  subtotalSemDesconto = centavos(subtotalSemDesconto);
  subtotal = centavos(subtotal);
  const total = aplicarDesconto(subtotal, orc.descontoTotal);
  return {
    subtotalSemDesconto,
    subtotal,
    descontoTotal: centavos(subtotal - total),
    total,
    pct: porcentagem(subtotal, total),
    economia: porcentagem(subtotalSemDesconto, total),
    semPreco,
  };
}

/** Validade passada: vale até o fim do dia informado. */
export function expirado(orc: Pick<Orcamento, 'validade'>, agora = new Date()): boolean {
  if (!orc.validade) return false;
  const fim = new Date(`${orc.validade}T23:59:59`);
  return agora > fim;
}

// ---------- Link: orçamento codificado na URL (demonstração) ----------

type Compacto = {
  i: string;
  n?: string;
  v: string;
  c?: string;
  cc?: string;
  t: [string, string, number, number | null, Desconto['tipo'] | null, number | null][];
  dt?: [Desconto['tipo'], number];
  o?: string;
  d: string;
  val?: string;
};

function paraBase64Url(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(codigo: string) {
  const bin = atob(codigo.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

export function codificarLink(orc: Orcamento): string {
  const c: Compacto = {
    i: orc.id,
    v: orc.vendedor,
    t: orc.itens.map(i => [i.slug, i.lado ?? '', i.quantidade, i.preco ?? null, i.desconto?.tipo ?? null, i.desconto?.valor ?? null]),
    d: orc.criadoEm,
  };
  if (orc.numero) c.n = orc.numero;
  if (orc.cliente) c.c = orc.cliente;
  if (orc.clienteContato) c.cc = orc.clienteContato;
  if (orc.descontoTotal) c.dt = [orc.descontoTotal.tipo, orc.descontoTotal.valor];
  if (orc.observacao) c.o = orc.observacao;
  if (orc.validade) c.val = orc.validade;
  return paraBase64Url(JSON.stringify(c));
}

/** Lê o orçamento do link; null se o código estiver quebrado. */
export function decodificarLink(codigo: string): Orcamento | null {
  try {
    const c = JSON.parse(deBase64Url(codigo)) as Compacto;
    if (!c || typeof c.i !== 'string' || typeof c.v !== 'string' || !Array.isArray(c.t)) return null;
    return {
      id: c.i,
      numero: typeof c.n === 'string' ? c.n : undefined,
      vendedor: c.v,
      cliente: typeof c.c === 'string' ? c.c : undefined,
      clienteContato: typeof c.cc === 'string' ? c.cc : undefined,
      itens: c.t
        .filter(t => Array.isArray(t) && typeof t[0] === 'string')
        .map(([slug, lado, quantidade, preco, tipo, valor]) => ({
          slug,
          lado: lado === 'LD' || lado === 'LE' ? lado : undefined,
          quantidade: Math.max(1, Math.min(999, Math.round(Number(quantidade) || 1))),
          preco: typeof preco === 'number' && preco >= 0 ? preco : undefined,
          desconto: tipo && typeof valor === 'number' ? { tipo, valor } : undefined,
        })),
      descontoTotal: Array.isArray(c.dt) ? { tipo: c.dt[0], valor: Number(c.dt[1]) } : undefined,
      observacao: typeof c.o === 'string' ? c.o.slice(0, 500) : '',
      criadoEm: typeof c.d === 'string' ? c.d : new Date().toISOString(),
      validade: typeof c.val === 'string' ? c.val : undefined,
      estado: 'ativo',
      alteracoes: [],
    };
  } catch {
    return null;
  }
}
