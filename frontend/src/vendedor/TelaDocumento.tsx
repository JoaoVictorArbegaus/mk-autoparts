/*
 * Tela do documento (/vendedor/documento?id=…, REU-06 e REU-20): prévia do orçamento em A4 (em escala
 * para caber no celular). O PDF é gerado em segundo plano ao abrir (selo amarelo "preparando", verde
 * "pronto"). No computador, pronto, ele baixa sozinho (preferência que o vendedor pode desligar): o
 * arquivo baixado sai do painel de downloads do navegador arrastando para qualquer conversa, o que
 * uma página não consegue fazer direto. "Enviar PDF" abre o compartilhamento do aparelho; a prévia
 * arrasta para pastas. "Baixar Word" gera o .docx no navegador.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { Link, useRouter } from '../router';
import { areaVendedor } from '../content/vendedor';
import { Icone } from '../components/Icons';
import type { Vendedor } from '../content/vendedores';
import { linkDoOrcamento, obterOrcamento, proximoNumero, salvarOrcamento } from './armazem';
import { DocumentoOrcamento, montarDocumento } from './Documento';
import type { Orcamento } from './orcamento';
import { arrastarArquivo, baixarArquivo, compartilharArquivo } from './compartilhar';
import { gerarPdfDaFolha } from './pdfArquivo';

const t = areaVendedor.documento;
const LARGURA_A4 = 793.7; // 210 mm em px (96 dpi)
/** Preferência do vendedor neste navegador (no sistema definitivo, no perfil: PDF, Word ou nada). */
const CHAVE_PREFS = 'mk-vendedor-prefs';

function lerBaixarAuto(): boolean {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PREFS) ?? '{}').baixarPdf !== false;
  } catch {
    return true;
  }
}

/** Assinatura do orçamento: baixa de novo só quando ele mudou (não a cada vez que a tela abre). */
function assinatura(o: Orcamento): string {
  const s = JSON.stringify(o);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${o.id}:${(h >>> 0).toString(36)}`;
}

export function TelaDocumento({ vendedor, avisar }: { vendedor: Vendedor; avisar: (t: string) => void }) {
  const { busca } = useRouter();
  const id = new URLSearchParams(busca).get('id');
  const [orc, setOrc] = useState<Orcamento | null | undefined>(undefined);
  const [gerando, setGerando] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const folha = useRef<HTMLDivElement>(null);
  const ficha = useRef<HTMLSpanElement>(null);
  const [escala, setEscala] = useState(1);
  const [ampliado, setAmpliado] = useState(false);
  const [pdf, setPdf] = useState<{ arquivo: File; url: string } | null>(null);
  const [estado, setEstado] = useState<'preparando' | 'pronto' | 'falhou'>('preparando');
  const [tentativa, setTentativa] = useState(0);
  const [toque, setToque] = useState(false);
  const [baixarAuto, setBaixarAuto] = useState(true);
  const [baixado, setBaixado] = useState(false);

  useEffect(() => {
    setToque(window.matchMedia?.('(pointer: coarse)').matches ?? false);
    setBaixarAuto(lerBaixarAuto());
  }, []);

  // No computador, o PDF pronto baixa sozinho uma vez por versão do orçamento.
  useEffect(() => {
    if (!pdf || !orc || toque || !baixarAuto) return;
    const chave = `mk-pdf-baixado:${assinatura(orc)}`;
    try {
      if (sessionStorage.getItem(chave)) return setBaixado(true);
      sessionStorage.setItem(chave, '1');
    } catch {
      /* sem armazenamento: baixa assim mesmo */
    }
    baixarArquivo(pdf.arquivo, pdf.arquivo.name);
    setBaixado(true);
  }, [pdf, orc, toque, baixarAuto]);

  const mudarBaixarAuto = (v: boolean) => {
    setBaixarAuto(v);
    try {
      localStorage.setItem(CHAVE_PREFS, JSON.stringify({ ...JSON.parse(localStorage.getItem(CHAVE_PREFS) ?? '{}'), baixarPdf: v }));
    } catch {
      /* preferência só nesta visita */
    }
  };

  useEffect(() => {
    let o = id ? obterOrcamento(id) : undefined;
    // Orçamento salvo antes da numeração: recebe o próximo número (ORC-0001…) e fica salvo com ele.
    if (o && o.vendedor === vendedor.codigo && !o.numero) {
      o = { ...o, numero: proximoNumero() };
      salvarOrcamento(o);
    }
    setOrc(o && o.vendedor === vendedor.codigo ? o : null);
  }, [id, vendedor.codigo]);

  // Prévia em escala: a página A4 inteira cabe na largura da tela (no celular, ~45%).
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(Math.min(1, el.clientWidth / LARGURA_A4));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [orc]);

  // O PDF é gerado em segundo plano assim que a tela abre: o arraste não espera gerar o arquivo.
  useEffect(() => {
    if (!orc) return;
    const el = folha.current?.querySelector<HTMLElement>('.doc');
    if (!el) return;
    let vivo = true;
    let url = '';
    setEstado('preparando');
    setPdf(null);
    const numero = orc.numero ?? orc.id;
    gerarPdfDaFolha(el, `Orçamento ${numero} · MK Autoparts`)
      .then(blob => {
        if (!vivo) return;
        const arquivo = new File([blob], `MKAutoparts-Orcamento-${numero}.pdf`, { type: 'application/pdf' });
        url = URL.createObjectURL(arquivo);
        setPdf({ arquivo, url });
        setEstado('pronto');
      })
      .catch(() => vivo && setEstado('falhou'));
    return () => {
      vivo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [orc, tentativa]);

  if (orc === undefined) return <p className="adm-carregando">{areaVendedor.carregando}</p>;
  if (orc === null)
    return (
      <section className="adm-tela vend-tela">
        <p className="adm-vazio">{t.naoEncontrado}</p>
        <Link className="adm-btn adm-btn--fantasma" href="/vendedor">
          {areaVendedor.abas.lista}
        </Link>
      </section>
    );

  const dados = montarDocumento(orc, linkDoOrcamento(orc));
  const nomeArquivo = `MKAutoparts-Orcamento-${dados.numero}`;
  const pronto = estado === 'pronto' && !!pdf;

  const salvarPdf = async () => {
    if (pdf) {
      baixarArquivo(pdf.arquivo, pdf.arquivo.name);
      avisar(t.pdfBaixado);
      return;
    }
    // Sem o arquivo (falhou): impressão do navegador, "Salvar como PDF".
    await document.fonts.ready;
    const titulo = document.title;
    document.title = nomeArquivo;
    window.print();
    document.title = titulo;
  };

  const enviarPdf = async () => {
    if (!pdf) return;
    const r = await compartilharArquivo(pdf.arquivo, t.mensagemEnvio(dados.numero));
    if (r === 'indisponivel') {
      baixarArquivo(pdf.arquivo, pdf.arquivo.name);
      avisar(t.envioBaixado);
    }
  };

  const baixarWord = async () => {
    setGerando(true);
    try {
      const { gerarWord } = await import('./word');
      const blob = await gerarWord(dados);
      baixarArquivo(blob, `${nomeArquivo}.docx`);
      avisar(t.wordPronto);
    } catch {
      avisar(t.wordFalhou);
    } finally {
      setGerando(false);
    }
  };

  const aoArrastar = (e: DragEvent<HTMLElement>) => {
    if (!pdf) return e.preventDefault();
    arrastarArquivo(e.nativeEvent, pdf.arquivo, pdf.url);
    if (ficha.current) e.dataTransfer.setDragImage(ficha.current, 24, 20);
  };

  return (
    <section className="doc-tela" aria-label={t.titulo}>
      <div className="adm-tela__cabeca doc-acoes">
        <Link className="adm-btn adm-btn--fantasma" href={`/vendedor/novo?id=${orc.id}`}>
          <Icone nome="setaEsq" tamanho={16} />
          {t.editar}
        </Link>
        <button type="button" className="adm-btn adm-btn--primario" onClick={enviarPdf} disabled={!pronto}>
          <Icone nome="whatsapp" tamanho={18} />
          {t.enviar}
        </button>
        <button type="button" className="adm-btn adm-btn--fantasma" onClick={salvarPdf} disabled={estado === 'preparando'}>
          <Icone nome="baixar" tamanho={16} />
          {t.pdf}
        </button>
        <button type="button" className="adm-btn adm-btn--fantasma" onClick={baixarWord} disabled={gerando}>
          {gerando ? t.gerando : t.word}
        </button>
        {dados.removidos > 0 && (
          <p className="doc-acoes__aviso" role="status">
            {t.removidos}
          </p>
        )}
      </div>

      <div className={`doc-estado doc-estado--${estado}`} role="status" aria-live="polite">
        {estado === 'preparando' && (
          <>
            <span className="doc-estado__giro" aria-hidden="true" />
            <span>{t.preparando}</span>
          </>
        )}
        {pronto && (
          <>
            <span ref={ficha} className="doc-ficha" draggable onDragStart={aoArrastar} title={t.arrasteFicha}>
              <Icone nome="caixa" tamanho={18} />
              {pdf!.arquivo.name}
            </span>
            <span>{toque ? t.prontoToque : baixado ? t.prontoBaixado : t.pronto}</span>
          </>
        )}
        {estado === 'falhou' && (
          <>
            <span>{t.falhou}</span>
            <button type="button" className="adm-btn adm-btn--fantasma" onClick={() => setTentativa(n => n + 1)}>
              {t.tentar}
            </button>
          </>
        )}
      </div>

      {!toque && (
        <label className="doc-auto">
          <input type="checkbox" checked={baixarAuto} onChange={e => mudarBaixarAuto(e.target.checked)} />
          {t.baixarAuto}
        </label>
      )}

      <div ref={caixa} className={`doc-previa${pronto ? ' doc-previa--arrastavel' : ''}`} draggable={pronto} onDragStart={aoArrastar}>
        <div className="doc-zoom" style={{ zoom: escala } as CSSProperties}>
          <DocumentoOrcamento dados={dados} />
        </div>
        {/* Celular: a folha encolhida não se lê; tocar abre em tamanho real para conferir. */}
        {escala < 0.95 && (
          <button type="button" className="doc-previa__ampliar" onClick={() => setAmpliado(true)}>
            <span>
              <Icone nome="busca" tamanho={18} />
              {t.ampliar}
            </span>
          </button>
        )}
      </div>
      {/* Folha em tamanho real, fora da tela: é dela que sai o PDF (a prévia está em escala). */}
      <div ref={folha} className="doc-exportar" aria-hidden="true" inert>
        <DocumentoOrcamento dados={dados} />
      </div>
      {ampliado && <DocumentoAmpliado dados={dados} fechar={() => setAmpliado(false)} />}
    </section>
  );
}

/** A folha em tamanho real, rolando nas duas direções, sobre a tela (fecha com o botão ou Esc). */
function DocumentoAmpliado({ dados, fechar }: { dados: ReturnType<typeof montarDocumento>; fechar: () => void }) {
  const botao = useRef<HTMLButtonElement>(null);
  const aoFechar = useRef(fechar);
  aoFechar.current = fechar;
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    botao.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar.current();
    document.addEventListener('keydown', tecla);
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.documentElement.style.overflow = overflow;
      antes?.focus();
    };
  }, []);
  return (
    <div className="doc-ampliado" role="dialog" aria-modal="true" aria-label={t.tituloAmpliado}>
      <div className="doc-ampliado__barra">
        <strong>{t.tituloAmpliado}</strong>
        <button ref={botao} type="button" className="adm-btn adm-btn--fantasma" onClick={fechar}>
          <Icone nome="fechar" tamanho={18} />
          {t.fechar}
        </button>
      </div>
      <div className="doc-ampliado__folha">
        <DocumentoOrcamento dados={dados} />
      </div>
    </div>
  );
}
