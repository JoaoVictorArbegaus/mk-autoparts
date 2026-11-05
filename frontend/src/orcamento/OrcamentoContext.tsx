/*
 * Contexto da lista de orçamento: estado, persistência em localStorage e os pontos únicos das
 * ações do visitante (adicionar, remover, enviar), onde entram o vendedor da sessão e o
 * registro de eventos (DEC-009, DEC-010). No primeiro render a lista é vazia (igual ao HTML
 * pré-renderizado); o salvo entra depois da montagem.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CHAVE_ORCAMENTO, adicionar as adicionarItem, alterarQuantidade, codificar, contar, decodificar, definirObservacao, ladosDaEscolha, listaVazia, mensagemLista, remover as removerItem, type Escolha, type Lista } from './lista';
import { obterProduto, type Lado } from '../content/catalogo';
import { empresa, whatsapp } from '../content/site';
import type { Vendedor } from '../content/vendedores';
import { gravar, ler } from '../rastreio/armazenamento';
import { aoFinalizar, aoMudarLista, carrinhoAtivoId } from '../rastreio/carrinhos';
import { registrar } from '../rastreio/eventos';

type Aviso = { id: number; texto: string };

type Ctx = {
  lista: Lista;
  carregada: boolean;
  totais: { itens: number; unidades: number };
  aberta: boolean;
  abrir: () => void;
  fechar: () => void;
  adicionar: (slug: string, quantidade?: number, escolha?: Escolha) => boolean;
  alterar: (slug: string, lado: Lado | undefined, quantidade: number) => void;
  remover: (slug: string, lado?: Lado) => void;
  limpar: () => void;
  observar: (texto: string) => void;
  enviar: () => void;
  urlEnvio: string;
  /** Texto exato que vai para o WhatsApp (prévia na lista). */
  mensagemEnvio: string;
  aviso: Aviso | null;
  removidos: number;
  dispensarRemovidos: () => void;
  pulso: number;
  vendedor: Vendedor | undefined;
  definirVendedor: (v: Vendedor | undefined) => void;
};

const OrcamentoCtx = createContext<Ctx | null>(null);

export function destinoWhatsApp(vendedor?: Vendedor) {
  return vendedor?.whatsapp ?? empresa.whatsapp;
}

export function OrcamentoProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Lista>(listaVazia);
  const [carregada, setCarregada] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [removidos, setRemovidos] = useState(0);
  const [pulso, setPulso] = useState(0);
  const [vendedor, definirVendedor] = useState<Vendedor | undefined>();
  const contadorAviso = useRef(0);
  // A lista atual numa ref: as ações calculam a próxima fora do setState (sem efeitos duplicados no StrictMode).
  const listaRef = useRef(lista);
  listaRef.current = lista;

  useEffect(() => {
    const r = decodificar(ler(CHAVE_ORCAMENTO));
    setLista(r.lista);
    setRemovidos(r.removidos);
    setCarregada(true);
    if (r.removidos) gravar(CHAVE_ORCAMENTO, codificar(r.lista));
  }, []);

  // Grava a lista e mantém o carrinho da demonstração em dia (RN-09).
  const aplicar = useCallback((proxima: Lista, mudouItens = true) => {
    listaRef.current = proxima;
    setLista(proxima);
    gravar(CHAVE_ORCAMENTO, codificar(proxima));
    return mudouItens ? aoMudarLista(proxima.itens) : null;
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 3800);
    return () => clearTimeout(t);
  }, [aviso]);

  const adicionar = useCallback<Ctx['adicionar']>((slug, quantidade = 1, escolha) => {
    const p = obterProduto(slug);
    if (!p) return false;
    const lados = ladosDaEscolha(p, escolha);
    if (!lados) return false;
    const carrinho = aplicar(adicionarItem(listaRef.current, slug, quantidade, escolha));
    for (const lado of lados) registrar('item_adicionado', { produto: slug, carrinho: carrinho?.id, dados: { quantidade, ...(lado ? { lado } : {}) } });
    contadorAviso.current += 1;
    setAviso({ id: contadorAviso.current, texto: `${p.nome}${escolha ? ` (${escolha === 'Par' ? 'LD + LE' : escolha})` : ''}` });
    setPulso(n => n + 1);
    return true;
  }, [aplicar]);

  const alterar = useCallback<Ctx['alterar']>((slug, lado, quantidade) => void aplicar(alterarQuantidade(listaRef.current, slug, lado, quantidade)), [aplicar]);

  const remover = useCallback<Ctx['remover']>(
    (slug, lado) => {
      const carrinho = carrinhoAtivoId();
      aplicar(removerItem(listaRef.current, slug, lado));
      registrar('item_removido', { produto: slug, carrinho, dados: lado ? { lado } : undefined });
    },
    [aplicar],
  );

  const limpar = useCallback(() => {
    const carrinho = carrinhoAtivoId();
    for (const i of listaRef.current.itens) registrar('item_removido', { produto: i.slug, carrinho, dados: i.lado ? { lado: i.lado } : undefined });
    aplicar({ ...listaVazia(), observacao: listaRef.current.observacao });
  }, [aplicar]);

  const observar = useCallback((texto: string) => void aplicar(definirObservacao(listaRef.current, texto), false), [aplicar]);

  const mensagemEnvio = useMemo(() => mensagemLista(lista, vendedor?.nome), [lista, vendedor]);
  const urlEnvio = useMemo(() => whatsapp(destinoWhatsApp(vendedor), mensagemEnvio), [mensagemEnvio, vendedor]);

  const enviar = useCallback(() => {
    if (!lista.itens.length) return;
    const carrinho = aoFinalizar(lista.itens);
    registrar('carrinho_finalizado', { carrinho: carrinho.id, dados: { itens: lista.itens.length } });
  }, [lista]);

  const valor: Ctx = {
    lista,
    carregada,
    totais: contar(lista),
    aberta,
    abrir: () => setAberta(true),
    fechar: () => setAberta(false),
    adicionar,
    alterar,
    remover,
    limpar,
    observar,
    enviar,
    urlEnvio,
    mensagemEnvio,
    aviso,
    removidos,
    dispensarRemovidos: () => setRemovidos(0),
    pulso,
    vendedor,
    definirVendedor,
  };
  return <OrcamentoCtx.Provider value={valor}>{children}</OrcamentoCtx.Provider>;
}

export function useOrcamento() {
  const c = useContext(OrcamentoCtx);
  if (!c) throw new Error('useOrcamento fora do OrcamentoProvider');
  return c;
}
