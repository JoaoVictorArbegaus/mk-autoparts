/*
 * Mola do menu do celular: adaptada do CardNav (React Bits, licença MIT) via Prime Padel (mesmo pipeline).
 * Um único progresso p (0 fechado, 1 aberto) dirige a altura do painel e a entrada dos cartões, um depois
 * do outro. Sem GSAP: mola própria num requestAnimationFrame. Movimento reduzido: abre e fecha direto.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const STAGGER = 0.12;
const BOUNCE = 0.2;

export function useMolaMenu(aberto: boolean, aoFechar: () => void) {
  const painel = useRef<HTMLDivElement>(null);
  const conteudo = useRef<HTMLDivElement>(null);
  const cartoes = useRef<(HTMLElement | null)[]>([]);
  const alvo = useRef(aberto);
  const motor = useRef<{ acordar: () => void; medir: () => void } | null>(null);
  const fechou = useRef(aoFechar);
  fechou.current = aoFechar;

  useEffect(() => {
    const p = painel.current;
    const c = conteudo.current;
    if (!p || !c) return;
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const estado = { p: alvo.current ? 1 : 0, v: 0, altura: c.offsetHeight };
    let raf = 0;
    let ultimo = 0;

    const pintar = () => {
      p.style.height = `${Math.max(0, estado.p) * estado.altura}px`;
      const lista = cartoes.current.filter(Boolean) as HTMLElement[];
      const atraso = lista.length > 1 ? Math.min(STAGGER, 0.7 / (lista.length - 1)) : 0;
      const vao = 1 - atraso * (lista.length - 1);
      lista.forEach((el, i) => {
        const local = clamp((estado.p - i * atraso) / Math.max(vao, 0.05), 0, 1);
        const e = easeOut(local);
        el.style.transform = `translateY(${(1 - e) * 26}px) scale(${0.97 + 0.03 * e})`;
        el.style.opacity = `${e}`;
      });
    };

    const passo = (agora: number) => {
      raf = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      const destino = alvo.current ? 1 : 0;
      if (reduzir) {
        estado.p = destino;
        estado.v = 0;
      } else {
        const k = 160;
        const zeta = destino ? 1 - 0.68 * BOUNCE : 1;
        const n = Math.ceil(dt / (1 / 240));
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          estado.v += (-k * (estado.p - destino) - 2 * zeta * Math.sqrt(k) * estado.v) * h;
          estado.p += estado.v * h;
        }
      }
      const pronto = Math.abs(estado.p - destino) < 0.0005 && Math.abs(estado.v) < 0.002;
      if (pronto) {
        estado.p = destino;
        estado.v = 0;
      }
      pintar();
      if (pronto && destino === 0) fechou.current();
      if (!pronto) raf = requestAnimationFrame(passo);
    };

    motor.current = {
      acordar: () => {
        if (raf) return;
        ultimo = 0;
        raf = requestAnimationFrame(passo);
      },
      medir: () => {
        estado.altura = c.offsetHeight;
        pintar();
      },
    };
    pintar();
    const ro = new ResizeObserver(() => motor.current?.medir());
    ro.observe(c);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      motor.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    alvo.current = aberto;
    motor.current?.medir();
    motor.current?.acordar();
  }, [aberto]);

  return { painel, conteudo, cartoes };
}
