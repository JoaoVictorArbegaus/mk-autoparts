// Gera o HTML estático de cada rota a partir do bundle de SSR (dist-ssr) e remove o bundle.
// Rotas: /, /catalogo, /painel, /admin/* (DEC-015), /produto/<slug> de cada produto ativo e 404.html (DEC-003).
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { render, headHtml, rotas, validarDados, chaveRota } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);

// Validação dos dados (sdd_kit/03-domain-model.md): o build falha com qualquer erro.
const erros = validarDados(caminho => existsSync(join(root, 'public', caminho)));
if (erros.length) {
  console.error('Dados inválidos:\n- ' + erros.join('\n- '));
  process.exit(1);
}

const modelo = await readFile(join(root, 'dist/index.html'), 'utf8');
if (!modelo.includes('<!--app-html-->') || !modelo.includes('<!--app-head-->')) throw new Error('Marcadores <!--app-html--> ou <!--app-head--> não encontrados em dist/index.html');

const chave = chaveRota;

function pagina(caminho) {
  let html = modelo
    .replace('<!--app-head-->', headHtml(caminho))
    .replace('<div id="root"><!--app-html--></div>', `<div id="root" data-rota="${chave(caminho)}">${render(caminho)}</div>`);
  // A arte do hero só é pré-carregada na landing.
  if (caminho !== '/') html = html.replace(/\s*<link rel="preload" as="image"[^>]*>/, '');
  return html;
}

let n = 0;
for (const caminho of rotas()) {
  const destino = caminho === '/' ? join(root, 'dist/index.html') : join(root, 'dist', caminho.slice(1), 'index.html');
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, pagina(caminho));
  n++;
}
await writeFile(join(root, 'dist/404.html'), pagina('/404'));
await rm(join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`Pré-renderizado: ${n} rotas + 404.html`);
