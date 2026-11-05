/*
 * Card de produto (contrato: placa branca 4:3 com a foto no tamanho natural; promoção em placa
 * marinho com faixa vermelha a 12° e preço amarelo). Peça com lados: o botão abre a escolha
 * LD | LE | Par no próprio card (RN-04). Preço só em promoção (RN-02).
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from '../router';
import { artePromocao, formatarPreco, imagemProduto, resumoAplicacao, rotuloCodigo, temLados, type Produto } from '../content/catalogo';
import { textos } from '../content/site';
import { useOrcamento } from '../orcamento/OrcamentoContext';
import type { Escolha } from '../orcamento/lista';
import { Icone } from './Icons';

export function FotoProduto({ produto, tamanhos = '(min-width: 1200px) 260px, (min-width: 640px) 30vw, 45vw', prioridade = false }: { produto: Produto; tamanhos?: string; prioridade?: boolean }) {
  const img = imagemProduto(produto);
  if (!img) {
    return (
      <span className="foto-vazia">
        <img src="/img/marca/monograma-claro.svg" alt="" width={96} height={41} />
        <span>{textos.card.semFoto}</span>
      </span>
    );
  }
  return <img src={img.src} width={img.largura} height={img.altura} alt={produto.nome} loading={prioridade ? 'eager' : 'lazy'} decoding="async" sizes={tamanhos} />;
}

export function CardProduto({ produto, nivel = 3 }: { produto: Produto; nivel?: 2 | 3 }) {
  const { adicionar } = useOrcamento();
  const [escolhendo, setEscolhendo] = useState(false);
  const [feito, setFeito] = useState(false);
  const timer = useRef(0);
  const primeiroLado = useRef<HTMLButtonElement>(null);
  const lados = temLados(produto);
  const promo = produto.promocao;
  const codigo = rotuloCodigo(produto);
  const Titulo = nivel === 2 ? 'h2' : 'h3';
  const arte = artePromocao(produto);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (escolhendo) primeiroLado.current?.focus();
  }, [escolhendo]);

  const confirmar = (escolha?: Escolha) => {
    if (!adicionar(produto.slug, 1, escolha)) return;
    setEscolhendo(false);
    setFeito(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFeito(false), 1800);
  };

  return (
    <article className={`card${promo ? ' card--promo' : ''}${arte ? ' card--arte' : ''}`}>
      <Link href={`/produto/${produto.slug}`} className="card__link">
        <div className="card__placa">
          <FotoProduto produto={produto} />
          {promo && <span className="card__faixa">{textos.card.promocao}</span>}
          {produto.exemplo && <span className="card__exemplo">{textos.card.exemplo}</span>}
        </div>
        <div className="card__corpo">
          <Titulo className="card__nome">{produto.nome}</Titulo>
          {codigo && (
            <span className="card__cod">
              <span className="sr-only">{textos.card.cod} </span>
              {codigo}
            </span>
          )}
          <span className="card__aplic">
            <span className="sr-only">{textos.card.aplicacao} </span>
            {resumoAplicacao(produto)}
          </span>
          {(lados || produto.marca) && (
            <span className="card__meta">
              {lados && <span className="chip-lado">{textos.card.lados}</span>}
              {produto.marca && <span className="card__marca">{produto.marca}</span>}
            </span>
          )}
          {promo && (
            <span className="card__preco">
              {promo.precoOriginal && <s>{formatarPreco(promo.precoOriginal)}</s>}
              <strong>{formatarPreco(promo.preco)}</strong>
              {lados && <small>{textos.produto.precoPorLado}</small>}
            </span>
          )}
        </div>
      </Link>
      <div className="card__acoes">
        {escolhendo ? (
          <div className="card__lados" role="group" aria-label={`${textos.card.escolhaLado}: ${produto.nome}`}>
            {(['LD', 'LE', 'Par'] as const)
              .filter(l => l !== 'Par' || (produto.variantes?.length ?? 0) > 1)
              .map((l, i) => (
                <button key={l} ref={i === 0 ? primeiroLado : undefined} type="button" className="card__lado" onClick={() => confirmar(l)} aria-label={textos.ladosLongos[l]}>
                  {textos.lados[l]}
                </button>
              ))}
            <button type="button" className="card__lado card__lado--fechar" onClick={() => setEscolhendo(false)} aria-label={textos.card.fechar}>
              <Icone nome="fechar" tamanho={18} />
            </button>
          </div>
        ) : (
          <button type="button" className={`card__add${feito ? ' feito' : ''}`} onClick={() => (lados ? setEscolhendo(true) : confirmar())} aria-label={feito ? `${textos.card.adicionado}: ${produto.nome}` : `${textos.card.adicionar}: ${produto.nome}`}>
            <Icone nome={feito ? 'check' : 'mais'} tamanho={18} />
            <span className="card__add-longo">{feito ? textos.card.adicionado : textos.card.adicionar}</span>
            <span className="card__add-curto">{feito ? textos.card.adicionado : textos.card.adicionarCurto}</span>
          </button>
        )}
      </div>
    </article>
  );
}
