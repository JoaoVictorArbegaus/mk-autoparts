/*
 * "Compartilhar com meu link" (M3): só aparece com o vendedor logado em /vendedor (sessão desta aba).
 * Gera a página atual (produto, catálogo com busca e filtros) com o ?v= dele; quem abrir fica preso
 * ao vendedor (DEC-017). No celular abre o compartilhamento do aparelho; no computador, copia.
 * O cliente comum nunca vê o botão. Lido depois da montagem (o HTML pré-renderizado não tem sessão).
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from '../router';
import { vendedorDaSessao } from '../vendedor/armazem';
import { caminhoComVendedor, compartilharLink } from '../vendedor/compartilhar';
import { textos } from '../content/site';
import type { Vendedor } from '../content/vendedores';
import { Icone } from './Icons';

export function CompartilharVendedor({ texto, className }: { texto: string; className?: string }) {
  const t = textos.compartilhar;
  const { caminho, busca } = useRouter();
  const [vendedor, setVendedor] = useState<Vendedor | undefined>();
  const [aviso, setAviso] = useState('');
  const timer = useRef(0);
  useEffect(() => setVendedor(vendedorDaSessao()), []);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!vendedor) return null;

  const enviar = async () => {
    const url = `${window.location.origin}${caminhoComVendedor(caminho, busca, vendedor.codigo)}`;
    const r = await compartilharLink(url, texto);
    const msg = r === 'copiado' ? t.copiado : r === 'falhou' ? t.falhou : '';
    setAviso(msg);
    clearTimeout(timer.current);
    if (msg) timer.current = window.setTimeout(() => setAviso(''), 3200);
  };

  return (
    <div className={`compartilhar${className ? ` ${className}` : ''}`}>
      <button type="button" className="btn btn--contorno btn--sm compartilhar__btn" onClick={enviar} title={t.dica(vendedor.nome)}>
        <Icone nome="link" tamanho={18} />
        <span className="btn__texto">{t.botao}</span>
      </button>
      <span className="compartilhar__aviso" role="status" aria-live="polite">
        {aviso}
      </span>
    </div>
  );
}
