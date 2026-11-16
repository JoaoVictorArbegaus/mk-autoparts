import { useEffect, useState } from 'react';
import { destinoWhatsApp, useOrcamento } from '../orcamento/OrcamentoContext';
import { useRouter } from '../router';
import { mensagens, textos, whatsapp } from '../content/site';
import { registrar } from '../rastreio/eventos';
import { Icone } from './Icons';

/**
 * Botão flutuante (RF-19), canto inferior direito, some com a lista aberta. Com itens na lista vira
 * "Lista (n) · Enviar" e abre a lista: a conversão que interessa é a lista com códigos e vendedor,
 * não uma conversa genérica (revisão impeccable). Sem itens, abre o WhatsApp e fica escondido enquanto
 * o hero da landing está na tela, porque o hero já tem o botão "Falar no WhatsApp".
 */
export function WhatsAppFlutuante() {
  const { vendedor, aberta, abrir, totais, carregada } = useOrcamento();
  const itens = carregada ? totais.itens : 0;
  const { caminho } = useRouter();
  // Começa escondido (o HTML pré-renderizado da landing abre no hero); o observador corrige em seguida.
  const [heroVisivel, setHeroVisivel] = useState(true);
  useEffect(() => {
    const hero = document.querySelector('.hero');
    if (!hero || !('IntersectionObserver' in window)) {
      setHeroVisivel(false);
      return;
    }
    const obs = new IntersectionObserver(([e]) => setHeroVisivel(e.isIntersecting), { rootMargin: '0px 0px -35% 0px' });
    obs.observe(hero);
    return () => obs.disconnect();
  }, [caminho]);
  if (itens > 0) {
    return (
      <button type="button" className={`whats-flutuante whats-flutuante--lista${aberta ? ' escondido' : ''}`} onClick={abrir} aria-label={textos.flutuante.abrirLista(itens)}>
        <Icone nome="lista" tamanho={22} />
        <span>{textos.flutuante.lista(itens)}</span>
        <Icone nome="seta" tamanho={18} />
      </button>
    );
  }
  const mensagem = vendedor ? mensagens.contato.replace('MK Autoparts', vendedor.nome) : mensagens.contato;
  return (
    <a
      className={`whats-flutuante${aberta || heroVisivel ? ' escondido' : ''}`}
      aria-hidden={heroVisivel || undefined}
      tabIndex={heroVisivel ? -1 : undefined}
      href={whatsapp(destinoWhatsApp(vendedor), mensagem)}
      target="_blank"
      rel="noopener"
      aria-label={textos.whatsappFlutuante}
      onClick={() => registrar('whatsapp_clicado', { dados: { origem: 'flutuante' } })}
    >
      <Icone nome="whatsapp" tamanho={28} />
    </a>
  );
}
