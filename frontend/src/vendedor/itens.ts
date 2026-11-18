/*
 * Dados de cada item do orçamento que vêm do cadastro (catálogo) e podem ser editados no orçamento
 * sem alterar o cadastro: descrição, Nº compatível e unidade (especificação do documento, "Itens").
 */
import { codigoDoLado, obterProduto, type Lado, type Produto } from '../content/catalogo';
import { documento } from '../content/documento';
import type { ItemOrcamento } from './orcamento';

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

/** Separa os itens cujo produto ainda existe no catálogo; os outros saem com aviso (RN-04). */
export function itensDoCatalogo(itens: ItemOrcamento[]) {
  const validos = itens.filter(i => obterProduto(i.slug));
  return { validos, removidos: itens.length - validos.length };
}
