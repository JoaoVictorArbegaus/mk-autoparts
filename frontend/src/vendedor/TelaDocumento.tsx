/*
 * Tela do documento (/vendedor/documento?id=…, REU-06): prévia do orçamento em A4 (a mesma página do
 * PDF, em escala para caber no celular), "Salvar PDF" pela impressão do navegador ("Salvar como PDF",
 * sem servidor no protótipo) e "Baixar Word" (.docx gerado no navegador). O vendedor edita o orçamento
 * antes, na tela de edição; o arquivo em si não se edita.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useRouter } from '../router';
import { areaVendedor } from '../content/vendedor';
import { Icone } from '../components/Icons';
import type { Vendedor } from '../content/vendedores';
import { linkDoOrcamento, obterOrcamento, proximoNumero, salvarOrcamento } from './armazem';
import { DocumentoOrcamento, montarDocumento } from './Documento';
import type { Orcamento } from './orcamento';

const t = areaVendedor.documento;
const LARGURA_A4 = 793.7; // 210 mm em px (96 dpi)

export function TelaDocumento({ vendedor, avisar }: { vendedor: Vendedor; avisar: (t: string) => void }) {
  const { busca } = useRouter();
  const id = new URLSearchParams(busca).get('id');
  const [orc, setOrc] = useState<Orcamento | null | undefined>(undefined);
  const [gerando, setGerando] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);

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

  const salvarPdf = async () => {
    // Espera as fontes (Saira e IBM Plex) para o PDF não sair com fonte errada.
    await document.fonts.ready;
    const titulo = document.title;
    document.title = nomeArquivo; // nome sugerido do arquivo ao "Salvar como PDF"
    window.print();
    document.title = titulo;
  };

  const baixarWord = async () => {
    setGerando(true);
    try {
      const { gerarWord } = await import('./word');
      const blob = await gerarWord(dados);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nomeArquivo}.docx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      avisar(t.wordPronto);
    } catch {
      avisar(t.wordFalhou);
    } finally {
      setGerando(false);
    }
  };

  return (
    <section className="doc-tela" aria-label={t.titulo}>
      <div className="adm-tela__cabeca doc-acoes">
        <Link className="adm-btn adm-btn--fantasma" href={`/vendedor/novo?id=${orc.id}`}>
          <Icone nome="setaEsq" tamanho={16} />
          {t.editar}
        </Link>
        <button type="button" className="adm-btn adm-btn--primario" onClick={salvarPdf}>
          {t.pdf}
        </button>
        <button type="button" className="adm-btn adm-btn--fantasma" onClick={baixarWord} disabled={gerando}>
          {gerando ? t.gerando : t.word}
        </button>
        <p className="doc-acoes__dica">{t.dica}</p>
        {dados.removidos > 0 && (
          <p className="doc-acoes__aviso" role="status">
            {t.removidos}
          </p>
        )}
      </div>
      <div ref={caixa} className="doc-previa">
        <div className="doc-zoom" style={{ zoom: escala } as CSSProperties}>
          <DocumentoOrcamento dados={dados} />
        </div>
      </div>
    </section>
  );
}
