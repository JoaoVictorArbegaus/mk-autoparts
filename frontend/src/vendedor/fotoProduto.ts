/*
 * Imagem do produto para o vendedor mandar no WhatsApp (REU-21): foto, nome, código, logo da MK,
 * preço opcional digitado pelo vendedor e o contato dele. Desenhada no navegador (canvas), sem
 * biblioteca; mesma ideia do cartão do QR (MeuLink).
 */
import type { Produto } from '../content/tipos';
import { formatarPreco, imagemProduto } from '../content/catalogo';
import { formatarWhatsapp, type Vendedor } from '../content/vendedores';

export const FOTO = { largura: 1080, altura: 1350 };

/** Códigos da peça numa linha: "S03-068 (LD) · S03-069 (LE)" ou o código único. */
export function codigosDaPeca(p: Produto): string {
  if (p.variantes?.length) return p.variantes.map(v => `${v.codigo ?? '—'} (${v.lado})`).join(' · ');
  return p.codigo ?? '';
}

/** "489,9" / "1.890,00" / "R$ 75" → número; vazio ou inválido → undefined. */
export function lerPreco(texto: string): number | undefined {
  const limpo = texto.replace(/[^\d,.]/g, '');
  if (!limpo) return undefined;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const n = Number(normal);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
}

/** Quebra o texto em linhas que cabem na largura (no máximo `max`; a última ganha reticências). */
export function quebrarLinhas(medir: (s: string) => number, texto: string, largura: number, max: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = '';
  for (const w of palavras) {
    const tentativa = atual ? `${atual} ${w}` : w;
    if (medir(tentativa) <= largura || !atual) atual = tentativa;
    else {
      linhas.push(atual);
      atual = w;
    }
  }
  if (atual) linhas.push(atual);
  if (linhas.length <= max) return linhas;
  const corte = linhas.slice(0, max);
  let ultima = corte[max - 1];
  while (ultima && medir(`${ultima}…`) > largura) ultima = ultima.slice(0, -1);
  corte[max - 1] = `${ultima.trimEnd()}…`;
  return corte;
}

function carregar(src: string): Promise<HTMLImageElement | null> {
  return new Promise(r => {
    const img = new Image();
    img.onload = () => r(img);
    img.onerror = () => r(null);
    img.src = src;
  });
}

const COR = { navy: '#0B1A36', royal: '#1C4FD0', papel: '#F3F5F8', ink2: '#5B6678', claro: '#C9D6F5' };

/** Desenha a imagem do produto e devolve o PNG. */
export async function gerarFotoProduto(p: Produto, vendedor: Vendedor, preco?: number, fotoTrocada?: string): Promise<Blob> {
  await Promise.all([
    document.fonts.load("800 52px 'Saira'"),
    document.fonts.load("700 52px 'Saira'"),
    document.fonts.load("400 30px 'IBM Plex Sans'"),
    document.fonts.load("600 30px 'IBM Plex Sans'"),
  ]).catch(() => undefined);
  const { largura: W, altura: H } = FOTO;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const tit = (peso: number, px: number) => `${peso} ${px}px Saira, 'Arial Narrow', sans-serif`;
  const txt = (peso: number, px: number) => `${peso} ${px}px 'IBM Plex Sans', system-ui, sans-serif`;

  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, H);

  // Faixa da marca.
  g.fillStyle = COR.navy;
  g.fillRect(0, 0, W, 170);
  const selo = await carregar('/img/marca/selo-320.webp');
  if (selo) g.drawImage(selo, 44, 21, 128, 128);
  g.fillStyle = '#fff';
  g.font = tit(800, 52);
  g.fillText('MK Autoparts', 196, 88);
  g.fillStyle = COR.claro;
  g.font = txt(400, 28);
  g.fillText('Peças e acessórios para caminhões', 198, 128);

  // Foto (contida, sobre o papel).
  // Fundo branco: as fotos dos produtos já vêm em fundo branco; um filete separa do nome.
  const zona = { x: 0, y: 170, w: W, h: 640 };
  g.fillStyle = COR.papel;
  g.fillRect(56, zona.y + zona.h - 2, W - 112, 2);
  const src = fotoTrocada ?? imagemProduto(p)?.src;
  const foto = src ? await carregar(src) : null;
  if (foto) {
    const m = 56;
    const k = Math.min((zona.w - 2 * m) / foto.naturalWidth, (zona.h - 2 * m) / foto.naturalHeight);
    const w = foto.naturalWidth * k;
    const h = foto.naturalHeight * k;
    g.drawImage(foto, zona.x + (zona.w - w) / 2, zona.y + (zona.h - h) / 2, w, h);
  }

  // Nome, código e preço.
  let y = zona.y + zona.h + 76;
  g.fillStyle = COR.navy;
  g.font = tit(700, 54);
  const linhas = quebrarLinhas(s => g.measureText(s).width, p.nome, W - 112, 3);
  for (const l of linhas) {
    g.fillText(l, 56, y);
    y += 62;
  }
  const cod = codigosDaPeca(p);
  if (cod) {
    g.fillStyle = COR.ink2;
    g.font = txt(400, 30);
    g.fillText(`Cód. MK ${cod}`, 56, y + 2);
    y += 48;
  }
  if (preco !== undefined) {
    const rotulo = formatarPreco(preco);
    g.font = tit(800, 60);
    const w = g.measureText(rotulo).width + 56;
    const topo = y + 4;
    g.fillStyle = COR.royal;
    g.beginPath();
    g.roundRect(56, topo, w, 88, 44);
    g.fill();
    g.fillStyle = '#fff';
    g.fillText(rotulo, 84, topo + 66);
  }

  // Contato do vendedor.
  g.fillStyle = COR.navy;
  g.fillRect(0, H - 130, W, 130);
  g.fillStyle = COR.claro;
  g.font = txt(400, 28);
  g.fillText(`Fale com ${vendedor.nome}`, 56, H - 76);
  g.fillStyle = '#fff';
  g.font = txt(600, 36);
  g.fillText(`WhatsApp ${formatarWhatsapp(vendedor.whatsapp)}`, 56, H - 30);

  const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/png'));
  if (!blob) throw new Error('png');
  return blob;
}
