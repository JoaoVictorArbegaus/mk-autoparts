/*
 * Orçamento do vendedor (DEC-018, RN-13), em funções puras, no modelo do documento pedido pela MK
 * (docs/pfd-regras: especificação, orcamento-exemplo.json e orcamento_modelo.py, a referência do
 * cálculo). Valores monetários e alíquotas são texto com ponto decimal, como no contrato JSON;
 * nenhum valor calculado é gravado (o sistema recalcula sempre), e todo cálculo usa Dec (decimal).
 * O orçamento também vai codificado na URL do link (demonstração, sem servidor), sem os dados
 * pessoais do cliente.
 */
import type { Lado } from '../content/catalogo';
import { Dec, decimalDoDado, pctTexto } from './decimal';
import { cnpjValido, cpfValido } from './documentos';

export type Desconto = { tipo: 'valor' | 'percentual'; valor: string };

export type ItemOrcamento = {
  slug: string;
  lado?: Lado;
  /** Inteiro de 1 a 999. */
  quantidade: number;
  /** Preço de tabela unitário, sem IPI. Vazio = "sob consulta" (fora de todos os cálculos). */
  preco?: string;
  /** Por unidade, em % ou em R$; nunca deixa o preço abaixo de zero. */
  desconto?: Desconto;
  /** Descrição editada no orçamento (não altera o cadastro). Vazio = nome do catálogo. */
  descricao?: string;
  /** Nº compatível editado no orçamento. Vazio = códigos originais do catálogo, separados por "/". */
  codigoOriginal?: string;
  /** Unidade. Padrão "PC". */
  unidade?: string;
  /** Alíquota de IPI em %. Padrão 0 (o catálogo do protótipo não tem IPI). */
  ipiPct?: string;
  /** Valor da substituição tributária do item inteiro, em R$. Padrão 0. */
  st?: string;
};

export type TipoCliente = 'PJ' | 'PF';

export type ClienteOrcamento = {
  tipo: TipoCliente;
  /** PJ: nome em destaque. */
  razaoSocial?: string;
  /** PJ: comprador (pessoa de contato, opcional) · PF: nome do cliente (obrigatório). */
  nome?: string;
  /** CNPJ (PJ) ou CPF (PF), com dígitos verificadores válidos. */
  documento?: string;
  /** Só PJ. */
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
};

export type EntregaOrcamento = {
  enderecoEntrega?: string;
  enderecoCobranca?: string;
  /** "Igual ao de entrega": a cobrança repete o endereço de entrega. */
  cobrancaIgualEntrega?: boolean;
  /** Texto livre com o tipo de frete (ex.: "FOB - Expresso Exemplo"). */
  transportadora?: string;
  prazoPagamento?: string;
};

export type Logistica = { cubagemM3?: string; volumes?: number; pesoLiquidoKg?: string; pesoBrutoKg?: string };

export type Alteracao = { em: string; texto: string };

export type Orcamento = {
  id: string;
  /** Número sequencial do documento (ORC-0001), dado ao salvar. Não editável. */
  numero?: string;
  /** Código de venda gerado pela MK; texto livre, até 20 caracteres. Vazio mostra "—". */
  codigoVenda?: string;
  vendedor: string;
  cliente: ClienteOrcamento;
  entrega: EntregaOrcamento;
  itens: ItemOrcamento[];
  descontoTotal?: Desconto;
  /** Frete (+), em R$. Padrão 0. */
  frete?: string;
  /** Impostos (−), dedução em R$. Padrão 0. */
  impostosDeducao?: string;
  logistica?: Logistica;
  /** Até 500 caracteres. */
  observacao: string;
  criadoEm: string;
  /** Data limite (AAAA-MM-DD), opcional. */
  validade?: string;
  estado: 'ativo' | 'encerrado' | 'excluido';
  alteracoes: Alteracao[];
};

export const CODIGO_VENDA_MAX = 20;
export const QTD_ITEM_MIN = 1;
export const QTD_ITEM_MAX = 999;

/** Nome em destaque no quadro do cliente: razão social (PJ) ou nome (PF). */
export const nomeCliente = (c?: ClienteOrcamento) => ((c?.tipo === 'PF' ? c.nome : c?.razaoSocial) ?? '').trim();

export const clienteVazio = (): ClienteOrcamento => ({ tipo: 'PJ' });

// ---------- Cálculo (orcamento_modelo.py, função calcular) ----------

const dec = (v?: string) => (v ? Dec.de(v) : Dec.ZERO);

export type ItemCalculado = {
  comPreco: boolean;
  /** Preço de tabela (sem IPI). */
  preco?: Dec;
  /** Vl. líquido: unitário final, sem IPI, com todos os descontos. */
  liquido?: Dec;
  /** Vl. unit.: líquido com IPI. */
  unitario?: Dec;
  /** Vl. total do item, com IPI. */
  total?: Dec;
  /** Quantidade × líquido (sem IPI). */
  base?: Dec;
  ipiPct: Dec;
  st: Dec;
  /** % de desconto do líquido sobre o preço de tabela (item + rateio do total); undefined se não houver. */
  pctDesconto?: Dec;
};

export type CalculoOrcamento = {
  itens: ItemCalculado[];
  /** Σ arredondar(preço × qtd), sem nenhum desconto. */
  semDesconto: Dec;
  /** Σ arredondar(líquido × qtd). */
  valorProdutos: Dec;
  /** semDesconto − valorProdutos. */
  desconto: Dec;
  /** desconto ÷ semDesconto × 100. */
  pctDesconto: Dec;
  ipi: Dec;
  st: Dec;
  frete: Dec;
  impostos: Dec;
  total: Dec;
  /** Itens com preço e sob consulta. */
  comPreco: number;
  semPreco: number;
};

/** Preço depois do desconto do item: percentual ou em R$ por unidade, arredondado, nunca abaixo de zero. */
export function aplicarDescontoItem(preco: Dec, desconto?: Desconto): Dec {
  let p = preco;
  if (desconto && desconto.valor) {
    const v = Dec.de(desconto.valor);
    p = desconto.tipo === 'percentual' ? p.vezes(Dec.UM.menos(v.dividido(100))) : p.menos(v);
  }
  return Dec.max(p.arredondar(), Dec.ZERO);
}

/**
 * 1. Desconto do item; 2. desconto no total rateado (fator) em todos os itens com preço;
 * 3. líquido, unitário com IPI e total do item, arredondando cada unitário antes de multiplicar;
 * 4. total = valor dos produtos + IPI + ST + frete − impostos. Itens sob consulta ficam fora.
 */
export function calcularOrcamento(orc: Pick<Orcamento, 'itens' | 'descontoTotal' | 'frete' | 'impostosDeducao'>): CalculoOrcamento {
  const aposItem = orc.itens.map(i => (i.preco !== undefined ? aplicarDescontoItem(Dec.de(i.preco), i.desconto) : undefined));
  const baseTotal = Dec.somar(orc.itens.flatMap((i, k) => (aposItem[k] ? [aposItem[k]!.vezes(i.quantidade)] : [])));
  let fator = Dec.UM;
  const dt = orc.descontoTotal;
  if (dt && dt.valor && !baseTotal.zero) {
    const v = Dec.de(dt.valor);
    fator = dt.tipo === 'percentual' ? Dec.UM.menos(v.dividido(100)) : Dec.UM.menos(Dec.min(v, baseTotal).dividido(baseTotal));
  }

  const itens: ItemCalculado[] = orc.itens.map((i, k) => {
    const ipiPct = dec(i.ipiPct);
    const st = dec(i.st);
    const apos = aposItem[k];
    if (!apos) return { comPreco: false, ipiPct, st };
    const preco = Dec.de(i.preco!);
    const liquido = apos.vezes(fator).arredondar();
    const base = liquido.vezes(i.quantidade).arredondar();
    const unitario = liquido.vezes(Dec.UM.mais(ipiPct.dividido(100))).arredondar();
    const total = unitario.vezes(i.quantidade).arredondar();
    const pctDesconto = liquido.igual(preco) || preco.zero ? undefined : preco.menos(liquido).dividido(preco).vezes(100);
    return { comPreco: true, preco, liquido, unitario, total, base, ipiPct, st, pctDesconto };
  });

  const com = itens.filter(i => i.comPreco);
  const semDesconto = Dec.somar(com.map(i => i.preco!.vezes(orc.itens[itens.indexOf(i)].quantidade).arredondar()));
  const valorProdutos = Dec.somar(com.map(i => i.base!));
  const desconto = semDesconto.menos(valorProdutos);
  const ipi = Dec.somar(com.map(i => i.total!.menos(i.base!)));
  const st = Dec.somar(com.map(i => i.st));
  const frete = dec(orc.frete);
  const impostos = dec(orc.impostosDeducao);
  return {
    itens,
    semDesconto,
    valorProdutos,
    desconto,
    pctDesconto: semDesconto.zero ? Dec.ZERO : desconto.dividido(semDesconto).vezes(100),
    ipi,
    st,
    frete,
    impostos,
    total: valorProdutos.mais(ipi).mais(st).mais(frete).menos(impostos),
    comPreco: com.length,
    semPreco: itens.length - com.length,
  };
}

/** "−12,7%" etc.: porcentagem com uma casa só quando não for inteira (RN-13). */
export const formatarPorcentagem = (p: Dec) => pctTexto(p);

/** Validade passada: vale até o fim do dia informado. */
export function expirado(orc: Pick<Orcamento, 'validade'>, agora = new Date()): boolean {
  if (!orc.validade) return false;
  const fim = new Date(`${orc.validade}T23:59:59`);
  return agora > fim;
}

// ---------- Validação (especificação do documento, "Regras de validação") ----------

export type ErroOrcamento =
  | 'semItens'
  | 'clienteNome'
  | 'documento'
  | 'quantidade'
  | 'descontoPct'
  | 'codigoVenda'
  | 'observacao';

export function validarOrcamento(orc: Orcamento): ErroOrcamento[] {
  const erros: ErroOrcamento[] = [];
  if (!orc.itens.length) erros.push('semItens');
  if (!nomeCliente(orc.cliente)) erros.push('clienteNome');
  const doc = orc.cliente.documento?.trim();
  if (doc && !(orc.cliente.tipo === 'PJ' ? cnpjValido(doc) : cpfValido(doc))) erros.push('documento');
  if (orc.itens.some(i => !Number.isInteger(i.quantidade) || i.quantidade < QTD_ITEM_MIN || i.quantidade > QTD_ITEM_MAX)) erros.push('quantidade');
  const pctInvalido = (d?: Desconto) => d?.tipo === 'percentual' && !!d.valor && Dec.de(d.valor).comparar(100) > 0;
  if (orc.itens.some(i => pctInvalido(i.desconto)) || pctInvalido(orc.descontoTotal)) erros.push('descontoPct');
  if ((orc.codigoVenda ?? '').length > CODIGO_VENDA_MAX) erros.push('codigoVenda');
  if (orc.observacao.length > 500) erros.push('observacao');
  return erros;
}

/** Limpa o orçamento para gravar: textos aparados, campos vazios removidos, IE só em PJ, comprador só em PJ. */
export function limparOrcamento(orc: Orcamento): Orcamento {
  const t = (s?: string) => s?.trim() || undefined;
  const c = orc.cliente;
  const pj = c.tipo === 'PJ';
  const e = orc.entrega;
  return {
    ...orc,
    codigoVenda: t(orc.codigoVenda),
    cliente: {
      tipo: c.tipo,
      razaoSocial: pj ? t(c.razaoSocial) : undefined,
      nome: t(c.nome),
      documento: t(c.documento),
      inscricaoEstadual: pj ? t(c.inscricaoEstadual) : undefined,
      email: t(c.email),
      telefone: t(c.telefone),
    },
    entrega: {
      enderecoEntrega: t(e.enderecoEntrega),
      cobrancaIgualEntrega: e.cobrancaIgualEntrega || undefined,
      enderecoCobranca: e.cobrancaIgualEntrega ? undefined : t(e.enderecoCobranca),
      transportadora: t(e.transportadora),
      prazoPagamento: t(e.prazoPagamento),
    },
    itens: orc.itens.map(i => ({ ...i, descricao: t(i.descricao), codigoOriginal: t(i.codigoOriginal), unidade: t(i.unidade) })),
    observacao: orc.observacao.trim(),
  };
}

// ---------- Leitura de dados gravados (e do formato anterior) ----------

const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);

function lerDesconto(d: unknown): Desconto | undefined {
  if (!d || typeof d !== 'object') return undefined;
  const { tipo, valor } = d as { tipo?: unknown; valor?: unknown };
  const v = decimalDoDado(valor);
  return (tipo === 'percentual' || tipo === 'valor') && v ? { tipo, valor: v } : undefined;
}

export function lerItem(d: unknown): ItemOrcamento | null {
  if (!d || typeof d !== 'object' || typeof (d as ItemOrcamento).slug !== 'string') return null;
  const i = d as Record<string, unknown>;
  const lado = i.lado === 'LD' || i.lado === 'LE' ? i.lado : undefined;
  return {
    slug: i.slug as string,
    lado,
    quantidade: Math.max(QTD_ITEM_MIN, Math.min(QTD_ITEM_MAX, Math.round(Number(i.quantidade) || 1))),
    preco: decimalDoDado(i.preco),
    desconto: lerDesconto(i.desconto),
    descricao: texto(i.descricao),
    codigoOriginal: texto(i.codigoOriginal),
    unidade: texto(i.unidade),
    ipiPct: decimalDoDado(i.ipiPct),
    st: decimalDoDado(i.st),
  };
}

/**
 * Orçamento gravado neste navegador, no formato atual ou no anterior (cliente em texto livre e
 * valores em número): o nome vira a razão social (PJ) e o contato vira o comprador.
 */
export function lerOrcamento(d: unknown): Orcamento | null {
  if (!d || typeof d !== 'object') return null;
  const o = d as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.vendedor !== 'string' || !Array.isArray(o.itens)) return null;
  let cliente: ClienteOrcamento;
  if (o.cliente && typeof o.cliente === 'object') {
    const c = o.cliente as Record<string, unknown>;
    cliente = {
      tipo: c.tipo === 'PF' ? 'PF' : 'PJ',
      razaoSocial: texto(c.razaoSocial),
      nome: texto(c.nome),
      documento: texto(c.documento),
      inscricaoEstadual: texto(c.inscricaoEstadual),
      email: texto(c.email),
      telefone: texto(c.telefone),
    };
  } else {
    cliente = { tipo: 'PJ', razaoSocial: texto(o.cliente), nome: texto(o.clienteContato) };
  }
  const e = (o.entrega && typeof o.entrega === 'object' ? o.entrega : {}) as Record<string, unknown>;
  const l = (o.logistica && typeof o.logistica === 'object' ? o.logistica : undefined) as Record<string, unknown> | undefined;
  const estado = o.estado === 'encerrado' || o.estado === 'excluido' ? o.estado : 'ativo';
  return {
    id: o.id,
    numero: texto(o.numero),
    codigoVenda: texto(o.codigoVenda)?.slice(0, CODIGO_VENDA_MAX),
    vendedor: o.vendedor,
    cliente,
    entrega: {
      enderecoEntrega: texto(e.enderecoEntrega),
      enderecoCobranca: texto(e.enderecoCobranca),
      cobrancaIgualEntrega: e.cobrancaIgualEntrega === true || undefined,
      transportadora: texto(e.transportadora),
      prazoPagamento: texto(e.prazoPagamento),
    },
    itens: o.itens.map(lerItem).filter((i): i is ItemOrcamento => !!i),
    descontoTotal: lerDesconto(o.descontoTotal),
    frete: decimalDoDado(o.frete),
    impostosDeducao: decimalDoDado(o.impostosDeducao),
    logistica: l
      ? {
          cubagemM3: decimalDoDado(l.cubagemM3),
          volumes: typeof l.volumes === 'number' && Number.isInteger(l.volumes) && l.volumes >= 0 ? l.volumes : undefined,
          pesoLiquidoKg: decimalDoDado(l.pesoLiquidoKg),
          pesoBrutoKg: decimalDoDado(l.pesoBrutoKg),
        }
      : undefined,
    observacao: typeof o.observacao === 'string' ? o.observacao.slice(0, 500) : '',
    criadoEm: typeof o.criadoEm === 'string' ? o.criadoEm : new Date().toISOString(),
    validade: texto(o.validade),
    estado,
    alteracoes: Array.isArray(o.alteracoes) ? (o.alteracoes as Alteracao[]) : [],
  };
}

// ---------- Link: orçamento codificado na URL (demonstração) ----------
// Leva itens, códigos, IPI, ST, descontos, frete e impostos (os totais saem iguais aos do PDF) e
// só o nome do cliente: CPF/CNPJ, inscrição, e-mail, telefone, endereços, transportadora e prazo
// ficam fora da URL (decisão do responsável), porque a URL fica no histórico e nos logs.

type ItemCompacto = [string, string, number, string | number | null, Desconto['tipo'] | null, string | number | null, string?, string?, string?, string?, string?];

type Compacto = {
  i: string;
  n?: string;
  cv?: string;
  v: string;
  /** Nome do cliente em destaque (razão social ou nome) e o tipo. */
  c?: string;
  ct?: TipoCliente;
  t: ItemCompacto[];
  dt?: [Desconto['tipo'], string | number];
  fr?: string;
  im?: string;
  o?: string;
  d: string;
  val?: string;
};

function paraBase64Url(t: string) {
  const bytes = new TextEncoder().encode(t);
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
    t: orc.itens.map(i => {
      const t: ItemCompacto = [i.slug, i.lado ?? '', i.quantidade, i.preco ?? null, i.desconto?.tipo ?? null, i.desconto?.valor ?? null];
      const extras = [i.ipiPct, i.st, i.descricao, i.codigoOriginal, i.unidade];
      // Só grava os extras até o último preenchido (link menor).
      let ultimo = extras.length - 1;
      while (ultimo >= 0 && extras[ultimo] === undefined) ultimo--;
      for (let k = 0; k <= ultimo; k++) t.push(extras[k] ?? '');
      return t;
    }),
    d: orc.criadoEm,
  };
  if (orc.numero) c.n = orc.numero;
  if (orc.codigoVenda) c.cv = orc.codigoVenda;
  const nome = nomeCliente(orc.cliente);
  if (nome) {
    c.c = nome;
    c.ct = orc.cliente.tipo;
  }
  if (orc.descontoTotal) c.dt = [orc.descontoTotal.tipo, orc.descontoTotal.valor];
  if (orc.frete) c.fr = orc.frete;
  if (orc.impostosDeducao) c.im = orc.impostosDeducao;
  if (orc.observacao) c.o = orc.observacao;
  if (orc.validade) c.val = orc.validade;
  return paraBase64Url(JSON.stringify(c));
}

/** Lê o orçamento do link (formato atual ou anterior); null se o código estiver quebrado. */
export function decodificarLink(codigo: string): Orcamento | null {
  try {
    const c = JSON.parse(deBase64Url(codigo)) as Compacto;
    if (!c || typeof c.i !== 'string' || typeof c.v !== 'string' || !Array.isArray(c.t)) return null;
    const tipo: TipoCliente = c.ct === 'PF' ? 'PF' : 'PJ';
    const nome = typeof c.c === 'string' ? c.c : undefined;
    return lerOrcamento({
      id: c.i,
      numero: c.n,
      codigoVenda: c.cv,
      vendedor: c.v,
      cliente: tipo === 'PF' ? { tipo, nome } : { tipo, razaoSocial: nome },
      itens: c.t
        .filter(t => Array.isArray(t) && typeof t[0] === 'string')
        .map(([slug, lado, quantidade, preco, dtipo, valor, ipiPct, st, descricao, codigoOriginal, unidade]) => ({
          slug,
          lado,
          quantidade,
          preco,
          desconto: dtipo ? { tipo: dtipo, valor } : undefined,
          ipiPct,
          st,
          descricao,
          codigoOriginal,
          unidade,
        })),
      descontoTotal: Array.isArray(c.dt) ? { tipo: c.dt[0], valor: c.dt[1] } : undefined,
      frete: c.fr,
      impostosDeducao: c.im,
      observacao: c.o,
      criadoEm: c.d,
      validade: c.val,
    });
  } catch {
    return null;
  }
}
