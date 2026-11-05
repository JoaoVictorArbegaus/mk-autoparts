/*
 * Cabecalho fixo marinho (igual em todas as rotas, costura landing e catálogo). Na landing começa
 * transparente sobre o hero e vira vidro escuro ao rolar. Logo horizontal (40 px) no desktop e
 * monograma (32 px) no celular; ícone da lista com contador; aviso do vendedor.
 * Menu do celular no estilo CardNav (React Bits, via Prime Padel): o painel cresce com mola a partir da
 * barra e os cartões entram um depois do outro; o ícone de duas linhas vira X.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '../router';
import { destinoWhatsApp, useOrcamento } from '../orcamento/OrcamentoContext';
import { empresa, mensagens, nav, textos, whatsapp } from '../content/site';
import { Icone } from './Icons';
import { Button } from './Button';
import { registrar } from '../rastreio/eventos';
import { useMolaMenu } from '../hooks/useMolaMenu';

export function Cabecalho({ rota }: { rota: string }) {
  const { totais, abrir, pulso, vendedor, carregada } = useOrcamento();
  const { caminho, busca } = useRouter();
  const [rolou, setRolou] = useState(false);
  const [menu, setMenu] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const raiz = useRef<HTMLElement>(null);
  const mola = useMolaMenu(menu, () => setVisivel(false));
  const botaoMenu = useRef<HTMLButtonElement>(null);
  const contador = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  useEffect(() => setMenu(false), [caminho, busca]);

  useEffect(() => {
    if (!menu) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        botaoMenu.current?.focus();
      }
    };
    // Toque fora do cabeçalho fecha o menu.
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('keydown', esc);
    document.addEventListener('pointerdown', fora);
    return () => {
      document.removeEventListener('keydown', esc);
      document.removeEventListener('pointerdown', fora);
    };
  }, [menu]);

  const alternarMenu = () => {
    if (!menu) setVisivel(true);
    setMenu(m => !m);
  };

  // Pulso do contador ao adicionar (reinicia a animação CSS).
  useEffect(() => {
    const el = contador.current;
    if (!pulso || !el) return;
    el.classList.remove('pulsa');
    void el.offsetWidth;
    el.classList.add('pulsa');
  }, [pulso]);

  const ativo = (href: string) => (href === '/catalogo' ? caminho === '/catalogo' && !busca.includes('promocao=1') : href.startsWith('/catalogo?promocao') ? caminho === '/catalogo' && busca.includes('promocao=1') : false);
  const urlWhats = whatsapp(destinoWhatsApp(vendedor), vendedor ? mensagens.contato.replace('MK Autoparts', vendedor.nome) : mensagens.contato);

  return (
    <header ref={raiz} className={`topo${rota === 'landing' ? ' topo--landing' : ''}${rolou ? ' topo--rolou' : ''}${menu || visivel ? ' topo--menu' : ''}`} data-menu={menu ? 'aberto' : undefined}>
      <div className="topo__barra contido">
        <Link href="/" className="topo__logo" aria-label="MK Autoparts, página inicial">
          <img className="topo__logo-h" src="/img/marca/horizontal-escuro.svg" alt="" width={194} height={40} />
          <img className="topo__logo-m" src="/img/marca/monograma-escuro.svg" alt="" width={76} height={32} />
        </Link>
        <nav className="topo__nav" aria-label="Principal">
          <ul>
            {nav.map(item => (
              <li key={item.href}>
                <Link href={item.href} aria-current={ativo(item.href) ? 'page' : undefined}>
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="topo__acoes">
          {vendedor && (
            <p className="topo__vendedor" role="status">
              <span>{textos.atendimento}</span> {vendedor.nome}
            </p>
          )}
          {/* Sem WhatsApp no cabeçalho: o botão flutuante cobre o contato em todas as rotas públicas. */}
          <button type="button" className="topo__lista" onClick={abrir} aria-label={`${textos.abrirLista}${carregada && totais.itens ? `, ${totais.itens} ${totais.itens === 1 ? 'item' : 'itens'}` : ''}`}>
            <Icone nome="lista" tamanho={22} />
            <span className="topo__lista-rotulo">Orçamento</span>
            <span ref={contador} className={`topo__contador${carregada && totais.itens ? ' tem' : ''}`} aria-hidden="true">
              {carregada ? totais.itens : 0}
            </span>
          </button>
          <button ref={botaoMenu} type="button" className="topo__menu-btn" aria-expanded={menu} aria-controls="menu-movel" aria-label={menu ? textos.fecharMenu : textos.abrirMenu} onClick={alternarMenu}>
            <span className="topo__burger" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      <div ref={mola.painel} id="menu-movel" className={`menu-movel${visivel || menu ? ' menu-movel--visivel' : ''}`} aria-hidden={!menu} inert={!menu}>
        <div ref={mola.conteudo} className="menu-movel__conteudo">
          {textos.menu.cartoes.map((c, i) => (
            <nav
              key={c.titulo}
              ref={el => {
                mola.cartoes.current[i] = el;
              }}
              className="menu-cartao"
              aria-label={c.titulo}
            >
              <span className="menu-cartao__titulo">{c.titulo}</span>
              <p className="menu-cartao__texto">{c.texto}</p>
              <ul className="menu-cartao__links">
                {c.links.map(l => (
                  <li key={l.href}>
                    {l.externo ? (
                      <a href={l.href} target="_blank" rel="noopener" onClick={() => setMenu(false)}>
                        <span className="menu-cartao__seta" aria-hidden="true">
                          <Icone nome="setaDiag" tamanho={15} />
                          <Icone nome="setaDiag" tamanho={15} />
                        </span>
                        {l.rotulo}
                      </a>
                    ) : (
                      <Link href={l.href} onClick={() => setMenu(false)}>
                        <span className="menu-cartao__seta" aria-hidden="true">
                          <Icone nome="setaDiag" tamanho={15} />
                          <Icone nome="setaDiag" tamanho={15} />
                        </span>
                        {l.rotulo}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div
            ref={el => {
              mola.cartoes.current[textos.menu.cartoes.length] = el;
            }}
            className="menu-movel__contato"
          >
            <Button href={urlWhats} externo icone="whatsapp" onClick={() => registrar('whatsapp_clicado', { dados: { origem: 'menu' } })}>
              {textos.hero.falarWhatsapp}
            </Button>
            <Button href={`tel:${empresa.telefone}`} variante="contorno-claro" icone="telefone" className="menu-movel__ligar">
              {`${textos.loja.ligar} ${empresa.telefoneRotulo}`}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
