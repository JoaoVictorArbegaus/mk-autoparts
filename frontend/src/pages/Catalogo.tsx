/*
 * Catálogo (tela de trabalho, sem fundo animado): busca, filtros e ordenação na URL (RF-06 a RF-12).
 * O HTML pré-renderizado mostra a lista sem filtros; a query string entra depois da montagem, com um
 * estado curto que reserva a altura (sem erro de hidratação). Lotes de 24 ao rolar.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../router';
import {
  consultaVazia,
  consultar,
  contarFiltros,
  escreverConsulta,
  filtrosAtivos,
  lerConsulta,
  listarCategorias,
  listarMarcas,
  listarMontadoras,
  obterMontadora,
  trocarMontadora,
  type Consulta,
  type Ordem,
} from '../content/catalogo';
import { mensagens, textos, whatsapp } from '../content/site';
import { destinoWhatsApp, useOrcamento } from '../orcamento/OrcamentoContext';
import { registrar } from '../rastreio/eventos';
import { CardProduto } from '../components/CardProduto';
import { Icone } from '../components/Icons';
import { useTextoCurto } from '../hooks/useTextoCurto';
import { Button } from '../components/Button';

const LOTE = 24;

function Filtros({ c, aplicar, idBase }: { c: Consulta; aplicar: (proxima: Consulta) => void; idBase: string }) {
  const t = textos.catalogo;
  const marcas = listarMarcas();
  const montadora = obterMontadora(c.montadora);
  const alternar = (lista: string[], v: string) => (lista.includes(v) ? lista.filter(x => x !== v) : [...lista, v]);
  return (
    <div className="filtros">
      {/* Categoria: só nos chips do topo (um controle só; revisão impeccable). */}
      <div className="filtros__campo">
        <label htmlFor={`${idBase}-montadora`}>{t.marcaVeiculo}</label>
        <select id={`${idBase}-montadora`} value={c.montadora} onChange={e => aplicar(trocarMontadora(c, e.target.value))}>
          <option value="">{t.todasMarcas}</option>
          {listarMontadoras().map(m => (
            <option key={m.slug} value={m.slug}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="filtros__campo">
        <label htmlFor={`${idBase}-modelo`}>{t.modelo}</label>
        <select id={`${idBase}-modelo`} value={c.modelo} disabled={!montadora} onChange={e => aplicar({ ...c, modelo: e.target.value })} aria-describedby={!montadora ? `${idBase}-modelo-ajuda` : undefined}>
          <option value="">{montadora ? t.todosModelos : t.escolhaMarca}</option>
          {montadora?.modelos.map(m => (
            <option key={m.slug} value={m.slug}>
              {m.nome}
            </option>
          ))}
        </select>
        {!montadora && (
          <small id={`${idBase}-modelo-ajuda`} className="sr-only">
            {t.escolhaMarca}
          </small>
        )}
      </div>
      {marcas.length >= 2 && (
        <fieldset>
          <legend>{t.marcaPeca}</legend>
          {marcas.map(m => (
            <label key={m} className="opcao">
              <input type="checkbox" checked={c.marcas.includes(m)} onChange={() => aplicar({ ...c, marcas: alternar(c.marcas, m) })} />
              <span>{m}</span>
            </label>
          ))}
        </fieldset>
      )}
      <label className="opcao opcao--chave">
        <input type="checkbox" role="switch" checked={c.promocao} onChange={() => aplicar({ ...c, promocao: !c.promocao })} />
        <span>{t.somentePromocoes}</span>
      </label>
    </div>
  );
}

export function Catalogo() {
  const t = textos.catalogo;
  const dicaBusca = useTextoCurto(t.buscaPlaceholder, t.buscaPlaceholderCurto);
  const { busca, montado, navegar } = useRouter();
  const { vendedor } = useOrcamento();
  const c = useMemo(() => (montado ? lerConsulta(new URLSearchParams(busca)) : consultaVazia), [busca, montado]);
  const resultados = useMemo(() => consultar(c), [c]);
  const [texto, setTexto] = useState('');
  const [limite, setLimite] = useState(LOTE);
  const [painel, setPainel] = useState(false);
  const sentinela = useRef<HTMLDivElement>(null);
  const botaoFiltrar = useRef<HTMLButtonElement>(null);
  const nFiltros = contarFiltros(c);

  // O campo segue a URL (voltar no navegador restaura a busca).
  useEffect(() => setTexto(atual => (atual.trim() === c.q ? atual : c.q)), [c.q]);
  useEffect(() => setLimite(LOTE), [c]);

  const aplicar = (proxima: Consulta, substituir = false) => {
    const qs = escreverConsulta(proxima);
    navegar(`/catalogo${qs ? `?${qs}` : ''}`, { substituir, manterRolagem: true });
  };

  // Digitação: atualiza a URL sem empilhar o histórico a cada tecla.
  useEffect(() => {
    if (!montado || texto.trim() === c.q) return;
    const id = window.setTimeout(() => aplicar({ ...c, q: texto, ordem: texto.trim() ? (c.q ? c.ordem : 'relevancia') : c.ordem === 'relevancia' ? 'nome' : c.ordem }, true), 280);
    return () => clearTimeout(id);
  }, [texto]);

  // Evento de busca: no máximo um por segundo de digitação (RN-08).
  const chave = escreverConsulta({ ...c, ordem: 'nome' });
  useEffect(() => {
    if (!montado || (!c.q && !nFiltros)) return;
    const id = window.setTimeout(() => registrar('busca_realizada', { dados: { consulta: chave.slice(0, 200), resultados: resultados.length } }), 1000);
    return () => clearTimeout(id);
  }, [chave, montado]);

  // Carregamento incremental: o próximo lote entra quando a sentinela se aproxima.
  useEffect(() => {
    const el = sentinela.current;
    if (!el || limite >= resultados.length) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLimite(l => l + LOTE), { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [limite, resultados.length]);

  useEffect(() => {
    if (!painel) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && fecharPainel();
    document.addEventListener('keydown', esc);
    document.documentElement.classList.add('sem-rolagem');
    return () => {
      document.removeEventListener('keydown', esc);
      document.documentElement.classList.remove('sem-rolagem');
    };
  }, [painel]);

  const fecharPainel = () => {
    setPainel(false);
    botaoFiltrar.current?.focus();
  };

  const chips = filtrosAtivos(c);
  const visiveis = resultados.slice(0, limite);
  const msgVazio = vendedor ? mensagens.contato.replace('MK Autoparts', vendedor.nome) : mensagens.contato;

  return (
    <div className="catalogo" data-pronto={montado}>
      <section className="cat-topo" aria-labelledby="cat-h1">
        <div className="contido">
          <h1 id="cat-h1">{t.titulo}</h1>
          <p className="cat-topo__apoio">{t.apoio}</p>
          <form className="busca busca--catalogo" role="search" onSubmit={e => e.preventDefault()}>
            <label htmlFor="busca-catalogo" className="sr-only">
              {t.buscaRotulo}
            </label>
            <Icone nome="busca" tamanho={22} className="busca__lupa" />
            <input id="busca-catalogo" type="search" value={texto} onChange={e => setTexto(e.target.value)} placeholder={dicaBusca} autoComplete="off" enterKeyHint="search" />
            {texto && (
              <button type="button" className="busca__limpar" onClick={() => setTexto('')} aria-label={t.limparBusca}>
                <Icone nome="fechar" tamanho={20} />
              </button>
            )}
          </form>
          <nav className="cat-chips" aria-label={t.categoria}>
            <button type="button" className={`chip${!c.categorias.length ? ' chip--ativo' : ''}`} aria-pressed={!c.categorias.length} onClick={() => aplicar({ ...c, categorias: [] })}>
              {t.todasCategorias}
            </button>
            {listarCategorias().map(cat => {
              const on = c.categorias.length === 1 && c.categorias[0] === cat.slug;
              return (
                <button key={cat.slug} type="button" className={`chip${on ? ' chip--ativo' : ''}`} aria-pressed={on} onClick={() => aplicar({ ...c, categorias: on ? [] : [cat.slug] })}>
                  {cat.nome}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="contido cat-corpo">
        <aside className="cat-lateral" aria-labelledby="filtros-titulo">
          <div className="cat-lateral__topo">
            <h2 id="filtros-titulo">{t.filtros}</h2>
            {nFiltros > 0 && (
              <button type="button" className="link-acao" onClick={() => aplicar({ ...consultaVazia, q: c.q, ordem: c.ordem })}>
                {t.limparFiltros}
              </button>
            )}
          </div>
          <Filtros c={c} aplicar={aplicar} idBase="lat" />
        </aside>

        <div className="cat-resultados">
          <div className="cat-barra">
            <p className="cat-barra__n" aria-live="polite">
              {t.resultados(resultados.length)}
            </p>
            <button ref={botaoFiltrar} type="button" className="btn-filtrar" onClick={() => setPainel(true)} aria-expanded={painel} aria-controls="painel-filtros">
              <Icone nome="filtro" tamanho={20} />
              {t.filtrar}
              {nFiltros > 0 && <span className="btn-filtrar__n">{nFiltros}</span>}
            </button>
            <label className="cat-ordem">
              <span>{t.ordenar}</span>
              <select value={c.ordem === 'relevancia' && !c.q ? 'nome' : c.ordem} onChange={e => aplicar({ ...c, ordem: e.target.value as Ordem })}>
                {c.q && <option value="relevancia">{t.ordens.relevancia}</option>}
                <option value="nome">{t.ordens.nome}</option>
                <option value="codigo">{t.ordens.codigo}</option>
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <ul className="chips-ativos" aria-label={t.filtros}>
              {chips.map(ch => (
                <li key={ch.chave}>
                  <button type="button" className="chip chip--remover" onClick={() => aplicar(ch.proxima)} aria-label={t.removerFiltro(ch.rotulo)}>
                    {ch.rotulo}
                    <Icone nome="fechar" tamanho={16} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="link-acao" onClick={() => aplicar(consultaVazia)}>
                  {t.limparFiltros}
                </button>
              </li>
            </ul>
          )}

          {resultados.length ? (
            <>
              <ul className="grade" aria-busy={!montado}>
                {visiveis.map(p => (
                  <li key={p.slug}>
                    <CardProduto produto={p} nivel={2} />
                  </li>
                ))}
              </ul>
              {limite < resultados.length && (
                <div ref={sentinela} className="grade__mais">
                  <Button variante="contorno" onClick={() => setLimite(l => l + LOTE)}>
                    {t.carregarMais}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="vazio">
              <Icone nome="busca" tamanho={40} />
              <h2>{t.vazioTitulo}</h2>
              <p>{t.vazioTexto}</p>
              <div className="vazio__acoes">
                <Button variante="contorno" onClick={() => aplicar(consultaVazia)}>
                  {t.limparFiltros}
                </Button>
                <Button href={whatsapp(destinoWhatsApp(vendedor), msgVazio)} externo icone="whatsapp" onClick={() => registrar('whatsapp_clicado', { dados: { origem: 'catalogo-vazio' } })}>
                  {t.vazioWhatsapp}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="painel-filtros" className={`painel-filtros${painel ? ' aberto' : ''}`} inert={!painel}>
        <div className="painel-filtros__veu" onClick={fecharPainel} aria-hidden="true" />
        <div className="painel-filtros__caixa" role="dialog" aria-modal="true" aria-labelledby="pf-titulo" data-lenis-prevent>
          <div className="painel-filtros__topo">
            <h2 id="pf-titulo">{t.filtros}</h2>
            <button type="button" className="orc__fechar" onClick={fecharPainel} aria-label={t.fecharFiltros}>
              <Icone nome="fechar" tamanho={24} />
            </button>
          </div>
          <div className="painel-filtros__corpo">
            <Filtros c={c} aplicar={aplicar} idBase="pf" />
          </div>
          <div className="painel-filtros__rodape">
            <Button variante="contorno" onClick={() => aplicar({ ...consultaVazia, q: c.q, ordem: c.ordem })} disabled={!nFiltros}>
              {t.limparFiltros}
            </Button>
            <Button onClick={fecharPainel}>{t.verResultados(resultados.length)}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
