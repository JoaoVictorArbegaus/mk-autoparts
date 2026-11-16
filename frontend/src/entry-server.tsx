import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { App } from './App';
import { headHtml } from './seo';
import { listarProdutos } from './content/catalogo';
import { validarDados } from './content/validar';
import { caminhosAdmin, resolverRota } from './router';

/**
 * Usado só no build (scripts/prerender.mjs) para gerar o HTML estático de cada rota. `prerender`
 * espera as rotas carregadas sob demanda (lazy) e devolve o HTML completo, sem fallback.
 */
export async function render(caminho: string) {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App caminho={caminho} />
    </StrictMode>,
  );
  let html = '';
  for await (const parte of prelude) html += parte;
  return html;
}

export const rotas = () => ['/', '/catalogo', '/painel', ...caminhosAdmin, ...listarProdutos().map(p => `/produto/${p.slug}`)];

/** Chave da rota no atributo data-rota (a mesma conta do entry-client, para decidir hidratar). */
export function chaveRota(caminho: string) {
  const r = resolverRota(caminho);
  return r.nome === 'produto' ? `produto:${r.slug}` : r.nome === 'admin' ? `admin:${r.tela}` : r.nome;
}

export { headHtml, validarDados };
