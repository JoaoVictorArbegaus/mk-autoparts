/*
 * Roteamento próprio com a History API (DEC-003), sem biblioteca.
 * - O primeiro render usa o caminho recebido (servidor) ou o do navegador (cliente), sem query:
 *   a query string só entra depois da montagem, para o HTML pré-renderizado e a hidratação
 *   serem idênticos.
 * - `navegar` empilha o histórico, guarda a rolagem e volta ao topo; voltar restaura a rolagem.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

export type Rota =
  | { nome: 'landing' }
  | { nome: 'catalogo' }
  | { nome: 'produto'; slug: string }
  | { nome: 'admin'; tela: TelaAdmin }
  | { nome: 'vendedor'; tela: TelaVendedor }
  | { nome: 'orcamento' }
  | { nome: 'nao-encontrado' };

/** Área do vendedor de demonstração (DEC-018, DEC-021, RN-13). */
export type TelaVendedor = 'lista' | 'novo' | 'documento';
const TELAS_VENDEDOR: Record<string, TelaVendedor> = { '/vendedor': 'lista', '/vendedor/novo': 'novo', '/vendedor/documento': 'documento' };
export const caminhosVendedor = Object.keys(TELAS_VENDEDOR);

/** Telas do admin de demonstração (DEC-015). */
export type TelaAdmin = 'login' | 'produtos' | 'produto-novo' | 'produto-editar' | 'promocoes' | 'vendedores' | 'metricas';
const TELAS_ADMIN: Record<string, TelaAdmin> = {
  '/admin': 'login',
  '/admin/produtos': 'produtos',
  '/admin/produtos/novo': 'produto-novo',
  '/admin/produtos/editar': 'produto-editar',
  '/admin/promocoes': 'promocoes',
  '/admin/vendedores': 'vendedores',
  '/admin/metricas': 'metricas',
};
export const caminhosAdmin = Object.keys(TELAS_ADMIN);

/** Caminho sem barra final (exceto a raiz). */
export function limparCaminho(caminho: string) {
  const c = caminho.split(/[?#]/)[0] || '/';
  return c.length > 1 ? c.replace(/\/+$/, '') || '/' : '/';
}

export function resolverRota(caminho: string): Rota {
  const c = limparCaminho(caminho);
  if (c === '/') return { nome: 'landing' };
  if (c === '/catalogo') return { nome: 'catalogo' };
  if (TELAS_ADMIN[c]) return { nome: 'admin', tela: TELAS_ADMIN[c] };
  if (TELAS_VENDEDOR[c]) return { nome: 'vendedor', tela: TELAS_VENDEDOR[c] };
  if (c === '/orcamento') return { nome: 'orcamento' };
  const m = c.match(/^\/produto\/([a-z0-9-]+)$/);
  if (m) return { nome: 'produto', slug: m[1] };
  return { nome: 'nao-encontrado' };
}

type Estado = { caminho: string; busca: string; hash: string; montado: boolean };
type Contexto = Estado & { navegar: (para: string, opcoes?: { substituir?: boolean; manterRolagem?: boolean }) => void };

const RouterCtx = createContext<Contexto | null>(null);

type Lenisish = { scrollTo: (alvo: number | string | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void };
const lenis = () => (window as unknown as { __lenis?: Lenisish }).__lenis;

function rolarPara(y: number) {
  const l = lenis();
  if (l) l.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
}

function rolarAteHash(hash: string) {
  if (!hash) return false;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return false;
  const l = lenis();
  if (l) l.scrollTo(el, { offset: -88 });
  else el.scrollIntoView();
  return true;
}

export function RouterProvider({ caminhoInicial, children }: { caminhoInicial: string; children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ caminho: limparCaminho(caminhoInicial), busca: '', hash: '', montado: false });

  useEffect(() => {
    history.scrollRestoration = 'manual';
    setEstado({ caminho: limparCaminho(location.pathname), busca: location.search, hash: location.hash, montado: true });
    if (location.hash) requestAnimationFrame(() => rolarAteHash(location.hash));
    const aoVoltar = (e: PopStateEvent) => {
      setEstado({ caminho: limparCaminho(location.pathname), busca: location.search, hash: location.hash, montado: true });
      const y = typeof e.state?.rolagem === 'number' ? e.state.rolagem : 0;
      requestAnimationFrame(() => requestAnimationFrame(() => rolarPara(y)));
    };
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  const navegar = useCallback<Contexto['navegar']>((para, opcoes = {}) => {
    const url = new URL(para, location.href);
    const mesmoLugar = url.pathname === location.pathname && url.search === location.search;
    if (mesmoLugar && url.hash) {
      if (location.hash !== url.hash) history.pushState({ rolagem: window.scrollY }, '', url.hash);
      rolarAteHash(url.hash);
      return;
    }
    history.replaceState({ ...(history.state ?? {}), rolagem: window.scrollY }, '');
    if (opcoes.substituir) history.replaceState({ rolagem: 0 }, '', url.pathname + url.search + url.hash);
    else history.pushState({ rolagem: 0 }, '', url.pathname + url.search + url.hash);
    const trocaPagina = limparCaminho(url.pathname) !== limparCaminho(location.pathname) || !opcoes.manterRolagem;
    setEstado({ caminho: limparCaminho(url.pathname), busca: url.search, hash: url.hash, montado: true });
    requestAnimationFrame(() => {
      if (url.hash && rolarAteHash(url.hash)) return;
      if (trocaPagina && !opcoes.manterRolagem) rolarPara(0);
    });
  }, []);

  const valor = useMemo(() => ({ ...estado, navegar }), [estado, navegar]);
  return <RouterCtx.Provider value={valor}>{children}</RouterCtx.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterCtx);
  if (!ctx) throw new Error('useRouter fora do RouterProvider');
  return ctx;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; substituir?: boolean };

/** Link interno: navega sem recarregar. Âncoras da mesma página rolam pelo Lenis. */
export function Link({ href, substituir, onClick, children, ...resto }: LinkProps) {
  const { navegar } = useRouter();
  const aoClicar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || resto.target === '_blank') return;
    e.preventDefault();
    // O Lenis trata âncoras sozinho e ignora preventDefault: a navegação fica só com o roteador.
    e.stopPropagation();
    navegar(href, { substituir });
  };
  return (
    <a href={href} onClick={aoClicar} {...resto}>
      {children}
    </a>
  );
}
