/*
 * Novo orçamento / editar (RN-13, RF-30, RF-31), pensado para o celular (revisão impeccable):
 * busca de peças primeiro (sobe para o topo ao tocar, para os resultados não ficarem sob o teclado),
 * cliente e validade depois, lado em botões LD | LE, preço formatado (vazio = sob consulta; item em
 * promoção parte do preço promocional), desconto em % ou R$ por item e no total, e uma barra fixa
 * embaixo com o total e "Salvar e gerar link". Depois de salvar, "Enviar ao cliente" usa o
 * compartilhamento do aparelho; PDF e Word ficam para a REU-06.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Link, useRouter } from '../router';
import { areaVendedor } from '../content/vendedor';
import { codigoDoLado, formatarPreco, imagemProduto, listarProdutos, normalizar, obterProduto, temLados } from '../content/catalogo';
import type { Vendedor } from '../content/vendedores';
import { Icone } from '../components/Icons';
import { Quantidade } from '../components/Quantidade';
import { OBS_MAX } from '../orcamento/lista';
import { copiarLink, enviarLink, linkDoOrcamento, novoIdOrcamento, obterOrcamento, salvarOrcamento } from './armazem';
import { calcularItem, calcularTotais, formatarPorcentagem, type Desconto, type ItemOrcamento, type Orcamento } from './orcamento';

const t = areaVendedor.editor;
const tl = areaVendedor.lista;

/** "1.234,56", "12,5" ou "12.5" → número; vazio → undefined; inválido → null. */
function lerValor(texto: string): number | undefined | null {
  const s = texto.trim().replace(/^R\$\s*/, '');
  if (!s) return undefined;
  const n = Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
const mostrarValor = (n: number | undefined, moeda: boolean) =>
  n === undefined ? '' : moeda ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(n).replace('.', ',');

/** Campo de valor com texto livre (aceita vírgula); formata ao sair do campo; só propaga números válidos. */
function CampoValor({ valor, aoMudar, rotulo, placeholder, moeda = false }: { valor: number | undefined; aoMudar: (n: number | undefined) => void; rotulo: string; placeholder?: string; moeda?: boolean }) {
  const [texto, setTexto] = useState(mostrarValor(valor, moeda));
  const focado = useRef(false);
  useEffect(() => {
    if (!focado.current && lerValor(texto) !== valor) setTexto(mostrarValor(valor, moeda));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);
  const invalido = lerValor(texto) === null;
  return (
    <input
      className={`vend-valor${moeda ? ' vend-valor--moeda' : ''}${invalido ? ' vend-valor--erro' : ''}`}
      inputMode="decimal"
      value={texto}
      placeholder={placeholder}
      aria-label={rotulo}
      aria-invalid={invalido || undefined}
      onFocus={() => (focado.current = true)}
      onBlur={() => {
        focado.current = false;
        const n = lerValor(texto);
        if (n !== null) setTexto(mostrarValor(n, moeda));
      }}
      onChange={e => {
        setTexto(e.target.value);
        const n = lerValor(e.target.value);
        if (n !== null) aoMudar(n);
      }}
    />
  );
}

function CampoDesconto({ desconto, aoMudar, rotulo }: { desconto?: Desconto; aoMudar: (d?: Desconto) => void; rotulo: string }) {
  // O tipo pode ser escolhido antes do valor; sem valor, não há desconto.
  const [tipoLocal, setTipoLocal] = useState<Desconto['tipo']>(desconto?.tipo ?? 'percentual');
  const tipo = desconto?.tipo ?? tipoLocal;
  const trocar = (novo: Desconto['tipo']) => {
    setTipoLocal(novo);
    if (desconto) aoMudar({ ...desconto, tipo: novo });
  };
  return (
    <span className="vend-desconto">
      <CampoValor valor={desconto?.valor} rotulo={rotulo} placeholder="0" aoMudar={n => aoMudar(n ? { tipo, valor: n } : undefined)} />
      <span className="vend-segmento" role="group" aria-label={`${rotulo}: tipo`}>
        <button type="button" aria-pressed={tipo === 'percentual'} onClick={() => trocar('percentual')}>
          %
        </button>
        <button type="button" aria-pressed={tipo === 'valor'} onClick={() => trocar('valor')}>
          R$
        </button>
      </span>
    </span>
  );
}

function Preco({ antigo, novo, pct }: { antigo: number; novo: number; pct: number }) {
  if (pct <= 0) return <span className="vend-preco">{formatarPreco(novo)}</span>;
  return (
    <span className="vend-preco">
      <s>{formatarPreco(antigo)}</s>
      <span>{formatarPreco(novo)}</span>
      <span className="vend-pct">-{formatarPorcentagem(pct)}</span>
    </span>
  );
}

const vazio = (vendedor: string): Orcamento => ({ id: novoIdOrcamento(), vendedor, itens: [], observacao: '', criadoEm: new Date().toISOString(), estado: 'ativo', alteracoes: [] });

export function EditorOrcamento({ vendedor, avisar }: { vendedor: Vendedor; avisar: (t: string) => void }) {
  const { busca, navegar } = useRouter();
  const idEditar = new URLSearchParams(busca).get('id');
  const [orc, setOrc] = useState<Orcamento>(() => vazio(vendedor.codigo));
  const [editando, setEditando] = useState(false);
  const [salvo, setSalvo] = useState<Orcamento | null>(null);
  const [q, setQ] = useState('');
  const [erro, setErro] = useState('');
  // Linhas recém-criadas pelo "Par" (destacadas por alguns segundos).
  const [destaque, setDestaque] = useState<string[]>([]);
  useEffect(() => {
    if (!destaque.length) return;
    const id = window.setTimeout(() => setDestaque([]), 2400);
    return () => clearTimeout(id);
  }, [destaque]);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const idAtual = useRef(orc.id);
  idAtual.current = orc.id;

  useEffect(() => {
    const existente = idEditar ? obterOrcamento(idEditar) : undefined;
    // Depois de salvar, a URL ganha ?id= do próprio orçamento: não recarrega nem esconde o resultado.
    if (existente && existente.id === idAtual.current) return;
    setSalvo(null);
    if (existente && existente.vendedor === vendedor.codigo) {
      setOrc(existente);
      setEditando(true);
    } else {
      setOrc(vazio(vendedor.codigo));
      setEditando(false);
    }
  }, [idEditar, vendedor.codigo]);

  const resultados = useMemo(() => {
    const termo = normalizar(q);
    if (termo.length < 2) return [];
    return listarProdutos()
      .filter(p => normalizar(`${p.nome} ${p.codigo ?? ''} ${(p.variantes ?? []).map(v => v.codigo ?? '').join(' ')}`).includes(termo))
      .slice(0, 6);
  }, [q]);

  const mudarItem = (i: number, f: (it: ItemOrcamento) => ItemOrcamento) => setOrc(o => ({ ...o, itens: o.itens.map((it, k) => (k === i ? f(it) : it)) }));
  // "Par": a linha vira duas (LD e LE), com a mesma quantidade, preço e desconto; cada lado fica editável.
  const dividirPar = (i: number) => {
    const it = orc.itens[i];
    const p = it && obterProduto(it.slug);
    if (!p) return;
    setOrc(o => ({ ...o, itens: o.itens.flatMap((x, k) => (k === i ? [{ ...x, lado: 'LD' as const }, { ...x, lado: 'LE' as const }] : [x])) }));
    setDestaque([`${it.slug}:LD`, `${it.slug}:LE`]);
    avisar(t.parAdicionado(p.nome));
  };
  const adicionar = (slug: string) => {
    const p = obterProduto(slug);
    if (!p) return;
    setOrc(o => ({ ...o, itens: [...o.itens, { slug, lado: temLados(p) ? 'LD' : undefined, quantidade: 1, preco: p.promocao?.preco }] }));
    setQ('');
    setSalvo(null);
  };

  const totais = calcularTotais(orc);

  const salvar = () => {
    if (!orc.itens.length) return setErro(t.semItens);
    setErro('');
    const final = { ...orc, cliente: orc.cliente?.trim() || undefined, estado: 'ativo' as const };
    salvarOrcamento(final);
    setOrc(final);
    setSalvo(final);
    setEditando(true);
    avisar(t.salvo);
    if (idEditar !== final.id) navegar(`/vendedor/novo?id=${final.id}`, { substituir: true, manterRolagem: true });
    requestAnimationFrame(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  return (
    <section className="adm-tela vend-tela vend-editor" aria-labelledby="vend-editor-titulo">
      <div className="adm-tela__cabeca">
        <h1 id="vend-editor-titulo">{editando ? t.tituloEditar : t.titulo}</h1>
      </div>

      <div className="adm-bloco">
        <div className="vend-busca">
          <label htmlFor="vend-busca">{t.buscar}</label>
          <div className="adm-campo--busca">
            <Icone nome="busca" tamanho={18} />
            <input
              id="vend-busca"
              type="search"
              value={q}
              placeholder={t.buscarDica}
              onChange={e => setQ(e.target.value)}
              // No celular, o campo sobe para o topo: os resultados não ficam sob o teclado.
              onFocus={e => {
                if (window.matchMedia('(max-width: 859px)').matches) e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
        </div>
        {q.trim().length >= 2 && (
          <ul className="vend-resultados">
            {resultados.length ? (
              resultados.map(p => (
                <li key={p.slug}>
                  <button type="button" onClick={() => adicionar(p.slug)}>
                    <Icone nome="mais" tamanho={16} />
                    <span>{p.nome}</span>
                    <small>{p.codigo ?? p.variantes?.map(v => v.codigo).filter(Boolean).join(' / ')}</small>
                  </button>
                </li>
              ))
            ) : (
              <li className="vend-resultados__vazio">{t.nenhum}</li>
            )}
          </ul>
        )}

        {!orc.itens.length ? (
          <p className="adm-vazio">{t.vazio}</p>
        ) : (
          <ul className="vend-itens">
            {orc.itens.map((it, i) => {
              const p = obterProduto(it.slug);
              if (!p) return null;
              const l = calcularItem(it);
              const img = imagemProduto(p);
              return (
                <li key={`${it.slug}-${i}`} className={`vend-item${destaque.includes(`${it.slug}:${it.lado}`) ? ' vend-item--novo' : ''}`}>
                  <span className="vend-item__foto">{img && <img src={img.src} alt="" width={56} height={56} loading="lazy" />}</span>
                  <div className="vend-item__nome">
                    <strong>{p.nome}</strong>
                    <small>{codigoDoLado(p, it.lado) ?? p.codigo}</small>
                  </div>
                  <div className="vend-item__campos">
                    {temLados(p) && (
                      <div className="vend-mini">
                        <span>{t.lado}</span>
                        <span className="vend-segmento" role="group" aria-label={`${t.lado}: ${p.nome}`}>
                          {(['LD', 'LE'] as const).map(lado => (
                            <button key={lado} type="button" aria-pressed={it.lado === lado} onClick={() => mudarItem(i, x => ({ ...x, lado }))}>
                              {lado}
                            </button>
                          ))}
                          <button type="button" aria-pressed={false} onClick={() => dividirPar(i)} title={t.parDica}>
                            {t.par}
                          </button>
                        </span>
                      </div>
                    )}
                    <div className="vend-mini">
                      <span>{t.quantidade}</span>
                      <Quantidade valor={it.quantidade} onChange={n => mudarItem(i, x => ({ ...x, quantidade: n }))} rotulo={`${t.quantidade}: ${p.nome}`} pequeno />
                    </div>
                    <label className="vend-mini">
                      <span>{t.preco}</span>
                      <CampoValor moeda valor={it.preco} rotulo={`${t.preco}: ${p.nome}`} placeholder={t.precoDica} aoMudar={n => mudarItem(i, x => ({ ...x, preco: n }))} />
                    </label>
                    <div className="vend-mini">
                      <span>{t.desconto}</span>
                      <CampoDesconto desconto={it.desconto} rotulo={`${t.desconto}: ${p.nome}`} aoMudar={d => mudarItem(i, x => ({ ...x, desconto: d }))} />
                    </div>
                  </div>
                  <div className="vend-item__valor">
                    {l.comPreco ? (
                      <>
                        <Preco antigo={l.unitario} novo={l.unitarioFinal} pct={l.pct} />
                        {it.quantidade > 1 && <small>{`${it.quantidade} × = ${formatarPreco(l.total)}`}</small>}
                      </>
                    ) : (
                      <span className="vend-consulta">{t.sobConsulta}</span>
                    )}
                  </div>
                  <button type="button" className="adm-icone-btn vend-item__remover" aria-label={t.remover(p.nome)} onClick={() => setOrc(o => ({ ...o, itens: o.itens.filter((_, k) => k !== i) }))}>
                    <Icone nome="lixeira" tamanho={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="adm-bloco vend-editor__dados">
        <h2>{t.dados}</h2>
        <label className="adm-campo">
          <span>{t.cliente}</span>
          <input value={orc.cliente ?? ''} maxLength={80} onChange={e => setOrc(o => ({ ...o, cliente: e.target.value }))} aria-describedby="vend-cliente-dica" />
          <small id="vend-cliente-dica">{t.clienteDica}</small>
        </label>
        <label className="adm-campo">
          <span>{t.validade}</span>
          <input type="date" value={orc.validade ?? ''} onChange={e => setOrc(o => ({ ...o, validade: e.target.value || undefined }))} />
        </label>
        {orc.itens.length > 0 && (
          <>
            <label className="adm-campo vend-editor__obs">
              <span>{t.observacao}</span>
              <textarea value={orc.observacao} maxLength={OBS_MAX} rows={2} onChange={e => setOrc(o => ({ ...o, observacao: e.target.value }))} />
            </label>
            <div className="vend-mini">
              <span>{t.descontoTotal}</span>
              <CampoDesconto desconto={orc.descontoTotal} rotulo={t.descontoTotal} aoMudar={d => setOrc(o => ({ ...o, descontoTotal: d }))} />
            </div>
          </>
        )}
      </div>

      {salvo && <Resultado orc={salvo} avisar={avisar} refEl={resultadoRef} />}

      {orc.itens.length > 0 && (
        // Barra fixa: o total e o salvar ficam sempre à vista enquanto o vendedor mexe nos preços.
        <div className="vend-barra">
          <div className="vend-totais__valor">
            <span>{t.total}</span>
            {totais.subtotal > 0 ? <Preco antigo={totais.subtotal} novo={totais.total} pct={totais.pct} /> : <span className="vend-consulta">{t.sobConsulta}</span>}
            {totais.semPreco > 0 && totais.subtotal > 0 && <small>{t.semPreco(totais.semPreco)}</small>}
          </div>
          {erro && (
            <p className="adm-erro" role="alert">
              {erro}
            </p>
          )}
          <button type="button" className="adm-btn adm-btn--primario vend-salvar" onClick={salvar}>
            <Icone nome="check" tamanho={18} />
            {editando ? t.salvarAlteracoes : t.salvar}
          </button>
        </div>
      )}
    </section>
  );
}

function Resultado({ orc, avisar, refEl }: { orc: Orcamento; avisar: (t: string) => void; refEl: RefObject<HTMLDivElement | null> }) {
  const link = linkDoOrcamento(orc);
  const enviar = async () => {
    const r = await enviarLink(orc);
    if (r === 'copiado') avisar(tl.copiado);
    if (r === 'falhou') avisar(tl.falhouCopiar);
  };
  const copiar = async () => avisar((await copiarLink(orc)) === 'copiado' ? tl.copiado : tl.falhouCopiar);
  return (
    <div ref={refEl} className="adm-bloco vend-resultado" role="region" aria-labelledby="vend-resultado-titulo">
      <h2 id="vend-resultado-titulo">{t.resultado}</h2>
      <p>{t.resultadoApoio}</p>
      <div className="vend-orc__acoes">
        <button type="button" className="adm-btn adm-btn--primario vend-enviar" onClick={enviar}>
          <Icone nome="whatsapp" tamanho={18} />
          {tl.enviar}
        </button>
        <button type="button" className="adm-btn adm-btn--fantasma" onClick={copiar}>
          <Icone nome="copiar" tamanho={16} />
          {tl.copiar}
        </button>
        <a className="adm-btn adm-btn--fantasma" href={link} target="_blank" rel="noopener">
          {tl.abrir}
        </a>
      </div>
      <details className="vend-resultado__link">
        <summary>{t.verLink}</summary>
        <code>{link}</code>
      </details>
      <p className="adm-dica">{t.documentoEmBreve}</p>
      <Link className="vend-outro" href="/vendedor/novo">
        <Icone nome="mais" tamanho={16} />
        {t.outro}
      </Link>
    </div>
  );
}
