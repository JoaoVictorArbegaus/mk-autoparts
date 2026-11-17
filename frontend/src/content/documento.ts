/*
 * Textos fixos e dados da empresa no documento do orçamento (PDF e Word, REU-06, RN-13), num lugar só,
 * como pede o guia do modelo (docs/Para-Socio-Orcamento/PADRAO-ORCAMENTO-PARA-O-SITE.md, seção 7).
 * Os textos de condições, validade e "sob consulta" são de exemplo: a MK ainda precisa aprovar
 * (PEND-035). O CNPJ só aparece se a MK autorizar (briefing): fica desligado até a resposta.
 */
import { empresa } from './site';

export const documento = {
  eyebrow: 'Peças e acessórios para caminhões',
  titulo: 'Orçamento',
  rotulos: {
    numero: 'Número',
    emissao: 'Emissão',
    validoAte: 'Válido até',
    vendedor: 'Vendedor',
    cliente: 'Cliente',
    clienteVazio: 'Cliente não informado',
    produto: 'Produto',
    quantidade: 'Qtd.',
    precoUnitario: 'Preço unitário',
    total: 'Total',
    promocao: 'Promoção',
    sobConsulta: 'Sob consulta',
    observacao: 'Observação',
    validade: 'Validade',
    condicoes: 'Condições',
    condicoesNota: '(texto de exemplo, a definir com a MK)',
    subtotalSemDesconto: 'Subtotal sem desconto',
    comDescontoItens: 'Com desconto nos itens',
    descontoTotal: (pct: string) => `Desconto no total (${pct})`,
    descontoTotalValor: 'Desconto no total',
    economia: (pct: string) => `Desconto total de ${pct} sobre os itens com preço`,
    linkTitulo: 'Abrir este orçamento online',
    linkApoio: (nome: string) => `o cliente pode ajustar a lista e falar com ${nome}.`,
    falarCom: (nome: string) => `Falar com ${nome}`,
    geradoPor: 'Orçamento gerado pelo sistema MK Autoparts',
  },
  // PEND-035: textos de exemplo, a MK ainda precisa aprovar.
  validade: (data: string) => `Este orçamento é válido até ${data}. Itens “sob consulta” têm o preço informado pelo vendedor no atendimento.`,
  semValidade: 'Itens “sob consulta” têm o preço informado pelo vendedor no atendimento.',
  condicoes: 'Preço e disponibilidade são confirmados no fechamento do pedido. Frete e prazo de entrega combinados com o vendedor.',
  empresa: {
    razaoSocial: empresa.razaoSocial,
    // Só com autorização da MK (briefing, PEND de rodapé): enquanto false, o CNPJ não sai no documento.
    mostrarCnpj: false,
    cnpj: '41.577.754/0001-96',
    endereco: `${empresa.endereco.rua} – ${empresa.endereco.bairro}, ${empresa.endereco.cidade} – ${empresa.endereco.uf}`,
    instagram: empresa.instagramRotulo,
  },
};

/** "Lado direito (LD) · cód. S03-068", como no modelo. */
export function detalheDoItem(lado: 'LD' | 'LE' | undefined, codigo: string | undefined) {
  const partes: string[] = [];
  if (lado) partes.push(lado === 'LD' ? 'Lado direito (LD)' : 'Lado esquerdo (LE)');
  partes.push(codigo ? `cód. ${codigo}` : 'cód. sob consulta');
  const texto = partes.join(' · ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

export const dataBR = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('pt-BR');
