/*
 * Trilho horizontal em movimento contínuo no celular, como a faixa de marcas: desliza devagar sem parar
 * e dá a volta sem emenda (os cartões são repetidos uma vez no JSX, com a classe `trilho-copia`).
 * Ao tocar/rolar/teclar no trilho a pessoa assume o controle de vez: o movimento para e o encaixe
 * volta a valer (revisão impeccable: o cartão não muda de lugar depois de uma interrupção). Só roda com o trilho na tela e
 * a aba visível; desligado no desktop (o trilho vira grade) e com movimento reduzido.
 */
import { useEffect, useRef } from 'react';

export function useAutoRolagem<T extends HTMLElement>(pxPorSegundo = 28) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const celular = window.matchMedia('(max-width: 767px)');
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let ultimo = 0;
    let pos = el.scrollLeft;
    let visivel = false;
    let mexendo = false;

    // Largura de uma volta: distância entre o primeiro cartão e a sua primeira cópia.
    const volta = () => {
      const copia = el.querySelector<HTMLElement>(':scope > .trilho-copia');
      const primeiro = el.firstElementChild as HTMLElement | null;
      return copia && primeiro ? copia.offsetLeft - primeiro.offsetLeft : 0;
    };

    const pode = () => celular.matches && !reduzir.matches && !mexendo && visivel && !document.hidden;

    const quadro = (agora: number) => {
      raf = 0;
      if (!pode()) return;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
      ultimo = agora;
      const w = volta();
      pos += pxPorSegundo * dt;
      if (w > 0 && pos >= w) pos -= w;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(quadro);
    };

    const ligar = () => {
      if (raf || !pode()) {
        if (!pode()) el.style.scrollSnapType = '';
        return;
      }
      el.style.scrollSnapType = 'none';
      const w = volta();
      pos = w > 0 ? el.scrollLeft % w : el.scrollLeft;
      ultimo = 0;
      raf = requestAnimationFrame(quadro);
    };

    const desligar = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      el.style.scrollSnapType = '';
    };

    const assumir = () => {
      mexendo = true;
      desligar();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visivel = e.isIntersecting;
        if (visivel) ligar();
        else desligar();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    const eventos = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    eventos.forEach(ev => el.addEventListener(ev, assumir, { passive: true }));
    const aba = () => (document.hidden ? desligar() : ligar());
    document.addEventListener('visibilitychange', aba);
    celular.addEventListener('change', aba);

    return () => {
      desligar();
      io.disconnect();
      eventos.forEach(ev => el.removeEventListener(ev, assumir));
      document.removeEventListener('visibilitychange', aba);
      celular.removeEventListener('change', aba);
    };
  }, [pxPorSegundo]);

  return ref;
}
