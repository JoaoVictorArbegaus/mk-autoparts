/* Admin (demonstração): lista de produtos com busca, filtros, ativar/desativar e edição. */
import { useMemo, useState } from 'react';
import { Link } from '../router';
import { admin } from '../content/admin';
import { codigosMK, formatarPreco, imagemProduto, listarCategorias, normalizar, obterCategoria, obterMontadora } from '../content/catalogo';
import { Icone } from '../components/Icons';
import { useAdmin } from './AdminDemo';
import type { Produto } from '../content/tipos';

type Situacao = 'todos' | 'ativos' | 'inativos' | 'promocao';

const veiculos = (p: Produto) => [...new Set(p.aplicacoes.map(a => obterMontadora(a.montadora)?.nome ?? a.montadora))].join(', ') || '—';

export function TelaProdutos() {
  const t = admin.produtos;
  const { produtos, alternarAtivo, avisar, fotos } = useAdmin();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sit, setSit] = useState<Situacao>('todos');

  const lista = useMemo(() => {
    const termo = normalizar(q);
    return produtos.filter(p => {
      if (cat && p.categoria !== cat) return false;
      if (sit === 'ativos' && !p.ativo) return false;
      if (sit === 'inativos' && p.ativo) return false;
      if (sit === 'promocao' && !p.promocao) return false;
      if (!termo) return true;
      return normalizar([p.nome, ...codigosMK(p), ...(p.codigosOriginais ?? []), ...(p.variantes ?? []).flatMap(v => v.codigosOriginais ?? [])].join(' ')).includes(termo);
    });
  }, [produtos, q, cat, sit]);

  const alternar = (p: Produto) => {
    alternarAtivo(p.slug);
    avisar(p.ativo ? t.desativado(p.nome) : t.ativado(p.nome));
  };

  return (
    <section className="adm-tela" aria-labelledby="adm-titulo">
      <div className="adm-tela__cabeca">
        <div>
          <h1 id="adm-titulo">{t.titulo}</h1>
          <p>{t.apoio}</p>
        </div>
        <Link href="/admin/produtos/novo" className="adm-btn adm-btn--primario">
          <Icone nome="mais" tamanho={18} />
          {t.novo}
        </Link>
      </div>

      <div className="adm-filtros">
        <label className="adm-campo adm-campo--busca">
          <span className="sr-only">{t.busca}</span>
          <Icone nome="busca" tamanho={18} />
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.busca} />
        </label>
        <label className="adm-campo">
          <span className="sr-only">{t.categoria}</span>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">{t.todas}</option>
            {listarCategorias().map(c => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <div className="adm-segmentos" role="group" aria-label={t.situacao}>
          {(Object.keys(t.situacoes) as Situacao[]).map(s => (
            <button key={s} type="button" aria-pressed={sit === s} onClick={() => setSit(s)}>
              {t.situacoes[s]}
            </button>
          ))}
        </div>
      </div>

      <p className="adm-contagem">{t.contagem(lista.length, produtos.length)}</p>

      {lista.length === 0 ? (
        <p className="adm-vazio">{t.vazio}</p>
      ) : (
        <div className="adm-tabela" role="table" aria-label={t.titulo}>
          <div className="adm-tabela__linha adm-tabela__cabeca" role="row">
            <span role="columnheader">{t.colunas.produto}</span>
            <span role="columnheader">{t.colunas.codigos}</span>
            <span role="columnheader">{t.colunas.categoria}</span>
            <span role="columnheader">{t.colunas.veiculo}</span>
            <span role="columnheader">{t.colunas.situacao}</span>
            <span role="columnheader" className="sr-only">
              {t.colunas.acoes}
            </span>
          </div>
          {lista.map(p => {
            const img = imagemProduto(p);
            return (
              <div key={p.slug} className={`adm-tabela__linha${p.ativo ? '' : ' adm-tabela__linha--inativa'}`} role="row">
                <span role="cell" className="adm-prod">
                  <span className={`adm-prod__foto${p.promocao ? ' adm-prod__foto--escura' : ''}`}>{fotos[p.slug] ? <img src={fotos[p.slug]} alt="" loading="lazy" /> : img && <img src={img.src} alt="" width={img.largura} height={img.altura} loading="lazy" />}</span>
                  <span>
                    <strong>{p.nome}</strong>
                    {p.promocao && (
                      <span className="adm-tag adm-tag--promo">
                        {t.promocao} {formatarPreco(p.promocao.preco)}
                      </span>
                    )}
                  </span>
                </span>
                <span role="cell" className="adm-mono">
                  {codigosMK(p).join(' / ') || '—'}
                </span>
                <span role="cell">{obterCategoria(p.categoria)?.nome ?? p.categoria}</span>
                <span role="cell">{veiculos(p)}</span>
                <span role="cell">
                  <button type="button" className={`adm-chave${p.ativo ? ' adm-chave--on' : ''}`} role="switch" aria-checked={p.ativo} aria-label={`${p.nome}: ${p.ativo ? t.ativo : t.inativo}`} onClick={() => alternar(p)}>
                    <span aria-hidden="true" />
                    {p.ativo ? t.ativo : t.inativo}
                  </button>
                </span>
                <span role="cell" className="adm-acoes">
                  <Link href={`/admin/produtos/editar?slug=${p.slug}`} className="adm-btn adm-btn--fantasma">
                    {t.editar}
                  </Link>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
