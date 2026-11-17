/*
 * Aviso de fora do horário comercial (DEC-023, RN-15, RF-36). Só depois da montagem (o HTML
 * pré-renderizado não sabe a hora de quem abre) e conferido a cada minuto. Não bloqueia nada:
 * o pedido segue o fluxo normal.
 */
import { useEffect, useState } from 'react';
import { textos } from '../content/site';
import { foraDoHorario } from '../orcamento/horario';
import { Icone } from './Icons';

export function useForaDoHorario() {
  const [fora, setFora] = useState(false);
  useEffect(() => {
    const conferir = () => setFora(foraDoHorario());
    conferir();
    const id = window.setInterval(conferir, 60_000);
    return () => clearInterval(id);
  }, []);
  return fora;
}

export function AvisoHorario({ className = '' }: { className?: string }) {
  const fora = useForaDoHorario();
  if (!fora) return null;
  return (
    <p className={`aviso-horario ${className}`.trim()} role="note">
      <Icone nome="relogio" tamanho={16} />
      <span>{textos.orcamento.foraDoHorario}</span>
    </p>
  );
}
