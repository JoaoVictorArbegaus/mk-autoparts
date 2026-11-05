/*
 * Detalhe do produto (RF-13 a RF-15): códigos por lado, seletor LD | LE | Par (DEC-012), quantidade,
 * "Adicionar ao orçamento" e "Solicitar orçamento pelo WhatsApp". Preço só em promoção (RN-02).
 */
import { useEffect, useState } from 'react';
import { Link } from '../router';
import { artePromocao, codigosOriginais, formatarPreco, obterCategoria, obterProduto, relacionados, rotuloAplicacao, temLados, type Lado } from '../content/catalogo';
import { textos, whatsapp } from '../content/site';
import { destinoWhatsApp, useOrcamento } from '../orcamento/OrcamentoContext';
import { mensagemProduto, type Escolha } from '../orcamento/lista';
import { registrar } from '../rastreio/eventos';
import { CardProduto, FotoProduto } from '../components/CardProduto';
import { Quantidade } from '../components/Quantidade';
import { Button } from '../components/Button';
import { Icone } from '../components/Icons';

export function Produto({ slug }: { slug: string }) {
  const p = obterProduto(slug);
  const t = textos.produto;
  const { adicionar, vendedor } = useOrcamento();
  const [escolha, setEscolha] = useState<Escolha | undefined>();
  const [qtd, setQtd] = useState(1);
  const [feito, setFeito] = useState(false);

  // Abrir o detalhe = clique no produto (RN-08).
  useEffect(() => {
    if (p) registrar('produto_clicado', { produto: p.slug });
  }, [p]);

  useEffect(() => {
    if (!feito) return;
    const id = window.setTimeout(() => setFeito(false), 1800);
    return () => clearTimeout(id);
  }, [feito]);

  if (!p) {
    return (
      <section className="pagina-msg">
        <div className="contido">
          <h1>{t.naoEncontradoTitulo}</h1>
          <p>{t.naoEncontradoTexto}</p>
          <Button href="/catalogo" iconeFim="seta">
            {t.voltarCatalogo}
          </Button>
        </div>
      </section>
    );
  }

  const cat = obterCategoria(p.categoria);
  const lados = temLados(p);
  const originais = codigosOriginais(p);
  const arte = artePromocao(p);
  const opcoes: Escolha[] = lados ? [...(p.variantes!.map(v => v.lado) as Lado[]), ...(p.variantes!.length > 1 ? (['Par'] as const) : [])] : [];
  const ladoMsg = escolha && escolha !== 'Par' ? escolha : undefined;
  const add = () => {
    if (adicionar(p.slug, qtd, lados ? escolha : undefined)) setFeito(true);
  };

  return (
    <article className="produto">
      <div className="produto__faixa">
        <nav className="contido trilha" aria-label={t.trilha}>
          <ol>
            <li>
              <Link href="/catalogo">{t.catalogo}</Link>
            </li>
            {cat && (
              <li>
                <Link href={`/catalogo?categoria=${cat.slug}`}>{cat.nome}</Link>
              </li>
            )}
            <li aria-current="page">{p.nome}</li>
          </ol>
        </nav>
      </div>
      <div className="contido produto__grade">
        <div className={`produto__placa${p.promocao ? ' produto__placa--promo' : ''}`}>
          <FotoProduto produto={p} tamanhos="(min-width: 1024px) 360px, 90vw" prioridade />
          {p.promocao && <span className="card__faixa">{textos.card.promocao}</span>}
        </div>

        <div className="produto__info">
          {p.exemplo && <p className="card__exemplo">{textos.card.exemplo}</p>}
          <h1>{p.nome}</h1>
          <dl className="produto__dados">
            {lados ? (
              <div>
                <dt>{t.codigos}</dt>
                <dd>
                  {p.variantes!.map(v => (
                    <span key={v.lado} className="cod-lado">
                      <span className="chip-lado">{v.lado}</span>
                      {v.codigo ?? '—'}
                    </span>
                  ))}
                </dd>
              </div>
            ) : (
              p.codigo && (
                <div>
                  <dt>{t.codigo}</dt>
                  <dd className="tab">{p.codigo}</dd>
                </div>
              )
            )}
            {originais.length > 0 && (
              <div>
                <dt>{t.originais}</dt>
                <dd>
                  {lados
                    ? p.variantes!.filter(v => v.codigosOriginais?.length).map(v => (
                        <span key={v.lado} className="cod-lado">
                          <span className="chip-lado">{v.lado}</span>
                          {v.codigosOriginais!.join(', ')}
                        </span>
                      ))
                    : originais.join(', ')}
                </dd>
              </div>
            )}
            {p.marca && (
              <div>
                <dt>{t.marca}</dt>
                <dd>{p.marca}</dd>
              </div>
            )}
            {cat && (
              <div>
                <dt>{t.categoria}</dt>
                <dd>{cat.nome}</dd>
              </div>
            )}
          </dl>
          {p.descricao && <p className="produto__desc">{p.descricao}</p>}

          {p.promocao ? (
            <p className="produto__preco">
              <span>{t.precoPromocao}</span>
              {p.promocao.precoOriginal && <s>{formatarPreco(p.promocao.precoOriginal)}</s>}
              <strong>{formatarPreco(p.promocao.preco)}</strong>
              <small>{lados ? t.precoCadaLado : t.precoPorLado}</small>
            </p>
          ) : (
            <p className="produto__sem-preco">
              <Icone nome="whatsapp" tamanho={18} />
              {t.semPreco}
            </p>
          )}

          <div className="produto__compra">
            {lados && (
              <fieldset className="seletor-lado">
                <legend>{t.lado}</legend>
                <div className="seletor-lado__opcoes">
                  {opcoes.map(o => (
                    <label key={o} className={escolha === o ? 'ativo' : undefined}>
                      <input type="radio" name="lado" value={o} checked={escolha === o} onChange={() => setEscolha(o)} />
                      <span className="seletor-lado__curto">{textos.lados[o]}</span>
                      <span className="seletor-lado__longo">{textos.ladosLongos[o]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="produto__linha">
              <Quantidade valor={qtd} onChange={setQtd} rotulo={t.quantidade} />
              <button type="button" className={`btn btn--primario btn--lg produto__add${feito ? ' feito' : ''}`} onClick={add} disabled={lados && !escolha}>
                <Icone nome={feito ? 'check' : 'mais'} tamanho={22} />
                <span className="btn__texto">{feito ? textos.card.adicionado : lados && !escolha ? textos.card.escolhaLado : textos.card.adicionar}</span>
              </button>
            </div>
            <Button href={whatsapp(destinoWhatsApp(vendedor), mensagemProduto(p, vendedor?.nome, ladoMsg))} externo variante="contorno" icone="whatsapp" onClick={() => registrar('whatsapp_clicado', { produto: p.slug, dados: { origem: 'produto' } })}>
              {t.solicitar}
            </Button>
          </div>
        </div>

        <section className="produto__aplic" aria-labelledby="aplic-titulo">
          <h2 id="aplic-titulo">{t.aplicacoes}</h2>
          {p.aplicacoes.length ? (
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colMarca}</th>
                  <th scope="col">{t.colModelo}</th>
                  <th scope="col">{t.colAnos}</th>
                </tr>
              </thead>
              <tbody>
                {p.aplicacoes.map((a, i) => {
                  const r = rotuloAplicacao(a);
                  return (
                    <tr key={i}>
                      <td data-rotulo={t.colMarca}>{r.montadora}</td>
                      <td data-rotulo={t.colModelo}>{r.modelo}</td>
                      <td data-rotulo={t.colAnos}>{r.anos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>{t.aplicacoesVazio}</p>
          )}
          {arte && (
            <figure className="produto__arte">
              <img src={arte.src400} srcSet={`${arte.src400} 400w, ${arte.src} 760w`} sizes="(min-width: 768px) 300px, 80vw" width={400} height={600} alt={`Arte da promoção: ${p.nome} por ${formatarPreco(p.promocao!.preco)}`} loading="lazy" />
            </figure>
          )}
        </section>
      </div>

      {relacionados(p).length > 0 && (
        <section className="contido produto__rel" aria-labelledby="rel-titulo">
          <h2 id="rel-titulo">{t.relacionados}</h2>
          <ul className="grade grade--4">
            {relacionados(p).map(r => (
              <li key={r.slug}>
                <CardProduto produto={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
