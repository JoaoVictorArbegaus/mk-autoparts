/* Admin (demonstração): produtos em promoção, edição do preço e inclusão/remoção (RN-02A). */
import { useState, type FormEvent } from 'react';
import { admin } from '../content/admin';
import { artePromocao, formatarPreco, imagemProduto } from '../content/catalogo';
import { Icone } from '../components/Icons';
import { useAdmin } from './AdminDemo';
import type { Produto } from '../content/tipos';

const numero = (s: string) => {
  const n = Number(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
const reais = (n: number) => n.toFixed(2).replace('.', ',');
const valido = (preco: number, original?: number) => preco > 0 && (original === undefined || original > preco);

function LinhaPromo({ p }: { p: Produto }) {
  const t = admin.promocoes;
  const { definirPromocao, avisar, fotos } = useAdmin();
  const [preco, setPreco] = useState(reais(p.promocao!.preco));
  const [orig, setOrig] = useState(p.promocao!.precoOriginal ? reais(p.promocao!.precoOriginal) : '');
  const [erro, setErro] = useState(false);
  const arte = artePromocao(p);
  const img = fotos[p.slug] ?? (arte ? arte.src400 : imagemProduto(p)?.src);

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    const v = numero(preco);
    const o = orig.trim() ? numero(orig) : undefined;
    if (!valido(v, o)) {
      setErro(true);
      return;
    }
    setErro(false);
    definirPromocao(p.slug, { preco: v, ...(o ? { precoOriginal: o } : {}) });
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
        {arte && <span className="adm-tag">{t.arte}</span>}
      </div>
      <form className="adm-promo__form" onSubmit={salvar}>
        <label className="adm-campo">
          <span>{t.preco}</span>
          <input inputMode="decimal" value={preco} onChange={e => setPreco(e.target.value)} aria-invalid={erro} />
        </label>
        <label className="adm-campo">
          <span>{t.precoOriginal}</span>
          <input inputMode="decimal" value={orig} onChange={e => setOrig(e.target.value)} aria-invalid={erro} />
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
            {t.invalido}
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
  const [erro, setErro] = useState(false);

  const adicionar = (e: FormEvent) => {
    e.preventDefault();
    const v = numero(preco);
    const o = orig.trim() ? numero(orig) : undefined;
    if (!slug || !valido(v, o)) {
      setErro(true);
      return;
    }
    setErro(false);
    definirPromocao(slug, { preco: v, ...(o ? { precoOriginal: o } : {}) });
    setSlug('');
    setPreco('');
    setOrig('');
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
            <select value={slug} onChange={e => setSlug(e.target.value)} aria-invalid={erro && !slug}>
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
          <button type="submit" className="adm-btn adm-btn--primario">
            <Icone nome="mais" tamanho={18} />
            {t.adicionar}
          </button>
        </div>
        {erro && (
          <p className="adm-erro" role="alert">
            {t.invalido}
          </p>
        )}
      </form>

      {emPromo.length === 0 ? (
        <p className="adm-vazio">{t.vazio}</p>
      ) : (
        <ul className="adm-promos">
          {emPromo.map(p => (
            <LinhaPromo key={`${p.slug}-${p.promocao!.preco}-${p.promocao!.precoOriginal ?? ''}`} p={p} />
          ))}
        </ul>
      )}
    </section>
  );
}
