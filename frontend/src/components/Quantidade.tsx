import { useEffect, useState } from 'react';
import { QTD_MAX, QTD_MIN, limitarQuantidade } from '../orcamento/lista';
import { textos } from '../content/site';
import { Icone } from './Icons';

/** Seletor de quantidade 1–999: botões e campo numérico; valores fora do limite são corrigidos (AC-04). */
export function Quantidade({ valor, onChange, rotulo, pequeno = false }: { valor: number; onChange: (n: number) => void; rotulo: string; pequeno?: boolean }) {
  const [texto, setTexto] = useState(String(valor));
  useEffect(() => setTexto(String(valor)), [valor]);
  const confirmar = () => {
    const n = limitarQuantidade(Number(texto));
    setTexto(String(n));
    if (n !== valor) onChange(n);
  };
  return (
    <div className={`qtd${pequeno ? ' qtd--p' : ''}`} role="group" aria-label={rotulo}>
      <button type="button" onClick={() => onChange(limitarQuantidade(valor - 1))} disabled={valor <= QTD_MIN} aria-label={textos.produto.menos}>
        <Icone nome="menos" tamanho={18} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={QTD_MIN}
        max={QTD_MAX}
        value={texto}
        aria-label={textos.produto.quantidade}
        onChange={e => setTexto(e.target.value)}
        onBlur={confirmar}
        onKeyDown={e => e.key === 'Enter' && confirmar()}
      />
      <button type="button" onClick={() => onChange(limitarQuantidade(valor + 1))} disabled={valor >= QTD_MAX} aria-label={textos.produto.mais}>
        <Icone nome="mais" tamanho={18} />
      </button>
    </div>
  );
}
