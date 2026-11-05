/*
 * Regras puras da lista de orçamento (RN-04, RN-05). Sem DOM nem localStorage: o contexto
 * (OrcamentoContext) só chama estas funções e grava o resultado.
 */
import { codigoDoLado, formatarPreco, obterProduto, type Lado, type Produto } from '../content/catalogo';

export const CHAVE_ORCAMENTO = 'mk-orcamento-v1';
export const QTD_MIN = 1;
export const QTD_MAX = 999;
export const OBS_MAX = 500;

export type Item = { slug: string; lado?: Lado; quantidade: number };
export type Lista = { itens: Item[]; observacao: string };
export type Escolha = Lado | 'Par';

export const listaVazia = (): Lista => ({ itens: [], observacao: '' });

export function limitarQuantidade(n: number) {
  if (!Number.isFinite(n)) return QTD_MIN;
  return Math.min(QTD_MAX, Math.max(QTD_MIN, Math.round(n)));
}

const mesmo = (a: Item, slug: string, lado?: Lado) => a.slug === slug && a.lado === lado;

/** Lados que a escolha adiciona; produto sem lados ignora a escolha. */
export function ladosDaEscolha(p: Produto, escolha?: Escolha): (Lado | undefined)[] | null {
  if (!p.variantes?.length) return [undefined];
  if (!escolha) return null;
  const disponiveis = p.variantes.map(v => v.lado);
  if (escolha === 'Par') return disponiveis.length > 1 ? disponiveis : null;
  return disponiveis.includes(escolha) ? [escolha] : null;
}

/** Adiciona (ou soma) um produto; "Par" adiciona os dois lados com a mesma quantidade. */
export function adicionar(lista: Lista, slug: string, quantidade = 1, escolha?: Escolha): Lista {
  const p = obterProduto(slug);
  if (!p) return lista;
  const lados = ladosDaEscolha(p, escolha);
  if (!lados) return lista;
  let itens = [...lista.itens];
  for (const lado of lados) {
    const existente = itens.find(i => mesmo(i, slug, lado));
    itens = existente
      ? itens.map(i => (i === existente ? { ...i, quantidade: limitarQuantidade(i.quantidade + quantidade) } : i))
      : [...itens, lado ? { slug, lado, quantidade: limitarQuantidade(quantidade) } : { slug, quantidade: limitarQuantidade(quantidade) }];
  }
  return { ...lista, itens };
}

export function alterarQuantidade(lista: Lista, slug: string, lado: Lado | undefined, quantidade: number): Lista {
  return { ...lista, itens: lista.itens.map(i => (mesmo(i, slug, lado) ? { ...i, quantidade: limitarQuantidade(quantidade) } : i)) };
}

export function remover(lista: Lista, slug: string, lado?: Lado): Lista {
  return { ...lista, itens: lista.itens.filter(i => !mesmo(i, slug, lado)) };
}

export function definirObservacao(lista: Lista, texto: string): Lista {
  return { ...lista, observacao: texto.slice(0, OBS_MAX) };
}

export function contar(lista: Lista) {
  return { itens: lista.itens.length, unidades: lista.itens.reduce((s, i) => s + i.quantidade, 0) };
}

/** Item ainda válido: produto ativo e lado coerente com as variantes atuais. */
function itemValido(i: Item) {
  const p = obterProduto(i.slug);
  if (!p) return false;
  if (p.variantes?.length) return !!i.lado && p.variantes.some(v => v.lado === i.lado);
  return !i.lado;
}

/**
 * Lê o JSON salvo, valida a forma e remove itens que saíram do catálogo.
 * `removidos` > 0 faz a interface avisar o visitante (RN-04).
 */
export function decodificar(bruto: string | null): { lista: Lista; removidos: number } {
  if (!bruto) return { lista: listaVazia(), removidos: 0 };
  try {
    const dado: unknown = JSON.parse(bruto);
    if (!dado || typeof dado !== 'object' || !Array.isArray((dado as Lista).itens)) return { lista: listaVazia(), removidos: 0 };
    const obs = typeof (dado as Lista).observacao === 'string' ? (dado as Lista).observacao.slice(0, OBS_MAX) : '';
    const formatados: Item[] = [];
    for (const x of (dado as Lista).itens.slice(0, 200)) {
      if (!x || typeof x !== 'object' || typeof x.slug !== 'string' || typeof x.quantidade !== 'number') continue;
      const lado = x.lado === 'LD' || x.lado === 'LE' ? x.lado : undefined;
      formatados.push(lado ? { slug: x.slug, lado, quantidade: limitarQuantidade(x.quantidade) } : { slug: x.slug, quantidade: limitarQuantidade(x.quantidade) });
    }
    const validos = formatados.filter(itemValido);
    // Itens repetidos (mesmo produto e lado) são somados.
    let lista: Lista = { itens: [], observacao: obs };
    for (const i of validos) {
      const e = lista.itens.find(x => mesmo(x, i.slug, i.lado));
      lista = e ? alterarQuantidade(lista, i.slug, i.lado, e.quantidade + i.quantidade) : { ...lista, itens: [...lista.itens, i] };
    }
    return { lista, removidos: formatados.length - validos.length };
  } catch {
    return { lista: listaVazia(), removidos: 0 };
  }
}

export function codificar(lista: Lista) {
  return JSON.stringify({ itens: lista.itens, observacao: lista.observacao });
}

/** Linha de um item na mensagem do WhatsApp (RN-05). Nome e código vêm sempre dos dados atuais. */
export function linhaItem(i: Item) {
  const p = obterProduto(i.slug);
  if (!p) return null;
  const codigo = codigoDoLado(p, i.lado);
  let linha = `- ${i.quantidade}x ${p.nome}`;
  if (i.lado) linha += ` — ${i.lado}`;
  if (codigo) linha += ` (cód. ${codigo})`;
  if (p.promocao) linha += ` — promoção ${formatarPreco(p.promocao.preco)} un.`;
  return linha;
}

/** Mensagem completa da lista. Com vendedor na sessão, a saudação usa o nome dele. */
export function mensagemLista(lista: Lista, nomeVendedor?: string) {
  const saudacao = `Olá, ${nomeVendedor ?? 'MK Autoparts'}! Gostaria de um orçamento destes itens:`;
  const linhas = lista.itens.map(linhaItem).filter((l): l is string => !!l);
  const partes = [saudacao, '', ...linhas];
  const obs = lista.observacao.trim();
  if (obs) partes.push('', `Observação: ${obs}`);
  return partes.join('\n');
}

/** Mensagem do botão "Solicitar orçamento" de um único produto (RN-05). */
export function mensagemProduto(p: Produto, nomeVendedor?: string, lado?: Lado) {
  const codigo = lado ? codigoDoLado(p, lado) : p.variantes?.length ? p.variantes.map(v => v.codigo).filter(Boolean).join(' / ') : p.codigo;
  const nome = lado ? `${p.nome} — ${lado}` : p.nome;
  return `Olá, ${nomeVendedor ?? 'MK Autoparts'}! Gostaria de um orçamento do produto ${nome}${codigo ? ` (cód. ${codigo})` : ''}.`;
}
