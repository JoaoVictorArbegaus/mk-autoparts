/*
 * Cartão "Meu link" da área do vendedor: o link pessoal (?v=) com copiar e compartilhar (M3) e o
 * QR Code dele (M4), com baixar imagem e imprimir, para balcão ou cartão de visita.
 * A biblioteca de QR (uqr, sem dependências; DEC-003) só carrega nesta tela.
 */
import { useEffect, useState } from 'react';
import { areaVendedor } from '../content/vendedor';
import type { Vendedor } from '../content/vendedores';
import { Icone } from '../components/Icons';
import { Link } from '../router';
import { compartilharLink, copiarTexto, linkPessoal } from './compartilhar';

type Matriz = boolean[][];

/** Desenha o QR em SVG (módulos escuros em marinho), com a borda já incluída na matriz. */
function QrSvg({ matriz, rotulo }: { matriz: Matriz; rotulo: string }) {
  const n = matriz.length;
  let d = '';
  matriz.forEach((linha, y) => linha.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)));
  return (
    <svg viewBox={`0 0 ${n} ${n}`} role="img" aria-label={rotulo} shapeRendering="crispEdges" className="meu-link__qr">
      <rect width={n} height={n} fill="#fff" />
      <path d={d} fill="#0B1A36" />
    </svg>
  );
}

/** Imagem PNG do cartão: QR, nome do vendedor e "MK Autoparts", para baixar ou imprimir. */
async function cartaoPng(matriz: Matriz, vendedor: Vendedor, link: string) {
  const n = matriz.length;
  const mod = 12;
  const lado = n * mod;
  const largura = lado + 80;
  const altura = lado + 190;
  const c = document.createElement('canvas');
  c.width = largura;
  c.height = altura;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, largura, altura);
  g.fillStyle = '#0B1A36';
  matriz.forEach((linha, y) => linha.forEach((on, x) => on && g.fillRect(40 + x * mod, 40 + y * mod, mod, mod)));
  g.textAlign = 'center';
  g.font = '800 30px system-ui, sans-serif';
  g.fillText(vendedor.nome, largura / 2, lado + 90);
  g.font = '600 22px system-ui, sans-serif';
  g.fillStyle = '#1C4FD0';
  g.fillText('MK Autoparts', largura / 2, lado + 125);
  g.font = '400 16px system-ui, sans-serif';
  g.fillStyle = '#5B6678';
  g.fillText(link.replace(/^https?:\/\//, ''), largura / 2, lado + 160);
  return c.toDataURL('image/png');
}

export function MeuLink({ vendedor, avisar }: { vendedor: Vendedor; avisar: (t: string) => void }) {
  const t = areaVendedor.meuLink;
  const [link, setLink] = useState('');
  const [matriz, setMatriz] = useState<Matriz | null>(null);

  useEffect(() => {
    const url = linkPessoal(window.location.origin, vendedor.codigo);
    setLink(url);
    let vivo = true;
    import('uqr').then(({ encode }) => vivo && setMatriz(encode(url, { ecc: 'M', border: 2 }).data));
    return () => {
      vivo = false;
    };
  }, [vendedor.codigo]);

  const copiar = async () => avisar((await copiarTexto(link)) === 'copiado' ? t.copiado : t.falhou);
  const compartilhar = async () => {
    const r = await compartilharLink(link, t.mensagem(vendedor.nome));
    if (r === 'copiado') avisar(t.copiado);
    if (r === 'falhou') avisar(t.falhou);
  };
  const baixar = async () => {
    if (!matriz) return;
    const a = document.createElement('a');
    a.href = await cartaoPng(matriz, vendedor, link);
    a.download = `qr-mk-autoparts-${vendedor.codigo}.png`;
    a.click();
  };
  const imprimir = async () => {
    if (!matriz) return;
    const png = await cartaoPng(matriz, vendedor, link);
    const w = window.open('', '_blank', 'width=520,height=720');
    if (!w) return avisar(t.falhouImprimir);
    w.document.write(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>QR ${vendedor.nome}</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh}img{width:9cm;height:auto}</style></head><body><img src="${png}" alt="QR Code de ${vendedor.nome}" onload="setTimeout(()=>{print()},150)"></body></html>`,
    );
    w.document.close();
  };

  return (
    <section className="adm-bloco meu-link" aria-labelledby="meu-link-titulo">
      <div className="meu-link__texto">
        <h2 id="meu-link-titulo">{t.titulo}</h2>
        <p>{t.apoio}</p>
        <code className="meu-link__url">{link || '…'}</code>
        <div className="meu-link__acoes">
          <button type="button" className="adm-btn adm-btn--primario" onClick={compartilhar} disabled={!link}>
            <Icone nome="whatsapp" tamanho={18} />
            {t.compartilhar}
          </button>
          <button type="button" className="adm-btn" onClick={copiar} disabled={!link}>
            <Icone nome="copiar" tamanho={18} />
            {t.copiar}
          </button>
        </div>
        <p className="meu-link__dica">
          {t.dicaSite} <Link href="/catalogo">{t.abrirCatalogo}</Link>
        </p>
      </div>
      <div className="meu-link__qr-caixa">
        {matriz ? <QrSvg matriz={matriz} rotulo={t.qrRotulo(vendedor.nome)} /> : <span className="meu-link__qr meu-link__qr--vazio" aria-hidden="true" />}
        <div className="meu-link__acoes">
          <button type="button" className="adm-btn" onClick={baixar} disabled={!matriz}>
            <Icone nome="baixar" tamanho={18} />
            {t.baixar}
          </button>
          <button type="button" className="adm-btn" onClick={imprimir} disabled={!matriz}>
            <Icone nome="imprimir" tamanho={18} />
            {t.imprimir}
          </button>
        </div>
      </div>
    </section>
  );
}
