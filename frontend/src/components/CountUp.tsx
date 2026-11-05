/* Origem: landing-pages/clientes/prime-padel-platform (mesmo pipeline), copiado e adaptado à MK Autoparts (cores pelo CSS/props). */
/*
 * CountUp: adaptado de React Bits — CountUp (https://reactbits.dev, licença MIT).
 * Conta de 0 até o número ao entrar na tela, escrevendo direto no texto (sem re-render a cada quadro).
 * Mudanças: TypeScript; só o modo "count" (sem o odômetro); o HTML pré-renderizado já traz o valor final,
 * e o zero só é posto no cliente quando o número ainda está fora da tela (nada pisca para quem já o vê);
 * leitores de tela ouvem só o valor final; com movimento reduzido o número fica parado. Use só com números reais.
 */
import { useEffect, useRef } from 'react';
import { animate, useInView } from 'motion/react';

export function CountUp({ to, duration = 1.4, className }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useRef(false);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.textContent = '0';
    armed.current = true;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!inView || !armed.current || !el) return;
    armed.current = false;
    const controls = animate(0, to, {
      duration,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => {
      controls.stop();
      el.textContent = String(to);
    };
  }, [inView, to, duration]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {to}
      </span>
      <span className="sr-only">{to}</span>
    </span>
  );
}
