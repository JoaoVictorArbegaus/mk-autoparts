/*
 * Página do orçamento aberta pelo link do vendedor (/orcamento?o=…, RN-13, RF-33, REU-05).
 * Mostra itens, preço antigo riscado, novo preço e porcentagem, total; atribui a sessão ao vendedor
 * dono (RN-07) e trava a escolha de outro vendedor. O cliente altera quantidades, remove itens e
 * adiciona peças do catálogo (entram "sob consulta"); cada mudança vai para o aviso "Alterado pelo
 * cliente" do vendedor (mesmo navegador, demonstração). Ações só para o vendedor dono: "Enviar minha
 * lista para <nome>" (a lista atual, numa barra fixa com o total, pensada para o celular) e "Falar com
 * <nome>". Link expirado ou excluído não mostra o orçamento; link inválido oferece a loja e o catálogo.
 */
import { useEffect, useMemo, useRef, useState, type ComponentType, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useRouter } from '../router';
import { imagemProduto, listarProdutos, normalizar, obterProduto, temLados, type Lado } from '../content/catalogo';
import { documento as doc, primeiroNome } from '../content/documento';
import { empresa, mensagens, textos, whatsapp } from '../content/site';
import { obterVendedor } from '../content/vendedores';
import { useOrcamento } from '../orcamento/OrcamentoContext';
import { mensagemLista } from '../orcamento/lista';
import { aplicarParametroVendedor } from '../rastreio/vendedor';
import { gravar, lerJson } from '../rastreio/armazenamento';
import { calcularOrcamento, decodificarLink, expirado, lerItem, nomeCliente, type ItemOrcamento, type Orcamento } from '../vendedor/orcamento';
import { brl, num, pctFiscal, pctTexto } from '../vendedor/decimal';
import { dadosDoItem, origemDesconto } from '../vendedor/itens';
import type { DadosDocumento } from '../vendedor/Documento';
import { obterOrcamento, registrarAlteracao } from '../vendedor/armazem';
import { Icone } from '../components/Icons';
import { Quantidade } from '../components/Quantidade';
import { AvisoHorario } from '../components/AvisoHorario';

const t = textos.orcamentoCliente;
const chaveCliente = (id: string) => `mk-orcamento-cliente-${id}`;
// Lista ajustada pelo cliente neste navegador (também no formato anterior, com valores em número).
const validaItens = (d: unknown) => (Array.isArray(d) ? d.map(lerItem).filter((i): i is ItemOrcamento => !!i) : null);

type Estado = { tipo: 'carregando' } | { tipo: 'invalido' } | { tipo: 'indisponivel'; orc: Orcamento; motivo: 'expirado' | 'excluido' } | { tipo: 'ok'; orc: Orcamento };

export function OrcamentoCliente() {
  const { busca, montado } = useRouter();
  const { definirVendedor } = useOrcamento();
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [removidos, setRemovidos] = useState(0);
  const [q, setQ] = useState('');
  // Aviso breve ao adicionar peças pela busca (o "Par" adiciona duas de uma vez).
  const [adicionado, setAdicionado] = useState<{ id: number; rotulo: string; nome: string; chaves: string[] } | null>(null);
  const [realce, setRealce] = useState<string[]>([]);
  useEffect(() => {
    if (!adicionado) return;
    const id = window.setTimeout(() => setAdicionado(null), 4000);
    return () => clearTimeout(id);
  }, [adicionado]);
  useEffect(() => {
    if (!realce.length) return;
    const id = window.setTimeout(() => setRealce([]), 2400);
    return () => clearTimeout(id);
  }, [realce]);
  // "Baixar PDF": o mesmo documento do vendedor (sem os dados pessoais, que não vêm no link), impresso
  // pelo navegador ("Salvar como PDF"). O gerador só carrega quando o cliente pede.
  const [impressao, setImpressao] = useState<{ Doc: ComponentType<{ dados: DadosDocumento }>; dados: DadosDocumento } | null>(null);
  const [preparando, setPreparando] = useState(false);
  const folha = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!impressao) return;
    let ativo = true;
    const fim = () => {
      document.documentElement.classList.remove('imprimindo-orcl');
      if (ativo) setImpressao(null);
    };
    (async () => {
      await document.fonts.ready;
      // Espera as fotos das peças antes de abrir a impressão.
      await Promise.all([...(folha.current?.querySelectorAll('img') ?? [])].map(img => img.decode().catch(() => undefined)));
      if (!ativo) return;
      setPreparando(false);
      document.documentElement.classList.add('imprimindo-orcl');
      window.addEventListener('afterprint', fim, { once: true });
      const titulo = document.title;
      document.title = `MKAutoparts-Orcamento-${impressao.dados.numero}`;
      window.print();
      document.title = titulo;
    })();
    return () => {
      ativo = false;
      window.removeEventListener('afterprint', fim);
      document.documentElement.classList.remove('imprimindo-orcl');
    };
  }, [impressao]);

  // "Ver": rola até a peça recém-adicionada (fica acima do campo de busca) e a destaca.
  const verAdicionada = () => {
    if (!adicionado) return;
    document.querySelector(`[data-chave="${adicionado.chaves[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setRealce(adicionado.chaves);
    setAdicionado(null);
  };

  useEffect(() => {
    if (!montado) return;
    const orc = decodificarLink(new URLSearchParams(busca).get('o') ?? '');
    const vendedor = orc && obterVendedor(orc.vendedor);
    if (!orc || !vendedor) return setEstado({ tipo: 'invalido' });
    // O link atribui a sessão ao vendedor dono (RN-07): vale o último link aberto.
    definirVendedor(aplicarParametroVendedor(`?v=${vendedor.codigo}`));
    if (obterOrcamento(orc.id)?.estado === 'excluido') return setEstado({ tipo: 'indisponivel', orc, motivo: 'excluido' });
    if (expirado(orc)) return setEstado({ tipo: 'indisponivel', orc, motivo: 'expirado' });
    // Itens que saíram do catálogo são removidos com aviso (RN-04); as mudanças do cliente ficam neste navegador.
    const base = lerJson(chaveCliente(orc.id), validaItens) ?? orc.itens;
    const validos = base.filter(i => obterProduto(i.slug));
    setRemovidos(base.length - validos.length);
    setItens(validos);
    setEstado({ tipo: 'ok', orc });
  }, [montado, busca, definirVendedor]);

  const orc = estado.tipo === 'ok' || estado.tipo === 'indisponivel' ? estado.orc : null;
  const vendedor = orc ? obterVendedor(orc.vendedor) : undefined;

  const mudar = (proximos: ItemOrcamento[], alteracao: string) => {
    if (!orc) return;
    setItens(proximos);
    gravar(chaveCliente(orc.id), JSON.stringify(proximos));
    registrarAlteracao(orc.id, alteracao);
  };

  const resultados = useMemo(() => {
    const termo = normalizar(q);
    if (termo.length < 2) return [];
    return listarProdutos()
      .filter(p => normalizar(`${p.nome} ${p.codigo ?? ''} ${(p.variantes ?? []).map(v => v.codigo ?? '').join(' ')}`).includes(termo))
      .slice(0, 5);
  }, [q]);

  if (estado.tipo === 'carregando') return <section className="orcl contido"><p className="orcl__carregando">{t.carregando}</p></section>;
  if (estado.tipo === 'invalido')
    return (
      <section className="orcl contido">
        <h1>{t.invalidoTitulo}</h1>
        <p>{t.invalido}</p>
        <div className="orcl__acoes">
          <a className="btn btn--primario btn--lg" href={whatsapp(empresa.whatsapp, mensagens.contato)} target="_blank" rel="noopener">
            <Icone nome="whatsapp" tamanho={22} />
            <span className="btn__texto">{t.falarLoja}</span>
          </a>
          <Link className="btn btn--contorno btn--lg" href="/catalogo">
            <span className="btn__texto">{t.verCatalogo}</span>
          </Link>
        </div>
      </section>
    );

  const falar = vendedor ? whatsapp(vendedor.whatsapp, mensagens.contato.replace('MK Autoparts', vendedor.nome)) : '#';

  if (estado.tipo === 'indisponivel')
    return (
      <section className="orcl contido">
        <h1>{estado.motivo === 'expirado' ? t.expiradoTitulo : t.excluidoTitulo}</h1>
        <p>{estado.motivo === 'expirado' ? t.expirado : t.excluido}</p>
        <a className="btn btn--primario btn--lg" href={falar} target="_blank" rel="noopener">
          <Icone nome="whatsapp" tamanho={22} />
          <span className="btn__texto">{t.falar(vendedor?.nome ?? '')}</span>
        </a>
      </section>
    );

  const o = estado.orc;
  // Mesmo cálculo do PDF e do Word: com a lista do vendedor, os totais são os do documento.
  const calc = calcularOrcamento({ itens, descontoTotal: o.descontoTotal, frete: o.frete, impostosDeducao: o.impostosDeducao });
  const r = doc.rotulos;
  const mensagem = `${mensagemLista({ itens: itens.map(({ slug, lado, quantidade }) => ({ slug, lado, quantidade })), observacao: o.observacao }, vendedor?.nome)}\n\n${t.referencia(o.id)}`;
  const baixarPdf = async () => {
    setPreparando(true);
    try {
      const m = await import('../vendedor/Documento');
      setImpressao({ Doc: m.DocumentoOrcamento, dados: m.montarDocumento({ ...o, itens }, window.location.href) });
    } catch {
      setPreparando(false);
    }
  };
  const solicitar = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open(whatsapp(vendedor!.whatsapp, mensagem), '_blank', 'noopener');
  };
  const nome = (i: ItemOrcamento) => `${obterProduto(i.slug)?.nome ?? i.slug}${i.lado ? ` ${i.lado}` : ''}`;
  const data = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('pt-BR');

  return (
    <section className="orcl contido" aria-labelledby="orcl-titulo">
      <header className="orcl__cabeca">
        <p className="orcl__de">{t.de(vendedor!.nome)}</p>
        <h1 id="orcl-titulo">{nomeCliente(o.cliente) ? t.paraCliente(nomeCliente(o.cliente)) : t.titulo}</h1>
        <p className="orcl__meta">
          {o.numero && `${o.numero} · `}
          {t.criado(data(o.criadoEm))}
          {o.validade && ` · ${t.valido(data(o.validade))}`}
          {o.codigoVenda && ` · ${r.codigoVenda} ${o.codigoVenda}`}
        </p>
      </header>

      {removidos > 0 && (
        <p className="orcl__aviso" role="status">
          {t.removidos}
        </p>
      )}

      <ul className="orcl__itens">
        {itens.map((i, k) => {
          const p = obterProduto(i.slug)!;
          const l = calc.itens[k];
          const item = dadosDoItem(i, p);
          const img = imagemProduto(p);
          return (
            <li key={`${i.slug}-${i.lado ?? ''}-${k}`} data-chave={`${i.slug}:${i.lado ?? ''}`} className={`orcl__item${realce.includes(`${i.slug}:${i.lado ?? ''}`) ? ' orcl__item--novo' : ''}`}>
              <span className="orcl__foto">{img && <img src={img.src} alt="" width={72} height={72} loading="lazy" />}</span>
              <div className="orcl__info">
                <strong>{item.descricao}</strong>
                <span className="orcl__cod">
                  {/* Peça sem preço do vendedor (adicionada pelo cliente ou sob consulta): o cliente pode trocar o lado. */}
                  {i.lado && i.preco === undefined && temLados(p) ? (
                    <span className="orcl__lado" role="group" aria-label={t.escolherLado(p.nome)}>
                      {(['LD', 'LE'] as const).map(lado => (
                        <button key={lado} type="button" aria-pressed={i.lado === lado} onClick={() => i.lado !== lado && mudar(itens.map((x, j) => (j === k ? { ...x, lado } : x)), t.trocouLado(p.nome, lado))}>
                          {lado}
                        </button>
                      ))}
                    </span>
                  ) : (
                    i.lado && <span className="chip-lado">{i.lado}</span>
                  )}
                  {item.codigoMk}
                  {item.codigoOriginal && <span className="orcl__compat">{r.compativel(item.codigoOriginal)}</span>}
                </span>
                <div className="orcl__linha">
                  <Quantidade valor={i.quantidade} rotulo={`${textos.produto.quantidade}: ${nome(i)}`} pequeno onChange={n => mudar(itens.map((x, j) => (j === k ? { ...x, quantidade: n } : x)), t.alterouQtd(nome(i), n))} />
                  <button type="button" className="orc__remover" aria-label={t.remover(nome(i))} onClick={() => mudar(itens.filter((_, j) => j !== k), t.removeu(nome(i)))}>
                    <Icone nome="lixeira" tamanho={20} />
                  </button>
                </div>
              </div>
              <div className="orcl__preco">
                {l.comPreco ? (
                  <>
                    {l.pctDesconto && <s>{brl(l.preco!)}</s>}
                    <strong>{brl(l.liquido!)}</strong>
                    {l.pctDesconto && <span className="orcl__pct">-{pctTexto(l.pctDesconto)}</span>}
                    {l.pctDesconto && origemDesconto(i, o.descontoTotal) && <small className="orcl__origem">{origemDesconto(i, o.descontoTotal)}</small>}
                    <small>{l.ipiPct.zero ? t.porUnidade : t.comIpi(pctFiscal(l.ipiPct), brl(l.unitario!))}</small>
                    {i.quantidade > 1 && <small>{t.linha(i.quantidade, brl(l.total!))}</small>}
                    {!l.st.zero && <small>{t.st(brl(l.st))}</small>}
                  </>
                ) : (
                  <span className="orcl__consulta">{t.sobConsulta}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="orcl__adicionar">
        <label className="orcl__busca">
          <span>{t.adicionar}</span>
          <input type="search" value={q} placeholder={t.adicionarDica} onChange={e => setQ(e.target.value)}
            // No celular, o campo sobe para o topo: os resultados não ficam sob o teclado nem sob a barra fixa.
            onFocus={e => {
              if (window.matchMedia('(max-width: 859px)').matches) e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            autoComplete="off"
            aria-describedby="orcl-add-dica"
          />
          <small id="orcl-add-dica">{t.adicionarAviso}</small>
        </label>
        {q.trim().length >= 2 && (
          <ul className="orcl__resultados">
            {resultados.length ? (
              resultados.map(p => (
                <li key={p.slug} className={temLados(p) ? 'orcl__res-lados' : undefined}>
                  {temLados(p) ? (
                    // Peça com lado: o cliente escolhe LD, LE ou Par (os dois), como no catálogo.
                    <>
                      <span className="orcl__res-nome">{p.nome}</span>
                      <span className="orcl__res-escolha" role="group" aria-label={t.escolherLado(p.nome)}>
                        {(['LD', 'LE', 'Par'] as const).map(escolha => (
                          <button
                            key={escolha}
                            type="button"
                            onClick={() => {
                              const lados: Lado[] = escolha === 'Par' ? ['LD', 'LE'] : [escolha];
                              mudar([...itens, ...lados.map(lado => ({ slug: p.slug, lado, quantidade: 1 }))], t.adicionou(`${p.nome} ${escolha === 'Par' ? 'LD + LE' : escolha}`));
                              setAdicionado({ id: Date.now(), rotulo: escolha === 'Par' ? t.parRotulo : t.adicionadoRotulo, nome: escolha === 'Par' ? `${p.nome} (LD e LE)` : `${p.nome} ${escolha}`, chaves: lados.map(lado => `${p.slug}:${lado}`) });
                              setQ('');
                            }}
                          >
                            {escolha}
                          </button>
                        ))}
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        mudar([...itens, { slug: p.slug, quantidade: 1 }], t.adicionou(p.nome));
                        setAdicionado({ id: Date.now(), rotulo: t.adicionadoRotulo, nome: p.nome, chaves: [`${p.slug}:`] });
                        setQ('');
                      }}
                    >
                      <Icone nome="mais" tamanho={16} />
                      {p.nome}
                    </button>
                  )}
                </li>
              ))
            ) : (
              <li className="orcl__nenhum">{t.nenhum}</li>
            )}
          </ul>
        )}
      </div>

      {calc.comPreco > 0 && (
        // Resumo com as mesmas linhas da caixa de totais do PDF.
        <section className="orcl__resumo" aria-labelledby="orcl-resumo">
          <h2 id="orcl-resumo">{t.resumo}</h2>
          <dl>
            {!calc.desconto.zero && (
              <>
                <dt>{r.semDesconto}</dt>
                <dd>
                  <s>{num(calc.semDesconto)}</s>
                </dd>
                <dt>{r.desconto(pctTexto(calc.pctDesconto))}</dt>
                <dd>− {num(calc.desconto)}</dd>
              </>
            )}
            <dt>{r.valorProdutos}</dt>
            <dd>{num(calc.valorProdutos)}</dd>
            <dt>{r.ipiTotal}</dt>
            <dd>{num(calc.ipi)}</dd>
            <dt>{r.stTotal}</dt>
            <dd>{num(calc.st)}</dd>
            <dt>{r.frete}</dt>
            <dd>{num(calc.frete)}</dd>
            <dt>{r.impostos}</dt>
            <dd>{num(calc.impostos)}</dd>
            <dt className="orcl__resumo-total">{r.valorTotal}</dt>
            <dd className="orcl__resumo-total">{brl(calc.total)}</dd>
          </dl>
          <div className="orcl__pdf">
            <button type="button" className="btn btn--contorno" onClick={baixarPdf} disabled={preparando}>
              <Icone nome="caixa" tamanho={20} />
              <span className="btn__texto">{preparando ? t.preparandoPdf : t.baixarPdf}</span>
            </button>
            <small>{t.baixarPdfDica}</small>
          </div>
        </section>
      )}
      {impressao &&
        createPortal(
          <div className="orcl-impressao" ref={folha} aria-hidden="true">
            <impressao.Doc dados={impressao.dados} />
          </div>,
          document.body,
        )}

      {o.observacao && <p className="orcl__obs">{t.observacao(o.observacao)}</p>}
      <AvisoHorario />
      <a className="btn btn--contorno btn--lg orcl__falar" href={falar} target="_blank" rel="noopener">
        <span className="btn__texto">{t.falar(vendedor!.nome)}</span>
      </a>

      {/* Barra fixa (celular primeiro): o total e o envio sempre à vista, ao alcance do polegar. */}
      <div className="orcl__barra">
        <div className="orcl__avisos" role="status" aria-live="polite">
          {adicionado && (
            <div className="aviso" key={adicionado.id}>
              <Icone nome="check" tamanho={20} />
              <p>
                <b>{adicionado.rotulo}</b> · {adicionado.nome}
              </p>
              <button type="button" onClick={verAdicionada}>
                {t.ver}
              </button>
            </div>
          )}
        </div>
        <div className="orcl__total">
          <span>{t.total}</span>
          {calc.comPreco > 0 ? (
            <div className="orcl__total-valor">
              <strong>{brl(calc.total)}</strong>
              {!calc.desconto.zero && <span className="orcl__pct">-{pctTexto(calc.pctDesconto)}</span>}
            </div>
          ) : (
            <strong>{t.sobConsulta}</strong>
          )}
          {calc.semPreco > 0 && calc.comPreco > 0 && <small>{t.semPreco(calc.semPreco)}</small>}
        </div>
        <a className="btn btn--primario btn--lg orcl__enviar" href={whatsapp(vendedor!.whatsapp, mensagem)} target="_blank" rel="noopener" onClick={solicitar}>
          <Icone nome="whatsapp" tamanho={22} />
          <span className="btn__texto">{t.solicitar(primeiroNome(vendedor!.nome))}</span>
        </a>
      </div>
    </section>
  );
}
