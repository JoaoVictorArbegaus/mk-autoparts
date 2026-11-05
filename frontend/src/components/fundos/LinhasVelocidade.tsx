/*
 * LinhasVelocidade: fundo próprio da MK Autoparts (canvas 2D, sem biblioteca).
 * Riscos de luz que atravessam a seção inclinados a 12°, o ângulo do itálico do lettering da marca,
 * como faróis passando na estrada. Movem-se sozinhos (sem reação ao mouse), ~24 quadros por segundo,
 * DPR ≤ 1,5, pausam fora da tela e com a aba oculta; com movimento reduzido fica um quadro parado.
 * A cor vem do CSS (`color` do canvas); o segundo tom, de `--linha-2`.
 */
import { useEffect, useRef } from 'react';

const FRAME_MS = 42;
const ANGULO = (-12 * Math.PI) / 180;

type Risco = { x: number; y: number; comp: number; vel: number; esp: number; alfa: number; tom: 0 | 1 };

export function LinhasVelocidade({ densidade = 1, velocidade = 1, className }: { densidade?: number; velocidade?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 1, h = 1, dpr = 1;
    let riscos: Risco[] = [];
    let cor1 = '#3D7EFF', cor2 = '#D9DEE5';
    let timer = 0, ultimo = 0, naTela = true;
    const cos = Math.cos(ANGULO), sin = Math.sin(ANGULO);
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // A seção é percorrida num sistema girado: x ao longo do risco, y atravessado.
    const span = () => w * cos + h * Math.abs(sin) + 400;
    const novo = (qualquer: boolean): Risco => ({
      x: qualquer ? rnd(-300, span()) : rnd(-600, -200),
      y: rnd(-h * 0.3, h * 1.25),
      comp: rnd(70, 280),
      vel: rnd(60, 220),
      esp: Math.random() < 0.15 ? 2 : 1,
      alfa: rnd(0.18, 0.6),
      tom: Math.random() < 0.7 ? 0 : 1,
    });

    const semear = () => {
      const n = Math.min(70, Math.round(((w * h) / 22000) * densidade));
      riscos = Array.from({ length: n }, () => novo(true));
    };

    const desenhar = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(0, h * 0.15);
      ctx.rotate(ANGULO);
      for (const r of riscos) {
        const g = ctx.createLinearGradient(r.x, 0, r.x + r.comp, 0);
        const cor = r.tom ? cor2 : cor1;
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.85, cor);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = r.alfa;
        ctx.fillStyle = g;
        ctx.fillRect(r.x, r.y, r.comp, r.esp);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const redimensionar = () => {
      const box = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, box.width);
      h = Math.max(1, box.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const estilo = getComputedStyle(canvas);
      cor1 = estilo.color || cor1;
      cor2 = estilo.getPropertyValue('--linha-2').trim() || cor2;
      semear();
      desenhar();
    };

    const passo = () => {
      timer = 0;
      if (!naTela || document.hidden) return;
      const agora = performance.now();
      const dt = ultimo ? Math.min((agora - ultimo) / 1000, 0.1) : FRAME_MS / 1000;
      ultimo = agora;
      const limite = span();
      for (let i = 0; i < riscos.length; i++) {
        const r = riscos[i];
        r.x += r.vel * velocidade * dt;
        if (r.x > limite) riscos[i] = novo(false);
      }
      desenhar();
      timer = window.setTimeout(passo, FRAME_MS);
    };

    const iniciar = () => {
      if (reduzir || timer || !naTela || document.hidden) return;
      ultimo = 0;
      timer = window.setTimeout(passo, FRAME_MS);
    };

    redimensionar();
    canvas.classList.add('is-ready');
    const ro = new ResizeObserver(redimensionar);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      naTela = e.isIntersecting;
      iniciar();
    });
    io.observe(host);
    document.addEventListener('visibilitychange', iniciar);
    iniciar();
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', iniciar);
    };
  }, [densidade, velocidade]);

  return <canvas ref={ref} className={['bg-layer', className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
