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

let modelo = await readFile(join(root, 'dist/index.html'), 'utf8');
if (!modelo.includes('<!--app-html-->') || !modelo.includes('<!--app-head-->')) throw new Error('Marcadores <!--app-html--> ou <!--app-head--> não encontrados em dist/index.html');

// CSS embutido no HTML (Lighthouse, RNF-05): o <link> do CSS bloqueava a primeira pintura. Com ~15 KB
// comprimidos, vale mais chegar junto com o HTML do que numa segunda requisição.
const linkCss = modelo.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (linkCss) {
  const css = await readFile(join(root, 'dist', linkCss[1]), 'utf8');
  modelo = modelo.replace(linkCss[0], () => `<style>${css}</style>`);
}

const chave = chaveRota;

async function pagina(caminho) {
  const corpo = await render(caminho);
  // Substituição por função: o HTML tem "R$" e não pode ser lido como padrão de substituição.
  let html = modelo
    .replace('<!--app-head-->', () => headHtml(caminho))
    .replace('<div id="root"><!--app-html--></div>', () => `<div id="root" data-rota="${chave(caminho)}">${corpo}</div>`);
  // A arte do hero só é pré-carregada na landing.
  if (caminho !== '/') html = html.replace(/\s*<link rel="preload" as="image"[^>]*>/g, '');
  // No catálogo, o maior elemento é o topo com a foto do caminhão em CSS (paginas.css .cat-topo):
  // pré-carregada para o navegador não descobrir a imagem só depois do CSS.
  if (caminho === '/catalogo')
    html = html.replace(
      '</head>',
      () =>
        '<link rel="preload" as="image" media="(max-width: 959px)" href="/img/hero/caminhao-800.jpg" fetchpriority="high" />' +
        '<link rel="preload" as="image" media="(min-width: 960px)" href="/img/hero/caminhao-1280.jpg" fetchpriority="high" />\n  </head>',
    );
  return html;
}

let n = 0;
for (const caminho of rotas()) {
  const destino = caminho === '/' ? join(root, 'dist/index.html') : join(root, 'dist', caminho.slice(1), 'index.html');
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, await pagina(caminho));
  n++;
}
await writeFile(join(root, 'dist/404.html'), await pagina('/404'));
await rm(join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`Pré-renderizado: ${n} rotas + 404.html`);
