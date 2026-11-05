import { Link } from '../router';
import { empresa, mensagens, nav, textos, whatsapp } from '../content/site';
import { destinoWhatsApp, useOrcamento } from '../orcamento/OrcamentoContext';
import { Icone } from './Icons';

export function Rodape() {
  const e = empresa.endereco;
  const { vendedor } = useOrcamento();
  const msg = vendedor ? mensagens.contato.replace('MK Autoparts', vendedor.nome) : mensagens.contato;
  return (
    <footer className="rodape">
      <div className="contido rodape__grade">
        <div className="rodape__marca">
          <img src="/img/marca/selo-160.webp" srcSet="/img/marca/selo-160.webp 1x, /img/marca/selo-320.webp 2x" width={80} height={80} alt={textos.rodape.seloAlt} loading="lazy" />
          <p>{empresa.lema}</p>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="rodape__titulo">{textos.rodape.navegar}</h2>
          <ul>
            {nav.map(i => (
              <li key={i.href}>
                <Link href={i.href}>{i.rotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="rodape__titulo">{textos.rodape.contato}</h2>
          <ul className="rodape__contatos">
            <li>
              <Icone nome="whatsapp" tamanho={18} />
              <a href={whatsapp(destinoWhatsApp(vendedor), msg)} target="_blank" rel="noopener">{empresa.whatsappRotulo}</a>
            </li>
            <li>
              <Icone nome="telefone" tamanho={18} />
              <a href={`tel:${empresa.telefone}`}>{empresa.telefoneRotulo}</a>
            </li>
            <li>
              <Icone nome="instagram" tamanho={18} />
              <a href={empresa.instagram} target="_blank" rel="noopener">{empresa.instagramRotulo}</a>
            </li>
            <li>
              <Icone nome="local" tamanho={18} />
              <span>{`${e.rua} – ${e.bairro}, ${e.cidade} – ${e.uf}`}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="contido rodape__base">
        <p>{`${textos.rodape.direitos} · ${empresa.nome} desde ${empresa.desde}`}</p>
      </div>
    </footer>
  );
}
