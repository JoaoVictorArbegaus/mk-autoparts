/*
 * Novo orçamento / editar (RN-13, RF-30, RF-31), pensado para o celular, com os campos do documento
 * pedido pela MK (docs/pfd-regras, DEC-025). Revisão impeccable (crítica das telas do orçamento):
 * - peças em sanfona: a peça aberta mostra os campos; as outras viram uma linha-resumo (foto, nome,
 *   lado, quantidade × preço e total) que abre ao tocar, e a página fica curta no celular;
 * - a barra fixa tem atalhos para as seções (com marca de erro) ao lado do total e do salvar;
 * - ao salvar com erro, a tela rola até o primeiro campo errado, foca e mostra a mensagem embaixo dele;
 * - bloqueios: validade antes de hoje, peça com lado sem lado e desconto em peça sem preço;
 * - o desconto da peça tem a coluna inteira (o valor não é mais cortado) e o %/R$ fica embaixo;
 * - a % do item explica de onde vem ("10% no item + 3% no total");
 * - descrição e Nº compatível vêm preenchidos do catálogo, com "Restaurar"; dados opcionais do
 *   cliente recolhidos; logística em 2 × 2.
 * Valores digitados viram texto decimal (nunca ponto flutuante).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, useRouter } from '../router';
import { areaVendedor } from '../content/vendedor';
import { imagemProduto, listarProdutos, normalizar, obterProduto, temLados, type Produto } from '../content/catalogo';
import type { Vendedor } from '../content/vendedores';
import { Icone } from '../components/Icons';
import { Quantidade } from '../components/Quantidade';
import { OBS_MAX } from '../orcamento/lista';
import { copiarLink, enviarLink, linkDoOrcamento, novoIdOrcamento, obterOrcamento, proximoNumero, salvarOrcamento } from './armazem';
import { Dec, brl, lerDecimal, num, pctFiscal, pctTexto } from './decimal';
import { cnpjValido, cpfValido } from './documentos';
import { compativelDoCatalogo, dadosDoItem, itensDoCatalogo, origemDesconto } from './itens';
import {
  CODIGO_VENDA_MAX,
  QTD_ITEM_MAX,
  QTD_ITEM_MIN,
  calcularOrcamento,
  clienteVazio,
  descontoPctInvalido,
  faltaLado,
  hojeISO,
  limparOrcamento,
  validarOrcamento,
  type ClienteOrcamento,
  type Desconto,
  type EntregaOrcamento,
  type ErroOrcamento,
  type ItemCalculado,
  type ItemOrcamento,
  type Logistica,
  type Orcamento,
} from './orcamento';

const t = areaVendedor.editor;
const tl = areaVendedor.lista;

type Secao = keyof typeof t.secoes;
const SECOES: Secao[] = ['pecas', 'cliente', 'entrega', 'valores', 'documento'];
const idSecao = (s: Secao) => `vend-sec-${s}`;
/** Seção de cada erro (para a marca no atalho). */
const SECAO_DO_ERRO: Record<ErroOrcamento, Secao> = {
  semItens: 'pecas',
  lado: 'pecas',
  quantidade: 'pecas',
  descontoPct: 'pecas',
  clienteNome: 'cliente',
  documento: 'cliente',
  codigoVenda: 'documento',
  validade: 'documento',
  observacao: 'documento',
};

const mostrarValor = (v: string | undefined, moeda: boolean) => (v === undefined ? '' : moeda ? num(Dec.de(v)) : v.replace('.', ','));

/**
 * Campo de valor com texto livre (aceita vírgula e milhar). Propaga só valores válidos, como texto
 * decimal com até `casas` casas; moeda formata ao sair do campo ("1.234,50").
 */
function CampoValor({
  valor,
  aoMudar,
  rotulo,
  placeholder,
  moeda = false,
  casas = 2,
  invalido: invalidoFora = false,
  desabilitado = false,
  id,
}: {
  valor: string | undefined;
  aoMudar: (v: string | undefined) => void;
  rotulo: string;
  placeholder?: string;
  moeda?: boolean;
  casas?: number;
  invalido?: boolean;
  desabilitado?: boolean;
  id?: string;
}) {
  const [texto, setTexto] = useState(mostrarValor(valor, moeda));
  const focado = useRef(false);
  useEffect(() => {
    const lido = lerDecimal(texto, casas);
    if (!focado.current && (lido === null || lido === undefined ? lido !== valor : valor === undefined || !Dec.de(lido).igual(valor))) setTexto(mostrarValor(valor, moeda));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);
  const invalido = lerDecimal(texto, casas) === null || invalidoFora;
  return (
    <input
      id={id}
      className={`vend-valor${moeda ? ' vend-valor--moeda' : ''}${invalido ? ' vend-valor--erro' : ''}`}
      inputMode="decimal"
      value={texto}
      placeholder={placeholder}
      aria-label={rotulo}
      aria-invalid={invalido || undefined}
      disabled={desabilitado}
      onFocus={() => (focado.current = true)}
      onBlur={() => {
        focado.current = false;
        const v = lerDecimal(texto, casas);
        if (v !== null) setTexto(mostrarValor(v, moeda));
      }}
      onChange={e => {
        setTexto(e.target.value);
        const v = lerDecimal(e.target.value, casas);
        if (v !== null) aoMudar(v);
      }}
    />
  );
}

function CampoDesconto({ desconto, aoMudar, rotulo, desabilitado = false, id }: { desconto?: Desconto; aoMudar: (d?: Desconto) => void; rotulo: string; desabilitado?: boolean; id?: string }) {
  // O tipo pode ser escolhido antes do valor; sem valor (ou zero), não há desconto.
  const [tipoLocal, setTipoLocal] = useState<Desconto['tipo']>(desconto?.tipo ?? 'percentual');
  const tipo = desconto?.tipo ?? tipoLocal;
  const trocar = (novo: Desconto['tipo']) => {
    setTipoLocal(novo);
    if (desconto) aoMudar({ ...desconto, tipo: novo });
  };
  return (
    <span className="vend-desconto">
      <CampoValor id={id} valor={desconto?.valor} rotulo={rotulo} placeholder="0" desabilitado={desabilitado} invalido={descontoPctInvalido(desconto)} aoMudar={v => aoMudar(v && !Dec.de(v).zero ? { tipo, valor: v } : undefined)} />
      <span className="vend-segmento" role="group" aria-label={`${rotulo}: tipo`}>
        <button type="button" aria-pressed={tipo === 'percentual'} disabled={desabilitado} onClick={() => trocar('percentual')}>
          %
        </button>
        <button type="button" aria-pressed={tipo === 'valor'} disabled={desabilitado} onClick={() => trocar('valor')}>
          R$
        </button>
      </span>
    </span>
  );
}

function Preco({ antigo, novo, pct }: { antigo: Dec; novo: Dec; pct?: Dec }) {
  if (!pct) return <span className="vend-preco">{brl(novo)}</span>;
  return (
    <span className="vend-preco">
      <s>{brl(antigo)}</s>
      <span>{brl(novo)}</span>
      <span className="vend-pct">-{pctTexto(pct)}</span>
    </span>
  );
}

function Campo({ rotulo, dica, erro, children, largo = false, acao }: { rotulo: string; dica?: string; erro?: string; children: ReactNode; largo?: boolean; acao?: ReactNode }) {
  return (
    <label className={`adm-campo${largo ? ' vend-campo--largo' : ''}`}>
      <span className="vend-campo__rotulo">
        {rotulo}
        {acao}
      </span>
      {children}
      {erro ? <small className="vend-campo__erro">{erro}</small> : dica && <small>{dica}</small>}
    </label>
  );
}

/** "Restaurar": volta o campo ao texto do catálogo (o vendedor editou a descrição ou o Nº compatível). */
function Restaurar({ aoRestaurar }: { aoRestaurar: () => void }) {
  return (
    <button
      type="button"
      className="vend-restaurar"
      title={t.restaurarDica}
      onClick={e => {
        e.preventDefault();
        aoRestaurar();
      }}
    >
      {t.restaurar}
    </button>
  );
}

const vazio = (vendedor: string): Orcamento => ({
  id: novoIdOrcamento(),
  vendedor,
  cliente: clienteVazio(),
  entrega: {},
  itens: [],
  observacao: '',
  criadoEm: new Date().toISOString(),
  estado: 'ativo',
  alteracoes: [],
});

export function EditorOrcamento({ vendedor, avisar }: { vendedor: Vendedor; avisar: (t: string) => void }) {
  const { busca, navegar } = useRouter();
  const idEditar = new URLSearchParams(busca).get('id');
  const [orc, setOrc] = useState<Orcamento>(() => vazio(vendedor.codigo));
  const [editando, setEditando] = useState(false);
  const [salvo, setSalvo] = useState<Orcamento | null>(null);
  const [q, setQ] = useState('');
  // Depois da primeira tentativa de salvar, os erros acompanham a edição (somem ao corrigir).
  const [tentou, setTentou] = useState(false);
  // Peça aberta na sanfona (índice); as outras ficam em linha-resumo.
  const [aberto, setAberto] = useState<number | null>(null);
  const [clienteAberto, setClienteAberto] = useState(false);
  // No desktop há espaço: os dados opcionais do cliente ficam sempre abertos (pedido do responsável).
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 760px)');
    const ver = () => setDesktop(mq.matches);
    ver();
    mq.addEventListener('change', ver);
    return () => mq.removeEventListener('change', ver);
  }, []);
  // Linhas recém-criadas pelo "Par" (destacadas por alguns segundos).
  const [destaque, setDestaque] = useState<string[]>([]);
  useEffect(() => {
    if (!destaque.length) return;
    const id = window.setTimeout(() => setDestaque([]), 2400);
    return () => clearTimeout(id);
  }, [destaque]);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const idAtual = useRef(orc.id);
  idAtual.current = orc.id;

  useEffect(() => {
    const existente = idEditar ? obterOrcamento(idEditar) : undefined;
    // Depois de salvar, a URL ganha ?id= do próprio orçamento: não recarrega nem esconde o resultado.
    if (existente && existente.id === idAtual.current) return;
    setSalvo(null);
    setTentou(false);
    setAberto(null);
    if (existente && existente.vendedor === vendedor.codigo) {
      // Produto que saiu do catálogo é removido do orçamento, com aviso.
      const { validos, removidos } = itensDoCatalogo(existente.itens);
      setOrc({ ...existente, itens: validos });
      if (removidos) avisar(t.removidos);
      setEditando(true);
    } else {
      setOrc(vazio(vendedor.codigo));
      setEditando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEditar, vendedor.codigo]);

  const resultados = useMemo(() => {
    const termo = normalizar(q);
    if (termo.length < 2) return [];
    return listarProdutos()
      .filter(p => normalizar(`${p.nome} ${p.codigo ?? ''} ${(p.variantes ?? []).map(v => v.codigo ?? '').join(' ')}`).includes(termo))
      .slice(0, 6);
  }, [q]);

  const mudarItem = (i: number, f: (it: ItemOrcamento) => ItemOrcamento) => setOrc(o => ({ ...o, itens: o.itens.map((it, k) => (k === i ? f(it) : it)) }));
  const mudarCliente = (c: Partial<ClienteOrcamento>) => setOrc(o => ({ ...o, cliente: { ...o.cliente, ...c } }));
  const mudarEntrega = (e: Partial<EntregaOrcamento>) => setOrc(o => ({ ...o, entrega: { ...o.entrega, ...e } }));
  const mudarLogistica = (l: Partial<Logistica>) => setOrc(o => ({ ...o, logistica: { ...o.logistica, ...l } }));
  // "Par": a linha vira duas (LD e LE), com a mesma quantidade, preço e desconto; cada lado fica editável.
  // O Nº compatível editado é do lado original: cada lado volta ao código do catálogo.
  const dividirPar = (i: number) => {
    const it = orc.itens[i];
    const p = it && obterProduto(it.slug);
    if (!p) return;
    setOrc(o => ({ ...o, itens: o.itens.flatMap((x, k) => (k === i ? [{ ...x, lado: 'LD' as const, codigoOriginal: undefined }, { ...x, lado: 'LE' as const, codigoOriginal: undefined }] : [x])) }));
    setDestaque([`${it.slug}:LD`, `${it.slug}:LE`]);
    setAberto(null);
    avisar(t.parAdicionado(p.nome));
  };
  const adicionar = (slug: string) => {
    const p = obterProduto(slug);
    if (!p) return;
    const preco = p.promocao ? Dec.de(String(p.promocao.preco)).texto(2) : undefined;
    setOrc(o => ({ ...o, itens: [...o.itens, { slug, lado: temLados(p) ? 'LD' : undefined, quantidade: 1, preco }] }));
    setAberto(orc.itens.length);
    setQ('');
    setSalvo(null);
  };
  const remover = (i: number) => {
    setOrc(o => ({ ...o, itens: o.itens.filter((_, k) => k !== i) }));
    setAberto(null);
  };

  const calc = calcularOrcamento(orc);
  const c = orc.cliente;
  const pj = c.tipo === 'PJ';
  const docInvalido = !!c.documento?.trim() && !(pj ? cnpjValido(c.documento) : cpfValido(c.documento));
  const hoje = hojeISO();
  const erros = tentou ? validarOrcamento(orc, hoje) : [];
  const tem = (e: ErroOrcamento) => erros.includes(e);
  const secoesComErro = new Set(erros.map(e => SECAO_DO_ERRO[e]));
  const msgErro = (e: ErroOrcamento) => (e === 'clienteNome' && !pj ? t.erros.clienteNomePF : t.erros[e]);

  /** Elemento do primeiro erro: abre a peça ou os dados do cliente se preciso, rola até ele e foca. */
  const irAoErro = (e: ErroOrcamento) => {
    let id = '';
    const itemCom = (f: (i: ItemOrcamento) => boolean) => orc.itens.findIndex(f);
    if (e === 'semItens') id = 'vend-busca';
    else if (e === 'lado' || e === 'quantidade' || e === 'descontoPct') {
      const k =
        e === 'lado'
          ? itemCom(faltaLado)
          : e === 'quantidade'
            ? itemCom(i => !Number.isInteger(i.quantidade) || i.quantidade < QTD_ITEM_MIN || i.quantidade > QTD_ITEM_MAX)
            : itemCom(i => descontoPctInvalido(i.desconto));
      if (k >= 0) {
        setAberto(k);
        id = e === 'descontoPct' ? `vend-item-${k}-desconto` : `vend-item-${k}`;
      } else id = 'vend-desconto-total';
    } else if (e === 'clienteNome') id = 'vend-cliente-nome';
    else if (e === 'documento') {
      setClienteAberto(true);
      id = 'vend-cliente-doc';
    } else if (e === 'codigoVenda') id = 'vend-codigo-venda';
    else if (e === 'validade') id = 'vend-validade';
    else id = 'vend-obs';
    // Espera a peça/os dados abrirem antes de rolar.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const alvo = el.matches('input, textarea, button') ? el : el.querySelector<HTMLElement>('input, textarea, button');
        alvo?.focus({ preventScroll: true });
      }),
    );
  };

  const salvar = () => {
    const final = limparOrcamento({ ...orc, estado: 'ativo' });
    const lista = validarOrcamento(final, hoje);
    setTentou(true);
    if (lista.length) return irAoErro(lista[0]);
    setTentou(false);
    const comNumero = { ...final, numero: final.numero ?? proximoNumero() };
    salvarOrcamento(comNumero);
    setOrc(comNumero);
    setSalvo(comNumero);
    setEditando(true);
    setAberto(null);
    avisar(t.salvo);
    if (idEditar !== comNumero.id) navegar(`/vendedor/novo?id=${comNumero.id}`, { substituir: true, manterRolagem: true });
    requestAnimationFrame(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const irPara = (s: Secao) => document.getElementById(idSecao(s))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const lg = orc.logistica ?? {};
  const e = orc.entrega;
  const opcionaisCliente = [c.documento && (pj ? 'CNPJ' : 'CPF'), pj && c.inscricaoEstadual && 'IE', c.email, c.telefone].filter(Boolean).join(' · ');

  return (
    <section className="adm-tela vend-tela vend-editor" aria-labelledby="vend-editor-titulo">
      <div className="adm-tela__cabeca">
        <h1 id="vend-editor-titulo">{editando ? t.tituloEditar : t.titulo}</h1>
      </div>

      <div className="adm-bloco vend-secao" id={idSecao('pecas')}>
        <div className="vend-busca">
          <label htmlFor="vend-busca">{t.buscar}</label>
          <div className="adm-campo--busca">
            <Icone nome="busca" tamanho={18} />
            <input
              id="vend-busca"
              type="search"
              value={q}
              placeholder={t.buscarDica}
              aria-invalid={tem('semItens') || undefined}
              onChange={ev => setQ(ev.target.value)}
              // No celular, o campo sobe para o topo: os resultados não ficam sob o teclado.
              onFocus={ev => {
                if (window.matchMedia('(max-width: 859px)').matches) ev.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
          {tem('semItens') && <small className="vend-campo__erro">{t.erros.semItens}</small>}
        </div>
        {q.trim().length >= 2 && (
          <ul className="vend-resultados">
            {resultados.length ? (
              resultados.map(p => (
                <li key={p.slug}>
                  <button type="button" onClick={() => adicionar(p.slug)}>
                    <Icone nome="mais" tamanho={16} />
                    <span>{p.nome}</span>
                    <small>{p.codigo ?? p.variantes?.map(v => v.codigo).filter(Boolean).join(' / ')}</small>
                  </button>
                </li>
              ))
            ) : (
              <li className="vend-resultados__vazio">{t.nenhum}</li>
            )}
          </ul>
        )}

        {!orc.itens.length ? (
          <p className="adm-vazio">{t.vazio}</p>
        ) : (
          <ul className="vend-itens">
            {orc.itens.map((it, i) => {
              const p = obterProduto(it.slug);
              if (!p) return null;
              const props = { it, i, p, l: calc.itens[i], descontoTotal: orc.descontoTotal, novo: destaque.includes(`${it.slug}:${it.lado}`), erroLado: tentou && faltaLado(it) };
              return aberto === i ? (
                <ItemAberto key={`${it.slug}-${i}`} {...props} mudarItem={mudarItem} dividirPar={dividirPar} remover={remover} fechar={() => setAberto(null)} />
              ) : (
                <ItemResumo key={`${it.slug}-${i}`} {...props} abrir={() => setAberto(i)} />
              );
            })}
          </ul>
        )}
      </div>

      <div className="adm-bloco vend-editor__dados vend-secao" id={idSecao('cliente')}>
        <h2>{t.cliente}</h2>
        <div className="vend-mini vend-campo--largo">
          <span>{t.tipoCliente}</span>
          <span className="vend-segmento vend-segmento--largo" role="group" aria-label={t.tipoCliente}>
            <button type="button" aria-pressed={pj} onClick={() => mudarCliente({ tipo: 'PJ' })}>
              {t.pj}
            </button>
            <button type="button" aria-pressed={!pj} onClick={() => mudarCliente({ tipo: 'PF' })}>
              {t.pf}
            </button>
          </span>
        </div>
        {pj ? (
          <Campo rotulo={t.razaoSocial} erro={tem('clienteNome') ? msgErro('clienteNome') : undefined} largo>
            <input id="vend-cliente-nome" value={c.razaoSocial ?? ''} maxLength={120} required aria-invalid={tem('clienteNome') || undefined} autoComplete="organization" onChange={ev => mudarCliente({ razaoSocial: ev.target.value })} />
          </Campo>
        ) : (
          <Campo rotulo={t.nomePF} erro={tem('clienteNome') ? msgErro('clienteNome') : undefined} largo>
            <input id="vend-cliente-nome" value={c.nome ?? ''} maxLength={80} required aria-invalid={tem('clienteNome') || undefined} autoComplete="name" onChange={ev => mudarCliente({ nome: ev.target.value })} />
          </Campo>
        )}
        {/* Dados opcionais recolhidos: o resumo mostra o que já foi preenchido. */}
        <details className="vend-mais vend-campo--largo" open={desktop || clienteAberto} onToggle={ev => !desktop && setClienteAberto(ev.currentTarget.open)}>
          <summary>
            <span>{t.maisCliente}</span>
            <small>{opcionaisCliente || (pj ? t.maisClienteVazio : t.maisClienteVazioPF)}</small>
          </summary>
          <div className="vend-mais__grade">
            {pj && (
              <Campo rotulo={t.comprador} dica={t.compradorDica}>
                <input value={c.nome ?? ''} maxLength={80} autoComplete="name" onChange={ev => mudarCliente({ nome: ev.target.value })} />
              </Campo>
            )}
            <Campo rotulo={pj ? t.cnpj : t.cpf} erro={docInvalido ? t.documentoInvalido(pj ? 'CNPJ' : 'CPF') : undefined}>
              <input id="vend-cliente-doc" value={c.documento ?? ''} inputMode="numeric" maxLength={pj ? 18 : 14} aria-invalid={docInvalido || undefined} onChange={ev => mudarCliente({ documento: ev.target.value })} />
            </Campo>
            {pj && (
              <Campo rotulo={t.inscricaoEstadual}>
                <input value={c.inscricaoEstadual ?? ''} maxLength={20} onChange={ev => mudarCliente({ inscricaoEstadual: ev.target.value })} />
              </Campo>
            )}
            <Campo rotulo={t.email}>
              <input type="email" value={c.email ?? ''} maxLength={120} autoComplete="email" onChange={ev => mudarCliente({ email: ev.target.value })} />
            </Campo>
            <Campo rotulo={t.telefone}>
              <input type="tel" value={c.telefone ?? ''} maxLength={20} autoComplete="tel" onChange={ev => mudarCliente({ telefone: ev.target.value })} />
            </Campo>
          </div>
        </details>
      </div>

      <div className="adm-bloco vend-editor__dados vend-secao" id={idSecao('entrega')}>
        <h2>{t.entrega}</h2>
        <Campo rotulo={t.enderecoEntrega} largo>
          <input value={e.enderecoEntrega ?? ''} maxLength={160} onChange={ev => mudarEntrega({ enderecoEntrega: ev.target.value })} />
        </Campo>
        <div className="adm-campo vend-campo--largo">
          <span>{t.enderecoCobranca}</span>
          <label className="vend-check">
            <input type="checkbox" checked={!!e.cobrancaIgualEntrega} onChange={ev => mudarEntrega({ cobrancaIgualEntrega: ev.target.checked })} />
            {t.cobrancaIgual}
          </label>
          {!e.cobrancaIgualEntrega && <input value={e.enderecoCobranca ?? ''} maxLength={160} aria-label={t.enderecoCobranca} onChange={ev => mudarEntrega({ enderecoCobranca: ev.target.value })} />}
        </div>
        <Campo rotulo={t.transportadora} dica={t.transportadoraDica}>
          <input value={e.transportadora ?? ''} maxLength={80} onChange={ev => mudarEntrega({ transportadora: ev.target.value })} />
        </Campo>
        <Campo rotulo={t.prazoPagamento} dica={t.prazoDica}>
          <input value={e.prazoPagamento ?? ''} maxLength={60} onChange={ev => mudarEntrega({ prazoPagamento: ev.target.value })} />
        </Campo>
      </div>

      {orc.itens.length > 0 && (
        <div className="adm-bloco vend-editor__dados vend-secao" id={idSecao('valores')}>
          <h2>{t.valores}</h2>
          <div className="vend-mini vend-campo--largo">
            <span>{t.descontoTotal}</span>
            <CampoDesconto id="vend-desconto-total" desconto={orc.descontoTotal} rotulo={t.descontoTotal} aoMudar={d => setOrc(o => ({ ...o, descontoTotal: d }))} />
          </div>
          <div className="vend-grade2 vend-campo--largo">
            <label className="vend-mini">
              <span>{t.frete}</span>
              <CampoValor moeda valor={orc.frete} rotulo={t.frete} placeholder="0,00" aoMudar={v => setOrc(o => ({ ...o, frete: v }))} />
            </label>
            <label className="vend-mini">
              <span>{t.impostos}</span>
              <CampoValor moeda valor={orc.impostosDeducao} rotulo={t.impostos} placeholder="0,00" aoMudar={v => setOrc(o => ({ ...o, impostosDeducao: v }))} />
            </label>
          </div>

          <h2>{t.logistica}</h2>
          <p className="vend-editor__dica">{t.logisticaDica}</p>
          <div className="vend-grade2 vend-campo--largo">
            <label className="vend-mini">
              <span>{t.cubagem}</span>
              <CampoValor casas={6} valor={lg.cubagemM3} rotulo={t.cubagem} placeholder="0,000000" aoMudar={v => mudarLogistica({ cubagemM3: v })} />
            </label>
            <label className="vend-mini">
              <span>{t.volumes}</span>
              <CampoValor casas={0} valor={lg.volumes === undefined ? undefined : String(lg.volumes)} rotulo={t.volumes} placeholder="0" aoMudar={v => mudarLogistica({ volumes: v === undefined ? undefined : Number(v) })} />
            </label>
            <label className="vend-mini">
              <span>{t.pesoLiquido}</span>
              <CampoValor casas={4} valor={lg.pesoLiquidoKg} rotulo={t.pesoLiquido} placeholder="0,0000" aoMudar={v => mudarLogistica({ pesoLiquidoKg: v })} />
            </label>
            <label className="vend-mini">
              <span>{t.pesoBruto}</span>
              <CampoValor casas={4} valor={lg.pesoBrutoKg} rotulo={t.pesoBruto} placeholder="0,0000" aoMudar={v => mudarLogistica({ pesoBrutoKg: v })} />
            </label>
          </div>
        </div>
      )}

      <div className="adm-bloco vend-editor__dados vend-secao" id={idSecao('documento')}>
        <h2>{t.documentoSecao}</h2>
        <Campo rotulo={t.codigoVenda} dica={t.codigoVendaDica} erro={tem('codigoVenda') ? t.erros.codigoVenda : undefined}>
          <input id="vend-codigo-venda" value={orc.codigoVenda ?? ''} maxLength={CODIGO_VENDA_MAX} onChange={ev => setOrc(o => ({ ...o, codigoVenda: ev.target.value }))} />
        </Campo>
        <Campo rotulo={t.validade} erro={tem('validade') ? t.erros.validade : undefined}>
          <input id="vend-validade" type="date" min={hoje} value={orc.validade ?? ''} aria-invalid={tem('validade') || undefined} onChange={ev => setOrc(o => ({ ...o, validade: ev.target.value || undefined }))} />
        </Campo>
        <Campo rotulo={t.observacao} largo>
          <textarea id="vend-obs" value={orc.observacao} maxLength={OBS_MAX} rows={2} onChange={ev => setOrc(o => ({ ...o, observacao: ev.target.value }))} />
        </Campo>
      </div>

      {salvo && <Resultado orc={salvo} avisar={avisar} refEl={resultadoRef} />}

      {orc.itens.length > 0 && (
        // Barra fixa: atalhos das seções, o total e o salvar sempre à vista.
        <div className="vend-barra">
          <nav className="vend-atalhos" aria-label={t.secoesRotulo}>
            {SECOES.filter(s => s !== 'valores' || orc.itens.length > 0).map(s => (
              <button key={s} type="button" className={secoesComErro.has(s) ? 'vend-atalho--erro' : undefined} onClick={() => irPara(s)} aria-label={secoesComErro.has(s) ? `${t.secoes[s]}, ${t.comErro}` : undefined}>
                {t.secoes[s]}
              </button>
            ))}
          </nav>
          <div className="vend-totais__valor">
            <span>{t.total}</span>
            {calc.comPreco > 0 ? (
              // Só o total e a % de desconto: o valor sem desconto não tem IPI nem ST e não se compara ao total.
              <span className="vend-preco">
                <span>{brl(calc.total)}</span>
                {!calc.desconto.zero && <span className="vend-pct">-{pctTexto(calc.pctDesconto)}</span>}
              </span>
            ) : (
              <span className="vend-consulta">{t.sobConsulta}</span>
            )}
            {calc.semPreco > 0 && calc.comPreco > 0 && <small>{t.semPreco(calc.semPreco)}</small>}
          </div>
          <button type="button" className="adm-btn adm-btn--primario vend-salvar" onClick={salvar}>
            <Icone nome="check" tamanho={18} />
            {editando ? t.salvarAlteracoes : t.salvar}
          </button>
          {erros.length > 0 && (
            <p className="adm-erro vend-barra__erro" role="alert">
              {t.erros.resumo(erros.length)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

type PropsItem = { it: ItemOrcamento; i: number; p: Produto; l?: ItemCalculado; descontoTotal?: Desconto; novo: boolean; erroLado: boolean };

/** Peça fechada: uma linha-resumo que abre ao tocar. */
function ItemResumo({ it, i, p, l, novo, erroLado, abrir }: PropsItem & { abrir: () => void }) {
  const item = dadosDoItem(it, p);
  const img = imagemProduto(p);
  return (
    <li id={`vend-item-${i}`} className={`vend-item vend-item--resumo${novo ? ' vend-item--novo' : ''}${erroLado ? ' vend-item--erro' : ''}`}>
      <button type="button" className="vend-resumo" aria-expanded={false} aria-label={t.abrirPeca(item.descricao)} onClick={abrir}>
        <span className="vend-item__foto">{img && <img src={img.src} alt="" width={56} height={56} loading="lazy" />}</span>
        <span className="vend-resumo__nome">
          <strong>{item.descricao}</strong>
          <small>
            {it.lado && <span className="chip-lado">{it.lado}</span>}
            {erroLado ? <span className="vend-resumo__erro">{t.erros.lado}</span> : item.codigoMk}
          </small>
        </span>
        <span className="vend-resumo__valor">
          {l?.comPreco ? (
            <>
              <strong>{brl(l.total!)}</strong>
              <small>{`${it.quantidade} × ${brl(l.unitario!)}`}</small>
            </>
          ) : (
            <>
              <span className="vend-consulta">{t.sobConsulta}</span>
              <small>{`${it.quantidade} ${item.unidade}`}</small>
            </>
          )}
        </span>
        <Icone nome="chevron" tamanho={18} className="vend-resumo__seta" />
      </button>
    </li>
  );
}

/** Peça aberta: lado, quantidade, preço, desconto e os dados do cadastro (recolhidos). */
function ItemAberto({
  it,
  i,
  p,
  l,
  descontoTotal,
  novo,
  erroLado,
  mudarItem,
  dividirPar,
  remover,
  fechar,
}: PropsItem & { mudarItem: (i: number, f: (it: ItemOrcamento) => ItemOrcamento) => void; dividirPar: (i: number) => void; remover: (i: number) => void; fechar: () => void }) {
  const item = dadosDoItem(it, p);
  const img = imagemProduto(p);
  const semPreco = it.preco === undefined;
  const origem = l?.pctDesconto ? origemDesconto(it, descontoTotal) : undefined;
  const fiscal = [it.ipiPct && !Dec.de(it.ipiPct).zero && `IPI ${pctFiscal(Dec.de(it.ipiPct))}`, it.st && !Dec.de(it.st).zero && `ST ${brl(Dec.de(it.st))}`].filter(Boolean).join(' · ');
  return (
    <li id={`vend-item-${i}`} className={`vend-item vend-item--aberto${novo ? ' vend-item--novo' : ''}`}>
      <span className="vend-item__foto">{img && <img src={img.src} alt="" width={56} height={56} loading="lazy" />}</span>
      <div className="vend-item__nome">
        <strong>{item.descricao}</strong>
        <small>{[item.codigoMk, item.codigoOriginal && `${t.compativel} ${item.codigoOriginal}`].filter(Boolean).join(' · ')}</small>
      </div>
      <button type="button" className="adm-icone-btn vend-item__fechar" aria-expanded aria-label={t.fecharPeca} onClick={fechar}>
        <Icone nome="chevron" tamanho={18} />
      </button>
      <div className="vend-item__campos">
        {temLados(p) && (
          <div className="vend-mini vend-mini--lado">
            <span>{t.lado}</span>
            <span className={`vend-segmento${erroLado ? ' vend-segmento--erro' : ''}`} role="group" aria-label={`${t.lado}: ${p.nome}`} aria-invalid={erroLado || undefined}>
              {(['LD', 'LE'] as const).map(lado => (
                <button key={lado} type="button" aria-pressed={it.lado === lado} onClick={() => mudarItem(i, x => ({ ...x, lado, codigoOriginal: x.lado === lado ? x.codigoOriginal : undefined }))}>
                  {lado}
                </button>
              ))}
              <button type="button" aria-pressed={false} onClick={() => dividirPar(i)} title={t.parDica}>
                {t.par}
              </button>
            </span>
            {erroLado && <small className="vend-campo__erro">{t.erros.lado}</small>}
          </div>
        )}
        <div className="vend-mini vend-mini--qtd">
          <span>{t.quantidade}</span>
          <Quantidade valor={it.quantidade} onChange={n => mudarItem(i, x => ({ ...x, quantidade: n }))} rotulo={`${t.quantidade}: ${p.nome}`} pequeno />
        </div>
        <label className="vend-mini vend-mini--preco">
          <span>{t.preco}</span>
          {/* Sem preço, a peça fica sob consulta e o desconto dela some (não entra em nenhum cálculo). */}
          <CampoValor moeda valor={it.preco} rotulo={`${t.preco}: ${p.nome}`} placeholder={t.precoDica} aoMudar={v => mudarItem(i, x => ({ ...x, preco: v, desconto: v === undefined ? undefined : x.desconto }))} />
        </label>
        <div className="vend-mini vend-mini--desc">
          <span>{t.desconto}</span>
          <CampoDesconto id={`vend-item-${i}-desconto`} desabilitado={semPreco} desconto={it.desconto} rotulo={`${t.desconto}: ${p.nome}`} aoMudar={d => mudarItem(i, x => ({ ...x, desconto: d }))} />
        </div>
      </div>
      <details className="vend-item__mais">
        <summary>
          <span>{t.maisDados}</span>
          {fiscal && <small>{fiscal}</small>}
        </summary>
        <div className="vend-item__fiscal">
          <Campo rotulo={t.descricao} largo acao={it.descricao !== undefined && <Restaurar aoRestaurar={() => mudarItem(i, x => ({ ...x, descricao: undefined }))} />}>
            <input value={it.descricao ?? p.nome} maxLength={160} onChange={ev => mudarItem(i, x => ({ ...x, descricao: ev.target.value === p.nome ? undefined : ev.target.value }))} />
          </Campo>
          <Campo rotulo={t.compativel} dica={t.compativelDica} acao={it.codigoOriginal !== undefined && <Restaurar aoRestaurar={() => mudarItem(i, x => ({ ...x, codigoOriginal: undefined }))} />}>
            <input
              value={it.codigoOriginal ?? compativelDoCatalogo(p, it.lado)}
              maxLength={120}
              onChange={ev => mudarItem(i, x => ({ ...x, codigoOriginal: ev.target.value === compativelDoCatalogo(p, x.lado) ? undefined : ev.target.value }))}
            />
          </Campo>
          <Campo rotulo={t.unidade}>
            <input value={it.unidade ?? ''} placeholder="PC" maxLength={6} onChange={ev => mudarItem(i, x => ({ ...x, unidade: ev.target.value.toUpperCase() || undefined }))} />
          </Campo>
          <Campo rotulo={t.ipi}>
            <CampoValor valor={it.ipiPct} rotulo={`${t.ipi}: ${p.nome}`} placeholder="0" aoMudar={v => mudarItem(i, x => ({ ...x, ipiPct: v }))} />
          </Campo>
          <Campo rotulo={t.st}>
            <CampoValor moeda valor={it.st} rotulo={`${t.st}: ${p.nome}`} placeholder="0,00" aoMudar={v => mudarItem(i, x => ({ ...x, st: v }))} />
          </Campo>
          <p className="vend-item__dica">{t.fiscalDica}</p>
        </div>
      </details>
      <div className="vend-item__valor">
        {l?.comPreco ? (
          <>
            <Preco antigo={l.preco!} novo={l.liquido!} pct={l.pctDesconto} />
            {origem && <small className="vend-item__origem">{origem}</small>}
            {!l.ipiPct.zero && <small>{t.comIpi(brl(l.unitario!))}</small>}
            {it.quantidade > 1 && <small>{`${it.quantidade} × = ${brl(l.total!)}`}</small>}
          </>
        ) : (
          <span className="vend-consulta">{t.sobConsulta}</span>
        )}
      </div>
      <button type="button" className="adm-icone-btn vend-item__remover" aria-label={t.remover(item.descricao)} onClick={() => remover(i)}>
        <Icone nome="lixeira" tamanho={18} />
      </button>
    </li>
  );
}

function Resultado({ orc, avisar, refEl }: { orc: Orcamento; avisar: (t: string) => void; refEl: RefObject<HTMLDivElement | null> }) {
  const link = linkDoOrcamento(orc);
  const enviar = async () => {
    const r = await enviarLink(orc);
    if (r === 'copiado') avisar(tl.copiado);
    if (r === 'falhou') avisar(tl.falhouCopiar);
  };
  const copiar = async () => avisar((await copiarLink(orc)) === 'copiado' ? tl.copiado : tl.falhouCopiar);
  return (
    <div ref={refEl} className="adm-bloco vend-resultado" role="region" aria-labelledby="vend-resultado-titulo">
      <h2 id="vend-resultado-titulo">{t.resultado}</h2>
      <p>{t.resultadoApoio}</p>
      <div className="vend-orc__acoes">
        <button type="button" className="adm-btn adm-btn--primario vend-enviar" onClick={enviar}>
          <Icone nome="whatsapp" tamanho={18} />
          {tl.enviar}
        </button>
        <button type="button" className="adm-btn adm-btn--fantasma" onClick={copiar}>
          <Icone nome="copiar" tamanho={16} />
          {tl.copiar}
        </button>
        <a className="adm-btn adm-btn--fantasma" href={link} target="_blank" rel="noopener">
          {tl.abrir}
        </a>
        <Link className="adm-btn adm-btn--fantasma" href={`/vendedor/documento?id=${orc.id}`}>
          <Icone nome="caixa" tamanho={16} />
          {t.documento}
        </Link>
      </div>
      <details className="vend-resultado__link">
        <summary>{t.verLink}</summary>
        <code>{link}</code>
      </details>
      <Link className="vend-outro" href="/vendedor/novo">
        <Icone nome="mais" tamanho={16} />
        {t.outro}
      </Link>
    </div>
  );
}
