/*
 * Hero da landing (acima da dobra: animações em CSS, para não atrasar o LCP).
 * Foto do caminhão na estrada ao fundo (caminhão à direita), véu marinho à esquerda para o texto,
 * linhas de velocidade a 12° discretas por cima, h1 palavra por palavra com "caminhões" em cromado
 * e busca grande que leva ao catálogo.
 */
import type { CSSProperties } from 'react';
import { mensagens, textos, whatsapp } from '../../content/site';
import { destinoWhatsApp, useOrcamento } from '../../orcamento/OrcamentoContext';
import { registrar } from '../../rastreio/eventos';
import { LinhasVelocidade } from '../fundos/LinhasVelocidade';
import { Button } from '../Button';
import { Emenda } from '../Emenda';
import { FormBusca } from '../FormBusca';

export function Hero() {
  const { vendedor } = useOrcamento();
  const t = textos.hero;
  const msg = vendedor ? mensagens.contato.replace('MK Autoparts', vendedor.nome) : mensagens.contato;
  const palavras = [...t.titulo, t.tituloCromado];

  return (
    <section className="sec sec--navy hero" aria-labelledby="hero-titulo">
      <div className="hero__foto" aria-hidden="true">
        <img
          src="/img/hero/caminhao-1280.jpg"
          srcSet="/img/hero/caminhao-800.jpg 800w, /img/hero/caminhao-1280.jpg 1280w, /img/hero/caminhao-1672.jpg 1672w"
          sizes="100vw"
          width={1672}
          height={941}
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </div>
      <LinhasVelocidade className="hero__linhas" densidade={0.7} />
      <div className="contido hero__grade">
        <div className="hero__texto">
          <h1 id="hero-titulo" className="hero__titulo">
            {palavras.map((p, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span className="hero__mascara">
                  <span className={`hero__palavra${i === palavras.length - 1 ? ' cromado' : ''}`} style={{ '--i': i } as CSSProperties}>
                    {p}
                  </span>
                </span>
              </span>
            ))}
          </h1>
          <p className="hero__apoio">{t.apoio}</p>
          <FormBusca id="busca-hero" rotulo={t.buscaRotulo} placeholder={t.buscaPlaceholder} placeholderCurto={t.buscaPlaceholderCurto} botao={t.buscar} grande />
          <div className="hero__ctas">
            <Button href="/catalogo" tamanho="lg" iconeFim="seta">
              {t.verCatalogo}
            </Button>
            <Button href={whatsapp(destinoWhatsApp(vendedor), msg)} externo variante="vidro" tamanho="lg" icone="whatsapp" onClick={() => registrar('whatsapp_clicado', { dados: { origem: 'hero' } })}>
              {t.falarWhatsapp}
            </Button>
          </div>
        </div>
      </div>
      <Emenda para="navy-3" />
    </section>
  );
}
