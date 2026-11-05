/*
 * Promoções (seção marinho viva, mesma linguagem do hero: linhas de velocidade a 12°, aurora azul
 * vinda de baixo e holofote atrás das artes): só as artes de promoção do cliente (DEC-013),
 * cada uma levando ao produto, com nome e preço na legenda. Desktop: grade centralizada; celular:
 * trilho deslizável. Produtos comuns ficam no catálogo (pedido do responsável humano: misturar
 * artes e cards quebrava a estética). O texto acessível das artes está no alt (produto e preço).
 */
import { Link } from '../../router';
import { artePromocao, formatarPreco, listarPromocoes } from '../../content/catalogo';
import { textos } from '../../content/site';
import type { Produto } from '../../content/tipos';
import { Aurora } from '../fundos/Aurora';
import { LinhasVelocidade } from '../fundos/LinhasVelocidade';
import { SplitTitle } from '../SplitTitle';
import { Reveal } from '../Motion';
import { Emenda } from '../Emenda';
import { Icone } from '../Icons';
import { useAutoRolagem } from '../../hooks/useAutoRolagem';

function Arte({ p, copia = false }: { p: Produto; copia?: boolean }) {
  const a = artePromocao(p);
  if (!a) return null;
  return (
    <Link href={`/produto/${p.slug}`} className="arte" tabIndex={copia ? -1 : undefined}>
      <img src={a.src400} srcSet={`${a.src400} 400w, ${a.src} 760w`} sizes="(min-width: 768px) 380px, 80vw" width={400} height={600} alt={copia ? '' : `Arte da promoção: ${p.nome} por ${formatarPreco(p.promocao!.preco)}`} loading="lazy" decoding="async" />
      <span className="arte__legenda">
        <span>{p.nome}</span>
        <strong>{formatarPreco(p.promocao!.preco)}</strong>
      </span>
    </Link>
  );
}

export function Promocoes() {
  const t = textos.promocoes;
  const promos = listarPromocoes();
  const trilho = useAutoRolagem<HTMLUListElement>();
  if (!promos.length) return null;

  return (
    <section id="promocoes" className="sec sec--navy promos" aria-labelledby="promo-titulo">
      <Aurora colors={['#0B1A36', '#1C4FD0', '#3D7EFF', '#1C4FD0']} direction="bottom" height={0.5} opacity={0.9} className="promos__aurora" />
      <LinhasVelocidade densidade={1.6} velocidade={1.2} className="promos__linhas" />
      <div className="promos__holofote" aria-hidden="true" />
      <div className="contido">
        <div className="sec__cabeca sec__cabeca--linha">
          <div>
            <SplitTitle id="promo-titulo" lead={t.titulo} className="titulo-sec" />
            <Reveal as="p" i={1} className="sec__apoio">
              {t.apoio}
            </Reveal>
          </div>
          <Reveal i={2}>
            <Link href="/catalogo?promocao=1" className="link-seta">
              {t.verTodas}
              <Icone nome="seta" tamanho={18} />
            </Link>
          </Reveal>
        </div>
      </div>
      <ul ref={trilho} className="promos__lista">
        {promos.map((p, i) => (
          <Reveal as="li" i={i} amount={0} key={p.slug} className="promos__item">
            <Arte p={p} />
          </Reveal>
        ))}
        {/* Cópias só para a volta sem emenda do trilho no celular (decorativas). */}
        {promos.map(p => (
          <li key={`copia-${p.slug}`} className="promos__item trilho-copia" aria-hidden="true" inert>
            <Arte p={p} copia />
          </li>
        ))}
      </ul>
      <Emenda para="paper" />
    </section>
  );
}
