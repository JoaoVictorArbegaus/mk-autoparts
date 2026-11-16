/*
 * Trilho horizontal que anda sozinho no celular, sem cartões repetidos: desliza devagar até o fim,
 * para um instante, volta deslizando ao início e recomeça (pedido do responsável: cada cartão aparece
 * uma vez; antes, as cópias da volta infinita apareciam ao arrastar).
 * Ao tocar/rolar/teclar no trilho a pessoa assume o controle de vez: o movimento para e o encaixe
 * volta a valer (revisão impeccable: o cartão não muda de lugar depois de uma interrupção). Só roda com
 * o trilho na tela e a aba visível; desligado no desktop (o trilho vira grade) e com movimento reduzido.
 */
import { useEffect, useRef } from 'react';

const PAUSA_NO_FIM = 1600;
const DURACAO_VOLTA = 900;

export function useAutoRolagem<T extends HTMLElement>(pxPorSegundo = 28) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const celular = window.matchMedia('(max-width: 767px)');
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let espera = 0;
    let ultimo = 0;
    let pos = el.scrollLeft;
    let visivel = false;
    let mexendo = false;

    const fim = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const pode = () => celular.matches && !reduzir.matches && !mexendo && visivel && !document.hidden;

    const quadro = (agora: number) => {
      raf = 0;
      if (!pode()) return;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
      ultimo = agora;
      const max = fim();
      if (max <= 0) return;
      pos = Math.min(max, pos + pxPorSegundo * dt);
      el.scrollLeft = pos;
      if (pos >= max - 0.5) {
        // Chegou ao fim: pausa, volta deslizando ao início e recomeça.
        espera = window.setTimeout(() => {
          espera = 0;
          if (!pode()) return;
          el.scrollTo({ left: 0, behavior: 'smooth' });
          espera = window.setTimeout(() => {
            espera = 0;
            pos = 0;
            ultimo = 0;
            if (pode()) raf = requestAnimationFrame(quadro);
          }, DURACAO_VOLTA);
        }, PAUSA_NO_FIM);
        return;
      }
      raf = requestAnimationFrame(quadro);
    };

    const ligar = () => {
      if (raf || espera || !pode()) {
        if (!pode()) el.style.scrollSnapType = '';
        return;
      }
      el.style.scrollSnapType = 'none';
      pos = el.scrollLeft;
      ultimo = 0;
      raf = requestAnimationFrame(quadro);
    };

    const desligar = () => {
      cancelAnimationFrame(raf);
      clearTimeout(espera);
      raf = 0;
      espera = 0;
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
