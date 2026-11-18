// Vendedores reais da MK Autoparts (DEC-022, sdd_kit/03-domain-model.md), com nome e WhatsApp
// autorizados pela contratante, na ordem inicial da fila do rodízio (Daniel primeiro, a pedido do
// responsável). O número de Daniel é o mesmo WhatsApp da empresa. Foto em
// /img/vendedores/<codigo>.webp (rosto recortado da arte de perfil enviada pela MK, PEND-034);
// sem ela, a interface mostra as iniciais. Daniel e Vitor já têm foto.
export type Vendedor = { codigo: string; nome: string; whatsapp: string; foto?: string; ativo: boolean };

export const WHATSAPP_EMPRESA = '5549991100096';

export const vendedores: Vendedor[] = [
  { codigo: 'daniel', nome: 'Daniel Avila', whatsapp: '5549991100096', foto: '/img/vendedores/daniel.webp', ativo: true },
  { codigo: 'luiz', nome: 'Luiz Guide', whatsapp: '5549999234046', ativo: true },
  { codigo: 'marcelo', nome: 'Marcelo', whatsapp: '5549985040318', ativo: true },
  { codigo: 'marcelos', nome: 'Marcelos', whatsapp: '5549999468221', ativo: true },
  { codigo: 'mauricio', nome: 'Mauricio', whatsapp: '5549984282320', ativo: true },
  { codigo: 'silvio', nome: 'Silvio', whatsapp: '5549999019555', ativo: true },
  { codigo: 'taine', nome: 'Taine Ribeiro', whatsapp: '5549991063669', ativo: true },
  { codigo: 'vitor', nome: 'Vitor Mota', whatsapp: '5549999065664', foto: '/img/vendedores/vitor.webp', ativo: true },
];

export const obterVendedor = (codigo: string | null | undefined) =>
  codigo ? vendedores.find(v => v.codigo === codigo && v.ativo) : undefined;

/** Iniciais para o lugar da foto: primeira letra do nome e do sobrenome ("Daniel Avila" → "DA"). */
export const iniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const letras = partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : (partes[0] ?? '').slice(0, 1);
  return letras.toUpperCase();
};

/** "5549991100096" → "(49) 99110-0096". */
export const formatarWhatsapp = (numero: string) => {
  const d = numero.replace(/\D/g, '').replace(/^55/, '');
  return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}` : numero;
};
