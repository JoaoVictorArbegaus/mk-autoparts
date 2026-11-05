/* Origem: landing-pages/clientes/prime-padel-platform (mesmo pipeline), copiado e adaptado à MK Autoparts (cores pelo CSS/props). */
/*
 * Aurora: adaptado de React Bits — Aurora (https://reactbits.dev, licença MIT).
 * Uma cortina de luz que ondula devagar, sozinha.
 * Mudanças: TypeScript; vira uma camada decorativa (o canvas ocupa o pai), sem contêiner próprio; paleta da marca
 * (passadas por props; na MK, azuis da marca); sem a interação com o mouse; como a luz é toda difusa, desenha em meia
 * resolução (o CSS estica o canvas) e a ~30 quadros por segundo, para não pesar na GPU; pausa fora da tela e
 * com a aba oculta; com movimento reduzido desenha um quadro parado e não anima; no desmonte apaga programa e
 * buffers mas não chama `loseContext` (no StrictMode o efeito monta duas vezes no mesmo canvas); com WebGL em
 * software (sem GPU) não desenha e deixa o CSS mostrar um brilho parado (`.is-fallback`).
 */
import { useEffect, useRef } from 'react';

const MAX_STOPS = 5;
const MAX_LAYERS = 3;
const INTRO_SECONDS = 2.4;
/** Pixels desenhados por pixel CSS: a luz é difusa, meia resolução não aparece e custa um quarto. */
const RENDER_SCALE = 0.5;
const FRAME_MS = 33;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uStops[${MAX_STOPS}];
uniform int uStopCount;
uniform float uAmplitude;
uniform float uBlend;
uniform float uHeight;
uniform float uScale;
uniform float uGlow;
uniform float uBrightness;
uniform int uLayers;
uniform float uFlip;
uniform float uReveal;
uniform float uOpacity;
out vec4 outColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float smootherstep(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);
  int i = int(min(floor(x), float(uStopCount - 2)));
  float f = x - float(i);
  f = f * f * (3.0 - 2.0 * f);
  vec3 lch = mix(uStops[i], uStops[i + 1], f);
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float y = 1.0 - frag.y / uResolution.y;
  y = mix(y, 1.0 - y, uFlip);
  float u = frag.x / uResolution.x;
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;
  float t = uTime;

  vec3 glow = vec3(0.0);
  float cover = 0.0;
  for (int k = 0; k < ${MAX_LAYERS}; k++) {
    if (k >= uLayers) break;
    float layer = float(k);
    float seed = layer * 13.7;
    float pace = t * (1.0 - layer * 0.18);
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;
    hem = mix(-0.25, hem, uReveal);

    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);
    float rise = hem - y;
    float low = -soft - uGlow * 0.14;
    float high = 0.26 + soft * 0.6;
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);
    alpha = clamp(alpha, 0.0, 1.0);

    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);
  }

  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;
  float strength = clamp(uBrightness, 0.0, 2.0);
  glow *= fade * min(strength, 1.0);
  cover *= fade * min(strength, 1.0);
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));
  float dither = (hash(frag) - 0.5) / 255.0;
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));
}`;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** sRGB (0-1) -> OKLCH, para a rampa de cores do shader. */
const toOklch = ([r0, g0, b0]: number[]) => {
  const [r, g, b] = [r0, g0, b0].map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
};

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/** Matizes contínuos entre as paradas (evita a volta pelo arco-íris entre verde e amarelo). */
const unwrapHues = (stops: number[][]) => {
  let previous = stops.find((s) => s[1] > 0.02)?.[2] ?? 0;
  return stops.map(([L, C, H]) => {
    let hue = C > 0.02 ? H : previous;
    while (hue - previous > Math.PI) hue -= Math.PI * 2;
    while (hue - previous < -Math.PI) hue += Math.PI * 2;
    previous = hue;
    return [L, C, hue];
  });
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

/** WebGL renderizado por software (sem GPU)? Testado num canvas fora da página, uma vez por carregamento. */
let softwareGl: boolean | null = null;
function isSoftwareGl() {
  if (softwareGl !== null) return softwareGl;
  const probe = document.createElement('canvas').getContext('webgl2');
  if (!probe) return (softwareGl = true);
  const info = probe.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(info ? probe.getParameter(info.UNMASKED_RENDERER_WEBGL) : probe.getParameter(probe.RENDERER));
  softwareGl = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  probe.getExtension('WEBGL_lose_context')?.loseContext(); // o canvas de teste é descartado aqui
  return softwareGl;
}

type Props = {
  /** Cores em hex, da esquerda para a direita (2 a 5). */
  colors: string[];
  height?: number;
  amplitude?: number;
  blend?: number;
  glow?: number;
  brightness?: number;
  opacity?: number;
  speed?: number;
  layers?: number;
  scale?: number;
  /** 'bottom': a luz sobe da base da seção. */
  direction?: 'top' | 'bottom';
  className?: string;
};

export function Aurora({ colors, height = 0.45, amplitude = 1, blend = 0.5, glow = 0.6, brightness = 1, opacity = 1, speed = 1, layers = 2, scale = 1, direction = 'top', className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    // Sem GPU (WebGL em software: SwiftShader, llvmpipe) cada quadro força uma leitura de volta da GPU e trava a
    // página. O teste é feito num canvas solto (fora da página, nunca composto): o canvas visível nem chega a
    // ter contexto WebGL, e o CSS mostra um brilho parado no lugar (.is-fallback).
    if (isSoftwareGl()) {
      canvas.classList.add('is-fallback', 'is-ready');
      return;
    }
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    const U = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      res: U('uResolution'),
      time: U('uTime'),
      stops: U('uStops'),
      count: U('uStopCount'),
      amp: U('uAmplitude'),
      blend: U('uBlend'),
      height: U('uHeight'),
      scale: U('uScale'),
      glow: U('uGlow'),
      bright: U('uBrightness'),
      layers: U('uLayers'),
      flip: U('uFlip'),
      reveal: U('uReveal'),
      opacity: U('uOpacity'),
    };

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const list = colors.slice(0, MAX_STOPS);
    const palette = new Float32Array(MAX_STOPS * 3);
    unwrapHues(list.map((c) => toOklch(hexToRgb(c)))).forEach((stop, i) => palette.set(stop, i * 3));

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const flip = direction === 'bottom' ? 1 : 0;
    const state = { clock: 7, reveal: reduce ? 1 : 0 };
    let raf = 0;
    let last = 0;
    let visible = true;

    const render = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, state.clock);
      gl.uniform3fv(u.stops, palette);
      gl.uniform1i(u.count, list.length);
      gl.uniform1f(u.amp, amplitude);
      gl.uniform1f(u.blend, blend);
      gl.uniform1f(u.height, height);
      gl.uniform1f(u.scale, scale);
      gl.uniform1f(u.glow, glow);
      gl.uniform1f(u.bright, brightness);
      gl.uniform1i(u.layers, clamp(Math.round(layers), 1, MAX_LAYERS));
      gl.uniform1f(u.flip, flip);
      gl.uniform1f(u.reveal, 1 - Math.pow(1 - state.reveal, 3));
      gl.uniform1f(u.opacity, opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (last && now - last < FRAME_MS - 4) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.1) : 1 / 30;
      last = now;
      state.clock += dt * speed * 0.6;
      if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);
      render();
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (reduce) return;
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      canvas.width = Math.max(1, Math.round(width * RENDER_SCALE));
      canvas.height = Math.max(1, Math.round(h * RENDER_SCALE));
      render();
    };

    const onVisibility = () => wake();

    resize();
    canvas.classList.add('is-ready');
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    io.observe(host);
    document.addEventListener('visibilitychange', onVisibility);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, [colors, height, amplitude, blend, glow, brightness, opacity, speed, layers, scale, direction]);

  return <canvas ref={canvasRef} className={['bg-layer', className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
