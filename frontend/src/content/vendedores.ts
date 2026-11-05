// Vendedores FICTÍCIOS da demonstração (DEC-010, RN-07). Nomes de demonstração; todos usam o
// WhatsApp da empresa: nenhum telefone é inventado.
export type Vendedor = { codigo: string; nome: string; whatsapp: string; ativo: boolean };

export const WHATSAPP_EMPRESA = '5549991100096';

export const vendedores: Vendedor[] = [
  { codigo: 'joao', nome: 'João', whatsapp: WHATSAPP_EMPRESA, ativo: true },
  { codigo: 'maria', nome: 'Maria', whatsapp: WHATSAPP_EMPRESA, ativo: true },
  { codigo: 'carlos', nome: 'Carlos', whatsapp: WHATSAPP_EMPRESA, ativo: true },
];

export const obterVendedor = (codigo: string | null | undefined) =>
  codigo ? vendedores.find(v => v.codigo === codigo && v.ativo) : undefined;
