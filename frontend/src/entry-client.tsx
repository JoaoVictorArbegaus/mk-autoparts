import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { limparCaminho, resolverRota } from './router';

const root = document.getElementById('root')!;
const caminho = limparCaminho(location.pathname);
const app = (
  <StrictMode>
    <App caminho={caminho} />
  </StrictMode>
);

// No build cada rota chega pré-renderizada e é hidratada. No `npm run dev` o root só tem o comentário
// <!--app-html-->, e um endereço sem página própria (servido pelo 404.html ou por fallback) pode trazer o HTML
// de outra rota: nesses casos o React monta do zero, sem erro de hidratação.
const chave = (c: string) => {
  const r = resolverRota(c);
  return r.nome === 'produto' ? `produto:${r.slug}` : r.nome === 'admin' ? `admin:${r.tela}` : r.nome;
};
if (root.firstElementChild && root.dataset.rota === chave(caminho)) hydrateRoot(root, app);
else {
  root.textContent = '';
  createRoot(root).render(app);
}
