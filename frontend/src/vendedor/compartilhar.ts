/*
 * "Compartilhar com meu link" (M3) e link pessoal do vendedor (M4): a página atual com o ?v= do
 * vendedor, para o cliente que abrir ficar preso a ele (DEC-017, RN-07). Funções puras + envio.
 */

/** Caminho + busca com o `v` do vendedor (troca um `v` que já exista; mantém os demais parâmetros). */
export function caminhoComVendedor(caminho: string, busca: string, codigo: string) {
  const p = new URLSearchParams(busca);
  p.delete('v');
  p.set('v', codigo);
  return `${caminho || '/'}?${p.toString()}`;
}

/** Link pessoal do vendedor (página inicial com ?v=). */
export const linkPessoal = (origem: string, codigo: string) => `${origem}${caminhoComVendedor('/', '', codigo)}`;

/**
 * Envia o link: no celular, o compartilhamento do aparelho (WhatsApp e outros apps); sem ele, copia.
 * Devolve o que aconteceu, para o aviso não mentir.
 */
export async function compartilharLink(url: string, texto: string): Promise<'compartilhado' | 'copiado' | 'cancelado' | 'falhou'> {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  if (nav?.share && window.matchMedia?.('(pointer: coarse)').matches) {
    try {
      await nav.share({ title: 'MK Autoparts', text: texto, url });
      return 'compartilhado';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelado';
    }
  }
  return copiarTexto(url);
}

export async function copiarTexto(texto: string): Promise<'copiado' | 'falhou'> {
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'falhou';
  }
}
