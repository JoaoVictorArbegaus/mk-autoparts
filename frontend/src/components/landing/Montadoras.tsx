/*
 * Faixa das marcas de veículo (nomes em texto, sem logos de terceiros — PEND-007), em marquee lento
 * que pausa no hover e no foco (sem botão de pausa, a pedido do responsável). A cópia que fecha o laço é decorativa (aria-hidden, fora do Tab).
 * Com movimento reduzido fica parada e quebra em linhas. Sem quantidade de peças (RN-14).
 */
import { Link } from '../../router';
import { contarPorMontadora, listarMontadoras } from '../../content/catalogo';
import { textos } from '../../content/site';
import { Emenda } from '../Emenda';
import { BuscaVeiculo } from './BuscaVeiculo';

export function Montadoras() {
  const t = textos.montadoras;
  const marcas = listarMontadoras().map(m => ({ ...m, n: contarPorMontadora(m.slug) })).filter(m => m.n > 0);
  const item = (m: (typeof marcas)[number], copia: boolean) => (
    <li key={`${copia ? 'c' : 'o'}-${m.slug}`}>
      <Link href={`/catalogo?montadora=${m.slug}`} tabIndex={copia ? -1 : undefined}>
        <span className="marcas__nome">{m.nome}</span>
      </Link>
    </li>
  );
  return (
    <section className="sec sec--navy-3 marcas" aria-labelledby="marcas-titulo">
      <div className="contido marcas__topo">
        <h2 id="marcas-titulo" className="marcas__titulo">
          {t.titulo}
        </h2>
      </div>
      <div className="marcas__trilho">
        <ul className="marcas__lista">{marcas.map(m => item(m, false))}</ul>
        <ul className="marcas__lista marcas__copia" aria-hidden="true">
          {marcas.map(m => item(m, true))}
        </ul>
      </div>
      {/* M1: busca direta por marca, modelo e ano. */}
      <BuscaVeiculo />
      <Emenda para="paper" />
    </section>
  );
}
