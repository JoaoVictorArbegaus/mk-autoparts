/*
 * Emenda entre seções: corte inclinado (subindo para a direita, como o itálico de 12° do lettering MK),
 * pintado com a cor da seção seguinte, com um filete azul vivo na borda e um brilho que corre devagar
 * ao longo dele (reflexo de farol). Sem brilho com movimento reduzido. Substitui a onda (pedido do
 * responsável humano: a onda remetia a limpeza, não à marca).
 */
import type { CSSProperties } from 'react';

export type Tom = 'navy' | 'navy-3' | 'paper';

export function Emenda({ para, topo = false }: { para: Tom; topo?: boolean }) {
  return (
    <div className={`emenda${topo ? ' emenda--topo' : ''}`} style={{ '--emenda': `var(--sup-${para})` } as CSSProperties} aria-hidden="true">
      <span className="emenda__fundo" />
      <span className="emenda__filete" />
    </div>
  );
}
