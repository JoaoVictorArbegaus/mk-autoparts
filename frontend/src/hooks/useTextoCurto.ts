/*
 * Escolhe a versão curta de um texto em telas estreitas (ex.: placeholder da busca que não cabe).
 * O HTML pré-renderizado usa o texto longo; a troca acontece depois da montagem (sem erro de hidratação).
 */
import { useEffect, useState } from 'react';

export function useTextoCurto(longo: string, curto: string | undefined, largura = 420) {
  const [texto, setTexto] = useState(longo);
  useEffect(() => {
    if (!curto) return;
    const mq = window.matchMedia(`(max-width: ${largura}px)`);
    const aplicar = () => setTexto(mq.matches ? curto : longo);
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, [longo, curto, largura]);
  return texto;
}
