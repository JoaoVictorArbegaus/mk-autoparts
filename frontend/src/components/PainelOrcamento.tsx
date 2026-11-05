/*
 * Lista de orçamento em painel lateral (tela cheia no celular), em todas as rotas (RF-16 a RF-18).
 * Itens com miniatura, lado, código, quantidade e preço unitário só em promoção; sem total (RN-04).
 * Diálogo modal: foco preso no painel, Esc fecha e devolve o foco a quem abriu.
 */
import { useEffect, useRef, useState } from 'react';
import { codigoDoLado, formatarPreco, imagemProduto, obterProduto } from '../content/catalogo';
import { textos } from '../content/site';
import { useOrcamento } from '../orcamento/OrcamentoContext';
import { OBS_MAX } from '../orcamento/lista';
import { Link } from '../router';
import { Icone } from './Icons';
import { Quantidade } from './Quantidade';
import { Button } from './Button';

export function PainelOrcamento() {
  const o = useOrcamento();
  const painel = useRef<HTMLDivElement>(null);
  const fecharBtn = useRef<HTMLButtonElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (o.aberta) {
      origem.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => fecharBtn.current?.focus());
    } else {
      setConfirmando(false);
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
        )}

        {!vazia && (
          <footer className="orc__rodape">
            <label className="orc__obs">
              <span>{textos.orcamento.observacao}</span>
              <textarea value={o.lista.observacao} maxLength={OBS_MAX} rows={2} placeholder={textos.orcamento.observacaoAjuda} onChange={e => o.observar(e.target.value)} />
              <small aria-hidden="true">{textos.orcamento.caracteres(o.lista.observacao.length)}</small>
            </label>
            <details className="orc__previa">
              <summary>{textos.orcamento.previa}</summary>
              <pre>{o.mensagemEnvio}</pre>
            </details>
            <p className="orc__aviso">
              <Icone nome="whatsapp" tamanho={18} />
              {textos.orcamento.aviso}
            </p>
            <a className="btn btn--primario btn--lg orc__enviar" href={o.urlEnvio} target="_blank" rel="noopener" onClick={o.enviar}>
              <Icone nome="whatsapp" tamanho={22} />
              <span className="btn__texto">{textos.orcamento.enviar}</span>
            </a>
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
          </footer>
        )}
      </div>
    </div>
  );
}
