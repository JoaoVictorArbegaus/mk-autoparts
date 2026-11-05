/*
 * Gráficos do painel em SVG próprio (skill dataviz, sem biblioteca): barras horizontais finas com
 * ponta arredondada ancorada na base, 2 px de respiro entre barras, rótulos diretos seletivos,
 * dica no hover (alvo = a linha inteira; os valores já estão rotulados na barra), legenda sempre presente com 2 séries e
 * tabela equivalente para leitores de tela. Paleta validada (validate_palette.js, modo claro):
 * série 1 #1C4FD0, série 2 #EB6834 — CVD ΔE 29,6, contraste ≥ 3:1.
 */
import { useId, useState, type ReactNode } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
export const pct = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(n);

type Dica = { x: number; y: number; conteudo: ReactNode } | null;

function useDica() {
  const [dica, setDica] = useState<Dica>(null);
  const mostrar = (e: { currentTarget: Element }, conteudo: ReactNode) => {
    const alvo = e.currentTarget.getBoundingClientRect();
    const caixa = (e.currentTarget.closest('.graf') as HTMLElement).getBoundingClientRect();
    setDica({ x: alvo.left - caixa.left + Math.min(alvo.width, 280) / 2, y: alvo.top - caixa.top, conteudo });
  };
  const el = dica && (
    <div className="graf__dica" style={{ left: dica.x, top: dica.y }} role="presentation">
      {dica.conteudo}
    </div>
  );
  return { mostrar, esconder: () => setDica(null), el };
}

export type Serie = { chave: string; rotulo: string; cor: string };
export type Linha = { rotulo: string; valores: number[]; extra?: string };

/**
 * Barras horizontais (uma ou duas séries agrupadas), mesma escala para todas (um eixo só).
 * Rótulos em HTML (legíveis em qualquer largura); cada barra é um SVG com largura em %.
 */
export function BarrasH({ linhas, series, titulo }: { linhas: Linha[]; series: Serie[]; titulo: string }) {
  const id = useId();
  const { mostrar, esconder, el } = useDica();
  const max = Math.max(1, ...linhas.flatMap(l => l.valores));
  const alt = series.length > 1 ? 10 : 14;
  return (
    <figure className="graf" aria-labelledby={`${id}-t`}>
      <figcaption id={`${id}-t`} className="graf__titulo">
        {titulo}
      </figcaption>
      {series.length > 1 && (
        <ul className="graf__legenda" aria-hidden="true">
          {series.map(s => (
            <li key={s.chave}>
              <span style={{ background: s.cor }} />
              {s.rotulo}
            </li>
          ))}
        </ul>
      )}
      <div className="graf__linhas" aria-hidden="true">
        {linhas.map((l, i) => {
          const texto = (
            <>
              <strong>{l.rotulo}</strong>
              {series.map((s, k) => (
                <span key={s.chave}>
                  <i style={{ background: s.cor }} />
                  {s.rotulo}: {fmt(l.valores[k])}
                </span>
              ))}
              {l.extra && <span>{l.extra}</span>}
            </>
          );
          return (
            <div key={l.rotulo + i} className="graf__linha" onPointerEnter={e => mostrar(e, texto)} onPointerLeave={esconder}>
              <p className="graf__rot">
                {l.rotulo}
                {l.extra && <span className="graf__extra">{` · ${l.extra}`}</span>}
              </p>
              {series.map((s, k) => {
                const w = Math.max(0.6, (l.valores[k] / max) * 100);
                return (
                  <div key={s.chave} className="graf__barra">
                    <svg width="100%" height={alt} focusable="false">
                      <rect x="0" y="0" width={`${w}%`} height={alt} rx="4" fill={s.cor} />
                      <rect x="0" y="0" width={Math.min(6, alt)} height={alt} fill={s.cor} />
                    </svg>
                    <span className="graf__val">{fmt(l.valores[k])}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {el}
      <div className="sr-only">
        <table>
          <caption>{titulo}</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              {series.map(s => (
                <th key={s.chave} scope="col">
                  {s.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i}>
                <th scope="row">{l.rotulo}</th>
                {l.valores.map((v, k) => (
                  <td key={k}>{fmt(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Barra única empilhada (parte de um todo), com 2 px de respiro entre os segmentos e rótulos na legenda. */
export function BarraParte({ partes, titulo }: { partes: { rotulo: string; valor: number; cor: string }[]; titulo: string }) {
  const id = useId();
  const total = Math.max(1, partes.reduce((s, p) => s + p.valor, 0));
  let x = 0;
  return (
    <figure className="graf" aria-labelledby={`${id}-t`}>
      <figcaption id={`${id}-t`} className="graf__titulo">
        {titulo}
      </figcaption>
      <ul className="graf__legenda">
        {partes.map(p => (
          <li key={p.rotulo}>
            <span style={{ background: p.cor }} aria-hidden="true" />
            {p.rotulo}: <strong>{fmt(p.valor)}</strong> ({pct(p.valor / total)})
          </li>
        ))}
      </ul>
      <svg width="100%" height="28" aria-hidden="true" focusable="false">
        {partes.map((p, i) => {
          const w = (p.valor / total) * 100;
          // O contorno branco de 2 px abre o respiro entre os segmentos.
          const r = <rect key={p.rotulo} x={`${x}%`} y={1} width={`${w}%`} height={26} rx={4} fill={p.cor} stroke="#fff" strokeWidth={i ? 2 : 0} />;
          x += w;
          return r;
        })}
      </svg>
    </figure>
  );
}

export function Funil({ etapas, valores, cor }: { etapas: string[]; valores: number[]; cor: string }) {
  return (
    <BarrasH
      titulo="Funil: visita → clique → carrinho → finalizado"
      series={[{ chave: 'v', rotulo: 'Quantidade', cor }]}
      linhas={etapas.map((e, i) => ({ rotulo: e, valores: [valores[i]], extra: i ? `${pct(valores[i] / Math.max(1, valores[i - 1]))} da etapa anterior` : undefined }))}
    />
  );
}
