import { useState, type FormEvent } from 'react';
import { useRouter } from '../router';
import { Icone } from './Icons';
import { useTextoCurto } from '../hooks/useTextoCurto';

/** Campo de busca que leva a /catalogo?q= (sem JS, o formulário envia normalmente). */
export function FormBusca({ id, rotulo, placeholder, placeholderCurto, botao, grande = false }: { id: string; rotulo: string; placeholder: string; placeholderCurto?: string; botao: string; grande?: boolean }) {
  const { navegar } = useRouter();
  const dica = useTextoCurto(placeholder, placeholderCurto);
  const [q, setQ] = useState('');
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const termo = q.trim();
    navegar(termo ? `/catalogo?q=${encodeURIComponent(termo)}` : '/catalogo');
  };
  return (
    <form className={`busca${grande ? ' busca--grande' : ''}`} action="/catalogo" method="get" role="search" onSubmit={enviar}>
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <Icone nome="busca" tamanho={22} className="busca__lupa" />
      <input id={id} name="q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={dica} autoComplete="off" enterKeyHint="search" />
      <button type="submit" className="busca__ir">
        <span>{botao}</span>
        <Icone nome="seta" tamanho={20} />
      </button>
    </form>
  );
}
