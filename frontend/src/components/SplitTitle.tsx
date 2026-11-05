/*
 * SplitTitle: adaptado de React Bits — SplitText (https://reactbits.dev, licença MIT).
 * Copiado de landing-pages/clientes/prime-padel-platform e mantido como está; na MK Autoparts o
 * destaque (`accent`) não é usado.
 * O título entra palavra por palavra: cada palavra sobe de dentro de uma máscara, uma vez, ao entrar na tela.
 * Mudanças: Motion (`m.*` em LazyMotion) no lugar do GSAP/SplitText; divisão feita no React (sem medir o DOM,
 * então o HTML pré-renderizado e a hidratação são idênticos); o espaço entre palavras fica fora do
 * `inline-block` (senão as palavras grudam); as palavras de destaque recebem `.hl` (amarelo da bola no escuro,
 * marca-texto no claro). Sem JS ou com movimento reduzido, `[data-reveal]` deixa tudo visível.
 */
import { Fragment, type ElementType } from 'react';
import { m, type Variants } from 'motion/react';
import { EASE } from './Motion';

const rise: Variants = {
  hidden: { y: '108%' },
  show: (i: number) => ({ y: 0, transition: { duration: 0.6, ease: EASE, delay: i * 0.06 } }),
};

type Props = {
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
  /** Texto comum. */
  lead: string;
  /** Palavras de destaque, depois do texto comum. */
  accent?: string;
};

export function SplitTitle({ as = 'h2', id, className, lead, accent }: Props) {
  const Tag = m[as] as ElementType;
  const leadWords = lead.split(' ').filter(Boolean);
  const accentWords = accent ? accent.split(' ').filter(Boolean) : [];
  const word = (w: string, i: number, space: boolean) => (
    <Fragment key={i}>
      {space && ' '}
      <span className="split__mask">
        <m.span className="split__word" variants={rise} custom={i} data-reveal="">
          {w}
        </m.span>
      </span>
    </Fragment>
  );
  return (
    <Tag className={['split', className].filter(Boolean).join(' ')} id={id} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
      {leadWords.map((w, i) => word(w, i, i > 0))}
      {accentWords.length > 0 && (
        <>
          {leadWords.length > 0 && ' '}
          {/* Um só destaque para todas as palavras (o marca-texto do claro fica contínuo). */}
          <span className="hl">{accentWords.map((w, j) => word(w, leadWords.length + j, j > 0))}</span>
        </>
      )}
    </Tag>
  );
}
