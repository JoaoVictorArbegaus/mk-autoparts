/*
 * Novo orçamento / editar (RN-13, RF-30, RF-31), pensado para o celular (revisão impeccable), com os
 * campos do documento pedido pela MK (docs/pfd-regras, especificação do orçamento):
 * peças primeiro (busca que sobe para o topo ao tocar; lado em LD | LE | Par; preço vazio = sob consulta;
 * item em promoção parte do preço promocional; desconto em % ou R$; descrição, Nº compatível, unidade,
 * IPI e ST editáveis sem mudar o catálogo), depois o cliente (empresa ou pessoa física), entrega e
 * pagamento, desconto no total, frete e impostos, cubagem e pesos, e por fim código de venda,
 * validade e observação. Valores digitados viram texto decimal (nunca ponto flutuante). Uma barra
 * fixa embaixo mostra o total e "Salvar e gerar link".
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, useRouter } from '../router';
import { areaVendedor } from '../content/vendedor';
import { imagemProduto, listarProdutos, normalizar, obterProduto, temLados } from '../content/catalogo';
import type { Vendedor } from '../content/vendedores';
import { Icone } from '../components/Icons';
import { Quantidade } from '../components/Quantidade';
import { OBS_MAX } from '../orcamento/lista';
import { copiarLink, enviarLink, linkDoOrcamento, novoIdOrcamento, obterOrcamento, proximoNumero, salvarOrcamento } from './armazem';
import { Dec, brl, lerDecimal, num, pctTexto } from './decimal';
import { cnpjValido, cpfValido } from './documentos';
import { compativelDoCatalogo, dadosDoItem, itensDoCatalogo } from './itens';
import {
  CODIGO_VENDA_MAX,
  calcularOrcamento,
  clienteVazio,
  limparOrcamento,
  validarOrcamento,
  type ClienteOrcamento,
  type Desconto,
  type EntregaOrcamento,
  type ItemOrcamento,
  type Logistica,
  type Orcamento,
} from './orcamento';

const t = areaVendedor.editor;
const tl = areaVendedor.lista;

const mostrarValor = (v: string | undefined, moeda: boolean) => (v === undefined ? '' : moeda ? num(Dec.de(v)) : v.replace('.', ','));

/**
 * Campo de valor com texto livre (aceita vírgula e milhar). Propaga só valores válidos, como texto
 * decimal com até `casas` casas; moeda formata ao sair do campo ("1.234,50").
 */
function CampoValor({ valor, aoMudar, rotulo, placeholder, moeda = false, casas = 2, invalido: invalidoFora = false }: { valor: string | undefined; aoMudar: (v: string | undefined) => void; rotulo: string; placeholder?: string; moeda?: boolean; casas?: number; invalido?: boolean }) {
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
      className={`vend-valor${moeda ? ' vend-valor--moeda' : ''}${invalido ? ' vend-valor--erro' : ''}`}
      inputMode="decimal"
      value={texto}
      placeholder={placeholder}
      aria-label={rotulo}
      aria-invalid={invalido || undefined}
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

function CampoDesconto({ desconto, aoMudar, rotulo }: { desconto?: Desconto; aoMudar: (d?: Desconto) => void; rotulo: string }) {
  // O tipo pode ser escolhido antes do valor; sem valor (ou zero), não há desconto.
  const [tipoLocal, setTipoLocal] = useState<Desconto['tipo']>(desconto?.tipo ?? 'percentual');
  const tipo = desconto?.tipo ?? tipoLocal;
  const trocar = (novo: Desconto['tipo']) => {
    setTipoLocal(novo);
    if (desconto) aoMudar({ ...desconto, tipo: novo });
  };
  const acimaDe100 = tipo === 'percentual' && !!desconto?.valor && Dec.de(desconto.valor).comparar(100) > 0;
  return (
    <span className="vend-desconto">
      <CampoValor valor={desconto?.valor} rotulo={rotulo} placeholder="0" invalido={acimaDe100} aoMudar={v => aoMudar(v && !Dec.de(v).zero ? { tipo, valor: v } : undefined)} />
      <span className="vend-segmento" role="group" aria-label={`${rotulo}: tipo`}>
        <button type="button" aria-pressed={tipo === 'percentual'} onClick={() => trocar('percentual')}>
          %
        </button>
        <button type="button" aria-pressed={tipo === 'valor'} onClick={() => trocar('valor')}>
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

function Campo({ rotulo, dica, erro, children, largo = false }: { rotulo: string; dica?: string; erro?: string; children: ReactNode; largo?: boolean }) {
  return (
    <label className={`adm-campo${largo ? ' vend-campo--largo' : ''}`}>
      <span>{rotulo}</span>
      {children}
      {erro ? <small className="vend-campo__erro">{erro}</small> : dica && <small>{dica}</small>}
    </label>
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
  const [erro, setErro] = useState('');
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
    avisar(t.parAdicionado(p.nome));
  };
  const adicionar = (slug: string) => {
    const p = obterProduto(slug);
    if (!p) return;
    const preco = p.promocao ? Dec.de(String(p.promocao.preco)).texto(2) : undefined;
    setOrc(o => ({ ...o, itens: [...o.itens, { slug, lado: temLados(p) ? 'LD' : undefined, quantidade: 1, preco }] }));
    setQ('');
    setSalvo(null);
  };

  const calc = calcularOrcamento(orc);
  const c = orc.cliente;
  const pj = c.tipo === 'PJ';
  const docInvalido = !!c.documento?.trim() && !(pj ? cnpjValido(c.documento) : cpfValido(c.documento));

  const salvar = () => {
    const final = limparOrcamento({ ...orc, numero: orc.numero ?? undefined, estado: 'ativo' });
    const erros = validarOrcamento(final);
    if (erros.length) return setErro(t.erros[erros[0]]);
    setErro('');
    const comNumero = { ...final, numero: final.numero ?? proximoNumero() };
    salvarOrcamento(comNumero);
    setOrc(comNumero);
    setSalvo(comNumero);
    setEditando(true);
    avisar(t.salvo);
    if (idEditar !== comNumero.id) navegar(`/vendedor/novo?id=${comNumero.id}`, { substituir: true, manterRolagem: true });
    requestAnimationFrame(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const lg = orc.logistica ?? {};
  const e = orc.entrega;

  return (
    <section className="adm-tela vend-tela vend-editor" aria-labelledby="vend-editor-titulo">
      <div className="adm-tela__cabeca">
        <h1 id="vend-editor-titulo">{editando ? t.tituloEditar : t.titulo}</h1>
      </div>

      <div className="adm-bloco">
        <div className="vend-busca">
          <label htmlFor="vend-busca">{t.buscar}</label>
          <div className="adm-campo--busca">
            <Icone nome="busca" tamanho={18} />
            <input
              id="vend-busca"
              type="search"
              value={q}
              placeholder={t.buscarDica}
              onChange={ev => setQ(ev.target.value)}
              // No celular, o campo sobe para o topo: os resultados não ficam sob o teclado.
              onFocus={ev => {
                if (window.matchMedia('(max-width: 859px)').matches) ev.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
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
              const l = calc.itens[i];
              const item = dadosDoItem(it, p);
              const img = imagemProduto(p);
              return (
                <li key={`${it.slug}-${i}`} className={`vend-item${destaque.includes(`${it.slug}:${it.lado}`) ? ' vend-item--novo' : ''}`}>
                  <span className="vend-item__foto">{img && <img src={img.src} alt="" width={56} height={56} loading="lazy" />}</span>
                  <div className="vend-item__nome">
                    <strong>{item.descricao}</strong>
                    <small>{[item.codigoMk, item.codigoOriginal && `${t.compativel} ${item.codigoOriginal}`].filter(Boolean).join(' · ')}</small>
                  </div>
                  <div className="vend-item__campos">
                    {temLados(p) && (
                      <div className="vend-mini vend-mini--lado">
                        <span>{t.lado}</span>
                        <span className="vend-segmento" role="group" aria-label={`${t.lado}: ${p.nome}`}>
                          {(['LD', 'LE'] as const).map(lado => (
                            <button key={lado} type="button" aria-pressed={it.lado === lado} onClick={() => mudarItem(i, x => ({ ...x, lado, codigoOriginal: x.lado === lado ? x.codigoOriginal : undefined }))}>
                              {lado}
                            </button>
                          ))}
                          <button type="button" aria-pressed={false} onClick={() => dividirPar(i)} title={t.parDica}>
                            {t.par}
                          </button>
                        </span>
                      </div>
                    )}
                    <div className="vend-mini vend-mini--qtd">
                      <span>{t.quantidade}</span>
                      <Quantidade valor={it.quantidade} onChange={n => mudarItem(i, x => ({ ...x, quantidade: n }))} rotulo={`${t.quantidade}: ${p.nome}`} pequeno />
                    </div>
                    <label className="vend-mini vend-mini--preco">
                      <span>{t.preco}</span>
                      <CampoValor moeda valor={it.preco} rotulo={`${t.preco}: ${p.nome}`} placeholder={t.precoDica} aoMudar={v => mudarItem(i, x => ({ ...x, preco: v }))} />
                    </label>
                    <div className="vend-mini vend-mini--desc">
                      <span>{t.desconto}</span>
                      <CampoDesconto desconto={it.desconto} rotulo={`${t.desconto}: ${p.nome}`} aoMudar={d => mudarItem(i, x => ({ ...x, desconto: d }))} />
                    </div>
                  </div>
                  <details className="vend-item__mais">
                    <summary>{t.maisDados}</summary>
                    <div className="vend-item__fiscal">
                      <Campo rotulo={t.descricao} largo>
                        <input value={it.descricao ?? ''} placeholder={p.nome} maxLength={160} onChange={ev => mudarItem(i, x => ({ ...x, descricao: ev.target.value || undefined }))} />
                      </Campo>
                      <Campo rotulo={t.compativel} dica={t.compativelDica}>
                        <input value={it.codigoOriginal ?? ''} placeholder={compativelDoCatalogo(p, it.lado)} maxLength={120} onChange={ev => mudarItem(i, x => ({ ...x, codigoOriginal: ev.target.value || undefined }))} />
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
                        {!l.ipiPct.zero && <small>{t.comIpi(brl(l.unitario!))}</small>}
                        {it.quantidade > 1 && <small>{`${it.quantidade} × = ${brl(l.total!)}`}</small>}
                      </>
                    ) : (
                      <span className="vend-consulta">{t.sobConsulta}</span>
                    )}
                  </div>
                  <button type="button" className="adm-icone-btn vend-item__remover" aria-label={t.remover(item.descricao)} onClick={() => setOrc(o => ({ ...o, itens: o.itens.filter((_, k) => k !== i) }))}>
                    <Icone nome="lixeira" tamanho={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="adm-bloco vend-editor__dados">
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
          <>
            <Campo rotulo={t.razaoSocial}>
              <input value={c.razaoSocial ?? ''} maxLength={120} required autoComplete="organization" onChange={ev => mudarCliente({ razaoSocial: ev.target.value })} />
            </Campo>
            <Campo rotulo={t.comprador} dica={t.compradorDica}>
              <input value={c.nome ?? ''} maxLength={80} autoComplete="name" onChange={ev => mudarCliente({ nome: ev.target.value })} />
            </Campo>
            <Campo rotulo={t.cnpj} erro={docInvalido ? t.documentoInvalido('CNPJ') : undefined}>
              <input value={c.documento ?? ''} inputMode="numeric" maxLength={18} aria-invalid={docInvalido || undefined} onChange={ev => mudarCliente({ documento: ev.target.value })} />
            </Campo>
            <Campo rotulo={t.inscricaoEstadual}>
              <input value={c.inscricaoEstadual ?? ''} maxLength={20} onChange={ev => mudarCliente({ inscricaoEstadual: ev.target.value })} />
            </Campo>
          </>
        ) : (
          <>
            <Campo rotulo={t.nomePF}>
              <input value={c.nome ?? ''} maxLength={80} required autoComplete="name" onChange={ev => mudarCliente({ nome: ev.target.value })} />
            </Campo>
            <Campo rotulo={t.cpf} erro={docInvalido ? t.documentoInvalido('CPF') : undefined}>
              <input value={c.documento ?? ''} inputMode="numeric" maxLength={14} aria-invalid={docInvalido || undefined} onChange={ev => mudarCliente({ documento: ev.target.value })} />
            </Campo>
          </>
        )}
        <Campo rotulo={t.email}>
          <input type="email" value={c.email ?? ''} maxLength={120} autoComplete="email" onChange={ev => mudarCliente({ email: ev.target.value })} />
        </Campo>
        <Campo rotulo={t.telefone}>
          <input type="tel" value={c.telefone ?? ''} maxLength={20} autoComplete="tel" onChange={ev => mudarCliente({ telefone: ev.target.value })} />
        </Campo>
      </div>

      <div className="adm-bloco vend-editor__dados">
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
        <div className="adm-bloco vend-editor__dados">
          <h2>{t.valores}</h2>
          <div className="vend-mini">
            <span>{t.descontoTotal}</span>
            <CampoDesconto desconto={orc.descontoTotal} rotulo={t.descontoTotal} aoMudar={d => setOrc(o => ({ ...o, descontoTotal: d }))} />
          </div>
          <label className="vend-mini">
            <span>{t.frete}</span>
            <CampoValor moeda valor={orc.frete} rotulo={t.frete} placeholder="0,00" aoMudar={v => setOrc(o => ({ ...o, frete: v }))} />
          </label>
          <label className="vend-mini">
            <span>{t.impostos}</span>
            <CampoValor moeda valor={orc.impostosDeducao} rotulo={t.impostos} placeholder="0,00" aoMudar={v => setOrc(o => ({ ...o, impostosDeducao: v }))} />
          </label>

          <h2>{t.logistica}</h2>
          <p className="vend-editor__dica">{t.logisticaDica}</p>
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
      )}

      <div className="adm-bloco vend-editor__dados">
        <h2>{t.documentoSecao}</h2>
        <Campo rotulo={t.codigoVenda} dica={t.codigoVendaDica}>
          <input value={orc.codigoVenda ?? ''} maxLength={CODIGO_VENDA_MAX} onChange={ev => setOrc(o => ({ ...o, codigoVenda: ev.target.value }))} />
        </Campo>
        <Campo rotulo={t.validade}>
          <input type="date" value={orc.validade ?? ''} onChange={ev => setOrc(o => ({ ...o, validade: ev.target.value || undefined }))} />
        </Campo>
        <Campo rotulo={t.observacao} largo>
          <textarea value={orc.observacao} maxLength={OBS_MAX} rows={2} onChange={ev => setOrc(o => ({ ...o, observacao: ev.target.value }))} />
        </Campo>
      </div>

      {salvo && <Resultado orc={salvo} avisar={avisar} refEl={resultadoRef} />}

      {orc.itens.length > 0 && (
        // Barra fixa: o total e o salvar ficam sempre à vista enquanto o vendedor mexe nos preços.
        <div className="vend-barra">
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
          {erro && (
            <p className="adm-erro" role="alert">
              {erro}
            </p>
          )}
          <button type="button" className="adm-btn adm-btn--primario vend-salvar" onClick={salvar}>
            <Icone nome="check" tamanho={18} />
            {editando ? t.salvarAlteracoes : t.salvar}
          </button>
        </div>
      )}
    </section>
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
