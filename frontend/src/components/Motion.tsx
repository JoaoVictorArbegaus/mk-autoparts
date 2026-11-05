/* Origem: landing-pages/clientes/prime-padel-platform (mesmo pipeline), copiado e adaptado à MK Autoparts (cores pelo CSS/props). */
import type { ElementType, ReactNode } from 'react';
import { m, type Variants } from 'motion/react';

/** Curva e tempos do design system: curtos e discretos (320 ms, sobe 16 px). */
export const EASE = [0.2, 0.8, 0.2, 1] as const;
const VIEWPORT = { once: true, amount: 0.15, margin: '0px 0px -6% 0px' } as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE, delay: i * 0.07 } }),
};

/** Props de entrada para qualquer m.*: sobe uma vez ao entrar na tela, na ordem `i`. */
export const inView = (i = 0, amount: number = VIEWPORT.amount) => ({ variants: rise, initial: 'hidden', whileInView: 'show', viewport: { ...VIEWPORT, amount }, custom: i, 'data-reveal': '' }) as const;

type Tag = 'div' | 'p' | 'h2' | 'h3' | 'li' | 'figure' | 'span' | 'ul' | 'ol' | 'dl';

/**
 * Bloco que entra ao rolar. Abaixo da dobra apenas: o hero anima em CSS para não atrasar o LCP.
 * Sem JS, o <noscript> do index.html devolve a opacidade (data-reveal).
 */
/** `amount`: fração visível para entrar; 0 nos trilhos, para a ponta do cartão vizinho aparecer. */
export function Reveal({ as = 'div', i = 0, amount, className, id, children }: { as?: Tag; i?: number; amount?: number; className?: string; id?: string; children: ReactNode }) {
  const C = m[as] as ElementType;
  return (
    <C className={className} id={id} {...inView(i, amount)}>
      {children}
    </C>
  );
}
