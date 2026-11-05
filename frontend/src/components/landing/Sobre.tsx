/*
 * Sobre e envio (claro, curvas de nível ao fundo), Clientes (marinho, placeholder) e Loja e contato
 * (claro, aurora suave, mapa do Google embutido). Só fatos confirmados no briefing; o resto é [PLACEHOLDER].
 */
import type { ReactNode } from 'react';
import { listarCategorias, listarMontadoras, listarProdutos } from '../../content/catalogo';
import { empresa, mensagens, textos, whatsapp } from '../../content/site';
import { destinoWhatsApp, useOrcamento } from '../../orcamento/OrcamentoContext';
import { registrar } from '../../rastreio/eventos';
import { Topo } from '../fundos/Topo';
import { Aurora } from '../fundos/Aurora';
import { LinhasVelocidade } from '../fundos/LinhasVelocidade';
import { SplitTitle } from '../SplitTitle';
import { Reveal } from '../Motion';
import { CountUp } from '../CountUp';
import { Emenda } from '../Emenda';
import { Icone, type NomeIcone } from '../Icons';
import { Button } from '../Button';

export function Sobre() {
  const t = textos.sobre;
  const numeros: Record<string, number> = {
    produtos: listarProdutos().length,
    montadoras: listarMontadoras().length,
    categorias: listarCategorias().length,
  };
  return (
    <section id="sobre" className="sec sec--paper sobre" aria-labelledby="sobre-titulo">
      <Topo className="sobre__topo" speed={0.8} />
      <div className="contido sobre__grade">
        <div className="sobre__texto">
          <SplitTitle id="sobre-titulo" lead={t.titulo} className="titulo-sec" />
          <Reveal as="p" i={1} className="sobre__lead">
            {t.texto}
          </Reveal>
          {/* PLACEHOLDER: texto "Sobre nós" definitivo */}
          <Reveal as="p" i={2} className="placeholder">
            {t.textoPendente}
          </Reveal>
          <ul className="vantagens">
            {t.vantagens.map((v, i) => (
              <Reveal as="li" i={3 + i} key={v.titulo}>
                <span className="vantagens__icone">
                  <Icone nome={v.icone as NomeIcone} tamanho={24} />
                </span>
                <span>
                  <strong>{v.titulo}</strong>
                  <span>{v.texto}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
        <div className="sobre__fotos">
          {t.fotos.map((f, i) => (
            <Reveal as="figure" i={i + 1} key={f.src} className={`foto foto--${i ? 'b' : 'a'}`}>
              <img src={f.src420} srcSet={`${f.src420} 420w, ${f.src} ${f.largura}w`} sizes="(min-width: 1024px) 620px, 50vw" width={420} height={525} alt={f.alt} loading="lazy" decoding="async" />
              <figcaption>{f.legenda}</figcaption>
            </Reveal>
          ))}
          <Reveal as="dl" i={3} className="numeros">
            {t.numeros.map(n => (
              <div key={n.chave}>
                <dt>{n.rotulo}</dt>
                <dd>
                  <CountUp to={numeros[n.chave]} />
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
      <div className="contido">
        <h3 className="passos__titulo">{t.comoComprarTitulo}</h3>
        <ol className="passos">
          {t.passos.map((p, i) => (
            <Reveal as="li" i={i} key={p.titulo}>
              <strong>{p.titulo}</strong>
              <span>{p.texto}</span>
            </Reveal>
          ))}
        </ol>
      </div>
      <Emenda para="navy" />
    </section>
  );
}

export function Clientes() {
  const t = textos.clientes;
  return (
    <section className="sec sec--navy clientes" aria-labelledby="clientes-titulo">
      <LinhasVelocidade densidade={0.5} velocidade={0.6} className="clientes__linhas" />
      <div className="contido clientes__grade">
        <SplitTitle id="clientes-titulo" lead={t.titulo} className="titulo-sec" />
        {/* PLACEHOLDER: clientes atendidos (PEND-008) */}
        <Reveal as="p" i={1} className="placeholder placeholder--escuro">
          {t.texto}
        </Reveal>
        <Reveal i={2}>
          <Button href={empresa.instagram} externo variante="vidro" icone="instagram">
            {t.instagram}
          </Button>
        </Reveal>
      </div>
      <Emenda para="paper" />
    </section>
  );
}

export function Loja() {
  const t = textos.loja;
  const e = empresa.endereco;
  const { vendedor } = useOrcamento();
  const msg = vendedor ? mensagens.contato.replace('MK Autoparts', vendedor.nome) : mensagens.contato;
  const linha = (icone: NomeIcone, titulo: string, conteudo: ReactNode) => (
    <div className="loja__bloco">
      <span className="loja__icone">
        <Icone nome={icone} tamanho={22} />
      </span>
      <div>
        <h3>{titulo}</h3>
        {conteudo}
      </div>
    </div>
  );
  return (
    <section id="loja" className="sec sec--paper loja" aria-labelledby="loja-titulo">
      <Aurora colors={['#D9DEE5', '#3D7EFF', '#1C4FD0']} height={0.3} opacity={0.35} className="loja__aurora" />
      <div className="contido loja__grade">
        <div className="loja__info">
          <SplitTitle id="loja-titulo" lead={t.titulo} className="titulo-sec" />
          <Reveal i={1}>
            {linha(
              'local',
              t.enderecoTitulo,
              <p>
                {e.rua} – {e.bairro}
                <br />
                {e.cidade} – {e.uf}
              </p>,
            )}
          </Reveal>
          <Reveal i={2}>
            {linha(
              'relogio',
              t.horarioTitulo,
              <dl className="horario">
                {empresa.horario.map(h => (
                  <div key={h.dias}>
                    <dt>{h.dias}</dt>
                    <dd>{h.horas}</dd>
                  </div>
                ))}
              </dl>,
            )}
          </Reveal>
          <Reveal i={3} className="loja__botoes">
            <Button href={whatsapp(destinoWhatsApp(vendedor), msg)} externo icone="whatsapp" onClick={() => registrar('whatsapp_clicado', { dados: { origem: 'loja' } })}>
              {`${t.whatsapp} ${empresa.whatsappRotulo}`}
            </Button>
            <Button href={`tel:${empresa.telefone}`} variante="contorno" icone="telefone">
              {`${t.ligar} ${empresa.telefoneRotulo}`}
            </Button>
            <Button href={e.mapa} externo variante="contorno" icone="mapa">
              {t.comoChegar}
            </Button>
            <Button href={empresa.instagram} externo variante="texto" icone="instagram">
              {empresa.instagramRotulo}
            </Button>
          </Reveal>
        </div>
        <Reveal as="figure" i={2} className="foto loja__fachada">
          <img src="/img/loja/fachada-440.webp" srcSet="/img/loja/fachada-440.webp 440w, /img/loja/fachada.webp 836w" sizes="(min-width: 1024px) 380px, 90vw" width={440} height={440} alt={t.fachadaAlt} loading="lazy" decoding="async" />
          <figcaption>{`${e.rua}, ${e.cidade} – ${e.uf}`}</figcaption>
        </Reveal>
        {/* Mapa embutido como na KiProdutos: iframe do Google Maps com carregamento preguiçoso. */}
        <Reveal i={3} className="loja__mapa">
          <iframe
            title={t.mapaTitulo}
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${e.geo.lat},${e.geo.lng}!6i17!3m1!1spt-BR!5m1!1spt-BR`}
            width={1280}
            height={400}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </Reveal>
      </div>
      <Emenda para="navy-3" />
    </section>
  );
}
