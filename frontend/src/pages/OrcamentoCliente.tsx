/*
 * Página do orçamento aberta pelo link do vendedor (/orcamento?o=…, RN-13, RF-33, REU-05).
 * Mostra itens, preço antigo riscado, novo preço e porcentagem, total; atribui a sessão ao vendedor
 * dono (RN-07) e trava a escolha de outro vendedor. O cliente altera quantidades, remove itens e
 * adiciona peças do catálogo (entram "sob consulta"); cada mudança vai para o aviso "Alterado pelo
 * cliente" do vendedor (mesmo navegador, demonstração). Ações só para o vendedor dono: "Enviar minha
 * lista para <nome>" (a lista atual, numa barra fixa com o total, pensada para o celular) e "Falar com
 * <nome>". Link expirado ou excluído não mostra o orçamento; link inválido oferece a loja e o catálogo.
 */
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link, useRouter } from '../router';
import { codigoDoLado, formatarPreco, imagemProduto, listarProdutos, normalizar, obterProduto, temLados, type Lado } from '../content/catalogo';
import { empresa, mensagens, textos, whatsapp } from '../content/site';
import { obterVendedor } from '../content/vendedores';
import { useOrcamento } from '../orcamento/OrcamentoContext';
import { mensagemLista } from '../orcamento/lista';
import { aplicarParametroVendedor } from '../rastreio/vendedor';
import { gravar, lerJson } from '../rastreio/armazenamento';
import { calcularItem, calcularTotais, decodificarLink, expirado, formatarPorcentagem, type ItemOrcamento, type Orcamento } from '../vendedor/orcamento';
import { obterOrcamento, registrarAlteracao } from '../vendedor/armazem';
import { Icone } from '../components/Icons';
import { Quantidade } from '../components/Quantidade';
import { AvisoHorario } from '../components/AvisoHorario';

const t = textos.orcamentoCliente;
const chaveCliente = (id: string) => `mk-orcamento-cliente-${id}`;
const validaItens = (d: unknown) => (Array.isArray(d) ? (d as ItemOrcamento[]) : null);

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
  const totais = calcularTotais({ itens, descontoTotal: o.descontoTotal });
  const mensagem = `${mensagemLista({ itens: itens.map(({ slug, lado, quantidade }) => ({ slug, lado, quantidade })), observacao: o.observacao }, vendedor?.nome)}\n\n${t.referencia(o.id)}`;
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
        <h1 id="orcl-titulo">{o.cliente ? t.paraCliente(o.cliente) : t.titulo}</h1>
        <p className="orcl__meta">
          {t.criado(data(o.criadoEm))}
          {o.validade && ` · ${t.valido(data(o.validade))}`}
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
          const l = calcularItem(i);
          const img = imagemProduto(p);
          return (
            <li key={`${i.slug}-${i.lado ?? ''}-${k}`} data-chave={`${i.slug}:${i.lado ?? ''}`} className={`orcl__item${realce.includes(`${i.slug}:${i.lado ?? ''}`) ? ' orcl__item--novo' : ''}`}>
              <span className="orcl__foto">{img && <img src={img.src} alt="" width={72} height={72} loading="lazy" />}</span>
              <div className="orcl__info">
                <strong>{p.nome}</strong>
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
                  {codigoDoLado(p, i.lado) ?? p.codigo}
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
                    {l.pct > 0 && <s>{formatarPreco(l.unitario)}</s>}
                    <strong>{formatarPreco(l.unitarioFinal)}</strong>
                    {l.pct > 0 && <span className="orcl__pct">-{formatarPorcentagem(l.pct)}</span>}
                    <small>{i.quantidade > 1 ? t.linha(i.quantidade, formatarPreco(l.total)) : t.porUnidade}</small>
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
          {totais.subtotal > 0 ? (
            <div className="orcl__total-valor">
              {totais.pct > 0 && <s>{formatarPreco(totais.subtotal)}</s>}
              <strong>{formatarPreco(totais.total)}</strong>
              {totais.pct > 0 && <span className="orcl__pct">-{formatarPorcentagem(totais.pct)}</span>}
            </div>
          ) : (
            <strong>{t.sobConsulta}</strong>
          )}
          {totais.semPreco > 0 && totais.subtotal > 0 && <small>{t.semPreco(totais.semPreco)}</small>}
        </div>
        <a className="btn btn--primario btn--lg orcl__enviar" href={whatsapp(vendedor!.whatsapp, mensagem)} target="_blank" rel="noopener" onClick={solicitar}>
          <Icone nome="whatsapp" tamanho={22} />
          <span className="btn__texto">{t.solicitar(vendedor!.nome)}</span>
        </a>
      </div>
    </section>
  );
}
