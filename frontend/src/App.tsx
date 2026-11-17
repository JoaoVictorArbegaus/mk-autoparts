import { Suspense, lazy, useEffect, useRef } from 'react';
import { LazyMotion, MotionConfig, domAnimation, useReducedMotion } from 'motion/react';
import { ReactLenis, useLenis } from 'lenis/react';
import { RouterProvider, resolverRota, useRouter } from './router';
import { OrcamentoProvider, useOrcamento } from './orcamento/OrcamentoContext';
import { Cabecalho } from './components/Cabecalho';
import { Rodape } from './components/Rodape';
import { PainelOrcamento } from './components/PainelOrcamento';
import { WhatsAppFlutuante } from './components/WhatsAppFlutuante';
import { AvisoAdicionado } from './components/AvisoAdicionado';
import { Landing } from './pages/Landing';
import { NaoEncontrado } from './pages/NaoEncontrado';
import { metaDaRota } from './seo';
import { textos } from './content/site';
import { aplicarParametroVendedor } from './rastreio/vendedor';
import { registrarVisita } from './rastreio/eventos';
import './styles/index.css';

/*
 * Rotas fora da landing em arquivos JS separados (Lighthouse, RNF-05): a landing não baixa nem
 * executa o código do catálogo, do produto e do admin (as métricas ficam no admin). O HTML pré-renderizado já traz o
 * conteúdo de cada rota; a hidratação espera o arquivo da rota dentro do Suspense.
 */
const Catalogo = lazy(() => import('./pages/Catalogo').then(m => ({ default: m.Catalogo })));
const Produto = lazy(() => import('./pages/Produto').then(m => ({ default: m.Produto })));
const Admin = lazy(() => import('./admin/Admin').then(m => ({ default: m.Admin })));

/** Expõe a instância do Lenis ao roteador (rolar ao topo e restaurar a rolagem). */
function LenisPonte() {
  const lenis = useLenis();
  useEffect(() => {
    (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    return () => {
      (window as unknown as { __lenis?: unknown }).__lenis = undefined;
    };
  }, [lenis]);
  return null;
}

function Paginas() {
  const { caminho, busca, montado } = useRouter();
  const { definirVendedor, aberta } = useOrcamento();
  const rota = resolverRota(caminho);
  const primeira = useRef(true);
  const reduzir = useReducedMotion();

  // Vendedor da sessão (?v=) em qualquer rota e a visita da sessão (RN-07, RN-08). O admin não gera eventos.
  useEffect(() => {
    if (!montado) return;
    definirVendedor(aplicarParametroVendedor(busca));
    if (rota.nome !== 'admin') registrarVisita();
  }, [montado, busca, rota.nome, definirVendedor]);

  // Título e descrição ao navegar; foco no conteúdo para leitores de tela (exceto no primeiro carregamento).
  useEffect(() => {
    const meta = metaDaRota(caminho);
    document.title = meta.titulo;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.descricao);
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [caminho]);

  // Com a lista aberta, a rolagem da página para (o painel rola sozinho).
  const lenis = useLenis();
  useEffect(() => {
    if (aberta) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle('sem-rolagem', aberta);
  }, [aberta, lenis]);

  // Admin de demonstração (DEC-015): casca própria, sem cabeçalho, rodapé, Lenis nem lista de orçamento.
  if (rota.nome === 'admin')
    return (
      <Suspense fallback={null}>
        <Admin tela={rota.tela} />
      </Suspense>
    );
  return (
    <>
      {!reduzir && <ReactLenis root options={{ lerp: 0.085, anchors: { offset: -88 }, allowNestedScroll: true }} />}
      {!reduzir && <LenisPonte />}
      <a className="pular" href="#conteudo">
        {textos.pularConteudo}
      </a>
      <Cabecalho rota={rota.nome} />
      <main id="conteudo" tabIndex={-1} data-rota={rota.nome}>
        {rota.nome === 'landing' && <Landing />}
        <Suspense fallback={null}>
          {rota.nome === 'catalogo' && <Catalogo />}
          {rota.nome === 'produto' && <Produto slug={rota.slug} key={rota.slug} />}
        </Suspense>
        {rota.nome === 'nao-encontrado' && <NaoEncontrado />}
      </main>
      <Rodape />
      <PainelOrcamento />
      <WhatsAppFlutuante />
      <AvisoAdicionado />
    </>
  );
}

export function App({ caminho }: { caminho: string }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <RouterProvider caminhoInicial={caminho}>
          <OrcamentoProvider>
            <Paginas />
          </OrcamentoProvider>
        </RouterProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
