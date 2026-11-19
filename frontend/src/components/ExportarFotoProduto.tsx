/*
 * "Exportar foto" (REU-21): só com o vendedor logado (mesma regra do "Compartilhar com meu link").
 * Abre uma janela com a imagem do produto (foto, nome, código, logo, preço opcional e o contato do
 * vendedor). Pronta (selo verde), o vendedor arrasta a imagem para a conversa, compartilha (celular),
 * copia (Ctrl+V no WhatsApp do computador) ou baixa. Lido depois da montagem: o HTML pré-renderizado
 * não tem sessão.
 */
import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { Produto } from '../content/tipos';
import type { Vendedor } from '../content/vendedores';
import { textos } from '../content/site';
import { vendedorDaSessao } from '../vendedor/armazem';
import { arrastarArquivo, baixarArquivo, compartilharArquivo } from '../vendedor/compartilhar';
import { gerarFotoProduto, lerPreco } from '../vendedor/fotoProduto';
import { Icone } from './Icons';

const t = textos.exportarFoto;

export function ExportarFotoProduto({ produto }: { produto: Produto }) {
  const [vendedor, setVendedor] = useState<Vendedor | undefined>();
  const [aberto, setAberto] = useState(false);
  useEffect(() => setVendedor(vendedorDaSessao()), []);
  if (!vendedor) return null;
  return (
    <>
      <button type="button" className="btn btn--contorno btn--sm" onClick={() => setAberto(true)}>
        <Icone nome="baixar" tamanho={18} />
        <span className="btn__texto">{t.botao}</span>
      </button>
      {aberto && <JanelaFoto produto={produto} vendedor={vendedor} fechar={() => setAberto(false)} />}
    </>
  );
}

function JanelaFoto({ produto, vendedor, fechar }: { produto: Produto; vendedor: Vendedor; fechar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [precoTexto, setPrecoTexto] = useState('');
  const [arquivo, setArquivo] = useState<{ file: File; url: string } | null>(null);
  const [estado, setEstado] = useState<'preparando' | 'pronto' | 'falhou'>('preparando');
  const [aviso, setAviso] = useState('');
  const [toque, setToque] = useState(false);
  const urlAtual = useRef('');
  const preco = lerPreco(precoTexto);

  useEffect(() => {
    // Sem close() na limpeza: o fechar dispara onClose (e o React em desenvolvimento monta duas vezes).
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    setToque(window.matchMedia?.('(pointer: coarse)').matches ?? false);
  }, []);

  // Gera de novo quando o preço muda (com uma pequena espera enquanto o vendedor digita).
  useEffect(() => {
    let vivo = true;
    setEstado('preparando');
    const id = window.setTimeout(() => {
      gerarFotoProduto(produto, vendedor, preco)
        .then(blob => {
          if (!vivo) return;
          const nome = `MK-${(produto.codigo ?? produto.variantes?.[0]?.codigo ?? produto.slug).replace(/[^\w-]/g, '')}.png`;
          const file = new File([blob], nome, { type: 'image/png' });
          if (urlAtual.current) URL.revokeObjectURL(urlAtual.current);
          urlAtual.current = URL.createObjectURL(file);
          setArquivo({ file, url: urlAtual.current });
          setEstado('pronto');
        })
        .catch(() => vivo && setEstado('falhou'));
    }, 350);
    return () => {
      vivo = false;
      clearTimeout(id);
    };
  }, [produto, vendedor, preco]);
  useEffect(() => () => URL.revokeObjectURL(urlAtual.current), []);

  const avisar = (msg: string) => {
    setAviso(msg);
    window.setTimeout(() => setAviso(''), 3500);
  };
  const pronto = estado === 'pronto' && !!arquivo;

  const compartilhar = async () => {
    if (!arquivo) return;
    const r = await compartilharArquivo(arquivo.file, textos.compartilhar.produto(produto.nome));
    if (r === 'indisponivel') await copiar();
  };
  const copiar = async () => {
    if (!arquivo) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': arquivo.file })]);
      avisar(t.copiada);
    } catch {
      avisar(t.falhouCopiar);
    }
  };
  const baixar = () => {
    if (!arquivo) return;
    baixarArquivo(arquivo.file, arquivo.file.name);
    avisar(t.baixada);
  };
  const aoArrastar = (e: DragEvent<HTMLElement>) => {
    if (!arquivo) return e.preventDefault();
    arrastarArquivo(e.nativeEvent, arquivo.file, arquivo.url);
  };

  return (
    <dialog ref={dialogo} className="foto-exp" aria-labelledby="foto-exp-titulo" onClose={fechar} onCancel={fechar} data-lenis-prevent>
      <div className="foto-exp__cabeca">
        <h2 id="foto-exp-titulo">{t.titulo}</h2>
        <button type="button" className="foto-exp__fechar" aria-label={t.fechar} onClick={fechar}>
          <Icone nome="fechar" tamanho={22} />
        </button>
      </div>
      <div className="foto-exp__corpo">
        <div className="foto-exp__previa">
          {arquivo ? (
            <img
              src={arquivo.url}
              alt={t.alt(produto.nome)}
              width={540}
              height={675}
              draggable={pronto}
              onDragStart={aoArrastar}
              className={pronto ? 'foto-exp__img foto-exp__img--pronta' : 'foto-exp__img'}
            />
          ) : (
            <div className="foto-exp__vazia" />
          )}
        </div>
        <div className="foto-exp__lado">
          <label className="foto-exp__campo">
            <span>{t.preco}</span>
            <input inputMode="decimal" placeholder={t.precoDica} value={precoTexto} onChange={e => setPrecoTexto(e.target.value)} />
            <small>{t.precoApoio}</small>
          </label>
          <p className={`foto-exp__estado foto-exp__estado--${estado}`} role="status" aria-live="polite">
            {estado === 'preparando' ? t.preparando : estado === 'falhou' ? t.falhou : toque ? t.prontoToque : t.pronto}
          </p>
          <div className="foto-exp__acoes">
            <button type="button" className="btn btn--primario" onClick={compartilhar} disabled={!pronto}>
              <Icone nome="whatsapp" tamanho={18} />
              {t.compartilhar}
            </button>
            <button type="button" className="btn btn--contorno" onClick={copiar} disabled={!pronto}>
              <Icone nome="copiar" tamanho={18} />
              {t.copiar}
            </button>
            <button type="button" className="btn btn--contorno" onClick={baixar} disabled={!pronto}>
              <Icone nome="baixar" tamanho={18} />
              {t.baixar}
            </button>
          </div>
          <p className="foto-exp__aviso" role="status" aria-live="polite">
            {aviso}
          </p>
        </div>
      </div>
    </dialog>
  );
}
