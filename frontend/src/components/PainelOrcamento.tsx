/*
 * Lista de orçamento em painel lateral (tela cheia no celular), em todas as rotas (RF-16 a RF-18).
 * Itens com miniatura, lado, código, quantidade e preço unitário só em promoção; sem total (RN-04).
 * Diálogo modal: foco preso no painel, Esc fecha e devolve o foco a quem abriu.
 * Fim da lista (DEC-017, RN-11, RN-12): "Solicitar orçamento" vai ao vendedor do link (atendimento
 * travado) ou, sem link, ao vendedor da vez no rodízio. Sem link, acima do botão, o cliente pode
 * marcar um vendedor (opcional); o botão envia para o marcado e a escolha consome a vez (RN-12).
 * O painel rola por inteiro (itens, observação, prévia, aviso, limpar) e só a ação fica presa embaixo
 * (revisão impeccable: o rodapé fixo ocupava até 80% do painel e escondia os itens no celular).
 */
import { useEffect, useRef, useState, type MouseEvent, type WheelEvent } from 'react';
import { codigoDoLado, formatarPreco, imagemProduto, obterProduto } from '../content/catalogo';
import { textos } from '../content/site';
import { iniciais } from '../content/vendedores';
import { useOrcamento } from '../orcamento/OrcamentoContext';
import { OBS_MAX } from '../orcamento/lista';
import { Link } from '../router';
import { Icone } from './Icons';
import { Quantidade } from './Quantidade';
import { Button } from './Button';
import { AvisoHorario } from './AvisoHorario';

export function PainelOrcamento() {
  const o = useOrcamento();
  const painel = useRef<HTMLDivElement>(null);
  const fecharBtn = useRef<HTMLButtonElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  // Vendedor marcado na escolha manual (só sem vendedor do link); vazio = vendedor da vez.
  const [marcado, setMarcado] = useState<string | null>(null);

  useEffect(() => {
    if (o.aberta) {
      origem.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => fecharBtn.current?.focus());
    } else {
      setConfirmando(false);
      setMarcado(null);
      origem.current?.focus?.();
    }
  }, [o.aberta]);

  useEffect(() => {
    if (!o.aberta) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') o.fechar();
      if (e.key !== 'Tab' || !painel.current) return;
      const focaveis = painel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, [tabindex="0"]');
      if (!focaveis.length) return;
      const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [o.aberta, o.fechar]);

  const vazia = !o.lista.itens.length;
  const escolhido = !o.vendedor && marcado ? o.ativos.find(v => v.codigo === marcado) : undefined;
  const urlBotao = escolhido ? o.urlPara(escolhido) : o.urlEnvio;
  // Abre o WhatsApp com a URL deste instante e só depois registra o pedido: enviar() avança a fila e
  // muda o link do botão, e o React poderia trocar o href antes de o navegador segui-lo (pedido iria
  // para o vendedor seguinte).
  const solicitar = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open(urlBotao, '_blank', 'noopener');
    o.enviar(escolhido);
    setMarcado(null);
  };
  // Faixa de vendedores: setas ‹ › no desktop (só aparecem quando há para onde rolar) e a roda do
  // mouse rola na horizontal; no celular, arrastar com o dedo.
  const faixa = useRef<HTMLUListElement>(null);
  const [setas, setSetas] = useState({ esq: false, dir: false });
  const medirFaixa = () => {
    const f = faixa.current;
    if (!f) return;
    setSetas({ esq: f.scrollLeft > 4, dir: f.scrollLeft + f.clientWidth < f.scrollWidth - 4 });
  };
  const rolarFaixa = (e: WheelEvent<HTMLUListElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY;
  };
  const passarFaixa = (sentido: 1 | -1) => faixa.current?.scrollBy({ left: sentido * faixa.current.clientWidth * 0.7, behavior: 'smooth' });
  useEffect(() => {
    if (!o.aberta) return;
    const id = requestAnimationFrame(medirFaixa);
    window.addEventListener('resize', medirFaixa);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', medirFaixa);
    };
  }, [o.aberta, o.vendedor, o.lista.itens.length]);

  return (
    <div className={`orc${o.aberta ? ' orc--aberta' : ''}`} inert={!o.aberta}>
      <div className="orc__veu" onClick={o.fechar} aria-hidden="true" />
      <div ref={painel} className="orc__painel" role="dialog" aria-modal="true" aria-labelledby="orc-titulo" data-lenis-prevent>
        <header className="orc__topo">
          <div>
            <h2 id="orc-titulo">{textos.orcamento.titulo}</h2>
            <p>{textos.orcamento.itens(o.totais.itens, o.totais.unidades)}</p>
          </div>
          <button ref={fecharBtn} type="button" className="orc__fechar" onClick={o.fechar} aria-label={textos.orcamento.fechar}>
            <Icone nome="fechar" tamanho={24} />
          </button>
        </header>

        {vazia ? (
          <div className="orc__vazia">
            <Icone nome="lista" tamanho={40} />
            <p>{textos.orcamento.vazio}</p>
            <Button href="/catalogo" onClick={o.fechar} iconeFim="seta">
              {textos.orcamento.irCatalogo}
            </Button>
          </div>
        ) : (
          <>
            <div className="orc__corpo">
              <ul className="orc__itens">
                {o.lista.itens.map(i => {
                  const p = obterProduto(i.slug);
                  if (!p) return null;
                  const img = imagemProduto(p);
                  const codigo = codigoDoLado(p, i.lado);
                  return (
                    <li key={`${i.slug}:${i.lado ?? ''}`} className={`orc__item${p.promocao ? ' orc__item--promo' : ''}`}>
                      <span className="orc__mini">{img && <img src={img.src} alt="" width={img.largura} height={img.altura} loading="lazy" />}</span>
                      <div className="orc__info">
                        <Link href={`/produto/${p.slug}`} onClick={o.fechar} className="orc__nome">
                          {p.nome}
                        </Link>
                        <p className="orc__det">
                          {i.lado && <span className="chip-lado">{i.lado}</span>}
                          {codigo && <span className="orc__cod">{codigo}</span>}
                          {p.promocao && <span className="orc__preco">{textos.orcamento.precoUn(formatarPreco(p.promocao.preco))}</span>}
                        </p>
                        <div className="orc__linha">
                          <Quantidade valor={i.quantidade} onChange={q => o.alterar(i.slug, i.lado, q)} rotulo={`${textos.produto.quantidade}: ${p.nome}${i.lado ? ` ${i.lado}` : ''}`} pequeno />
                          <button type="button" className="orc__remover" onClick={() => o.remover(i.slug, i.lado)} aria-label={textos.orcamento.remover(`${p.nome}${i.lado ? ` ${i.lado}` : ''}`)}>
                            <Icone nome="lixeira" tamanho={20} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="orc__extras">
                <label className="orc__obs">
                  <span>{textos.orcamento.observacao}</span>
                  <textarea value={o.lista.observacao} maxLength={OBS_MAX} rows={2} placeholder={textos.orcamento.observacaoAjuda} onChange={e => o.observar(e.target.value)} />
                  {o.lista.observacao.length > OBS_MAX * 0.8 && <small aria-hidden="true">{textos.orcamento.caracteres(o.lista.observacao.length)}</small>}
                </label>
                <details className="orc__previa">
                  <summary>{textos.orcamento.previa}</summary>
                  <pre>{escolhido ? o.mensagemPara(escolhido) : o.mensagemEnvio}</pre>
                </details>
                <p className="orc__aviso">{textos.orcamento.aviso}</p>
                {confirmando ? (
                  <div className="orc__confirmar" role="group" aria-label={textos.orcamento.confirmarLimpar}>
                    <span>{textos.orcamento.confirmarLimpar}</span>
                    <button type="button" onClick={() => { o.limpar(); setConfirmando(false); }}>{textos.orcamento.sim}</button>
                    <button type="button" onClick={() => setConfirmando(false)}>{textos.orcamento.nao}</button>
                  </div>
                ) : (
                  <button type="button" className="orc__limpar" onClick={() => setConfirmando(true)}>
                    <Icone nome="lixeira" tamanho={18} />
                    {textos.orcamento.limpar}
                  </button>
                )}
              </div>
            </div>
            <footer className="orc__rodape">
              <AvisoHorario />
              {!o.vendedor && o.ativos.length > 1 && (
                <section className="orc__escolha" aria-labelledby="orc-escolha">
                  <h3 id="orc-escolha">{textos.orcamento.escolher}</h3>
                  <div className={`orc__faixa${setas.esq ? ' orc__faixa--esq' : ''}${setas.dir ? ' orc__faixa--dir' : ''}`}>
                    <button type="button" className="orc__seta orc__seta--esq" onClick={() => passarFaixa(-1)} aria-label={textos.orcamento.vendedoresAnteriores} tabIndex={-1} hidden={!setas.esq}>
                      <Icone nome="setaEsq" tamanho={18} />
                    </button>
                    <ul ref={faixa} onWheel={rolarFaixa} onScroll={medirFaixa}>
                      {o.ativos.map(v => (
                        <li key={v.codigo}>
                          <button type="button" aria-pressed={marcado === v.codigo} onClick={() => setMarcado(m => (m === v.codigo ? null : v.codigo))}>
                            <span className="orc__avatar" aria-hidden="true">
                              {marcado === v.codigo ? <Icone nome="check" tamanho={18} /> : v.foto ? <img src={v.foto} alt="" width={40} height={40} loading="lazy" /> : iniciais(v.nome)}
                            </span>
                            <span className="orc__vend-nome">{v.nome}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="orc__seta orc__seta--dir" onClick={() => passarFaixa(1)} aria-label={textos.orcamento.maisVendedores} tabIndex={-1} hidden={!setas.dir}>
                      <Icone nome="seta" tamanho={18} />
                    </button>
                  </div>
                </section>
              )}
              <a className="btn btn--primario btn--lg orc__enviar" href={urlBotao} target="_blank" rel="noopener" onClick={solicitar} aria-describedby="orc-destino">
                <Icone nome="whatsapp" tamanho={22} />
                <span className="btn__texto">{textos.orcamento.enviar}</span>
              </a>
              <p id="orc-destino" className="orc__destino">
                {o.vendedor ? textos.orcamento.comVendedor(o.vendedor.nome) : escolhido ? textos.orcamento.paraEscolhido(escolhido.nome) : o.daVez ? textos.orcamento.daVez(o.daVez.nome) : textos.orcamento.semVendedor}
                {escolhido && (
                  <button type="button" className="orc__desmarcar" onClick={() => setMarcado(null)}>
                    {textos.orcamento.voltarDaVez}
                  </button>
                )}
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
