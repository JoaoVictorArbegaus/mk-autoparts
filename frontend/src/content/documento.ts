/*
 * Textos fixos e dados da empresa no documento do orçamento (PDF, Word e link; RN-13), num lugar só,
 * como pede o guia (docs/pfd-regras/MKautoparts/PADRAO-ORCAMENTO-PARA-O-SITE.md, seção 7).
 * Rótulos iguais aos do exemplo (MKAutoparts-Orcamento-Exemplo.pdf, página 1). Os textos de condições,
 * validade e "sob consulta" ainda são de exemplo: a MK precisa aprovar (PEND-035).
 */
import { empresa } from './site';

export const documento = {
  eyebrow: 'Peças e acessórios para caminhões',
  titulo: 'Orçamento',
  semCodigoVenda: '—',
  unidadePadrao: 'PC',
  rotulos: {
    numero: 'Nº do orçamento',
    codigoVenda: 'Código de venda',
    emissao: 'Emissão',
    validoAte: 'Válido até',
    vendedor: 'Vendedor',
    whatsapp: 'WhatsApp',
    cliente: 'Cliente',
    comprador: 'Comprador',
    cnpj: 'CNPJ',
    cpf: 'CPF',
    inscricaoEstadual: 'Inscr. Estadual',
    email: 'E-mail',
    fone: 'Fone',
    entrega: 'Entrega',
    cobranca: 'Cobrança',
    transportadora: 'Transportadora / frete',
    prazoPagamento: 'Prazo de pagamento',
    produto: 'Produto',
    unidade: 'Un.',
    quantidade: 'Qtd.',
    liquido: 'Vl. líquido',
    ipi: 'IPI',
    st: 'Vl. ST',
    unitario: 'Vl. unit.',
    total: 'Vl. total',
    codigoMk: (codigo: string) => `Cód. MK ${codigo}`,
    compativel: (codigos: string) => `Nº compatível ${codigos}`,
    lado: { LD: 'Lado direito (LD)', LE: 'Lado esquerdo (LE)' },
    promocao: 'Promoção',
    sobConsulta: 'Sob consulta: preço informado pelo vendedor no atendimento',
    observacao: 'Observação',
    validade: 'Validade',
    condicoes: 'Condições',
    condicoesNota: '(texto de exemplo)',
    cubagem: 'Cubagem',
    volumes: 'Volumes',
    pesoLiquido: 'Peso líquido',
    pesoBruto: 'Peso bruto',
    semDesconto: 'Valor dos produtos sem desconto',
    desconto: (pct: string) => `Desconto (${pct})`,
    valorProdutos: 'Valor dos produtos',
    ipiTotal: 'Valor do IPI (+)',
    stTotal: 'Substituição tributária (+)',
    frete: 'Valor do frete (+)',
    impostos: 'Impostos (−)',
    valorTotal: 'Valor total',
    linkTitulo: 'Abrir este orçamento online',
    linkApoio: (nome: string) => `o cliente pode ajustar a lista e falar com ${nome}.`,
    falarCom: (nome: string) => `Falar com ${nome}`,
    geradoPor: 'Orçamento gerado pelo sistema MK Autoparts',
  },
  /** Explica a % de desconto quando ela soma o desconto da peça e o do total ("10% no item + 3% no total"). */
  origemDesconto: { noItem: 'no item', porUnidade: 'por unidade', noTotal: 'no total' },
  // PEND-035: textos de exemplo, a MK ainda precisa aprovar.
  validade: { antes: 'Válido até ', depois: '. Itens “sob consulta” têm o preço informado pelo vendedor no atendimento.' },
  semValidade: 'Itens “sob consulta” têm o preço informado pelo vendedor no atendimento.',
  condicoes: 'Preço e disponibilidade confirmados no fechamento do pedido. Prazo de entrega combinado com o vendedor.',
  empresa: {
    razaoSocial: empresa.razaoSocial,
    // Liberado pelo responsável com o modelo novo do documento (PEND-035). Vale só para o documento.
    mostrarCnpj: true,
    cnpj: '41.577.754/0001-96',
    endereco: `${empresa.endereco.rua} – ${empresa.endereco.bairro}, ${empresa.endereco.cidade} – ${empresa.endereco.uf}`,
    instagram: empresa.instagramRotulo,
  },
};

/** "Cód. MK S03-068 · Lado direito (LD)", como no exemplo; sem código, só o lado. */
export function linhaCodigo(codigo: string | undefined, lado: 'LD' | 'LE' | undefined) {
  return [codigo ? documento.rotulos.codigoMk(codigo) : '', lado ? documento.rotulos.lado[lado] : ''].filter(Boolean).join(' · ');
}

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

/** Data em dd/mm/aaaa no fuso de Brasília (emissão); data pura (AAAA-MM-DD) fica como está. */
export const dataBR = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('pt-BR', iso.length === 10 ? undefined : { timeZone: 'America/Sao_Paulo' });
