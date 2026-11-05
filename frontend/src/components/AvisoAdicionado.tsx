import { useOrcamento } from '../orcamento/OrcamentoContext';
import { textos } from '../content/site';
import { Icone } from './Icons';

/** Feedback ao adicionar (RF-18): aviso curto, anunciado a leitores de tela, com atalho para a lista. */
export function AvisoAdicionado() {
  const { aviso, abrir, removidos, dispensarRemovidos, aberta } = useOrcamento();
  return (
    <div className="avisos" role="status" aria-live="polite">
      {aviso && !aberta && (
        <div className="aviso" key={aviso.id}>
          <Icone nome="check" tamanho={20} />
          <p>{textos.orcamento.adicionadoAviso(aviso.texto)}</p>
          <button type="button" onClick={abrir}>
            {textos.orcamento.verLista}
          </button>
        </div>
      )}
      {removidos > 0 && (
        <div className="aviso aviso--alerta">
          <Icone nome="alerta" tamanho={20} />
          <p>{textos.orcamento.removidos}</p>
          <button type="button" onClick={dispensarRemovidos} aria-label={textos.card.fechar}>
            <Icone nome="fechar" tamanho={18} />
          </button>
        </div>
      )}
    </div>
  );
}
