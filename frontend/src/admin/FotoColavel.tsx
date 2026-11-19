/*
 * Foto que aceita Ctrl+V (REU-22): clicar na foto e colar a imagem copiada (de um site, do WhatsApp,
 * de um print ou um arquivo copiado na pasta) troca a foto. Também aceita arrastar um arquivo para
 * cima. No celular segue o "Trocar foto" (galeria ou câmera). Admin de demonstração: a foto vale só
 * nesta sessão (object URL), como o "Trocar foto".
 */
import { useState, type ClipboardEvent, type DragEvent, type ReactNode } from 'react';
import { admin } from '../content/admin';

const t = admin.fotoColar;

/** Primeira imagem de uma colagem ou de um arraste (arquivo ou imagem copiada). */
export function imagemDe(dados: DataTransfer | null): File | undefined {
  if (!dados) return undefined;
  const arquivos = Array.from(dados.files ?? []).filter(f => f.type.startsWith('image/'));
  if (arquivos.length) return arquivos[0];
  for (const item of Array.from(dados.items ?? [])) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const f = item.getAsFile();
      if (f) return f;
    }
  }
  return undefined;
}

export function FotoColavel({
  nome,
  aoTrocar,
  avisar,
  className,
  children,
}: {
  nome: string;
  aoTrocar: (url: string) => void;
  avisar: (texto: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [sobre, setSobre] = useState(false);

  const usar = (dados: DataTransfer | null) => {
    const f = imagemDe(dados);
    if (!f) {
      avisar(t.naoImagem);
      return false;
    }
    aoTrocar(URL.createObjectURL(f));
    avisar(t.trocada(nome));
    return true;
  };
  const colar = (e: ClipboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    usar(e.clipboardData);
  };
  const soltar = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSobre(false);
    usar(e.dataTransfer);
  };

  return (
    <button
      type="button"
      className={`foto-colar${sobre ? ' foto-colar--sobre' : ''}${className ? ` ${className}` : ''}`}
      aria-label={t.rotulo(nome)}
      title={t.dica}
      onClick={e => e.currentTarget.focus()}
      onPaste={colar}
      onDragOver={e => {
        if (Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          setSobre(true);
        }
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={soltar}
    >
      {children}
      <span className="foto-colar__dica" aria-hidden="true">
        {t.ativo}
      </span>
    </button>
  );
}
