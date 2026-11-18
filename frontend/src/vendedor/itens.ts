/*
 * Dados de cada item do orçamento que vêm do cadastro (catálogo) e podem ser editados no orçamento
 * sem alterar o cadastro: descrição, Nº compatível e unidade (especificação do documento, "Itens").
 */
import { codigoDoLado, obterProduto, type Lado, type Produto } from '../content/catalogo';
import { documento } from '../content/documento';
import { Dec, brl, pctTexto } from './decimal';
import type { Desconto, ItemOrcamento } from './orcamento';

/** Códigos originais do lado escolhido (produto sem lado: os do produto), separados por "/". */
export function compativelDoCatalogo(p: Produto, lado?: Lado): string {
  const doLado = lado ? p.variantes?.find(v => v.lado === lado)?.codigosOriginais : undefined;
  const codigos = [...(p.codigosOriginais ?? []), ...(doLado ?? (lado ? [] : (p.variantes ?? []).flatMap(v => v.codigosOriginais ?? [])))];
  return [...new Set(codigos)].join('/');
}

/** O item como sai no documento: o que o vendedor editou ou, vazio, o que vem do cadastro. */
export function dadosDoItem(i: ItemOrcamento, p: Produto = obterProduto(i.slug)!) {
  return {
    descricao: i.descricao ?? p.nome,
    codigoMk: codigoDoLado(p, i.lado) ?? p.codigo,
    codigoOriginal: i.codigoOriginal ?? compativelDoCatalogo(p, i.lado),
    unidade: i.unidade ?? documento.unidadePadrao,
  };
}

/**
 * De onde vem a % de desconto mostrada no item: "10% no item + 3% no total", "R$ 140,00 por unidade
 * + 3% no total" ou "3% no total". Sem explicação quando é só o desconto em % do próprio item
 * (a % mostrada é a digitada) ou quando não há desconto.
 */
export function origemDesconto(i: ItemOrcamento, total?: Desconto): string | undefined {
  const o = documento.origemDesconto;
  const parte = (d: Desconto, onde: string) => `${d.tipo === 'percentual' ? pctTexto(Dec.de(d.valor)) : brl(Dec.de(d.valor))} ${onde}`;
  const partes: string[] = [];
  if (i.desconto) partes.push(parte(i.desconto, i.desconto.tipo === 'valor' ? o.porUnidade : o.noItem));
  if (total) partes.push(parte(total, o.noTotal));
  if (!partes.length || (partes.length === 1 && i.desconto?.tipo === 'percentual')) return undefined;
  return partes.join(' + ');
}

/** Separa os itens cujo produto ainda existe no catálogo; os outros saem com aviso (RN-04). */
export function itensDoCatalogo(itens: ItemOrcamento[]) {
  const validos = itens.filter(i => obterProduto(i.slug));
  return { validos, removidos: itens.length - validos.length };
}
