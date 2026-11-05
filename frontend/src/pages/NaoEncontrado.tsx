import { textos } from '../content/site';
import { Button } from '../components/Button';
import { LinhasVelocidade } from '../components/fundos/LinhasVelocidade';

export function NaoEncontrado() {
  const t = textos.naoEncontrado;
  return (
    <section className="sec sec--navy pagina-404" aria-labelledby="h404">
      <LinhasVelocidade densidade={0.7} velocidade={0.5} />
      <div className="contido">
        <p className="pagina-404__codigo" aria-hidden="true">
          404
        </p>
        <h1 id="h404">{t.titulo}</h1>
        <p>{t.texto}</p>
        <div className="pagina-404__acoes">
          <Button href="/" variante="vidro">
            {t.inicio}
          </Button>
          <Button href="/catalogo" iconeFim="seta">
            {t.catalogo}
          </Button>
        </div>
      </div>
    </section>
  );
}
