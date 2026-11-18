/* Admin (demonstração): produtos em promoção, edição do preço, período opcional (M5) e inclusão/remoção (RN-02A). */
import { useState, type FormEvent } from 'react';
import { admin } from '../content/admin';
import { artePromocao, formatarPreco, imagemProduto, situacaoPromocao } from '../content/catalogo';
import { Icone } from '../components/Icons';
import { useAdmin } from './AdminDemo';
import type { Produto } from '../content/tipos';

const numero = (s: string) => {
  const n = Number(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
const reais = (n: number) => n.toFixed(2).replace('.', ',');
const valido = (preco: number, original?: number) => preco > 0 && (original === undefined || original > preco);
const periodoOk = (inicio: string, fim: string) => !inicio || !fim || fim >= inicio;
/** Monta a promoção só com os campos preenchidos. */
const montar = (preco: number, original: number | undefined, inicio: string, fim: string) => ({
  preco,
  ...(original ? { precoOriginal: original } : {}),
  ...(inicio ? { inicio } : {}),
  ...(fim ? { fim } : {}),
});

function SituacaoPromo({ p }: { p: Produto }) {
  const t = admin.promocoes;
  const promo = p.promocao!;
  const sit = situacaoPromocao(promo);
  const periodo = t.periodo(promo.inicio, promo.fim);
  return (
    <span className="adm-promo__situacao">
      <span className={`adm-tag${sit === 'ativa' ? ' adm-tag--ok' : sit === 'agendada' ? ' adm-tag--promo' : ''}`}>{t.situacao[sit]}</span>
      <span>{periodo || t.semPrazo}</span>
    </span>
  );
}

function LinhaPromo({ p }: { p: Produto }) {
  const t = admin.promocoes;
  const { definirPromocao, avisar, fotos } = useAdmin();
  const [preco, setPreco] = useState(reais(p.promocao!.preco));
  const [orig, setOrig] = useState(p.promocao!.precoOriginal ? reais(p.promocao!.precoOriginal) : '');
  const [inicio, setInicio] = useState(p.promocao!.inicio ?? '');
  const [fim, setFim] = useState(p.promocao!.fim ?? '');
  const [erro, setErro] = useState('');
  const arte = artePromocao(p);
  const img = fotos[p.slug] ?? (arte ? arte.src400 : imagemProduto(p)?.src);

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    const v = numero(preco);
    const o = orig.trim() ? numero(orig) : undefined;
    if (!valido(v, o)) return setErro(t.invalido);
    if (!periodoOk(inicio, fim)) return setErro(t.periodoInvalido);
    setErro('');
    definirPromocao(p.slug, montar(v, o, inicio, fim));
    avisar(t.salvo);
  };

  return (
    <li className="adm-promo">
      <span className={`adm-promo__img${arte ? ' adm-promo__img--arte' : ''}`}>{img && <img src={img} alt="" loading="lazy" />}</span>
      <div className="adm-promo__info">
        <strong>{p.nome}</strong>
        <span className="adm-promo__preco">
          {p.promocao!.precoOriginal && <s>{formatarPreco(p.promocao!.precoOriginal)}</s>} {formatarPreco(p.promocao!.preco)}
        </span>
        <SituacaoPromo p={p} />
        {arte && <span className="adm-tag">{t.arte}</span>}
      </div>
      <form className="adm-promo__form" onSubmit={salvar}>
        <label className="adm-campo">
          <span>{t.preco}</span>
          <input inputMode="decimal" value={preco} onChange={e => setPreco(e.target.value)} aria-invalid={!!erro} />
        </label>
        <label className="adm-campo">
          <span>{t.precoOriginal}</span>
          <input inputMode="decimal" value={orig} onChange={e => setOrig(e.target.value)} aria-invalid={!!erro} />
        </label>
        <label className="adm-campo">
          <span>{t.inicio}</span>
          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} aria-invalid={erro === t.periodoInvalido} />
        </label>
        <label className="adm-campo">
          <span>{t.fim}</span>
          <input type="date" value={fim} min={inicio || undefined} onChange={e => setFim(e.target.value)} aria-invalid={erro === t.periodoInvalido} />
        </label>
        <button type="submit" className="adm-btn adm-btn--primario">
          {t.salvar}
        </button>
        <button
          type="button"
          className="adm-icone-btn"
          aria-label={`${t.remover}: ${p.nome}`}
          onClick={() => {
            definirPromocao(p.slug, undefined);
            avisar(t.removido);
          }}
        >
          <Icone nome="lixeira" tamanho={18} />
        </button>
        {erro && (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        )}
      </form>
    </li>
  );
}

export function TelaPromocoes() {
  const t = admin.promocoes;
  const { produtos, definirPromocao, avisar } = useAdmin();
  const emPromo = produtos.filter(p => p.promocao);
  const disponiveis = produtos.filter(p => !p.promocao && p.ativo).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const [slug, setSlug] = useState('');
  const [preco, setPreco] = useState('');
  const [orig, setOrig] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [erro, setErro] = useState('');

  const adicionar = (e: FormEvent) => {
    e.preventDefault();
    const v = numero(preco);
    const o = orig.trim() ? numero(orig) : undefined;
    if (!slug || !valido(v, o)) return setErro(t.invalido);
    if (!periodoOk(inicio, fim)) return setErro(t.periodoInvalido);
    setErro('');
    definirPromocao(slug, montar(v, o, inicio, fim));
    setSlug('');
    setPreco('');
    setOrig('');
    setInicio('');
    setFim('');
    avisar(t.salvo);
  };

  return (
    <section className="adm-tela" aria-labelledby="adm-titulo">
      <div className="adm-tela__cabeca">
        <div>
          <h1 id="adm-titulo">{t.titulo}</h1>
          <p>{t.apoio}</p>
        </div>
      </div>

      <form className="adm-bloco adm-nova-promo" onSubmit={adicionar}>
        <h2>{t.adicionar}</h2>
        <div className="adm-nova-promo__campos">
          <label className="adm-campo adm-campo--largo">
            <span>{t.produto}</span>
            <select value={slug} onChange={e => setSlug(e.target.value)} aria-invalid={!!erro && !slug}>
              <option value="">{t.escolher}</option>
              {disponiveis.map(p => (
                <option key={p.slug} value={p.slug}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-campo">
            <span>{t.preco}</span>
            <input inputMode="decimal" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0,00" />
          </label>
          <label className="adm-campo">
            <span>{t.precoOriginal}</span>
            <input inputMode="decimal" value={orig} onChange={e => setOrig(e.target.value)} placeholder="0,00" />
          </label>
          <label className="adm-campo">
            <span>{t.inicio}</span>
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
          </label>
          <label className="adm-campo">
            <span>{t.fim}</span>
            <input type="date" value={fim} min={inicio || undefined} onChange={e => setFim(e.target.value)} />
          </label>
          <button type="submit" className="adm-btn adm-btn--primario">
            <Icone nome="mais" tamanho={18} />
            {t.adicionar}
          </button>
        </div>
        {erro && (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        )}
      </form>

      {emPromo.length === 0 ? (
        <p className="adm-vazio">{t.vazio}</p>
      ) : (
        <ul className="adm-promos">
          {emPromo.map(p => (
            <LinhaPromo key={`${p.slug}-${p.promocao!.preco}-${p.promocao!.precoOriginal ?? ''}-${p.promocao!.inicio ?? ''}-${p.promocao!.fim ?? ''}`} p={p} />
          ))}
        </ul>
      )}
    </section>
  );
}
