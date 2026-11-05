/*
 * Faixa das marcas de veículo (nomes em texto, sem logos de terceiros — PEND-007), em marquee lento
 * pausável por botão, hover e foco. A cópia que fecha o laço é decorativa (aria-hidden, fora do Tab).
 * Com movimento reduzido fica parada e quebra em linhas.
 */
import { useState } from 'react';
import { Link } from '../../router';
import { contarPorMontadora, listarMontadoras } from '../../content/catalogo';
import { textos } from '../../content/site';
import { Icone } from '../Icons';
import { Emenda } from '../Emenda';

export function Montadoras() {
  const [pausado, setPausado] = useState(false);
  const t = textos.montadoras;
  const marcas = listarMontadoras().map(m => ({ ...m, n: contarPorMontadora(m.slug) })).filter(m => m.n > 0);
  const item = (m: (typeof marcas)[number], copia: boolean) => (
    <li key={`${copia ? 'c' : 'o'}-${m.slug}`}>
      <Link href={`/catalogo?montadora=${m.slug}`} tabIndex={copia ? -1 : undefined}>
        <span className="marcas__nome">{m.nome}</span>
        <span className="marcas__n">{t.pecas(m.n)}</span>
      </Link>
    </li>
  );
  return (
    <section className={`sec sec--navy-3 marcas${pausado ? ' marcas--pausado' : ''}`} aria-labelledby="marcas-titulo">
      <div className="contido marcas__topo">
        <h2 id="marcas-titulo" className="marcas__titulo">
          {t.titulo}
        </h2>
        <button type="button" className="marcas__pausa" onClick={() => setPausado(p => !p)} aria-pressed={pausado} aria-label={pausado ? t.continuar : t.pausar}>
          <Icone nome={pausado ? 'play' : 'pausa'} tamanho={18} />
        </button>
      </div>
      <div className="marcas__trilho">
        <ul className="marcas__lista">{marcas.map(m => item(m, false))}</ul>
        <ul className="marcas__lista marcas__copia" aria-hidden="true">
          {marcas.map(m => item(m, true))}
        </ul>
      </div>
      <Emenda para="paper" />
    </section>
  );
}
