/* Origem: landing-pages/clientes/prime-padel-platform (mesmo pipeline), copiado e adaptado à MK Autoparts (cores pelo CSS/props). */
/*
 * DotField: adaptado do kokonutui — Dot Field (https://kokonutui.com, @dorianbaffier, licença MIT).
 * Um meio-tom de pontos que respira devagar, sozinho.
 * Mudanças: vira uma camada decorativa (canvas dentro da seção), sem Tailwind nem `cn`, sem conteúdo padrão; cor
 * vinda do CSS (`color` do canvas), sem o relógio de troca de tema; DPR até 1,5; parado (um quadro) com movimento
 * reduzido. Sem a interação com o mouse (a membrana e a onda do clique) para não pesar. Cada tamanho de ponto vira
 * um sprite pré-desenhado e, a cada passo do tom, só os pontos que mudaram de tamanho são redesenhados.
 */
import { useEffect, useRef } from 'react';

const NOISE_SCALE = 240;
const NOISE_SPEED = 0.07;
const TONE_STEP = 3;
/** O tom muda devagar: 12 passos por segundo bastam. */
const TONE_FRAME_MS = 80;
const BUCKETS = 10;

type Sprite = { image: HTMLCanvasElement; half: number };
type Field = {
  cols: number;
  rows: number;
  spacing: number;
  originX: number;
  originY: number;
  tone: Float32Array;
  coarse: Float32Array;
  /** Tamanho desenhado em cada célula (-1 = precisa redesenhar). */
  drawn: Int8Array;
};

/** Ruído de gradiente 3D com semente (improved noise de Ken Perlin), de -1 a 1. */
function createNoise(seed: number) {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let state = seed >>> 0 || 1;
  const random = () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const fz = z - Math.floor(z);
    const u = fade(fx);
    const v = fade(fy);
    const w = fade(fz);
    const A = perm[X] + Y;
    const AA = perm[A] + Z;
    const AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y;
    const BA = perm[B] + Z;
    const BB = perm[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(perm[AA], fx, fy, fz), grad(perm[BA], fx - 1, fy, fz), u), lerp(grad(perm[AB], fx, fy - 1, fz), grad(perm[BB], fx - 1, fy - 1, fz), u), v),
      lerp(
        lerp(grad(perm[AA + 1], fx, fy, fz - 1), grad(perm[BA + 1], fx - 1, fy, fz - 1), u),
        lerp(grad(perm[AB + 1], fx, fy - 1, fz - 1), grad(perm[BB + 1], fx - 1, fy - 1, fz - 1), u),
        v,
      ),
      w,
    );
  };
}

function createField(width: number, height: number, spacing: number): Field {
  const cols = Math.ceil(width / spacing) + 3;
  const rows = Math.ceil(height / spacing) + 3;
  const size = cols * rows;
  return {
    cols,
    rows,
    spacing,
    originX: (width - (cols - 1) * spacing) / 2,
    originY: (height - (rows - 1) * spacing) / 2,
    tone: new Float32Array(size),
    coarse: new Float32Array((Math.ceil((cols - 1) / TONE_STEP) + 1) * (Math.ceil((rows - 1) / TONE_STEP) + 1)),
    drawn: new Int8Array(size).fill(-1),
  };
}

/** O meio-tom parado: o ruído é amostrado a cada 3 pontos e interpolado no meio. */
function sampleTone(field: Field, noise: ReturnType<typeof createNoise>, time: number) {
  const { cols, rows, spacing, originX, originY, tone, coarse } = field;
  const z = time * NOISE_SPEED;
  const step = spacing * TONE_STEP;
  const cc = Math.ceil((cols - 1) / TONE_STEP) + 1;
  const cr = Math.ceil((rows - 1) / TONE_STEP) + 1;
  for (let j = 0; j < cr; j++) {
    const ny = (originY + j * step) / NOISE_SCALE;
    for (let i = 0; i < cc; i++) {
      const nx = (originX + i * step) / NOISE_SCALE;
      const n = noise(nx, ny, z) * 0.75 + noise(nx * 2.1 + 9.3, ny * 2.1 + 3.7, z * 1.3) * 0.25;
      coarse[j * cc + i] = Math.min(1, Math.max(0, 0.5 + n * 1.1));
    }
  }
  for (let j = 0; j < rows; j++) {
    const cj = Math.min(Math.floor(j / TONE_STEP), cr - 2);
    const fy = j / TONE_STEP - cj;
    for (let i = 0; i < cols; i++) {
      const ci = Math.min(Math.floor(i / TONE_STEP), cc - 2);
      const fx = i / TONE_STEP - ci;
      const a = cj * cc + ci;
      const top = coarse[a] + (coarse[a + 1] - coarse[a]) * fx;
      const bottom = coarse[a + cc] + (coarse[a + cc + 1] - coarse[a + cc]) * fx;
      tone[j * cols + i] = top + (bottom - top) * fy;
    }
  }
}

function bucketOf(amount: number) {
  return Math.round(Math.min(1, Math.max(0, amount)) * (BUCKETS - 1));
}

/** Um sprite por tamanho (com a opacidade embutida): carimbar é bem mais barato que rasterizar milhares de arcos. */
function makeSprites(spacing: number, dpr: number, color: string): (Sprite | null)[] {
  const maxRadius = spacing * 0.42;
  return Array.from({ length: BUCKETS }, (_, b) => {
    if (b === 0) return null;
    const radius = (maxRadius * b) / (BUCKETS - 1);
    const px = Math.ceil((radius * 2 + 2) * dpr);
    const image = document.createElement('canvas');
    image.width = px;
    image.height = px;
    const c = image.getContext('2d');
    if (c) {
      c.fillStyle = color;
      c.globalAlpha = 0.2 + (0.32 * b) / (BUCKETS - 1);
      c.beginPath();
      c.arc(px / 2, px / 2, radius * dpr, 0, Math.PI * 2);
      c.fill();
    }
    return { image, half: px / dpr / 2 };
  });
}

/** Só os pontos que mudaram de tamanho: limpa a célula e carimba de novo. */
function drawChanged(ctx: CanvasRenderingContext2D, field: Field, sprites: (Sprite | null)[], dpr: number) {
  const { cols, rows, spacing, originX, originY, tone, drawn } = field;
  const halfCell = spacing / 2;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const bucket = bucketOf(0.12 + 0.6 * tone[k]);
      if (drawn[k] === bucket) continue;
      drawn[k] = bucket;
      const x = originX + i * spacing;
      const y = originY + j * spacing;
      ctx.clearRect(x - halfCell, y - halfCell, spacing, spacing);
      const sprite = sprites[bucket];
      if (sprite) ctx.drawImage(sprite.image, Math.round((x - sprite.half) * dpr) / dpr, Math.round((y - sprite.half) * dpr) / dpr, sprite.half * 2, sprite.half * 2);
    }
  }
}

/** Camada de pontos para o fundo de uma seção. A cor vem do CSS (`color` do canvas). */
export function DotField({ spacing = 16, seed = 7, className }: { spacing?: number; seed?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noise = createNoise(seed);
    const gap = Math.max(6, spacing);
    let dpr = 1;
    let field = createField(0, 0, gap);
    let sprites: (Sprite | null)[] = [];
    let time = 0;
    let last = 0;
    let timer = 0;
    let visible = true;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sprites = makeSprites(gap, dpr, getComputedStyle(canvas).color);
      field = createField(box.width, box.height, gap);
      sampleTone(field, noise, time);
      ctx.clearRect(0, 0, box.width, box.height);
      drawChanged(ctx, field, sprites, dpr);
    };

    // um passo a cada TONE_FRAME_MS (sem requestAnimationFrame a 60 quadros para algo que muda devagar)
    const step = () => {
      timer = 0;
      if (!visible) return;
      const now = performance.now();
      time += last ? Math.min((now - last) / 1000, 0.25) : 0;
      last = now;
      sampleTone(field, noise, time);
      drawChanged(ctx, field, sprites, dpr);
      timer = window.setTimeout(step, TONE_FRAME_MS);
    };

    const start = () => {
      if (!timer && visible && !reduce) {
        last = 0;
        timer = window.setTimeout(step, TONE_FRAME_MS);
      }
    };

    resize();
    canvas.classList.add('is-ready');
    start();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    let onScreen = true;
    const updateVisible = () => {
      visible = onScreen && document.visibilityState === 'visible';
      if (visible) start();
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      updateVisible();
    });
    io.observe(host);
    document.addEventListener('visibilitychange', updateVisible);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', updateVisible);
    };
  }, [spacing, seed]);

  return <canvas ref={canvasRef} className={['bg-layer', className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
