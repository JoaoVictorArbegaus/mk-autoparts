/*
 * Painel de métricas da DEMONSTRAÇÃO (RN-10, DEC-010): tela de trabalho clara, noindex, fora do menu.
 * Pré-renderizado só como estrutura: os números são calculados depois da montagem (RNF-15),
 * somando a base fictícia fixa aos eventos e carrinhos deste navegador.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORIGENS, type Origem } from '../content/demo-metricas';
import { listarProdutos, obterProduto } from '../content/catalogo';
import { textos } from '../content/site';
import { vendedores } from '../content/vendedores';
import { calcularMetricas, maisClicados, menosClicados, type Filtro, type Metricas } from '../rastreio/metricas';
import { apagarEventos, descarregar, lerEventos } from '../rastreio/eventos';
import { apagarCarrinhos, lerCarrinhos } from '../rastreio/carrinhos';
import { esquecerVendedor } from '../rastreio/vendedor';
import { useOrcamento } from '../orcamento/OrcamentoContext';
import { BarraParte, BarrasH, Funil, pct } from '../components/Graficos';
import { Icone } from '../components/Icons';
import { Button } from '../components/Button';

const SERIE_1 = '#1C4FD0';
const SERIE_2 = '#EB6834';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
const nomeOrigem = (o: Origem) => (o === 'direto' ? textos.painel.direto : vendedores.find(v => v.codigo === o)?.nome ?? o);
const nomeProduto = (slug: string) => obterProduto(slug)?.nome ?? slug;

export function Painel() {
  const t = textos.painel;
  const { definirVendedor } = useOrcamento();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [m, setM] = useState<Metricas | null>(null);
  const [aviso, setAviso] = useState('');
  const [copiado, setCopiado] = useState('');
  const slugs = useMemo(() => listarProdutos().map(p => p.slug), []);

  const recalcular = useCallback(() => {
    descarregar();
    setM(calcularMetricas(lerEventos(), lerCarrinhos(), filtro, slugs));
  }, [filtro, slugs]);

  useEffect(() => {
    recalcular();
    // Outra aba com o site aberto: o painel acompanha ao vivo.
    const aoMudar = (e: StorageEvent) => e.key?.startsWith('mk-') && recalcular();
    const aoVoltar = () => !document.hidden && recalcular();
    window.addEventListener('storage', aoMudar);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.removeEventListener('storage', aoMudar);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [recalcular]);

  const zerar = () => {
    if (!window.confirm(t.zerarConfirmar)) return;
    apagarEventos();
    apagarCarrinhos();
    esquecerVendedor();
    definirVendedor(undefined);
    recalcular();
    setAviso(t.zerado);
  };

  // Origem do endereço só depois da montagem (o HTML pré-renderizado mostra o caminho relativo).
  const [origem, setOrigem] = useState('');
  useEffect(() => setOrigem(window.location.origin), []);
  const copiar = async (codigo: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(codigo);
      window.setTimeout(() => setCopiado(''), 1600);
    } catch {
      /* sem permissão de área de transferência: o link continua visível para copiar à mão */
    }
  };

  const top = m ? maisClicados(m) : [];
  const baixo = m ? menosClicados(m) : [];

  return (
    <div className="painel">
      <div className="painel__faixa">
        <div className="contido painel__faixa-in">
          <div>
            <h1>{t.titulo}</h1>
            <p>{t.apoio}</p>
          </div>
          <p className="painel__selo">
            <Icone nome="relogio" tamanho={18} />
            {t.selo}
          </p>
        </div>
      </div>

      <div className="contido painel__corpo">
        <div className="painel__filtro">
          <label htmlFor="painel-vendedor">{t.filtro}</label>
          <select id="painel-vendedor" value={filtro} onChange={e => setFiltro(e.target.value as Filtro)}>
            <option value="todos">{t.todos}</option>
            {ORIGENS.map(o => (
              <option key={o} value={o}>
                {nomeOrigem(o)}
              </option>
            ))}
          </select>
          <p role="status" className="painel__aviso">
            {aviso}
          </p>
        </div>

        {!m ? (
          <p className="painel__carregando" aria-busy="true">
            {t.carregando}
          </p>
        ) : (
          <>
            <dl className="kpis">
              {[
                [t.visitas, fmt(m.visitas)],
                [t.cliques, fmt(m.cliques)],
                [t.adicionados, fmt(m.adicionados)],
                [t.finalizados, fmt(m.finalizados)],
                [t.naoFinalizados, fmt(m.naoFinalizados)],
                [t.taxaFinalizacao, pct(m.taxaFinalizacao)],
              ].map(([r, v]) => (
                <div key={r} className="kpi">
                  <dt>{r}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <div className="painel__grade">
              <section className="cartao">
                <BarrasH titulo={t.maisClicados} series={[{ chave: 'c', rotulo: t.cliques, cor: SERIE_1 }]} linhas={top.map(p => ({ rotulo: nomeProduto(p.slug), valores: [p.cliques] }))} />
              </section>
              <section className="cartao">
                <BarrasH
                  titulo={t.cliquesAdicionados}
                  series={[
                    { chave: 'c', rotulo: t.cliques, cor: SERIE_1 },
                    { chave: 'a', rotulo: t.adicionados, cor: SERIE_2 },
                  ]}
                  linhas={top.slice(0, 6).map(p => ({ rotulo: nomeProduto(p.slug), valores: [p.cliques, p.adicionados], extra: `${t.taxa} ${pct(p.taxa)}` }))}
                />
              </section>
              <section className="cartao">
                <BarraParte
                  titulo={t.carrinhos}
                  partes={[
                    { rotulo: t.finalizados, valor: m.finalizados, cor: SERIE_1 },
                    { rotulo: t.naoFinalizados, valor: m.naoFinalizados, cor: SERIE_2 },
                  ]}
                />
                <h2 className="graf__titulo painel__sub">{t.menosClicados}</h2>
                <ol className="menos">
                  {baixo.map(p => (
                    <li key={p.slug}>
                      <span>{nomeProduto(p.slug)}</span>
                      <strong>{fmt(p.cliques)}</strong>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="cartao">
                <Funil etapas={t.funilEtapas} valores={m.funil} cor={SERIE_1} />
              </section>
            </div>

            <section className="cartao cartao--larga" aria-labelledby="tab-vend">
              <h2 id="tab-vend" className="graf__titulo">
                {t.porVendedor}
              </h2>
              <table className="tabela tabela--num">
                <thead>
                  <tr>
                    <th scope="col">{t.filtro}</th>
                    <th scope="col">{t.visitas}</th>
                    <th scope="col">{t.cliques}</th>
                    <th scope="col">{t.adicionados}</th>
                    <th scope="col">{t.finalizados}</th>
                    <th scope="col">{t.naoFinalizados}</th>
                  </tr>
                </thead>
                <tbody>
                  {m.vendedores
                    .filter(v => filtro === 'todos' || v.origem === filtro)
                    .map(v => (
                      <tr key={v.origem}>
                        <th scope="row" data-rotulo={t.filtro}>
                          {nomeOrigem(v.origem)}
                        </th>
                        <td data-rotulo={t.visitas}>{fmt(v.visitas)}</td>
                        <td data-rotulo={t.cliques}>{fmt(v.cliques)}</td>
                        <td data-rotulo={t.adicionados}>{fmt(v.adicionados)}</td>
                        <td data-rotulo={t.finalizados}>{fmt(v.finalizados)}</td>
                        <td data-rotulo={t.naoFinalizados}>{fmt(v.naoFinalizados)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        <section className="cartao cartao--larga painel__links" aria-labelledby="links-teste">
          <h2 id="links-teste" className="graf__titulo">
            {t.linksTeste}
          </h2>
          <ul>
            {vendedores.map(v => {
              const url = `${origem}/?v=${v.codigo}`;
              return (
                <li key={v.codigo}>
                  <span className="painel__vend">{v.nome}</span>
                  <a href={`/?v=${v.codigo}`}>{url}</a>
                  <button type="button" className="link-acao" onClick={() => copiar(v.codigo, url)}>
                    <Icone nome={copiado === v.codigo ? 'check' : 'copiar'} tamanho={18} />
                    {copiado === v.codigo ? t.copiado : t.copiar}
                  </button>
                </li>
              );
            })}
          </ul>
          <Button variante="contorno" icone="lixeira" onClick={zerar}>
            {t.zerar}
          </Button>
        </section>
      </div>
    </div>
  );
}
