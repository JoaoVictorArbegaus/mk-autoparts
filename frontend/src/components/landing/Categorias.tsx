/*
 * Categorias (seção clara): cartões marinho no estilo "peça em destaque". Todos usam a MESMA foto do
 * caminhão (design/originais/categorias/base.png, carregada uma vez) e cada um acende, em azul vivo
 * com brilho, as peças da sua categoria, desenhadas em SVG sobre a foto (viewBox = pixels da foto).
 * Cada cartão aproxima a região da sua categoria (`cena`); hover/foco intensifica o destaque e aproxima mais. Celular: trilho deslizável.
 * Teste com uma imagem só; se a MK aprovar, os destaques podem virar imagens editadas pela IA.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Link } from '../../router';
import { contarPorCategoria, listarCategorias } from '../../content/catalogo';
import { textos } from '../../content/site';
import { DotField } from '../fundos/DotField';
import { SplitTitle } from '../SplitTitle';
import { Reveal } from '../Motion';
import { Emenda } from '../Emenda';
import { Icone } from '../Icons';
import { useAutoRolagem } from '../../hooks/useAutoRolagem';

/* Formas das peças, em pixels da foto base (1536 × 1024). */
const farolEsq = '290,628 318,640 338,692 298,690 287,662';
const farolDir = '640,634 714,617 709,652 690,682 614,695 611,679 626,650';
const neblinaEsq = '289,726 330,738 338,768 292,766';
const neblinaDir = '612,726 700,720 702,770 616,774';

const destaques: Record<string, ReactNode> = {
  farois: (
    <>
      <polygon points={farolEsq} />
      <polygon points={farolDir} />
      <polygon points={neblinaEsq} />
      <polygon points={neblinaDir} />
    </>
  ),
  lanternas: (
    <>
      <rect x={369} y={170} width={24} height={22} rx={5} />
      <rect x={650} y={137} width={50} height={27} rx={6} />
      <rect x={641} y={179} width={30} height={11} rx={4} />
      <rect x={799} y={680} width={19} height={19} rx={4} />
      <rect x={965} y={713} width={17} height={15} rx={4} />
      <rect x={1189} y={690} width={13} height={18} rx={4} />
    </>
  ),
  retrovisores: (
    <>
      <polygon points="296,272 330,268 334,412 300,416" />
      <polygon points="732,222 772,226 776,244 760,250" />
      <polygon points="771,240 828,246 830,390 776,394" />
    </>
  ),
  'lentes-vidros': (
    <g className="cat__lente">
      <polygon points={farolEsq} />
      <polygon points={farolDir} />
    </g>
  ),
  'portas-vidros': (
    <>
      <polygon className="cat__contorno" points="722,222 905,250 905,398 857,398 857,560 745,585 720,560" />
      <polygon points="740,234 900,256 902,392 812,400 746,404" />
      <rect x={823} y={503} width={30} height={32} rx={6} />
    </>
  ),
  motor: (
    <g className="cat__raiox">
      <rect x={360} y={500} width={290} height={225} rx={18} className="cat__raiox-bloco" />
      <path className="cat__correia" d="M432 581 L483 556 L527 556 L588 566 A22 22 0 0 1 600 600 L540 690 A40 40 0 0 1 462 692 L418 610 A16 16 0 0 1 432 581 Z" />
      <circle cx={505} cy={662} r={40} />
      <circle cx={505} cy={575} r={22} />
      <circle cx={588} cy={588} r={22} />
      <circle cx={430} cy={597} r={16} />
    </g>
  ),
};

/* Enquadramento de cada cartão: zoom e deslocamento (em % do quadro) para centralizar a região da categoria. */
const cena: Record<string, { z: number; tx: number; ty: number }> = {
  farois: { z: 2, tx: 17.5, ty: -17 },
  lanternas: { z: 1.25, tx: 0, ty: 4 },
  retrovisores: { z: 1.7, tx: 14, ty: 18 },
  'lentes-vidros': { z: 2.4, tx: 17.5, ty: -15 },
  'portas-vidros': { z: 1.8, tx: -3, ty: 11 },
  motor: { z: 1.9, tx: 17, ty: -10 },
};

function Cartao({ c, i, copia = false }: { c: { slug: string; nome: string }; i: number; copia?: boolean }) {
  const n = contarPorCategoria(c.slug);
  return (
    <Link href={`/catalogo?categoria=${c.slug}`} className="cat" style={{ '--i': i } as CSSProperties} tabIndex={copia ? -1 : undefined}>
      <span className="cat__palco" aria-hidden="true">
        <span className="cat__cena" style={{ '--z': cena[c.slug]?.z ?? 1, '--tx': `${cena[c.slug]?.tx ?? 0}%`, '--ty': `${cena[c.slug]?.ty ?? 0}%` } as CSSProperties}>
          <img src="/img/categorias/caminhao-base-900.jpg" srcSet="/img/categorias/caminhao-base-900.jpg 900w, /img/categorias/caminhao-base-1536.jpg 1536w" sizes="(min-width: 768px) 420px, 80vw" width={900} height={600} alt="" loading="lazy" decoding="async" />
          <svg viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice" className="cat__destaque">
            {destaques[c.slug]}
          </svg>
        </span>
      </span>
      <span className="cat__corpo">
        <span className="cat__meta">
          <span className="cat__n">
            {n} {n === 1 ? 'peça' : 'peças'}
          </span>
        </span>
        <span className="cat__nome">{c.nome}</span>
        <Icone nome="setaDiag" tamanho={20} className="cat__seta" />
      </span>
    </Link>
  );
}

export function Categorias() {
  const t = textos.categorias;
  const cats = listarCategorias().filter(c => destaques[c.slug]);
  const trilho = useAutoRolagem<HTMLUListElement>();
  return (
    <section id="categorias" className="sec sec--paper categorias" aria-labelledby="cat-titulo">
      <DotField spacing={18} className="categorias__pontos" />
      <div className="contido">
        <div className="sec__cabeca sec__cabeca--linha">
          <div>
            <SplitTitle id="cat-titulo" lead={t.titulo} className="titulo-sec" />
            <Reveal as="p" i={1} className="sec__apoio">
              {t.apoio}
            </Reveal>
          </div>
          <Reveal i={2}>
            <Link href="/catalogo" className="link-seta">
              {t.verTodas}
              <Icone nome="seta" tamanho={18} />
            </Link>
          </Reveal>
        </div>
        <ul ref={trilho} className="categorias__grade">
          {cats.map((c, i) => (
            <Reveal as="li" i={i} amount={0} key={c.slug} className="categorias__item">
              <Cartao c={c} i={i} />
            </Reveal>
          ))}
          {/* Cópias só para a volta sem emenda do trilho no celular (decorativas). */}
          {cats.map((c, i) => (
            <li key={`copia-${c.slug}`} className="categorias__item trilho-copia" aria-hidden="true" inert>
              <Cartao c={c} i={i} copia />
            </li>
          ))}
        </ul>
      </div>
      <Emenda para="navy" />
    </section>
  );
}
