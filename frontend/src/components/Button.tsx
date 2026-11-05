/*
 * Botão do site: pílula com reflexo que varre no hover (CSS). Variantes do contrato:
 * primario (royal), vidro (vidro escuro, sobre fundo com conteúdo), contorno (claro) e texto.
 * Interno usa o Link do roteador; externo vira <a target=_blank rel=noopener>; sem href, <button>.
 */
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Link } from '../router';
import { Icone, type NomeIcone } from './Icons';

type Comum = {
  variante?: 'primario' | 'vidro' | 'contorno' | 'contorno-claro' | 'texto';
  tamanho?: 'sm' | 'md' | 'lg';
  icone?: NomeIcone;
  iconeFim?: NomeIcone;
  className?: string;
  children: ReactNode;
};

type ComoLink = Comum & { href: string; externo?: boolean; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void; 'aria-label'?: string };
type ComoBotao = Comum & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

export function Button(props: ComoLink | ComoBotao) {
  const { variante = 'primario', tamanho = 'md', icone, iconeFim, className, children } = props;
  const classes = ['btn', `btn--${variante}`, `btn--${tamanho}`, className].filter(Boolean).join(' ');
  const miolo = (
    <>
      {icone && <Icone nome={icone} tamanho={tamanho === 'lg' ? 22 : 20} />}
      <span className="btn__texto">{children}</span>
      {iconeFim && <Icone nome={iconeFim} tamanho={18} className="btn__fim" />}
    </>
  );
  if ('href' in props && props.href !== undefined) {
    const { href, externo, onClick } = props;
    if (/^(tel|mailto):/.test(href))
      return (
        <a className={classes} href={href} onClick={onClick} aria-label={props['aria-label']}>
          {miolo}
        </a>
      );
    if (externo)
      return (
        <a className={classes} href={href} target="_blank" rel="noopener" onClick={onClick} aria-label={props['aria-label']}>
          {miolo}
        </a>
      );
    return (
      <Link className={classes} href={href} onClick={onClick} aria-label={props['aria-label']}>
        {miolo}
      </Link>
    );
  }
  const { variante: _v, tamanho: _t, icone: _i, iconeFim: _f, className: _c, children: _ch, type = 'button', ...resto } = props as ComoBotao;
  return (
    <button className={classes} type={type} {...resto}>
      {miolo}
    </button>
  );
}
