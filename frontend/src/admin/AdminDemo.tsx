/*
 * Estado do admin de DEMONSTRAÇÃO (DEC-015): login simulado e cópias em memória dos produtos e
 * vendedores. Só visual: as edições valem enquanto a pessoa navega no admin e não alteram o site
 * público (que lê `src/content/`); recarregar a página volta tudo ao original.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { produtos as produtosOriginais } from '../content/produtos';
import { vendedores as vendedoresOriginais, WHATSAPP_EMPRESA, type Vendedor } from '../content/vendedores';
import type { Produto } from '../content/tipos';

const CHAVE_SESSAO = 'mk-admin-demo';

type Aviso = { id: number; texto: string };

type Ctx = {
  logado: boolean | null;
  usuario: string;
  entrar: (usuario: string) => void;
  sair: () => void;
  produtos: Produto[];
  salvarProduto: (p: Produto, slugAntigo?: string) => void;
  alternarAtivo: (slug: string) => void;
  /** Prévias locais de foto (object URL), só nesta sessão do admin. */
  fotos: Record<string, string>;
  definirFoto: (slug: string, url: string) => void;
  definirPromocao: (slug: string, promocao: Produto['promocao']) => void;
  vendedores: Vendedor[];
  salvarVendedor: (v: Vendedor) => void;
  alternarVendedor: (codigo: string) => void;
  aviso: Aviso | null;
  avisar: (texto: string) => void;
};

const AdminCtx = createContext<Ctx | null>(null);

const clonar = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function AdminDemoProvider({ children }: { children: ReactNode }) {
  // null = ainda não sabe (pré-renderização e primeiro quadro); a sessão é lida depois da montagem.
  const [logado, setLogado] = useState<boolean | null>(null);
  const [usuario, setUsuario] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>(() => clonar(produtosOriginais));
  const [vendedores, setVendedores] = useState<Vendedor[]>(() => clonar(vendedoresOriginais));
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [fotos, setFotos] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const u = sessionStorage.getItem(CHAVE_SESSAO);
      setUsuario(u ?? '');
      setLogado(!!u);
    } catch {
      setLogado(false);
    }
  }, []);

  const avisar = useCallback((texto: string) => setAviso({ id: Date.now(), texto }), []);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 3600);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const valor = useMemo<Ctx>(
    () => ({
      logado,
      usuario,
      entrar: u => {
        const nome = u.trim() || 'admin';
        try {
          sessionStorage.setItem(CHAVE_SESSAO, nome);
        } catch {
          /* modo privado: segue só em memória */
        }
        setUsuario(nome);
        setLogado(true);
      },
      sair: () => {
        try {
          sessionStorage.removeItem(CHAVE_SESSAO);
        } catch {
          /* nada */
        }
        setLogado(false);
        setUsuario('');
      },
      produtos,
      salvarProduto: (p, slugAntigo) =>
        setProdutos(lista => {
          const i = lista.findIndex(x => x.slug === (slugAntigo ?? p.slug));
          if (i < 0) return [p, ...lista];
          const nova = [...lista];
          nova[i] = p;
          return nova;
        }),
      alternarAtivo: slug => setProdutos(lista => lista.map(p => (p.slug === slug ? { ...p, ativo: !p.ativo } : p))),
      fotos,
      definirFoto: (slug, url) => setFotos(f => ({ ...f, [slug]: url })),
      definirPromocao: (slug, promocao) => setProdutos(lista => lista.map(p => (p.slug === slug ? { ...p, promocao } : p))),
      vendedores,
      salvarVendedor: v =>
        setVendedores(lista => {
          const i = lista.findIndex(x => x.codigo === v.codigo);
          // Demonstração: nunca um telefone inventado; todos usam o WhatsApp da empresa.
          const seguro = { ...v, whatsapp: WHATSAPP_EMPRESA };
          if (i < 0) return [...lista, seguro];
          const nova = [...lista];
          nova[i] = seguro;
          return nova;
        }),
      alternarVendedor: codigo => setVendedores(lista => lista.map(v => (v.codigo === codigo ? { ...v, ativo: !v.ativo } : v))),
      aviso,
      avisar,
    }),
    [logado, usuario, produtos, vendedores, fotos, aviso, avisar],
  );

  return <AdminCtx.Provider value={valor}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error('useAdmin fora do AdminDemoProvider');
  return c;
}

/** Slug a partir do nome (minúsculas, sem acento, hífens). */
export function gerarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
