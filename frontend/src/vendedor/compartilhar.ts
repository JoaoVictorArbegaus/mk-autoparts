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

/**
 * Envia um arquivo (PDF, imagem) pelo compartilhamento do aparelho: no celular abre WhatsApp e outros
 * apps; no Windows/Chrome, a janela de compartilhar do sistema. Sem suporte, devolve 'indisponivel'.
 */
export async function compartilharArquivo(arquivo: File, texto: string): Promise<'compartilhado' | 'cancelado' | 'indisponivel'> {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  if (!nav?.share || !nav.canShare?.({ files: [arquivo] })) return 'indisponivel';
  try {
    await nav.share({ files: [arquivo], title: arquivo.name, text: texto });
    return 'compartilhado';
  } catch (e) {
    return (e as Error)?.name === 'AbortError' ? 'cancelado' : 'indisponivel';
  }
}

/** Baixa um arquivo gerado no navegador. */
export function baixarArquivo(arquivo: Blob, nome: string) {
  const url = URL.createObjectURL(arquivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** No arraste, entrega o arquivo como se viesse de uma pasta (Chrome/Edge: área de trabalho, WhatsApp). */
export function arrastarArquivo(e: DragEvent, arquivo: File, url: string) {
  const dt = e.dataTransfer;
  if (!dt) return;
  dt.clearData();
  dt.effectAllowed = 'copy';
  dt.setData('DownloadURL', `${arquivo.type}:${arquivo.name}:${url}`);
  try {
    dt.items.add(arquivo);
  } catch {
    /* navegador sem suporte a arquivo no arraste: fica só o DownloadURL */
  }
}

export async function copiarTexto(texto: string): Promise<'copiado' | 'falhou'> {
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'falhou';
  }
}
